import type { Spell } from "./types";

/** Static lookup table for all Shadowdark spells by name (case-insensitive key). */
const SPELL_DATA: Spell[] = [
  // ── Tier 1 Priest ──────────────────────────────────────────────────────────
  { name: "Cure Wounds", tier: 1, range: "Close", duration: "Instant", description: "Heal one creature you touch for 1d8 HP." },
  { name: "Holy Weapon", tier: 1, range: "Close", duration: "Focus", description: "One weapon you touch deals +1d6 radiant damage on each hit." },
  { name: "Sacred Weapon", tier: 1, range: "Close", duration: "Focus", description: "One weapon you touch deals +1d6 radiant damage on each hit." },
  { name: "Protection from Evil", tier: 1, range: "Close", duration: "Focus", description: "One creature you touch gains +1 AC against attacks from chaotic creatures and advantage on saves against their spells and abilities." },
  { name: "Shield of Faith", tier: 1, range: "Close", duration: "Focus", description: "One creature you touch gains +2 AC." },
  { name: "Turn Undead", tier: 1, range: "Near", duration: "1d4+1 rounds", description: "Make a spellcasting check (DC 10 + highest undead level). On success, 1d4 + priest level nearest undead within near range flee." },

  // ── Tier 1 Wizard ───────────────────────────────────────────────────────────
  { name: "Burning Hands", tier: 1, range: "Close (cone)", duration: "Instant", description: "A cone of fire bursts from your hands. All creatures in a close-range cone take 1d6 fire damage." },
  { name: "Charm Person", tier: 1, range: "Near", duration: "Focus", description: "One humanoid you can see must make a WIS check vs your spellcasting roll or regard you as a trusted friend. Broken if you or your allies harm it." },
  { name: "Detect Magic", tier: 1, range: "Near", duration: "Focus", description: "You sense the presence and location of magic within near range. You can determine the school of magic with a DC 12 INT check." },
  { name: "Feather Fall", tier: 1, range: "Near", duration: "Instant", description: "Up to 5 creatures within near range fall gently, taking no falling damage. Lasts until they land." },
  { name: "Floating Disk", tier: 1, range: "Near", duration: "Focus", description: "A floating disk of force appears that can carry up to 20 gear slots of weight. It hovers 3 feet off the ground and follows you." },
  { name: "Light", tier: 1, range: "Close", duration: "1 hour", description: "An object you touch sheds light in a near radius." },
  { name: "Magic Missile", tier: 1, range: "Far", duration: "Instant", description: "A bolt of force strikes one creature you can see for 1d4+1 damage. Automatically hits (no attack roll), but still requires a spellcasting check." },
  { name: "Sleep", tier: 1, range: "Near", duration: "1d4 rounds", description: "2d8 HP worth of creatures within near range fall asleep, starting with the lowest HP creature. Undead and creatures immune to charm are unaffected." },
  { name: "Shield", tier: 1, range: "Self", duration: "Focus", description: "You gain +2 AC. While focusing on this spell, you cannot cast other focus spells." },

  // ── Tier 2 Priest ──────────────────────────────────────────────────────────
  { name: "Blindness/Deafness", tier: 2, range: "Near", duration: "Focus", description: "One creature you can see must make a CON check vs your spellcasting roll or become blinded or deafened (your choice)." },
  { name: "Bless", tier: 2, range: "Near", duration: "Focus", description: "Up to 3 creatures within near range gain +1 to attack rolls and spellcasting checks." },
  { name: "Calm Emotions", tier: 2, range: "Near", duration: "Focus", description: "Hostile creatures within near range must make a WIS check vs your spellcasting roll or become indifferent, ceasing hostile actions. Broken by damage." },
  { name: "Hold Person", tier: 2, range: "Near", duration: "Focus", description: "One humanoid you can see must make a WIS check vs your spellcasting roll or be paralyzed. They repeat the check at the end of each of their turns." },
  { name: "Resist Cold/Fire", tier: 2, range: "Close", duration: "Focus", description: "One creature you touch gains resistance to cold or fire damage (half damage)." },
  { name: "Silence", tier: 2, range: "Near", duration: "Focus", description: "A near-sized area you designate becomes completely silent. No sound enters or leaves. Spells with verbal components cannot be cast inside." },
  { name: "Smite", tier: 2, range: "Close", duration: "Instant", description: "Your next melee attack deals an extra 2d8 radiant damage." },

  // ── Tier 2 Wizard ───────────────────────────────────────────────────────────
  { name: "Acid Arrow", tier: 2, range: "Far", duration: "Instant", description: "A bolt of acid strikes one creature for 2d6 acid damage, plus 1d6 acid damage at the start of its next turn." },
  { name: "Invisibility", tier: 2, range: "Close", duration: "Focus", description: "One creature you touch becomes invisible. Ends if the creature attacks or casts a spell." },
  { name: "Knock", tier: 2, range: "Near", duration: "Instant", description: "A locked door, chest, or object within near range opens. Magically locked items require a spellcasting check vs the lock's DC." },
  { name: "Levitate", tier: 2, range: "Near", duration: "Focus", description: "One creature or object (up to 500 lbs) rises or descends up to 20 ft per round. Horizontal movement is not possible except by pushing off surfaces." },
  { name: "Mirror Image", tier: 2, range: "Self", duration: "Focus", description: "Three illusory duplicates appear. Each time you are attacked, roll d4: on 1, the attack hits you; otherwise it destroys a duplicate." },
  { name: "Misty Step", tier: 2, range: "Self", duration: "Instant", description: "Teleport to an unoccupied space you can see within near range." },
  { name: "Web", tier: 2, range: "Near", duration: "Focus", description: "A near-radius area fills with sticky webs. Creatures in the area are restrained. A STR check vs your spellcasting roll breaks free. Webs are flammable." },

  // ── Tier 3 Priest ──────────────────────────────────────────────────────────
  { name: "Cure Disease", tier: 3, range: "Close", duration: "Instant", description: "Remove one disease from a creature you touch." },
  { name: "Daylight", tier: 3, range: "Far", duration: "Focus", description: "Brilliant sunlight fills a far-radius area centered on a point you choose. Undead in the area have disadvantage on all rolls." },
  { name: "Dispel Magic", tier: 3, range: "Near", duration: "Instant", description: "End one spell effect of tier 3 or lower on a creature or object you can see. For higher tier spells, make a spellcasting check vs DC 10 + spell tier." },
  { name: "Prayer", tier: 3, range: "Near", duration: "Focus", description: "All allies within near range gain +1 to all attack rolls, ability checks, and spellcasting checks." },
  { name: "Remove Curse", tier: 3, range: "Close", duration: "Instant", description: "Remove one curse from a creature you touch." },
  { name: "Speak with Dead", tier: 3, range: "Close", duration: "3 questions", description: "A corpse you touch answers up to 3 questions. It knows only what it knew in life and is not compelled to be truthful." },

  // ── Tier 3 Wizard ───────────────────────────────────────────────────────────
  { name: "Fireball", tier: 3, range: "Far", duration: "Instant", description: "A ball of fire explodes in a near-radius area at a point you can see. All creatures in the area take 4d6 fire damage (half on DEX check vs your spellcasting roll)." },
  { name: "Fly", tier: 3, range: "Close", duration: "Focus", description: "One creature you touch gains a flying speed equal to its walking speed." },
  { name: "Haste", tier: 3, range: "Close", duration: "Focus", description: "One creature gains an extra action each turn and +2 AC. When the spell ends, the creature loses its next turn." },
  { name: "Lightning Bolt", tier: 3, range: "Far (line)", duration: "Instant", description: "A bolt of lightning arcs in a straight line to far range. All creatures in the line take 4d6 lightning damage (half on DEX check vs your spellcasting roll)." },
  { name: "Counterspell", tier: 3, range: "Near", duration: "Instant", description: "As a reaction when you see a creature casting a spell, make a spellcasting check. If your result ≥ 10 + the spell's tier, the spell is countered." },

  // ── Tier 4 Priest ──────────────────────────────────────────────────────────
  { name: "Banish", tier: 4, range: "Near", duration: "Focus", description: "One extraplanar creature must make a WIS check vs your spellcasting roll or be banished to its home plane. If you maintain focus for the full duration, the banishment is permanent." },
  { name: "Heal", tier: 4, range: "Close", duration: "Instant", description: "One creature you touch regains 4d8+4 HP." },
  { name: "Raise Dead", tier: 4, range: "Close", duration: "Instant", description: "A creature that died within the last 3 days is restored to life with 1 HP. The creature takes a permanent -1 penalty to all rolls until a full rest." },
  { name: "Restore", tier: 4, range: "Close", duration: "Instant", description: "Remove all stat damage, blindness, deafness, or paralysis from one creature you touch." },

  // ── Tier 4 Wizard ───────────────────────────────────────────────────────────
  { name: "Dimension Door", tier: 4, range: "Far", duration: "Instant", description: "You teleport to a location you can see or describe within far range. You can bring one willing creature of your size or smaller." },
  { name: "Polymorph", tier: 4, range: "Near", duration: "Focus", description: "Transform one creature into a beast of equal or lower level. The target uses the beast's stats but retains its own mind. At 0 HP, it reverts." },
  { name: "Stoneskin", tier: 4, range: "Close", duration: "Focus", description: "One creature you touch resists all non-magical physical damage (half damage)." },
  { name: "Wall of Fire", tier: 4, range: "Near", duration: "Focus", description: "A wall of fire up to near distance long and 20 ft high appears. Creatures that pass through take 4d6 fire damage. Creatures within close range of one side take 2d6 fire damage at the start of their turn." },

  // ── Tier 5 Priest ──────────────────────────────────────────────────────────
  { name: "Divine Intervention", tier: 5, range: "Self", duration: "Instant", description: "Your deity directly intervenes. Describe your plea. The GM determines the outcome, which should be miraculous but not omnipotent." },
  { name: "Flame Strike", tier: 5, range: "Far", duration: "Instant", description: "A column of divine fire strikes a near-radius area. All creatures in the area take 6d8 radiant/fire damage (half on DEX check vs your spellcasting roll)." },
  { name: "True Resurrection", tier: 5, range: "Close", duration: "Instant", description: "A creature dead for any length of time is restored to life with full HP, provided its soul is willing. Requires 1,000 gp of sacred materials consumed in the casting." },

  // ── Tier 5 Wizard ───────────────────────────────────────────────────────────
  { name: "Cloudkill", tier: 5, range: "Far", duration: "Focus", description: "A near-radius cloud of toxic gas fills an area. Creatures inside take 4d6 poison damage at the start of each turn (half on CON check vs your spellcasting roll). The cloud moves each round." },
  { name: "Hold Monster", tier: 5, range: "Near", duration: "Focus", description: "One creature must make a WIS check vs your spellcasting roll or be paralyzed. It repeats the check at the end of each of its turns." },
  { name: "Teleport", tier: 5, range: "Close", duration: "Instant", description: "You and up to 5 willing creatures you touch teleport to a familiar location on the same plane of existence." },
  { name: "Power Word Kill", tier: 5, range: "Near", duration: "Instant", description: "One creature you can see with 50 HP or fewer dies instantly. No saving throw." },
];

const SPELL_LOOKUP = new Map<string, Spell>(
  SPELL_DATA.map((s) => [s.name.toLowerCase(), s as Spell]),
);

/**
 * Enrich a sparse spell object with static spell data.
 * If the spell already has description/range/duration, those are kept as-is.
 * Lookup is case-insensitive on name.
 */
export function enrichSpell(spell: Spell): Spell {
  const base = SPELL_LOOKUP.get(spell.name.toLowerCase());
  if (!base) return spell;
  return {
    name: spell.name,
    tier: spell.tier ?? base.tier,
    range: spell.range || base.range,
    duration: spell.duration || base.duration,
    description: spell.description || base.description,
  };
}
