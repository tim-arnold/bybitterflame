/**
 * Downtime activity data — class-specific outcome tables.
 * Matches the rules in src/lib/rules/downtime.md.
 */

export interface DowntimeTier {
  tier: number;
  goldCost: number;
  xpEarned: number;
  rollBonus: number;
  description: string;
}

export const DOWNTIME_TIERS: DowntimeTier[] = [
  { tier: 1, goldCost: 25,   xpEarned: 1, rollBonus: 0, description: "A short diversion — an evening's worth of activity" },
  { tier: 2, goldCost: 75,   xpEarned: 2, rollBonus: 1, description: "A full day of pursuit in town" },
  { tier: 3, goldCost: 200,  xpEarned: 3, rollBonus: 1, description: "Several days of focused effort" },
  { tier: 4, goldCost: 500,  xpEarned: 4, rollBonus: 2, description: "A full week of dedicated work" },
  { tier: 5, goldCost: 1200, xpEarned: 5, rollBonus: 3, description: "Two weeks of total commitment to your craft" },
];

export interface DowntimeOutcome {
  roll: number;
  title: string;
  description: string;
}

/** Map of base class → downtime activity name */
export const DOWNTIME_ACTIVITY_NAMES: Record<string, string> = {
  Fighter: "Carousing",
  Rogue: "Wheeling & Dealing",
  Caster: "Studying",
};

/** Fighter — Carousing outcomes (d10 + tier bonus, results 1-14) */
export const FIGHTER_OUTCOMES: DowntimeOutcome[] = [
  { roll: 1, title: "Jailbird", description: "You wake up in a cell. Lose half the gold you spent carousing and owe a fine equal to the other half. The town guard knows your face now." },
  { roll: 2, title: "Marked", description: "You boasted about a recent kill to the wrong crowd. A dead creature's kin — or its master — heard about it. Someone in the tavern was watching. The GM introduces a tracker or threat in the next adventure." },
  { roll: 3, title: "The Wrong Toast", description: "You raised your cup to a figure from local legend without knowing the custom — now you're honor-bound to do a deed for the community. Lose 1d6 gold to \"good faith\" donations. An NPC will remind you of the promise." },
  { roll: 4, title: "Bruised but Standing", description: "Standard night out. Some bruises, some stories. You gained XP and a headache. No other effects." },
  { roll: 5, title: "Good Scrap", description: "You won a fighting pit, arm-wrestling match, or drinking contest. Gain 1d6 extra gold from side bets." },
  { roll: 6, title: "War Story", description: "Your tales impressed a veteran. They share a tactical insight — advantage on your next combat initiative roll." },
  { roll: 7, title: "Old Soldier's Gift", description: "A retired fighter is impressed by your spirit and gives you a well-worn but serviceable weapon or piece of armor (GM chooses, mundane quality)." },
  { roll: 8, title: "Reputation", description: "Word spreads about you. NPCs in this settlement recognize you favorably. Next time you need a favor here, you get it — no check required." },
  { roll: 9, title: "Campfire Oath", description: "An old soldier shares the fire and asks for your help retrieving something personal from a nearby ruin — a family heirloom, a fallen comrade's weapon. If you agree, the GM adds a short side-quest. The soldier's gratitude is worth a future favor." },
  { roll: 10, title: "Challenge Accepted", description: "A traveling knight or mercenary challenges you to a formal bout. If you accept and win, gain a fine weapon or 2d10 gold. The GM runs it as one-on-one combat." },
  { roll: 11, title: "The Old Songs", description: "A bard sings a song about something in the Underways — a specific ruin, a treasure, a creature. The GM gives you a real lead on a nearby adventure." },
  { roll: 12, title: "Folk Hero", description: "You stopped a fight, defended someone, or did something the whole tavern remembers. Famous in this settlement. Free lodging and meals whenever you return." },
  { roll: 13, title: "Strange Challenger", description: "Something not quite human challenges you — a Hob at darts, a Fey at riddles, a Knocker at arm-wrestling. If you win, they owe you a favor. Fey bargains are always interesting." },
  { roll: 14, title: "Legendary Night", description: "They'll tell this story for years. Gain double XP. Something permanently changes in this settlement because of what you did." },
];

/** Rogue — Wheeling & Dealing outcomes (d10 + tier bonus, results 1-14) */
export const ROGUE_OUTCOMES: DowntimeOutcome[] = [
  { roll: 1, title: "Double-Crossed", description: "Your fence sold you out. Lose all gold spent and a local criminal faction now considers you a liability. Watch your back." },
  { roll: 2, title: "Bad Bet", description: "Gambling run went south. Lose an extra 1d10 gold. Someone holds your marker — they'll come collecting." },
  { roll: 3, title: "Hot Goods", description: "You bought something stolen from someone dangerous. Worth 2d6 gold if you can fence it elsewhere, but deal with the consequences." },
  { roll: 4, title: "Quiet Night", description: "Nothing exciting. You moved some goods, played some cards. No effects beyond XP." },
  { roll: 5, title: "Good Hand", description: "Solid night at the tables. Gain 1d8 extra gold from gambling winnings." },
  { roll: 6, title: "Useful Rumor", description: "You overheard something valuable — a merchant's schedule, a guard rotation, a hidden stash. The GM gives you actionable intelligence." },
  { roll: 7, title: "Black Market Find", description: "A dealer has something unusual — a vial of poison, lockpicks, a forged document. You can buy it at half price (GM sets item and cost)." },
  { roll: 8, title: "New Contact", description: "You've built a relationship with a useful underworld figure — a fence, a forger, a smuggler. They'll do business in the future." },
  { roll: 9, title: "Inside Job", description: "A contact tips you off to an easy score. The GM sets up a short heist opportunity for next session." },
  { roll: 10, title: "The Tall Tale", description: "You convinced someone of something completely untrue, and it worked out brilliantly. Gain 2d6 gold and a false reputation (you choose what they believe about you)." },
  { roll: 11, title: "A Whisper in the Dark", description: "A hooded stranger offers information about the Underways — a map fragment, a warning, a name. It's real and valuable." },
  { roll: 12, title: "Guild Standing", description: "The local thieves' guild has noticed you. Offered membership or alliance. Access to safehouses, fences, and jobs in this region." },
  { roll: 13, title: "Trickster's Bargain", description: "A Fey or spirit approaches with a deal — a powerful item or information in exchange for a favor to be named later. The favor will come at the worst possible time, but the reward is real." },
  { roll: 14, title: "The Big Score", description: "You stumbled into something huge — a noble's secret, a hidden vault, a smuggling route. Gain double XP. The GM introduces a major opportunity and risk." },
];

/** Caster — Studying outcomes (d10 + tier bonus, results 1-14) */
export const CASTER_OUTCOMES: DowntimeOutcome[] = [
  { roll: 1, title: "Experiment Gone Wrong", description: "Something exploded, cursed you, or attracted attention. Gain 2 Toll. Something in the area is now aware of you." },
  { roll: 2, title: "Forbidden Text", description: "You read something you shouldn't have. Useful but disturbing. Gain 1 Toll and nightmares for a week." },
  { roll: 3, title: "Dead End", description: "Texts were incomplete, reagents impure, meditation led nowhere. No effects beyond XP." },
  { roll: 4, title: "Quiet Progress", description: "Steady work. Deepened your understanding. No special effects beyond XP." },
  { roll: 5, title: "Useful Formula", description: "A more efficient preparation method. Reduce the Toll of your next spell by 1 (minimum 0). One-time use." },
  { roll: 6, title: "Lore Fragment", description: "Old knowledge — a creature's weakness, a location's history, a forgotten custom. The GM shares one useful fact." },
  { roll: 7, title: "Rare Ingredient", description: "One dose — when used as a component, your next spell overcasts (as nat 20, but pay normal Toll)." },
  { roll: 8, title: "Mentor's Letter", description: "An older caster heard about your work. Learn one cantrip you don't already know." },
  { roll: 9, title: "Breakthrough", description: "Genuine insight into your path's magic. Reduce current Toll by 1d4." },
  { roll: 10, title: "Old Manuscript", description: "A text describing a spell one tier above your current highest (if available). When you reach that tier, learn it as a bonus spell." },
  { roll: 11, title: "Echoes from Below", description: "Your studies revealed something about the Underways — a builders' glyph, a resonance pattern, a warning. The GM works it into the campaign." },
  { roll: 12, title: "Collegial Respect", description: "A local scholar or sage is impressed. Ongoing correspondence — a source of lore between sessions." },
  { roll: 13, title: "The Green Whispers / The Dark Answers / The Veil Thins", description: "Something from your magic's source reaches out. Reduce Toll by 3, but the GM narrates a strange condition or vision. The gift is real. The strings are unclear." },
  { roll: 14, title: "Revelation", description: "You've touched something profound. Gain double XP. Learn one spell from your path list (current tier or lower). The insight permanently changes how your magic manifests." },
];

/** Get the outcome table for a character's base class */
export function getDowntimeOutcomes(characterClass: string): DowntimeOutcome[] {
  switch (characterClass) {
    case "Fighter": return FIGHTER_OUTCOMES;
    case "Rogue": return ROGUE_OUTCOMES;
    case "Caster": return CASTER_OUTCOMES;
    default: return FIGHTER_OUTCOMES;
  }
}

/** Get the downtime activity name for a character's class */
export function getDowntimeActivityName(characterClass: string): string {
  return DOWNTIME_ACTIVITY_NAMES[characterClass] ?? "Carousing";
}
