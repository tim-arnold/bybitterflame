import type { Character, Companion } from "@/lib/game/types";
export { getStatMod } from "./ability-utils";

export function shouldLevelUp(xp: number, level: number): boolean {
  return level < 10 && xp >= level * 10;
}

/** Class hit die sides */
export function getHitDie(characterClass: string): number {
  if (characterClass === "Fighter") return 8;
  if (characterClass === "Rogue") return 6;
  return 4; // Caster
}

/** Talent roll happens at odd levels 3, 5, 7, 9 (not level 1) */
export function isOddLevel(level: number): boolean {
  return level >= 3 && level % 2 === 1;
}

// Caster spells known per level: [Cantrips, T1 Neutral, T2 Path, T3 Path, T4 Path, T5 Path]
const CASTER_SPELLS_KNOWN: number[][] = [
  [3, 4, 0, 0, 0, 0], // level 1
  [3, 6, 0, 0, 0, 0], // level 2
  [3, 6, 2, 0, 0, 0], // level 3
  [3, 6, 3, 0, 0, 0], // level 4
  [3, 6, 4, 1, 0, 0], // level 5
  [3, 6, 4, 2, 0, 0], // level 6
  [3, 6, 4, 3, 1, 0], // level 7
  [3, 6, 4, 3, 2, 0], // level 8
  [3, 6, 4, 3, 3, 1], // level 9
  [3, 6, 4, 3, 3, 2], // level 10
];

/**
 * Returns how many new spells (and of which tier) are gained going from
 * oldLevel to newLevel for Casters. Returns [] for non-casters.
 *
 * For Casters, tier 1 = neutral spells, tiers 2-5 = path spells.
 * Cantrips (tier 0) are fixed at 3 and never gained on level-up.
 */
export function getSpellsGained(
  characterClass: string,
  oldLevel: number,
  newLevel: number,
): { tier: number; count: number }[] {
  if (characterClass !== "Caster") return [];

  const oldRow = CASTER_SPELLS_KNOWN[oldLevel - 1] ?? [0, 0, 0, 0, 0, 0];
  const newRow = CASTER_SPELLS_KNOWN[newLevel - 1] ?? [0, 0, 0, 0, 0, 0];

  const gained: { tier: number; count: number }[] = [];
  // Start from index 1 (T1) — cantrips (index 0) don't change on level-up
  for (let i = 1; i < 6; i++) {
    const diff = newRow[i] - oldRow[i];
    if (diff > 0) gained.push({ tier: i, count: diff });
  }
  return gained;
}

// ── Talent tables ────────────────────────────────────────────────────────────

export type TalentChoiceType =
  | "none"
  | "stat-choice"
  | "hp-roll"
  | "weapon-mastery"
  | "armor-type"
  | "crit-weapon"
  | "spell-advantage"
  | "spell-learn";

export interface TalentResult {
  description: string;
  choiceType: TalentChoiceType;
  /** Predefined options shown as buttons (for stat-choice) */
  choiceOptions?: string[];
  /** Stat to auto-update when no choice is needed */
  autoStatKey?: keyof Character;
  autoStatDelta?: number;
  /** HP die to roll for hp-roll talents */
  hpDie?: string;
}

function resolveRange(
  roll: number,
  ranges: [number, number, TalentResult][],
): TalentResult {
  for (const [min, max, result] of ranges) {
    if (roll >= min && roll <= max) return result;
  }
  return ranges[ranges.length - 1][2];
}

// ── Fighter Specializations ──────────────────────────────────────────────────

function knightTalent(r: number): TalentResult {
  return resolveRange(r, [
    [2, 2, { description: "Unbreakable: Once per rest, when an attack would drop you to 0 HP, stay at 1 HP instead", choiceType: "none" }],
    [3, 3, { description: "Sworn Protector: Shield Wall protects allies at near range, not just close", choiceType: "none" }],
    [4, 4, { description: "Battlefield Command: Rally now affects all allies within near range", choiceType: "none" }],
    [5, 5, { description: "+1 STR", choiceType: "none", autoStatKey: "str", autoStatDelta: 1 }],
    [6, 6, { description: "+1d4 max HP", choiceType: "hp-roll", hpDie: "1d4" }],
    [7, 7, { description: "+1 STR or CON", choiceType: "stat-choice", choiceOptions: ["STR", "CON"] }],
    [8, 8, { description: "+1d4 max HP", choiceType: "hp-roll", hpDie: "1d4" }],
    [9, 9, { description: "+1 CON", choiceType: "none", autoStatKey: "con", autoStatDelta: 1 }],
    [10, 10, { description: "Iron Stance: Can't be knocked prone or pushed against your will", choiceType: "none" }],
    [11, 11, { description: "Taunt: Once per encounter, force one enemy at near range to attack you instead of an ally on their next turn", choiceType: "none" }],
    [12, 12, { description: "Last Bastion: When you're the last conscious party member, +2 to all attack rolls and armor until combat ends", choiceType: "none" }],
  ]);
}

function hunterTalent(r: number): TalentResult {
  return resolveRange(r, [
    [2, 2, { description: "Deadshot: Once per rest, declare a called shot. If it hits, double damage and a lasting injury", choiceType: "none" }],
    [3, 3, { description: "Twin Arrows: Once per encounter, fire two arrows in one attack. Roll each separately", choiceType: "none" }],
    [4, 4, { description: "Tracker's Instinct: Track any creature you've wounded, even through magical concealment", choiceType: "none" }],
    [5, 5, { description: "+1 DEX", choiceType: "none", autoStatKey: "dex", autoStatDelta: 1 }],
    [6, 6, { description: "+1d4 max HP", choiceType: "hp-roll", hpDie: "1d4" }],
    [7, 7, { description: "+1 DEX or WIS", choiceType: "stat-choice", choiceOptions: ["DEX", "WIS"] }],
    [8, 8, { description: "+1d4 max HP", choiceType: "hp-roll", hpDie: "1d4" }],
    [9, 9, { description: "+1 WIS", choiceType: "none", autoStatKey: "wis", autoStatDelta: 1 }],
    [10, 10, { description: "High Ground: When attacking from elevation, +2 damage", choiceType: "none" }],
    [11, 11, { description: "Snare: During rest, craft a trap. One use, holds a creature for 1d4 rounds. STR check to escape", choiceType: "none" }],
    [12, 12, { description: "Apex Predator: Marked Prey bonus increases to +4 damage, and you can change your mark once mid-combat", choiceType: "none" }],
  ]);
}

function marauderTalent(r: number): TalentResult {
  return resolveRange(r, [
    [2, 2, { description: "Bloodrage: When below half HP, +2 to all damage rolls", choiceType: "none" }],
    [3, 3, { description: "Whirlwind: Once per encounter, attack every enemy at close range. One roll each", choiceType: "none" }],
    [4, 4, { description: "Terrifying Charge: Move from near to close and attack — target makes WIS check or is frightened for 1 round", choiceType: "none" }],
    [5, 5, { description: "+1 STR", choiceType: "none", autoStatKey: "str", autoStatDelta: 1 }],
    [6, 6, { description: "+1d4 max HP", choiceType: "hp-roll", hpDie: "1d4" }],
    [7, 7, { description: "+1 STR or CON", choiceType: "stat-choice", choiceOptions: ["STR", "CON"] }],
    [8, 8, { description: "+1d4 max HP", choiceType: "hp-roll", hpDie: "1d4" }],
    [9, 9, { description: "+1 CON", choiceType: "none", autoStatKey: "con", autoStatDelta: 1 }],
    [10, 10, { description: "Hard to Kill: Advantage on death fate rolls (a 1 kills you instead of 1-2)", choiceType: "none" }],
    [11, 11, { description: "Shrug It Off: Once per rest, ignore a status effect (poisoned, blinded, stunned) for 1 round", choiceType: "none" }],
    [12, 12, { description: "Unstoppable: Frenzy chains have no limit and also trigger on attacks that drop an enemy below half HP", choiceType: "none" }],
  ]);
}

// ── Rogue Specializations ────────────────────────────────────────────────────

function thiefTalent(r: number): TalentResult {
  return resolveRange(r, [
    [2, 2, { description: "Master Heist: Once per adventure, retroactively establish one preparation the GM must honor if plausible", choiceType: "none" }],
    [3, 3, { description: "Quick Hands: Pickpocket or plant an item during combat without using your action", choiceType: "none" }],
    [4, 4, { description: "Appraiser: Identify exact value and magical properties of an item by handling it", choiceType: "none" }],
    [5, 5, { description: "+1 DEX", choiceType: "none", autoStatKey: "dex", autoStatDelta: 1 }],
    [6, 6, { description: "+1d4 max HP", choiceType: "hp-roll", hpDie: "1d4" }],
    [7, 7, { description: "+1 DEX or CHA", choiceType: "stat-choice", choiceOptions: ["DEX", "CHA"] }],
    [8, 8, { description: "+1d4 max HP", choiceType: "hp-roll", hpDie: "1d4" }],
    [9, 9, { description: "+1 CHA", choiceType: "none", autoStatKey: "cha", autoStatDelta: 1 }],
    [10, 10, { description: "Escape Artist: Slip out of any nonmagical restraint without a check", choiceType: "none" }],
    [11, 11, { description: "Roof Runner: Climb any surface at full speed. No check outside combat; advantage in combat", choiceType: "none" }],
    [12, 12, { description: "Ghost: Vanish lasts 2 rounds and can be used twice per encounter", choiceType: "none" }],
  ]);
}

function assassinTalent(r: number): TalentResult {
  return resolveRange(r, [
    [2, 2, { description: "Deathmark: Once per rest, study a target for 1 round. Next attack is an automatic critical if it hits", choiceType: "none" }],
    [3, 3, { description: "Venomous: Poison Craft produces 2 doses; damage increases to 1d8", choiceType: "none" }],
    [4, 4, { description: "Shadow Step: Once per encounter, teleport from one shadow to another within near range", choiceType: "none" }],
    [5, 5, { description: "+1 DEX", choiceType: "none", autoStatKey: "dex", autoStatDelta: 1 }],
    [6, 6, { description: "+1d4 max HP", choiceType: "hp-roll", hpDie: "1d4" }],
    [7, 7, { description: "+1 DEX or INT", choiceType: "stat-choice", choiceOptions: ["DEX", "INT"] }],
    [8, 8, { description: "+1d4 max HP", choiceType: "hp-roll", hpDie: "1d4" }],
    [9, 9, { description: "+1 INT", choiceType: "none", autoStatKey: "int", autoStatDelta: 1 }],
    [10, 10, { description: "Silent Kill: If Unseen Strike drops a target to 0 HP, no one else notices for 1 round", choiceType: "none" }],
    [11, 11, { description: "Read Weakness: After observing a creature for 1 round, learn its lowest ability score and any vulnerabilities", choiceType: "none" }],
    [12, 12, { description: "Coup de Grace: Smell Blood triggers at any HP, not just half", choiceType: "none" }],
  ]);
}

function scoutTalent(r: number): TalentResult {
  return resolveRange(r, [
    [2, 2, { description: "Phantom: In natural terrain, completely undetectable by nonmagical means. Scent, sound, footprints — nothing", choiceType: "none" }],
    [3, 3, { description: "Warden's Eye: Spend 10 minutes observing an area to learn creature count, sizes, and general types", choiceType: "none" }],
    [4, 4, { description: "Flanking Expert: When you and an ally are on opposite sides of an enemy, both get +2 to attack rolls", choiceType: "none" }],
    [5, 5, { description: "+1 DEX", choiceType: "none", autoStatKey: "dex", autoStatDelta: 1 }],
    [6, 6, { description: "+1d4 max HP", choiceType: "hp-roll", hpDie: "1d4" }],
    [7, 7, { description: "+1 DEX or WIS", choiceType: "stat-choice", choiceOptions: ["DEX", "WIS"] }],
    [8, 8, { description: "+1d4 max HP", choiceType: "hp-roll", hpDie: "1d4" }],
    [9, 9, { description: "+1 WIS", choiceType: "none", autoStatKey: "wis", autoStatDelta: 1 }],
    [10, 10, { description: "Quick Retreat: Disengage from close range without provoking attacks", choiceType: "none" }],
    [11, 11, { description: "Survivalist: Forage food/water for the party during travel without slowing. Advantage on environmental hazards", choiceType: "none" }],
    [12, 12, { description: "Pack Tactics: Ambush gives party advantage on first two attacks; you get an extra free attack", choiceType: "none" }],
  ]);
}

// ── Caster Specializations ───────────────────────────────────────────────────

function druidTalent(r: number): TalentResult {
  return resolveRange(r, [
    [2, 2, { description: "Heart of the Green: Once per rest, reduce Toll by 1d6 without Hearthwork", choiceType: "none" }],
    [3, 3, { description: "Greater Form: Pelt and Wing includes larger animals (wolf, deer, bear). You can attack in these forms", choiceType: "none" }],
    [4, 4, { description: "Regrowth: When you cast a healing spell, the target also recovers from one poison or disease", choiceType: "none" }],
    [5, 5, { description: "+1 WIS", choiceType: "none", autoStatKey: "wis", autoStatDelta: 1 }],
    [6, 6, { description: "+1d4 max HP", choiceType: "hp-roll", hpDie: "1d4" }],
    [7, 7, { description: "+1 WIS or CON", choiceType: "stat-choice", choiceOptions: ["WIS", "CON"] }],
    [8, 8, { description: "+1d4 max HP", choiceType: "hp-roll", hpDie: "1d4" }],
    [9, 9, { description: "+1 CON", choiceType: "none", autoStatKey: "con", autoStatDelta: 1 }],
    [10, 10, { description: "Root Sense: While touching natural ground, sense footsteps, tunnels, burrowing creatures within far range", choiceType: "none" }],
    [11, 11, { description: "Thorncloak: When hit by a melee attack, attacker takes 1d4 damage from thorns", choiceType: "none" }],
    [12, 12, { description: "Life Tide: Once per rest, cast a healing spell on every ally within near range simultaneously. Normal Toll cost, one cast, all benefit", choiceType: "none" }],
  ]);
}

function sorcererTalent(r: number): TalentResult {
  return resolveRange(r, [
    [2, 2, { description: "Void Channel: Once per rest, cast any spell at zero Toll cost. The darkness pays — but the GM narrates what it takes from you", choiceType: "none" }],
    [3, 3, { description: "Shadow Familiar: Summon a small shadow creature. It can scout, distract, or deliver touch-range spells. Lasts until dismissed or destroyed", choiceType: "none" }],
    [4, 4, { description: "Drain Life: When you deal damage with a spell, recover HP equal to half the damage dealt", choiceType: "none" }],
    [5, 5, { description: "+1 INT", choiceType: "none", autoStatKey: "int", autoStatDelta: 1 }],
    [6, 6, { description: "+1d4 max HP", choiceType: "hp-roll", hpDie: "1d4" }],
    [7, 7, { description: "+1 INT or CHA", choiceType: "stat-choice", choiceOptions: ["INT", "CHA"] }],
    [8, 8, { description: "+1d4 max HP", choiceType: "hp-roll", hpDie: "1d4" }],
    [9, 9, { description: "+1 CHA", choiceType: "none", autoStatKey: "cha", autoStatDelta: 1 }],
    [10, 10, { description: "Fear Aura: Enemies at close range have disadvantage on WIS checks", choiceType: "none" }],
    [11, 11, { description: "Backlash Resistance: Nat 1 on spell cast costs 1.5× Toll (rounded up) instead of double", choiceType: "none" }],
    [12, 12, { description: "Annihilation: Once per rest, your next damage spell ignores all resistances and immunities", choiceType: "none" }],
  ]);
}

function enchanterTalent(r: number): TalentResult {
  return resolveRange(r, [
    [2, 2, { description: "Perfect Illusion: Once per rest, create an illusion that is physically real — touchable, weighted, audible. Lasts 10 minutes", choiceType: "none" }],
    [3, 3, { description: "Implant Thought: Suggest a short, reasonable course of action to a creature. They believe it was their own idea. WIS save negates", choiceType: "none" }],
    [4, 4, { description: "Doppelganger: Create 2 illusory duplicates. Each absorbs one attack before vanishing. Concentration, Brief", choiceType: "none" }],
    [5, 5, { description: "+1 CHA", choiceType: "none", autoStatKey: "cha", autoStatDelta: 1 }],
    [6, 6, { description: "+1d4 max HP", choiceType: "hp-roll", hpDie: "1d4" }],
    [7, 7, { description: "+1 CHA or INT", choiceType: "stat-choice", choiceOptions: ["CHA", "INT"] }],
    [8, 8, { description: "+1d4 max HP", choiceType: "hp-roll", hpDie: "1d4" }],
    [9, 9, { description: "+1 INT", choiceType: "none", autoStatKey: "int", autoStatDelta: 1 }],
    [10, 10, { description: "Misdirection: Once per encounter, redirect an attack targeting you to another creature within close range", choiceType: "none" }],
    [11, 11, { description: "Clear Eyes: See through all illusions and magical disguises within near range. Passive, always on", choiceType: "none" }],
    [12, 12, { description: "Puppet: Once per rest, take full control of one creature for 1 round. WIS save negates. On success, they don't know it happened", choiceType: "none" }],
  ]);
}

/** All 9 specialization talent table functions keyed by specialization name. */
const TALENT_TABLES: Record<string, (roll: number) => TalentResult> = {
  Knight: knightTalent,
  Hunter: hunterTalent,
  Marauder: marauderTalent,
  Thief: thiefTalent,
  Assassin: assassinTalent,
  Scout: scoutTalent,
  Druid: druidTalent,
  Sorcerer: sorcererTalent,
  Enchanter: enchanterTalent,
};

/**
 * Look up a talent result from the specialization talent table.
 * Falls back to the base class if the specialization isn't recognized
 * (shouldn't happen, but safe default).
 */
export function getTalentResult(specialization: string, roll: number): TalentResult {
  const r = Math.max(2, Math.min(12, roll));
  const fn = TALENT_TABLES[specialization];
  if (fn) return fn(r);
  // Fallback: generic stat boost
  return { description: "+1 to a stat of your choice", choiceType: "stat-choice", choiceOptions: ["STR", "DEX", "CON", "INT", "WIS", "CHA"] };
}

/** Build the talent string to store in character.talents[] */
export function buildTalentString(result: TalentResult, choice: string | null): string {
  if (!choice) return result.description;
  switch (result.choiceType) {
    case "stat-choice": return `+1 to ${choice} (max 18)`;
    case "weapon-mastery": return `Weapon Mastery: ${choice}`;
    case "armor-type": return `+1 AC from ${choice} armor`;
    case "crit-weapon": return `Triple crit damage with ${choice}`;
    case "spell-advantage": return `Advantage on casting: ${choice}`;
    case "spell-learn": return `Learned spell: ${choice}`;
    default: return result.description;
  }
}

export interface CompanionLevelUpResult {
  companion: Companion;
  hpGained: number;
  talentGained: string;
}

/**
 * Auto-resolves a level-up for a companion (no interactive picker).
 * Rolls HP, applies a talent (auto-choosing the first stat option for choice-based talents).
 * Resets XP to 0.
 */
export function autoResolveCompanionLevelUp(companion: Companion): CompanionLevelUpResult {
  const newLevel = companion.level + 1;

  // HP roll
  const die = getHitDie(companion.class);
  const isKnocker = companion.ancestry.toLowerCase() === "knocker";
  const roll1 = Math.floor(Math.random() * die) + 1;
  const knockerBonus = isKnocker ? 1 : 0;
  const { getStatMod: _getStatMod } = { getStatMod: (n: number) => Math.floor((n - 10) / 2) };
  const conMod = _getStatMod(companion.con);
  const hpGained = Math.max(1, roll1 + conMod) + knockerBonus;

  // Talent roll (odd levels 3, 5, 7, 9 only)
  let talentGained = "";
  const statUpdates: Partial<Companion> = {};
  if (isOddLevel(newLevel) && companion.specialization) {
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const talent = getTalentResult(companion.specialization, d1 + d2);

    if (talent.autoStatKey && talent.autoStatDelta) {
      const key = talent.autoStatKey as keyof Companion;
      const current = (companion[key] as number) ?? 10;
      (statUpdates as Record<string, unknown>)[key as string] = Math.min(18, current + talent.autoStatDelta);
      talentGained = talent.description;
    } else if (talent.choiceType === "stat-choice" && talent.choiceOptions?.[0]) {
      const choice = talent.choiceOptions[0];
      const key = choice.toLowerCase() as keyof Companion;
      const current = (companion[key] as number) ?? 10;
      (statUpdates as Record<string, unknown>)[key as string] = Math.min(18, current + 1);
      talentGained = `+1 to ${choice} (max 18)`;
    } else {
      talentGained = talent.description;
    }
  }

  const updatedCompanion: Companion = {
    ...companion,
    ...statUpdates,
    level: newLevel,
    xp: 0,
    maxHp: companion.maxHp + hpGained,
    hp: companion.hp + hpGained,
    talents: talentGained ? [...companion.talents, talentGained] : companion.talents,
  };

  return { companion: updatedCompanion, hpGained, talentGained };
}

/**
 * Returns stat key/value changes from a talent result that modify numeric stats.
 * Returns empty object if the talent doesn't change any stat directly.
 */
export function statUpdatesFromTalent(
  result: TalentResult,
  choice: string | null,
  character: Partial<Character>,
): Partial<Character> {
  const updates: Partial<Character> = {};

  // Auto stat (e.g. Knight +1 STR)
  if (result.autoStatKey && result.autoStatDelta) {
    const current = (character[result.autoStatKey] as number) ?? 10;
    (updates[result.autoStatKey] as number) = Math.min(18, current + result.autoStatDelta);
  }

  // Player-chosen stat
  if (result.choiceType === "stat-choice" && choice) {
    const key = choice.toLowerCase() as keyof Character;
    const current = (character[key] as number) ?? 10;
    // Stat boosts in the new talent tables are +1 (not +2)
    (updates[key] as number) = Math.min(18, current + 1);
  }

  return updates;
}
