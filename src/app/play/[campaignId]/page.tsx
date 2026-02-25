"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import { ChatWindow, type Message } from "@/components/chat/ChatWindow";
import { CharacterSheet } from "@/components/character/CharacterSheet";
import { DiceRoller } from "@/components/dice/DiceRoller";
import { TorchTimer } from "@/components/game/TorchTimer";
import { CombatTracker } from "@/components/game/CombatTracker";
import { SessionControls } from "@/components/game/SessionControls";
import { TravelersJournal } from "@/components/game/TravelersJournal";
import { GameLayout } from "@/components/layout/GameLayout";
import { parseGameState } from "@/lib/game/state-parser";
import type { Character, Campaign, JournalEntry } from "@/lib/game/types";

export default function PlayPage() {
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
        }
        if (newEntries.length > 0) {
          const combined = [...newEntries, ...(updatedCampaign.worldState?.journalEntries ?? [])];
          updatedCampaign = {
            ...updatedCampaign,
            worldState: { ...updatedCampaign.worldState, journalEntries: combined } as typeof updatedCampaign.worldState,
          };
          setJournalEntries(combined);
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
        const { narrative, updates } = parseGameState(fullResponse);

        let updatedCharacter = { ...character };
        let updatedCampaign = { ...campaign };

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
        }

        const finalMessages = [...newMessages, { role: "assistant" as const, content: fullResponse }];
        setCharacter(updatedCharacter);
        setCampaign(updatedCampaign);
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
    [messages, character, campaign, torchExpired]
  );

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
    // Save current state to API
    fetch(`/api/campaign/${campaignId}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ character, campaign, messages, sessionNumber }),
    });
  }

  function handleTorchExpire() {
    setTorchExpired(true);
    // Notify on next message
  }

  return (
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
  );
}
