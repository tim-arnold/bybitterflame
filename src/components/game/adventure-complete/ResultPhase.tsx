import { shouldLevelUp } from "@/lib/game/leveling";
import { getDowntimeActivityName } from "@/lib/game/downtime";
import type { Character } from "@/lib/game/types";
import type { DowntimeOutcome, DowntimeTier, CompanionCarouseResult } from "./types";

interface ResultPhaseProps {
  finalRoll: number;
  outcome: DowntimeOutcome;
  xpGained: number;
  goldLost: number;
  playerTierCost: number;
  companionShortfall: number;
  selectedTier: DowntimeTier;
  character: Partial<Character>;
  companionResults?: CompanionCarouseResult[];
  onConfirm: () => void;
}

export function ResultPhase({
  finalRoll,
  outcome,
  xpGained,
  goldLost,
  playerTierCost,
  companionShortfall,
  selectedTier,
  character,
  companionResults,
  onConfirm,
}: ResultPhaseProps) {
  const willLevelUp =
    shouldLevelUp((character.xp ?? 0) + xpGained, character.level ?? 1) &&
    (character.level ?? 1) < 10;

  const activityName = getDowntimeActivityName(character.class ?? "Fighter");

  return (
    <>
      <div className="text-center space-y-1">
        <p className="text-xs uppercase tracking-widest text-stone-400">{activityName} result</p>
        <div className="flex items-center justify-center gap-3 mt-2">
          <span className="text-5xl font-bold text-[var(--color-gold)]">{finalRoll}</span>
          <div className="text-left">
            <p className="text-stone-400 text-xs">1d10 + {selectedTier.rollBonus}</p>
            <p className="text-stone-400 text-xs">{selectedTier.goldCost} gp spent</p>
          </div>
        </div>
      </div>

      <div className="bg-stone-950/70 border border-stone-700/50 rounded-lg px-5 py-4 space-y-2">
        <p className="text-stone-100 text-sm font-medium">{outcome.title}</p>
        <p className="text-stone-300 text-sm leading-relaxed">{outcome.description}</p>
      </div>

      <div className="bg-stone-950/70 border border-[var(--color-gold)]/40 rounded-lg px-5 py-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-widest text-[var(--color-gold)]/70">XP Gained</span>
          <span className="text-[var(--color-gold)] font-bold text-lg">+{xpGained} XP</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-widest text-stone-400">Gold Spent</span>
          <span className="text-stone-300 text-sm">
            {goldLost} gp
            {(goldLost > playerTierCost || companionShortfall > 0) && (
              <span className="text-stone-400 ml-1 text-xs">
                ({playerTierCost} your share
                {companionShortfall > 0 && ` + ${companionShortfall} companion shortfall`})
              </span>
            )}
          </span>
        </div>
        {willLevelUp && (
          <p className="text-[var(--color-gold)] text-xs border-t border-stone-700 pt-2 font-medium">
            Level up! You have enough XP to advance.
          </p>
        )}
      </div>

      {companionResults && companionResults.length > 0 && (
        <div className="bg-stone-950/70 border border-stone-700/50 rounded-lg px-5 py-4 space-y-2">
          <p className="text-xs uppercase tracking-widest text-stone-400 mb-1">Companions</p>
          {companionResults.map((r) => (
            <div key={r.companion.id} className="space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-stone-300 text-sm">{r.companion.name}</span>
                <div className="text-right">
                  <span className="text-[var(--color-gold)] text-sm font-semibold">+{r.xpGained} XP</span>
                  {r.goldDeducted !== undefined && r.goldDeducted > 0 && (
                    <span className="block text-stone-400 text-xs">−{r.goldDeducted} gp</span>
                  )}
                  {r.goldShortfall !== undefined && r.goldShortfall > 0 && (
                    <span className="block text-red-400 text-xs">{r.goldShortfall} gp short</span>
                  )}
                </div>
              </div>
              {r.leveled && (
                <p className="text-[var(--color-gold)] text-xs font-medium">
                  Leveled up to {r.companion.level}!
                  {r.hpGained ? ` +${r.hpGained} HP.` : ""}
                  {r.talentGained ? ` Talent: ${r.talentGained}.` : ""}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onConfirm}
        className="w-full bg-stone-900 hover:bg-stone-800 border border-[var(--color-gold)]/60 text-[var(--color-gold)] text-sm font-medium px-4 py-3 rounded-lg transition-colors"
      >
        {willLevelUp ? "Level Up! →" : "Continue →"}
      </button>
    </>
  );
}
