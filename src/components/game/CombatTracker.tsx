"use client";

interface Combatant {
  name: string;
  initiative: number;
  isPlayer: boolean;
  isCompanion?: boolean;
  isActive: boolean;
}

interface CombatTrackerProps {
  combatants: Combatant[];
  round: number;
  isInCombat: boolean;
}

function nameColor(c: Combatant): string {
  if (c.isPlayer) return "text-[var(--color-gold)]";
  if (c.isCompanion) return "text-emerald-400";
  return "text-stone-400";
}

export function CombatTracker({ combatants, round, isInCombat }: CombatTrackerProps) {
  if (!isInCombat) return null;

  const sorted = [...combatants].sort((a, b) => b.initiative - a.initiative);

  return (
    <div className="bg-stone-900 border border-red-900/50 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs uppercase tracking-wider text-red-400">Combat</h3>
        <span className="text-xs text-stone-400" aria-live="polite" aria-atomic="true">Round {round}</span>
      </div>
      <ul className="space-y-1" aria-label="Initiative order">
        {sorted.map((c, i) => (
          <li
            key={i}
            aria-current={c.isActive ? "true" : undefined}
            className={`flex items-center justify-between rounded px-2 py-1 text-sm ${
              c.isActive
                ? "bg-red-900/30 border border-red-800/50 text-stone-100"
                : "text-stone-400"
            }`}
          >
            <span className="flex items-center gap-2">
              {c.isActive && <span className="text-red-400" aria-hidden>&#x25B6;</span>}
              <span className={nameColor(c)}>{c.name}{c.isActive ? " (active)" : ""}</span>
            </span>
            <span className="font-mono text-xs text-stone-400" aria-label={`initiative ${c.initiative}`}>{c.initiative}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
