"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { Character, Companion } from "@/lib/game/types";

interface DeathData {
  causeOfDeath: string;
  legacyTalent?: string;
  killedByCompanionId?: string | null;
  deathNarrative?: string;
  companionsAtDeath?: Companion[];
}

interface DeathScreenProps {
  deadCharacter: Partial<Character>;
  companions: Companion[];
  deathData: DeathData;
  onInherit: (companionId: string) => void;
  onCampaignEnd: () => void;
}

export function DeathScreen({
  deadCharacter,
  companions,
  deathData,
  onInherit,
  onCampaignEnd,
}: DeathScreenProps) {
  const [visible, setVisible] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Use companions captured at death time; fall back to live prop
  const companionList = deathData.companionsAtDeath ?? companions;
  const activeCompanions = companionList.filter(
    (c) => !c.status || c.status === "active" || c.status === "incapacitated",
  );

  const forcedCompanion = deathData.killedByCompanionId
    ? companionList.find((c) => c.id === deathData.killedByCompanionId)
    : null;

  function handleConfirm() {
    if (forcedCompanion) {
      onInherit(forcedCompanion.id);
    } else if (selectedId) {
      onInherit(selectedId);
    }
  }

  const dispositionColor: Record<string, string> = {
    loyal: "text-emerald-400",
    friendly: "text-green-400",
    neutral: "text-stone-400",
    suspicious: "text-yellow-500",
    hostile: "text-red-500",
  };

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto transition-opacity duration-700 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Background image */}
      <div className="fixed inset-0">
        <Image src="/bg-woodcut.webp" alt="" fill className="object-cover" priority />
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 py-12">
        <div className="w-full max-w-lg mx-auto space-y-6">

          {/* Soul transfer header */}
          <div className="text-center space-y-3">
            <h1 className="text-2xl font-bold text-stone-200 tracking-widest uppercase">
              Something Lingers
            </h1>
            <p className="text-stone-400 text-sm leading-relaxed max-w-sm mx-auto">
              {deadCharacter.name}&apos;s body is gone, but something of them persists — a thread of will,
              too stubborn to unravel. It drifts toward those who fought at their side.
            </p>
          </div>

          <div className="border-t border-stone-700/50" />

          {/* Forced inherit — killed by companion */}
          {forcedCompanion ? (
            <div className="space-y-4 text-center">
              <p className="text-stone-300 text-sm leading-relaxed">
                The soul of {deadCharacter.name} finds no willing vessel — only{" "}
                <span className="text-red-400 font-semibold">{forcedCompanion.name}</span>,
                whose blade ended them. Bound by violence, the soul has no choice.
              </p>
              {deathData.legacyTalent && (
                <div className="bg-stone-900/80 border border-[var(--color-gold)]/40 rounded-lg px-4 py-3">
                  <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">Carried Forward</p>
                  <p className="text-[var(--color-gold)] text-sm">{deathData.legacyTalent}</p>
                </div>
              )}
              <button
                onClick={() => onInherit(forcedCompanion.id)}
                className="w-full bg-stone-800 hover:bg-stone-700 border border-stone-600 text-stone-100 text-sm px-4 py-3 rounded-lg transition-colors"
              >
                Pass into {forcedCompanion.name}
              </button>
            </div>

          ) : activeCompanions.length > 0 ? (
            <div className="space-y-4">
              <p className="text-center text-stone-300 text-sm">
                Choose whose body carries {deadCharacter.name}&apos;s soul forward.
              </p>

              {deathData.legacyTalent && (
                <div className="bg-stone-900/80 border border-[var(--color-gold)]/40 rounded-lg px-4 py-3">
                  <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">Carried Forward</p>
                  <p className="text-[var(--color-gold)] text-sm">{deathData.legacyTalent}</p>
                  <p className="text-xs text-stone-500 mt-1">This fragment of {deadCharacter.name} passes to whoever you choose.</p>
                </div>
              )}

              <div className="space-y-2">
                {activeCompanions.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                      selectedId === c.id
                        ? "border-[var(--color-gold)] bg-stone-900/90"
                        : "border-stone-700 bg-stone-900/60 hover:border-stone-500"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-stone-100 font-medium text-sm">{c.name}</span>
                      <span className={`text-xs ${dispositionColor[c.personality.dispositionTowardPlayer] ?? "text-stone-400"}`}>
                        {c.personality.dispositionTowardPlayer}
                      </span>
                    </div>
                    <div className="text-stone-400 text-xs mt-0.5">
                      Level {c.level} {c.ancestry} {c.class} · Loyalty {c.personality.loyalty}/10
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={handleConfirm}
                disabled={!selectedId}
                className="w-full bg-stone-800 hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed border border-stone-600 text-stone-100 text-sm px-4 py-3 rounded-lg transition-colors"
              >
                {selectedId
                  ? `Pass into ${activeCompanions.find((c) => c.id === selectedId)?.name ?? ""} →`
                  : "Choose a vessel"}
              </button>
            </div>

          ) : (
            <div className="text-center space-y-4">
              <p className="text-stone-400 text-sm italic">
                There is no one left to carry the thread. {deadCharacter.name}&apos;s soul dissolves into the dark.
              </p>
              <button
                onClick={onCampaignEnd}
                className="bg-stone-800 hover:bg-stone-700 border border-stone-600 text-stone-100 text-sm px-6 py-3 rounded-lg transition-colors"
              >
                Return to Home
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
