"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getAdventure, getCollection } from "@/lib/adventures/index";
import { trackEvent } from "@/lib/analytics";
import { CharacterTypeStep } from "@/components/adventure-start/CharacterTypeStep";
import { CompanionStep } from "@/components/adventure-start/CompanionStep";
import { GmInterviewStep, isAllAnswered } from "@/components/adventure-start/GmInterviewStep";
import type { RosterCharacter, AvailableResponse } from "@/components/adventure-start/types";
import type { Companion } from "@/lib/game/types";

type Step = "character-type" | "companion" | "gm-interview";
type PendingPath = "create" | "existing" | "gm-create";

export default function AdventureDetailPage() {
  const params = useParams();
  const router = useRouter();
  const collectionId = params.collectionId as string;
  const adventureId = params.adventureId as string;

  const [step, setStep] = useState<Step>("character-type");
  const [pendingPath, setPendingPath] = useState<PendingPath>("create");
  const [isCreating, setIsCreating] = useState(false);

  // Roster (for existing character option)
  const [roster, setRoster] = useState<RosterCharacter[]>([]);
  const [rosterLoaded, setRosterLoaded] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<RosterCharacter | null>(null);

  // Companion selection
  const [availableData, setAvailableData] = useState<AvailableResponse | null>(null);
  const [availableLoading, setAvailableLoading] = useState(false);
  const [selectedCompanions, setSelectedCompanions] = useState<Companion[]>([]);

  // GM interview answers
  const [answers, setAnswers] = useState<Record<string, string>>({});

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

  const levelLabel =
    adventure.levelMin === adventure.levelMax
      ? `Level ${adventure.levelMin}`
      : `Levels ${adventure.levelMin}–${adventure.levelMax}`;

  // How many companions allowed:
  // For "existing" path: +1 per level the adventure is above the character, capped at 3.
  // For "create" / "gm-create" paths: always 1.
  const maxCompanions =
    pendingPath === "existing" && selectedCharacter
      ? Math.min(3, Math.max(1, 1 + Math.max(0, adventure.levelMin - selectedCharacter.level)))
      : 1;

  async function fetchCompanions(characterId?: string) {
    setAvailableData(null);
    setAvailableLoading(true);
    try {
      const url = characterId
        ? `/api/companions/available?characterId=${characterId}`
        : "/api/companions/available";
      const res = await fetch(url);
      if (res.ok) {
        setAvailableData(await res.json() as AvailableResponse);
      }
    } catch { /* swallow — companion step renders with empty list */ } finally {
      setAvailableLoading(false);
    }
  }

  function handleRollYourOwn() {
    setPendingPath("create");
    setSelectedCharacter(null);
    setSelectedCompanions([]);
    fetchCompanions();
    setStep("companion");
  }

  function handleSelectExistingCharacter(char: RosterCharacter) {
    setPendingPath("existing");
    setSelectedCharacter(char);
    setSelectedCompanions([]);
    fetchCompanions(char.id);
    setStep("companion");
  }

  function handleGmDecides() {
    setPendingPath("gm-create");
    setSelectedCharacter(null);
    setSelectedCompanions([]);
    fetchCompanions();
    setStep("companion");
  }

  async function handleQuickStart() {
    if (!adventure?.presetCharacter) return;
    setIsCreating(true);
    try {
      const res = await fetch("/api/character", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          character: adventure.presetCharacter,
          gmPersona: "",
          campaignType: "oneshot",
          moduleId: collectionId,
          adventureId,
        }),
      });
      if (!res.ok) throw new Error("Failed to create campaign");
      const { campaignId } = await res.json() as { campaignId: string };
      trackEvent({ name: "adventure_started", type: "module" });
      router.push(`/play/${campaignId}`);
    } catch {
      setIsCreating(false);
    }
  }

  function handleCompanionBack() {
    setStep("character-type");
    setSelectedCharacter(null);
    setSelectedCompanions([]);
    setAvailableData(null);
  }

  function handleCompanionContinue() {
    if (pendingPath === "create") {
      if (selectedCompanions.length > 0) {
        sessionStorage.setItem("adventure-companions", JSON.stringify(selectedCompanions));
      } else {
        sessionStorage.removeItem("adventure-companions");
      }
      router.push(`/create?adventureId=${adventureId}&collectionId=${collectionId}`);
    } else if (pendingPath === "existing") {
      handleBeginWithExistingCharacter();
    } else if (pendingPath === "gm-create") {
      setStep("gm-interview");
    }
  }

  async function handleBeginWithExistingCharacter() {
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

  async function handleGmBegin() {
    if (!adventure) return;
    setIsCreating(true);
    try {
      const body: Record<string, unknown> = {
        character: { level: adventure.levelMin },
        gmPersona: "",
        campaignType: "oneshot",
        moduleId: collectionId,
        adventureId,
      };
      if (selectedCompanions.length > 0) {
        body.companions = selectedCompanions;
      }
      const res = await fetch("/api/character", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to create campaign");
      const { campaignId } = await res.json() as { campaignId: string };
      sessionStorage.setItem(`gm-create-answers-${campaignId}`, JSON.stringify(answers));
      trackEvent({ name: "adventure_started", type: "module" });
      router.push(`/play/${campaignId}`);
    } catch {
      setIsCreating(false);
    }
  }

  function handleToggleCompanion(companion: Companion) {
    setSelectedCompanions((prev) => {
      const already = prev.some((c) => c.name === companion.name);
      if (already) return prev.filter((c) => c.name !== companion.name);
      if (prev.length >= maxCompanions) return prev;
      return [...prev, companion];
    });
  }

  return (
    <main className="relative min-h-screen">
      <div className="fixed inset-0 bg-[url('/bg-woodcut.webp')] bg-cover bg-center" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-3xl font-bold text-[var(--color-gold)] mb-1">Choose an Adventure</h1>
        <Link href="/adventures" className="text-sm text-stone-400 hover:text-stone-300 transition-colors">
          ← Back to all Adventures
        </Link>

        {/* Adventure header — always visible */}
        <div className="animate-content-in mt-8 mb-6 rounded-lg border border-stone-800 bg-stone-950/90 p-6">
          <div className="flex items-start gap-3 mb-3">
            <h2 className="text-2xl font-bold text-stone-100 leading-tight">{adventure.title}</h2>
            <span className="shrink-0 text-xs mt-1 px-2 py-0.5 rounded border border-stone-600 bg-stone-800 text-stone-300 font-mono">
              {levelLabel}
            </span>
          </div>
          <p className="text-stone-300 leading-relaxed mb-4">{adventure.synopsis}</p>
          <blockquote className="border-l-2 border-[var(--color-gold-dim)] pl-4 text-stone-400 italic text-sm">
            {adventure.hook}
          </blockquote>
        </div>

        {step === "character-type" && (
          <CharacterTypeStep
            roster={roster}
            rosterLoaded={rosterLoaded}
            isCreating={isCreating}
            onRollYourOwn={handleRollYourOwn}
            onSelectExistingCharacter={handleSelectExistingCharacter}
            onGmDecides={handleGmDecides}
            onQuickStart={adventure.presetCharacter ? handleQuickStart : undefined}
            presetCharacter={adventure.presetCharacter}
            adventureLevelMin={adventure.levelMin}
            adventureLevelMax={adventure.levelMax}
          />
        )}

        {step === "companion" && (
          <CompanionStep
            selectedCharacter={selectedCharacter}
            maxCompanions={maxCompanions}
            availableData={availableData}
            availableLoading={availableLoading}
            selectedCompanions={selectedCompanions}
            isCreating={isCreating}
            onToggleCompanion={handleToggleCompanion}
            onPlayAsCompanion={selectedCharacter ? handlePlayAsCompanion : undefined}
            onContinue={handleCompanionContinue}
            onBack={handleCompanionBack}
          />
        )}

        {step === "gm-interview" && (
          <GmInterviewStep
            answers={answers}
            setAnswers={setAnswers}
            isCreating={isCreating}
            allAnswered={isAllAnswered(answers)}
            onBegin={handleGmBegin}
            onBack={() => setStep("companion")}
          />
        )}
      </div>
    </main>
  );
}
