import Link from "next/link";

interface DonePhaseProps {
  characterName: string;
  levelUpNewLevel: number;
  xpGained: number;
  campaignType?: "standard" | "oneshot";
  campaignId?: string;
  onNewAdventure: () => void;
  onHome: () => void;
}

export function DonePhase({
  characterName,
  levelUpNewLevel,
  xpGained,
  campaignType,
  campaignId,
  onNewAdventure,
  onHome,
}: DonePhaseProps) {
  const isOneshot = campaignType === "oneshot";

  return (
    <>
      <div className="text-center space-y-2">
        <p className="text-xs uppercase tracking-widest text-stone-400">
          {isOneshot ? "Adventure complete" : "Session complete"}
        </p>
        <h1 className="text-3xl font-bold text-[var(--color-gold)] tracking-widest uppercase">
          Until Next Time
        </h1>
      </div>

      <div className="border-t border-stone-700/50" />

      <div className="bg-stone-950/70 border border-stone-700/50 rounded-lg px-5 py-4 text-center space-y-1">
        <p className="text-stone-300 text-sm">
          <span className="text-stone-100 font-medium">{characterName}</span>{" "}
          {isOneshot ? "has been saved to your roster." : "rests. The adventure continues when you return."}
        </p>
        {levelUpNewLevel > 0 && (
          <p className="text-[var(--color-gold)] text-sm font-medium">
            Advanced to Level {levelUpNewLevel}!
          </p>
        )}
        {xpGained > 0 && (
          <p className="text-[var(--color-gold)] text-sm">
            +{xpGained} XP from carousing
            {levelUpNewLevel > 0 ? " (XP reset after level-up)" : " added to their record"}.
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {isOneshot ? (
          <button
            onClick={onNewAdventure}
            className="flex-1 bg-stone-900 hover:bg-stone-800 border border-[var(--color-gold)]/60 text-[var(--color-gold)] text-sm font-medium px-4 py-3 rounded-lg transition-colors"
          >
            Begin New Adventure
          </button>
        ) : (
          campaignId ? (
            <Link
              href={`/play/${campaignId}`}
              className="flex-1 bg-stone-900 hover:bg-stone-800 border border-[var(--color-gold)]/60 text-[var(--color-gold)] text-sm font-medium px-4 py-3 rounded-lg transition-colors text-center"
            >
              Resume Adventure
            </Link>
          ) : (
            <button
              onClick={onHome}
              className="flex-1 bg-stone-900 hover:bg-stone-800 border border-[var(--color-gold)]/60 text-[var(--color-gold)] text-sm font-medium px-4 py-3 rounded-lg transition-colors"
            >
              Return to Home
            </button>
          )
        )}
        <button
          onClick={onHome}
          className="flex-1 bg-stone-900 hover:bg-stone-800 border border-stone-600 text-stone-100 text-sm px-4 py-3 rounded-lg transition-colors"
        >
          Return to Home
        </button>
      </div>
    </>
  );
}
