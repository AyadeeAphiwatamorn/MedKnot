"use client";

import React from "react";

interface AIAssistantSuggestionsProps {
  prompts: string[];
  label: string;
  disabled?: boolean;
  onSelect: (prompt: string) => void;
}

export function AIAssistantSuggestions({
  prompts,
  label,
  disabled,
  onSelect,
}: AIAssistantSuggestionsProps) {
  if (!prompts || prompts.length === 0) return null;

  return (
    <div className="space-y-1.5 pt-1">
      <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#5A6372] block px-0.5">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(prompt)}
            className="text-left px-2.5 py-1.5 rounded-xl bg-white border border-[#D5DFD2] hover:border-[#0055A4] hover:bg-[#DCE7F1]/50 text-[11.5px] font-medium text-[#1F2B46] hover:text-[#0055A4] transition-all shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
