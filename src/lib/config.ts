/** Number of AI turns allowed using the server's API key before users must supply their own. */
export const SERVER_KEY_TURN_LIMIT = 10;

/**
 * Approximate Anthropic pricing for claude-sonnet-4-* models (per token).
 * Verify current rates at console.anthropic.com/settings/plans — these may change.
 */
export const ANTHROPIC_INPUT_COST_PER_TOKEN = 3.0 / 1_000_000;   // $3.00 per million input tokens
export const ANTHROPIC_OUTPUT_COST_PER_TOKEN = 15.0 / 1_000_000; // $15.00 per million output tokens
