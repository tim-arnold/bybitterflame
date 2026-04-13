"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";
import type { Character, Campaign, Companion, LegacyCharacter } from "@/lib/game/types";

export interface DeathData {
  causeOfDeath: string;
  legacyTalent?: string;
  killedByCompanionId?: string | null;
  deathNarrative?: string;
  companionsAtDeath?: Companion[];
}

export type SendMessageFn = (
  content: string,
  options?: {
    hidden?: boolean;
    initialCharacter?: Partial<Character>;
    initialCampaign?: Partial<Campaign>;
    initialCompanions?: Companion[];
  }
) => Promise<void>;

export interface DeathFlowReturn {
  isDead: boolean;
  deathData: DeathData | null;
  deathAcknowledged: boolean;
  setIsDead: React.Dispatch<React.SetStateAction<boolean>>;
  setDeathData: React.Dispatch<React.SetStateAction<DeathData | null>>;
  acknowledgesDeath: () => void;
  handleCompanionInherit: (companionId: string) => Promise<void>;
}

/** Manages character death state and the companion soul-transfer inheritance flow. */
export function useDeathFlow(params: {
  campaignId: string;
  sessionNumber: number;
  character: Partial<Character>;
  campaign: Partial<Campaign>;
  companions: Companion[];
  /** A ref pointing to sendMessage — use a ref to avoid circular hook dependency. */
  sendMessageRef: React.RefObject<SendMessageFn>;
  onInheritComplete: (
    newCharacter: Partial<Character>,
    updatedCampaign: Partial<Campaign>,
    remainingCompanions: Companion[]
  ) => void;
}): DeathFlowReturn {
  const { campaignId, sessionNumber, character, campaign, companions, sendMessageRef, onInheritComplete } =
    params;

  const [isDead, setIsDead] = useState(false);
  const [deathData, setDeathData] = useState<DeathData | null>(null);
  const [deathAcknowledged, setDeathAcknowledged] = useState(false);

  function acknowledgesDeath() {
    setDeathAcknowledged(true);
  }

  async function handleCompanionInherit(companionId: string) {
    const companion = companions.find((c) => c.id === companionId);
    if (!companion) return;

    // Build legacy character record for the dead character (preserving their gear on the corpse)
    const legacyChar: LegacyCharacter = {
      name: character.name ?? "Unknown",
      ancestry: character.ancestry ?? "",
      class: character.class ?? "",
      level: character.level ?? 1,
      causeOfDeath: deathData?.causeOfDeath ?? "Unknown",
      inheritedBy: companion.name,
      legacyTalent: deathData?.legacyTalent,
      diedAt: new Date().toISOString(),
      equipment: character.equipment ?? [],
    };

    const remainingCompanions = companions.filter((c) => c.id !== companionId);

    const updatedWorldState = {
      ...(campaign.worldState ?? {}),
      companions: remainingCompanions,
      legacyCharacters: [legacyChar, ...(campaign.worldState?.legacyCharacters ?? [])],
      pendingDeath: undefined,
    };

    try {
      const res = await fetch(`/api/campaign/${campaignId}/inherit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companion,
          legacyTalent: deathData?.legacyTalent,
          deadCharacterName: character.name ?? "Unknown",
          deadCharacterLanguages: character.languages ?? [],
          updatedWorldState,
        }),
      });

      if (!res.ok) {
        console.error("Inherit request failed");
        return;
      }

      const { newCharacterId } = await res.json();
      trackEvent({ name: "soul_transferred" });

      const talents = deathData?.legacyTalent
        ? [...companion.talents, deathData.legacyTalent]
        : [...companion.talents];

      const newCharacter: Partial<Character> = {
        id: newCharacterId,
        name: companion.name,
        pronouns: companion.pronouns,
        ancestry: companion.ancestry,
        class: companion.class,
        level: companion.level,
        xp: 0,
        alignment: companion.alignment,
        background: companion.background,
        // Deity: keep the companion's own faith — soul transfer doesn't change religious allegiance
        deity: companion.deity,
        // Languages: merge both — the soul carries its memories into the new body
        languages: [
          ...new Set([...(companion.languages ?? []), ...(character.languages ?? [])]),
        ],
        str: companion.str,
        dex: companion.dex,
        con: companion.con,
        int: companion.int,
        wis: companion.wis,
        cha: companion.cha,
        // Use companion's current HP; fall back to maxHp if HP was never tracked (0)
        hp: companion.hp > 0 ? companion.hp : companion.maxHp || 1,
        maxHp: companion.maxHp || 1,
        ac: companion.ac,
        equipment: companion.equipment,
        spells: companion.spells,
        talents,
        features: [],
        gold: 0,
        silver: 0,
        copper: 0,
      };

      const updatedCampaign = {
        ...campaign,
        characterId: newCharacterId,
        worldState: updatedWorldState as typeof campaign.worldState,
      };

      setIsDead(false);
      setDeathData(null);
      onInheritComplete(newCharacter, updatedCampaign, remainingCompanions);

      // Immediately persist the correct new character to DB — this races ahead of
      // sendMessage's auto-save, which runs after the GM responds (~5-10s later).
      fetch(`/api/campaign/${campaignId}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          character: newCharacter,
          campaign: updatedCampaign,
          sessionNumber,
        }),
      }).catch((err) => console.error("Post-inherit save failed:", err));

      // Trigger GM transition narration — pass fresh state so sendMessage doesn't
      // use stale closures (React state updates haven't flushed yet at call time).
      const sysMsg = `[SYSTEM: SOUL TRANSFER — ${character.name ?? "The fallen hero"} has died and their soul has passed into ${companion.name}. ${deathData?.legacyTalent ? `The player carries a legacy talent forward: ${deathData.legacyTalent}.` : ""}

Write a full, emotionally resonant scene of 4-6 paragraphs narrating this transfer. This is one of the most significant moments in the game — do not treat it as a brief transition. Cover:
1. The physical/spiritual moment of the soul leaving ${character.name ?? "the fallen hero"} and entering ${companion.name} — what does it feel, look, or sound like?
2. ${companion.name}'s experience of suddenly carrying another's memories, purpose, or presence — disorienting, clarifying, or both?
3. How the remaining world reacts — enemies, the environment, any other companions present
4. The emotional weight: grief for the fallen, resolve in the new vessel, or something more complicated
5. End with ${companion.name} (now the player character) taking their first action in the world — a line of dialogue, a choice, a step forward

Write with the full folklore tone of the setting. No mechanical exposition. The player is now ${companion.name}.]`;
      sendMessageRef.current(sysMsg, {
        hidden: true,
        initialCharacter: newCharacter,
        initialCampaign: updatedCampaign,
        initialCompanions: remainingCompanions,
      });
    } catch (err) {
      console.error("Inherit failed:", err);
    }
  }

  return { isDead, deathData, deathAcknowledged, setIsDead, setDeathData, acknowledgesDeath, handleCompanionInherit };
}
