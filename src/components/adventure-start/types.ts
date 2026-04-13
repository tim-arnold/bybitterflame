import type { EquipmentItem, Spell } from "@/lib/game/types";

export interface RosterCharacter {
  id: string;
  name: string;
  class: string;
  ancestry: string;
  level: number;
  lastCampaignState: string;
  lastAdventureTitle: string | null;
  lastPlayedAt: string;
}

export interface AvailableCharacter {
  id: string;
  name: string;
  class: string;
  ancestry: string;
  level: number;
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
  lastAdventureTitle: string | null;
}

export interface FormerCompanionEntry {
  companion: import("@/lib/game/types").Companion;
  lastSeenIn: string | null;
}

export interface AvailableResponse {
  formerCompanions: FormerCompanionEntry[];
  availableCharacters: AvailableCharacter[];
}