"use client";

import type { WorldState } from "@/lib/game/types";

interface WorldConditionsProps {
  worldState?: Partial<WorldState>;
}

const TIME_GLYPHS: Record<string, string> = {
  dawn: "◑",
  morning: "○",
  "mid-morning": "○",
  noon: "●",
  afternoon: "●",
  "late afternoon": "◐",
  dusk: "◐",
  evening: "◑",
  "late evening": "◑",
  midnight: "◉",
  "deep night": "◉",
};

function timeGlyph(timeOfDay: string): string {
  const lower = timeOfDay.toLowerCase();
  for (const [key, glyph] of Object.entries(TIME_GLYPHS)) {
    if (lower.includes(key)) return glyph;
  }
  // Underground / lost time
  return "?";
}

function isTimeUnknown(timeOfDay: string): boolean {
  const lower = timeOfDay.toLowerCase();
  return lower.includes("lost") || lower.includes("unknown") || lower.includes("cannot") || lower.includes("passed");
}

export function WorldConditions({ worldState }: WorldConditionsProps) {
  const { timeOfDay, currentDate, weather, undergroundTurns } = worldState ?? {};

  if (!timeOfDay && !currentDate && !weather) return null;

  const underground = (undergroundTurns ?? 0) > 0;
  const timeUnknown = timeOfDay ? isTimeUnknown(timeOfDay) : false;

  return (
    <div className="bg-stone-900 border border-stone-700 rounded-lg p-3 space-y-2">
      <h3 className="text-xs uppercase tracking-wider text-stone-400">Conditions</h3>

      <div className="space-y-1.5 text-xs">
        {/* Time */}
        {timeOfDay && (
          <div className="flex items-center gap-2">
            <span className={`font-mono text-sm leading-none ${timeUnknown ? "text-stone-600" : "text-stone-300"}`}>
              {timeGlyph(timeOfDay)}
            </span>
            <span className={timeUnknown ? "text-stone-400 italic" : "text-stone-200"}>
              {timeOfDay}
            </span>
          </div>
        )}

        {/* Date */}
        {currentDate && (
          <div className="flex items-start gap-2">
            <span className="text-stone-600 font-mono text-sm leading-none mt-px">⊕</span>
            <span className={`leading-snug ${underground && !timeOfDay ? "text-stone-400 italic" : "text-stone-400"}`}>
              {currentDate}
            </span>
          </div>
        )}

        {/* Weather */}
        {weather && !underground && (
          <div className="flex items-start gap-2">
            <span className="text-stone-600 font-mono text-sm leading-none mt-px">≋</span>
            <span className="text-stone-300 leading-snug">{weather}</span>
          </div>
        )}
        {underground && (
          <div className="flex items-center gap-2">
            <span className="text-stone-600 font-mono text-sm leading-none">≋</span>
            <span className="text-stone-600 italic">Weather unknown</span>
          </div>
        )}
      </div>
    </div>
  );
}
