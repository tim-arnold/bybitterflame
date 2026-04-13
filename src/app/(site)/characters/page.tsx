"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SiteFooter } from "@/components/SiteFooter";

interface CharacterSummary {
  id: string;
  name: string;
  class: string;
  ancestry: string;
  level: number;
  isAdventuring: boolean;
  lastAdventureTitle: string | null;
  lastCampaignId: string;
  lastPlayedAt: string;
}

export default function CharactersPage() {
  const [characters, setCharacters] = useState<CharacterSummary[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetch("/api/characters")
      .then((r) => r.json())
      .then((data) => setCharacters(data.characters ?? []))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  async function handleDelete(characterId: string) {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/character/${characterId}`, { method: "DELETE" });
      if (res.ok) {
        setCharacters((prev) => prev.filter((c) => c.id !== characterId));
        setPendingDeleteId(null);
      }
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <main className="relative min-h-screen">
      <div className="fixed inset-0 bg-[url('/bg-woodcut.webp')] bg-cover bg-center" />

      <div className="relative z-10 mx-auto max-w-2xl px-4 py-12">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-uncial mb-1 text-4xl tracking-tight text-[var(--color-gold)]">
              Your Characters
            </h1>
            <a href="/" className="text-sm text-stone-400 hover:text-stone-300 transition-colors">
              ← Back to Home
            </a>
          </div>
        </div>

        {!loaded ? (
          <p className="text-stone-500 text-sm">Loading…</p>
        ) : characters.length === 0 ? (
          <div className="rounded-lg border border-stone-800 bg-stone-950/90 p-6 text-center">
            <p className="text-stone-400 text-sm">No characters yet.</p>
            <Link href="/new-adventure" className="mt-3 inline-block text-sm text-[var(--color-gold)] hover:text-white transition-colors">
              Begin an adventure →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {characters.map((c) => {
              const isPending = pendingDeleteId === c.id;
              return (
                <div key={c.id} className="rounded-lg border border-stone-800 bg-stone-950/90">
                  {isPending ? (
                    <div className="px-5 py-4 border border-red-800 rounded-lg">
                      <p className="text-sm font-semibold text-stone-200 mb-1">
                        Delete {c.name}?
                      </p>
                      <p className="text-xs text-stone-500 mb-4">
                        This cannot be undone.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDelete(c.id)}
                          disabled={isDeleting}
                          className="rounded border border-red-800 bg-stone-800 px-3 py-2 text-sm font-medium text-red-400 hover:border-red-600 hover:bg-stone-700 disabled:opacity-50 cursor-pointer transition-colors"
                        >
                          {isDeleting ? "Deleting…" : "Delete Character"}
                        </button>
                        <button
                          onClick={() => setPendingDeleteId(null)}
                          disabled={isDeleting}
                          className="rounded border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-400 hover:border-stone-500 hover:bg-stone-700 disabled:opacity-50 cursor-pointer transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 px-5 py-3">
                      <div className="flex-1 min-w-0">
                        <Link href={`/characters/${c.id}`} className="text-sm font-semibold text-stone-200 hover:text-[var(--color-gold)] transition-colors">
                          {c.name}
                        </Link>
                        <p className="text-xs text-stone-400">
                          Lvl {c.level} {c.ancestry} {c.class}
                        </p>
                        {c.isAdventuring && (
                          <p className="text-xs text-[var(--color-gold)] mt-0.5">
                            Adventuring{c.lastAdventureTitle ? ` — ${c.lastAdventureTitle}` : ""}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {c.isAdventuring ? (
                          <Link
                            href={`/play/${c.lastCampaignId}`}
                            className="text-xs text-stone-400 hover:text-[var(--color-gold)] transition-colors"
                          >
                            Continue →
                          </Link>
                        ) : (
                          <>
                            <Link
                              href="/new-adventure"
                              className="text-xs text-stone-500 hover:text-[var(--color-gold)] transition-colors"
                            >
                              New adventure →
                            </Link>
                            <button
                              onClick={() => setPendingDeleteId(c.id)}
                              className="text-xs text-stone-600 hover:text-red-400 transition-colors cursor-pointer"
                              aria-label={`Delete ${c.name}`}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <SiteFooter />
      </div>
    </main>
  );
}
