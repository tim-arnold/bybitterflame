import { getHitDie, isOddLevel } from "@/lib/game/leveling";
import type { HpRollResult } from "./types";

interface LevelUpHPPhaseProps {
  levelUpNewLevel: number;
  hpAnimRoll: number;
  hpResult: HpRollResult | null;
  characterClass: string;
  characterAncestry: string;
  currentMaxHp: number;
  onConfirm: () => void;
}

export function LevelUpHPPhase({
  levelUpNewLevel,
  hpAnimRoll,
  hpResult,
  characterClass,
  characterAncestry,
  currentMaxHp,
  onConfirm,
}: LevelUpHPPhaseProps) {
  const isKnocker = characterAncestry.toLowerCase() === "knocker";
  const hitDie = getHitDie(characterClass);

  return (
    <>
      <div className="text-center space-y-2">
        <p className="text-xs uppercase tracking-widest text-stone-400">Level Up!</p>
        <h1 className="text-2xl font-bold text-[var(--color-gold)]">Level {levelUpNewLevel}</h1>
        <p className="text-stone-400 text-sm">Roll your hit die for new HP.</p>
      </div>

      {!hpResult ? (
        <div className="text-center space-y-4 py-6">
          <p className="text-stone-400 text-xs uppercase tracking-widest">Rolling…</p>
          <div className="text-8xl font-bold text-[var(--color-gold)] tabular-nums">{hpAnimRoll}</div>
          <p className="text-stone-400 text-sm">
            {isKnocker ? `d${hitDie} + Stone Blood bonus` : `d${hitDie}`}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-stone-950/70 border border-stone-700/50 rounded-lg px-5 py-4 space-y-3">
            {hpResult.roll2 !== undefined ? (
              <p className="text-stone-300 text-sm">
                Rolled{" "}
                <span className="text-[var(--color-gold)] font-bold">{hpResult.roll}</span>
                {" and "}
                <span className="text-[var(--color-gold)] font-bold">{hpResult.roll2}</span>
                {" — took the higher: "}
                <span className="text-[var(--color-gold)] font-bold">
                  {Math.max(hpResult.roll, hpResult.roll2)}
                </span>
              </p>
            ) : (
              <p className="text-stone-300 text-sm">
                Rolled <span className="text-[var(--color-gold)] font-bold">{hpResult.roll}</span>
              </p>
            )}
            {hpResult.conMod !== 0 && (
              <p className="text-stone-400 text-sm">
                CON modifier:{" "}
                <span className={hpResult.conMod > 0 ? "text-emerald-400" : "text-red-400"}>
                  {hpResult.conMod > 0 ? "+" : ""}
                  {hpResult.conMod}
                </span>
              </p>
            )}
            <p className="text-stone-100 text-sm font-medium border-t border-stone-700 pt-3">
              HP increases by{" "}
              <span className="text-[var(--color-gold)] font-bold">{hpResult.total}</span>
              {" → "}
              <span className="text-[var(--color-gold)] font-bold">{currentMaxHp + hpResult.total} max HP</span>
            </p>
          </div>

          <button
            onClick={onConfirm}
            className="w-full bg-stone-900 hover:bg-stone-800 border border-[var(--color-gold)]/60 text-[var(--color-gold)] text-sm font-medium px-4 py-3 rounded-lg transition-colors"
          >
            {isOddLevel(levelUpNewLevel) ? "Roll for Talent →" : "Continue →"}
          </button>
        </>
      )}
    </>
  );
}
