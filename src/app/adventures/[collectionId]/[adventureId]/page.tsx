"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getAdventure, getCollection } from "@/lib/adventures/index";
import { trackEvent } from "@/lib/analytics";

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

      // Store answers so the play page can send them as the opening message
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

  async function handleSelectExistingCharacter(characterId: string) {
    setIsCreating(true);
    try {
      const res = await fetch("/api/character/start-adventure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId, moduleId: collectionId, adventureId }),
      });
      if (!res.ok) throw new Error("Failed to start adventure");
      const { campaignId } = await res.json() as { campaignId: string };
      trackEvent({ name: "adventure_started", type: "module" });
      router.push(`/play/${campaignId}`);
    } catch {
      setIsCreating(false);
    }
  }

  const allAnswered = GM_QUESTIONS.every((q) => answers[q.id]);

  const levelLabel =
    adventure.levelMin === adventure.levelMax
      ? `Level ${adventure.levelMin}`
      : `Levels ${adventure.levelMin}–${adventure.levelMax}`;

  return (
    <div className="relative min-h-screen text-stone-100">
      {/* Background */}
      <div className="fixed inset-0 bg-[url('/dungeon-background.webp')] bg-cover bg-center" />


      {/* Content */}
      <div className="relative z-10">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <Link href="/adventures" className="text-sm text-stone-500 hover:text-stone-300 transition-colors">
            ← Adventures
          </Link>
        </div>

        {/* Adventure header */}
        <div className="mb-8">
          <div className="flex items-start gap-3 mb-3">
            <h1 className="text-2xl font-bold text-[var(--color-gold)] leading-tight">
              {adventure.title}
            </h1>
            <span className="shrink-0 text-xs mt-1 px-2 py-0.5 rounded border border-stone-600 bg-stone-800 text-stone-300 font-mono">
              {levelLabel}
            </span>
          </div>
          <p className="text-stone-300 leading-relaxed mb-4">{adventure.synopsis}</p>
          <blockquote className="border-l-2 border-[var(--color-gold-dim)] pl-4 text-stone-400 italic text-sm">
            {adventure.hook}
          </blockquote>
        </div>

        {/* Character options */}
        <div className="space-y-6">

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
                        onClick={() => !isBusy && handleSelectExistingCharacter(char.id)}
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
      </div>
      </div>
    </div>
  );
}
