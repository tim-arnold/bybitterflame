/**
 * Ability score modifier table.
 * This is the single source of truth — used by leveling calculations,
 * prompt builders, and any other stat-modifier consumers.
 */
export function getStatMod(stat: number): number {
  if (stat <= 3) return -4;
  if (stat <= 5) return -3;
  if (stat <= 7) return -2;
  if (stat <= 9) return -1;
  if (stat <= 11) return 0;
  if (stat <= 13) return 1;
  if (stat <= 15) return 2;
  if (stat <= 17) return 3;
  return 4;
}

/**
 * Format an ability score as a signed modifier string, e.g. "+2" or "-1".
 * Accepts undefined (returns "+0") to handle partially-loaded character state.
 */
export function formatStatMod(score: number | undefined): string {
  if (score === undefined) return "+0";
  const m = getStatMod(score);
  return m >= 0 ? `+${m}` : `${m}`;
}
