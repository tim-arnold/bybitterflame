"use client";

import { useState } from "react";
import { roll, type DiceResult } from "@/lib/game/dice";
import { DiceResultDisplay } from "./DiceResult";
import { ManualDiceInput } from "./ManualDiceInput";

interface DiceRollerProps {
  onRoll?: (result: DiceResult) => void;
  mode?: "virtual" | "manual";
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

export function DiceRoller({ onRoll, mode = "virtual" }: DiceRollerProps) {
  const [lastResult, setLastResult] = useState<DiceResult | null>(null);
  const [customNotation, setCustomNotation] = useState("");
  const [diceMode, setDiceMode] = useState(mode);

  function handleRoll(notation: string) {
    const result = roll(notation);
    setLastResult(result);
    onRoll?.(result);
  }

  function handleCustomRoll(e: React.FormEvent) {
    e.preventDefault();
    if (customNotation.trim()) {
      handleRoll(customNotation.trim());
    }
  }

  function handleManualResult(value: number, notation: string) {
    const result: DiceResult = {
      notation,
      rolls: [value],
      modifier: 0,
      total: value,
    };
    setLastResult(result);
    onRoll?.(result);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-wider text-stone-500">Dice Roller</h3>
        <button
          onClick={() => setDiceMode(diceMode === "virtual" ? "manual" : "virtual")}
          className="text-xs text-stone-500 hover:text-[var(--color-gold)] transition-colors"
        >
          {diceMode === "virtual" ? "Manual input" : "Virtual dice"}
        </button>
      </div>

      {diceMode === "virtual" ? (
        <>
          <div className="grid grid-cols-4 gap-1.5">
            {QUICK_ROLLS.map((qr) => (
              <button
                key={qr.notation}
                onClick={() => handleRoll(qr.notation)}
                className="rounded bg-stone-800 border border-stone-700 px-2 py-1.5 text-sm text-stone-300 hover:border-[var(--color-gold-dim)] hover:text-[var(--color-gold)] transition-colors"
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
              className="rounded bg-stone-800 border border-stone-700 px-3 py-1.5 text-sm text-stone-300 hover:border-[var(--color-gold-dim)] hover:text-[var(--color-gold)] transition-colors"
            >
              Roll
            </button>
          </form>
        </>
      ) : (
        <ManualDiceInput onSubmit={handleManualResult} />
      )}

      {lastResult && <DiceResultDisplay result={lastResult} />}
    </div>
  );
}
