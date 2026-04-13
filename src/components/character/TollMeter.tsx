"use client";

interface TollMeterProps {
  toll: number;
  tollPermanent?: number;
}

type TollBand = {
  label: string;
  min: number;
  max: number;
  barColor: string;
  textColor: string;
};

const TOLL_BANDS: TollBand[] = [
  { label: "Clear",      min: 0,  max: 4,  barColor: "bg-emerald-500", textColor: "text-emerald-400" },
  { label: "Strained",   min: 5,  max: 9,  barColor: "bg-amber-400",   textColor: "text-amber-400"   },
  { label: "Fraying",    min: 10, max: 14, barColor: "bg-orange-500",  textColor: "text-orange-400"  },
  { label: "Unraveling", min: 15, max: 20, barColor: "bg-red-600",     textColor: "text-red-400"     },
];

function getTollBand(toll: number): TollBand {
  return TOLL_BANDS.find((b) => toll >= b.min && toll <= b.max) ?? TOLL_BANDS[0];
}

export function TollMeter({ toll, tollPermanent = 0 }: TollMeterProps) {
  const clamped = Math.max(0, Math.min(20, toll));
  const band = getTollBand(clamped);
  const pct = (clamped / 20) * 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <h3 className="text-xs uppercase tracking-wider text-stone-400">Toll</h3>
        <span className={`text-xs font-medium ${band.textColor}`}>
          {band.label} · {clamped}/20
        </span>
      </div>

      {/* Bar */}
      <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${band.barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Band boundary ticks */}
      <div className="relative mt-0.5 h-1.5">
        {[5, 10, 15].map((v) => (
          <div
            key={v}
            className="absolute w-px h-1.5 bg-stone-600"
            style={{ left: `${(v / 20) * 100}%` }}
          />
        ))}
      </div>

      {tollPermanent > 0 && (
        <p className="text-xs text-red-400/80 mt-1.5">
          +{tollPermanent} permanent (against the grain)
        </p>
      )}
    </div>
  );
}
