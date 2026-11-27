"use client";

import React, { useEffect, useRef } from "react";
import { useAIAssistant } from "./AIAssistantContext";
import { AIAssistantHeader } from "./AIAssistantHeader";
import { AIAssistantMessage } from "./AIAssistantMessage";
import { AIAssistantSuggestions } from "./AIAssistantSuggestions";
import { AIAssistantInput } from "./AIAssistantInput";

export function AIAssistantPanel() {
  const {
    pageContext,
    authorizedData,
    messages,
    isLoading,
    error,
    sendMessage,
    startNewConversation,
    minimizeAssistant,
    closeAssistant,
    clearError,
  } = useAIAssistant();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const hasUserMessages = messages.some((m) => m.role === "user");
  const activePrompts = hasUserMessages
    ? pageContext.followUpPrompts
    : pageContext.suggestedPrompts;
  const suggestionHeading = hasUserMessages
    ? "Suggested Follow-ups"
    : `Suggested for ${pageContext.pageName}`;

  return (
    <section
      aria-label="MedKnot AI Assistant Chat Panel"
      role="dialog"
      className="fixed inset-x-3 bottom-20 h-[72dvh] max-h-[calc(100dvh-6.5rem)] sm:inset-x-auto sm:right-6 sm:bottom-24 sm:w-[410px] sm:h-[590px] sm:max-h-[calc(100dvh-7.5rem)] z-50 bg-white rounded-2xl border border-[#C5D2C0] shadow-[0_18px_50px_rgba(31,43,70,0.22)] flex flex-col overflow-hidden"
    >
      <AIAssistantHeader
        pageContext={pageContext}
        authorizedData={authorizedData}
        onNewConversation={startNewConversation}
        onMinimize={minimizeAssistant}
        onClose={closeAssistant}
      />

      {/* Scrollable Chat Body */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3.5 space-y-3.5 bg-white">
        {messages.map((msg) => (
          <AIAssistantMessage key={msg.id} message={msg} />
        ))}

        {/* Contextual Suggestions */}
        {!isLoading && authorizedData.isAuthorized && (
          <AIAssistantSuggestions
            prompts={activePrompts}
            label={suggestionHeading}
            disabled={isLoading}
            onSelect={(prompt) => sendMessage(prompt)}
          />
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start">
            <div className="px-3.5 py-2.5 rounded-2xl rounded-bl-sm bg-[#E3EBDD] border border-[#C8D6C3] flex items-center gap-2 text-xs text-[#5A6372]">
              <div className="flex items-center gap-1" aria-label="Generating response">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0055A4] animate-bounce [animation-delay:-0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#0055A4] animate-bounce [animation-delay:-0.1s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#0055A4] animate-bounce" />
              </div>
              <span>Reviewing authorized page context...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-3 rounded-xl bg-[#FFDAD6]/60 border border-[#BA1A1A]/30 text-xs text-[#93000A] flex items-center justify-between gap-2">
            <span>{error}</span>
            <button
              type="button"
              onClick={clearError}
              className="text-[11px] font-semibold underline shrink-0 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <AIAssistantInput isLoading={isLoading} onSend={sendMessage} />
    </section>
  );
}
