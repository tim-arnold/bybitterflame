"use client";

import { useState } from "react";

interface ManualDiceInputProps {
  onSubmit: (value: number, notation: string) => void;
}

export function ManualDiceInput({ onSubmit }: ManualDiceInputProps) {
  const [value, setValue] = useState("");
  const [dieType, setDieType] = useState("d20");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 1) {
      onSubmit(num, `1${dieType}`);
      setValue("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-1.5">
        {["d4", "d6", "d8", "d10", "d12", "d20"].map((dt) => (
          <button
            key={dt}
            type="button"
            onClick={() => setDieType(dt)}
            className={`flex-1 rounded px-2 py-1 text-xs transition-colors ${
              dieType === dt
                ? "bg-[var(--color-gold-dim)] text-stone-950"
                : "bg-stone-800 border border-stone-700 text-stone-400 hover:border-stone-600"
            }`}
          >
            {dt}
          </button>
        ))}
      </div>
      <div className="flex gap-1.5">
        <input
          type="number"
          min="1"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter result"
          className="flex-1 rounded border border-stone-700 bg-stone-900 px-3 py-1.5 text-sm text-stone-300 placeholder-stone-600 focus:outline-none focus:border-[var(--color-gold-dim)]"
        />
        <button
          type="submit"
          className="rounded bg-stone-800 border border-stone-700 px-3 py-1.5 text-sm text-stone-300 hover:border-[var(--color-gold-dim)] hover:text-[var(--color-gold)] transition-colors"
        >
          Submit
        </button>
      </div>
    </form>
  );
}
