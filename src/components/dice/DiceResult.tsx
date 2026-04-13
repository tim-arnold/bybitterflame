"use client";

import type { DiceResult } from "@/lib/game/dice";

interface DiceResultDisplayProps {
  result: DiceResult;
}

export function DiceResultDisplay({ result }: DiceResultDisplayProps) {
  return (
    <div className="bg-stone-900 border border-stone-700 rounded-lg p-3 text-center">
      <div className="text-xs text-stone-400 mb-1">{result.notation}</div>
      <div className="dice-result text-2xl">{result.total}</div>
      {result.rolls.length > 1 && (
        <div className="text-xs text-stone-400 mt-1">
          [{result.rolls.join(", ")}]
          {result.modifier !== 0 && (
            <span> {result.modifier > 0 ? "+" : ""}{result.modifier}</span>
          )}
        </div>
      )}
      {result.rolls.length === 1 && result.modifier !== 0 && (
        <div className="text-xs text-stone-400 mt-1">
          {result.rolls[0]} {result.modifier > 0 ? "+" : ""}{result.modifier}
        </div>
      )}
    </div>
  );
}
