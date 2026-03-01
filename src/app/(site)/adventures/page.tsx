"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ADVENTURE_COLLECTIONS } from "@/lib/adventures/index";

function levelBadgeColor(min: number, max: number): string {
  const avg = (min + max) / 2;
  if (avg <= 1) return "bg-emerald-900 text-emerald-300 border-emerald-700";
  if (avg <= 2) return "bg-green-900 text-green-300 border-green-700";
  if (avg <= 3) return "bg-yellow-900 text-yellow-300 border-yellow-700";
  if (avg <= 4) return "bg-orange-900 text-orange-300 border-orange-700";
  return "bg-red-900 text-red-300 border-red-700";
}

function levelLabel(min: number, max: number): string {
  return min === max ? `Level ${min}` : `Levels ${min}–${max}`;
}

export default function AdventuresPage() {
  const [completedMap, setCompletedMap] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    fetch("/api/characters")
      .then((r) => r.json())
      .then((data: { completedAdventures?: { adventureId: string; characterName: string }[] }) => {
        const m = new Map<string, string>();
        for (const { adventureId, characterName } of data.completedAdventures ?? []) {
          m.set(adventureId, characterName);
        }
        setCompletedMap(m);
      })
      .catch(() => {});
  }, []);

  return (
    <main className="relative min-h-screen">
      <div className="fixed inset-0 bg-[url('/dungeon-background-rattail.webp')] bg-cover bg-center" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-12">

        <h1 className="text-3xl font-bold text-[var(--color-gold)] mb-1">Choose an Adventure</h1>
        <Link href="/" className="text-sm text-stone-400 hover:text-stone-300 transition-colors">
          ← Back to Home
        </Link>
        <p className="text-stone-400 mt-6 mb-6">
          Select a published oneshot module to run with an AI Game Master.
        </p>

        {ADVENTURE_COLLECTIONS.map((collection) => (
          <section key={collection.id} className="mb-6 rounded-lg border border-stone-800 bg-stone-950/90 p-6">
            <h2 className="text-xl font-semibold text-stone-200 mb-1">{collection.title}</h2>
            <p className="text-sm text-stone-500 mb-5">
              {collection.adventures.length} oneshot adventures
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {collection.adventures.map((adventure) => {
                const completedBy = completedMap.get(adventure.id);
                return (
                  <Link
                    key={adventure.id}
                    href={`/adventures/${collection.id}/${adventure.id}`}
                    className="group relative flex flex-col gap-2 rounded-lg border border-stone-700 bg-stone-900 p-4 transition-colors hover:border-stone-500 hover:bg-stone-800"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-stone-100 group-hover:text-white leading-tight">
                        {adventure.title}
                      </h3>
                      <span
                        className={`shrink-0 text-xs px-2 py-0.5 rounded border font-mono ${levelBadgeColor(adventure.levelMin, adventure.levelMax)}`}
                      >
                        {levelLabel(adventure.levelMin, adventure.levelMax)}
                      </span>
                    </div>
                    <p className="text-sm text-stone-400 leading-relaxed line-clamp-3">
                      {adventure.synopsis}
                    </p>
                    <div className="mt-auto flex items-center justify-between">
                      {completedBy ? (
                        <span className="text-xs px-2 py-0.5 rounded border border-[var(--color-gold-dim)] bg-stone-950 text-[var(--color-gold)] font-mono">
                          ✓ Completed · {completedBy}
                        </span>
                      ) : (
                        <span />
                      )}
                      <span className="text-xs text-[var(--color-gold)] opacity-0 group-hover:opacity-100 transition-opacity">
                        Select →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
