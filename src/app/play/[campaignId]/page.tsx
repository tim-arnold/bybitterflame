"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChatWindow, type Message } from "@/components/chat/ChatWindow";
import { CharacterSheet } from "@/components/character/CharacterSheet";
import { DiceRoller } from "@/components/dice/DiceRoller";
import { TorchTimer } from "@/components/game/TorchTimer";
import { CombatTracker } from "@/components/game/CombatTracker";
import { SessionControls } from "@/components/game/SessionControls";
import { TravelersJournal } from "@/components/game/TravelersJournal";
import { CompanionPanel } from "@/components/game/CompanionPanel";
import { DeathScreen } from "@/components/game/DeathScreen";
import { GameLayout } from "@/components/layout/GameLayout";
import { parseGameState } from "@/lib/game/state-parser";
import type { Character, Campaign, JournalEntry, Companion, LegacyCharacter } from "@/lib/game/types";

interface DeathData {
  causeOfDeath: string;
  legacyTalent?: string;
  killedByCompanionId?: string | null;
}

export default function PlayPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params.campaignId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingContent, setStreamingContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [character, setCharacter] = useState<Partial<Character>>({});
  const [campaign, setCampaign] = useState<Partial<Campaign>>({});
  const [sessionNumber, setSessionNumber] = useState(1);
  const [isInCombat, setIsInCombat] = useState(false);
  const [combatants, setCombatants] = useState<
    { name: string; initiative: number; isPlayer: boolean; isActive: boolean }[]
  >([]);
  const [combatRound, setCombatRound] = useState(1);
  const [torchExpired, setTorchExpired] = useState(false);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [isDead, setIsDead] = useState(false);
  const [deathData, setDeathData] = useState<DeathData | null>(null);

  useEffect(() => {
    const parts = ["ShadowdarkAI"];
    if (character.name) parts.push(character.name);
    if (campaign.worldState?.currentLocation) parts.push(campaign.worldState.currentLocation);
    document.title = parts.join(" : ");
  }, [character.name, campaign.worldState?.currentLocation]);

  // Load character and campaign data. For new campaigns (no messages), auto-trigger
  // the GM's opening scene using the freshly loaded data before state is set.
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/campaign/${campaignId}`);
        if (!res.ok) return;

        const data = await res.json();
        const loadedCharacter = data.character || {};
        const loadedCampaign = data.campaign || {};
        const loadedSessionNumber: number = data.sessionNumber || 1;
        const loadedMessages: Message[] = data.messages || [];

        setCharacter(loadedCharacter);
        setCampaign(loadedCampaign);
        setSessionNumber(loadedSessionNumber);
        setJournalEntries(loadedCampaign.worldState?.journalEntries ?? []);
        setCompanions(loadedCampaign.worldState?.companions ?? []);

        if (loadedMessages.length > 0) {
          setMessages(loadedMessages);
          return;
        }

        // New campaign — generate the opening scene immediately
        const triggerMsg: Message = { role: "user", content: "[BEGIN ADVENTURE]", hidden: true };
        setIsLoading(true);
        setStreamingContent("");

        const chatRes = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: "[BEGIN ADVENTURE]" }],
            character: loadedCharacter,
            campaign: loadedCampaign,
            mode: "play",
          }),
        });

        if (!chatRes.ok) { setIsLoading(false); return; }

        const reader = chatRes.body?.getReader();
        if (!reader) { setIsLoading(false); return; }

        const decoder = new TextDecoder();
        let fullResponse = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullResponse += decoder.decode(value, { stream: true });
          setStreamingContent(fullResponse);
        }

        const { updates } = parseGameState(fullResponse);
        let updatedCharacter = { ...loadedCharacter };
        let updatedCampaign = { ...loadedCampaign };
        const newEntries: JournalEntry[] = [];
        let updatedCompanions: Companion[] = loadedCampaign.worldState?.companions ?? [];

        for (const update of updates) {
          if (update.type === "characterUpdate") updatedCharacter = { ...updatedCharacter, ...update.data };
          if (update.type === "campaignUpdate") updatedCampaign = { ...updatedCampaign, ...update.data };
          if (update.type === "journalUpdate") {
            const entry: JournalEntry = {
              ...(update.data as Omit<JournalEntry, "id" | "createdAt">),
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
            };
            newEntries.push(entry);
          }
          if (update.type === "companionJoined") {
            const companion: Companion = {
              ...(update.data as Omit<Companion, "id" | "joinedAt">),
              id: crypto.randomUUID(),
              joinedAt: new Date().toISOString(),
            };
            updatedCompanions = [...updatedCompanions, companion];
          }
          if (update.type === "companionUpdate") {
            const patch = update.data as Partial<Companion> & { id: string };
            updatedCompanions = updatedCompanions.map((c) =>
              c.id === patch.id ? { ...c, ...patch } : c
            );
          }
          if (update.type === "playerDied") {
            setIsDead(true);
            setDeathData(update.data as unknown as DeathData);
          }
        }

        if (newEntries.length > 0) {
          const combined = [...newEntries, ...(updatedCampaign.worldState?.journalEntries ?? [])];
          updatedCampaign = {
            ...updatedCampaign,
            worldState: { ...updatedCampaign.worldState, journalEntries: combined } as typeof updatedCampaign.worldState,
          };
          setJournalEntries(combined);
        }

        if (updatedCompanions !== (loadedCampaign.worldState?.companions ?? [])) {
          updatedCampaign = {
            ...updatedCampaign,
            worldState: {
              ...updatedCampaign.worldState,
              companions: updatedCompanions,
            } as typeof updatedCampaign.worldState,
          };
          setCompanions(updatedCompanions);
        }

        const openingMessages: Message[] = [
          triggerMsg,
          { role: "assistant", content: fullResponse },
        ];

        setCharacter(updatedCharacter);
        setCampaign(updatedCampaign);
        setMessages(openingMessages);
        setStreamingContent("");
        setIsLoading(false);

        fetch(`/api/campaign/${campaignId}/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            character: updatedCharacter,
            campaign: updatedCampaign,
            messages: openingMessages,
            sessionNumber: loadedSessionNumber,
          }),
        }).catch((err) => console.error("Opening save failed:", err));
      } catch {
        setIsLoading(false);
      }
    }
    loadData();
  }, [campaignId]);

  const sendMessage = useCallback(
    async (content: string) => {
      // Inject torch context if expired
      let messageContent = content;
      if (torchExpired) {
        messageContent += "\n[SYSTEM: The torch has just gone out. The party is now in total darkness.]";
        setTorchExpired(false);
      }

      const userMessage: Message = { role: "user", content: messageContent };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setIsLoading(true);
      setStreamingContent("");

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
            character,
            campaign,
            mode: "play",
          }),
        });

        if (!response.ok) throw new Error("Chat request failed");

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let fullResponse = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullResponse += chunk;
          setStreamingContent(fullResponse);
        }

        // Parse gamestate updates
        const { updates } = parseGameState(fullResponse);

        let updatedCharacter = { ...character };
        let updatedCampaign = { ...campaign };
        let updatedCompanions = [...companions];

        for (const update of updates) {
          if (update.type === "characterUpdate") {
            updatedCharacter = { ...updatedCharacter, ...update.data };
          }
          if (update.type === "campaignUpdate") {
            updatedCampaign = { ...updatedCampaign, ...update.data };
          }
          if (update.type === "combatAction") {
            if (update.data.active !== undefined) setIsInCombat(update.data.active as boolean);
            if (update.data.combatants) setCombatants(update.data.combatants as typeof combatants);
            if (update.data.round) setCombatRound(update.data.round as number);
          }
          if (update.type === "journalUpdate") {
            const entry: JournalEntry = {
              ...(update.data as Omit<JournalEntry, "id" | "createdAt">),
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
            };
            setJournalEntries((prev) => [entry, ...prev]);
            updatedCampaign = {
              ...updatedCampaign,
              worldState: {
                ...updatedCampaign.worldState,
                journalEntries: [entry, ...(updatedCampaign.worldState?.journalEntries ?? [])],
              } as typeof updatedCampaign.worldState,
            };
          }
          if (update.type === "companionJoined") {
            const companion: Companion = {
              ...(update.data as Omit<Companion, "id" | "joinedAt">),
              id: crypto.randomUUID(),
              joinedAt: new Date().toISOString(),
            };
            updatedCompanions = [...updatedCompanions, companion];
          }
          if (update.type === "companionUpdate") {
            const patch = update.data as Partial<Companion> & { id: string };
            updatedCompanions = updatedCompanions.map((c) =>
              c.id === patch.id ? { ...c, ...patch } : c
            );
          }
          if (update.type === "playerDied") {
            setIsDead(true);
            setDeathData(update.data as unknown as DeathData);
          }
        }

        // Sync companions into campaign worldState
        updatedCampaign = {
          ...updatedCampaign,
          worldState: {
            ...updatedCampaign.worldState,
            companions: updatedCompanions,
          } as typeof updatedCampaign.worldState,
        };

        const finalMessages = [...newMessages, { role: "assistant" as const, content: fullResponse }];
        setCharacter(updatedCharacter);
        setCampaign(updatedCampaign);
        setCompanions(updatedCompanions);
        setMessages(finalMessages);
        setStreamingContent("");

        // Auto-save after every AI response
        fetch(`/api/campaign/${campaignId}/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            character: updatedCharacter,
            campaign: updatedCampaign,
            messages: finalMessages,
            sessionNumber,
          }),
        }).catch((err) => console.error("Auto-save failed:", err));
      } catch (error) {
        console.error("Chat error:", error);
        setMessages([
          ...newMessages,
          { role: "assistant", content: "The connection to the realm falters... Please try again." },
        ]);
        setStreamingContent("");
      } finally {
        setIsLoading(false);
      }
    },
    [messages, character, campaign, companions, torchExpired, campaignId, sessionNumber]
  );

  async function handleCompanionInherit(companionId: string) {
    const companion = companions.find((c) => c.id === companionId);
    if (!companion) return;

    // Build legacy character record for the dead character
    const legacyChar: LegacyCharacter = {
      name: character.name ?? "Unknown",
      ancestry: character.ancestry ?? "",
      class: character.class ?? "",
      level: character.level ?? 1,
      causeOfDeath: deathData?.causeOfDeath ?? "Unknown",
      inheritedBy: companion.name,
      legacyTalent: deathData?.legacyTalent,
      diedAt: new Date().toISOString(),
    };

    // Remove the companion from the companions list (they're now the player)
    const remainingCompanions = companions.filter((c) => c.id !== companionId);

    // Build updated world state
    const updatedWorldState = {
      ...(campaign.worldState ?? {}),
      companions: remainingCompanions,
      legacyCharacters: [
        legacyChar,
        ...(campaign.worldState?.legacyCharacters ?? []),
      ],
    };

    try {
      const res = await fetch(`/api/campaign/${campaignId}/inherit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companion,
          legacyTalent: deathData?.legacyTalent,
          deadCharacterName: character.name ?? "Unknown",
          updatedWorldState,
        }),
      });

      if (!res.ok) {
        console.error("Inherit request failed");
        return;
      }

      const { newCharacterId } = await res.json();

      // Build new character from companion stats
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
        deity: companion.deity,
        languages: companion.languages,
        str: companion.str,
        dex: companion.dex,
        con: companion.con,
        int: companion.int,
        wis: companion.wis,
        cha: companion.cha,
        hp: companion.hp,
        maxHp: companion.maxHp,
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

      setCharacter(newCharacter);
      setCampaign(updatedCampaign);
      setCompanions(remainingCompanions);
      setIsDead(false);
      setDeathData(null);

      // Trigger GM transition narration
      const sysMsg = `[SYSTEM: CHARACTER_TRANSFER: ${character.name ?? "The fallen hero"}'s soul has passed into ${companion.name}. ${deathData?.legacyTalent ? `They carry the legacy talent: ${deathData.legacyTalent}.` : ""} Narrate this dramatic moment. The remaining companions react per their personalities.]`;
      sendMessage(sysMsg);
    } catch (err) {
      console.error("Inherit failed:", err);
    }
  }

  function handleCampaignEnd() {
    router.push("/");
  }

  function handleAddJournalEntry(entryData: Omit<JournalEntry, "id" | "createdAt">) {
    const entry: JournalEntry = {
      ...entryData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setJournalEntries((prev) => [entry, ...prev]);
    setCampaign((prev) => ({
      ...prev,
      worldState: {
        ...prev.worldState,
        journalEntries: [entry, ...(prev.worldState?.journalEntries ?? [])],
      } as typeof prev.worldState,
    }));
  }

  function handleEditJournalEntry(id: string, entryData: Omit<JournalEntry, "id" | "createdAt">) {
    setJournalEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...entryData } : e))
    );
    setCampaign((prev) => ({
      ...prev,
      worldState: {
        ...prev.worldState,
        journalEntries: (prev.worldState?.journalEntries ?? []).map((e) =>
          e.id === id ? { ...e, ...entryData } : e
        ),
      } as typeof prev.worldState,
    }));
  }

  function handleDeleteJournalEntry(id: string) {
    setJournalEntries((prev) => prev.filter((e) => e.id !== id));
    setCampaign((prev) => ({
      ...prev,
      worldState: {
        ...prev.worldState,
        journalEntries: (prev.worldState?.journalEntries ?? []).filter((e) => e.id !== id),
      } as typeof prev.worldState,
    }));
  }

  function handleEndSession() {
    sendMessage("[SYSTEM: The player wants to end this session. Please provide a summary of what happened.]");
  }

  function handleSaveSession() {
    fetch(`/api/campaign/${campaignId}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ character, campaign, messages, sessionNumber }),
    });
  }

  function handleTorchExpire() {
    setTorchExpired(true);
  }

  return (
    <>
      <GameLayout
        leftTitle="Character"
        rightTitle="Tools"
        leftPanel={<CharacterSheet character={character} />}
        centerPanel={
          <ChatWindow
            messages={messages}
            streamingContent={streamingContent}
            onSend={sendMessage}
            isLoading={isLoading}
            placeholder="What do you do?"
          />
        }
        rightPanel={
          <>
            <TorchTimer campaignId={campaignId} onExpire={handleTorchExpire} />
            <CombatTracker
              combatants={combatants}
              round={combatRound}
              isInCombat={isInCombat}
            />
            <CompanionPanel companions={companions} />
            <TravelersJournal
              entries={journalEntries}
              onAddEntry={handleAddJournalEntry}
              onEditEntry={handleEditJournalEntry}
              onDeleteEntry={handleDeleteJournalEntry}
            />
            <DiceRoller />
            <SessionControls
              sessionNumber={sessionNumber}
              onEndSession={handleEndSession}
              onSaveSession={handleSaveSession}
              isLoading={isLoading}
            />
          </>
        }
      />

      {isDead && deathData && (
        <DeathScreen
          deadCharacter={character}
          companions={companions}
          deathData={deathData}
          onInherit={handleCompanionInherit}
          onCampaignEnd={handleCampaignEnd}
        />
      )}
    </>
  );
}
