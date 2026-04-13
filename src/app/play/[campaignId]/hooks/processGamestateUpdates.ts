import type { Character, Campaign, JournalEntry, Companion, GameStateUpdate, CampaignUpdateData, WorldState } from "@/lib/game/types";
import type { Adventure } from "@/lib/adventures/types";

export interface DeathData {
  causeOfDeath: string;
  legacyTalent?: string;
  killedByCompanionId?: string | null;
  deathNarrative?: string;
  companionsAtDeath?: Companion[];
}

export interface GamestateUpdateResult {
  updatedCharacter: Partial<Character>;
  updatedCampaign: Partial<Campaign>;
  updatedCompanions: Companion[];
  companionsChanged: boolean;
  newJournalEntries: JournalEntry[];
  deathData: DeathData | null;
  mapRevealLocation: string | null;
  isCharacterComplete: boolean;
  adventureComplete: { summary: string; rewardDescription: string } | null;
}

/**
 * Pure function that processes an array of gamestate updates into new state values.
 * Callers are responsible for applying the returned values to React state.
 */
export function processGamestateUpdates(
  updates: GameStateUpdate[],
  narrative: string,
  currentState: {
    character: Partial<Character>;
    campaign: Partial<Campaign>;
    companions: Companion[];
    isGmCreateMode: boolean;
    adventure: Adventure | null;
    resolveTorchUpdate: (data: CampaignUpdateData) => Partial<WorldState>;
  }
): GamestateUpdateResult {
  let updatedCharacter = { ...currentState.character };
  let updatedCampaign = { ...currentState.campaign };
  let updatedCompanions = [...currentState.companions];
  let companionsChanged = false;
  const newJournalEntries: JournalEntry[] = [];
  let deathData: DeathData | null = null;
  let mapRevealLocation: string | null = null;
  let isCharacterComplete = false;
  let adventureComplete: { summary: string; rewardDescription: string } | null = null;

  for (const update of updates) {
    if (update.type === "characterUpdate") {
      const charData = { ...update.data };
      // If gold is being set to a higher value (a gain), split it equally among active companions.
      if (charData.gold !== undefined) {
        const currentGold = updatedCharacter.gold ?? 0;
        if (charData.gold > currentGold) {
          const gain = charData.gold - currentGold;
          const activeCompanions = updatedCompanions.filter((c) => c.status === "active");
          if (activeCompanions.length > 0) {
            const partySize = 1 + activeCompanions.length;
            const companionShare = Math.floor(gain / partySize);
            if (companionShare > 0) {
              // Player gets the gain minus all companion shares (retains any rounding remainder)
              charData.gold = currentGold + gain - companionShare * activeCompanions.length;
              updatedCompanions = updatedCompanions.map((c) =>
                c.status === "active" ? { ...c, gold: (c.gold ?? 0) + companionShare } : c
              );
              companionsChanged = true;
            }
          }
        }
      }
      updatedCharacter = { ...updatedCharacter, ...charData };
    }

    if (update.type === "campaignUpdate") {
      if (update.data.locationType) {
        console.log("[campaignUpdate] locationType →", update.data.locationType);
      }
      updatedCampaign = {
        ...updatedCampaign,
        worldState: {
          ...updatedCampaign.worldState,
          ...currentState.resolveTorchUpdate(update.data),
        } as typeof updatedCampaign.worldState,
      };
    }

    if (update.type === "journalUpdate") {
      const entry: JournalEntry = {
        ...update.data,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      newJournalEntries.push(entry);
      updatedCampaign = {
        ...updatedCampaign,
        worldState: {
          ...updatedCampaign.worldState,
          journalEntries: [entry, ...(updatedCampaign.worldState?.journalEntries ?? [])],
        } as typeof updatedCampaign.worldState,
      };
    }

    if (update.type === "companionJoined") {
      const data = update.data;
      if (!data.name || !data.ancestry || !data.class || typeof data.hp !== "number") continue;
      const alreadyExists = updatedCompanions.some(
        (c) => c.name?.toLowerCase() === data.name.toLowerCase()
      );
      if (!alreadyExists) {
        updatedCompanions = [
          ...updatedCompanions,
          {
            ...data,
            status: data.status ?? "active",
            id: crypto.randomUUID(),
            joinedAt: new Date().toISOString(),
          },
        ];
        companionsChanged = true;
      }
    }

    if (update.type === "companionUpdate") {
      const patch = update.data;
      updatedCompanions = updatedCompanions.map((c) =>
        c.id === patch.id ? { ...c, ...patch } : c
      );
      companionsChanged = true;
    }

    if (update.type === "playerDied") {
      deathData = {
        ...update.data,
        deathNarrative: narrative,
        companionsAtDeath: updatedCompanions,
      };
    }

    if (update.type === "mapReveal" && currentState.adventure) {
      mapRevealLocation = update.data.locationName;
    }

    if (
      update.type === "notification" &&
      update.data.type === "characterComplete" &&
      currentState.isGmCreateMode
    ) {
      isCharacterComplete = true;
      if (updatedCharacter.name && updatedCampaign.name === "New Adventure") {
        updatedCampaign = {
          ...updatedCampaign,
          name: `The Adventures of ${updatedCharacter.name}`,
        };
      }
    }

    if (update.type === "adventureComplete") {
      adventureComplete = {
        summary: update.data.summary,
        rewardDescription: update.data.rewardDescription ?? "",
      };
    }

    if (update.type === "gmNotesUpdate") {
      if (update.data.notes) updatedCampaign = { ...updatedCampaign, gmNotes: update.data.notes };
    }
  }

  if (companionsChanged) {
    updatedCampaign = {
      ...updatedCampaign,
      worldState: {
        ...updatedCampaign.worldState,
        companions: updatedCompanions,
      } as typeof updatedCampaign.worldState,
    };
  }

  return {
    updatedCharacter,
    updatedCampaign,
    updatedCompanions,
    companionsChanged,
    newJournalEntries,
    deathData,
    mapRevealLocation,
    isCharacterComplete,
    adventureComplete,
  };
}
