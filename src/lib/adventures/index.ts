import type { AdventureCollection } from "./types";
import { SHOTS_IN_THE_DARK_1 } from "./shots-in-the-dark-1";

export const ADVENTURE_COLLECTIONS: AdventureCollection[] = [SHOTS_IN_THE_DARK_1];

export { SHOTS_IN_THE_DARK_1 };
export type { AdventureCollection, Adventure, AdventureLocation } from "./types";

export function getCollection(collectionId: string): AdventureCollection | undefined {
  return ADVENTURE_COLLECTIONS.find((c) => c.id === collectionId);
}

export function getAdventure(collectionId: string, adventureId: string) {
  return getCollection(collectionId)?.adventures.find((a) => a.id === adventureId);
}
