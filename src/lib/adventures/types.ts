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
}

export interface AdventureCollection {
  id: string;
  title: string;
  adventures: Adventure[];
}
