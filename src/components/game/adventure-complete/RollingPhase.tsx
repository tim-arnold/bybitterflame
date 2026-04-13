interface RollingPhaseProps {
  animRoll: number;
  tierBonus: number;
}

export function RollingPhase({ animRoll, tierBonus }: RollingPhaseProps) {
  return (
    <div className="text-center space-y-6 py-8">
      <p className="text-xs uppercase tracking-widest text-stone-400">The dice fall…</p>
      <div className="text-8xl font-bold text-[var(--color-gold)] tabular-nums transition-all">
        {animRoll}
      </div>
      <p className="text-stone-400 text-sm">1d10 + {tierBonus} bonus</p>
    </div>
  );
}
