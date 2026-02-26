"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getAdventure, getCollection } from "@/lib/adventures/index";

interface CampaignSummary {
  campaignId: string;
  campaignName: string;
  updatedAt: string;
  currentLocation: string;
  character: {
    name: string;
    class: string;
    ancestry: string;
    level: number;
    alignment: string;
  };
}

function levelMatchClass(charLevel: number, min: number, max: number): string {
  if (charLevel >= min && charLevel <= max) return "text-emerald-400";
  if (charLevel === min - 1 || charLevel === max + 1) return "text-yellow-400";
  return "text-stone-500";
}

function levelMatchLabel(charLevel: number, min: number, max: number): string {
  if (charLevel >= min && charLevel <= max) return "Good match";
  if (charLevel < min) return `${min - charLevel} level${min - charLevel > 1 ? "s" : ""} below recommended`;
  return `${charLevel - max} level${charLevel - max > 1 ? "s" : ""} above recommended`;
}

export default function AdventureDetailPage() {
  const params = useParams();
  const router = useRouter();
  const collectionId = params.collectionId as string;
  const adventureId = params.adventureId as string;

  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  const collection = getCollection(collectionId);
  const adventure = getAdventure(collectionId, adventureId);

  useEffect(() => {
    fetch("/api/campaigns")
      .then((r) => r.json())
      .then((data) => setCampaigns(data.campaigns ?? []))
      .catch(() => {});
  }, []);

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

  async function handleUseExistingCharacter(campaignData: CampaignSummary) {
    setSelectedCampaignId(campaignData.campaignId);
    setIsCreating(true);
    try {
      // Create a new campaign for this character + adventure
      const res = await fetch(`/api/character/start-adventure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceCampaignId: campaignData.campaignId,
          moduleId: collectionId,
          adventureId,
        }),
      });
      if (!res.ok) throw new Error("Failed to start adventure");
      const { campaignId: newCampaignId } = await res.json() as { campaignId: string };
      router.push(`/play/${newCampaignId}`);
    } catch {
      setIsCreating(false);
      setSelectedCampaignId(null);
    }
  }

  async function handleGmCreateCharacter() {
    if (!adventure) return;
    setIsCreating(true);
    try {
      // Create a campaign with a placeholder — the GM will create the character
      const res = await fetch("/api/character", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          character: {
            name: "",
            ancestry: "Unknown",
            class: "Unknown",
            level: adventure.levelMin,
            alignment: "Neutral",
            background: "",
            str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10,
            hp: 1, maxHp: 1, ac: 10,
            equipment: [], spells: [], talents: [], features: [],
            gold: 0, silver: 0, copper: 0,
          },
          gmPersona: "",
          campaignType: "oneshot",
          moduleId: collectionId,
          adventureId,
        }),
      });
      if (!res.ok) throw new Error("Failed to create campaign");
      const { campaignId } = await res.json() as { campaignId: string };
      router.push(`/play/${campaignId}`);
    } catch {
      setIsCreating(false);
    }
  }

  const levelLabel =
    adventure.levelMin === adventure.levelMax
      ? `Level ${adventure.levelMin}`
      : `Levels ${adventure.levelMin}–${adventure.levelMax}`;

  return (
    <div className="relative min-h-screen text-stone-100">
      {/* Background */}
      <div className="fixed inset-0 bg-[url('/cover.png')] bg-cover bg-center" />
      <div className="fixed inset-0 bg-stone-950/85" />

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
          {/* Option A: existing characters */}
          {campaigns.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-400 mb-3">
                Use an Existing Character
              </h2>
              <div className="space-y-2">
                {campaigns.map((c) => {
                  const matchColor = levelMatchClass(c.character.level, adventure.levelMin, adventure.levelMax);
                  const matchLabel = levelMatchLabel(c.character.level, adventure.levelMin, adventure.levelMax);
                  const isBusy = isCreating && selectedCampaignId === c.campaignId;
                  return (
                    <button
                      key={c.campaignId}
                      onClick={() => handleUseExistingCharacter(c)}
                      disabled={isCreating}
                      className="w-full flex items-center justify-between rounded-lg border border-stone-700 bg-stone-900 px-4 py-3 text-left transition-colors hover:border-stone-500 hover:bg-stone-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div>
                        <p className="font-semibold text-stone-100">{c.character.name}</p>
                        <p className="text-sm text-stone-400">
                          Level {c.character.level} {c.character.ancestry} {c.character.class}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-xs ${matchColor}`}>{matchLabel}</p>
                        {isBusy && <p className="text-xs text-stone-500 mt-0.5">Starting...</p>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Option B: create new character */}
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

          {/* Option C: GM creates character */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-400 mb-3">
              Let the GM Decide
            </h2>
            <button
              onClick={handleGmCreateCharacter}
              disabled={isCreating}
              className="w-full rounded-lg border border-[var(--color-gold-dim)] bg-stone-900 px-4 py-3 text-center transition-colors hover:border-[var(--color-gold)] hover:bg-stone-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <p className="font-semibold text-[var(--color-gold)]">
                {isCreating && !selectedCampaignId ? "Preparing..." : "Brief Interview — GM Builds Your Character"}
              </p>
              <p className="text-sm text-stone-400 mt-0.5">
                Answer 1–2 questions, then jump straight into the adventure
              </p>
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
