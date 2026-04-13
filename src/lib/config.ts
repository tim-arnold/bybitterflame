/** Number of AI turns allowed using the server's API key before users must supply their own. */
export const SERVER_KEY_TURN_LIMIT = 20;

// ── Session prompt size caps ────────────────────────────────────────────────
/** Max number of session summaries included in the GM prompt (most recent N). */
export const SESSION_SUMMARY_CAP = 3;
/** Max number of visited locations included in the world block (most recent N). */
export const VISITED_LOCATIONS_CAP = 15;
/** Max number of NPCs included in the world block (most recent N). */
export const NPC_CAP = 10;
/** Max characters of GM arc notes included in the prompt. */
export const GM_NOTES_MAX_CHARS = 1500;

/** Model IDs — centralized so they aren't scattered across files. */
export const MODEL_SONNET = "claude-sonnet-4-20250514";
export const MODEL_HAIKU = "claude-haiku-4-5-20251001";

/**
 * Approximate Anthropic pricing for claude-sonnet-4-* models (per token).
 * Verify current rates at console.anthropic.com/settings/plans — these may change.
 */
export const ANTHROPIC_INPUT_COST_PER_TOKEN = 3.0 / 1_000_000;        // $3.00 per MTok (base input)
export const ANTHROPIC_OUTPUT_COST_PER_TOKEN = 15.0 / 1_000_000;      // $15.00 per MTok
export const ANTHROPIC_CACHE_WRITE_COST_PER_TOKEN = 3.75 / 1_000_000; // $3.75 per MTok (1.25x base, one-time)
export const ANTHROPIC_CACHE_READ_COST_PER_TOKEN = 0.30 / 1_000_000;  // $0.30 per MTok (0.1x base, per hit)

/** Haiku 4.5 pricing (per token). */
export const HAIKU_INPUT_COST_PER_TOKEN = 1.0 / 1_000_000;            // $1.00 per MTok
export const HAIKU_OUTPUT_COST_PER_TOKEN = 5.0 / 1_000_000;           // $5.00 per MTok
export const HAIKU_CACHE_WRITE_COST_PER_TOKEN = 1.25 / 1_000_000;     // $1.25 per MTok
export const HAIKU_CACHE_READ_COST_PER_TOKEN = 0.10 / 1_000_000;      // $0.10 per MTok

/**
 * Calculate estimated API cost using Sonnet pricing.
 * With prompt caching, input_tokens only covers uncached tokens —
 * cache write and read tokens are billed separately and must be included.
 */
export function calcCost(
  inputTokens: number,
  outputTokens: number,
  cacheWriteTokens = 0,
  cacheReadTokens = 0,
): number {
  return (
    inputTokens * ANTHROPIC_INPUT_COST_PER_TOKEN +
    outputTokens * ANTHROPIC_OUTPUT_COST_PER_TOKEN +
    cacheWriteTokens * ANTHROPIC_CACHE_WRITE_COST_PER_TOKEN +
    cacheReadTokens * ANTHROPIC_CACHE_READ_COST_PER_TOKEN
  );
}

/** Calculate estimated API cost using Haiku pricing. */
export function calcCostHaiku(
  inputTokens: number,
  outputTokens: number,
  cacheWriteTokens = 0,
  cacheReadTokens = 0,
): number {
  return (
    inputTokens * HAIKU_INPUT_COST_PER_TOKEN +
    outputTokens * HAIKU_OUTPUT_COST_PER_TOKEN +
    cacheWriteTokens * HAIKU_CACHE_WRITE_COST_PER_TOKEN +
    cacheReadTokens * HAIKU_CACHE_READ_COST_PER_TOKEN
  );
}

/**
 * Calculate accurate total cost when you have separate Sonnet and Haiku token counts.
 * totalIn/Out/etc. = all tokens (both models). haikuIn/Out/etc. = Haiku subset.
 * Sonnet tokens = total - haiku; priced at Sonnet rates. Haiku tokens priced at Haiku rates.
 */
export function calcMixedCost(
  totalIn: number, totalOut: number, totalCacheWrite: number, totalCacheRead: number,
  haikuIn: number, haikuOut: number, haikuCacheWrite: number, haikuCacheRead: number,
): number {
  const sonnetIn = totalIn - haikuIn;
  const sonnetOut = totalOut - haikuOut;
  const sonnetWrite = totalCacheWrite - haikuCacheWrite;
  const sonnetRead = totalCacheRead - haikuCacheRead;
  return calcCost(sonnetIn, sonnetOut, sonnetWrite, sonnetRead) +
    calcCostHaiku(haikuIn, haikuOut, haikuCacheWrite, haikuCacheRead);
}

/**
 * Base URL for static assets served from Cloudflare R2.
 * In production this is https://images.bybitterflame.com (set via NEXT_PUBLIC_ASSETS_URL).
 * In local dev it is empty, so paths like /adventures/... resolve to public/.
 */
export const ASSETS_URL = process.env.NEXT_PUBLIC_ASSETS_URL ?? "";

/**
 * Build a URL for an adventure asset (map image, etc.).
 * e.g. assetUrl("adventures/shots-in-the-dark-1/Spores-Undercity-PC.webp")
 */
export function assetUrl(path: string): string {
  return `${ASSETS_URL}/${path}`;
}
