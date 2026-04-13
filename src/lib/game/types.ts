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
  specialization?: string;
  deity?: string; // deprecated — no gods in the setting; kept for DB compat
  toll?: number;
  tollPermanent?: number;
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
  wyrd?: number;
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
  gmNotes?: string;
  worldState: WorldState;
  campaignType?: "standard" | "oneshot";
  moduleId?: string;
  adventureId?: string;
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

export interface CompanionPersonality {
  voice: string;
  dispositionTowardPlayer: "loyal" | "friendly" | "neutral" | "suspicious" | "hostile";
  riskTolerance: "reckless" | "bold" | "cautious" | "cowardly";
  followership: "leads" | "collaborates" | "follows" | "self-interested";
  loyalty: number; // 1–10
  motivation: string;
  redLines: string;
}

export interface Companion {
  id: string;
  name: string;
  pronouns: string;
  ancestry: string;
  class: string;
  level: number;
  alignment: string;
  background: string;
  specialization?: string;
  deity?: string; // deprecated — kept for DB compat
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
  personality: CompanionPersonality;
  xp?: number;
  gold?: number;
  status: "active" | "incapacitated" | "dead" | "departed" | "hostile";
  joinedAt: string;
}

export interface LegacyCharacter {
  name: string;
  ancestry: string;
  class: string;
  level: number;
  causeOfDeath: string;
  inheritedBy?: string;
  legacyTalent?: string;
  diedAt: string;
  equipment?: EquipmentItem[]; // items on the corpse, available for the new character to take
}

export interface WorldState {
  currentLocation: string;
  statusPhrase?: string;   // short present-tense scene snapshot, e.g. "alone in the Voss Family Mausoleum"
  visitedLocations: string[];
  locationType?: LocationType; // environment type for encounter design; updated by GM via campaignUpdates
  npcs: NPC[];
  quests: Quest[];
  flags: Record<string, boolean | string>;
  journalEntries?: JournalEntry[];
  companions?: Companion[];
  legacyCharacters?: LegacyCharacter[];
  timeOfDay?: string;       // "mid-morning", "late evening", underground blur, etc.
  currentDate?: string;     // "Day 3 of the Frost Moon, Year 412"
  weather?: string;         // "Clear and cold", "Heavy rain", null when underground
  undergroundTurns?: number; // exploration turns spent underground (10 min each)
  torchRemainingSeconds?: number; // seconds left on active torch; undefined = no torch lit
  torchSavedSeconds?: number;     // seconds saved when torch was manually extinguished; undefined = no partial torch
  pendingDeath?: {                // persisted so death state survives page refresh
    causeOfDeath: string;
    legacyTalent?: string;
    killedByCompanionId?: string | null;
  };
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
  giver?: string;
  reward?: string;
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

/** Environment types used for encounter design and narrative context */
export type LocationType =
  | "arctic"
  | "artisan-district"
  | "cave"
  | "desert"
  | "forest"
  | "grassland"
  | "high-district"
  | "jungle"
  | "market"
  | "mountain"
  | "ocean"
  | "river-and-coast"
  | "ruins"
  | "slums"
  | "swamp"
  | "tavern"
  | "temple-district"
  | "tomb"
  | "university-district";

/** Context flags passed to the rules loader */
export interface GameContext {
  inCombat: boolean;
  inCharacterCreation: boolean;
  shopping: boolean;
  exploring: boolean;
  levelingUp: boolean;
  casting: boolean;
  locationType?: LocationType;
}

/** Result of a dice roll */
export interface DiceResult {
  notation: string;
  rolls: number[];
  modifier: number;
  total: number;
  natural?: number; // for d20 checks, the unmodified roll
}

// ── Per-update-type data interfaces ─────────────────────────────────────────

/** A single combatant row in the combat tracker. */
export interface CombatantData {
  name: string;
  initiative: number;
  isPlayer: boolean;
  isCompanion?: boolean;
  isActive: boolean;
}

/** Data payload for a combatAction update. */
export interface CombatActionData {
  active?: boolean;
  combatants?: CombatantData[];
  round?: number;
}

/** Data payload for a diceRoll update. */
export interface DiceRollData {
  name?: string;
  notation: string;
  rolls: number[];
  modifier?: number;
  total: number;
}

/** Data payload for a notification update. */
export interface NotificationData {
  message: string;
  type: string;
}

/**
 * Data payload for a campaignUpdate.
 * Extends WorldState fields with `torchLit`, a transient GM signal that the
 * UI translates into `torchRemainingSeconds` before persisting.
 */
export interface CampaignUpdateData extends Partial<WorldState> {
  torchLit?: boolean;
}

/** Data payload for a playerDied update. */
export interface PlayerDiedData {
  causeOfDeath: string;
  legacyTalent?: string;
  killedByCompanionId?: string | null;
}

/** Data payload for a mapReveal update. */
export interface MapRevealData {
  locationName: string;
}

/** Data payload for an adventureComplete update. */
export interface AdventureCompleteData {
  summary: string;
  rewardDescription?: string;
}

/** Data payload for a gmNotesUpdate. */
export interface GmNotesUpdateData {
  notes: string;
}

/**
 * Parsed state update from an AI response.
 * Discriminated union — narrow on `type` to get a typed `data` field.
 */
export type GameStateUpdate =
  | { type: "characterUpdate"; data: Partial<Character> }
  | { type: "campaignUpdate"; data: CampaignUpdateData }
  | { type: "diceRoll"; data: DiceRollData }
  | { type: "combatAction"; data: CombatActionData }
  | { type: "notification"; data: NotificationData }
  | { type: "journalUpdate"; data: Omit<JournalEntry, "id" | "createdAt"> }
  | { type: "companionJoined"; data: Omit<Companion, "id" | "joinedAt"> }
  | { type: "companionUpdate"; data: Partial<Companion> & { id: string } }
  | { type: "playerDied"; data: PlayerDiedData }
  | { type: "mapReveal"; data: MapRevealData }
  | { type: "adventureComplete"; data: AdventureCompleteData }
  | { type: "gmNotesUpdate"; data: GmNotesUpdateData };

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
  sessionSummaries?: string[];
  mode: "create" | "play" | "adventure-create" | "gm-create";
  /** When true, use Haiku for all gameplay turns (cheaper but lower narrative quality). */
  preferHaiku?: boolean;
}
