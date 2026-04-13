import type { Character, Companion } from "@/lib/game/types";
import { formatStatMod } from "@/lib/game/ability-utils";

/**
 * Build a concise character stats block for injection into the session prompt.
 */
export function buildCharacterBlock(character: Partial<Character>): string {
  if (!character || !character.name) {
    return "No character loaded.";
  }

  return `**${character.name}** (${character.pronouns ?? "they/them"}) — Level ${character.level ?? 1} ${character.ancestry ?? ""} ${character.class ?? ""}
Alignment: ${character.alignment ?? "Unknown"} | Background: ${character.background ?? "Unknown"}
HP: ${character.hp ?? "?"}/${character.maxHp ?? "?"} | AC: ${character.ac ?? "?"} | XP: ${character.xp ?? 0}/${(character.level ?? 1) * 10}
STR: ${character.str ?? "?"} (${formatStatMod(character.str)}) | DEX: ${character.dex ?? "?"} (${formatStatMod(character.dex)}) | CON: ${character.con ?? "?"} (${formatStatMod(character.con)})
INT: ${character.int ?? "?"} (${formatStatMod(character.int)}) | WIS: ${character.wis ?? "?"} (${formatStatMod(character.wis)}) | CHA: ${character.cha ?? "?"} (${formatStatMod(character.cha)})
Gold: ${character.gold ?? 0}${character.wyrd !== undefined ? `\nWyrd: ${character.wyrd}` : ""}
Equipment: ${JSON.stringify(character.equipment ?? [])}
Spells: ${JSON.stringify(character.spells ?? [])}
Talents: ${JSON.stringify(character.talents ?? [])}`;
}

/**
 * Build the companion roster block for injection into the session prompt.
 * Returns an empty string when no active companions exist.
 */
export function buildCompanionBlock(companions: Companion[]): string {
  const active = companions.filter((c) => c.status !== "dead" && c.status !== "departed");
  if (active.length === 0) return "";

  const lines = active.map((c) => {
    return `**${c.name}** (${c.pronouns}) [id: ${c.id}] — Level ${c.level} ${c.ancestry} ${c.class} | Status: ${c.status}
  HP: ${c.hp}/${c.maxHp} | AC: ${c.ac}
  STR: ${c.str} (${formatStatMod(c.str)}) | DEX: ${c.dex} (${formatStatMod(c.dex)}) | CON: ${c.con} (${formatStatMod(c.con)})
  INT: ${c.int} (${formatStatMod(c.int)}) | WIS: ${c.wis} (${formatStatMod(c.wis)}) | CHA: ${c.cha} (${formatStatMod(c.cha)})
  Talents: ${c.talents?.join(", ") || "none"}
  Voice: ${c.personality?.voice ?? "unknown"}
  Disposition: ${c.personality?.dispositionTowardPlayer ?? "neutral"} | Risk: ${c.personality?.riskTolerance ?? "bold"} | Followership: ${c.personality?.followership ?? "follows"} | Loyalty: ${c.personality?.loyalty ?? 5}/10
  Motivation: ${c.personality?.motivation ?? "unknown"}
  Red Lines: ${c.personality?.redLines ?? "unknown"}`;
  });

  return `\n## Current Companions\n${lines.join("\n\n")}`;
}
