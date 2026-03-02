"use client";

import { useState } from "react";
import type { Companion } from "@/lib/game/types";

interface CompanionPanelProps {
  companions: Companion[];
}

const DISPOSITION_COLORS: Record<string, string> = {
  loyal: "text-emerald-400",
  friendly: "text-green-400",
  neutral: "text-stone-400",
  suspicious: "text-yellow-500",
  hostile: "text-red-500",
};

const RISK_LABELS: Record<string, string> = {
  reckless: "Reckless",
  bold: "Bold",
  cautious: "Cautious",
  cowardly: "Cowardly",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-900/50 text-emerald-400 border-emerald-800/50",
  incapacitated: "bg-yellow-900/50 text-yellow-400 border-yellow-800/50",
  hostile: "bg-red-900/50 text-red-400 border-red-800/50",
  departed: "bg-stone-800 text-stone-500 border-stone-700",
  dead: "bg-stone-800 text-stone-500 border-stone-700",
};

function hpColor(hp: number, maxHp: number): string {
  const pct = maxHp > 0 ? hp / maxHp : 0;
  if (pct > 0.5) return "bg-emerald-600";
  if (pct > 0.25) return "bg-yellow-600";
  return "bg-red-700";
}

function mod(score: number): string {
  const m = Math.floor((score - 10) / 2);
  return m >= 0 ? `+${m}` : `${m}`;
}

function LoyaltyPips({ loyalty }: { loyalty: number }) {
  return (
    <div className="flex gap-0.5 items-center" aria-label={`Loyalty: ${loyalty} out of 10`}>
      {Array.from({ length: 10 }, (_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={`inline-block w-2 h-2 rounded-full ${
            i < loyalty ? "bg-[var(--color-gold)]" : "bg-stone-700"
          }`}
        />
      ))}
    </div>
  );
}

function CompanionCard({ companion }: { companion: Companion }) {
  const [expanded, setExpanded] = useState(false);
  const hpPct = companion.maxHp > 0 ? (companion.hp / companion.maxHp) * 100 : 0;

  return (
    <div className="border border-stone-700 rounded-md overflow-hidden">
      {/* Header row */}
      <button
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-stone-800/50 transition-colors"
      >
        <span className="flex items-center gap-2">
          <span className="text-sm text-stone-100 font-medium">{companion.name}</span>
          <span
            className={`text-xs px-1.5 py-0.5 rounded border ${STATUS_COLORS[companion.status] ?? STATUS_COLORS.active}`}
          >
            {companion.status}
          </span>
        </span>
        <span aria-hidden="true" className="text-stone-500 text-xs">{expanded ? "▲" : "▼"}</span>
      </button>

      {/* HP bar (always visible) */}
      <div className="h-1 bg-stone-800">
        <div
          className={`h-full transition-all ${hpColor(companion.hp, companion.maxHp)}`}
          style={{ width: `${hpPct}%` }}
        />
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-3 py-2 space-y-2 bg-stone-900/50 text-xs text-stone-300">
          {/* Level / ancestry / class */}
          <div className="text-stone-400">
            Level {companion.level} {companion.ancestry} {companion.class} | AC {companion.ac}
          </div>

          {/* HP */}
          <div>
            HP: <span className="text-stone-100">{companion.hp}/{companion.maxHp}</span>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-1 font-mono text-center">
            {(["str", "dex", "con", "int", "wis", "cha"] as const).map((stat) => (
              <div key={stat} className="bg-stone-800 rounded px-1 py-0.5">
                <div className="text-stone-500 text-[10px] uppercase">{stat}</div>
                <div className="text-stone-200 text-xs">
                  {companion[stat]} <span className="text-stone-400">({mod(companion[stat])})</span>
                </div>
              </div>
            ))}
          </div>

          {/* Equipment */}
          {(companion.equipment?.length ?? 0) > 0 && (
            <div className="pt-1 border-t border-stone-700 space-y-0.5">
              <div className="text-stone-500 text-[10px] uppercase tracking-wider mb-1">Equipment</div>
              {companion.equipment.map((item, i) => (
                <div key={i} className="flex items-baseline justify-between gap-2">
                  <span className="text-stone-300">{item.name}</span>
                  {item.damage && (
                    <span className="text-stone-500 font-mono shrink-0">{item.damage}</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Spells */}
          {(companion.spells?.length ?? 0) > 0 && (
            <div className="pt-1 border-t border-stone-700 space-y-0.5">
              <div className="text-stone-500 text-[10px] uppercase tracking-wider mb-1">Spells</div>
              {companion.spells.map((spell, i) => (
                <div key={i} className="flex items-baseline justify-between gap-2">
                  <span className="text-stone-300">{spell.name}</span>
                  <span className="text-stone-500 font-mono shrink-0">T{spell.tier}</span>
                </div>
              ))}
            </div>
          )}

          {/* Personality */}
          {companion.personality && (
            <div className="space-y-1 pt-1 border-t border-stone-700">
              <div className="flex flex-wrap gap-1">
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-medium bg-stone-800 ${
                    DISPOSITION_COLORS[companion.personality.dispositionTowardPlayer] ?? "text-stone-400"
                  }`}
                >
                  {companion.personality.dispositionTowardPlayer}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-stone-800 text-stone-400">
                  {RISK_LABELS[companion.personality.riskTolerance]}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-stone-800 text-stone-400">
                  {companion.personality.followership}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-stone-500">Loyalty</span>
                <LoyaltyPips loyalty={companion.personality.loyalty} />
                <span className="text-stone-500 ml-auto">{companion.personality.loyalty}/10</span>
              </div>
              <div className="italic text-stone-400 leading-snug">
                {companion.personality.motivation}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function CompanionPanel({ companions }: CompanionPanelProps) {
  const [collapsed, setCollapsed] = useState(false);

  const visible = companions.filter(
    (c) => c.status !== "dead" && c.status !== "departed" && c.status !== "hostile",
  );

  if (visible.length === 0) return null;

  return (
    <div className="bg-stone-900 border border-stone-700 rounded-lg p-3 space-y-2">
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="w-full flex items-center justify-between"
      >
        <h3 className="text-xs uppercase tracking-wider text-stone-400">Companions</h3>
        <span className="flex items-center gap-1.5">
          <span className="text-xs text-stone-500 bg-stone-800 px-1.5 py-0.5 rounded-full">
            {visible.length}
          </span>
          <span className="text-stone-500 text-xs">{collapsed ? "▼" : "▲"}</span>
        </span>
      </button>

      {!collapsed && (
        <div className="space-y-2">
          {visible.map((c) => (
            <CompanionCard key={c.id ?? c.name} companion={c} />
          ))}
        </div>
      )}
    </div>
  );
}
