export interface AdventureLocation {
  id: string;
  name: string;
  description: string;
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
}

export interface AdventureCollection {
  id: string;
  title: string;
  adventures: Adventure[];
}
