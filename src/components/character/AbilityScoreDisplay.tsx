"use client";

import { getModifier } from "@/lib/game/dice";

interface AbilityScoreDisplayProps {
  label: string;
  value: number;
  abbreviated: string;
}

export function AbilityScoreDisplay({ label, value, abbreviated }: AbilityScoreDisplayProps) {
  const mod = getModifier(value);
  const modStr = mod >= 0 ? `+${mod}` : `${mod}`;

  return (
    <div className="flex flex-col items-center bg-stone-900 border border-stone-700 rounded-lg p-2 min-w-[60px]">
      <span className="text-[10px] uppercase tracking-wider text-stone-500">{abbreviated}</span>
      <span className="text-xl font-bold text-stone-100">{value}</span>
      <span className="text-sm font-mono text-[var(--color-gold)]">{modStr}</span>
    </div>
  );
}
