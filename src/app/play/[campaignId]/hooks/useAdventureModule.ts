"use client";

import { useState } from "react";
import { getAdventure } from "@/lib/adventures/index";
import { assetUrl } from "@/lib/config";
import type { Adventure } from "@/lib/adventures/types";

export interface AdventureModuleReturn {
  adventure: Adventure | null;
  currentMapFile: string | null;
  currentMapLocationName: string | undefined;
  mapHasNewReveal: boolean;
  activeRightTab: "tools" | "map";
  setActiveRightTab: React.Dispatch<React.SetStateAction<"tools" | "map">>;
  loadAdventure: (moduleId: string, adventureId: string) => Adventure | undefined;
  applyMapReveal: (locationName: string, adv: Adventure, collectionId: string) => void;
  acknowledgeMapReveal: () => void;
}

/** Manages adventure module data and map reveal state. */
export function useAdventureModule(): AdventureModuleReturn {
  const [adventure, setAdventure] = useState<Adventure | null>(null);
  const [currentMapFile, setCurrentMapFile] = useState<string | null>(null);
  const [currentMapLocationName, setCurrentMapLocationName] = useState<string | undefined>(
    undefined
  );
  const [mapHasNewReveal, setMapHasNewReveal] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState<"tools" | "map">("tools");

  function loadAdventure(moduleId: string, adventureId: string): Adventure | undefined {
    const adv = getAdventure(moduleId, adventureId);
    if (adv) setAdventure(adv);
    return adv;
  }

  function applyMapReveal(locationName: string, adv: Adventure, collectionId: string) {
    if (!adv.pcMapFile) return;
    const hasMapLocation = adv.locations.some((l) => l.hasPcMap);
    if (!hasMapLocation) return;
    const mapFile = assetUrl(`adventures/${collectionId}/${adv.pcMapFile}`);
    setCurrentMapFile(mapFile);
    setCurrentMapLocationName(locationName);
    setMapHasNewReveal(true);
  }

  function acknowledgeMapReveal() {
    setMapHasNewReveal(false);
  }

  return {
    adventure,
    currentMapFile,
    currentMapLocationName,
    mapHasNewReveal,
    activeRightTab,
    setActiveRightTab,
    loadAdventure,
    applyMapReveal,
    acknowledgeMapReveal,
  };
}
