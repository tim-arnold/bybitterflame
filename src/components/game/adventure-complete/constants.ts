import { DOWNTIME_TIERS, getDowntimeOutcomes, type DowntimeOutcome } from "@/lib/game/downtime";

export { DOWNTIME_TIERS };

/** Get the exact-match downtime outcome for a roll result and character class. */
export function getDowntimeOutcomeForRoll(roll: number, characterClass: string): DowntimeOutcome {
  const outcomes = getDowntimeOutcomes(characterClass);
  return outcomes.find((o) => o.roll === roll) ?? outcomes[outcomes.length - 1];
}
