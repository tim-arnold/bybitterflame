/** Core character sheet */
export interface Character {
  id: string;
  name: string;
  pronouns: string;
  ancestry: string;
  class: string;
  level: number;
  xp: number;
  alignment: string;
  background: string;
  deity?: string;
  languages?: string[];
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
  hp: number;
  maxHp: number;
  ac: number;
  equipment: EquipmentItem[];
  spells: Spell[];
  talents: string[];
  features: string[];
  gold: number;
  silver?: number;
  copper?: number;
  createdAt: string;
  updatedAt: string;
}

export interface EquipmentItem {
  name: string;
  type: "weapon" | "armor" | "shield" | "gear" | "ammunition";
  damage?: string;
  properties?: string[];
  description?: string;
  slots?: number;   // gear slots consumed; 0 = worn/small (no slot cost); defaults to 1
  quantity?: number;
  equipped?: boolean;
}

export interface Spell {
  name: string;
  tier: number;
  range: string;
  duration: string;
  description: string;
}

/** Campaign tracks the overall adventure state */
export interface Campaign {
  id: string;
  characterId: string;
  name: string;
  state: "active" | "completed" | "abandoned";
  gmPersona: string;
  worldState: WorldState;
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  body: string;
  category: "location" | "quest" | "npc" | "item" | "note";
  createdAt: string;
}

export interface WorldState {
  currentLocation: string;
  visitedLocations: string[];
  npcs: NPC[];
  quests: Quest[];
  flags: Record<string, boolean | string>;
  journalEntries?: JournalEntry[];
}

export interface NPC {
  name: string;
  location: string;
  disposition: string;
  notes: string;
}

export interface Quest {
  name: string;
  description: string;
  status: "active" | "completed" | "failed";
  objectives: string[];
}

/** A single play session */
export interface Session {
  id: string;
  campaignId: string;
  sessionNumber: number;
  messages: Message[];
  summary: string;
  gameStateSnapshot: GameStateSnapshot;
  createdAt: string;
  updatedAt: string;
}

export interface GameStateSnapshot {
  character: Partial<Character>;
  worldState: Partial<WorldState>;
}

/** Chat message */
export interface Message {
  role: "user" | "assistant";
  content: string;
  /** Hidden messages are included in API history (for turn alternation) but not rendered in the chat UI */
  hidden?: boolean;
}

/** Context flags passed to the rules loader */
export interface GameContext {
  inCombat: boolean;
  inCharacterCreation: boolean;
  shopping: boolean;
  exploring: boolean;
  levelingUp: boolean;
  casting: boolean;
}

/** Result of a dice roll */
export interface DiceResult {
  notation: string;
  rolls: number[];
  modifier: number;
  total: number;
  natural?: number; // for d20 checks, the unmodified roll
}

/** Parsed state update from AI response */
export interface GameStateUpdate {
  type:
    | "characterUpdate"
    | "campaignUpdate"
    | "diceRoll"
    | "combatAction"
    | "notification"
    | "journalUpdate";
  data: Record<string, unknown>;
}

/** Parsed AI response with narrative separated from state changes */
export interface ParsedResponse {
  narrative: string;
  updates: GameStateUpdate[];
}

/** API request body for the chat route */
export interface ChatRequest {
  messages: Message[];
  character?: Partial<Character>;
  campaign?: Partial<Campaign>;
  mode: "create" | "play";
}
