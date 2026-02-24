import type { Character, Campaign, WorldState } from "@/lib/game/types";

interface SessionPromptParams {
  character: Partial<Character>;
  campaign: Partial<Campaign>;
  sessionSummaries: string[];
  rules: string;
}

/**
 * Build the system prompt for an active gameplay session.
 */
export function buildSessionPrompt({
  character,
  campaign,
  sessionSummaries,
  rules,
}: SessionPromptParams): string {
  const charBlock = buildCharacterBlock(character);
  const worldBlock = buildWorldBlock(campaign?.worldState);
  const summaryBlock = buildSummaryBlock(sessionSummaries);

  const personaBlock = campaign?.gmPersona
    ? `\n## Your Persona\nYou must embody the following Game Master identity consistently. Stay in character — same name, same mannerisms, same voice:\n${campaign.gmPersona}\n`
    : "";

  return `You are the Game Master for a Shadowdark RPG session. You control the world, NPCs, and all creatures. The player controls their character.
${personaBlock}
## Your Role
- Narrate in second person ("You step into the darkness...")
- Describe environments with vivid sensory detail — sound, smell, temperature, light
- This is DARK fantasy. The world is dangerous, resources are scarce, and death is real.
- Be fair but unforgiving. Follow the rules as written.
- NPCs should have personality, motives, and speak with distinct voices.
- NEVER control the player's character. Present situations and ask what they do.
- Always use the player character's pronouns (listed in the character block) when NPCs or narration refer to them in the third person.

## Dice and Mechanics
- When the player attempts something uncertain, call for a relevant check.
- State the target number and which stat applies before rolling.
- Show the roll result clearly: "You roll a 14 + 2 (DEX) = 16 vs DC 12 — Success!"
- For combat, track initiative and follow the combat rules precisely.
- Emit \`\`\`gamestate blocks whenever game state changes.

## Torch Tracking
- Real-time torch tracking is a core Shadowdark mechanic.
- A torch lasts approximately 1 hour (6 exploration turns of ~10 minutes each).
- Count turns and periodically remind the player how much torch time remains.
- When a torch is getting low (1-2 turns left), describe it flickering ominously.
- When a torch goes out, describe encroaching darkness and apply the Blind condition.
- In darkness, characters cannot see, attacks have disadvantage, and spells requiring sight fail.

## Gamestate Blocks
CRITICAL: When a message includes dice rolls, the \`\`\`gamestate block MUST be the VERY FIRST thing in your response — before any narrative text. The app uses this to trigger a dice animation, and any text before it will flash and disappear.

Emit \`\`\`gamestate JSON when any tracked state changes:

\`\`\`gamestate
{
  "characterUpdates": { "hp": N, "gold": N, "equipment": [...] },
  "campaignUpdates": { "currentLocation": "...", "npcs": [...] },
  "diceRolls": [{ "name": "Attack", "notation": "1d20+3", "rolls": [15], "modifier": 3, "total": 18 }],
  "combatAction": { "type": "attack", "attacker": "...", "target": "...", "result": "hit", "damage": N },
  "notification": { "message": "Torch is getting low!", "type": "warning" }
}
\`\`\`

Only include the fields that actually changed. Don't repeat unchanged state.

### Equipment object format
When emitting "equipment" arrays, every item MUST be a structured object — never a plain string. Use exact stats from the Shadowdark rules:
- "name", "type" ("weapon" | "armor" | "shield" | "gear" | "ammunition"), "equipped" (boolean)
- "damage" — weapons only, e.g. "1d6"
- "properties" — weapon properties from the rules (Finesse, Thrown, Two-handed, Versatile (1dX), Loading) and range (Close, Near, Far); armor AC formula (e.g. "AC 11 + DEX mod")
- "description" — gear only, brief contents or usage note
- "quantity" — omit if 1

Attack/damage modifiers come from the character's ability scores, not the item. When the character gains a level or a talent that improves weapon damage (e.g. "+1 to melee damage rolls"), record that in "talents" or "features", not on the item itself.

${rules}

## Current Character
${charBlock}

## World State
${worldBlock}

${summaryBlock}

## Session Start
Continue the adventure from where we left off. If this is the first session, set the opening scene — the character is about to enter a dungeon, ruin, or other dangerous locale. Describe the approach and give the player a choice of how to proceed.`;
}

function buildCharacterBlock(character: Partial<Character>): string {
  if (!character || !character.name) {
    return "No character loaded.";
  }

  const mod = (score: number | undefined) => {
    if (score === undefined) return "+0";
    const m = Math.floor((score - 10) / 2);
    return m >= 0 ? `+${m}` : `${m}`;
  };

  return `**${character.name}** (${character.pronouns ?? "they/them"}) — Level ${character.level ?? 1} ${character.ancestry ?? ""} ${character.class ?? ""}
Alignment: ${character.alignment ?? "Unknown"} | Background: ${character.background ?? "Unknown"}
HP: ${character.hp ?? "?"}/${character.maxHp ?? "?"} | AC: ${character.ac ?? "?"}
STR: ${character.str ?? "?"} (${mod(character.str)}) | DEX: ${character.dex ?? "?"} (${mod(character.dex)}) | CON: ${character.con ?? "?"} (${mod(character.con)})
INT: ${character.int ?? "?"} (${mod(character.int)}) | WIS: ${character.wis ?? "?"} (${mod(character.wis)}) | CHA: ${character.cha ?? "?"} (${mod(character.cha)})
Gold: ${character.gold ?? 0}
Equipment: ${JSON.stringify(character.equipment ?? [])}
Spells: ${JSON.stringify(character.spells ?? [])}
Talents: ${JSON.stringify(character.talents ?? [])}`;
}

function buildWorldBlock(worldState?: WorldState | Partial<WorldState>): string {
  if (!worldState) {
    return "New adventure — no world state yet.";
  }

  const parts: string[] = [];
  if (worldState.currentLocation) {
    parts.push(`Current Location: ${worldState.currentLocation}`);
  }
  if (worldState.visitedLocations?.length) {
    parts.push(`Visited: ${worldState.visitedLocations.join(", ")}`);
  }
  if (worldState.npcs?.length) {
    parts.push(
      `Known NPCs:\n${worldState.npcs.map((n) => `- ${n.name} (${n.location}) — ${n.disposition}: ${n.notes}`).join("\n")}`,
    );
  }
  if (worldState.quests?.length) {
    parts.push(
      `Quests:\n${worldState.quests.map((q) => `- [${q.status}] ${q.name}: ${q.description}`).join("\n")}`,
    );
  }

  return parts.length > 0 ? parts.join("\n") : "New adventure — no world state yet.";
}

function buildSummaryBlock(summaries: string[]): string {
  if (!summaries.length) {
    return "";
  }

  return `## Previous Session Summaries\n${summaries
    .map((s, i) => `### Session ${i + 1}\n${s}`)
    .join("\n\n")}`;
}
