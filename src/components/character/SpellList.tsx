"use client";

import { useState } from "react";
import type { Spell } from "@/lib/game/types";

interface SpellListProps {
  spells: (Spell | string)[];
}

function normalize(spell: Spell | string): Spell {
  if (typeof spell === "string") return { name: spell, tier: 1, range: "", duration: "", description: "" };
  return spell;
}

function SpellRow({ spell }: { spell: Spell | string }) {
  const [open, setOpen] = useState(false);
  const s = normalize(spell);
  const hasDetails = s.description || s.range || s.duration;
  // Cast DC = 10 + spell tier
  const castDc = 10 + (s.tier ?? 1);

  return (
    <li className="bg-stone-900 rounded border border-stone-800 overflow-hidden">
      <button
        onClick={() => hasDetails && setOpen((o) => !o)}
        className={`w-full flex items-center gap-2 px-3 py-1.5 text-left ${hasDetails ? "cursor-pointer hover:bg-stone-800/60 transition-colors" : "cursor-default"}`}
      >
        <span className="text-purple-400 shrink-0">&#x2726;</span>
        <span className="text-sm text-stone-300 flex-1 min-w-0">{s.name}</span>
        <span className="text-[10px] text-stone-500 shrink-0">T{s.tier} · DC {castDc}</span>
        {hasDetails && (
          <svg
            className={`w-3.5 h-3.5 text-stone-500 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {open && hasDetails && (
        <div className="px-3 pb-2.5 pt-1 border-t border-stone-800 space-y-1.5">
          {(s.range || s.duration) && (
            <div className="flex gap-4">
              {s.range && (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-stone-500">Range</span>
                  <span className="text-xs text-stone-400">{s.range}</span>
                </div>
              )}
              {s.duration && (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-stone-500">Duration</span>
                  <span className="text-xs text-stone-400">{s.duration}</span>
                </div>
              )}
            </div>
          )}
          {s.description && (
            <p className="text-xs text-stone-400 leading-relaxed">{s.description}</p>
          )}
        </div>
      )}
    </li>
  );
}

export function SpellList({ spells }: SpellListProps) {
  return (
    <div>
      <h3 className="text-xs uppercase tracking-wider text-stone-500 mb-2">Spells</h3>
      <ul className="space-y-1">
        {spells.map((spell, i) => (
          <SpellRow key={i} spell={spell} />
        ))}
      </ul>
    </div>
  );
}