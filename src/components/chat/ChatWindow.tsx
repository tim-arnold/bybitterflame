"use client";

import { useRef, useEffect, useMemo } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";

export interface Message {
  role: "user" | "assistant";
  content: string;
  hidden?: boolean;
}

interface ChatWindowProps {
  messages: Message[];
  streamingContent?: string;
  onSend: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  footerOverride?: React.ReactNode;
}

export function ChatWindow({
  messages,
  streamingContent,
  onSend,
  isLoading,
  placeholder,
  footerOverride,
}: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  // Merge streaming content into the display list so the last ChatMessage
  // keeps the same React component instance across the streaming → final
  // transition. This preserves state (diceComplete, revealed) and prevents
  // the jarring unmount/remount that caused text to flash then vanish.
  const displayMessages = useMemo(() => {
    const visible = messages.filter((m) => !m.hidden);
    if (streamingContent) {
      return [
        ...visible.map((m) => ({ ...m, isStreaming: false })),
        { role: "assistant" as const, content: streamingContent, isStreaming: true },
      ];
    }
    return visible.map((m) => ({ ...m, isStreaming: false }));
  }, [messages, streamingContent]);

  return (
    <div className="flex flex-col h-full">
      <div
        ref={scrollRef}
        role="log"
        aria-label="Adventure log"
        aria-live="polite"
        aria-relevant="additions"
        className="flex-1 overflow-y-auto px-4 py-6 space-y-2"
      >
        {displayMessages.map((msg, i) => (
          <ChatMessage
            key={i}
            role={msg.role}
            content={msg.content}
            isStreaming={msg.isStreaming}
          />
        ))}
        {isLoading && !streamingContent && (
          <div role="status" aria-label="Game Master is responding" className="flex items-center gap-2 text-stone-400">
            <div aria-hidden="true" className="flex gap-1">
              <span className="w-2 h-2 bg-[var(--color-gold-dim)] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-[var(--color-gold-dim)] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-[var(--color-gold-dim)] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span className="text-sm">The Game Master ponders...</span>
          </div>
        )}
      </div>
      <div className="border-t border-stone-800 p-4">
        {footerOverride ?? (
          <ChatInput onSend={onSend} disabled={isLoading} placeholder={placeholder} autoFocus={!isLoading && !streamingContent} />
        )}
      </div>
    </div>
  );
}
