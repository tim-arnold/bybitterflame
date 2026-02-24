"use client";

import { useState, useCallback } from "react";
import { ChatWindow, type Message } from "@/components/chat/ChatWindow";
import { CharacterSheet } from "@/components/character/CharacterSheet";
import { DiceRoller } from "@/components/dice/DiceRoller";
import { GameLayout } from "@/components/layout/GameLayout";
import { parseGameState } from "@/lib/game/state-parser";
import type { Character } from "@/lib/game/types";

export default function CreateCharacterPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingContent, setStreamingContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [character, setCharacter] = useState<Partial<Character>>({});
  const [hasStarted, setHasStarted] = useState(false);

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

        // Parse gamestate updates from the response
        const { narrative, updates } = parseGameState(fullResponse);

        // Apply character updates
        let updatedCharacter = { ...character };
        for (const update of updates) {
          if (update.type === "characterUpdate") {
            updatedCharacter = { ...updatedCharacter, ...update.data };
          }
          if (update.type === "notification" && update.data.type === "characterComplete") {
            // TODO: Save character to DB and redirect to gameplay
          }
        }
        setCharacter(updatedCharacter);

        setMessages([...newMessages, { role: "assistant", content: fullResponse }]);
        setStreamingContent("");
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
    [messages, character]
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
          isLoading={isLoading}
          placeholder="Describe your choice..."
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
              <li className={character.alignment ? "text-[var(--color-gold)]" : ""}>
                {character.alignment ? "\u2713" : "4."} Choose alignment
              </li>
              <li className={character.background ? "text-[var(--color-gold)]" : ""}>
                {character.background ? "\u2713" : "5."} Background
              </li>
              <li className={character.equipment?.length ? "text-[var(--color-gold)]" : ""}>
                {character.equipment?.length ? "\u2713" : "6."} Starting gear
              </li>
            </ol>
          </div>
        </>
      }
    />
  );
}
