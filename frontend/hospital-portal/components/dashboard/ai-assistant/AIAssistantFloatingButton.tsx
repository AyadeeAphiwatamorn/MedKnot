"use client";

import React from "react";

interface AIAssistantFloatingButtonProps {
  isOpen: boolean;
  hasSuggestionIndicator: boolean;
  onClick: () => void;
}

export function AIAssistantFloatingButton({
  isOpen,
  hasSuggestionIndicator,
  onClick,
}: AIAssistantFloatingButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isOpen ? "Close MedKnot AI Assistant" : "Open MedKnot AI Assistant"}
      aria-expanded={isOpen}
      title="MedKnot AI Assistant"
      className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#0055A4] hover:bg-[#00478a] text-white flex items-center justify-center shadow-[0_8px_24px_rgba(0,85,164,0.35)] hover:shadow-[0_10px_28px_rgba(0,85,164,0.45)] transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ring-2 ring-white/80 ${
        isOpen ? "rotate-90 bg-[#1F2B46] hover:bg-[#162036]" : ""
      }`}
    >
      <span className="material-symbols-outlined text-2xl leading-none select-none">
        {isOpen ? "close" : "auto_awesome"}
      </span>

      {!isOpen && hasSuggestionIndicator && (
        <span
          className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-[#D4AF7A] ring-2 ring-white animate-pulse"
          aria-hidden="true"
        />
      )}
    </button>
  );
}
