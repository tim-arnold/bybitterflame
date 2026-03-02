/** Number of AI turns allowed using the server's API key before users must supply their own. */
export const SERVER_KEY_TURN_LIMIT = 20;

/**
 * Approximate Anthropic pricing for claude-sonnet-4-* models (per token).
 * Verify current rates at console.anthropic.com/settings/plans — these may change.
 */
export const ANTHROPIC_INPUT_COST_PER_TOKEN = 3.0 / 1_000_000;        // $3.00 per MTok (base input)
export const ANTHROPIC_OUTPUT_COST_PER_TOKEN = 15.0 / 1_000_000;      // $15.00 per MTok
export const ANTHROPIC_CACHE_WRITE_COST_PER_TOKEN = 3.75 / 1_000_000; // $3.75 per MTok (1.25x base, one-time)
export const ANTHROPIC_CACHE_READ_COST_PER_TOKEN = 0.30 / 1_000_000;  // $0.30 per MTok (0.1x base, per hit)

/**
 * Calculate the true estimated API cost from all token types.
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

/**
 * Base URL for static assets served from Cloudflare R2.
 * In production this is https://images.bytorchlight.com (set via NEXT_PUBLIC_ASSETS_URL).
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
