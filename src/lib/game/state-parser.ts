import type { GameStateUpdate, ParsedResponse } from "./types";

const GAMESTATE_REGEX = /```gamestate\s*\n([\s\S]*?)```/g;

/**
 * Parse an AI response, extracting narrative text and gamestate JSON blocks.
 * Gamestate blocks are stripped from the narrative and returned as structured updates.
 */
export { parseResponse as parseGameState };

export function parseResponse(raw: string): ParsedResponse {
  const updates: GameStateUpdate[] = [];
  let narrative = raw;

  // Extract all ```gamestate blocks
  const matches = [...raw.matchAll(GAMESTATE_REGEX)];

  for (const match of matches) {
    // Remove the block from narrative text
    narrative = narrative.replace(match[0], "");

    try {
      const parsed = JSON.parse(match[1]);
      extractUpdates(parsed, updates);
    } catch {
      // If JSON parsing fails, skip this block but log for debugging
      console.warn("Failed to parse gamestate block:", match[1].slice(0, 100));
    }
  }

  // Clean up extra whitespace from removed blocks
  narrative = narrative.replace(/\n{3,}/g, "\n\n").trim();

  return { narrative, updates };
}

/**
 * Extract typed updates from a parsed gamestate JSON object.
 */
function extractUpdates(
  parsed: Record<string, unknown>,
  updates: GameStateUpdate[],
): void {
  if (parsed.characterUpdates) {
    updates.push({
      type: "characterUpdate",
      data: parsed.characterUpdates as Record<string, unknown>,
    });
  }

  if (parsed.campaignUpdates) {
    updates.push({
      type: "campaignUpdate",
      data: parsed.campaignUpdates as Record<string, unknown>,
    });
  }

  if (parsed.diceRolls) {
    const rolls = parsed.diceRolls as Record<string, unknown>[];
    for (const roll of rolls) {
      updates.push({
        type: "diceRoll",
        data: roll,
      });
    }
  }

  if (parsed.combatAction) {
    updates.push({
      type: "combatAction",
      data: parsed.combatAction as Record<string, unknown>,
    });
  }

  if (parsed.notification) {
    updates.push({
      type: "notification",
      data: parsed.notification as Record<string, unknown>,
    });
  }

  // characterComplete flag — pass through as a notification
  if (parsed.characterComplete) {
    updates.push({
      type: "notification",
      data: { message: "Character creation complete", type: "characterComplete" },
    });
  }

  if (parsed.journalEntry) {
    updates.push({
      type: "journalUpdate",
      data: parsed.journalEntry as Record<string, unknown>,
    });
  }

  if (parsed.companionJoined) {
    updates.push({
      type: "companionJoined",
      data: parsed.companionJoined as Record<string, unknown>,
    });
  }

  if (parsed.companionUpdate) {
    updates.push({
      type: "companionUpdate",
      data: parsed.companionUpdate as Record<string, unknown>,
    });
  }

  if (parsed.playerDied) {
    updates.push({
      type: "playerDied",
      data: parsed.playerDied as Record<string, unknown>,
    });
  }

  if (parsed.mapReveal) {
    updates.push({
      type: "mapReveal",
      data: parsed.mapReveal as Record<string, unknown>,
    });
  }
}

/**
 * Accumulate updates into a running character state object.
 * Useful for applying a stream of updates to local state.
 */
export function applyCharacterUpdates(
  current: Record<string, unknown>,
  updates: GameStateUpdate[],
): Record<string, unknown> {
  const result = { ...current };

  for (const update of updates) {
    if (update.type === "characterUpdate") {
      Object.assign(result, update.data);
    }
  }

  return result;
}
