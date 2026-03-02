"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getAdventure, getCollection } from "@/lib/adventures/index";
import { trackEvent } from "@/lib/analytics";
import type { Companion, EquipmentItem, Spell } from "@/lib/game/types";

interface RosterCharacter {
  id: string;
  name: string;
  class: string;
  ancestry: string;
  level: number;
  lastCampaignState: string;
  lastAdventureTitle: string | null;
  lastPlayedAt: string;
}

interface FormerCompanionEntry {
  companion: Companion;
  lastSeenIn: string | null;
}

interface AvailableCharacter {
  id: string;
  name: string;
  class: string;
  ancestry: string;
  level: number;
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
  hp: number;
  maxHp: number;
  ac: number;
  equipment: EquipmentItem[];
  spells: Spell[];
  talents: string[];
  lastAdventureTitle: string | null;
}

interface AvailableResponse {
  formerCompanions: FormerCompanionEntry[];
  availableCharacters: AvailableCharacter[];
}

const GM_QUESTIONS = [
  {
    id: "style",
    question: "When trouble finds you, what's your first instinct?",
    options: [
      "Steel and muscle — I hit first",
      "Shadows and patience — I wait for my moment",
      "Words and wit — I talk my way through",
      "Power — magic or faith sees me through",
    ],
  },
  {
    id: "motivation",
    question: "What brought you to this line of work?",
    options: [
      "The coin",
      "The thrill",
      "A debt to repay",
      "Someone I'm searching for",
    ],
  },
] as const;

export default function AdventureDetailPage() {
  const params = useParams();
  const router = useRouter();
  const collectionId = params.collectionId as string;
  const adventureId = params.adventureId as string;

  const [isCreating, setIsCreating] = useState(false);

  // GM create interview state
  const [showInterview, setShowInterview] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Existing character roster
  const [roster, setRoster] = useState<RosterCharacter[]>([]);
  const [rosterLoaded, setRosterLoaded] = useState(false);

  // Step 2: companion selection
  const [selectedCharacter, setSelectedCharacter] = useState<RosterCharacter | null>(null);
  const [availableData, setAvailableData] = useState<AvailableResponse | null>(null);
  const [availableLoading, setAvailableLoading] = useState(false);
  const [selectedCompanions, setSelectedCompanions] = useState<Companion[]>([]);

  useEffect(() => {
    fetch("/api/characters")
      .then((r) => r.json())
      .then((data: { characters?: RosterCharacter[] }) => {
        setRoster(data.characters ?? []);
      })
      .catch(() => {})
      .finally(() => setRosterLoaded(true));
  }, []);

  const collection = getCollection(collectionId);
  const adventure = getAdventure(collectionId, adventureId);

  if (!collection || !adventure) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center text-stone-400">
        Adventure not found.{" "}
        <Link href="/adventures" className="ml-2 text-[var(--color-gold)] hover:underline">
          Back to adventures
        </Link>
      </div>
    );
  }

  async function handleBeginWithAnswers() {
    if (!adventure) return;
    setIsCreating(true);
    try {
      const res = await fetch("/api/character", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          character: {},
          gmPersona: "",
          campaignType: "oneshot",
          moduleId: collectionId,
          adventureId,
        }),
      });
      if (!res.ok) throw new Error("Failed to create campaign");
      const { campaignId } = await res.json() as { campaignId: string };

      sessionStorage.setItem(
        `gm-create-answers-${campaignId}`,
        JSON.stringify(answers),
      );

      trackEvent({ name: "adventure_started", type: "module" });
      router.push(`/play/${campaignId}`);
    } catch {
      setIsCreating(false);
    }
  }

  async function handleSelectCharacter(char: RosterCharacter) {
    setSelectedCharacter(char);
    setSelectedCompanions([]);
    setAvailableData(null);
    setAvailableLoading(true);
    try {
      const res = await fetch(`/api/companions/available?characterId=${char.id}`);
      if (res.ok) {
        const data = await res.json() as AvailableResponse;
        setAvailableData(data);
      }
    } catch {
      // swallow — step 2 still renders, just with empty sections
    } finally {
      setAvailableLoading(false);
    }
  }

  async function handleBeginAdventure() {
    if (!selectedCharacter) return;
    setIsCreating(true);
    try {
      const body: Record<string, unknown> = {
        characterId: selectedCharacter.id,
        moduleId: collectionId,
        adventureId,
      };
      if (selectedCompanions.length > 0) {
        body.companions = selectedCompanions;
      }
      const res = await fetch("/api/character/start-adventure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to start adventure");
      const { campaignId } = await res.json() as { campaignId: string };
      trackEvent({ name: "adventure_started", type: "module" });
      router.push(`/play/${campaignId}`);
    } catch {
      setIsCreating(false);
    }
  }

  async function handlePlayAsCompanion(companion: Companion) {
    setIsCreating(true);
    try {
      const res = await fetch("/api/companion/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companion, moduleId: collectionId, adventureId }),
      });
      if (!res.ok) throw new Error("Failed to promote companion");
      const { campaignId } = await res.json() as { campaignId: string };
      trackEvent({ name: "adventure_started", type: "module" });
      router.push(`/play/${campaignId}`);
    } catch {
      setIsCreating(false);
    }
  }

  function companionFromRosterChar(char: AvailableCharacter): Companion {
    return {
      id: crypto.randomUUID(),
      name: char.name,
      pronouns: "they/them",
      ancestry: char.ancestry,
      class: char.class,
      level: char.level,
      alignment: "Neutral",
      background: "",
      str: char.str,
      dex: char.dex,
      con: char.con,
      int: char.int,
      wis: char.wis,
      cha: char.cha,
      hp: char.maxHp,
      maxHp: char.maxHp,
      ac: char.ac,
      equipment: char.equipment,
      spells: char.spells,
      talents: char.talents,
      status: "active",
      joinedAt: new Date().toISOString(),
      personality: {
        voice: `A seasoned ${char.class}`,
        dispositionTowardPlayer: "friendly",
        riskTolerance: "bold",
        followership: "collaborates",
        loyalty: 7,
        motivation: "Adventuring alongside an old ally",
        redLines: "Will not betray the party",
      },
    };
  }

  const allAnswered = GM_QUESTIONS.every((q) => answers[q.id]);

  const levelLabel =
    adventure.levelMin === adventure.levelMax
      ? `Level ${adventure.levelMin}`
      : `Levels ${adventure.levelMin}–${adventure.levelMax}`;

  // How many companions the player may bring:
  // +1 for each level the adventure's minimum is above the character's level, capped at 3.
  const maxCompanions = selectedCharacter
    ? Math.min(3, Math.max(1, 1 + Math.max(0, adventure.levelMin - selectedCharacter.level)))
    : 1;

  const hasCompanionOptions =
    availableData &&
    (availableData.formerCompanions.length > 0 || availableData.availableCharacters.length > 0);

  function toggleCompanion(companion: Companion) {
    setSelectedCompanions((prev) => {
      const already = prev.some((c) => c.name === companion.name);
      if (already) return prev.filter((c) => c.name !== companion.name);
      if (prev.length >= maxCompanions) return prev; // slot limit reached
      return [...prev, companion];
    });
  }

  function isCompanionSelected(name: string) {
    return selectedCompanions.some((c) => c.name === name);
  }

  return (
    <main className="relative min-h-screen">
      <div className="fixed inset-0 bg-[url('/dungeon-background-rattail.webp')] bg-cover bg-center" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-3xl font-bold text-[var(--color-gold)] mb-1">Choose an Adventure</h1>
        <Link href="/adventures" className="text-sm text-stone-400 hover:text-stone-300 transition-colors">
          ← Back to all Adventures
        </Link>

        {/* Adventure header */}
        <div className="mt-8 mb-6 rounded-lg border border-stone-800 bg-stone-950/90 p-6">
          <div className="flex items-start gap-3 mb-3">
            <h2 className="text-2xl font-bold text-stone-100 leading-tight">
              {adventure.title}
            </h2>
            <span className="shrink-0 text-xs mt-1 px-2 py-0.5 rounded border border-stone-600 bg-stone-800 text-stone-300 font-mono">
              {levelLabel}
            </span>
          </div>
          <p className="text-stone-300 leading-relaxed mb-4">{adventure.synopsis}</p>
          <blockquote className="border-l-2 border-[var(--color-gold-dim)] pl-4 text-stone-400 italic text-sm">
            {adventure.hook}
          </blockquote>
        </div>

        {/* Step 2: Companion selection (shown after character chosen) */}
        {selectedCharacter ? (
          <div className="rounded-lg border border-stone-800 bg-stone-950/90 p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-stone-100">
                  Who travels with {selectedCharacter.name}?
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  {maxCompanions === 1
                    ? "Bring up to 1 companion"
                    : `Bring up to ${maxCompanions} companions`}
                  {maxCompanions > 1 && adventure.levelMin > selectedCharacter.level && (
                    <span className="ml-1 text-[var(--color-gold-dim)]">
                      — this adventure is above your level
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={() => { setSelectedCharacter(null); setSelectedCompanions([]); setAvailableData(null); }}
                className="shrink-0 text-sm text-stone-400 hover:text-stone-200 transition-colors"
              >
                ← Back
              </button>
            </div>

            {availableLoading && (
              <p className="text-sm text-stone-500">Loading companions…</p>
            )}

            {!availableLoading && (
              <>
                {/* Companion slots indicator */}
                {selectedCompanions.length > 0 && (
                  <p className="text-xs text-stone-400">
                    {selectedCompanions.length} / {maxCompanions} companion{maxCompanions > 1 ? "s" : ""} selected
                    {selectedCompanions.length >= maxCompanions && (
                      <span className="ml-1 text-stone-500">(slots full)</span>
                    )}
                  </p>
                )}

                {/* Former companions */}
                {availableData && availableData.formerCompanions.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
                      Former Companions
                    </h3>
                    <div className="space-y-2">
                      {availableData.formerCompanions.map(({ companion, lastSeenIn }) => {
                        const selected = isCompanionSelected(companion.name);
                        const slotsFull = !selected && selectedCompanions.length >= maxCompanions;
                        return (
                          <div
                            key={companion.name}
                            className={`rounded-lg border px-4 py-3 transition-colors ${
                              selected
                                ? "border-[var(--color-gold-dim)] bg-stone-800"
                                : "border-stone-700 bg-stone-900"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="font-semibold text-stone-100">{companion.name}</p>
                                <p className="text-xs text-stone-400 mt-0.5">
                                  Lvl {companion.level} {companion.ancestry} {companion.class}
                                  {lastSeenIn ? ` · Last seen in ${lastSeenIn}` : ""}
                                </p>
                              </div>
                              <div className="flex gap-2 shrink-0">
                                <button
                                  onClick={() => toggleCompanion({ ...companion, hp: companion.maxHp })}
                                  disabled={isCreating || slotsFull}
                                  className={`rounded border px-3 py-1 text-xs font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                                    selected
                                      ? "border-[var(--color-gold-dim)] text-[var(--color-gold)] bg-stone-700"
                                      : "border-stone-600 text-stone-300 hover:border-stone-400 hover:text-stone-100"
                                  }`}
                                >
                                  {selected ? "✓ Selected" : "Bring along"}
                                </button>
                                <button
                                  onClick={() => handlePlayAsCompanion(companion)}
                                  disabled={isCreating}
                                  className="rounded border border-stone-600 px-3 py-1 text-xs font-medium text-stone-300 transition-colors hover:border-stone-400 hover:text-stone-100 cursor-pointer disabled:opacity-50"
                                >
                                  Play as {companion.name.split(" ")[0]}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Available roster characters */}
                {availableData && availableData.availableCharacters.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
                      Available Adventurers
                    </h3>
                    <div className="space-y-2">
                      {availableData.availableCharacters.map((char) => {
                        const companion = companionFromRosterChar(char);
                        const selected = isCompanionSelected(char.name);
                        const slotsFull = !selected && selectedCompanions.length >= maxCompanions;
                        return (
                          <div
                            key={char.id}
                            className={`rounded-lg border px-4 py-3 transition-colors ${
                              selected
                                ? "border-[var(--color-gold-dim)] bg-stone-800"
                                : "border-stone-700 bg-stone-900"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="font-semibold text-stone-100">{char.name}</p>
                                <p className="text-xs text-stone-400 mt-0.5">
                                  Lvl {char.level} {char.ancestry} {char.class}
                                  {char.lastAdventureTitle ? ` · Last played: ${char.lastAdventureTitle}` : ""}
                                </p>
                              </div>
                              <button
                                onClick={() => toggleCompanion(companion)}
                                disabled={isCreating || slotsFull}
                                className={`shrink-0 rounded border px-3 py-1 text-xs font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                                  selected
                                    ? "border-[var(--color-gold-dim)] text-[var(--color-gold)] bg-stone-700"
                                    : "border-stone-600 text-stone-300 hover:border-stone-400 hover:text-stone-100"
                                }`}
                              >
                                {selected ? "✓ Selected" : "Bring along"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {!hasCompanionOptions && !availableLoading && (
                  <p className="text-sm text-stone-500">No companions or available adventurers found — you&apos;ll adventure solo.</p>
                )}

                <button
                  onClick={handleBeginAdventure}
                  disabled={isCreating}
                  className="w-full rounded-lg border border-[var(--color-gold-dim)] bg-stone-800 px-4 py-2.5 text-sm font-semibold text-[var(--color-gold)] transition-colors hover:border-[var(--color-gold)] hover:bg-stone-700 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isCreating
                    ? "Preparing…"
                    : selectedCompanions.length === 0
                    ? "Begin Adventure Solo →"
                    : `Begin Adventure with ${selectedCompanions.length === 1 ? selectedCompanions[0].name.split(" ")[0] : `${selectedCompanions.length} companions`} →`}
                </button>
              </>
            )}
          </div>
        ) : (
          /* Step 1: Character options */
          <div className="rounded-lg border border-stone-800 bg-stone-950/90 p-6 space-y-6">

            {/* Option A: create new character */}
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-400 mb-3">
                Roll Your Own Character
              </h2>
              <Link
                href={`/create?adventureId=${adventureId}&collectionId=${collectionId}`}
                className="block rounded-lg border border-stone-700 bg-stone-900 px-4 py-3 text-center transition-colors hover:border-stone-500 hover:bg-stone-800"
              >
                <p className="font-semibold text-stone-100">Create a New Character</p>
                <p className="text-sm text-stone-400 mt-0.5">
                  Go through character creation, then begin the adventure
                </p>
              </Link>
            </div>

            {/* Option B: play as existing character */}
            {rosterLoaded && roster.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-400 mb-3">
                  Play as an Existing Character
                </h2>
                <div className="space-y-2">
                  {roster.map((char) => {
                      const isBusy = char.lastCampaignState === "active";
                      return (
                        <button
                          key={char.id}
                          onClick={() => !isBusy && handleSelectCharacter(char)}
                          disabled={isCreating || isBusy}
                          className={`w-full rounded-lg border bg-stone-900 px-4 py-3 text-left transition-colors disabled:cursor-not-allowed ${
                            isBusy
                              ? "border-stone-800"
                              : "border-stone-700 hover:border-stone-500 hover:bg-stone-800 cursor-pointer disabled:opacity-50"
                          }`}
                        >
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="font-semibold text-stone-100">{char.name}</span>
                            <span className="text-xs text-stone-500 shrink-0">
                              Lvl {char.level} {char.ancestry} {char.class}
                            </span>
                          </div>
                          {isBusy ? (
                            <p className="text-xs text-stone-500 mt-0.5">
                              Already adventuring elsewhere
                            </p>
                          ) : char.lastAdventureTitle ? (
                            <p className="text-xs text-stone-500 mt-0.5 truncate">
                              Last played: {char.lastAdventureTitle}
                            </p>
                          ) : null}
                        </button>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Option C: GM creates character */}
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-400 mb-3">
                Let the GM Decide
              </h2>

              {!showInterview ? (
                <button
                  onClick={() => setShowInterview(true)}
                  disabled={isCreating}
                  className="w-full rounded-lg border border-[var(--color-gold-dim)] bg-stone-900 px-4 py-3 text-center transition-colors hover:border-[var(--color-gold)] hover:bg-stone-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <p className="font-semibold text-[var(--color-gold)]">GM Builds Your Character</p>
                  <p className="text-sm text-stone-400 mt-0.5">
                    Answer 2 quick questions, then jump straight into the adventure
                  </p>
                </button>
              ) : (
                <div className="rounded-lg border border-[var(--color-gold-dim)] bg-stone-900 px-4 py-5 space-y-6">
                  {GM_QUESTIONS.map((q) => (
                    <div key={q.id}>
                      <p className="text-sm font-semibold text-stone-200 mb-3">{q.question}</p>
                      <div className="grid grid-cols-1 gap-2">
                        {q.options.map((opt) => {
                          const selected = answers[q.id] === opt;
                          return (
                            <button
                              key={opt}
                              onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                              disabled={isCreating}
                              className={`w-full rounded border px-3 py-2 text-left text-sm transition-colors cursor-pointer ${
                                selected
                                  ? "border-[var(--color-gold-dim)] bg-stone-800 text-[var(--color-gold)]"
                                  : "border-stone-700 bg-stone-800 text-stone-300 hover:border-stone-500 hover:text-stone-100"
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={handleBeginWithAnswers}
                    disabled={!allAnswered || isCreating}
                    className="w-full rounded-lg border border-[var(--color-gold-dim)] bg-stone-800 px-4 py-2.5 text-sm font-semibold text-[var(--color-gold)] transition-colors hover:border-[var(--color-gold)] hover:bg-stone-700 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isCreating ? "Preparing…" : "Begin Adventure →"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
