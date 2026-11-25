"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";

const SIDEBAR_STORAGE_KEY = "medknot_sidebar_collapsed";
const SIDEBAR_CHANGED_EVENT = "medknot:sidebar-changed";

export const SIDEBAR_EXPANDED_WIDTH = "296px";
export const SIDEBAR_COLLAPSED_WIDTH = "80px";

interface SidebarContextValue {
  isCollapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
  isMobileOpen: boolean;
  openMobile: () => void;
  closeMobile: () => void;
  toggleMobile: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

function applySidebarCssWidth(collapsed: boolean) {
  if (typeof document === "undefined") return;
  document.documentElement.style.setProperty(
    "--sidebar-width",
    collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH
  );
  document.documentElement.setAttribute(
    "data-sidebar-collapsed",
    collapsed ? "true" : "false"
  );
}

/**
 * Global Sidebar state provider mounted once inside app/dashboard/layout.tsx.
 * Persists only the boolean expanded/collapsed UI state in localStorage — never stores patient data.
 */
export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsedState] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  useIsomorphicLayoutEffect(() => {
    let initialCollapsed = false;
    try {
      const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (saved === "true") {
        initialCollapsed = true;
      } else if (saved === "false") {
        initialCollapsed = false;
      } else if (window.innerWidth >= 768 && window.innerWidth < 1024) {
        // Default compact on tablet viewports when user has not set a preference
        initialCollapsed = true;
      }
    } catch {
      initialCollapsed = false;
    }

    setIsCollapsedState(initialCollapsed);
    applySidebarCssWidth(initialCollapsed);

    const raf = window.requestAnimationFrame(() => {
      document.documentElement.setAttribute("data-sidebar-animate", "true");
    });

    return () => window.cancelAnimationFrame(raf);
  }, []);

  useIsomorphicLayoutEffect(() => {
    applySidebarCssWidth(isCollapsed);
  }, [isCollapsed]);

  useEffect(() => {
    const syncFromStorage = () => {
      try {
        const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
        if (saved === "true" || saved === "false") {
          setIsCollapsedState(saved === "true");
        }
      } catch {
        // ignore storage access issues
      }
    };
    window.addEventListener("storage", syncFromStorage);
    window.addEventListener(SIDEBAR_CHANGED_EVENT, syncFromStorage);
    return () => {
      window.removeEventListener("storage", syncFromStorage);
      window.removeEventListener(SIDEBAR_CHANGED_EVENT, syncFromStorage);
    };
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMobileOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOpen]);

  const setCollapsed = useCallback((next: boolean) => {
    setIsCollapsedState(next);
    applySidebarCssWidth(next);
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? "true" : "false");
    } catch {
      // ignore quota errors
    }
  }, []);

  const toggleCollapsed = useCallback(() => {
    setIsCollapsedState((prev) => {
      const next = !prev;
      applySidebarCssWidth(next);
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? "true" : "false");
      } catch {
        // ignore quota errors
      }
      return next;
    });
  }, []);

  const openMobile = useCallback(() => setIsMobileOpen(true), []);
  const closeMobile = useCallback(() => setIsMobileOpen(false), []);
  const toggleMobile = useCallback(() => setIsMobileOpen((prev) => !prev), []);

  const value = useMemo<SidebarContextValue>(
    () => ({
      isCollapsed,
      setCollapsed,
      toggleCollapsed,
      isMobileOpen,
      openMobile,
      closeMobile,
      toggleMobile,
    }),
    [isCollapsed, setCollapsed, toggleCollapsed, isMobileOpen, openMobile, closeMobile, toggleMobile]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

const FALLBACK_SIDEBAR: SidebarContextValue = {
  isCollapsed: false,
  setCollapsed: () => {},
  toggleCollapsed: () => {},
  isMobileOpen: false,
  openMobile: () => {},
  closeMobile: () => {},
  toggleMobile: () => {},
};

export function useSidebar(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  return ctx || FALLBACK_SIDEBAR;
}
