/**
 * Shared prompt fragments reused across multiple character-creation prompts.
 */

/**
 * Equipment object schema + examples for Haiku-based GM-create prompts.
 * Must be included wherever the model is asked to emit an equipment array.
 */
export const EQUIPMENT_SCHEMA = `## Equipment Object Schema
Every item in the \`equipment\` array MUST be a structured object — never a plain string.

Required fields:
- \`"name"\` — item name (no quantity embedded in the name)
- \`"type"\` — MUST be exactly one of: \`"weapon"\`, \`"armor"\`, \`"shield"\`, \`"gear"\`, \`"ammunition"\`
  - \`"weapon"\` — any melee or ranged weapon (sword, dagger, axe, bow, staff, etc.)
  - \`"armor"\` — worn body protection (hide, mail, plate, etc.)
  - \`"shield"\` — a shield
  - \`"ammunition"\` — arrows, bolts, sling stones
  - \`"gear"\` — everything else (torches, rope, rations, tools, potions, etc.)

Optional fields (include when applicable):
- \`"damage"\` — weapons only, e.g. \`"1d6"\`
- \`"properties"\` — array of strings: weapon properties and range tags, or armor AC formula
- \`"slots"\` — gear slots consumed (omit if 1; use 0 for worn/trivial, 2 for heavy items, 3 for plate)
- \`"description"\` — gear only, brief note on use
- \`"quantity"\` — number of items (omit if 1)
- \`"equipped"\` — true if currently worn or wielded

Examples:
\`\`\`json
{ "name": "Longsword", "type": "weapon", "damage": "1d8", "properties": ["Close"], "equipped": true }
{ "name": "Dagger", "type": "weapon", "damage": "1d4", "properties": ["Precise", "Thrown", "Close", "Near"], "equipped": true }
{ "name": "Hunting bow", "type": "weapon", "damage": "1d6", "properties": ["Two-handed", "Far"], "slots": 1, "equipped": false }
{ "name": "Hide armor", "type": "armor", "properties": ["AC 11 + DEX mod"], "equipped": true }
{ "name": "Mail", "type": "armor", "properties": ["AC 13 + DEX mod"], "slots": 2, "equipped": true }
{ "name": "Shield", "type": "shield", "slots": 0, "equipped": true }
{ "name": "Arrows", "type": "ammunition", "quantity": 20 }
{ "name": "Torch", "type": "gear", "quantity": 5, "description": "5 torches. Each burns for 1 hour." }
{ "name": "Iron Rations", "type": "gear", "quantity": 3, "description": "3 days of food. 1 consumed per Full Rest." }
{ "name": "Thieves' tools", "type": "gear", "description": "Required to pick locks or disarm traps." }
\`\`\`

CRITICAL: Never use \`"type": "gear"\` for weapons, armor, or shields. A sword is \`"weapon"\`, leather armor is \`"armor"\`, a shield is \`"shield"\`.`;
