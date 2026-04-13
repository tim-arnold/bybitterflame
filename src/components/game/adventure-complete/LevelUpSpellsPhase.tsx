import type { Spell } from "@/lib/game/types";
import type { SpellPickState } from "./types";

interface LevelUpSpellsPhaseProps {
  levelUpNewLevel: number;
  currentSpellPick: SpellPickState;
  spellPickQueue: SpellPickState[];
  spellPickIdx: number;
  spellPickSelected: Spell[];
  onToggleSpell: (spell: Spell) => void;
  onConfirm: () => void;
}

export function LevelUpSpellsPhase({
  levelUpNewLevel,
  currentSpellPick,
  spellPickQueue,
  spellPickIdx,
  spellPickSelected,
  onToggleSpell,
  onConfirm,
}: LevelUpSpellsPhaseProps) {
  const spellPickNeeded = currentSpellPick.count;

  return (
    <>
      <div className="text-center space-y-2">
        <p className="text-xs uppercase tracking-widest text-stone-400">
          Level {levelUpNewLevel} — New Spells
          {spellPickQueue.length > 1 && ` (${spellPickIdx + 1} of ${spellPickQueue.length})`}
        </p>
        <h1 className="text-2xl font-bold text-[var(--color-gold)]">
          Choose {spellPickNeeded === 1 ? "a Spell" : `${spellPickNeeded} Spells`}
        </h1>
        <p className="text-stone-400 text-sm">
          {currentSpellPick.tier === 0
            ? `Any tier up to Tier ${Math.ceil(levelUpNewLevel / 2)}`
            : currentSpellPick.tier === 1
            ? `Tier 1 — Neutral spells`
            : `Tier ${currentSpellPick.tier} — Path spells`}
        </p>
      </div>

      <div className="bg-stone-950/70 border border-stone-700/50 rounded-lg px-5 py-4">
        <p className="text-stone-400 text-xs mb-3">
          Select {spellPickNeeded}{" "}
          {spellPickNeeded === spellPickSelected.length ? (
            <span className="text-emerald-400">— ready!</span>
          ) : (
            `(${spellPickSelected.length} selected)`
          )}
        </p>
        <div className="space-y-2">
          {currentSpellPick.available.length === 0 ? (
            <p className="text-stone-500 text-sm italic">You already know all spells of this tier.</p>
          ) : (
            currentSpellPick.available.map((spell) => {
              const isSelected = spellPickSelected.some((s) => s.name === spell.name);
              const isDisabled = !isSelected && spellPickSelected.length >= spellPickNeeded;
              return (
                <button
                  key={spell.name}
                  onClick={() => !isDisabled && onToggleSpell(spell)}
                  disabled={isDisabled}
                  className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${
                    isSelected
                      ? "border-[var(--color-gold-dim)] bg-stone-800"
                      : isDisabled
                      ? "border-stone-800 bg-stone-900/50 opacity-40 cursor-not-allowed"
                      : "border-stone-700 bg-stone-900 hover:border-stone-500 hover:bg-stone-800 cursor-pointer"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p
                        className={`text-sm font-medium ${isSelected ? "text-stone-100" : "text-stone-300"}`}
                      >
                        {spell.name}
                      </p>
                      <p className="text-stone-500 text-xs mt-0.5">{spell.description}</p>
                    </div>
                    <span className="text-xs text-stone-500 shrink-0 mt-0.5">
                      T{spell.tier} · {spell.range} · {spell.duration}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      <button
        onClick={onConfirm}
        disabled={
          currentSpellPick.available.length > 0 && spellPickSelected.length < spellPickNeeded
        }
        className="w-full bg-stone-900 hover:bg-stone-800 border border-[var(--color-gold)]/60 text-[var(--color-gold)] text-sm font-medium px-4 py-3 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {spellPickIdx + 1 < spellPickQueue.length ? "Next →" : "Confirm Spells →"}
      </button>
    </>
  );
}
