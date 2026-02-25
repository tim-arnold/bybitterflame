/** Class titles by level and alignment, from the Shadowdark leveling rules. */

const TITLES: Record<string, Record<string, string[]>> = {
  Fighter: {
    Lawful:  ["Squire", "Cavalier", "Knight", "Paladin", "Champion", "Crusader", "Templar", "Paragon", "Lord Commander", "Grand Master"],
    Neutral: ["Warrior", "Barbarian", "Veteran", "Champion", "Warlord", "Berserker", "Conqueror", "Overlord", "High King", "Legend"],
    Chaotic: ["Thug", "Enforcer", "Destroyer", "Blackguard", "Ravager", "Scourge", "Dread Knight", "Death Knight", "Warlord of Ruin", "Doom Bringer"],
  },
  Priest: {
    Lawful:  ["Acolyte", "Adept", "Priest", "Curate", "Canon", "Bishop", "Archbishop", "Cardinal", "High Priest", "Patriarch"],
    Neutral: ["Initiate", "Mystic", "Shaman", "Oracle", "Seer", "Druid", "Hierophant", "Elder", "Archdruid", "Sage"],
    Chaotic: ["Cultist", "Dark Adept", "Witch", "Heretic", "Demonist", "Dark Priest", "High Witch", "Dread Priest", "Cult Leader", "Dark Patriarch"],
  },
  Thief: {
    Lawful:  ["Agent", "Spy", "Investigator", "Scout", "Detective", "Shadow Agent", "Inquisitor", "Spymaster", "Grand Inquisitor", "Shadow Lord"],
    Neutral: ["Footpad", "Rogue", "Burglar", "Smuggler", "Pirate", "Master Thief", "Fence", "Guildmaster", "Crime Lord", "Kingpin"],
    Chaotic: ["Cutpurse", "Bandit", "Robber", "Brigand", "Assassin", "Poisoner", "Shadow Killer", "Executioner", "Master Assassin", "Death Dealer"],
  },
  Wizard: {
    Lawful:  ["Apprentice", "Scribe", "Mage", "Enchanter", "Sorcerer", "Wizard", "High Wizard", "Master Wizard", "Arcane Lord", "Supreme Wizard"],
    Neutral: ["Hedge Mage", "Evoker", "Conjurer", "Illusionist", "Elementalist", "Transmuter", "Archmage", "Grand Archmage", "Sage of Ages", "Eternal Sage"],
    Chaotic: ["Dabbler", "Hexer", "Warlock", "Diabolist", "Necromancer", "Dark Sorcerer", "Shadow Mage", "Lich Lord", "Dark Archmage", "Archlich"],
  },
};

/**
 * Returns the class title for a character based on class, level, and alignment.
 * Returns null if the combination is unrecognised.
 */
export function getCharacterTitle(
  cls: string | undefined,
  level: number | undefined,
  alignment: string | undefined,
): string | null {
  if (!cls || !level || !alignment) return null;
  const classTitles = TITLES[cls];
  if (!classTitles) return null;
  const alignmentTitles = classTitles[alignment] ?? classTitles["Neutral"];
  return alignmentTitles[(level ?? 1) - 1] ?? null;
}