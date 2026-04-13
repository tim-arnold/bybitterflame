import type {
  GameStateUpdate, ParsedResponse, EquipmentItem, Spell,
  CampaignUpdateData, DiceRollData, CombatActionData, NotificationData,
  PlayerDiedData, MapRevealData, AdventureCompleteData, GmNotesUpdateData,
  JournalEntry, Companion, Character,
} from "./types";
import { enrichSpell } from "./spells";

/** Shared regex for matching fenced gamestate blocks in AI responses. */
export const GAMESTATE_REGEX = /```gamestate\s*\n([\s\S]*?)```/g;

// Matches a top-level JSON object that contains known gamestate keys.
// Used as a fallback when the AI omits the ```gamestate fence.
const GAMESTATE_KEYS = ["characterUpdates", "campaignUpdates", "diceRolls", "combatAction", "notification", "characterComplete", "companionJoined", "companionUpdate", "playerDied", "mapReveal", "adventureComplete", "gmNotesUpdate", "journalEntry"];
const RAW_JSON_REGEX = /^\s*(\{[\s\S]*?\})\s*$/m;

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

  // Fallback: if no fenced blocks found, check if the entire response (or a large chunk)
  // is a raw JSON object containing known gamestate keys — Haiku sometimes omits fences.
  if (updates.length === 0) {
    const rawMatch = RAW_JSON_REGEX.exec(narrative);
    if (rawMatch) {
      try {
        const parsed = JSON.parse(rawMatch[1]);
        const hasGamestateKey = GAMESTATE_KEYS.some((k) => k in parsed);
        if (hasGamestateKey) {
          extractUpdates(parsed, updates);
          narrative = narrative.replace(rawMatch[1], "");
        }
      } catch {
        // Not valid JSON — leave narrative untouched
      }
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
      data: parsed.characterUpdates as Partial<Character>,
    });
  }

  if (parsed.campaignUpdates) {
    updates.push({
      type: "campaignUpdate",
      data: parsed.campaignUpdates as CampaignUpdateData,
    });
  }

  if (parsed.diceRolls) {
    const rolls = parsed.diceRolls as DiceRollData[];
    for (const roll of rolls) {
      updates.push({ type: "diceRoll", data: roll });
    }
  }

  if (parsed.combatAction) {
    updates.push({
      type: "combatAction",
      data: parsed.combatAction as CombatActionData,
    });
  }

  if (parsed.notification) {
    updates.push({
      type: "notification",
      data: parsed.notification as NotificationData,
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
      data: parsed.journalEntry as Omit<JournalEntry, "id" | "createdAt">,
    });
  }

  if (parsed.companionJoined) {
    updates.push({
      type: "companionJoined",
      data: parsed.companionJoined as Omit<Companion, "id" | "joinedAt">,
    });
  }

  if (parsed.companionUpdate) {
    updates.push({
      type: "companionUpdate",
      data: parsed.companionUpdate as Partial<Companion> & { id: string },
    });
  }

  if (parsed.playerDied) {
    updates.push({
      type: "playerDied",
      data: parsed.playerDied as PlayerDiedData,
    });
  }

  if (parsed.mapReveal) {
    updates.push({
      type: "mapReveal",
      data: parsed.mapReveal as MapRevealData,
    });
  }

  if (parsed.adventureComplete) {
    updates.push({
      type: "adventureComplete",
      data: parsed.adventureComplete as AdventureCompleteData,
    });
  }

  if (parsed.gmNotesUpdate) {
    updates.push({
      type: "gmNotesUpdate",
      data: parsed.gmNotesUpdate as GmNotesUpdateData,
    });
  }
}

/**
 * Numbers that indicate a unit of measure rather than a count.
 * Guards against misreading "50 feet rope" as { quantity: 50, name: "feet rope" }.
 */
const MEASUREMENT_PREFIX =
  /^(feet|foot|ft|meters?|metres?|inches?|miles?|yards?|pounds?|lbs?|kg|grams?|days?|hours?|minutes?)/i;

/**
 * Normalize a single equipment item.
 * The AI sometimes embeds quantity in the name instead of the quantity field.
 * Handles all observed patterns: "Torch (5)", "Torch x5", "3x Oil", "20 bolts".
 */
export function normalizeEquipmentItem<T extends { name?: string; quantity?: number }>(item: T): T {
  // Already has a numeric quantity — nothing to do.
  if (typeof item.quantity === "number") return item;

  const name = item.name ?? null;
  if (!name) return item;

  // "Torch (5)" — digits only inside parens at end
  const parenMatch = name.match(/^(.+?)\s*\((\d+)\)$/);
  if (parenMatch) {
    return { ...item, name: parenMatch[1].trim(), quantity: parseInt(parenMatch[2], 10) };
  }

  // "Torch x5" or "Torch ×5" — count suffix
  const xSuffixMatch = name.match(/^(.+?)\s*[x×](\d+)$/i);
  if (xSuffixMatch) {
    return { ...item, name: xSuffixMatch[1].trim(), quantity: parseInt(xSuffixMatch[2], 10) };
  }

  // "3x Oil" or "3× Oil" — count prefix with explicit x/×
  const xPrefixMatch = name.match(/^(\d+)\s*[x×]\s*(.+)$/i);
  if (xPrefixMatch) {
    return { ...item, name: xPrefixMatch[2].trim(), quantity: parseInt(xPrefixMatch[1], 10) };
  }

  // "20 bolts" — count prefix with space only; skip measurement words ("50 feet rope")
  const spacePrefixMatch = name.match(/^(\d+)\s+(.+)$/);
  if (spacePrefixMatch && !MEASUREMENT_PREFIX.test(spacePrefixMatch[2])) {
    return { ...item, name: spacePrefixMatch[2].trim(), quantity: parseInt(spacePrefixMatch[1], 10) };
  }

  return item;
}

/** Infer the most likely EquipmentItem type from a plain-string item name. */
function inferEquipmentType(name: string): EquipmentItem["type"] {
  const lower = name.toLowerCase();
  if (lower === "shield") return "shield";
  if (/\b(arrow|bolt|quarrel|bullet|dart|shot|sling stone)\b/.test(lower)) return "ammunition";
  if (/\b(armor|armour|mail|plate)\b/.test(lower)) return "armor";
  if (
    /\b(sword|dagger|axe|mace|staff|bow|crossbow|spear|lance|flail|hammer|rapier|blade|knife|club|sling|javelin|trident|halberd|pike|glaive|scythe|whip|warhammer|morningstar|seax|hatchet|maul|sickle)\b/.test(
      lower,
    )
  )
    return "weapon";
  return "gear";
}

/**
 * Normalize an array of equipment items that may contain plain strings or malformed objects.
 * Converts strings to EquipmentItem objects (inferring type) then applies normalizeEquipmentItem.
 */
export function normalizeEquipmentArray(items: unknown[]): EquipmentItem[] {
  return items.map((item): EquipmentItem => {
    if (typeof item === "string") {
      const base: EquipmentItem = { name: item, type: inferEquipmentType(item) };
      return normalizeEquipmentItem(base);
    }
    if (item && typeof item === "object") {
      return normalizeEquipmentItem(item as EquipmentItem);
    }
    return { name: String(item), type: "gear" };
  });
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
      const data: Record<string, unknown> = { ...update.data };
      // Normalize talents: AI may emit {name, description} objects instead of strings
      if (Array.isArray(data.talents)) {
        data.talents = (data.talents as unknown[]).map((t) =>
          typeof t === "string" ? t : (t as { name?: string }).name ?? JSON.stringify(t),
        );
      }
      // Normalize equipment: handles string arrays, malformed objects, and quantity-in-name
      if (Array.isArray(data.equipment)) {
        data.equipment = normalizeEquipmentArray(data.equipment);
      }
      // Normalize spells: enrich with static spell data to backfill missing fields.
      // Haiku sometimes emits wrong names (D&D 5e variants) or omits range/duration/description.
      if (Array.isArray(data.spells)) {
        data.spells = (data.spells as unknown[]).map((s): Spell => {
          if (typeof s === "string") {
            return enrichSpell({ name: s, tier: 1, range: "", duration: "", description: "" });
          }
          if (s && typeof s === "object") {
            return enrichSpell(s as Spell);
          }
          return { name: String(s), tier: 1, range: "", duration: "", description: "" };
        });
      }
      Object.assign(result, data);
    }
  }

  return result;
}
