import { getDowntimeActivityName } from "@/lib/game/downtime";
import { DOWNTIME_TIERS } from "./constants";
import type { DowntimeTier } from "./types";

interface CarousingPhaseProps {
  characterClass: string;
  currentGold: number;
  activeCompanionCount: number;
  selectedTier: DowntimeTier | null;
  onSelectTier: (tier: DowntimeTier) => void;
  onRoll: () => void;
  onSkip: () => void;
}

export function CarousingPhase({
  characterClass,
  currentGold,
  activeCompanionCount,
  selectedTier,
  onSelectTier,
  onRoll,
  onSkip,
}: CarousingPhaseProps) {
  const activityName = getDowntimeActivityName(characterClass);
  const partySize = 1 + activeCompanionCount;
  const splitCost = partySize > 1;

  return (
    <>
      <div className="text-center space-y-1">
        <p className="text-xs uppercase tracking-widest text-stone-400">Back in town</p>
        <h1 className="text-2xl font-bold text-[var(--color-gold)]">Time for {activityName}</h1>
        <p className="text-stone-400 text-sm">
          Spending gold earns XP. Roll 1d10 + tier bonus for a class-specific outcome.
        </p>
        {splitCost && (
          <p className="text-stone-500 text-xs">
            Cost is split {partySize} ways — you and your {activeCompanionCount === 1 ? "companion" : `${activeCompanionCount} companions`} each pay a share.
          </p>
        )}
      </div>

      <div className="bg-stone-950/70 border border-stone-700/50 rounded-lg px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs uppercase tracking-widest text-stone-400">Your gold</p>
          <p className="text-[var(--color-gold)] font-semibold">{currentGold} gp</p>
        </div>
        <div className="space-y-2">
          {DOWNTIME_TIERS.map((tier) => {
            const playerShare = tier.goldCost - Math.floor(tier.goldCost / partySize) * activeCompanionCount;
            const canAfford = currentGold >= playerShare;
            const isSelected = selectedTier?.tier === tier.tier;
            return (
              <button
                key={tier.tier}
                onClick={() => canAfford && onSelectTier(tier)}
                disabled={!canAfford}
                className={`w-full rounded-lg border px-4 py-2.5 text-left transition-colors ${
                  isSelected
                    ? "border-[var(--color-gold-dim)] bg-stone-800"
                    : canAfford
                    ? "border-stone-700 bg-stone-900 hover:border-stone-500 hover:bg-stone-800 cursor-pointer"
                    : "border-stone-800 bg-stone-900/50 opacity-40 cursor-not-allowed"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-sm ${isSelected ? "text-stone-100" : "text-stone-300"}`}>
                    {tier.description}
                  </span>
                  <div className="text-right shrink-0">
                    <span
                      className={`text-sm font-semibold ${isSelected ? "text-[var(--color-gold)]" : "text-stone-400"}`}
                    >
                      {splitCost ? `${playerShare} gp` : `${tier.goldCost} gp`}
                    </span>
                    {splitCost && (
                      <span className="block text-xs text-stone-500">{tier.goldCost} gp total</span>
                    )}
                    <span className="block text-xs text-stone-400">+{tier.xpEarned} XP · +{tier.rollBonus} to roll</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={onRoll}
          disabled={!selectedTier}
          className="w-full bg-stone-900 hover:bg-stone-800 border border-[var(--color-gold)]/60 text-[var(--color-gold)] text-sm font-medium px-4 py-3 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {selectedTier ? `Roll 1d10 + ${selectedTier.rollBonus} →` : "Choose a tier above"}
        </button>
        <button
          onClick={onSkip}
          className="w-full bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-400 text-sm px-4 py-2.5 rounded-lg transition-colors"
        >
          Skip downtime — head home
        </button>
      </div>
    </>
  );
}
