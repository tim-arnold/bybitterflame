/**
 * Character titles by class/specialization, level, and alignment.
 *
 * Pre-specialization (levels 1-2): alignment-independent — everyone starts Neutral
 * and specialization hasn't been chosen yet, so a single title per level applies.
 *
 * Post-specialization (levels 3-10): alignment-based titles per specialization.
 * Index 0 = level 3, index 1 = level 4, …, index 7 = level 10.
 */

/** Levels 1-2: one title per level, no alignment distinction. */
const PRE_SPEC_TITLES: Record<string, string[]> = {
  Fighter: ["Warrior", "Veteran"],
  Rogue:   ["Footpad", "Prowler"],
  Caster:  ["Hedge Mage", "Channeler"],
};

/** Levels 3-10: alignment-based, indexed 0 (level 3) through 7 (level 10). */
const SPEC_TITLES: Record<string, Record<string, string[]>> = {
  // ── Fighter specializations ──────────────────────────────────────────────
  Knight: {
    Lawful:  ["Knight", "Paladin", "Champion", "Crusader", "Lord Commander", "Grand Master", "Paragon", "Eternal Shield"],
    Neutral: ["Knight", "Warden", "Bulwark", "Ironwall", "Shield Lord", "Bastion", "High Guardian", "Legend"],
    Chaotic: ["Dark Knight", "Blackguard", "Ravager", "Scourge", "Dread Knight", "Death Knight", "Doom Warden", "Fell Champion"],
  },
  Hunter: {
    Lawful:  ["Ranger", "Tracker", "Pathfinder", "Warden", "Hawk Lord", "Grand Warden", "Eye of the Wild", "Legend"],
    Neutral: ["Hunter", "Stalker", "Prowler", "Sharpshooter", "Ghost Walker", "Predator", "Apex", "Legend"],
    Chaotic: ["Poacher", "Manhunter", "Bloodhound", "Deadeye", "Shadow Hunter", "Death Stalker", "Pale Archer", "Fell Champion"],
  },
  Marauder: {
    Lawful:  ["Berserker", "Fury", "Storm Blade", "Tempest", "War Chief", "Conqueror", "Thunder Lord", "Legend"],
    Neutral: ["Marauder", "Reaver", "Destroyer", "Warlord", "Scourge", "Overlord", "Doom Bringer", "Legend"],
    Chaotic: ["Savage", "Ravager", "Butcher", "Blood Storm", "Slaughter King", "Apocalypse", "World Breaker", "Fell Champion"],
  },

  // ── Rogue specializations ────────────────────────────────────────────────
  Thief: {
    Lawful:  ["Investigator", "Locksmith", "Shadow Agent", "Master Spy", "Spymaster", "Grand Inquisitor", "Shadow Lord", "Legend"],
    Neutral: ["Burglar", "Smuggler", "Fence", "Master Thief", "Guildmaster", "Crime Lord", "Kingpin", "Legend"],
    Chaotic: ["Robber", "Bandit Lord", "Pirate", "Phantom Thief", "Night Lord", "Arch-Criminal", "Shadow King", "Fell Champion"],
  },
  Assassin: {
    Lawful:  ["Enforcer", "Blade", "Executioner", "Silent Blade", "Death Hand", "Grand Assassin", "Shadow Lord", "Legend"],
    Neutral: ["Assassin", "Poisoner", "Shadow Killer", "Death Dealer", "Nightblade", "Reaper", "Master of Ends", "Legend"],
    Chaotic: ["Killer", "Blood Artist", "Venom Lord", "Murder Saint", "Angel of Death", "Death Incarnate", "Pale King", "Fell Champion"],
  },
  Scout: {
    Lawful:  ["Scout", "Ranger", "Outrider", "Warden", "Ghost Tracker", "Grand Warden", "Eye of Justice", "Legend"],
    Neutral: ["Scout", "Guide", "Pathfinder", "Trail Master", "Ghost", "Phantom", "Wind Walker", "Legend"],
    Chaotic: ["Tracker", "Skulker", "Shadow Runner", "Wild Eye", "Night Ghost", "Void Walker", "Fell Wind", "Fell Champion"],
  },

  // ── Caster specializations ───────────────────────────────────────────────
  Druid: {
    Lawful:  ["Druid", "Greenspeaker", "Warden", "Elder", "Hierophant", "Archdruid", "Voice of the Green", "Legend"],
    Neutral: ["Druid", "Root Walker", "Steward", "Grove Keeper", "Sage", "Elder", "Heart of the Green", "Legend"],
    Chaotic: ["Wild Druid", "Thorn Singer", "Storm Caller", "Feral Heart", "Dark Bloom", "Blight Druid", "Green Fury", "Fell Champion"],
  },
  Sorcerer: {
    Lawful:  ["Sorcerer", "Invoker", "Binder", "Magus", "High Sorcerer", "Arcane Lord", "Supreme Sorcerer", "Legend"],
    Neutral: ["Sorcerer", "Shadow Caster", "Dark Scholar", "Void Seeker", "Night Magus", "Abyss Walker", "Unbound", "Legend"],
    Chaotic: ["Dark Sorcerer", "Blood Mage", "Necromancer", "Shadow Lord", "Lich", "Dark Archmage", "Void Lord", "Fell Champion"],
  },
  Enchanter: {
    Lawful:  ["Enchanter", "Illusionist", "Mesmerist", "Mind Sage", "High Enchanter", "Grand Weaver", "Architect of Minds", "Legend"],
    Neutral: ["Enchanter", "Glamourist", "Trickster", "Dream Weaver", "Mirror Mage", "Grand Illusionist", "Eternal Weaver", "Legend"],
    Chaotic: ["Beguiler", "Puppeteer", "Mind Thief", "Puppet Master", "Nightmare Lord", "Dark Weaver", "Erasure", "Fell Champion"],
  },
};

/**
 * Returns the flavor title for a character.
 * - Levels 1-2 (no specialization): alignment-independent pre-spec title.
 * - Levels 3-10 (specialization chosen): alignment-based spec title.
 */
export function getCharacterTitle(
  cls: string | undefined,
  level: number | undefined,
  alignment: string | undefined,
  specialization?: string | undefined,
): string | null {
  if (!cls || !level) return null;

  if (!specialization) {
    // Pre-specialization: alignment doesn't matter yet
    const titles = PRE_SPEC_TITLES[cls];
    return titles?.[(level - 1)] ?? null;
  }

  // Post-specialization
  const specTitles = SPEC_TITLES[specialization];
  if (!specTitles) return null;
  const alignmentTitles = specTitles[alignment ?? "Neutral"] ?? specTitles["Neutral"];
  return alignmentTitles[(level - 3)] ?? null;
}
