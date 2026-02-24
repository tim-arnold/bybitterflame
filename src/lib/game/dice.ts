import type { DiceResult } from "./types";
export type { DiceResult } from "./types";

/** Supported die sizes */
const VALID_DICE = [4, 6, 8, 10, 12, 20] as const;

/**
 * Roll a single die of the given size.
 */
function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

/**
 * Parse and roll dice notation.
 * Supports: "3d6", "1d20+5", "1d20-2", "2d6x5" (multiply total)
 */
export function roll(notation: string): DiceResult {
  const cleaned = notation.toLowerCase().replace(/\s/g, "");

  // Match pattern: NdS[+/-M][xP]
  const match = cleaned.match(/^(\d+)d(\d+)([+-]\d+)?(?:x(\d+))?$/);
  if (!match) {
    throw new Error(`Invalid dice notation: ${notation}`);
  }

  const count = parseInt(match[1], 10);
  const sides = parseInt(match[2], 10);
  const modifier = match[3] ? parseInt(match[3], 10) : 0;
  const multiplier = match[4] ? parseInt(match[4], 10) : 1;

  if (count < 1 || count > 100) {
    throw new Error(`Invalid die count: ${count}`);
  }
  if (!VALID_DICE.includes(sides as (typeof VALID_DICE)[number]) && sides !== 100) {
    throw new Error(`Invalid die size: d${sides}`);
  }

  const rolls: number[] = [];
  for (let i = 0; i < count; i++) {
    rolls.push(rollDie(sides));
  }

  const sum = rolls.reduce((a, b) => a + b, 0);
  const total = (sum + modifier) * multiplier;

  return {
    notation,
    rolls,
    modifier,
    total,
    natural: count === 1 && sides === 20 ? rolls[0] : undefined,
  };
}

/**
 * Roll with advantage: roll twice, take the higher result.
 */
export function rollWithAdvantage(notation: string): DiceResult {
  const roll1 = roll(notation);
  const roll2 = roll(notation);
  const best = roll1.total >= roll2.total ? roll1 : roll2;

  return {
    ...best,
    notation: `${notation} (advantage)`,
  };
}

/**
 * Roll with disadvantage: roll twice, take the lower result.
 */
export function rollWithDisadvantage(notation: string): DiceResult {
  const roll1 = roll(notation);
  const roll2 = roll(notation);
  const worst = roll1.total <= roll2.total ? roll1 : roll2;

  return {
    ...worst,
    notation: `${notation} (disadvantage)`,
  };
}

/**
 * Roll ability scores: 3d6 six times, one for each ability.
 */
export function rollAbilityScores(): number[] {
  return Array.from({ length: 6 }, () => roll("3d6").total);
}

/**
 * Get the ability score modifier.
 * 3 = -4, 4-5 = -3, 6-7 = -2, 8-9 = -1, 10-11 = +0, 12-13 = +1, 14-15 = +2, 16-17 = +3, 18 = +4
 */
export function getModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}
