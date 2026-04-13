/**
 * Class and specialization definitions for the folklore setting.
 * Matches the rules in src/lib/rules/character-creation.md and leveling.md.
 */

export interface ClassAbility {
  name: string;
  description: string;
}

export interface BaseClass {
  name: string;
  hitDie: string;
  weapons: string;
  armor: string;
  abilities: ClassAbility[];
  specializations: string[];
}

export interface SpecializationAbility {
  name: string;
  description: string;
}

export interface Specialization {
  name: string;
  baseClass: string;
  emergesFrom: string;
  abilities: SpecializationAbility[];
}

export const BASE_CLASSES: BaseClass[] = [
  {
    name: "Fighter",
    hitDie: "1d8",
    weapons: "All weapons",
    armor: "All armor and shields",
    abilities: [
      { name: "Grit", description: "+1 HP per level. Fighters are tougher than everyone else." },
      { name: "Weapon Mastery", description: "+1 to attack rolls with any weapon." },
      { name: "Gritted Teeth", description: "Once per rest, recover 1d6 HP as a free action." },
    ],
    specializations: ["Knight", "Hunter", "Marauder"],
  },
  {
    name: "Rogue",
    hitDie: "1d6",
    weapons: "Club, crossbow, dagger, hunting bow, seax, hatchet",
    armor: "Hide armor",
    abilities: [
      { name: "Cunning", description: "Advantage on DEX checks (stealth, lockpicking, traps, acrobatics)." },
      { name: "Unseen Strike", description: "When you attack a creature that doesn't know you're there, deal double damage." },
      { name: "Slippery", description: "When an attack hits you, use your reaction to halve the damage. Once per encounter." },
    ],
    specializations: ["Thief", "Assassin", "Scout"],
  },
  {
    name: "Caster",
    hitDie: "1d4",
    weapons: "Dagger, staff",
    armor: "None",
    abilities: [
      { name: "Spellcasting", description: "Access to cantrips and the neutral spell list. Spells cost Toll to cast." },
      { name: "Arcane Sense", description: "Feel the presence of magic within near range. Passive, always on — direction and intensity, not details." },
      { name: "Resilient Mind", description: "Advantage on saves against charm, fear, and mind-altering effects." },
    ],
    specializations: ["Druid", "Sorcerer", "Enchanter"],
  },
];

export const SPECIALIZATIONS: Specialization[] = [
  // Fighter
  {
    name: "Knight",
    baseClass: "Fighter",
    emergesFrom: "Heavy armor, defensive play, protecting allies",
    abilities: [
      { name: "Shield Wall", description: "When wielding a shield and an ally at close range is attacked, take the hit instead. Once per round." },
      { name: "Rally", description: "Once per encounter, one ally within near range recovers 1d4 HP and loses the frightened condition." },
      { name: "Heavy Armor Mastery", description: "No movement penalty in heavy armor." },
    ],
  },
  {
    name: "Hunter",
    baseClass: "Fighter",
    emergesFrom: "Ranged weapons, tracking, wilderness awareness",
    abilities: [
      { name: "Marked Prey", description: "At the start of combat, mark one enemy. +2 damage on all attacks against that target for the encounter." },
      { name: "Keen Eye", description: "Advantage on perception checks." },
      { name: "Steady Shot", description: "Ranged attacks at far range have no disadvantage." },
    ],
  },
  {
    name: "Marauder",
    baseClass: "Fighter",
    emergesFrom: "Reckless aggression, dual-wielding, wild fighting",
    abilities: [
      { name: "Frenzy", description: "When you drop an enemy to 0 HP, immediately make one free attack against another enemy at close range. Chainable." },
      { name: "Reckless Strike", description: "Declare before attacking: advantage on the attack roll, but enemies get advantage on attacks against you until your next turn." },
      { name: "Thick Skull", description: "Advantage on saves against stun, knockdown, and momentum-stopping effects." },
    ],
  },
  // Rogue
  {
    name: "Thief",
    baseClass: "Rogue",
    emergesFrom: "Lockpicking, pickpocketing, larceny, urban focus",
    abilities: [
      { name: "Nimble Fingers", description: "Lockpicking, pickpocketing, and disarming traps take half the normal time. On failure, retry once without triggering consequences." },
      { name: "Fence", description: "50% more gold when selling loot in settlements." },
      { name: "Vanish", description: "Once per encounter, become invisible for 1 round if not at close range with an enemy. No check required." },
    ],
  },
  {
    name: "Assassin",
    baseClass: "Rogue",
    emergesFrom: "Poison, ambush, lethal precision, blade focus",
    abilities: [
      { name: "Lethal Precision", description: "Unseen Strike deals triple damage instead of double." },
      { name: "Poison Craft", description: "During rest, prepare one dose of poison from common ingredients. Applied to a weapon, adds 1d6 damage on the next hit." },
      { name: "Smell Blood", description: "When you hit a creature at half HP or less, deal an extra 1d6 damage." },
    ],
  },
  {
    name: "Scout",
    baseClass: "Rogue",
    emergesFrom: "Stealth, survival, recon, wilderness focus",
    abilities: [
      { name: "Trailblazer", description: "The party can't get lost in wilderness when you navigate. You spot natural hazards before the party walks into them." },
      { name: "Ambush", description: "When you surprise enemies, your entire party gets advantage on their first attack." },
      { name: "Camouflage", description: "In natural terrain (forest, caves, mountains), hide in plain sight without cover. Stealth check at advantage." },
    ],
  },
  // Caster
  {
    name: "Druid",
    baseClass: "Caster",
    emergesFrom: "Healing spells, nature magic, growth/life themes",
    abilities: [
      { name: "Nature's Mend", description: "Healing spells restore an extra 1d4 HP." },
      { name: "Pelt and Wing", description: "Once per rest, take the form of a small animal (bird, fox, cat, fish) for up to 1 hour. Can't attack, but can scout, infiltrate, escape. Concentration, Lasting." },
    ],
  },
  {
    name: "Sorcerer",
    baseClass: "Caster",
    emergesFrom: "Destructive spells, dark magic, power-at-a-cost choices",
    abilities: [
      { name: "Dark Harvest", description: "When you kill a creature with a spell, reduce your Toll by 1." },
      { name: "Overcharge", description: "When casting a damage spell, voluntarily pay double Toll to add one extra damage die." },
    ],
  },
  {
    name: "Enchanter",
    baseClass: "Caster",
    emergesFrom: "Illusion, charm, mind magic, scholarly approach",
    abilities: [
      { name: "Layered Illusion", description: "Illusion spells gain sound and smell, not just visuals. Much harder to see through." },
      { name: "Mind Slip", description: "Once per encounter, force one creature to forget the last 6 seconds. They lose their turn." },
    ],
  },
];

/**
 * Canonical specialization colors — visible against black backgrounds.
 * Used in both GM narration prompts and UI theming.
 */
export const SPECIALIZATION_COLORS: Record<string, { name: string; hex: string; hexDim: string; tw: string; twDim: string }> = {
  // Caster
  Druid:     { name: "emerald",  hex: "#34d399", hexDim: "#1a9a6a", tw: "text-emerald-400", twDim: "text-emerald-600" },
  Sorcerer:  { name: "violet",   hex: "#a78bfa", hexDim: "#7c5cbf", tw: "text-violet-400",  twDim: "text-violet-600"  },
  Enchanter: { name: "sky",      hex: "#7dd3fc", hexDim: "#4ba3d4", tw: "text-sky-300",     twDim: "text-sky-500"     },
  // Fighter
  Knight:    { name: "gold",     hex: "#d4a537", hexDim: "#a67c1a", tw: "text-[#d4a537]",   twDim: "text-[#a67c1a]"   },
  Hunter:    { name: "amber",    hex: "#fbbf24", hexDim: "#b8860b", tw: "text-amber-400",   twDim: "text-amber-600"   },
  Marauder:  { name: "red",      hex: "#f87171", hexDim: "#b83c3c", tw: "text-red-400",     twDim: "text-red-600"     },
  // Rogue
  Thief:     { name: "slate",    hex: "#94a3b8", hexDim: "#64748b", tw: "text-slate-400",   twDim: "text-slate-500"   },
  Assassin:  { name: "rose",     hex: "#fb7185", hexDim: "#b34458", tw: "text-rose-400",    twDim: "text-rose-600"    },
  Scout:     { name: "teal",     hex: "#2dd4bf", hexDim: "#1a9a8a", tw: "text-teal-400",    twDim: "text-teal-600"    },
};

/** Get the accent color for a character based on specialization, falling back to gold */
export function getAccentColor(specialization?: string): { hex: string; hexDim: string; tw: string; twDim: string } {
  if (specialization && SPECIALIZATION_COLORS[specialization]) {
    return SPECIALIZATION_COLORS[specialization];
  }
  return { hex: "#d4a537", hexDim: "#a67c1a", tw: "text-[#d4a537]", twDim: "text-[#a67c1a]" };
}

/** Lookup a base class by name */
export function getBaseClass(name: string): BaseClass | undefined {
  return BASE_CLASSES.find((c) => c.name.toLowerCase() === name.toLowerCase());
}

/** Lookup a specialization by name */
export function getSpecialization(name: string): Specialization | undefined {
  return SPECIALIZATIONS.find((s) => s.name.toLowerCase() === name.toLowerCase());
}

/** Get the base class name for a specialization */
export function getBaseClassForSpecialization(specName: string): string | undefined {
  return SPECIALIZATIONS.find((s) => s.name.toLowerCase() === specName.toLowerCase())?.baseClass;
}
