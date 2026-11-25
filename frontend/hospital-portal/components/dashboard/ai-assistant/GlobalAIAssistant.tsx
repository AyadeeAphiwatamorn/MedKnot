"use client";

import React, { useEffect, useRef } from "react";
import { AIAssistantProvider, useAIAssistant } from "./AIAssistantContext";
import { AIAssistantFloatingButton } from "./AIAssistantFloatingButton";
import { AIAssistantPanel } from "./AIAssistantPanel";

function AssistantOverlayInner() {
  const { isOpen, hasUnreadSuggestions, toggleAssistant, closeAssistant } = useAIAssistant();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeAssistant();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeAssistant();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeAssistant]);

  return (
    <div ref={containerRef}>
      {isOpen && <AIAssistantPanel />}
      <AIAssistantFloatingButton
        isOpen={isOpen}
        hasSuggestionIndicator={hasUnreadSuggestions}
        onClick={toggleAssistant}
      />
    </div>
  );
}

/**
 * Global floating MedKnot AI Assistant mounted once in app/dashboard/layout.tsx.
 * Remains available across all authenticated Dashboard routes without modifying page layouts.
 */
export function GlobalAIAssistant() {
  return (
    <AIAssistantProvider>
      <AssistantOverlayInner />
    </AIAssistantProvider>
  );
}
