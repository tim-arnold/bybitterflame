"use client";

import Link from "next/link";
import { calcMixedCost, SERVER_KEY_TURN_LIMIT } from "@/lib/config";

interface SessionControlsProps {
  onEndSession: () => void;
  onResumeSession: () => void;
  onSaveSession: () => void;
  sessionNumber: number;
  isLoading?: boolean;
  isPausing?: boolean;
  sessionInputTokens?: number;
  sessionOutputTokens?: number;
  sessionCacheWriteTokens?: number;
  sessionCacheReadTokens?: number;
  sessionHaikuInputTokens?: number;
  sessionHaikuOutputTokens?: number;
  sessionHaikuCacheWriteTokens?: number;
  sessionHaikuCacheReadTokens?: number;
  lifetimeInputTokens?: number;
  lifetimeOutputTokens?: number;
  lifetimeCacheWriteTokens?: number;
  lifetimeCacheReadTokens?: number;
  lifetimeHaikuInputTokens?: number;
  lifetimeHaikuOutputTokens?: number;
  lifetimeHaikuCacheWriteTokens?: number;
  lifetimeHaikuCacheReadTokens?: number;
  /** Non-null when user is on the free trial; value is turns used so far. */
  trialTurnsUsed?: number | null;
  /** Effective turn limit including any admin-granted bonus turns. */
  turnsLimit?: number;
  /** Economy mode: use faster/cheaper AI model for all turns. */
  economyMode?: boolean;
  onToggleEconomyMode?: () => void;
  saveStatus?: "idle" | "saving" | "saved";
}

export function SessionControls({
  onEndSession,
  onResumeSession,
  onSaveSession,
  sessionNumber,
  isLoading,
  isPausing,
  sessionInputTokens = 0,
  sessionOutputTokens = 0,
  sessionCacheWriteTokens = 0,
  sessionCacheReadTokens = 0,
  sessionHaikuInputTokens = 0,
  sessionHaikuOutputTokens = 0,
  sessionHaikuCacheWriteTokens = 0,
  sessionHaikuCacheReadTokens = 0,
  lifetimeInputTokens = 0,
  lifetimeOutputTokens = 0,
  lifetimeCacheWriteTokens = 0,
  lifetimeCacheReadTokens = 0,
  lifetimeHaikuInputTokens = 0,
  lifetimeHaikuOutputTokens = 0,
  lifetimeHaikuCacheWriteTokens = 0,
  lifetimeHaikuCacheReadTokens = 0,
  trialTurnsUsed = null,
  turnsLimit = SERVER_KEY_TURN_LIMIT,
  economyMode = false,
  onToggleEconomyMode,
  saveStatus = "idle",
}: SessionControlsProps) {
  const sessionTokens = sessionInputTokens + sessionOutputTokens;
  const sessionCost = calcMixedCost(
    sessionInputTokens, sessionOutputTokens, sessionCacheWriteTokens, sessionCacheReadTokens,
    sessionHaikuInputTokens, sessionHaikuOutputTokens, sessionHaikuCacheWriteTokens, sessionHaikuCacheReadTokens,
  );

  const lifetimeTokens = lifetimeInputTokens + lifetimeOutputTokens;
  const lifetimeCost = calcMixedCost(
    lifetimeInputTokens, lifetimeOutputTokens, lifetimeCacheWriteTokens, lifetimeCacheReadTokens,
    lifetimeHaikuInputTokens, lifetimeHaikuOutputTokens, lifetimeHaikuCacheWriteTokens, lifetimeHaikuCacheReadTokens,
  );

  return (
    <div className="bg-stone-900 border border-stone-700 rounded-lg p-3 space-y-2">
      <h3 className="text-xs uppercase tracking-wider text-stone-400">Session {sessionNumber}</h3>
      <div className="flex flex-col gap-1.5">
        <button
          onClick={onSaveSession}
          disabled={isLoading || isPausing || saveStatus === "saving"}
          className="w-full rounded bg-stone-800 border border-stone-700 px-3 py-1.5 text-sm transition-colors disabled:opacity-50 hover:border-stone-600 text-stone-300 flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
        >
          {saveStatus === "saving" && (
            <svg className="animate-spin w-3 h-3 text-stone-400 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {saveStatus === "saving" ? "Saving Progress…" : saveStatus === "saved" ? "Progress Saved" : "Save Progress"}
        </button>
        {isPausing && !isLoading ? (
          <button
            onClick={onResumeSession}
            className="w-full rounded bg-amber-900/30 border border-amber-700/60 px-3 py-1.5 text-sm text-amber-300 hover:bg-amber-900/50 transition-colors cursor-pointer"
          >
            Resume Session
          </button>
        ) : (
          <button
            onClick={onEndSession}
            disabled={isLoading || isPausing}
            className="w-full rounded bg-stone-800 border border-red-900/50 px-3 py-1.5 text-sm text-red-400 hover:bg-red-900/20 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {isPausing && isLoading ? "Summarizing…" : "Summarize and Pause"}
          </button>
        )}
      </div>

      {onToggleEconomyMode && (
        <div className="border-t border-stone-800 pt-2">
          <button
            onClick={onToggleEconomyMode}
            className="flex items-center justify-between w-full group cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-stone-400">Economy mode</span>
              <div className="relative group/tip">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="w-3 h-3 text-stone-600"
                >
                  <path
                    fillRule="evenodd"
                    d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0Zm-6 3.5a1 1 0 1 1-2 0V8a1 1 0 0 1 2 0v3.5ZM8 5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tip:block w-48 rounded bg-stone-800 border border-stone-600 px-2.5 py-2 text-xs text-stone-300 leading-relaxed shadow-lg z-50 pointer-events-none">
                  Uses a faster, cheaper AI model. Costs ~67% less per turn but narrative quality may be simpler.
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-600" />
                </div>
              </div>
            </div>
            <div
              className={`relative w-8 h-[18px] rounded-full transition-colors ${
                economyMode ? "bg-amber-700" : "bg-stone-700"
              }`}
            >
              <div
                className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-stone-200 transition-transform ${
                  economyMode ? "translate-x-[16px]" : "translate-x-[2px]"
                }`}
              />
            </div>
          </button>
        </div>
      )}

      {trialTurnsUsed !== null && (
        <div className="border-t border-stone-800 pt-2 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-stone-400">Free trial turns</span>
            <span className={`font-mono ${trialTurnsUsed >= turnsLimit ? "text-red-400" : "text-blue-400"}`}>
              {trialTurnsUsed} / {turnsLimit}
            </span>
          </div>
          <div className="h-1 rounded-full bg-stone-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${trialTurnsUsed >= turnsLimit ? "bg-red-500" : "bg-blue-600"}`}
              style={{ width: `${Math.min(100, (trialTurnsUsed / turnsLimit) * 100)}%` }}
            />
          </div>
          {trialTurnsUsed >= turnsLimit && (
            <p className="text-xs text-red-400">
              Trial ended.{" "}
              <Link href="/account" className="underline hover:text-red-300">
                Add your API key
              </Link>{" "}
              to continue.
            </p>
          )}
        </div>
      )}

      {lifetimeTokens > 0 && (
        <div className="border-t border-stone-800 pt-2 space-y-1">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-xs text-stone-400">Estimated Costs</span>
            <div className="relative group">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="w-3 h-3 text-stone-600 cursor-default"
              >
                <path
                  fillRule="evenodd"
                  d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0Zm-6 3.5a1 1 0 1 1-2 0V8a1 1 0 0 1 2 0v3.5ZM8 5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-56 rounded bg-stone-800 border border-stone-600 px-2.5 py-2 text-xs text-stone-300 leading-relaxed shadow-lg z-50 pointer-events-none">
                Based on Anthropic list pricing (Sonnet 4 and Haiku 4.5). Actual charges may differ slightly due to rounding or pricing updates. Check{" "}
                <span className="text-stone-400">console.anthropic.com</span>{" "}
                for exact usage.
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-600" />
              </div>
            </div>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-stone-600">This session</span>
            <span className="font-mono text-stone-400">
              {sessionTokens > 0 ? `${sessionTokens.toLocaleString()} · $${sessionCost.toFixed(4)}` : "—"}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-stone-600">Lifetime</span>
            <span className="font-mono text-stone-400">
              {lifetimeTokens.toLocaleString()} · ${lifetimeCost.toFixed(4)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
