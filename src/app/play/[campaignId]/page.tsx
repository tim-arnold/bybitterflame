"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import { ChatWindow, type Message } from "@/components/chat/ChatWindow";
import { CharacterSheet } from "@/components/character/CharacterSheet";
import { DiceRoller } from "@/components/dice/DiceRoller";
import { TorchTimer } from "@/components/game/TorchTimer";
import { CombatTracker } from "@/components/game/CombatTracker";
import { SessionControls } from "@/components/game/SessionControls";
import { GameLayout } from "@/components/layout/GameLayout";
import { parseGameState } from "@/lib/game/state-parser";
import type { Character, Campaign } from "@/lib/game/types";

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

  // Load character and campaign data
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/campaign/${campaignId}`);
        if (res.ok) {
          const data = await res.json();
          setCharacter(data.character || {});
          setCampaign(data.campaign || {});
          setSessionNumber(data.sessionNumber || 1);
          if (data.messages) setMessages(data.messages);
        }
      } catch {
        // Campaign data will come from first interaction
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
        }

        setCharacter(updatedCharacter);
        setCampaign(updatedCampaign);
        setMessages([...newMessages, { role: "assistant", content: fullResponse }]);
        setStreamingContent("");
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
