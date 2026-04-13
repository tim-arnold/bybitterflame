"use client";

import { useState, useRef, useEffect } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

const MAX_LENGTH = 1000;

export function ChatInput({ onSend, disabled, placeholder = "What do you do?", autoFocus }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const remaining = MAX_LENGTH - input.length;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + "px";
    }
  }, [input]);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
      <div className="flex-1 flex flex-col gap-1">
        <textarea
          id="chat-input"
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value.slice(0, MAX_LENGTH))}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          maxLength={MAX_LENGTH}
          className="w-full resize-none rounded-lg border border-stone-700 bg-stone-900 px-4 py-3 text-stone-200 placeholder-stone-500 focus:outline-none focus:border-[var(--color-gold-dim)] transition-colors disabled:opacity-50"
        />
        {remaining <= 100 && (
          <span className={`text-xs text-right pr-1 ${remaining <= 20 ? "text-red-400" : "text-stone-400"}`}>
            {remaining} left
          </span>
        )}
      </div>
      <button
        type="submit"
        disabled={disabled || !input.trim()}
        className="rounded-lg bg-[var(--color-gold-dim)] px-5 py-3 font-semibold text-stone-950 hover:bg-[var(--color-gold)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Send
      </button>
    </form>
  );
}
