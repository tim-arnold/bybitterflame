"use client";

import { normalizeEquipmentArray } from "@/lib/game/state-parser";
import type { Character, Campaign } from "@/lib/game/types";
import type { SendMessageFn } from "./useDeathFlow";

export interface TorchHandlersReturn {
  torchCount: number;
  handleTorchStateChange: (remainingSeconds: number | null, isNewTorch?: boolean) => void;
  handleTorchSavedSecondsChange: (seconds: number | null) => void;
  handleTorchExpire: () => void;
}

/** Manages torch state changes, inventory consumption, persistence, and GM narration triggers. */
export function useTorchHandlers(params: {
  campaignId: string;
  sessionNumber: number;
  character: Partial<Character>;
  campaign: Partial<Campaign>;
  setCharacter: React.Dispatch<React.SetStateAction<Partial<Character>>>;
  setCampaign: React.Dispatch<React.SetStateAction<Partial<Campaign>>>;
  sendMessage: SendMessageFn;
}): TorchHandlersReturn {
  const { campaignId, sessionNumber, character, setCampaign, setCharacter, sendMessage } = params;

  const torchCount = normalizeEquipmentArray(character.equipment ?? []).reduce(
    (sum, item) =>
      item.name?.toLowerCase().startsWith("torch") ? sum + (item.quantity ?? 1) : sum,
    0
  );

  function handleTorchStateChange(remainingSeconds: number | null, isNewTorch?: boolean) {
    const isLighting = remainingSeconds !== null;
    void isNewTorch; // inventory is only consumed on natural expire, not on lighting

    setCampaign((prev) => {
      const updated = {
        ...prev,
        worldState: {
          ...prev.worldState,
          torchRemainingSeconds: remainingSeconds ?? undefined,
        } as typeof prev.worldState,
      };
      fetch(`/api/campaign/${campaignId}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaign: updated, sessionNumber }),
      }).catch((err) => console.error("Torch save failed:", err));
      return updated;
    });

    if (isLighting) {
      sendMessage(
        "[SYSTEM: The player has just lit a torch. 60 minutes of real-world light begins now. Acknowledge this briefly in your narration.]",
        { hidden: true, initialCharacter: character }
      );
    } else {
      sendMessage(
        "[SYSTEM: The player has extinguished their torch. Acknowledge this briefly — darkness closes in or they have another light source.]",
        { hidden: true }
      );
    }
  }

  function handleTorchSavedSecondsChange(seconds: number | null) {
    setCampaign((prev) => {
      const updated = {
        ...prev,
        worldState: {
          ...prev.worldState,
          torchSavedSeconds: seconds ?? undefined,
        } as typeof prev.worldState,
      };
      fetch(`/api/campaign/${campaignId}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaign: updated, sessionNumber }),
      }).catch((err) => console.error("Torch saved-seconds persist failed:", err));
      return updated;
    });
  }

  function handleTorchExpire() {
    // Torch fully burned out — consume one from inventory now.
    const equipment = normalizeEquipmentArray(character.equipment ?? []);
    const idx = equipment.findIndex((e) => e.name?.toLowerCase().startsWith("torch"));
    if (idx !== -1) {
      const qty = equipment[idx].quantity ?? 1;
      const newEquipment =
        qty <= 1
          ? equipment.filter((_, i) => i !== idx)
          : equipment.map((e, i) => (i === idx ? { ...e, quantity: qty - 1 } : e));
      setCharacter((prev) => ({ ...prev, equipment: newEquipment }));
      fetch(`/api/campaign/${campaignId}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ character: { equipment: newEquipment }, sessionNumber }),
      }).catch((err) => console.error("Torch expire inventory save failed:", err));
    }

    setCampaign((prev) => {
      const updated = {
        ...prev,
        worldState: {
          ...prev.worldState,
          torchRemainingSeconds: undefined,
        } as typeof prev.worldState,
      };
      fetch(`/api/campaign/${campaignId}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaign: updated, sessionNumber }),
      }).catch((err) => console.error("Torch expire save failed:", err));
      return updated;
    });
    sendMessage(
      "[SYSTEM: The torch has burned out. The party is now in total darkness. Describe the darkness closing in and apply the Blind condition.]",
      { hidden: true }
    );
  }

  return { torchCount, handleTorchStateChange, handleTorchSavedSecondsChange, handleTorchExpire };
}
