"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Character } from "@/lib/game/types";

interface CarouseTier {
  cost: number;
  bonus: number;
  description: string;
}

interface CarouseOutcome {
  minRoll: number;
  xp: number;
  goldLossPercent: number;
  flavor: string;
  sideEffect: string | null;
}

const CAROUSE_TIERS: CarouseTier[] = [
  { cost: 30,   bonus: 0, description: "One night of drinks and company at your favorite haunt" },
  { cost: 100,  bonus: 1, description: "A day and night of gambling, boasting, and buying rounds" },
  { cost: 300,  bonus: 2, description: "Two days of bar-hopping every establishment worth visiting" },
  { cost: 600,  bonus: 3, description: "Three days of feasting, wagering, and the finest drink coin can buy" },
  { cost: 900,  bonus: 4, description: "A week-long revel that empties the cellars of half the taverns in town" },
  { cost: 1200, bonus: 5, description: "Ten days of celebration that draws crowds and shuts down an entire district" },
  { cost: 1800, bonus: 6, description: "Two weeks of legendary excess spanning a whole city" },
];

const CAROUSE_OUTCOMES: CarouseOutcome[] = [
  { minRoll: 1,  xp: 2, goldLossPercent: 0,  flavor: "You surface the next morning with no memory of where the night went.", sideEffect: null },
  { minRoll: 2,  xp: 2, goldLossPercent: 20, flavor: "A fire you may or may not have started puts you in the stocks for 1d4 days; fined 20% of your wealth.", sideEffect: null },
  { minRoll: 3,  xp: 3, goldLossPercent: 15, flavor: "You come to in an alley, 15% of your wealth unaccounted for.", sideEffect: null },
  { minRoll: 4,  xp: 3, goldLossPercent: 10, flavor: "A silver-tongued priest talked you into donating 10% of your wealth to a worthy cause.", sideEffect: "You gain a priest ally." },
  { minRoll: 5,  xp: 3, goldLossPercent: 10, flavor: "A brawl you started clears the tavern and costs you 10% of your wealth in damages.", sideEffect: "You are barred from a tavern." },
  { minRoll: 6,  xp: 4, goldLossPercent: 5,  flavor: "Quick fingers in the crowd relieved you of 5% of your wealth before you noticed.", sideEffect: null },
  { minRoll: 7,  xp: 4, goldLossPercent: 0,  flavor: "A scathing ballad you composed about a hated noble became the night's anthem.", sideEffect: "You gain a famous bard ally." },
  { minRoll: 8,  xp: 4, goldLossPercent: 0,  flavor: "Pressed into service as the target in a blindfolded blade act, you walked away without a scratch.", sideEffect: "You gain a luck token." },
  { minRoll: 9,  xp: 5, goldLossPercent: 0,  flavor: "A public contest with a rival crawler ended with you on top — by skill or by cunning.", sideEffect: "You gain an NPC ally or enemy." },
  { minRoll: 10, xp: 5, goldLossPercent: 0,  flavor: "A wizard hurled a lethal spell your way; it deflected off your raised cup and vanished.", sideEffect: "You gain a luck token." },
  { minRoll: 11, xp: 5, goldLossPercent: 0,  flavor: "A brazen scheme ended with a corrupt merchant thoroughly embarrassed in front of a crowd.", sideEffect: "You gain a City Watch ally." },
  { minRoll: 12, xp: 5, goldLossPercent: 0,  flavor: "You outdrank a noble in a very public, very expensive contest — and they owe you for it.", sideEffect: "A noble owes you a debt." },
  { minRoll: 13, xp: 6, goldLossPercent: 0,  flavor: "A reckless heist inside a sorcerer's keep somehow went off without getting you killed.", sideEffect: "You gain an 80–100 item from the treasure table." },
  { minRoll: 14, xp: 6, goldLossPercent: 0,  flavor: "Three days later you surface inside the local ruler's fortress, clutching one of their priceless heirlooms. Boots echo in the corridor.", sideEffect: "You gain a 90–100 treasure item — if you escape." },
];

function getOutcome(roll: number): CarouseOutcome {
  // Walk backwards to find the highest minRoll that doesn't exceed roll
  for (let i = CAROUSE_OUTCOMES.length - 1; i >= 0; i--) {
    if (roll >= CAROUSE_OUTCOMES[i].minRoll) return CAROUSE_OUTCOMES[i];
  }
  return CAROUSE_OUTCOMES[0];
}

/** Total wealth in gold pieces (for % loss calculations) */
function totalWealthGp(char: Partial<Character>): number {
  return (char.gold ?? 0) + (char.silver ?? 0) / 10 + (char.copper ?? 0) / 100;
}

type Phase = "victory" | "carousing" | "rolling" | "result" | "done";

interface AdventureCompleteScreenProps {
  summary: string;
  characterName: string;
  rewardDescription?: string;
  character: Partial<Character>;
  onCarouseComplete: (xpGained: number, goldLost: number) => void;
}

export function AdventureCompleteScreen({
  summary,
  characterName,
  rewardDescription,
  character,
  onCarouseComplete,
}: AdventureCompleteScreenProps) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<Phase>("victory");
  const [selectedTier, setSelectedTier] = useState<CarouseTier | null>(null);
  const [animRoll, setAnimRoll] = useState(1);
  const [finalRoll, setFinalRoll] = useState<number | null>(null);
  const [outcome, setOutcome] = useState<CarouseOutcome | null>(null);
  const [xpGained, setXpGained] = useState(0);
  const [goldLost, setGoldLost] = useState(0);
  const [completed, setCompleted] = useState(false);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Clean up animation interval on unmount
  useEffect(() => {
    return () => { if (animRef.current) clearInterval(animRef.current); };
  }, []);

  const currentGold = character.gold ?? 0;

  function handleSkip() {
    if (!completed) {
      setCompleted(true);
      onCarouseComplete(0, 0);
    }
    setPhase("done");
  }

  function handleRoll() {
    if (!selectedTier) return;
    setPhase("rolling");

    const d8 = Math.floor(Math.random() * 8) + 1;
    const total = Math.min(d8 + selectedTier.bonus, 14); // cap at 14+ entry

    let ticks = 0;
    const totalTicks = 18;
    animRef.current = setInterval(() => {
      // Show random rolls during animation, bias toward final value near the end
      const showFinal = ticks >= totalTicks - 3;
      const display = showFinal
        ? total
        : Math.min(Math.floor(Math.random() * 8) + 1 + selectedTier.bonus, 14);
      setAnimRoll(display);
      ticks++;
      if (ticks >= totalTicks) {
        if (animRef.current) clearInterval(animRef.current);
        setAnimRoll(total);
        setFinalRoll(total);

        const result = getOutcome(total);
        const wealth = totalWealthGp(character);
        const percentLoss = Math.floor(wealth * result.goldLossPercent / 100);
        const totalGoldLost = selectedTier.cost + percentLoss;

        setOutcome(result);
        setXpGained(result.xp);
        setGoldLost(totalGoldLost);
        setPhase("result");
      }
    }, 80);
  }

  function handleConfirmResult() {
    if (!completed) {
      setCompleted(true);
      onCarouseComplete(xpGained, goldLost);
    }
    setPhase("done");
  }

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto transition-opacity duration-700 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Background */}
      <div className="fixed inset-0">
        <Image src="/dungeon-background-rattail.webp" alt="" fill className="object-cover" priority />
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 py-12">
        <div className="w-full max-w-lg mx-auto space-y-6">

          {/* ── Phase: Victory ── */}
          {phase === "victory" && (
            <>
              <div className="text-center space-y-2">
                <p className="text-xs uppercase tracking-widest text-stone-500">The adventure concludes</p>
                <h1 className="text-3xl font-bold text-[var(--color-gold)] tracking-widest uppercase">
                  Victory
                </h1>
              </div>

              <div className="bg-stone-950/70 border border-stone-700/50 rounded-lg px-5 py-4">
                <p className="text-stone-300 text-sm leading-relaxed italic whitespace-pre-wrap">
                  {summary}
                </p>
              </div>

              {rewardDescription && (
                <div className="bg-stone-950/70 border border-[var(--color-gold)]/40 rounded-lg px-5 py-4">
                  <p className="text-xs uppercase tracking-widest text-[var(--color-gold)]/70 mb-2">Rewards</p>
                  <p className="text-stone-300 text-sm leading-relaxed">{rewardDescription}</p>
                </div>
              )}

              <div className="border-t border-stone-700/50" />

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setPhase("carousing")}
                  className="w-full bg-stone-900 hover:bg-stone-800 border border-[var(--color-gold)]/60 text-[var(--color-gold)] text-sm font-medium px-4 py-3 rounded-lg transition-colors"
                >
                  Head to the Tavern →
                </button>
                <button
                  onClick={handleSkip}
                  className="w-full bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-400 text-sm px-4 py-3 rounded-lg transition-colors"
                >
                  Skip Carousing
                </button>
              </div>
            </>
          )}

          {/* ── Phase: Carousing ── */}
          {phase === "carousing" && (
            <>
              <div className="text-center space-y-1">
                <p className="text-xs uppercase tracking-widest text-stone-500">Back in town</p>
                <h1 className="text-2xl font-bold text-[var(--color-gold)]">
                  Time to Carouse
                </h1>
                <p className="text-stone-400 text-sm">
                  Spending gold on revelry earns XP. Roll 1d8 + your event bonus.
                </p>
              </div>

              <div className="bg-stone-950/70 border border-stone-700/50 rounded-lg px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs uppercase tracking-widest text-stone-500">Your gold</p>
                  <p className="text-[var(--color-gold)] font-semibold">{currentGold} gp</p>
                </div>
                <div className="space-y-2">
                  {CAROUSE_TIERS.map((tier) => {
                    const canAfford = currentGold >= tier.cost;
                    const isSelected = selectedTier?.cost === tier.cost;
                    return (
                      <button
                        key={tier.cost}
                        onClick={() => canAfford && setSelectedTier(tier)}
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
                            <span className={`text-sm font-semibold ${isSelected ? "text-[var(--color-gold)]" : "text-stone-400"}`}>
                              {tier.cost} gp
                            </span>
                            <span className="block text-xs text-stone-500">
                              +{tier.bonus} to roll
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleRoll}
                  disabled={!selectedTier}
                  className="w-full bg-stone-900 hover:bg-stone-800 border border-[var(--color-gold)]/60 text-[var(--color-gold)] text-sm font-medium px-4 py-3 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {selectedTier
                    ? `Roll 1d8 + ${selectedTier.bonus} →`
                    : "Choose a tier above"}
                </button>
                <button
                  onClick={handleSkip}
                  className="w-full bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-400 text-sm px-4 py-2.5 rounded-lg transition-colors"
                >
                  Skip carousing — head home
                </button>
              </div>
            </>
          )}

          {/* ── Phase: Rolling ── */}
          {phase === "rolling" && (
            <div className="text-center space-y-6 py-8">
              <p className="text-xs uppercase tracking-widest text-stone-500">The dice fall…</p>
              <div className="text-8xl font-bold text-[var(--color-gold)] tabular-nums transition-all">
                {animRoll}
              </div>
              <p className="text-stone-500 text-sm">
                1d8 + {selectedTier?.bonus ?? 0} bonus
              </p>
            </div>
          )}

          {/* ── Phase: Result ── */}
          {phase === "result" && outcome && finalRoll !== null && selectedTier && (
            <>
              <div className="text-center space-y-1">
                <p className="text-xs uppercase tracking-widest text-stone-500">Carousing result</p>
                <div className="flex items-center justify-center gap-3 mt-2">
                  <span className="text-5xl font-bold text-[var(--color-gold)]">{finalRoll}</span>
                  <div className="text-left">
                    <p className="text-stone-400 text-xs">1d8 + {selectedTier.bonus}</p>
                    <p className="text-stone-400 text-xs">{selectedTier.cost} gp spent</p>
                  </div>
                </div>
              </div>

              <div className="bg-stone-950/70 border border-stone-700/50 rounded-lg px-5 py-4 space-y-3">
                <p className="text-stone-300 text-sm leading-relaxed italic">
                  {outcome.flavor}
                </p>
                {outcome.sideEffect && (
                  <p className="text-stone-400 text-sm border-t border-stone-700 pt-3">
                    {outcome.sideEffect}
                  </p>
                )}
              </div>

              <div className="bg-stone-950/70 border border-[var(--color-gold)]/40 rounded-lg px-5 py-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-[var(--color-gold)]/70">XP Gained</span>
                  <span className="text-[var(--color-gold)] font-bold text-lg">+{xpGained} XP</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-stone-500">Gold Spent</span>
                  <span className="text-stone-300 text-sm">
                    {goldLost} gp
                    {goldLost > selectedTier.cost && (
                      <span className="text-stone-500 ml-1">
                        ({selectedTier.cost} + {goldLost - selectedTier.cost} lost)
                      </span>
                    )}
                  </span>
                </div>
              </div>

              <button
                onClick={handleConfirmResult}
                className="w-full bg-stone-900 hover:bg-stone-800 border border-[var(--color-gold)]/60 text-[var(--color-gold)] text-sm font-medium px-4 py-3 rounded-lg transition-colors"
              >
                Continue →
              </button>
            </>
          )}

          {/* ── Phase: Done ── */}
          {phase === "done" && (
            <>
              <div className="text-center space-y-2">
                <p className="text-xs uppercase tracking-widest text-stone-500">Adventure complete</p>
                <h1 className="text-3xl font-bold text-[var(--color-gold)] tracking-widest uppercase">
                  Until Next Time
                </h1>
              </div>

              <div className="border-t border-stone-700/50" />

              <div className="bg-stone-950/70 border border-stone-700/50 rounded-lg px-5 py-4 text-center space-y-1">
                <p className="text-stone-300 text-sm">
                  <span className="text-stone-100 font-medium">{characterName}</span> has been saved to your roster.
                </p>
                {xpGained > 0 && (
                  <p className="text-[var(--color-gold)] text-sm">
                    +{xpGained} XP from carousing added to their record.
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => router.push("/adventures")}
                  className="flex-1 bg-stone-900 hover:bg-stone-800 border border-[var(--color-gold)]/60 text-[var(--color-gold)] text-sm font-medium px-4 py-3 rounded-lg transition-colors"
                >
                  Begin New Adventure
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="flex-1 bg-stone-900 hover:bg-stone-800 border border-stone-600 text-stone-100 text-sm px-4 py-3 rounded-lg transition-colors"
                >
                  Return to Home
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
