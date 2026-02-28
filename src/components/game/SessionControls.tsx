"use client";

import Link from "next/link";
import { ANTHROPIC_INPUT_COST_PER_TOKEN, ANTHROPIC_OUTPUT_COST_PER_TOKEN } from "@/lib/config";

interface SessionControlsProps {
  onEndSession: () => void;
  onSaveSession: () => void;
  sessionNumber: number;
  isLoading?: boolean;
  isPausing?: boolean;
  sessionInputTokens?: number;
  sessionOutputTokens?: number;
}

export function SessionControls({
  onEndSession,
  onSaveSession,
  sessionNumber,
  isLoading,
  isPausing,
  sessionInputTokens = 0,
  sessionOutputTokens = 0,
}: SessionControlsProps) {
  const totalTokens = sessionInputTokens + sessionOutputTokens;
  const estimatedCost =
    sessionInputTokens * ANTHROPIC_INPUT_COST_PER_TOKEN +
    sessionOutputTokens * ANTHROPIC_OUTPUT_COST_PER_TOKEN;

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

      {totalTokens > 0 && (
        <div className="border-t border-stone-800 pt-2 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-stone-600">Tokens this session</span>
            <span className="font-mono text-stone-500">{totalTokens.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-stone-600">Est. cost</span>
            <span className="font-mono text-stone-500">${estimatedCost.toFixed(4)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
