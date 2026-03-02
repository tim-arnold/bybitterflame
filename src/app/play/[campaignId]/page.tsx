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
import { CompanionPanel } from "@/components/game/CompanionPanel";
import { DeathScreen } from "@/components/game/DeathScreen";
import { AdventureCompleteScreen } from "@/components/game/AdventureCompleteScreen";
import { WorldConditions } from "@/components/game/WorldConditions";
import { MapViewer } from "@/components/game/MapViewer";
import { GameLayout } from "@/components/layout/GameLayout";
import { HowToPlayModal, shouldShowHowToPlay } from "@/components/HowToPlayModal";
import { parseGameState } from "@/lib/game/state-parser";
import { trackEvent } from "@/lib/analytics";
import { getAdventure } from "@/lib/adventures/index";
import { assetUrl } from "@/lib/config";
import type { Adventure } from "@/lib/adventures/types";
import type { Character, Campaign, JournalEntry, Companion, LegacyCharacter } from "@/lib/game/types";

/** Keep only the first companion with each name (guards against GM re-emitting companionJoined) */
function deduplicateCompanions(companions: Companion[]): Companion[] {
  const seen = new Set<string>();
  return companions.filter((c) => {
    const key = c.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

interface DeathData {
  causeOfDeath: string;
  legacyTalent?: string;
  killedByCompanionId?: string | null;
  deathNarrative?: string;
  companionsAtDeath?: Companion[];
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
  const [sessionSummaries, setSessionSummaries] = useState<string[]>([]);
  const [isInCombat, setIsInCombat] = useState(false);
  const [combatants, setCombatants] = useState<
    { name: string; initiative: number; isPlayer: boolean; isActive: boolean }[]
  >([]);
  const [combatRound, setCombatRound] = useState(1);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [isDead, setIsDead] = useState(false);
  const [deathData, setDeathData] = useState<DeathData | null>(null);
  const [adventureCompleteData, setAdventureCompleteData] = useState<{ summary: string } | null>(null);
  const torchTimerRef = useRef<TorchTimerHandle>(null);

  // Session token usage (accumulated from \x00TOKENS: sentinels in the stream)
  const [sessionInputTokens, setSessionInputTokens] = useState(0);
  const [sessionOutputTokens, setSessionOutputTokens] = useState(0);
  const [sessionCacheWriteTokens, setSessionCacheWriteTokens] = useState(0);
  const [sessionCacheReadTokens, setSessionCacheReadTokens] = useState(0);
  // Lifetime baseline loaded from DB on mount; session tokens are added on top
  const [lifetimeBaseInputTokens, setLifetimeBaseInputTokens] = useState(0);
  const [lifetimeBaseOutputTokens, setLifetimeBaseOutputTokens] = useState(0);
  const [lifetimeBaseCacheWriteTokens, setLifetimeBaseCacheWriteTokens] = useState(0);
  const [lifetimeBaseCacheReadTokens, setLifetimeBaseCacheReadTokens] = useState(0);

  // Trial turn tracking
  const [trialTurnsUsed, setTrialTurnsUsed] = useState<number | null>(null);
  const [isOnTrial, setIsOnTrial] = useState(false);

  // Adventure module state
  const [adventure, setAdventure] = useState<Adventure | null>(null);
  const [currentMapFile, setCurrentMapFile] = useState<string | null>(null);
  const [currentMapLocationName, setCurrentMapLocationName] = useState<string | undefined>(undefined);
  const [mapHasNewReveal, setMapHasNewReveal] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState<"tools" | "map">("tools");
  const [isGmCreateMode, setIsGmCreateMode] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [isPausing, setIsPausing] = useState(false);

  const campaignTitle = adventure?.title ?? campaign.name ?? "";

  /** Strip the \x00TOKENS sentinel from a stream response and accumulate session token counts. */
  function extractTokens(response: string): string {
    const match = response.match(/\x00TOKENS:(\{[^}]+\})/);
    if (match) {
      try {
        const usage = JSON.parse(match[1]) as { in: number; out: number; cacheWrite?: number; cacheRead?: number };
        setSessionInputTokens((prev) => prev + usage.in);
        setSessionOutputTokens((prev) => prev + usage.out);
        if (usage.cacheWrite) setSessionCacheWriteTokens((prev) => prev + usage.cacheWrite!);
        if (usage.cacheRead) setSessionCacheReadTokens((prev) => prev + usage.cacheRead!);
      } catch { /* ignore parse errors */ }
    }
    return response.replace(/\x00TOKENS:\{[^}]+\}/g, "");
  }

  useEffect(() => {
    const parts = ["Shadowdark"];
    if (campaignTitle) parts.push(campaignTitle);
    if (character.name) parts.push(character.name);
    document.title = parts.join(" · ");
  }, [campaignTitle, character.name]);

  useEffect(() => {
    fetch("/api/user/api-key")
      .then((r) => r.json())
      .then((data: { isOnTrial?: boolean; turnsUsed?: number; totalInputTokens?: number; totalOutputTokens?: number; totalCacheWriteTokens?: number; totalCacheReadTokens?: number }) => {
        if (data.isOnTrial) {
          setIsOnTrial(true);
          setTrialTurnsUsed(data.turnsUsed ?? 0);
        }
        setLifetimeBaseInputTokens(data.totalInputTokens ?? 0);
        setLifetimeBaseOutputTokens(data.totalOutputTokens ?? 0);
        setLifetimeBaseCacheWriteTokens(data.totalCacheWriteTokens ?? 0);
        setLifetimeBaseCacheReadTokens(data.totalCacheReadTokens ?? 0);
      })
      .catch(() => {});
  }, []);

  // Load character and campaign data. For new campaigns (no messages), auto-trigger
  // the GM's opening scene using the freshly loaded data before state is set.
  useEffect(() => {
    const controller = new AbortController();
    async function loadData() {
      try {
        const res = await fetch(`/api/campaign/${campaignId}`, {
          signal: controller.signal,
        });
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
        setJournalEntries(loadedCampaign.worldState?.journalEntries ?? []);
        // Deduplicate companions by name on load; also exclude current character
        // (guards against stale DB state after soul transfer)
        const rawCompanions = loadedCampaign.worldState?.companions ?? [];
        const dedupedCompanions = deduplicateCompanions(
          rawCompanions.filter(
            (c: Companion) => c.name.toLowerCase() !== (loadedCharacter.name ?? "").toLowerCase()
          )
        );
        setCompanions(dedupedCompanions);

        // Load adventure data if campaign has a module
        const moduleId = loadedCampaign.moduleId;
        const adventureId = loadedCampaign.adventureId;
        let loadedAdventure: Adventure | undefined;
        if (moduleId && adventureId) {
          loadedAdventure = getAdventure(moduleId, adventureId);
          if (loadedAdventure) setAdventure(loadedAdventure);
        }

        // Check if this is a GM-create campaign (no character name yet, any campaign type)
        const needsGmCreate = !loadedCharacter.name;
        if (needsGmCreate) {
          setIsGmCreateMode(true);
        }

        if (loadedMessages.length > 0) {
          setMessages(loadedMessages);
          return;
        }

        // New campaign — show how-to-play modal if not dismissed
        if (shouldShowHowToPlay()) setShowHowToPlay(true);

        // New campaign — generate the opening scene immediately
        // Pick the right GM-create mode: adventure-specific or generic
        const chatMode = needsGmCreate
          ? (loadedCampaign.moduleId && loadedCampaign.adventureId ? "adventure-create" : "gm-create")
          : "play";

        // For GM-create mode, read canned answers stored by the adventure detail page
        let gmCreateContent = "[BEGIN CHARACTER CREATION]";
        if (needsGmCreate) {
          const storedAnswers = sessionStorage.getItem(`gm-create-answers-${campaignId}`);
          if (storedAnswers) {
            const parsed = JSON.parse(storedAnswers) as Record<string, string>;
            const parts = Object.values(parsed).filter(Boolean);
            if (parts.length > 0) {
              gmCreateContent = parts.join(" | ");
            }
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
          }),
          signal: controller.signal,
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
          setStreamingContent(fullResponse.replace(/\x00TOKENS:\{[^}]+\}/g, ""));
        }
        fullResponse = extractTokens(fullResponse);

        const { updates } = parseGameState(fullResponse);
        let updatedCharacter = { ...loadedCharacter };
        let updatedCampaign = { ...loadedCampaign };
        const newEntries: JournalEntry[] = [];
        let updatedCompanions: Companion[] = dedupedCompanions;

        for (const update of updates) {
          if (update.type === "characterUpdate") updatedCharacter = { ...updatedCharacter, ...update.data };
          if (update.type === "campaignUpdate") {
            updatedCampaign = {
              ...updatedCampaign,
              worldState: { ...updatedCampaign.worldState, ...resolveTorchUpdate(update.data as Record<string, unknown>) } as typeof updatedCampaign.worldState,
            };
          }
          if (update.type === "journalUpdate") {
            const entry: JournalEntry = {
              ...(update.data as Omit<JournalEntry, "id" | "createdAt">),
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
            };
            newEntries.push(entry);
          }
          if (update.type === "companionJoined") {
            const data = update.data as Omit<Companion, "id" | "joinedAt">;
            const alreadyExists = updatedCompanions.some(
              (c) => c.name.toLowerCase() === (data.name ?? "").toLowerCase()
            );
            if (!alreadyExists) {
              updatedCompanions = [...updatedCompanions, {
                ...data,
                status: data.status ?? "active",
                id: crypto.randomUUID(),
                joinedAt: new Date().toISOString(),
              }];
            }
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
          if (update.type === "mapReveal" && loadedAdventure && loadedCampaign.moduleId) {
            const locationName = update.data.locationName as string;
            const mapFile = assetUrl(`adventures/${loadedCampaign.moduleId}/${loadedAdventure.pcMapFile}`);
            setCurrentMapFile(mapFile);
            setCurrentMapLocationName(locationName);
            setMapHasNewReveal(true);
          }
          // Handle character complete in gm-create mode — transition to play mode
          if (update.type === "notification" && update.data.type === "characterComplete" && needsGmCreate) {
            trackEvent({ name: "character_created" });
            setIsGmCreateMode(false);
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
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }
    loadData();
    return () => controller.abort();
  }, [campaignId]);

  /**
   * Given an adventure, collection id, and a location name from a mapReveal event,
   * return the URL path to the PC map image, or null if none.
   */
  function resolveMapFile(adv: Adventure, locationName: string): string | null {
    if (!adv.pcMapFile) return null;
    const collectionId = campaign.moduleId;
    if (!collectionId) return null;
    // Ensure the revealed location actually has a PC map marker
    const hasMapLocation = adv.locations.some((l) => l.hasPcMap);
    if (!hasMapLocation) return null;
    return assetUrl(`adventures/${collectionId}/${adv.pcMapFile}`);
  }

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
            messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
            character: activeCharacter,
            campaign: activeCampaign,
            sessionSummaries,
            mode: isGmCreateMode ? "adventure-create" : "play",
          }),
        });

        if (response.status === 402) {
          const errData = await response.json() as { error: string; turnsUsed: number; limit: number };
          if (errData.error === "api_key_required") {
            trackEvent({ name: "free_turns_exhausted" });
            setMessages([
              ...newMessages,
              {
                role: "assistant",
                content: `*The arcane channel falls silent...*\n\nYou've used all ${errData.limit} free turns. Add your Anthropic API key in [Settings](/account) to continue playing.`,
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
        fullResponse = extractTokens(fullResponse);

        // Parse gamestate updates
        const { narrative, updates } = parseGameState(fullResponse);

        let updatedCharacter = { ...activeCharacter };
        let updatedCampaign = { ...activeCampaign };
        let updatedCompanions = [...activeCompanions];
        let companionsChanged = false;

        for (const update of updates) {
          if (update.type === "characterUpdate") {
            updatedCharacter = { ...updatedCharacter, ...update.data };
          }
          if (update.type === "campaignUpdate") {
            updatedCampaign = {
              ...updatedCampaign,
              worldState: { ...updatedCampaign.worldState, ...resolveTorchUpdate(update.data as Record<string, unknown>) } as typeof updatedCampaign.worldState,
            };
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
            const data = update.data as Omit<Companion, "id" | "joinedAt">;
            const alreadyExists = updatedCompanions.some(
              (c) => c.name.toLowerCase() === (data.name ?? "").toLowerCase()
            );
            if (!alreadyExists) {
              trackEvent({ name: "companion_joined" });
              updatedCompanions = [...updatedCompanions, {
                ...data,
                status: data.status ?? "active",
                id: crypto.randomUUID(),
                joinedAt: new Date().toISOString(),
              }];
              companionsChanged = true;
            }
          }
          if (update.type === "companionUpdate") {
            const patch = update.data as Partial<Companion> & { id: string };
            updatedCompanions = updatedCompanions.map((c) =>
              c.id === patch.id ? { ...c, ...patch } : c
            );
            companionsChanged = true;
          }
          if (update.type === "playerDied") {
            trackEvent({ name: "character_died" });
            setIsDead(true);
            setDeathData({
              ...(update.data as unknown as DeathData),
              deathNarrative: narrative,
              companionsAtDeath: updatedCompanions,
            });
          }
          if (update.type === "mapReveal" && adventure) {
            const locationName = update.data.locationName as string;
            const mapFile = resolveMapFile(adventure, locationName);
            if (mapFile) {
              setCurrentMapFile(mapFile);
              setCurrentMapLocationName(locationName);
              setMapHasNewReveal(true);
            }
          }
          // Handle character complete in gm-create mode
          if (update.type === "notification" && update.data.type === "characterComplete" && isGmCreateMode) {
            trackEvent({ name: "character_created" });
            setIsGmCreateMode(false);
          }
          if (update.type === "adventureComplete") {
            trackEvent({ name: "adventure_completed" });
            const summary = update.data.summary as string;
            setAdventureCompleteData({ summary });
            fetch(`/api/campaign/${campaignId}/complete`, { method: "POST" }).catch(
              (err) => console.error("Complete failed:", err)
            );
          }
          if (update.type === "gmNotesUpdate") {
            const notes = update.data.notes as string;
            if (notes) updatedCampaign = { ...updatedCampaign, gmNotes: notes };
          }
        }

        // Only sync companions if they actually changed this turn — avoids
        // overwriting state set by handleCompanionInherit with a stale closure.
        if (companionsChanged) {
          updatedCampaign = {
            ...updatedCampaign,
            worldState: {
              ...updatedCampaign.worldState,
              companions: updatedCompanions,
            } as typeof updatedCampaign.worldState,
          };
        }

        const finalMessages = [...newMessages, { role: "assistant" as const, content: fullResponse }];

        // Capture current torch countdown before committing state — prevents stale
        // closure from overwriting a torch change that happened mid-sendMessage
        // (e.g. user extinguished while waiting for GM response).
        const torchSecsNow = torchTimerRef.current?.getSecondsLeft();
        const finalCampaign = torchSecsNow !== undefined
          ? { ...updatedCampaign, worldState: { ...updatedCampaign.worldState, torchRemainingSeconds: torchSecsNow ?? undefined } as typeof updatedCampaign.worldState }
          : updatedCampaign;

        setCharacter(updatedCharacter);
        setCampaign(finalCampaign);
        if (companionsChanged) setCompanions(updatedCompanions);
        setMessages(finalMessages);
        setStreamingContent("");
        if (isOnTrial) setTrialTurnsUsed((prev) => (prev !== null ? prev + 1 : null));

        // Auto-save after every AI response
        fetch(`/api/campaign/${campaignId}/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            character: updatedCharacter,
            campaign: finalCampaign,
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
    [messages, character, campaign, companions, campaignId, sessionNumber]
  );

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
        // Deity: keep Kesh's own faith — soul transfer doesn't change religious allegiance
        deity: companion.deity,
        // Languages: merge both — the soul carries its memories into the new body
        languages: [
          ...new Set([
            ...(companion.languages ?? []),
            ...(character.languages ?? []),
          ]),
        ],
        str: companion.str,
        dex: companion.dex,
        con: companion.con,
        int: companion.int,
        wis: companion.wis,
        cha: companion.cha,
        // Use companion's current HP; fall back to maxHp if HP was never tracked (0)
        hp: companion.hp > 0 ? companion.hp : (companion.maxHp || 1),
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

      setCharacter(newCharacter);
      setCampaign(updatedCampaign);
      setCompanions(remainingCompanions);
      setIsDead(false);
      setDeathData(null);

      // Immediately persist the correct new character to DB — this races ahead of
      // sendMessage's auto-save, which runs after the GM responds (~5-10s later).
      // Belt-and-suspenders alongside the initialCharacter override in sendMessage.
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
      const sysMsg = `[SYSTEM: CHARACTER_TRANSFER: ${character.name ?? "The fallen hero"}'s soul has passed into ${companion.name}. ${deathData?.legacyTalent ? `They carry the legacy talent: ${deathData.legacyTalent}.` : ""} Narrate this dramatic moment. The remaining companions react per their personalities.]`;
      sendMessage(sysMsg, {
        hidden: true,
        initialCharacter: newCharacter,
        initialCampaign: updatedCampaign,
        initialCompanions: remainingCompanions,
      });
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
    trackEvent({ name: "session_paused" });
    setIsPausing(true);
    sendMessage("[SYSTEM: The player wants to end this session. Please provide a summary of what happened.]", { hidden: true });
    // Fire-and-forget: generate compact Haiku summary and persist it
    fetch(`/api/campaign/${campaignId}/summarize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionNumber }),
    }).catch((err) => console.error("Summarize failed:", err));
  }

  function handleSaveSession() {
    const torchSecsNow = torchTimerRef.current?.getSecondsLeft();
    const campaignToSave = torchSecsNow !== undefined
      ? { ...campaign, worldState: { ...campaign.worldState, torchRemainingSeconds: torchSecsNow ?? undefined } as typeof campaign.worldState }
      : campaign;
    fetch(`/api/campaign/${campaignId}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ character, campaign: campaignToSave, messages, sessionNumber }),
    });
  }

  /**
   * Translate a GM-emitted torchLit signal into a torchRemainingSeconds value.
   * The GM emits { torchLit: true/false } — the UI owns the actual clock.
   * Returns cleaned campaignUpdate data with torchLit replaced by torchRemainingSeconds.
   */
  function resolveTorchUpdate(data: Record<string, unknown>): Record<string, unknown> {
    if (!("torchLit" in data)) return data;
    const { torchLit, ...rest } = data;
    if (torchLit === true) return { ...rest, torchRemainingSeconds: 60 * 60 };
    // torchLit: false — explicitly clear the countdown so worldState reflects extinguishment
    return { ...rest, torchRemainingSeconds: undefined };
  }

  function handleTorchStateChange(remainingSeconds: number | null) {
    const isLighting = remainingSeconds !== null;
    setCampaign((prev) => {
      const updated = {
        ...prev,
        worldState: { ...prev.worldState, torchRemainingSeconds: remainingSeconds ?? undefined } as typeof prev.worldState,
      };
      // Persist to DB
      fetch(`/api/campaign/${campaignId}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaign: updated, sessionNumber }),
      }).catch((err) => console.error("Torch save failed:", err));
      return updated;
    });
    if (isLighting) {
      sendMessage("[SYSTEM: The player has just lit a torch. 60 minutes of real-world light begins now. Acknowledge this briefly in your narration.]", { hidden: true });
    } else {
      sendMessage("[SYSTEM: The player has extinguished their torch. Acknowledge this briefly — darkness closes in or they have another light source.]", { hidden: true });
    }
  }

  function handleTorchExpire() {
    setCampaign((prev) => {
      const updated = {
        ...prev,
        worldState: { ...prev.worldState, torchRemainingSeconds: undefined } as typeof prev.worldState,
      };
      fetch(`/api/campaign/${campaignId}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaign: updated, sessionNumber }),
      }).catch((err) => console.error("Torch expire save failed:", err));
      return updated;
    });
    sendMessage("[SYSTEM: The torch has burned out. The party is now in total darkness. Describe the darkness closing in and apply the Blind condition.]", { hidden: true });
  }

  return (
    <>
      <GameLayout
        title={campaignTitle || undefined}
        isSaved={!isLoading}
        leftTitle="Character"
        rightTitle="Tools"
        leftPanel={<CharacterSheet character={character} />}
        centerPanel={
          <ChatWindow
            messages={messages}
            streamingContent={streamingContent}
            onSend={sendMessage}
            isLoading={isLoading}
            placeholder={isGmCreateMode ? "Tell the GM about your character..." : "What do you do?"}
          />
        }
        rightPanel={
          <>
            {adventure && (
              <div role="tablist" aria-label="Right panel" className="flex gap-1 border-b border-stone-800 pb-2 -mt-1">
                <button
                  role="tab"
                  aria-selected={activeRightTab === "tools"}
                  onClick={() => setActiveRightTab("tools")}
                  className={`text-xs px-3 py-1 rounded transition-colors ${activeRightTab === "tools" ? "bg-stone-700 text-stone-100" : "text-stone-500 hover:text-stone-300"}`}
                >
                  Tools
                </button>
                <button
                  role="tab"
                  aria-selected={activeRightTab === "map"}
                  onClick={() => {
                    setActiveRightTab("map");
                    setMapHasNewReveal(false);
                  }}
                  className={`relative text-xs px-3 py-1 rounded transition-colors ${activeRightTab === "map" ? "bg-stone-700 text-stone-100" : "text-stone-500 hover:text-stone-300"}`}
                >
                  Map
                  {mapHasNewReveal && activeRightTab !== "map" && (
                    <span aria-label="New map reveal" className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[var(--color-gold)]" />
                  )}
                </button>
              </div>
            )}
            {adventure && activeRightTab === "map" ? (
              <div className="bg-stone-900 border border-stone-700 rounded-lg p-3">
                <h3 className="text-xs uppercase tracking-wider text-stone-500 mb-2">Area Map</h3>
                <MapViewer mapSrc={currentMapFile} locationName={currentMapLocationName} />
              </div>
            ) : (
              <>
                <WorldConditions worldState={campaign.worldState} />
                <TorchTimer
                  ref={torchTimerRef}
                  torchRemainingSeconds={campaign.worldState?.torchRemainingSeconds}
                  onTorchChange={handleTorchStateChange}
                  onExpire={handleTorchExpire}
                />
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
                  isPausing={isPausing}
                  sessionInputTokens={sessionInputTokens}
                  sessionOutputTokens={sessionOutputTokens}
                  sessionCacheWriteTokens={sessionCacheWriteTokens}
                  sessionCacheReadTokens={sessionCacheReadTokens}
                  lifetimeInputTokens={lifetimeBaseInputTokens + sessionInputTokens}
                  lifetimeOutputTokens={lifetimeBaseOutputTokens + sessionOutputTokens}
                  lifetimeCacheWriteTokens={lifetimeBaseCacheWriteTokens + sessionCacheWriteTokens}
                  lifetimeCacheReadTokens={lifetimeBaseCacheReadTokens + sessionCacheReadTokens}
                  trialTurnsUsed={isOnTrial ? (trialTurnsUsed ?? 0) : null}
                />
              </>
            )}
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

      {adventureCompleteData && (
        <AdventureCompleteScreen
          summary={adventureCompleteData.summary}
          characterName={character.name ?? "Your character"}
        />
      )}

      {showHowToPlay && (
        <HowToPlayModal onClose={() => setShowHowToPlay(false)} showDismiss />
      )}
    </>
  );
}
