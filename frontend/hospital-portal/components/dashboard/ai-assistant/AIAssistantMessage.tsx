"use client";

import React, { useState } from "react";
import type { AIMessage } from "@/lib/ai-assistant/types";

interface AIAssistantMessageProps {
  message: AIMessage;
}

function renderInlineFormatting(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={idx} className="font-semibold text-[#1F2B46]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code
          key={idx}
          className="px-1 py-0.5 rounded bg-white border border-[#C8D6C3] font-mono text-[11px] text-[#0055A4]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

function FormattedAssistantBody({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="space-y-1.5 text-[12.5px] leading-relaxed text-[#1F2B46]">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }
        if (trimmed.startsWith("- ")) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#0055A4] shrink-0" />
              <span className="min-w-0 break-words">
                {renderInlineFormatting(trimmed.slice(2))}
              </span>
            </div>
          );
        }
        return (
          <p key={idx} className="break-words">
            {renderInlineFormatting(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

export function AIAssistantMessage({ message }: AIAssistantMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API unavailable in restricted context
    }
  };

  if (isUser) {
    return (
      <div className="flex flex-col items-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-[#0055A4] text-white px-3.5 py-2.5 text-[12.5px] leading-relaxed shadow-xs whitespace-pre-wrap break-words">
          {message.content}
        </div>
        <span className="text-[10px] text-[#727783] mt-1 px-1">{message.timestamp}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start">
      <div
        className={`max-w-[92%] rounded-2xl rounded-bl-sm px-3.5 py-3 shadow-2xs border ${
          message.isRefusal
            ? "bg-[#FFF8EB] border-[#F0D9A7]"
            : "bg-[#E3EBDD] border-[#C8D6C3]"
        }`}
      >
        {/* Provenance / Safety Header */}
        {(message.hasClinicalDisclaimer || message.isDraftNotice || message.isRefusal) && (
          <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-[#C8D6C3]">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                message.isRefusal
                  ? "bg-[#FAE193] text-[#5E4300]"
                  : message.hasClinicalDisclaimer
                  ? "bg-[#DCE7F1] text-[#0055A4]"
                  : "bg-[#DFEEA9] text-[#2D3A08]"
              }`}
            >
              <span className="material-symbols-outlined text-xs">
                {message.isRefusal ? "gpp_maybe" : "verified_user"}
              </span>
              {message.isRefusal
                ? "Safety & Access Notice"
                : message.hasClinicalDisclaimer
                ? "Draft • Clinician Verification Required"
                : "Operational Draft"}
            </span>
          </div>
        )}

        <FormattedAssistantBody content={message.content} />

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-2 mt-2.5 pt-2 border-t border-[#C8D6C3]">
          <span className="text-[10px] text-[#5A6372]">
            {message.modeLabel || "MedKnot Assist"} • {message.timestamp}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#0055A4] hover:text-[#003b73] transition-colors cursor-pointer"
            title="Copy response"
          >
            <span className="material-symbols-outlined text-xs">
              {copied ? "check" : "content_copy"}
            </span>
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
