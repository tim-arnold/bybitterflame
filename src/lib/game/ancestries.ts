/**
 * Ancestry definitions for the folklore setting.
 * Matches the rules in src/lib/rules/character-creation.md.
 */

export interface AncestryAbility {
  name: string;
  type: "passive" | "active";
  usesPerRest?: number;
  description: string;
}

export interface Ancestry {
  name: string;
  languages: string[];
  abilities: AncestryAbility[];
}

export const ANCESTRIES: Ancestry[] = [
  {
    name: "Human",
    languages: ["Common"],
    abilities: [
      { name: "Quick Study", type: "passive", description: "At level 2 and every even level, learn one extra skill or spell beyond your class allotment." },
      { name: "Resolve", type: "active", usesPerRest: 1, description: "Reroll any failed check, take the better result." },
    ],
  },
  {
    name: "Fey",
    languages: ["Common", "Fey Tongue"],
    abilities: [
      { name: "Glamour Sight", type: "passive", description: "Automatically see through mundane disguises and nonmagical deception. Illusion spells against you are at disadvantage." },
      { name: "Beguile", type: "active", usesPerRest: 1, description: "Lock eyes with a creature — charmed for 1 minute (fascinated, not friendly). Breaks if harmed. WIS save negates." },
    ],
  },
  {
    name: "Knocker",
    languages: ["Common", "Stonespeak"],
    abilities: [
      { name: "Stone Blood", type: "passive", description: "+2 max HP at level 1, +1 additional max HP every level after. Advantage on poison and disease checks." },
      { name: "Steady Hands", type: "active", usesPerRest: 1, description: "Automatically succeed on one STR or CON check. No roll needed." },
    ],
  },
  {
    name: "Hob",
    languages: ["Common"],
    abilities: [
      { name: "Slip By", type: "passive", description: "Advantage on stealth checks when near a larger creature." },
      { name: "Fool's Fortune", type: "active", usesPerRest: 1, description: "Force an enemy to reroll a successful attack against you. They take the worse result." },
    ],
  },
  {
    name: "Revenant",
    languages: ["Common"],
    abilities: [
      { name: "Death's Familiar", type: "passive", description: "Advantage on death fate rolls (roll 2d6, take best). Immune to fear from undead." },
      { name: "Cold Grasp", type: "active", usesPerRest: 1, description: "Touch a creature for 1d6 cold damage; they can't take reactions until their next turn." },
    ],
  },
  {
    name: "Leshy",
    languages: ["Common"],
    abilities: [
      { name: "Green Tongue", type: "passive", description: "Communicate with plants — impressions, warnings, feelings. Plants lean toward you." },
      { name: "Barkskin", type: "active", usesPerRest: 1, description: "Harden your skin for one encounter. +1 AC. Stacks with worn armor." },
    ],
  },
];

/** Lookup ancestry by name (case-insensitive) */
export function getAncestry(name: string): Ancestry | undefined {
  return ANCESTRIES.find((a) => a.name.toLowerCase() === name.toLowerCase());
}
