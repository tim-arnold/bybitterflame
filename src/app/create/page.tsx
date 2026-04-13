"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ChatWindow, type Message } from "@/components/chat/ChatWindow";
import { CharacterSheet } from "@/components/character/CharacterSheet";
import { DiceRoller } from "@/components/dice/DiceRoller";
import { GameLayout } from "@/components/layout/GameLayout";
import { parseGameState } from "@/lib/game/state-parser";
import { trackEvent } from "@/lib/analytics";
import type { Character, Campaign, Companion } from "@/lib/game/types";

function CreateCharacterPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const adventureId = searchParams.get("adventureId") ?? undefined;
  const collectionId = searchParams.get("collectionId") ?? undefined;

  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingContent, setStreamingContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [character, setCharacter] = useState<Partial<Character>>({});
  const [campaign, setCampaign] = useState<Partial<Campaign>>({});
  const [hasStarted, setHasStarted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function saveCharacter(char: Partial<Character>, camp: Partial<Campaign>) {
    setIsSaving(true);
    try {
      // Read companions stored by the adventure detail page (Roll Your Own path)
      let companions: Companion[] | undefined;
      try {
        const stored = sessionStorage.getItem("adventure-companions");
        if (stored) {
          companions = JSON.parse(stored) as Companion[];
          sessionStorage.removeItem("adventure-companions");
        }
      } catch { /* ignore */ }

      const body: Record<string, unknown> = {
        character: char,
        gmPersona: camp.gmPersona ?? "",
        campaignType: adventureId ? "oneshot" : "standard",
        moduleId: collectionId ?? null,
        adventureId: adventureId ?? null,
      };
      if (companions && companions.length > 0) {
        body.companions = companions;
      }

      const res = await fetch("/api/character", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to save character");
      const { campaignId } = await res.json() as { campaignId: string };
      trackEvent({ name: "character_created" });
      trackEvent({ name: "adventure_started", type: "roll_own" });
      router.push(`/play/${campaignId}`);
    } catch (saveError) {
      console.error("Failed to save character:", saveError);
      setIsSaving(false);
    }
  }

  // True when all required fields are present for a valid character
  const isCharacterComplete =
    character.str !== undefined &&
    !!character.ancestry &&
    !!character.class &&
    !!character.name &&
    !!character.background &&
    !!(character.equipment?.length);

  const sendMessage = useCallback(
    async (content: string) => {
      const userMessage: Message = { role: "user", content };
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
            mode: "create",
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

        // Strip token sentinel appended by the streaming client
        const sentinelIdx = fullResponse.indexOf("\x00TOKENS:");
        if (sentinelIdx !== -1) fullResponse = fullResponse.slice(0, sentinelIdx);

        // Parse gamestate updates from the response
        const { updates } = parseGameState(fullResponse);

        let updatedCharacter = { ...character };
        let updatedCampaign = { ...campaign };
        let characterComplete = false;

        for (const update of updates) {
          if (update.type === "characterUpdate") {
            updatedCharacter = { ...updatedCharacter, ...update.data };
          }
          if (update.type === "campaignUpdate") {
            updatedCampaign = { ...updatedCampaign, ...update.data };
          }
          if (update.type === "notification" && update.data.type === "characterComplete") {
            characterComplete = true;
          }
        }

        setCharacter(updatedCharacter);
        setCampaign(updatedCampaign);
        setMessages([...newMessages, { role: "assistant", content: fullResponse }]);
        setStreamingContent("");

        if (characterComplete) {
          await saveCharacter(updatedCharacter, updatedCampaign);
        }
      } catch (error) {
        console.error("Chat error:", error);
        setMessages([
          ...newMessages,
          { role: "assistant", content: "The shadows swirl and the connection is lost. Please try again." },
        ]);
        setStreamingContent("");
      } finally {
        setIsLoading(false);
      }
    },
    [messages, character, campaign, router]
  );

  // Auto-start the conversation
  if (!hasStarted) {
    setHasStarted(true);
    // Send initial message after a tick
    setTimeout(() => sendMessage("I want to create a new character."), 100);
  }

  return (
    <GameLayout
      leftTitle="Character"
      rightTitle="Dice"
      leftPanel={<CharacterSheet character={character} />}
      centerPanel={
        <ChatWindow
          messages={messages}
          streamingContent={streamingContent}
          onSend={sendMessage}
          isLoading={isLoading || isSaving}
          placeholder={isSaving ? "Saving your character..." : "Describe your choice..."}
        />
      }
      rightPanel={
        <>
          <DiceRoller />
          <div className="bg-stone-900 border border-stone-700 rounded-lg p-3">
            <h3 className="text-xs uppercase tracking-wider text-stone-500 mb-2">Creation Steps</h3>
            <ol className="space-y-1 text-sm text-stone-400">
              <li className={character.str !== undefined ? "text-[var(--color-gold)]" : ""}>
                {character.str !== undefined ? "\u2713" : "1."} Roll ability scores
              </li>
              <li className={character.ancestry ? "text-[var(--color-gold)]" : ""}>
                {character.ancestry ? "\u2713" : "2."} Choose ancestry
              </li>
              <li className={character.class ? "text-[var(--color-gold)]" : ""}>
                {character.class ? "\u2713" : "3."} Choose class
              </li>
              <li className={character.name ? "text-[var(--color-gold)]" : ""}>
                {character.name ? "\u2713" : "4."} Name & pronouns
              </li>
              <li className={character.background ? "text-[var(--color-gold)]" : ""}>
                {character.background ? "\u2713" : "5."} Background
              </li>
              <li className={character.equipment?.length ? "text-[var(--color-gold)]" : ""}>
                {character.equipment?.length ? "\u2713" : "6."} Starting gear
              </li>
            </ol>
          </div>

          {isCharacterComplete && (
            <button
              onClick={() => saveCharacter(character, campaign)}
              disabled={isSaving}
              className="w-full bg-[var(--color-gold)] hover:bg-[var(--color-gold-dim)] disabled:opacity-50 disabled:cursor-not-allowed text-stone-900 font-semibold text-sm px-4 py-3 rounded-lg transition-colors"
            >
              {isSaving ? "Saving..." : "Begin Adventure →"}
            </button>
          )}
        </>
      }
    />
  );
}

export default function CreateCharacterPage() {
  return (
    <Suspense>
      <CreateCharacterPageInner />
    </Suspense>
  );
}