"use client";

import React from "react";
import type { LoadedAuthorizedContext, PageContext } from "@/lib/ai-assistant/types";

interface AIAssistantHeaderProps {
  pageContext: PageContext;
  authorizedData: LoadedAuthorizedContext;
  onNewConversation: () => void;
  onMinimize: () => void;
  onClose: () => void;
}

export function AIAssistantHeader({
  pageContext,
  authorizedData,
  onNewConversation,
  onMinimize,
  onClose,
}: AIAssistantHeaderProps) {
  const contextLabel = pageContext.entityId
    ? `${pageContext.pageName} • ${pageContext.entityId}`
    : pageContext.pageName;

  return (
    <div className="bg-gradient-to-r from-[#1F2B46] to-[#0055A4] text-white px-4 py-3.5 shrink-0 border-b border-[#003B73]/40">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-xl text-white">
              auto_awesome
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold tracking-tight truncate">
                MedKnot AI Assistant
              </h2>
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/15 text-[10px] font-semibold text-[#D4EC9B] shrink-0"
                title="Mock / Demo Assist Mode Active"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#DCF4A2]" />
                Demo Mode
              </span>
            </div>
            <p className="text-[11px] text-white/80 truncate mt-0.5">
              {authorizedData.campusName} • {contextLabel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onNewConversation}
            title="New Conversation"
            aria-label="Start new conversation"
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg leading-none">
              refresh
            </span>
          </button>
          <button
            type="button"
            onClick={onMinimize}
            title="Minimize"
            aria-label="Minimize assistant panel"
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg leading-none">
              remove
            </span>
          </button>
          <button
            type="button"
            onClick={onClose}
            title="Close"
            aria-label="Close assistant panel"
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg leading-none">
              close
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
