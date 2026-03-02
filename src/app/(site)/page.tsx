"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";

interface CampaignSummary {
  campaignId: string;
  campaignName: string;
  updatedAt: string;
  currentLocation: string;
  companions: string[];
  character: {
    name: string;
    class: string;
    ancestry: string;
    level: number;
    alignment: string;
  };
}


export default function Home() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Campaign lock state — persisted in localStorage, unlocked by default
  const [lockedIds, setLockedIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const stored = localStorage.getItem("locked-campaigns");
      return stored ? new Set(JSON.parse(stored) as string[]) : new Set();
    } catch {
      return new Set();
    }
  });

  function toggleLock(campaignId: string) {
    setLockedIds((prev) => {
      const next = new Set(prev);
      if (next.has(campaignId)) next.delete(campaignId);
      else next.add(campaignId);
      localStorage.setItem("locked-campaigns", JSON.stringify([...next]));
      return next;
    });
  }

  useEffect(() => {
    fetch("/api/campaigns")
      .then((r) => r.json())
      .then((data) => setCampaigns(data.campaigns ?? []))
      .catch(() => {});
  }, []);

  async function handleDelete(campaignId: string) {
    setIsDeleting(true);
    try {
      await fetch(`/api/campaign/${campaignId}?target=adventure`, { method: "DELETE" });
      setCampaigns((prev) => prev.filter((c) => c.campaignId !== campaignId));
      setPendingDeleteId(null);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center text-center">
      {/* Background */}
      <div className="fixed inset-0 bg-[url('/dungeon-background-rattail.webp')] bg-cover bg-center" />


      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
      <div className="mb-2 flex items-center justify-center gap-3">
        <h1 className="text-5xl font-bold tracking-tight text-[var(--color-gold)]">
          By Torchlight
        </h1>
        <span className="rounded border border-[var(--color-gold-dim)] px-2 py-0.5 text-xs font-semibold uppercase tracking-widest text-[var(--color-gold)] opacity-70">
          Beta
        </span>
      </div>
      <p className="mb-1 text-lg text-stone-300">AI-Powered Game Master</p>
      <p className="narrative mb-6 max-w-md text-stone-500">
        The torchlight flickers against damp stone walls. Something stirs in the
        darkness ahead. Will you press on?
      </p>
      {!session && (
        <div className="mb-8 max-w-sm rounded-lg border border-stone-700 bg-stone-900/70 px-5 py-4 text-sm text-stone-400 backdrop-blur-sm">
          <p className="mb-1 font-semibold text-stone-200">Join the Beta</p>
          <p>
            By Torchlight is in early access. Request an account and start playing — no
            experience with Shadowdark RPG required.
          </p>
          <a
            href="/request-access"
            className="mt-3 inline-block text-sm font-medium text-[var(--color-gold)] hover:text-white transition-colors"
          >
            Request access →
          </a>
        </div>
      )}

      {campaigns.length > 0 && (
        <div className="mb-8 w-full max-w-md">
          <p className="mb-3 text-sm uppercase tracking-widest text-stone-500">
            Continue an Adventure
          </p>
          <div className="flex flex-col gap-2">
            {campaigns.map((c) => {
              const isPending = pendingDeleteId === c.campaignId;
              const isLocked = lockedIds.has(c.campaignId);
              return (
                <div key={c.campaignId} className="group relative">
                  {isPending ? (
                    <div className="rounded-lg border border-red-800 bg-stone-900 px-5 py-4 text-left">
                      <p className="text-sm font-semibold text-stone-200 mb-1">
                        Delete {c.campaignName || "this adventure"}?
                      </p>
                      <p className="text-xs text-stone-500 mb-4">
                        This cannot be undone. The character will be kept on your roster.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDelete(c.campaignId)}
                          disabled={isDeleting}
                          className="rounded border border-red-800 bg-stone-800 px-3 py-2 text-sm font-medium text-red-400 hover:border-red-600 hover:bg-stone-700 disabled:opacity-50 cursor-pointer transition-colors"
                        >
                          {isDeleting ? "Deleting…" : "Delete Adventure"}
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
                    <>
                      {/* Tile: link is flex-1, right column holds date + actions so they never overlap */}
                      <div className="flex rounded-lg border border-stone-700 bg-stone-900 transition-colors hover:border-stone-500 hover:bg-stone-800">
                        <Link
                          href={`/play/${c.campaignId}`}
                          className="flex-1 min-w-0 px-5 py-3 text-left"
                        >
                          <p className="font-semibold text-[var(--color-gold)] leading-snug">{c.campaignName}</p>
                          <p className="text-sm text-stone-400 mt-0.5">
                            {c.character.name || "Unnamed Adventurer"}
                            <span className="text-stone-600"> · </span>
                            Lvl {c.character.level} {c.character.ancestry} {c.character.class}
                          </p>
                          {(c.companions.length > 0 || c.currentLocation) && (
                            <p className="text-xs text-stone-500 mt-0.5">
                              {c.companions.length > 0 && (
                                <span>with {c.companions.join(", ")}</span>
                              )}
                              {c.companions.length > 0 && c.currentLocation && (
                                <span> · </span>
                              )}
                              {c.currentLocation && (
                                <span>{c.currentLocation}</span>
                              )}
                            </p>
                          )}
                        </Link>
                        {/* Right column: date on top, icons on bottom (shown on hover) */}
                        <div className="flex flex-col items-end justify-between px-3 py-2.5 shrink-0">
                          <span className="text-xs text-stone-600">
                            {new Date(c.updatedAt).toLocaleDateString()}
                          </span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!isLocked && (
                              <button
                                onClick={() => setPendingDeleteId(c.campaignId)}
                                className="group/tip relative flex h-5 w-5 items-center justify-center rounded text-stone-500 hover:text-red-400 transition-colors cursor-pointer"
                                aria-label="Delete adventure"
                              >
                                <svg viewBox="0 0 12 14" width="11" height="13" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M1 3.5h10M4.5 3.5V2.5h3v1" />
                                  <path d="M2 3.5l.7 8.5h6.6L10 3.5" />
                                  <line x1="4.5" y1="6" x2="4.5" y2="10" />
                                  <line x1="6" y1="6" x2="6" y2="10" />
                                  <line x1="7.5" y1="6" x2="7.5" y2="10" />
                                </svg>
                                <span className="pointer-events-none absolute bottom-full right-0 mb-1.5 rounded border border-stone-700 bg-stone-900 px-1.5 py-0.5 text-xs whitespace-nowrap text-stone-300 opacity-0 transition-opacity group-hover/tip:opacity-100">
                                  Delete adventure
                                </span>
                              </button>
                            )}
                            <button
                              onClick={() => toggleLock(c.campaignId)}
                              className={`group/tip relative flex h-5 w-5 items-center justify-center rounded transition-colors cursor-pointer ${
                                isLocked ? "text-[var(--color-gold-dim)]" : "text-stone-500 hover:text-stone-300"
                              }`}
                              aria-label={isLocked ? "Unlock adventure" : "Lock adventure"}
                            >
                              <svg viewBox="0 0 12 14" width="11" height="13" fill="currentColor">
                                <rect x="1" y="6" width="10" height="8" rx="1.5" />
                                {isLocked ? (
                                  <path d="M3.5 6V4a2.5 2.5 0 0 1 5 0v2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                ) : (
                                  <path d="M3.5 6V4a2.5 2.5 0 0 1 5 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                )}
                              </svg>
                              <span className="pointer-events-none absolute bottom-full right-0 mb-1.5 rounded border border-stone-700 bg-stone-900 px-1.5 py-0.5 text-xs whitespace-nowrap text-stone-300 opacity-0 transition-opacity group-hover/tip:opacity-100">
                                {isLocked ? "Unlock adventure" : "Lock adventure"}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* New adventure options */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => session ? router.push("/new-adventure") : router.push("/login")}
          className="rounded-lg border border-[var(--color-gold-dim)] bg-stone-900 px-8 py-3 text-lg font-semibold text-[var(--color-gold)] transition-colors hover:border-[var(--color-gold)] hover:bg-stone-800 cursor-pointer"
        >
          Begin New Adventure
        </button>
        <button
          onClick={() => session ? router.push("/adventures") : router.push("/login")}
          className="rounded-lg border border-stone-600 bg-stone-900 px-8 py-3 text-lg font-semibold text-stone-300 transition-colors hover:border-stone-400 hover:bg-stone-800 cursor-pointer"
        >
          Choose an Adventure
        </button>
      </div>

      <div className="mt-6 flex flex-col items-center gap-3">
        <a href="https://thearcanelibrary.com" target="_blank" rel="noopener noreferrer">
          <img
            src="/shadowdark-third-party-logo.webp"
            alt="Shadowdark RPG Third-Party Product"
            width={200}
            height={83}
            className="opacity-70 hover:opacity-100 transition-opacity"
          />
        </a>
        <p className="text-xs text-stone-400 max-w-sm leading-relaxed text-center">
          By Torchlight is an independent product published under the Shadowdark RPG Third-Party License and is not affiliated with The Arcane Library, LLC. Shadowdark RPG © 2023 The Arcane Library, LLC.
        </p>
        <p className="text-xs text-stone-400 text-center">
          © {new Date().getFullYear()} tim52.io
        </p>
      </div>
      </div>
    </main>
  );
}
