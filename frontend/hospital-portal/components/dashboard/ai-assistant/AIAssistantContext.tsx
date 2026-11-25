"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { useFacility } from "@/components/dashboard/facility/FacilityContext";
import { AIAssistantService } from "@/lib/ai-assistant/ai-service";
import { loadAuthorizedPageData } from "@/lib/ai-assistant/context-loader";
import { resolvePageContext } from "@/lib/ai-assistant/page-contexts";
import type {
  AIMessage,
  LoadedAuthorizedContext,
  PageContext,
} from "@/lib/ai-assistant/types";

interface AIAssistantContextValue {
  isOpen: boolean;
  openAssistant: () => void;
  closeAssistant: () => void;
  minimizeAssistant: () => void;
  toggleAssistant: () => void;
  pageContext: PageContext;
  authorizedData: LoadedAuthorizedContext;
  messages: AIMessage[];
  isLoading: boolean;
  error: string | null;
  hasUnreadSuggestions: boolean;
  sendMessage: (text: string) => Promise<void>;
  startNewConversation: () => void;
  clearError: () => void;
}

const AIAssistantContext = createContext<AIAssistantContextValue | null>(null);

function createWelcomeMessage(pageContext: PageContext, data: LoadedAuthorizedContext): AIMessage {
  const content =
    !data.isAuthorized && data.unavailableReason
      ? `I'm connected to **${pageContext.pageName}**, however: ${data.unavailableReason}`
      : pageContext.welcomeMessage;

  return {
    id: `msg-welcome-${pageContext.pageId}`,
    role: "assistant",
    content,
    timestamp: new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    modeLabel: data.isAuthorized ? "Demo Assist Mode" : "Access Verification",
  };
}

export function AIAssistantProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/dashboard";
  const { activeFacility, activeCampus } = useFacility();

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnreadSuggestions, setHasUnreadSuggestions] = useState(true);

  const pageContext = useMemo(
    () => resolvePageContext(pathname, activeFacility.name, activeCampus.name),
    [pathname, activeFacility.name, activeCampus.name]
  );

  // SSR-safe fallback placeholder; actual service & Date() reads run inside useEffect on client mount
  const [authorizedData, setAuthorizedData] = useState<LoadedAuthorizedContext>(() => ({
    pageId: pageContext.pageId,
    route: pageContext.route,
    facilityId: activeFacility.id,
    facilityName: activeFacility.name,
    campusId: activeCampus.id,
    campusName: activeCampus.name,
    userName: "Staff",
    userRole: "Hospital Admin",
    isAuthorized: true,
  }));

  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: "msg-welcome-initial",
      role: "assistant",
      content: pageContext.welcomeMessage,
      timestamp: "Ready",
      modeLabel: "Demo Assist Mode",
    },
  ]);

  const scopeKey = `${activeCampus.id}::${pageContext.pageId}::${pageContext.entityId || "list"}`;
  const prevScopeRef = useRef<string>("");

  // Load authorized page data & refresh/purge context on mount, route change, or campus change
  useEffect(() => {
    const freshData = loadAuthorizedPageData(pageContext);
    setAuthorizedData(freshData);

    if (prevScopeRef.current !== scopeKey) {
      prevScopeRef.current = scopeKey;
      setIsLoading(false);
      setError(null);
      setMessages([createWelcomeMessage(pageContext, freshData)]);
      if (!isOpen) {
        setHasUnreadSuggestions(true);
      }
    }
  }, [scopeKey, pageContext, isOpen]);

  // Listen to explicit facility change events to invalidate cached clinical context immediately
  useEffect(() => {
    const handleFacilityChanged = () => {
      const freshData = loadAuthorizedPageData(pageContext);
      setAuthorizedData(freshData);
      setIsLoading(false);
      setError(null);
      setMessages([createWelcomeMessage(pageContext, freshData)]);
    };
    window.addEventListener("medknot:facility-changed", handleFacilityChanged);
    return () => window.removeEventListener("medknot:facility-changed", handleFacilityChanged);
  }, [pageContext]);

  const openAssistant = useCallback(() => {
    setIsOpen(true);
    setHasUnreadSuggestions(false);
  }, []);

  const closeAssistant = useCallback(() => {
    setIsOpen(false);
  }, []);

  const minimizeAssistant = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleAssistant = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) setHasUnreadSuggestions(false);
      return next;
    });
  }, []);

  const startNewConversation = useCallback(() => {
    const freshData = loadAuthorizedPageData(pageContext);
    setAuthorizedData(freshData);
    setIsLoading(false);
    setError(null);
    setMessages([createWelcomeMessage(pageContext, freshData)]);
  }, [pageContext]);

  const clearError = useCallback(() => setError(null), []);

  const sendMessage = useCallback(
    async (rawText: string) => {
      const trimmed = rawText.trim();
      if (!trimmed || isLoading) return;

      const userMsg: AIMessage = {
        id: `msg-user-${Date.now()}`,
        role: "user",
        content: trimmed,
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      const nextHistory = [...messages, userMsg];
      setMessages(nextHistory);
      setError(null);
      setIsLoading(true);

      try {
        const reply = await AIAssistantService.sendMessage(trimmed, pageContext, nextHistory);
        const assistantMsg: AIMessage = {
          id: `msg-assistant-${Date.now()}`,
          role: "assistant",
          content: reply.content,
          timestamp: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          hasClinicalDisclaimer: reply.hasClinicalDisclaimer,
          isDraftNotice: reply.isDraftNotice,
          isRefusal: reply.isRefusal,
          modeLabel: reply.modeLabel,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch {
        setError("Unable to process your request right now. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, pageContext]
  );

  const value = useMemo<AIAssistantContextValue>(
    () => ({
      isOpen,
      openAssistant,
      closeAssistant,
      minimizeAssistant,
      toggleAssistant,
      pageContext,
      authorizedData,
      messages,
      isLoading,
      error,
      hasUnreadSuggestions,
      sendMessage,
      startNewConversation,
      clearError,
    }),
    [
      isOpen,
      openAssistant,
      closeAssistant,
      minimizeAssistant,
      toggleAssistant,
      pageContext,
      authorizedData,
      messages,
      isLoading,
      error,
      hasUnreadSuggestions,
      sendMessage,
      startNewConversation,
      clearError,
    ]
  );

  return (
    <AIAssistantContext.Provider value={value}>
      {children}
    </AIAssistantContext.Provider>
  );
}

export function useAIAssistant(): AIAssistantContextValue {
  const ctx = useContext(AIAssistantContext);
  if (!ctx) {
    throw new Error("useAIAssistant must be used within an AIAssistantProvider");
  }
  return ctx;
}
