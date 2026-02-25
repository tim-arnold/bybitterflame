"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { Character, Companion } from "@/lib/game/types";

interface DeathData {
  causeOfDeath: string;
  legacyTalent?: string;
  killedByCompanionId?: string | null;
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
    // Fade in on mount
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const activeCompanions = companions.filter(
    (c) => c.status === "active" || c.status === "incapacitated",
  );

  const forcedCompanion = deathData.killedByCompanionId
    ? companions.find((c) => c.id === deathData.killedByCompanionId)
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
      className={`fixed inset-0 z-50 transition-opacity duration-700 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/cover.png"
          alt="Death screen"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/85" />

      {/* Content panel */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-lg space-y-6">
          {/* Death header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-stone-100 tracking-widest uppercase">
              {deadCharacter.name ?? "Your character"} has fallen.
            </h1>
            <p className="text-stone-400 italic text-sm">{deathData.causeOfDeath}</p>
          </div>

          {/* Forced inherit — killed by companion */}
          {forcedCompanion ? (
            <div className="space-y-4 text-center">
              <p className="text-stone-300 text-sm">
                You were slain by{" "}
                <span className="text-red-400 font-semibold">{forcedCompanion.name}</span>.
                Their will is now yours.
              </p>
              {deathData.legacyTalent && (
                <div className="bg-stone-900/80 border border-[var(--color-gold)]/40 rounded-lg px-4 py-3">
                  <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Legacy Talent</p>
                  <p className="text-[var(--color-gold)] text-sm">{deathData.legacyTalent}</p>
                </div>
              )}
              <button
                onClick={() => onInherit(forcedCompanion.id)}
                className="w-full bg-stone-800 hover:bg-stone-700 border border-stone-600 text-stone-100 text-sm px-4 py-3 rounded-lg transition-colors"
              >
                Continue as {forcedCompanion.name}
              </button>
            </div>
          ) : activeCompanions.length > 0 ? (
            /* Choose a companion */
            <div className="space-y-4">
              <p className="text-center text-stone-300 text-sm">Choose who carries your legacy.</p>

              {deathData.legacyTalent && (
                <div className="bg-stone-900/80 border border-[var(--color-gold)]/40 rounded-lg px-4 py-3">
                  <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Legacy Talent</p>
                  <p className="text-[var(--color-gold)] text-sm">{deathData.legacyTalent}</p>
                </div>
              )}

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
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
                      <span
                        className={`text-xs ${dispositionColor[c.personality.dispositionTowardPlayer] ?? "text-stone-400"}`}
                      >
                        {c.personality.dispositionTowardPlayer}
                      </span>
                    </div>
                    <div className="text-stone-500 text-xs mt-0.5">
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
                  ? `Carry ${activeCompanions.find((c) => c.id === selectedId)?.name ?? ""}'s legacy →`
                  : "Select a companion"}
              </button>
            </div>
          ) : (
            /* No companions */
            <div className="text-center space-y-4">
              <p className="text-stone-400 text-sm italic">Your adventure ends here.</p>
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
