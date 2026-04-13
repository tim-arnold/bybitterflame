import type { Character, Companion, NPC, Spell } from "@/lib/game/types";
import type { TalentResult } from "@/lib/game/leveling";
import type { DowntimeTier, DowntimeOutcome } from "@/lib/game/downtime";

export type { DowntimeTier, DowntimeOutcome };

export interface SpellPickState {
  tier: number;
  count: number;
  available: Spell[];
  selected: Spell[];
}

export type Phase =
  | "victory"
  | "carousing"
  | "rolling"
  | "result"
  | "leveling-hp"
  | "leveling-talent"
  | "leveling-spells"
  | "done";

export interface HpRollResult {
  roll: number;
  roll2?: number;
  conMod: number;
  total: number;
}

export interface CompanionCarouseResult {
  companion: Companion;
  xpGained: number;
  leveled: boolean;
  hpGained?: number;
  talentGained?: string;
  goldDeducted?: number;
  goldShortfall?: number;
}

export interface CarouseWorldStatePatches {
  npcs?: NPC[];
}

export interface AdventureCompleteScreenProps {
  summary: string;
  characterName: string;
  rewardDescription?: string;
  character: Partial<Character>;
  companions?: Companion[];
  currentLocation?: string;
  campaignType?: "standard" | "oneshot";
  campaignId?: string;
  onCarouseComplete: (
    xpGained: number,
    goldLost: number,
    levelUpOverride?: Partial<Character>,
    companionUpdates?: Companion[],
    characterPatches?: Partial<Character>,
    worldStatePatches?: CarouseWorldStatePatches
  ) => void;
}

// Re-export TalentResult so phase components don't need to import from leveling directly
export type { TalentResult };
