export interface AdventureLocation {
  id: string;
  name: string;
  description: string;
  /** Cardinal position within the dungeon (e.g. "Northern structure, upper level") */
  mapPosition?: string;
  /** Approximate room/area dimensions based on map grid (10 ft per square) */
  dimensions?: string;
  /** Navigational connections to adjacent areas, with direction and distance */
  connections?: string[];
  npcs?: string[];
  hazards?: string[];
  hasPcMap?: boolean;
  /**
   * The environment type slug for encounter design.
   * The GM should emit this as campaignUpdates.locationType when the party enters.
   * Omit for safe settlements — no encounter checks apply there.
   */
  locationType?: import("@/lib/game/types").LocationType;
}

export interface PresetCharacter {
  name: string;
  pronouns: string;
  ancestry: string;
  class: string;
  level: number;
  xp: number;
  alignment: string;
  background: string;
  specialization?: string;
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
  hp: number;
  maxHp: number;
  ac: number;
  toll?: number;
  tollPermanent?: number;
  languages: string[];
  equipment: import("@/lib/game/types").EquipmentItem[];
  spells: import("@/lib/game/types").Spell[];
  talents: string[];
  features: string[];
  gold: number;
}

export interface Adventure {
  id: string;
  title: string;
  levelMin: number;
  levelMax: number;
  synopsis: string;
  hook: string;
  locations: AdventureLocation[];
  keyNPCs: string[];
  specialMechanics: string[];
  /** Filename relative to the collection's maps/pc/ directory */
  pcMapFile?: string;
  /** Prose overview of the full map layout, derived from the player map (north = up, 10 ft squares) */
  mapLayout?: string;
  /** Pre-made character for Quick Start — skips character creation entirely */
  presetCharacter?: PresetCharacter;
}

export interface AdventureCollection {
  id: string;
  title: string;
  description?: string;
  adventures: Adventure[];
}
