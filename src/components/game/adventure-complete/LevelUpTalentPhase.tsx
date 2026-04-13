import type { Spell } from "@/lib/game/types";
import { getStatMod } from "@/lib/game/ability-utils";
import type { TalentResult } from "./types";

type StatKey = "str" | "dex" | "con" | "int" | "wis" | "cha";
const STAT_KEYS: { key: StatKey; label: string }[] = [
  { key: "str", label: "STR" },
  { key: "dex", label: "DEX" },
  { key: "con", label: "CON" },
  { key: "int", label: "INT" },
  { key: "wis", label: "WIS" },
  { key: "cha", label: "CHA" },
];

interface LevelUpTalentPhaseProps {
  levelUpNewLevel: number;
  talentAnimRoll: number;
  talentRoll: number | null;
  talentEntry: TalentResult | null;
  talentChoice: string | null;
  talentTextInput: string;
  characterClass: string;
  characterStats: Record<StatKey, number>;
  knownSpells: Spell[];
  isChoiceReady: boolean;
  onSetTalentChoice: (choice: string) => void;
  onSetTalentTextInput: (text: string) => void;
  onConfirm: () => void;
}

export function LevelUpTalentPhase({
  levelUpNewLevel,
  talentAnimRoll,
  talentRoll,
  talentEntry,
  talentChoice,
  characterClass,
  characterStats,
  knownSpells,
  isChoiceReady,
  onSetTalentChoice,
  onConfirm,
}: LevelUpTalentPhaseProps) {
  return (
    <>
      <div className="text-center space-y-2">
        <p className="text-xs uppercase tracking-widest text-stone-400">
          Level {levelUpNewLevel} — Talent Roll
        </p>
        <h1 className="text-2xl font-bold text-[var(--color-gold)]">Roll 2d6</h1>
      </div>

      {talentRoll === null ? (
        <div className="text-center space-y-4 py-6">
          <p className="text-stone-400 text-xs uppercase tracking-widest">Rolling…</p>
          <div className="text-8xl font-bold text-[var(--color-gold)] tabular-nums">{talentAnimRoll}</div>
          <p className="text-stone-400 text-sm">2d6 on the {characterClass} talent table</p>
        </div>
      ) : (
        <>
          <div className="bg-stone-950/70 border border-stone-700/50 rounded-lg px-5 py-4 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold text-[var(--color-gold)]">{talentRoll}</span>
              <p className="text-stone-300 text-sm">on the {characterClass} table</p>
            </div>

            {talentEntry && (
              <div className="border-t border-stone-700 pt-3 space-y-3">
                <p className="text-stone-100 text-sm font-medium">{talentEntry.description}</p>

                {/* Stat choice buttons */}
                {talentEntry.choiceType === "stat-choice" && talentEntry.choiceOptions && (
                  <div>
                    <p className="text-stone-400 text-xs mb-2">Choose one stat to increase:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {STAT_KEYS.filter((s) => talentEntry.choiceOptions!.includes(s.label)).map((s) => {
                        const score = characterStats[s.key];
                        const mod = score !== undefined ? getStatMod(score) : 0;
                        const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
                        const selected = talentChoice === s.label;
                        return (
                          <button
                            key={s.label}
                            onClick={() => onSetTalentChoice(s.label)}
                            className={`flex flex-col items-center py-2 rounded border text-sm font-medium transition-colors ${
                              selected
                                ? "border-[var(--color-gold)] bg-stone-800"
                                : "border-stone-600 bg-stone-900 hover:border-stone-400"
                            }`}
                          >
                            <span className={selected ? "text-[var(--color-gold)]" : "text-stone-300"}>
                              {s.label}
                            </span>
                            <span className={`text-lg font-bold ${selected ? "text-[var(--color-gold)]" : "text-stone-100"}`}>
                              {score ?? "?"}
                            </span>
                            <span className={`text-xs ${mod >= 1 ? "text-emerald-400" : mod <= -1 ? "text-red-400" : "text-stone-500"}`}>
                              {modStr}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Spell advantage — pick from known spells */}
                {talentEntry.choiceType === "spell-advantage" && (
                  <div>
                    <p className="text-stone-400 text-xs mb-2">Choose a spell you know:</p>
                    <div className="flex flex-wrap gap-2">
                      {knownSpells.map((spell) => (
                        <button
                          key={spell.name}
                          onClick={() => onSetTalentChoice(spell.name)}
                          className={`px-3 py-1.5 rounded border text-xs transition-colors ${
                            talentChoice === spell.name
                              ? "border-[var(--color-gold)] bg-stone-800 text-[var(--color-gold)]"
                              : "border-stone-600 bg-stone-900 text-stone-300 hover:border-stone-400"
                          }`}
                        >
                          {spell.name} (T{spell.tier})
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* HP roll result — auto-resolved, just displayed */}
                {talentEntry.choiceType === "hp-roll" && talentEntry.hpDie && (
                  <p className="text-stone-400 text-xs">
                    Bonus HP will be rolled automatically.
                  </p>
                )}

                {/* spell-learn: handled in spell picker */}
                {talentEntry.choiceType === "spell-learn" && (
                  <p className="text-stone-400 text-xs">
                    You will choose your new spell in the next step.
                  </p>
                )}
              </div>
            )}
          </div>

          {talentEntry && (
            <button
              onClick={onConfirm}
              disabled={!isChoiceReady}
              className="w-full bg-stone-900 hover:bg-stone-800 border border-[var(--color-gold)]/60 text-[var(--color-gold)] text-sm font-medium px-4 py-3 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Confirm Talent →
            </button>
          )}
        </>
      )}
    </>
  );
}
