"use client";

interface Combatant {
  name: string;
  initiative: number;
  isPlayer: boolean;
  isActive: boolean;
}

interface CombatTrackerProps {
  combatants: Combatant[];
  round: number;
  isInCombat: boolean;
}

export function CombatTracker({ combatants, round, isInCombat }: CombatTrackerProps) {
  if (!isInCombat) return null;

  const sorted = [...combatants].sort((a, b) => b.initiative - a.initiative);

  return (
    <div className="bg-stone-900 border border-red-900/50 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs uppercase tracking-wider text-red-400">Combat</h3>
        <span className="text-xs text-stone-500">Round {round}</span>
      </div>
      <ul className="space-y-1">
        {sorted.map((c, i) => (
          <li
            key={i}
            className={`flex items-center justify-between rounded px-2 py-1 text-sm ${
              c.isActive
                ? "bg-red-900/30 border border-red-800/50 text-stone-100"
                : "text-stone-400"
            }`}
          >
            <span className="flex items-center gap-2">
              {c.isActive && <span className="text-red-400">&#x25B6;</span>}
              <span className={c.isPlayer ? "text-[var(--color-gold)]" : "text-stone-400"}>
                {c.name}
              </span>
            </span>
            <span className="font-mono text-xs text-stone-500">{c.initiative}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
