import type { EquipmentItem } from "./types";

type LookupEntry = Pick<EquipmentItem, "type" | "damage" | "properties" | "slots" | "description">;

const EQUIPMENT_DATA: (LookupEntry & { name: string })[] = [
  // ── Weapons ────────────────────────────────────────────────────────────────
  { name: "Club",        type: "weapon", damage: "1d4",  slots: 1, properties: [] },
  { name: "Dagger",      type: "weapon", damage: "1d4",  slots: 1, properties: ["Finesse", "Thrown (near)"] },
  { name: "Greataxe",    type: "weapon", damage: "1d10", slots: 2, properties: ["Two-handed"] },
  { name: "Greatsword",  type: "weapon", damage: "1d10", slots: 2, properties: ["Two-handed"] },
  { name: "Handaxe",     type: "weapon", damage: "1d6",  slots: 1, properties: ["Thrown (near)"] },
  { name: "Javelin",     type: "weapon", damage: "1d4",  slots: 1, properties: ["Thrown (near)"] },
  { name: "Longbow",     type: "weapon", damage: "1d8",  slots: 2, properties: ["Two-handed", "Range: far"] },
  { name: "Longsword",   type: "weapon", damage: "1d8",  slots: 1, properties: ["Versatile (1d10)"] },
  { name: "Mace",        type: "weapon", damage: "1d6",  slots: 1, properties: [] },
  { name: "Shortbow",    type: "weapon", damage: "1d4",  slots: 1, properties: ["Two-handed", "Range: near"] },
  { name: "Shortsword",  type: "weapon", damage: "1d6",  slots: 1, properties: ["Finesse"] },
  { name: "Spear",       type: "weapon", damage: "1d6",  slots: 1, properties: ["Thrown (near)", "Versatile (1d8)"] },
  { name: "Staff",       type: "weapon", damage: "1d4",  slots: 1, properties: ["Two-handed"] },
  { name: "Warhammer",   type: "weapon", damage: "1d8",  slots: 1, properties: ["Versatile (1d10)"] },
  { name: "Crossbow",    type: "weapon", damage: "1d6",  slots: 1, properties: ["Loading", "Two-handed", "Range: far"] },
  { name: "Sling",       type: "weapon", damage: "1d4",  slots: 1, properties: ["Range: near"] },

  // ── Armor ──────────────────────────────────────────────────────────────────
  { name: "Leather",          type: "armor",  slots: 1, description: "AC 11 + DEX mod." },
  { name: "Chainmail",        type: "armor",  slots: 2, description: "AC 13 + DEX mod. Disadvantage on stealth and swimming." },
  { name: "Scale mail",       type: "armor",  slots: 2, description: "AC 13 + DEX mod. Disadvantage on stealth and swimming." },
  { name: "Plate mail",       type: "armor",  slots: 3, description: "AC 15 (no DEX mod). Cannot swim. Disadvantage on stealth." },
  { name: "Mithral chainmail",type: "armor",  slots: 1, description: "AC 13 + DEX mod. No stealth or swim penalty." },
  { name: "Mithral plate",    type: "armor",  slots: 2, description: "AC 15 (no DEX mod). No stealth or swim penalty." },
  { name: "Shield",           type: "shield", slots: 0, description: "+2 AC. Requires one free hand. Cannot wield two-handed weapons." },

  // ── Common gear worth noting ────────────────────────────────────────────────
  { name: "Backpack",        type: "gear", slots: 0, description: "Carries your gear. First one is free (no slot cost)." },
  { name: "Thieves' tools",  type: "gear", slots: 1, description: "Required to attempt picking locks or disarming traps." },
  { name: "Holy symbol",     type: "gear", slots: 0, description: "Required for Priest spellcasting." },
  { name: "Holy water",      type: "gear", slots: 1, description: "Deals 1d6 damage to undead on a direct hit." },
  { name: "Potion of healing",type: "gear", slots: 1, description: "Restore 1d6+1 HP when consumed." },
  { name: "Rope",            type: "gear", slots: 1, description: "60 ft. of hemp rope." },
  { name: "Lantern",         type: "gear", slots: 1, description: "Sheds light in a near radius. Burns oil flasks (1 hour each)." },
  { name: "Oil flask",       type: "gear", slots: 1, description: "1 hour of fuel for a lantern. Can be used as a thrown incendiary." },
  { name: "Torch",           type: "gear", slots: 1, description: "Sheds light in a near radius for 1 hour (real time)." },
  { name: "Spellbook",       type: "gear", slots: 1, description: "Required for Wizard spellcasting. Holds all known spells." },
  { name: "Grappling hook",  type: "gear", slots: 1, description: "Thrown to anchor rope to ledges and overhangs." },
  { name: "Caltrops",        type: "gear", slots: 1, description: "Scatter to slow pursuers. Creatures moving through take 1 damage and halve speed until treated." },
  { name: "Arrows",          type: "ammunition", slots: 1, description: "20 arrows. Required for bows." },
  { name: "Crossbow bolts",  type: "ammunition", slots: 1, description: "20 bolts. Required for crossbows." },
];

const EQUIPMENT_LOOKUP = new Map<string, LookupEntry>(
  EQUIPMENT_DATA.map((e) => {
    const { name, ...rest } = e;
    return [name.toLowerCase(), rest];
  }),
);

/**
 * Enrich a sparse equipment item with static lookup data.
 * Fields already set on the item take precedence; the lookup fills in blanks.
 * Lookup is case-insensitive on name.
 */
export function enrichEquipment(item: EquipmentItem): EquipmentItem {
  const base = EQUIPMENT_LOOKUP.get(item.name.toLowerCase());
  if (!base) return item;
  return {
    ...item,
    type: base.type ?? item.type,
    damage: item.damage || base.damage,
    properties: (item.properties && item.properties.length > 0) ? item.properties : base.properties,
    slots: item.slots ?? base.slots,
    description: item.description || base.description,
  };
}
