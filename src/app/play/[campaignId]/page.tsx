"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChatWindow, type Message } from "@/components/chat/ChatWindow";
import { CharacterSheet } from "@/components/character/CharacterSheet";
import { DiceRoller } from "@/components/dice/DiceRoller";
import { TorchTimer, type TorchTimerHandle } from "@/components/game/TorchTimer";
import { CombatTracker } from "@/components/game/CombatTracker";
import { SessionControls } from "@/components/game/SessionControls";
import { TravelersJournal } from "@/components/game/TravelersJournal";
import { QuestLog } from "@/components/game/QuestLog";
import { CompanionPanel } from "@/components/game/CompanionPanel";
import { DeathScreen } from "@/components/game/DeathScreen";
import { AdventureCompleteScreen } from "@/components/game/AdventureCompleteScreen";
import { WorldConditions } from "@/components/game/WorldConditions";
import { MapViewer } from "@/components/game/MapViewer";
import { GameLayout } from "@/components/layout/GameLayout";
import { HowToPlayModal, shouldShowHowToPlay } from "@/components/HowToPlayModal";
import { parseGameState } from "@/lib/game/state-parser";
import { trackEvent } from "@/lib/analytics";
import type { Character, Campaign, Companion } from "@/lib/game/types";
import { useTokenTracking } from "./hooks/useTokenTracking";
import { useCombatTracker } from "./hooks/useCombatTracker";
import { useAdventureModule } from "./hooks/useAdventureModule";
import { useJournal } from "./hooks/useJournal";
import { useDeathFlow, type SendMessageFn } from "./hooks/useDeathFlow";
import { useTorchHandlers } from "./hooks/useTorchHandlers";
import { processGamestateUpdates } from "./hooks/processGamestateUpdates";
import { GameErrorBoundary } from "@/components/GameErrorBoundary";

/** Keep only the first companion with each name (guards against GM re-emitting companionJoined) */
function deduplicateCompanions(companions: Companion[]): Companion[] {
  const seen = new Set<string>();
  return companions.filter((c) => {
    if (!c.name) return false;
    const key = c.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Translate a GM-emitted torchLit signal into a torchRemainingSeconds value.
 * The GM emits { torchLit: true/false } — the UI owns the actual clock.
 */
function resolveTorchUpdate(data: import("@/lib/game/types").CampaignUpdateData): Partial<import("@/lib/game/types").WorldState> {
  if (!("torchLit" in data)) return data;
  const { torchLit, ...rest } = data;
  if (torchLit === true) return { ...rest, torchRemainingSeconds: 60 * 60 };
  return { ...rest, torchRemainingSeconds: undefined };
}

export default function PlayPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params.campaignId as string;

  // Core session state
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingContent, setStreamingContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPageReady, setIsPageReady] = useState(false);
  const [character, setCharacter] = useState<Partial<Character>>({});
  const [campaign, setCampaign] = useState<Partial<Campaign>>({});
  const [sessionNumber, setSessionNumber] = useState(1);
  const [sessionSummaries, setSessionSummaries] = useState<string[]>([]);
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [adventureCompleteData, setAdventureCompleteData] = useState<{
    summary: string;
    rewardDescription: string;
  } | null>(null);
  const [isGmCreateMode, setIsGmCreateMode] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [isPausing, setIsPausing] = useState(false);
  // Ref mirror so sendMessage (stale closure) can see the latest isPausing value
  const isPausingRef = useRef(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const saveResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const torchTimerRef = useRef<TorchTimerHandle>(null);
  // Ref to sendMessage — avoids circular dependency when passing it to useDeathFlow
  const sendMessageRef = useRef<SendMessageFn>(async () => {});

  const tokens = useTokenTracking();
  const combat = useCombatTracker();
  const adventureModule = useAdventureModule();
  const journal = useJournal(setCampaign);
  const death = useDeathFlow({
    campaignId,
    sessionNumber,
    character,
    campaign,
    companions,
    sendMessageRef,
    onInheritComplete: (newCharacter, updatedCampaign, remainingCompanions) => {
      setCharacter(newCharacter);
      setCampaign(updatedCampaign);
      setCompanions(remainingCompanions);
    },
  });

  const campaignTitle = adventureModule.adventure?.title ?? campaign.name ?? "";

  useEffect(() => {
    const parts = ["By Bitter Flame"];
    if (campaignTitle) parts.push(campaignTitle);
    if (character.name) parts.push(character.name);
    document.title = parts.join(" · ");
  }, [campaignTitle, character.name]);

  // Load character and campaign data. For new campaigns (no messages), auto-trigger
  // the GM's opening scene using the freshly loaded data before state is set.
  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      try {
        const res = await fetch(`/api/campaign/${campaignId}`, { signal: controller.signal });
        if (!res.ok) return;

        const data = await res.json();
        const loadedCharacter = data.character || {};
        const loadedCampaign = data.campaign || {};
        const loadedSessionNumber: number = data.sessionNumber || 1;
        const loadedMessages: Message[] = data.messages || [];
        const loadedSessionSummaries: string[] = data.sessionSummaries || [];

        setCharacter(loadedCharacter);
        setCampaign(loadedCampaign);
        setSessionNumber(loadedSessionNumber);
        setSessionSummaries(loadedSessionSummaries);
        journal.setInitialEntries(loadedCampaign.worldState?.journalEntries ?? []);

        // Deduplicate companions by name on load; also exclude current character
        // (guards against stale DB state after soul transfer)
        const rawCompanions = loadedCampaign.worldState?.companions ?? [];
        const dedupedCompanions = deduplicateCompanions(
          rawCompanions.filter(
            (c: Companion) =>
              c.name.toLowerCase() !== (loadedCharacter.name ?? "").toLowerCase()
          )
        );
        setCompanions(dedupedCompanions);

        // Load adventure data if campaign has a module
        const moduleId = loadedCampaign.moduleId;
        const adventureId = loadedCampaign.adventureId;
        let loadedAdventure = undefined;
        if (moduleId && adventureId) {
          loadedAdventure = adventureModule.loadAdventure(moduleId, adventureId);
        }

        const needsGmCreate = !loadedCharacter.name;
        if (needsGmCreate) setIsGmCreateMode(true);

        // Restore death state if character died but soul transfer hasn't happened yet
        const pendingDeath = loadedCampaign.worldState?.pendingDeath;
        if (pendingDeath) {
          death.setIsDead(true);
          death.setDeathData({
            ...pendingDeath,
            deathNarrative: undefined,
            companionsAtDeath: deduplicateCompanions(
              (loadedCampaign.worldState?.companions ?? []).filter(
                (c: Companion) => c.name.toLowerCase() !== (loadedCharacter.name ?? "").toLowerCase()
              )
            ),
          });
        }

        setIsPageReady(true);

        if (loadedMessages.length > 0) {
          setMessages(loadedMessages);
          return;
        }

        // New campaign — show how-to-play modal if not dismissed
        if (shouldShowHowToPlay()) setShowHowToPlay(true);

        // Generate the opening scene immediately
        const chatMode = needsGmCreate
          ? loadedCampaign.moduleId && loadedCampaign.adventureId
            ? "adventure-create"
            : "gm-create"
          : "play";

        let gmCreateContent = "[BEGIN CHARACTER CREATION]";
        if (needsGmCreate) {
          const storedAnswers = sessionStorage.getItem(`gm-create-answers-${campaignId}`);
          if (storedAnswers) {
            const parsed = JSON.parse(storedAnswers) as Record<string, string>;
            const parts = Object.values(parsed).filter(Boolean);
            if (parts.length > 0) gmCreateContent = parts.join(" | ");
            sessionStorage.removeItem(`gm-create-answers-${campaignId}`);
          }
        }

        const triggerMsg: Message = {
          role: "user",
          content: needsGmCreate ? gmCreateContent : "[BEGIN ADVENTURE]",
          hidden: true,
        };
        setIsLoading(true);
        setStreamingContent("");

        const chatRes = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: triggerMsg.content }],
            character: loadedCharacter,
            campaign: loadedCampaign,
            sessionSummaries: loadedSessionSummaries,
            mode: chatMode,
            preferHaiku: tokens.economyMode || undefined,
          }),
          signal: controller.signal,
        });

        if (!chatRes.ok) {
          setIsLoading(false);
          return;
        }

        const reader = chatRes.body?.getReader();
        if (!reader) {
          setIsLoading(false);
          return;
        }

        const decoder = new TextDecoder();
        let fullResponse = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullResponse += decoder.decode(value, { stream: true });
          setStreamingContent(fullResponse.replace(/\x00TOKENS:\{[^}]+\}/g, ""));
        }
        fullResponse = tokens.extractTokens(fullResponse);

        const { narrative, updates } = parseGameState(fullResponse);
        const result = processGamestateUpdates(updates, narrative, {
          character: loadedCharacter,
          campaign: loadedCampaign,
          companions: dedupedCompanions,
          isGmCreateMode: needsGmCreate,
          adventure: loadedAdventure ?? null,
          resolveTorchUpdate,
        });

        for (const entry of result.newJournalEntries) {
          journal.applyJournalEntry(entry);
        }
        if (result.deathData) {
          death.setIsDead(true);
          death.setDeathData(result.deathData);
        }
        if (result.mapRevealLocation && loadedAdventure && loadedCampaign.moduleId) {
          adventureModule.applyMapReveal(
            result.mapRevealLocation,
            loadedAdventure,
            loadedCampaign.moduleId
          );
        }
        if (result.isCharacterComplete) {
          trackEvent({ name: "character_created" });
          setIsGmCreateMode(false);
        }
        if (result.adventureComplete) {
          trackEvent({ name: "adventure_completed" });
          setAdventureCompleteData(result.adventureComplete);
        }
        if (result.companionsChanged) setCompanions(result.updatedCompanions);

        const openingMessages: Message[] = [
          triggerMsg,
          { role: "assistant", content: fullResponse },
        ];

        setCharacter(result.updatedCharacter);
        setCampaign(result.updatedCampaign);
        setMessages(openingMessages);
        setStreamingContent("");
        setIsLoading(false);

        fetch(`/api/campaign/${campaignId}/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            character: result.updatedCharacter,
            campaign: result.updatedCampaign,
            messages: openingMessages,
            sessionNumber: loadedSessionNumber,
          }),
        }).catch((err) => console.error("Opening save failed:", err));
      } catch {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    loadData();
    return () => controller.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId]);

  const doSave = useCallback((body: object) => {
    if (saveResetRef.current) clearTimeout(saveResetRef.current);
    setSaveStatus("saving");
    const minDelay = new Promise<void>((res) => setTimeout(res, 3000));
    const saveFetch = fetch(`/api/campaign/${campaignId}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    Promise.all([saveFetch, minDelay])
      .then(() => {
        setSaveStatus("saved");
        saveResetRef.current = setTimeout(() => setSaveStatus("idle"), 3000);
      })
      .catch((err) => {
        console.error("Save failed:", err);
        setSaveStatus("idle");
      });
  }, [campaignId]);

  const sendMessage = useCallback(
    async (
      content: string,
      {
        hidden = false,
        initialCharacter,
        initialCampaign,
        initialCompanions,
      }: {
        hidden?: boolean;
        initialCharacter?: Partial<Character>;
        initialCampaign?: Partial<Campaign>;
        initialCompanions?: Companion[];
      } = {}
    ) => {
      // Use caller-supplied overrides when available (e.g. after soul transfer, before
      // React state has re-rendered with the new values).
      const activeCharacter = initialCharacter ?? character;
      const activeCampaign = initialCampaign ?? campaign;
      const activeCompanions = initialCompanions ?? companions;

      const userMessage: Message = { role: "user", content, hidden };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setIsLoading(true);
      setStreamingContent("");

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: newMessages.map((m) => ({ role: m.role, content: m.content, hidden: m.hidden })),
            character: activeCharacter,
            campaign: activeCampaign,
            sessionSummaries,
            mode: isGmCreateMode ? "adventure-create" : "play",
            preferHaiku: tokens.economyMode || undefined,
          }),
        });

        if (response.status === 402) {
          const errData = (await response.json()) as {
            error: string;
            turnsUsed: number;
            limit: number;
          };
          if (errData.error === "api_key_required") {
            trackEvent({ name: "free_turns_exhausted" });
            setMessages([
              ...newMessages,
              {
                role: "assistant",
                content: `*The arcane channel falls silent...*\n\nYou've used all ${errData.limit} free turns. To continue playing, add your Anthropic API key in [Settings](/account).\n\n**Note:** API keys use prepaid credits from [console.anthropic.com](https://console.anthropic.com) — a Claude.ai subscription does not cover API access. You'll need to purchase credits separately there.`,
              },
            ]);
            setStreamingContent("");
            setIsLoading(false);
            return;
          }
        }

        if (!response.ok) throw new Error("Chat request failed");

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let fullResponse = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullResponse += decoder.decode(value, { stream: true });
          setStreamingContent(fullResponse.replace(/\x00TOKENS:\{[^}]+\}/g, ""));
        }
        fullResponse = tokens.extractTokens(fullResponse);

        const { narrative, updates } = parseGameState(fullResponse);
        const result = processGamestateUpdates(updates, narrative, {
          character: activeCharacter,
          campaign: activeCampaign,
          companions: activeCompanions,
          isGmCreateMode,
          adventure: adventureModule.adventure,
          resolveTorchUpdate,
        });

        // Apply combat updates
        for (const update of updates) {
          if (update.type === "combatAction") {
            combat.applyCombatAction(update.data);
          }
        }

        // Apply journal entries
        for (const entry of result.newJournalEntries) {
          journal.applyJournalEntry(entry);
        }

        // Apply side effects
        if (result.deathData) {
          trackEvent({ name: "character_died" });
          death.setIsDead(true);
          death.setDeathData(result.deathData);
          // Persist death state so it survives page refresh
          result.updatedCampaign = {
            ...result.updatedCampaign,
            worldState: {
              ...result.updatedCampaign.worldState,
              pendingDeath: {
                causeOfDeath: result.deathData.causeOfDeath,
                legacyTalent: result.deathData.legacyTalent,
                killedByCompanionId: result.deathData.killedByCompanionId,
              },
            } as typeof result.updatedCampaign.worldState,
          };
        }
        if (result.mapRevealLocation && adventureModule.adventure && campaign.moduleId) {
          adventureModule.applyMapReveal(
            result.mapRevealLocation,
            adventureModule.adventure,
            campaign.moduleId
          );
        }
        if (result.isCharacterComplete) {
          trackEvent({ name: "character_created" });
          setIsGmCreateMode(false);
        }
        if (result.adventureComplete && !isPausingRef.current) {
          trackEvent({ name: "adventure_completed" });
          setAdventureCompleteData(result.adventureComplete);
        }

        // Capture current torch countdown before committing state — prevents stale
        // closure from overwriting a torch change that happened mid-sendMessage
        const torchSecsNow = torchTimerRef.current?.getSecondsLeft();
        const finalCampaign =
          torchSecsNow !== undefined
            ? {
                ...result.updatedCampaign,
                worldState: {
                  ...result.updatedCampaign.worldState,
                  torchRemainingSeconds: torchSecsNow ?? undefined,
                } as typeof result.updatedCampaign.worldState,
              }
            : result.updatedCampaign;

        const finalMessages = [...newMessages, { role: "assistant" as const, content: fullResponse }];

        setCharacter(result.updatedCharacter);
        setCampaign(finalCampaign);
        if (result.companionsChanged) setCompanions(result.updatedCompanions);
        setMessages(finalMessages);
        setStreamingContent("");
        if (tokens.isOnTrial) tokens.incrementTrialTurn();

        doSave({ character: result.updatedCharacter, campaign: finalCampaign, messages: finalMessages, sessionNumber });
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
    [messages, character, campaign, companions, campaignId, sessionNumber, isGmCreateMode, tokens, combat, adventureModule, journal, death, doSave]
  );
  // Keep the ref current so useDeathFlow and useTorchHandlers always call the latest sendMessage
  sendMessageRef.current = sendMessage;

  const torch = useTorchHandlers({
    campaignId,
    sessionNumber,
    character,
    campaign,
    setCharacter,
    setCampaign,
    sendMessage,
  });

  function handleCarouseComplete(
    xpGained: number,
    goldLost: number,
    levelUpOverride?: Partial<Character>,
    companionUpdates?: Companion[],
    characterPatches?: Partial<Character>,
    worldStatePatches?: import("@/components/game/adventure-complete/types").CarouseWorldStatePatches
  ) {
    const isOneshot = campaign.campaignType === "oneshot";

    const baseCharacter: Partial<Character> = levelUpOverride
      ? { ...character, ...levelUpOverride, ...characterPatches, gold: Math.max(0, (character.gold ?? 0) - goldLost) }
      : { ...character, xp: (character.xp ?? 0) + xpGained, gold: Math.max(0, (character.gold ?? 0) - goldLost), ...characterPatches };

    const updatedCharacter: Partial<Character> = isOneshot
      ? { ...baseCharacter, hp: baseCharacter.maxHp }
      : baseCharacter;

    setCharacter(updatedCharacter);

    let updatedCampaign = campaign;

    // Merge NPC allies from carousing into worldState
    if (worldStatePatches?.npcs && worldStatePatches.npcs.length > 0) {
      updatedCampaign = {
        ...updatedCampaign,
        worldState: {
          ...updatedCampaign.worldState!,
          npcs: [...(updatedCampaign.worldState?.npcs ?? []), ...worldStatePatches.npcs],
        },
      };
    }

    if (companionUpdates && companionUpdates.length > 0) {
      const updatedById = new Map(companionUpdates.map((c) => [c.id, c]));
      const mergedCompanions = (updatedCampaign.worldState?.companions ?? []).map((c) => {
        const updated = updatedById.get(c.id) ?? c;
        return isOneshot && updated.status === "active"
          ? { ...updated, hp: updated.maxHp }
          : updated;
      });
      updatedCampaign = {
        ...updatedCampaign,
        worldState: { ...updatedCampaign.worldState!, companions: mergedCompanions },
      };
      setCompanions(mergedCompanions);
    } else if (isOneshot) {
      // No companion XP updates but still need to restore HP for active companions
      const mergedCompanions = (updatedCampaign.worldState?.companions ?? []).map((c) =>
        c.status === "active" ? { ...c, hp: c.maxHp } : c
      );
      updatedCampaign = {
        ...updatedCampaign,
        worldState: { ...updatedCampaign.worldState!, companions: mergedCompanions },
      };
      setCompanions(mergedCompanions);
    }

    doSave({ character: updatedCharacter, campaign: updatedCampaign, sessionNumber });
    // Only mark the campaign as completed for oneshot campaigns — open-ended
    // campaigns continue after downtime.
    if (isOneshot) {
      fetch(`/api/campaign/${campaignId}/complete`, { method: "POST" }).catch((err) =>
        console.error("Complete failed:", err)
      );
    }
  }

  function handleDiceRoll(result: import("@/lib/game/dice").DiceResult) {
    const parts = result.rolls.length > 1 ? result.rolls.join(", ") + " = " : "";
    const mod = result.modifier !== 0 ? ` (${result.modifier > 0 ? "+" : ""}${result.modifier})` : "";
    sendMessage(`[Rolled ${result.notation}: ${parts}${result.total}${mod}]`);
  }

  function handleSpendWyrd() {
    const current = character.wyrd ?? 0;
    if (current <= 0) return;
    const next = current - 1;
    setCharacter({ ...character, wyrd: next });
    sendMessage(
      `[SYSTEM: The player spent a wyrd. They may reroll any single die result and take the better outcome. Remaining wyrd: ${next}.]`,
      { hidden: true }
    );
  }

  function handleResumeSession() {
    torchTimerRef.current?.resume();
    isPausingRef.current = false;
    setIsPausing(false);
  }

  function handleEndSession() {
    trackEvent({ name: "session_paused" });
    isPausingRef.current = true;
    setIsPausing(true);
    torchTimerRef.current?.pause();
    sendMessage(
      "[SYSTEM: The player wants to end this session. Please provide a summary of what happened.]",
      { hidden: true }
    );
    fetch(`/api/campaign/${campaignId}/summarize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionNumber }),
    }).catch((err) => console.error("Summarize failed:", err));
  }

  function handleSaveSession() {
    const torchSecsNow = torchTimerRef.current?.getSecondsLeft();
    const campaignToSave =
      torchSecsNow !== undefined
        ? {
            ...campaign,
            worldState: {
              ...campaign.worldState,
              torchRemainingSeconds: torchSecsNow ?? undefined,
            } as typeof campaign.worldState,
          }
        : campaign;
    doSave({ character, campaign: campaignToSave, messages, sessionNumber });
  }


  return (
    <GameErrorBoundary>
      <>
      {/* Full-page loading overlay — fades out once campaign data is ready */}
      <div
        className={`fixed inset-0 z-[100] bg-[url('/bg-woodcut.webp')] bg-cover bg-center transition-opacity duration-700 pointer-events-none ${isPageReady ? "opacity-0" : "opacity-100"}`}
      />

      <GameLayout
        title={campaignTitle || undefined}
        isSaved={!isLoading}
        leftTitle="Character"
        rightTitle="Tools"
        leftPanel={
          <div className={isGmCreateMode ? "select-none blur-sm pointer-events-none" : undefined}>
            <CharacterSheet character={character} onSpendWyrd={handleSpendWyrd} />
          </div>
        }
        centerPanel={
          <ChatWindow
            messages={messages}
            streamingContent={streamingContent}
            onSend={sendMessage}
            isLoading={isLoading}
            placeholder={isGmCreateMode ? "Tell the GM about your character..." : "What do you do?"}
            footerOverride={
              death.isDead ? (
                !death.deathAcknowledged && !isLoading ? (
                  <button
                    onClick={death.acknowledgesDeath}
                    className="w-full bg-stone-900 hover:bg-stone-800 border border-red-900/60 text-stone-300 text-sm px-4 py-3 rounded-lg transition-colors animate-content-in"
                  >
                    <span className="block text-red-400 font-medium italic">
                      {death.deathData?.causeOfDeath ?? `${character.name ?? "Your character"} has fallen`}
                    </span>
                    <span className="block text-xs text-stone-500 mt-1">
                      Continue →
                    </span>
                  </button>
                ) : (
                  // Soul transfer screen is open — keep chat fully blocked
                  <div className="w-full px-4 py-3 text-center text-xs text-stone-600 italic">
                    Awaiting soul transfer…
                  </div>
                )
              ) : undefined
            }
          />
        }
        rightPanel={
          <>
            {adventureModule.adventure && (
              <div role="tablist" aria-label="Right panel" className="flex gap-1 border-b border-stone-800 pb-2 -mt-1">
                <button
                  role="tab"
                  aria-selected={adventureModule.activeRightTab === "tools"}
                  onClick={() => adventureModule.setActiveRightTab("tools")}
                  className={`text-xs px-3 py-1 rounded transition-colors ${adventureModule.activeRightTab === "tools" ? "bg-stone-700 text-stone-100" : "text-stone-500 hover:text-stone-300"}`}
                >
                  Tools
                </button>
                <button
                  role="tab"
                  aria-selected={adventureModule.activeRightTab === "map"}
                  onClick={() => {
                    adventureModule.setActiveRightTab("map");
                    adventureModule.acknowledgeMapReveal();
                  }}
                  className={`relative text-xs px-3 py-1 rounded transition-colors ${adventureModule.activeRightTab === "map" ? "bg-stone-700 text-stone-100" : "text-stone-500 hover:text-stone-300"}`}
                >
                  Map
                  {adventureModule.mapHasNewReveal && adventureModule.activeRightTab !== "map" && (
                    <span
                      aria-label="New map reveal"
                      className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[var(--color-gold)]"
                    />
                  )}
                </button>
              </div>
            )}
            {adventureModule.adventure && adventureModule.activeRightTab === "map" ? (
              <div className="bg-stone-900 border border-stone-700 rounded-lg p-3">
                <h3 className="text-xs uppercase tracking-wider text-stone-500 mb-2">Area Map</h3>
                <MapViewer
                  mapSrc={adventureModule.currentMapFile}
                  locationName={adventureModule.currentMapLocationName}
                />
              </div>
            ) : (
              <>
                <WorldConditions worldState={campaign.worldState} />
                <TorchTimer
                  ref={torchTimerRef}
                  torchRemainingSeconds={campaign.worldState?.torchRemainingSeconds}
                  torchSavedSeconds={campaign.worldState?.torchSavedSeconds}
                  torchCount={torch.torchCount}
                  onTorchChange={torch.handleTorchStateChange}
                  onSavedSecondsChange={torch.handleTorchSavedSecondsChange}
                  onExpire={torch.handleTorchExpire}
                />
                <CombatTracker
                  combatants={combat.combatants}
                  round={combat.combatRound}
                  isInCombat={combat.isInCombat}
                />
                <DiceRoller onRoll={handleDiceRoll} />
                <CompanionPanel companions={companions} />
                <QuestLog quests={campaign.worldState?.quests ?? []} />
                <TravelersJournal
                  entries={journal.journalEntries}
                  onAddEntry={journal.handleAddJournalEntry}
                  onEditEntry={journal.handleEditJournalEntry}
                  onDeleteEntry={journal.handleDeleteJournalEntry}
                />
                <SessionControls
                  sessionNumber={sessionNumber}
                  onEndSession={handleEndSession}
                  onResumeSession={handleResumeSession}
                  onSaveSession={handleSaveSession}
                  isLoading={isLoading}
                  isPausing={isPausing}
                  saveStatus={saveStatus}
                  sessionInputTokens={tokens.sessionInputTokens}
                  sessionOutputTokens={tokens.sessionOutputTokens}
                  sessionCacheWriteTokens={tokens.sessionCacheWriteTokens}
                  sessionCacheReadTokens={tokens.sessionCacheReadTokens}
                  sessionHaikuInputTokens={tokens.sessionHaikuInputTokens}
                  sessionHaikuOutputTokens={tokens.sessionHaikuOutputTokens}
                  sessionHaikuCacheWriteTokens={tokens.sessionHaikuCacheWriteTokens}
                  sessionHaikuCacheReadTokens={tokens.sessionHaikuCacheReadTokens}
                  lifetimeInputTokens={tokens.lifetimeBaseInputTokens + tokens.sessionInputTokens}
                  lifetimeOutputTokens={tokens.lifetimeBaseOutputTokens + tokens.sessionOutputTokens}
                  lifetimeCacheWriteTokens={tokens.lifetimeBaseCacheWriteTokens + tokens.sessionCacheWriteTokens}
                  lifetimeCacheReadTokens={tokens.lifetimeBaseCacheReadTokens + tokens.sessionCacheReadTokens}
                  lifetimeHaikuInputTokens={tokens.lifetimeBaseHaikuInputTokens + tokens.sessionHaikuInputTokens}
                  lifetimeHaikuOutputTokens={tokens.lifetimeBaseHaikuOutputTokens + tokens.sessionHaikuOutputTokens}
                  lifetimeHaikuCacheWriteTokens={tokens.lifetimeBaseHaikuCacheWriteTokens + tokens.sessionHaikuCacheWriteTokens}
                  lifetimeHaikuCacheReadTokens={tokens.lifetimeBaseHaikuCacheReadTokens + tokens.sessionHaikuCacheReadTokens}
                  trialTurnsUsed={tokens.isOnTrial ? (tokens.trialTurnsUsed ?? 0) : null}
                  turnsLimit={tokens.turnsLimit ?? undefined}
                  economyMode={tokens.economyMode}
                  onToggleEconomyMode={() => tokens.setEconomyMode((prev) => !prev)}
                />
              </>
            )}
          </>
        }
      />

      {death.isDead && death.deathData && death.deathAcknowledged && (
        <DeathScreen
          deadCharacter={character}
          companions={companions}
          deathData={death.deathData}
          onInherit={death.handleCompanionInherit}
          onCampaignEnd={() => router.push("/")}
        />
      )}

      {adventureCompleteData && (
        <AdventureCompleteScreen
          summary={adventureCompleteData.summary}
          rewardDescription={adventureCompleteData.rewardDescription}
          characterName={character.name ?? "Your character"}
          character={character}
          companions={companions}
          currentLocation={campaign.worldState?.currentLocation}
          campaignType={campaign.campaignType}
          campaignId={campaignId}
          onCarouseComplete={handleCarouseComplete}
        />
      )}

      {showHowToPlay && <HowToPlayModal onClose={() => setShowHowToPlay(false)} showDismiss />}
      </>
    </GameErrorBoundary>
  );
}
