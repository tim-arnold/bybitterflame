"use client";

import Link from "next/link";
import { calcCost, SERVER_KEY_TURN_LIMIT } from "@/lib/config";

interface SessionControlsProps {
  onEndSession: () => void;
  onSaveSession: () => void;
  sessionNumber: number;
  isLoading?: boolean;
  isPausing?: boolean;
  sessionInputTokens?: number;
  sessionOutputTokens?: number;
  sessionCacheWriteTokens?: number;
  sessionCacheReadTokens?: number;
  lifetimeInputTokens?: number;
  lifetimeOutputTokens?: number;
  lifetimeCacheWriteTokens?: number;
  lifetimeCacheReadTokens?: number;
  /** Non-null when user is on the free trial; value is turns used so far. */
  trialTurnsUsed?: number | null;
}

export function SessionControls({
  onEndSession,
  onSaveSession,
  sessionNumber,
  isLoading,
  isPausing,
  sessionInputTokens = 0,
  sessionOutputTokens = 0,
  sessionCacheWriteTokens = 0,
  sessionCacheReadTokens = 0,
  lifetimeInputTokens = 0,
  lifetimeOutputTokens = 0,
  lifetimeCacheWriteTokens = 0,
  lifetimeCacheReadTokens = 0,
  trialTurnsUsed = null,
}: SessionControlsProps) {
  const sessionTokens = sessionInputTokens + sessionOutputTokens;
  const sessionCost = calcCost(sessionInputTokens, sessionOutputTokens, sessionCacheWriteTokens, sessionCacheReadTokens);

  const lifetimeTokens = lifetimeInputTokens + lifetimeOutputTokens;
  const lifetimeCost = calcCost(lifetimeInputTokens, lifetimeOutputTokens, lifetimeCacheWriteTokens, lifetimeCacheReadTokens);

  return (
    <div className="bg-stone-900 border border-stone-700 rounded-lg p-3 space-y-2">
      <h3 className="text-xs uppercase tracking-wider text-stone-500">Session {sessionNumber}</h3>
      <div className="flex flex-col gap-1.5">
        <button
          onClick={onSaveSession}
          disabled={isLoading || isPausing}
          className="w-full rounded bg-stone-800 border border-stone-700 px-3 py-1.5 text-sm text-stone-300 hover:border-stone-600 transition-colors disabled:opacity-50"
        >
          Save Progress
        </button>
        {isPausing && !isLoading ? (
          <Link
            href="/"
            className="w-full rounded bg-amber-900/30 border border-amber-700/60 px-3 py-1.5 text-sm text-amber-300 hover:bg-amber-900/50 transition-colors text-center"
          >
            Return Home
          </Link>
        ) : (
          <button
            onClick={onEndSession}
            disabled={isLoading || isPausing}
            className="w-full rounded bg-stone-800 border border-red-900/50 px-3 py-1.5 text-sm text-red-400 hover:bg-red-900/20 transition-colors disabled:opacity-50"
          >
            Pause Session
          </button>
        )}
      </div>

      {trialTurnsUsed !== null && (
        <div className="border-t border-stone-800 pt-2 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-stone-500">Free trial turns</span>
            <span className={`font-mono ${trialTurnsUsed >= SERVER_KEY_TURN_LIMIT ? "text-red-400" : "text-blue-400"}`}>
              {trialTurnsUsed} / {SERVER_KEY_TURN_LIMIT}
            </span>
          </div>
          <div className="h-1 rounded-full bg-stone-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${trialTurnsUsed >= SERVER_KEY_TURN_LIMIT ? "bg-red-500" : "bg-blue-600"}`}
              style={{ width: `${Math.min(100, (trialTurnsUsed / SERVER_KEY_TURN_LIMIT) * 100)}%` }}
            />
          </div>
          {trialTurnsUsed >= SERVER_KEY_TURN_LIMIT && (
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
            <span className="text-xs text-stone-500">Estimated Costs</span>
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
                Based on Sonnet 4 list pricing. Actual charges may differ slightly due to rounding, model changes, or Anthropic pricing updates. Check{" "}
                <span className="text-stone-400">console.anthropic.com</span>{" "}
                for exact usage.
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-600" />
              </div>
            </div>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-stone-600">This session</span>
            <span className="font-mono text-stone-500">
              {sessionTokens > 0 ? `${sessionTokens.toLocaleString()} · $${sessionCost.toFixed(4)}` : "—"}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-stone-600">Lifetime</span>
            <span className="font-mono text-stone-500">
              {lifetimeTokens.toLocaleString()} · ${lifetimeCost.toFixed(4)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
