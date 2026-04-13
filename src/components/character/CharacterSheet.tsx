"use client";

import { useState } from "react";
import type { Character } from "@/lib/game/types";
import { getCharacterTitle } from "@/lib/game/titles";
import { getAccentColor } from "@/lib/game/classes";
import { AbilityScoreDisplay } from "./AbilityScoreDisplay";
import { HPTracker } from "./HPTracker";
import { InventoryList } from "./InventoryList";
import { SpellList } from "./SpellList";
import { TollMeter } from "./TollMeter";

interface CharacterSheetProps {
  character: Partial<Character>;
  onSpendWyrd?: () => void;
}

/** Gear slots = STR score or 10, whichever is higher. Fighters get +2 (Hauler). */
function calcMaxGearSlots(character: Partial<Character>): number {
  const base = Math.max(character.str ?? 10, 10);
  const hauler = character.class === "Fighter" ? 2 : 0;
  return base + hauler;
}

export function CharacterSheet({ character, onSpendWyrd }: CharacterSheetProps) {
  const [showSpendConfirm, setShowSpendConfirm] = useState(false);

  const accent = getAccentColor(character.specialization);

  const stats = [
    { label: "Strength", abbreviated: "STR", value: character.str },
    { label: "Dexterity", abbreviated: "DEX", value: character.dex },
    { label: "Constitution", abbreviated: "CON", value: character.con },
    { label: "Intelligence", abbreviated: "INT", value: character.int },
    { label: "Wisdom", abbreviated: "WIS", value: character.wis },
    { label: "Charisma", abbreviated: "CHA", value: character.cha },
  ];

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Header */}
      <div className="border-b border-stone-700 pb-6">
        <h2
          className="font-cinzel text-lg font-bold"
          style={{ color: accent.hex }}
        >
          {character.name || "Unnamed Adventurer"}
        </h2>
        <div className="flex gap-2 text-sm text-stone-400 flex-wrap">
          {character.ancestry && <span>{character.ancestry}</span>}
          {(character.specialization || character.class) && (
            <>
              {character.ancestry && <span>&middot;</span>}
              <span style={character.specialization ? { color: accent.hexDim } : undefined}>
                {character.specialization ?? character.class}
              </span>
            </>
          )}
          {character.level !== undefined && (
            <>
              <span>&middot;</span>
              <span>Level {character.level}</span>
            </>
          )}
          {character.alignment && (
            <>
              <span>&middot;</span>
              <span>{character.alignment}</span>
            </>
          )}
        </div>
        {(() => {
          const title = getCharacterTitle(character.class, character.level, character.alignment, character.specialization);
          return title ? <p className="text-xs mt-0.5 italic" style={{ color: accent.hexDim }}>{title}</p> : null;
        })()}
        <div className="flex flex-col gap-0.5 mt-1">
          {character.background && (
            <p className="text-sm text-stone-400">{character.background}</p>
          )}
          {character.languages && character.languages.length > 0 && (
            <p className="text-sm text-stone-400">
              <strong>Languages:</strong> {character.languages.join(", ")}
            </p>
          )}
        </div>
      </div>

      {/* Ability Scores */}
      {character.str !== undefined && (
        <div>
          <h3 className="text-xs uppercase tracking-wider text-stone-400 mb-2">Ability Scores</h3>
          <div className="grid grid-cols-3 gap-2">
            {stats.map(
              (s) =>
                s.value !== undefined && (
                  <AbilityScoreDisplay
                    key={s.abbreviated}
                    label={s.label}
                    abbreviated={s.abbreviated}
                    value={s.value}
                  />
                )
            )}
          </div>
        </div>
      )}

      {/* HP, AC, XP */}
      {(character.hp !== undefined || character.ac !== undefined) && (
        <div className="space-y-2">
          {character.hp !== undefined && character.maxHp !== undefined && (
            <HPTracker current={character.hp} max={character.maxHp} />
          )}
          {(character.ac !== undefined || character.xp !== undefined) && (
            <div className="grid grid-cols-2 gap-2">
              {character.ac !== undefined && (
                <div className="flex flex-col items-center bg-stone-900 border border-stone-700 rounded-lg py-2">
                  <span className="text-[10px] uppercase tracking-wider text-stone-400">AC</span>
                  <span className="text-2xl font-bold text-stone-100">{character.ac}</span>
                </div>
              )}
              {character.xp !== undefined && character.level !== undefined && (
                <div className="flex flex-col items-center bg-stone-900 border border-stone-700 rounded-lg py-2">
                  <span className="text-[10px] uppercase tracking-wider text-stone-400">XP</span>
                  <span className="text-xl font-bold text-stone-100 leading-tight">
                    {character.xp}<span className="text-stone-400 text-sm font-normal">/{character.level * 10}</span>
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Toll Meter — shown when character is a Caster (has spells) */}
      {(character.spells && character.spells.length > 0) || (character.toll !== undefined && character.toll > 0) ? (
        <div>
          <TollMeter toll={character.toll ?? 0} tollPermanent={character.tollPermanent} />
        </div>
      ) : null}

      {/* Wyrd */}
      {character.wyrd !== undefined && (
        <div>
          <div className="flex items-center gap-1 mb-2">
            <h3 className="text-xs uppercase tracking-wider text-amber-600/80">Wyrd</h3>
            <div className="relative group">
              <span className="text-[10px] text-amber-500/80 cursor-help leading-none select-none">ⓘ</span>
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 w-52 bg-stone-800 border border-amber-800/40 rounded-md px-2.5 py-2 text-[10px] text-stone-300 leading-relaxed shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                <p className="font-semibold text-amber-400 mb-1">Wyrd</p>
                <p>Spend your wyrd to reroll any single die — including fate rolls — and take the better result.</p>
                <p className="mt-1 text-stone-400">Earned through downtime activities between adventures.</p>
              </div>
            </div>
          </div>
          <div className="flex items-stretch gap-2">
            <div className="flex flex-col items-center justify-center bg-stone-900 border border-amber-800/40 rounded-lg py-2 flex-1">
              <span className="text-amber-500 text-xs leading-none mb-0.5">★</span>
              <span className={`text-2xl font-bold ${character.wyrd > 0 ? "text-amber-400" : "text-stone-600"}`}>
                {character.wyrd}
              </span>
            </div>
            {onSpendWyrd && (
              <button
                onClick={() => setShowSpendConfirm(true)}
                disabled={!character.wyrd || character.wyrd <= 0}
                className="text-xs px-3 rounded border border-amber-700/50 text-amber-500 hover:bg-amber-900/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Spend
              </button>
            )}
          </div>
        </div>
      )}

      {/* Wyrd Spend Confirmation Modal */}
      {showSpendConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-stone-900 border border-amber-800/50 rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-amber-400 text-lg">★</span>
              <h3 className="font-cinzel text-base font-bold text-amber-400">Spend Wyrd?</h3>
            </div>
            <p className="text-sm text-stone-300 mb-2">
              This token will be permanently removed from your inventory.
            </p>
            <p className="text-sm text-stone-400 mb-5">
              You may reroll any single die result — including fate rolls — and take the better outcome.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowSpendConfirm(false)}
                className="text-sm px-4 py-1.5 rounded border border-stone-700 text-stone-400 hover:bg-stone-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowSpendConfirm(false);
                  onSpendWyrd?.();
                }}
                className="text-sm px-4 py-1.5 rounded border border-amber-700/60 bg-amber-900/30 text-amber-400 hover:bg-amber-900/50 transition-colors"
              >
                Spend Wyrd
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Equipment (spells injected between weapons and gear) */}
      {character.equipment && character.equipment.length > 0 ? (
        <InventoryList
          items={character.equipment}
          gold={character.gold}
          silver={character.silver}
          copper={character.copper}
          maxSlots={calcMaxGearSlots(character)}
          afterWeapons={
            character.spells && character.spells.length > 0
              ? <SpellList spells={character.spells} />
              : undefined
          }
        />
      ) : (
        character.spells && character.spells.length > 0 && (
          <SpellList spells={character.spells} />
        )
      )}

      {/* Talents */}
      {character.talents && character.talents.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-wider text-stone-400 mb-2">Talents</h3>
          <ul className="space-y-1">
            {character.talents.map((t, i) => (
              <li key={i} className="text-sm text-stone-300 bg-stone-900 rounded px-3 py-1.5 border border-stone-800">
                {typeof t === "string"
                  ? t
                  : (t as { name?: string; description?: string }).name ?? JSON.stringify(t)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
