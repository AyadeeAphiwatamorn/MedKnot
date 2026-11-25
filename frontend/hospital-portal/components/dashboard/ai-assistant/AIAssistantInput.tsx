"use client";

import React, { useRef, useState } from "react";

interface AIAssistantInputProps {
  isLoading: boolean;
  placeholder?: string;
  onSend: (text: string) => void;
}

export function AIAssistantInput({
  isLoading,
  placeholder = "Ask about this page, records, or drafts...",
  onSend,
}: AIAssistantInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 104)}px`;
  };

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-3 border-t border-[#DDE6DA] bg-[#F8FAF6] shrink-0">
      <div className="flex items-end gap-2 bg-white border border-[#D5DFD2] focus-within:border-[#0055A4] rounded-xl px-3 py-2 shadow-2xs transition-colors">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          disabled={isLoading}
          onChange={(e) => {
            setValue(e.target.value);
            adjustHeight();
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Message MedKnot AI Assistant"
          className="flex-1 resize-none bg-transparent text-[12.5px] text-[#1F2B46] placeholder:text-[#727783] focus:outline-none max-h-[104px] leading-snug disabled:opacity-60"
        />
        <button
          type="button"
          disabled={isLoading || !value.trim()}
          onClick={handleSubmit}
          aria-label="Send message"
          className="w-8 h-8 rounded-lg bg-[#0055A4] hover:bg-[#00478a] disabled:bg-[#C2C6D3] text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-base leading-none">
            send
          </span>
        </button>
      </div>
      <div className="flex items-center justify-between mt-1.5 px-1 text-[10px] text-[#727783]">
        <span>Enter to send • Shift+Enter for new line</span>
        <span>Not for independent diagnosis</span>
      </div>
    </div>
  );
}
