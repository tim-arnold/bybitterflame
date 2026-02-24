"use client";

interface HPTrackerProps {
  current: number;
  max: number;
}

export function HPTracker({ current, max }: HPTrackerProps) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;

  let barColor = "bg-green-600";
  if (pct <= 25) barColor = "bg-red-600";
  else if (pct <= 50) barColor = "bg-yellow-600";

  return (
    <div className="flex flex-col items-center bg-stone-900 border border-stone-700 rounded-lg p-3 min-w-[100px]">
      <span className="text-[10px] uppercase tracking-wider text-stone-500">Hit Points</span>
      <span className="text-2xl font-bold text-stone-100">
        {current}<span className="text-sm text-stone-500">/{max}</span>
      </span>
      <div className="w-full h-1.5 bg-stone-800 rounded-full mt-1.5">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
