"use client";

import type { Character } from "@/lib/game/types";
import { AbilityScoreDisplay } from "./AbilityScoreDisplay";
import { HPTracker } from "./HPTracker";
import { InventoryList } from "./InventoryList";
import { SpellList } from "./SpellList";

interface CharacterSheetProps {
  character: Partial<Character>;
}

export function CharacterSheet({ character }: CharacterSheetProps) {
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
      <div className="border-b border-stone-700 pb-3">
        <h2 className="text-lg font-bold text-[var(--color-gold)]">
          {character.name || "Unnamed Adventurer"}
        </h2>
        <div className="flex gap-2 text-sm text-stone-400 flex-wrap">
          {character.ancestry && <span>{character.ancestry}</span>}
          {character.class && (
            <>
              {character.ancestry && <span>&middot;</span>}
              <span>{character.class}</span>
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
        {character.background && (
          <p className="text-xs text-stone-500 mt-1">{character.background}</p>
        )}
      </div>

      {/* HP and AC */}
      {(character.hp !== undefined || character.ac !== undefined) && (
        <div className="flex gap-4">
          {character.hp !== undefined && character.maxHp !== undefined && (
            <HPTracker current={character.hp} max={character.maxHp} />
          )}
          {character.ac !== undefined && (
            <div className="flex flex-col items-center bg-stone-900 border border-stone-700 rounded-lg p-3 min-w-[70px]">
              <span className="text-[10px] uppercase tracking-wider text-stone-500">AC</span>
              <span className="text-2xl font-bold text-stone-100">{character.ac}</span>
            </div>
          )}
          {character.xp !== undefined && (
            <div className="flex flex-col items-center bg-stone-900 border border-stone-700 rounded-lg p-3 min-w-[70px]">
              <span className="text-[10px] uppercase tracking-wider text-stone-500">XP</span>
              <span className="text-2xl font-bold text-stone-100">{character.xp}</span>
            </div>
          )}
        </div>
      )}

      {/* Ability Scores */}
      {character.str !== undefined && (
        <div>
          <h3 className="text-xs uppercase tracking-wider text-stone-500 mb-2">Ability Scores</h3>
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

      {/* Equipment */}
      {character.equipment && character.equipment.length > 0 && (
        <InventoryList
          items={character.equipment.map((e) => typeof e === "string" ? e : e.name)}
          gold={character.gold}
        />
      )}

      {/* Spells */}
      {character.spells && character.spells.length > 0 && (
        <SpellList
          spells={character.spells.map((s) => typeof s === "string" ? s : s.name)}
        />
      )}

      {/* Talents */}
      {character.talents && character.talents.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-wider text-stone-500 mb-2">Talents</h3>
          <ul className="space-y-1">
            {character.talents.map((t, i) => (
              <li key={i} className="text-sm text-stone-300 bg-stone-900 rounded px-3 py-1.5 border border-stone-800">
                {t}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
