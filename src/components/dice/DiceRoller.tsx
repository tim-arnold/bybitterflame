"use client";

import { useState } from "react";
import { roll, type DiceResult } from "@/lib/game/dice";
import { DiceResultDisplay } from "./DiceResult";

interface DiceRollerProps {
  onRoll?: (result: DiceResult) => void;
}

const QUICK_ROLLS = [
  { label: "d4", notation: "1d4" },
  { label: "d6", notation: "1d6" },
  { label: "d8", notation: "1d8" },
  { label: "d10", notation: "1d10" },
  { label: "d12", notation: "1d12" },
  { label: "d20", notation: "1d20" },
  { label: "3d6", notation: "3d6" },
  { label: "2d6", notation: "2d6" },
];

export function DiceRoller({ onRoll }: DiceRollerProps) {
  const [lastResult, setLastResult] = useState<DiceResult | null>(null);
  const [customNotation, setCustomNotation] = useState("");

  function handleRoll(notation: string) {
    const result = roll(notation);
    setLastResult(result);
    onRoll?.(result);
  }

  function handleCustomRoll(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (customNotation.trim()) {
      handleRoll(customNotation.trim());
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xs uppercase tracking-wider text-stone-400">Dice Roller</h3>

      <div className="grid grid-cols-4 gap-1.5">
        {QUICK_ROLLS.map((qr) => (
          <button
            key={qr.notation}
            onClick={() => handleRoll(qr.notation)}
            className="rounded bg-stone-800 border border-stone-700 px-2 py-1.5 text-sm text-stone-300 hover:border-[var(--color-gold-dim)] hover:text-[var(--color-gold)] transition-colors cursor-pointer"
          >
            {qr.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleCustomRoll} className="flex gap-1.5">
        <input
          type="text"
          value={customNotation}
          onChange={(e) => setCustomNotation(e.target.value)}
          placeholder="e.g. 2d8+3"
          className="flex-1 rounded border border-stone-700 bg-stone-900 px-3 py-1.5 text-sm text-stone-300 placeholder-stone-600 focus:outline-none focus:border-[var(--color-gold-dim)]"
        />
        <button
          type="submit"
          className="rounded bg-stone-800 border border-stone-700 px-3 py-1.5 text-sm text-stone-300 hover:border-[var(--color-gold-dim)] hover:text-[var(--color-gold)] transition-colors cursor-pointer"
        >
          Roll
        </button>
      </form>

      {lastResult && <DiceResultDisplay result={lastResult} />}
    </div>
  );
}
