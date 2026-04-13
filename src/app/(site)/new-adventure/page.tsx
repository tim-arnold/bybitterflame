"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/analytics";
import { CharacterTypeStep } from "@/components/adventure-start/CharacterTypeStep";
import { CompanionStep } from "@/components/adventure-start/CompanionStep";
import { GmInterviewStep, isAllAnswered } from "@/components/adventure-start/GmInterviewStep";
import type { RosterCharacter, AvailableResponse } from "@/components/adventure-start/types";
import type { Companion } from "@/lib/game/types";

type Step = "character-type" | "companion" | "gm-interview";
type PendingPath = "create" | "existing" | "gm-create";

export default function NewAdventurePage() {
  const router = useRouter();

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

  function handleCompanionBack() {
    setStep("character-type");
    setSelectedCharacter(null);
    setSelectedCompanions([]);
    setAvailableData(null);
  }

  async function handleCompanionContinue() {
    if (pendingPath === "create") {
      trackEvent({ name: "adventure_started", type: "standard" });
      if (selectedCompanions.length > 0) {
        sessionStorage.setItem("adventure-companions", JSON.stringify(selectedCompanions));
      } else {
        sessionStorage.removeItem("adventure-companions");
      }
      router.push("/create");
    } else if (pendingPath === "existing") {
      await handleBeginWithExistingCharacter();
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
        campaignType: "standard",
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
      trackEvent({ name: "adventure_started", type: "standard" });
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
        body: JSON.stringify({ companion }),
      });
      if (!res.ok) throw new Error("Failed to promote companion");
      const { campaignId } = await res.json() as { campaignId: string };
      trackEvent({ name: "adventure_started", type: "standard" });
      router.push(`/play/${campaignId}`);
    } catch {
      setIsCreating(false);
    }
  }

  async function handleGmBegin() {
    setIsCreating(true);
    try {
      const body: Record<string, unknown> = {
        character: {},
        gmPersona: "",
        campaignType: "standard",
      };
      if (selectedCompanions.length > 0) {
        body.companions = selectedCompanions;
      }
      const res = await fetch("/api/character", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) { setIsCreating(false); return; }
      const { campaignId } = await res.json() as { campaignId: string };
      sessionStorage.setItem(`gm-create-answers-${campaignId}`, JSON.stringify(answers));
      trackEvent({ name: "adventure_started", type: "standard" });
      router.push(`/play/${campaignId}`);
    } catch {
      setIsCreating(false);
    }
  }

  function handleToggleCompanion(companion: Companion) {
    setSelectedCompanions((prev) => {
      const already = prev.some((c) => c.name === companion.name);
      if (already) return prev.filter((c) => c.name !== companion.name);
      if (prev.length >= 1) return prev; // maxCompanions = 1 for standard adventures
      return [...prev, companion];
    });
  }

  return (
    <main className="relative min-h-screen">
      <div className="fixed inset-0 bg-[url('/bg-woodcut.webp')] bg-cover bg-center" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-3xl font-bold text-[var(--color-gold)] mb-1">Begin New Adventure</h1>
        <Link href="/" className="text-sm text-stone-400 hover:text-stone-300 transition-colors">
          ← Back to Home
        </Link>

        <div className="mt-8">
          {step === "character-type" && (
            <CharacterTypeStep
              roster={roster}
              rosterLoaded={rosterLoaded}
              isCreating={isCreating}
              onRollYourOwn={handleRollYourOwn}
              onSelectExistingCharacter={handleSelectExistingCharacter}
              onGmDecides={handleGmDecides}
            />
          )}

          {step === "companion" && (
            <CompanionStep
              selectedCharacter={selectedCharacter}
              maxCompanions={1}
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
      </div>
    </main>
  );
}
