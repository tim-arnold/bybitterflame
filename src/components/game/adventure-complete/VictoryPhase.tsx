interface VictoryPhaseProps {
  summary: string;
  rewardDescription?: string;
  onProceed: () => void;
  onSkip: () => void;
}

export function VictoryPhase({ summary, rewardDescription, onProceed, onSkip }: VictoryPhaseProps) {
  return (
    <>
      <div className="text-center space-y-2">
        <p className="text-xs uppercase tracking-widest text-stone-400">The adventure concludes</p>
        <h1 className="text-3xl font-bold text-[var(--color-gold)] tracking-widest uppercase">
          Victory
        </h1>
      </div>

      <div className="bg-stone-950/70 border border-stone-700/50 rounded-lg px-5 py-4">
        <p className="text-stone-300 text-sm leading-relaxed italic whitespace-pre-wrap">{summary}</p>
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
          onClick={onProceed}
          className="w-full bg-stone-900 hover:bg-stone-800 border border-[var(--color-gold)]/60 text-[var(--color-gold)] text-sm font-medium px-4 py-3 rounded-lg transition-colors"
        >
          Carouse &amp; Earn XP →
        </button>
        <button
          onClick={onSkip}
          className="w-full bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-400 text-sm px-4 py-3 rounded-lg transition-colors"
        >
          Skip Carousing
        </button>
      </div>
    </>
  );
}
