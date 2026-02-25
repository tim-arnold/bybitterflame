"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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

export default function Home() {
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);

  useEffect(() => {
    fetch("/api/campaigns")
      .then((r) => r.json())
      .then((data) => setCampaigns(data.campaigns ?? []))
      .catch(() => {});
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center">
      <h1 className="mb-2 text-5xl font-bold tracking-tight text-[var(--color-gold)]">
        Shadowdark
      </h1>
      <p className="mb-1 text-lg text-stone-400">AI Game Master</p>
      <p className="narrative mb-10 max-w-md text-stone-500">
        The torchlight flickers against damp stone walls. Something stirs in the
        darkness ahead. Will you press on?
      </p>

      {campaigns.length > 0 && (
        <div className="mb-8 w-full max-w-md">
          <p className="mb-3 text-sm uppercase tracking-widest text-stone-500">
            Continue Adventure
          </p>
          <div className="flex flex-col gap-2">
            {campaigns.map((c) => (
              <Link
                key={c.campaignId}
                href={`/play/${c.campaignId}`}
                className="flex items-center justify-between rounded-lg border border-stone-700 bg-stone-900 px-5 py-3 text-left transition-colors hover:border-stone-500 hover:bg-stone-800"
              >
                <div>
                  <p className="font-semibold text-stone-100">{c.character.name}</p>
                  <p className="text-sm text-stone-400">
                    Level {c.character.level} {c.character.ancestry} {c.character.class}
                    {c.currentLocation && (
                      <span className="text-stone-500"> · {c.currentLocation}</span>
                    )}
                  </p>
                </div>
                <span className="text-xs text-stone-600">
                  {new Date(c.updatedAt).toLocaleDateString()}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <Link
        href="/create"
        className="rounded-lg border border-[var(--color-gold-dim)] bg-stone-900 px-8 py-3 text-lg font-semibold text-[var(--color-gold)] transition-colors hover:border-[var(--color-gold)] hover:bg-stone-800"
      >
        Begin Your Adventure
      </Link>

      <p className="mt-6 text-xs text-stone-600">
        Powered by the Shadowdark RPG rules by The Arcane Library
      </p>
    </div>
  );
}