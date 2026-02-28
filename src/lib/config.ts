/** Number of AI turns allowed using the server's API key before users must supply their own. */
export const SERVER_KEY_TURN_LIMIT = 20;

/**
 * Approximate Anthropic pricing for claude-sonnet-4-* models (per token).
 * Verify current rates at console.anthropic.com/settings/plans — these may change.
 */
export const ANTHROPIC_INPUT_COST_PER_TOKEN = 3.0 / 1_000_000;   // $3.00 per million input tokens
export const ANTHROPIC_OUTPUT_COST_PER_TOKEN = 15.0 / 1_000_000; // $15.00 per million output tokens

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
