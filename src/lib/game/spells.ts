import type { Spell } from "./types";

/** Static lookup table for all spells by name (case-insensitive key). */
const SPELL_DATA: Spell[] = [
  // ── Cantrips (Tier 0, Toll cost: 0) ──────────────────────────────────────
  { name: "Ember", tier: 0, range: "Close", duration: "Instant", description: "Conjure a small flame in your palm. Lights a torch, starts a campfire, or singes something small." },
  { name: "Whisper", tier: 0, range: "Near", duration: "Instant", description: "Send a short spoken message to one creature you can see. Only they hear it." },
  { name: "Mend", tier: 0, range: "Close", duration: "Instant", description: "Repair a small break or tear in a nonliving object (cracked pot, torn cloak, snapped rope)." },
  { name: "Chill", tier: 0, range: "Close", duration: "Instant", description: "Extinguish a small flame, or cool an object to freezing cold for a moment." },
  { name: "Glimmer", tier: 0, range: "Close", duration: "10 minutes", description: "Make an object glow faintly for 10 minutes. Not as bright as a torch — enough to read by or mark a path." },
  { name: "Nudge", tier: 0, range: "Near", duration: "Instant", description: "Move a small unattended object (up to a few pounds) within near range. A shove, not a throw." },
  { name: "Mask", tier: 0, range: "Self", duration: "1 minute", description: "Change your face and voice for 1 minute. Close inspection reveals the illusion." },
  { name: "Sting", tier: 0, range: "Close", duration: "Instant", description: "A jolt of pain to one creature at close range. No real damage — enough to startle, distract, or wake someone." },
  { name: "Hush", tier: 0, range: "Self", duration: "1 minute", description: "Suppress all sound you make for 1 minute. Footsteps, voice, gear — silent." },
  { name: "Sniff", tier: 0, range: "Near", duration: "Instant", description: "Sense the strongest magical presence within near range, if any. Direction only, not details." },
  { name: "Thorn", tier: 0, range: "Close", duration: "Instant", description: "Grow a sharp spike from any natural surface (wood, stone, earth). Useful, not weaponizable." },
  { name: "Trinket", tier: 0, range: "Close", duration: "1 hour", description: "Conjure a tiny, worthless object (a button, a feather, a pebble) that lasts an hour then vanishes." },
  { name: "Sour", tier: 0, range: "Close", duration: "Instant", description: "Spoil a small amount of food or drink. Alternatively, purify spoiled food back to edible." },
  { name: "Wilt", tier: 0, range: "Close", duration: "Instant", description: "Cause a small plant to wither, or revive a recently wilted one." },
  { name: "Echo", tier: 0, range: "Near", duration: "Instant", description: "Throw your voice to any point within near range for a few seconds." },
  { name: "Flicker", tier: 0, range: "Near", duration: "Instant", description: "Create a brief visual distraction — a flash, a shadow darting, a shape in the corner of someone's eye." },
  { name: "Warm", tier: 0, range: "Close", duration: "1 hour", description: "Keep one creature comfortably warm (or cool) for an hour regardless of weather." },
  { name: "Knot", tier: 0, range: "Near", duration: "Instant", description: "Tie or untie a knot at near range. Works on rope, string, laces — not chains or bindings." },
  { name: "Taste", tier: 0, range: "Close", duration: "Instant", description: "Touch a substance and know if it's poisonous, magical, or neither." },
  { name: "Lull", tier: 0, range: "Close", duration: "Instant", description: "One creature you touch feels calm and drowsy for a few minutes. Doesn't work in combat or on the unwilling." },

  // ── Tier 1 — Neutral (all Casters) ────────────────────────────────────────
  { name: "Mend Wounds", tier: 1, range: "Close", duration: "Instant", description: "Touch a creature to restore 1d6 HP." },
  { name: "Rooting", tier: 1, range: "Near", duration: "1 round", description: "Thick roots erupt from the ground and hold one creature at near range in place for 1 round. STR check to break free." },
  { name: "Bark Shield", tier: 1, range: "Self", duration: "1 encounter", description: "Your skin hardens like bark. +2 to armor for one encounter (concentration, Brief)." },
  { name: "Speak with Beasts", tier: 1, range: "Self", duration: "10 minutes", description: "You can communicate with animals for 10 minutes (concentration, Sustained). They're not obligated to help." },
  { name: "Shadowbolt", tier: 1, range: "Near", duration: "Instant", description: "Hurl a bolt of dark energy at one creature within near range. 1d8 damage." },
  { name: "Smother", tier: 1, range: "Near", duration: "Instant", description: "Extinguish all nonmagical light sources within near range. Torches, lanterns, campfires — gone." },
  { name: "Wither", tier: 1, range: "Close", duration: "Instant", description: "Touch a creature. 1d4 damage and a wave of exhaustion — disadvantage on their next action." },
  { name: "Dread Visage", tier: 1, range: "Close", duration: "1 round", description: "Your face becomes terrifying for an instant. One creature at close range must make a WIS save or flee for 1 round." },
  { name: "Glamour", tier: 1, range: "Near", duration: "1 minute", description: "One creature within near range sees you as trustworthy and friendly for 1 minute (concentration, Brief). Doesn't work in combat. Ends if you harm them." },
  { name: "Phantasm", tier: 1, range: "Near", duration: "10 minutes", description: "Create a visual illusion up to human-sized within near range. Lasts 10 minutes (concentration, Sustained). No sound, no substance." },
  { name: "Read Intent", tier: 1, range: "Near", duration: "Instant", description: "You know the surface emotional state and immediate intention of one creature you can see. One moment, not ongoing." },
  { name: "Fog", tier: 1, range: "Near", duration: "1 minute", description: "A bank of thick mist fills a near-range area for 1 minute (concentration, Brief). Blocks line of sight." },

  // ── Tier 2 — Druid ────────────────────────────────────────────────────────
  { name: "Steelgrain", tier: 2, range: "Close", duration: "1 hour", description: "Touch a wooden object (staff, door, shield) — it becomes hard as steel for 1 hour." },
  { name: "Thornwall", tier: 2, range: "Near", duration: "Concentration, Brief", description: "A wall of tangled thorns erupts in a line at near range. Blocks movement; creatures that push through take 2d4 damage." },
  { name: "Soothe", tier: 2, range: "Close", duration: "Instant", description: "Touch a creature to heal 2d6 HP and remove one condition (poisoned, frightened, blinded)." },
  { name: "Beastcall", tier: 2, range: "Near", duration: "Concentration, Brief", description: "Summon a nearby wild animal to aid you. It fights or scouts for one encounter, then leaves. GM picks the animal based on terrain." },
  { name: "Stonefoot", tier: 2, range: "Close", duration: "Concentration, Brief", description: "You and allies within close range can't be knocked prone or moved against your will for 1 minute." },
  { name: "Purge Rot", tier: 2, range: "Close", duration: "Instant", description: "Cure one disease or neutralize one poison in a creature you touch. Also works on spoiled food/water in bulk." },

  // ── Tier 2 — Sorcerer ─────────────────────────────────────────────────────
  { name: "Void Blade", tier: 2, range: "Self", duration: "Concentration, Brief", description: "Conjure a blade of solid darkness. Melee weapon, 1d8+INT mod damage, lasts one encounter." },
  { name: "Duskfire", tier: 2, range: "Close", duration: "Instant", description: "A burst of cold black flame hits all creatures in a close-range area. 2d6 damage. Doesn't produce light — it consumes it." },
  { name: "Hollow Voice", tier: 2, range: "Near", duration: "Instant", description: "Speak a command word. One creature at near range obeys a single one-word command (flee, drop, kneel, stop). WIS save negates." },
  { name: "Nighteyes", tier: 2, range: "Self", duration: "Concentration, Lasting", description: "See in total darkness as if dim light, out to far range. Lasts 1 hour. Your eyes turn black." },
  { name: "Flay", tier: 2, range: "Close", duration: "2 rounds", description: "Touch a creature. 2d4 damage, and they bleed for 1d4 damage at the start of their next 2 turns. No concentration." },
  { name: "Dread Shroud", tier: 2, range: "Self", duration: "Concentration, Brief", description: "Shadows cling to you. All enemies within close range have disadvantage on attacks against you for 1 minute." },

  // ── Tier 2 — Enchanter ─────────────────────────────────────────────────────
  { name: "Veil", tier: 2, range: "Close", duration: "Concentration, Sustained", description: "You and up to 3 allies within close range become invisible for 10 minutes. Breaks on any hostile action." },
  { name: "Puppeteer", tier: 2, range: "Near", duration: "1 round", description: "One creature at near range repeats its last action on its next turn, believing it chose to. WIS save negates." },
  { name: "Mirage", tier: 2, range: "Near", duration: "Concentration, Sustained", description: "Create an illusory scene up to a near-range area — a bridge over a chasm, a wall across a corridor, a campfire in an empty room. Looks and sounds real. Lasts 10 minutes." },
  { name: "Thought Snare", tier: 2, range: "Near", duration: "Concentration, Brief", description: "Read the surface thoughts of one creature within near range for 1 minute. They don't know unless you probe deeper (WIS save to detect)." },
  { name: "Bewitch", tier: 2, range: "Near", duration: "Concentration, Sustained", description: "One creature at near range regards you as a trusted friend for 10 minutes. They'll talk, share information, and let you pass — but won't fight for you. WIS save negates. Ends if harmed." },
  { name: "Scatter Image", tier: 2, range: "Self", duration: "Concentration, Brief", description: "Create 4 illusory copies of yourself. Each absorbs one attack before vanishing." },

  // ── Tier 3 — Druid ────────────────────────────────────────────────────────
  { name: "Wellspring", tier: 3, range: "Near", duration: "Instant", description: "Heal all allies within near range for 2d6 HP. The ground blooms where they stand." },
  { name: "Briarcage", tier: 3, range: "Near", duration: "Concentration, Brief", description: "A cage of living thorns traps one large or smaller creature at near range. 3d4 damage on entry, STR check each round to escape." },
  { name: "Root Vision", tier: 3, range: "Self", duration: "1 minute", description: "Touch natural ground. You sense everything within far range — creatures, water, structures, tunnels. Takes 1 minute of meditation." },
  { name: "Swift Passage", tier: 3, range: "Close", duration: "Concentration, Sustained", description: "You and up to 3 allies move at double speed and can walk across water, mud, and unstable surfaces for 10 minutes." },
  { name: "Regrow", tier: 3, range: "Close", duration: "Instant", description: "Touch a creature to restore a lost limb, repair a broken bone, or heal a lasting injury. Does not restore HP." },

  // ── Tier 3 — Sorcerer ─────────────────────────────────────────────────────
  { name: "Blackfire", tier: 3, range: "Near", duration: "Instant", description: "A column of dark flame erupts at near range. All creatures in a close-range area take 3d6 damage. The fire burns cold and leaves no light." },
  { name: "Raise Shade", tier: 3, range: "Close", duration: "Concentration, Brief", description: "Animate the shadow of a recently dead creature (within 1 hour of death). It fights for you for one encounter — same stats as the original but half HP." },
  { name: "Soul Rend", tier: 3, range: "Near", duration: "Instant", description: "One creature at near range takes 2d8 damage and can't be healed until the end of their next turn. You feel their pain — take 1d4 damage yourself." },
  { name: "Suffocate", tier: 3, range: "Near", duration: "Concentration, Brief", description: "One creature at near range begins choking. Can't speak or cast spells. 1d6 damage per round. CON save each round to break free." },
  { name: "Cloak of Dread", tier: 3, range: "Near", duration: "1 minute", description: "Every creature within near range that can see you makes a WIS save or is frightened for 1 minute. Frightened creatures can re-save each round." },

  // ── Tier 3 — Enchanter ─────────────────────────────────────────────────────
  { name: "Grand Illusion", tier: 3, range: "Near", duration: "Concentration, Lasting", description: "Create an illusion up to the size of a building within near range. Sight, sound, smell, and temperature. Lasts 1 hour." },
  { name: "Dominate", tier: 3, range: "Near", duration: "1 round", description: "Take control of one creature at near range for 1 round. They take whatever action you choose. WIS save negates. On a failed save, the creature doesn't realize what happened." },
  { name: "Mindscrub", tier: 3, range: "Near", duration: "Instant", description: "One creature at near range forgets the last 10 minutes. WIS save negates. On failure, the gap feels natural — they don't realize anything is missing." },
  { name: "Maze of Mirrors", tier: 3, range: "Near", duration: "Concentration, Brief", description: "One creature at near range is trapped in an illusory labyrinth inside their own mind. Physically incapacitated. INT check each round to escape." },
  { name: "Borrowed Face", tier: 3, range: "Self", duration: "Concentration, Lasting", description: "Perfectly assume the appearance, voice, and mannerisms of a specific person you've observed for at least 1 hour. Lasts 1 hour. Even close friends are fooled." },

  // ── Tier 4 — Druid ────────────────────────────────────────────────────────
  { name: "Renewal", tier: 4, range: "Close", duration: "Instant", description: "Touch a creature. They regain all lost HP. Can only be cast once per rest." },
  { name: "Awaken Grove", tier: 4, range: "Near", duration: "Concentration, Brief", description: "Trees and plants in a near-range area come alive and fight for you. They grapple, strike, and block — treat as 3 creatures with moderate stats." },
  { name: "Stormcall", tier: 4, range: "Near", duration: "Concentration, Brief", description: "Summon a localized storm. Lightning strikes one target per round for 3d8 damage (DEX save for half). Rain and wind impose disadvantage on ranged attacks." },
  { name: "Landcraft", tier: 4, range: "Near", duration: "Instant", description: "Reshape up to a near-range area of natural stone, earth, or wood. Open a passage, seal a tunnel, raise a wall, create a bridge. The change is permanent." },

  // ── Tier 4 — Sorcerer ─────────────────────────────────────────────────────
  { name: "Void Bolt", tier: 4, range: "Far", duration: "Instant", description: "A beam of pure darkness strikes one creature at far range. 4d8 damage. If this kills the target, their body crumbles to ash. Nothing to raise." },
  { name: "Death Grip", tier: 4, range: "Near", duration: "Concentration, Brief", description: "One creature at near range is paralyzed as shadow tendrils constrict them. 2d6 damage per round. STR save each round to break free." },
  { name: "Desolation", tier: 4, range: "Near", duration: "Instant", description: "All living things in a near-range area wither. Creatures take 3d6 damage (CON save for half). Plants die. Water turns brackish. The area remains dead for days." },
  { name: "Dark Pact", tier: 4, range: "Close", duration: "Instant", description: "Touch a willing creature. Transfer any amount of your HP to them, or their HP to you. No save if willing. On an unwilling creature, WIS save negates — if it works, drain 3d6 HP from them." },

  // ── Tier 4 — Enchanter ─────────────────────────────────────────────────────
  { name: "Living Nightmare", tier: 4, range: "Near", duration: "Concentration, Brief", description: "One creature at near range is trapped in a waking nightmare tailored to their deepest fear. Incapacitated and takes 2d6 psychic damage per round. WIS save each round to escape." },
  { name: "Mass Glamour", tier: 4, range: "Near", duration: "Concentration, Sustained", description: "All creatures within near range (up to 10) regard you as a trusted ally for 10 minutes. WIS save negates individually. Those who fail don't realize they've been enchanted." },
  { name: "Reshape Memory", tier: 4, range: "Close", duration: "Instant", description: "Alter up to 1 hour of a creature's memories. You choose what they remember instead. WIS save negates. On failure, the new memories feel completely real. Permanent until dispelled." },
  { name: "Vanishing Act", tier: 4, range: "Close", duration: "Concentration, Lasting", description: "You and up to 5 allies become invisible and inaudible for 1 hour. Doesn't break on hostile action — only on taking damage." },

  // ── Tier 5 — Druid ────────────────────────────────────────────────────────
  { name: "Sanctuary", tier: 5, range: "Near", duration: "Concentration, Lasting", description: "Create a zone of absolute safety in a near-range area. No violence can occur within it — weapons won't swing, spells fizzle, claws refuse to strike. Lasts 1 hour." },
  { name: "Reclamation", tier: 5, range: "Close", duration: "Instant", description: "Touch a dead creature (dead no more than 1 day). Life floods back — they return at half HP with no conditions. They remember everything, including death. This spell costs the caster 5 years of their natural lifespan." },
  { name: "Wrath of the Green", tier: 5, range: "Far", duration: "Instant", description: "The land itself attacks your enemies. In a far-range area, the ground splits, trees lash, stones hurl, vines drag. Every enemy takes 5d8 damage (DEX save for half) and is restrained. The landscape is permanently altered." },

  // ── Tier 5 — Sorcerer ─────────────────────────────────────────────────────
  { name: "Annihilate", tier: 5, range: "Near", duration: "Instant", description: "A sphere of absolute void expands from a point at near range. Everything in a close-range area takes 6d10 damage. No save. Objects are destroyed. The area is left as a perfect sphere of nothing." },
  { name: "Unmaking", tier: 5, range: "Close", duration: "3 rounds", description: "Touch a creature. Their body begins to dissolve. 4d10 damage per round for 3 rounds. CON save each round to end the effect. If this kills them, nothing remains." },
  { name: "Dark Ascension", tier: 5, range: "Self", duration: "1 minute", description: "For 1 minute, you become something else. Fly, see in all darkness, immune to nonmagical damage, your spells deal double damage. When it ends, gain 5 Toll. This cannot be reduced by Dark Harvest or any other ability." },

  // ── Tier 5 — Enchanter ─────────────────────────────────────────────────────
  { name: "Rewrite", tier: 5, range: "Close", duration: "Instant", description: "Permanently alter one creature's personality, loyalties, or beliefs. They believe the change is who they've always been. WIS save negates, and on failure the target gets a new save once per month. Requires 10 minutes of uninterrupted contact." },
  { name: "Waking Dream", tier: 5, range: "Near", duration: "Concentration, Lasting", description: "Reshape reality in a near-range area for 1 hour. Walls appear or vanish, gravity shifts, terrain transforms. It's not illusion — it's real for the duration. When it ends, everything reverts." },
  { name: "Erasure", tier: 5, range: "Near", duration: "1 day", description: "One creature at near range ceases to exist in the minds of everyone except you. No one remembers them. Their belongings seem ownerless. Lasts 1 day. WIS save negates. If the target dies during the effect, the erasure is permanent." },
];

const SPELL_LOOKUP = new Map<string, Spell>(
  SPELL_DATA.map((s) => [s.name.toLowerCase(), s as Spell]),
);

/**
 * Canonical spell name lists per class/path per tier, used for the level-up spell picker.
 * "Caster" key covers cantrips (tier 0) and neutral T1 spells — shared by all Casters.
 * Path keys (Druid/Sorcerer/Enchanter) cover T2-T5 spells specific to each specialization.
 */
export const CLASS_SPELLS: Record<string, Record<number, string[]>> = {
  Caster: {
    0: [
      "Ember", "Whisper", "Mend", "Chill", "Glimmer", "Nudge", "Mask", "Sting", "Hush", "Sniff",
      "Thorn", "Trinket", "Sour", "Wilt", "Echo", "Flicker", "Warm", "Knot", "Taste", "Lull",
    ],
    1: [
      "Mend Wounds", "Rooting", "Bark Shield", "Speak with Beasts",
      "Shadowbolt", "Smother", "Wither", "Dread Visage",
      "Glamour", "Phantasm", "Read Intent", "Fog",
    ],
  },
  Druid: {
    2: ["Steelgrain", "Thornwall", "Soothe", "Beastcall", "Stonefoot", "Purge Rot"],
    3: ["Wellspring", "Briarcage", "Root Vision", "Swift Passage", "Regrow"],
    4: ["Renewal", "Awaken Grove", "Stormcall", "Landcraft"],
    5: ["Sanctuary", "Reclamation", "Wrath of the Green"],
  },
  Sorcerer: {
    2: ["Void Blade", "Duskfire", "Hollow Voice", "Nighteyes", "Flay", "Dread Shroud"],
    3: ["Blackfire", "Raise Shade", "Soul Rend", "Suffocate", "Cloak of Dread"],
    4: ["Void Bolt", "Death Grip", "Desolation", "Dark Pact"],
    5: ["Annihilate", "Unmaking", "Dark Ascension"],
  },
  Enchanter: {
    2: ["Veil", "Puppeteer", "Mirage", "Thought Snare", "Bewitch", "Scatter Image"],
    3: ["Grand Illusion", "Dominate", "Mindscrub", "Maze of Mirrors", "Borrowed Face"],
    4: ["Living Nightmare", "Mass Glamour", "Reshape Memory", "Vanishing Act"],
    5: ["Rewrite", "Waking Dream", "Erasure"],
  },
};

/**
 * Returns all available spells of a given tier for a class/path,
 * excluding any spells the character already knows.
 *
 * Use "Caster" for cantrips (tier 0) and neutral T1 spells.
 * Use the specialization name (Druid/Sorcerer/Enchanter) for T2+ path spells.
 */
export function getAvailableSpellsForPicker(
  classOrPath: string,
  tier: number,
  knownSpellNames: string[],
): Spell[] {
  const names = CLASS_SPELLS[classOrPath]?.[tier] ?? [];
  const known = new Set(knownSpellNames.map((n) => n.toLowerCase()));
  return names
    .filter((name) => !known.has(name.toLowerCase()))
    .map((name) => enrichSpell({ name, tier, range: "", duration: "", description: "" }));
}

/**
 * Enrich a sparse spell object with static spell data.
 * If the spell already has description/range/duration, those are kept as-is.
 * Lookup is case-insensitive on name.
 */
export function enrichSpell(spell: Spell): Spell {
  // Strip parenthetical suffixes the AI sometimes embeds in the name
  // e.g. "Mend Wounds (touch, 1d6)" → "Mend Wounds"
  const cleanName = spell.name.replace(/\s*\([^)]*\)\s*$/, "").trim();
  const base = SPELL_LOOKUP.get(cleanName.toLowerCase());
  if (!base) return { ...spell, name: cleanName };
  return {
    name: base.name, // always use the canonical name from the lookup table
    tier: spell.tier ?? base.tier,
    range: spell.range || base.range,
    duration: spell.duration || base.duration,
    description: spell.description || base.description,
  };
}
