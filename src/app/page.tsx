"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { SiteFooter } from "@/components/SiteFooter";

interface CampaignSummary {
  campaignId: string;
  campaignName: string;
  updatedAt: string;
  statusPhrase: string | null;
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

interface CharacterSummary {
  id: string;
  name: string;
  class: string;
  ancestry: string;
  level: number;
  isAdventuring: boolean;
  lastCampaignId: string | null;
  lastPlayedAt: string;
}


export default function Home() {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [campaignsLoaded, setCampaignsLoaded] = useState(false);
  const [characters, setCharacters] = useState<CharacterSummary[]>([]);
  const [charactersLoaded, setCharactersLoaded] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleteCharacterChecked, setDeleteCharacterChecked] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<"adventures" | "characters">("adventures");
  const isReady = !sessionPending && campaignsLoaded && charactersLoaded;

  // First-visit intro animation — runs once ever per user (persisted in localStorage)
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  useEffect(() => {
    const seen = localStorage.getItem("bbf-intro");
    if (!seen) {
      localStorage.setItem("bbf-intro", "1");
      setIsFirstVisit(true);
    }
  }, []);
  const contentRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLParagraphElement>(null);
  const line2Ref = useRef<HTMLParagraphElement>(null);
  const line3Ref = useRef<HTMLParagraphElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const restRef = useRef<HTMLDivElement>(null);
  const blackOverlayRef = useRef<HTMLDivElement>(null);

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

  // Always start at top — browser scroll restoration can show a stale scroll
  // position on refresh. Content is invisible until isReady so this is seamless.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    fetch("/api/campaigns")
      .then((r) => r.json())
      .then((data) => setCampaigns(data.campaigns ?? []))
      .catch(() => {})
      .finally(() => setCampaignsLoaded(true));
    fetch("/api/characters")
      .then((r) => r.json())
      .then((data) => setCharacters(data.characters ?? []))
      .catch(() => {})
      .finally(() => setCharactersLoaded(true));
  }, []);

  // Set initial tab from ?tab= query param, or default to characters if no campaigns
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("tab");
    if (param === "characters" || param === "adventures") {
      setActiveTab(param);
      return;
    }
    if (campaignsLoaded && campaigns.length === 0 && characters.length > 0) {
      setActiveTab("characters");
    }
  }, [campaignsLoaded, campaigns.length, characters.length]);

  // Fade from black immediately on first visit
  useEffect(() => {
    if (!isFirstVisit) return;
    const run = async () => {
      const { gsap } = await import("gsap");
      gsap.to(blackOverlayRef.current, {
        opacity: 0,
        duration: 7.0,
        delay: 0.2,
        ease: "linear",
        onComplete: () => {
          if (blackOverlayRef.current) blackOverlayRef.current.style.display = "none";
        },
      });
    };
    run();
  }, [isFirstVisit]);

  useEffect(() => {
    if (!isReady || !isFirstVisit) return;
    const run = async () => {
      const { gsap } = await import("gsap");
      // Make wrapper visible, hide each animated child
      gsap.set(contentRef.current, { opacity: 1 });
      gsap.set([line1Ref.current, line2Ref.current, line3Ref.current, logoRef.current, restRef.current], { opacity: 0 });

      const lineFrom = { scale: 4.5, opacity: 0, filter: "blur(16px)" };
      const lineTo = { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.9, ease: "power4.out" };

      gsap.timeline()
        .fromTo(line1Ref.current, lineFrom, lineTo)
        .fromTo(line2Ref.current, lineFrom, lineTo, "+=1.0")
        .fromTo(line3Ref.current, lineFrom, lineTo, "+=1.0")
        .fromTo(logoRef.current,
          { scale: 1.35, opacity: 0, filter: "blur(8px)" },
          { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.8, ease: "power2.out" },
          "+=2.0"
        )
        .fromTo(restRef.current,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 2.0, ease: "power2.out" },
          "+=0.2"
        );
    };
    run();
  }, [isReady, isFirstVisit]);

  async function handleDelete(campaignId: string) {
    setIsDeleting(true);
    try {
      await fetch(`/api/campaign/${campaignId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleteCharacter: deleteCharacterChecked }),
      });
      setCampaigns((prev) => prev.filter((c) => c.campaignId !== campaignId));
      setPendingDeleteId(null);
      setDeleteCharacterChecked(false);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center text-center">
      {/* Background */}
      <div className="fixed inset-0 bg-[url('/bg-woodcut.webp')] bg-cover bg-center" />
      {isFirstVisit && (
        <div ref={blackOverlayRef} className="fixed inset-0 bg-black z-[5] pointer-events-none" />
      )}



      {/* Content — hidden until session + campaigns are settled to prevent flash */}
      <div
        ref={contentRef}
        className={`relative z-10 flex flex-col items-center ${
          isFirstVisit
            ? "opacity-0"
            : `transition-opacity duration-500 ${isReady ? "opacity-100" : "opacity-0"}`
        }`}
      >
      <div ref={logoRef} className="mt-6 mb-4 flex items-center justify-center">
        <h1 className="sr-only">By Bitter Flame</h1>
        <Image
          src="/logo-woodcut-splash-400.webp"
          alt="By Bitter Flame"
          width={500}
          height={186}
          priority
        />
      </div>

      {/* Tagline */}
      <div className="mb-2 text-center">
        <p ref={line1Ref} className="font-cinzel text-lg font-bold text-stone-300 tracking-wide">
          Explore by bitter flame.
        </p>
        <p ref={line2Ref} className="font-cinzel text-lg font-bold text-stone-300 tracking-wide">
          Fight by bitter flame.
        </p>
        <p ref={line3Ref} className="font-cinzel text-lg font-bold tracking-wide text-[var(--color-gold)]">
          Probably die in the dark.
        </p>
      </div>

      <div ref={restRef} className="flex flex-col items-center w-full mt-8">
      <p className="mb-8 text-xs uppercase tracking-widest text-stone-400">
        AI-Powered Game Master
      </p>
      {!session && (
        <p className="mb-8 text-sm text-stone-500">
          Early access beta.{" "}
          <a href="/request-access" className="text-[var(--color-gold)] hover:text-white transition-colors">
            Request an account →
          </a>
        </p>
      )}

      {/* Tabbed "your stuff" section */}
      {session && (campaigns.length > 0 || characters.length > 0) && (
        <div className="mb-8 w-full max-w-md">
          {/* Tab headers */}
          <div className="flex mb-4 border-b border-stone-700">
            <button
              onClick={() => setActiveTab("adventures")}
              className={`px-4 py-2 text-sm font-cinzel tracking-wide transition-colors cursor-pointer ${
                activeTab === "adventures"
                  ? "text-[var(--color-gold)] border-b-2 border-[var(--color-gold)] -mb-px"
                  : "text-stone-400 hover:text-stone-300"
              }`}
            >
              Adventures
            </button>
            <button
              onClick={() => setActiveTab("characters")}
              className={`px-4 py-2 text-sm font-cinzel tracking-wide transition-colors cursor-pointer ${
                activeTab === "characters"
                  ? "text-[var(--color-gold)] border-b-2 border-[var(--color-gold)] -mb-px"
                  : "text-stone-400 hover:text-stone-300"
              }`}
            >
              Characters
            </button>
          </div>

          {/* Adventures tab */}
          {activeTab === "adventures" && (
            <div className="flex flex-col gap-2">
              {campaigns.length === 0 ? (
                <p className="text-sm text-stone-500 text-center py-4">No active adventures yet.</p>
              ) : campaigns.map((c) => {
                const isPending = pendingDeleteId === c.campaignId;
                const isLocked = lockedIds.has(c.campaignId);
                return (
                  <div key={c.campaignId} className="group relative">
                    {isPending ? (
                      <div className="rounded-lg border border-red-800 bg-stone-900 px-5 py-4 text-left">
                        <p className="text-sm font-semibold text-stone-200 mb-1">
                          Delete {c.campaignName || "this adventure"}?
                        </p>
                        <p className="text-xs text-stone-500 mb-3">
                          This cannot be undone.{" "}
                          {deleteCharacterChecked
                            ? `${c.character.name || "The character"} will also be permanently deleted.`
                            : `${c.character.name || "The character"} will be kept on your roster.`}
                        </p>
                        <label className="flex items-center gap-2 mb-4 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={deleteCharacterChecked}
                            onChange={(e) => setDeleteCharacterChecked(e.target.checked)}
                            className="w-3.5 h-3.5 rounded border-stone-600 bg-stone-800 accent-red-500 cursor-pointer"
                          />
                          <span className="text-xs text-stone-400 group-hover:text-stone-300 transition-colors">
                            Also delete {c.character.name || "the character"}
                          </span>
                        </label>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDelete(c.campaignId)}
                            disabled={isDeleting}
                            className="rounded border border-red-800 bg-stone-800 px-3 py-2 text-sm font-medium text-red-400 hover:border-red-600 hover:bg-stone-700 disabled:opacity-50 cursor-pointer transition-colors"
                          >
                            {isDeleting ? "Deleting…" : "Delete Adventure"}
                          </button>
                          <button
                            onClick={() => { setPendingDeleteId(null); setDeleteCharacterChecked(false); }}
                            disabled={isDeleting}
                            className="rounded border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-400 hover:border-stone-500 hover:bg-stone-700 disabled:opacity-50 cursor-pointer transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex rounded-lg border border-stone-700 bg-stone-900 transition-colors hover:border-stone-500 hover:bg-stone-800">
                        <Link
                          href={`/play/${c.campaignId}`}
                          className="flex-1 min-w-0 px-5 py-3 text-left"
                        >
                          <p className="font-uncial text-[var(--color-gold)] leading-snug">{c.campaignName}</p>
                          <p className="text-sm text-stone-400 mt-0.5">
                            {c.character.name || "Unnamed Adventurer"}
                            <span className="text-stone-600"> · </span>
                            Lvl {c.character.level} {c.character.ancestry} {c.character.class}
                          </p>
                          {(c.statusPhrase || c.companions.length > 0 || c.currentLocation) && (
                            <p className="text-xs text-stone-500 mt-0.5 italic">
                              {c.statusPhrase ?? (() => {
                                const names = c.companions;
                                const loc = c.currentLocation;
                                let companionPhrase = "";
                                if (names.length === 1) {
                                  companionPhrase = `with ${names[0]}`;
                                } else if (names.length === 2) {
                                  companionPhrase = `with ${names[0]} and ${names[1]}`;
                                } else if (names.length > 2) {
                                  companionPhrase = `with ${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
                                }
                                if (companionPhrase && loc) return `${companionPhrase} in ${loc}`;
                                if (companionPhrase) return companionPhrase;
                                if (loc) return `alone in ${loc}`;
                                return "";
                              })()}
                            </p>
                          )}
                        </Link>
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
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Characters tab */}
          {activeTab === "characters" && (
            <div className="flex flex-col gap-2">
              {characters.length === 0 ? (
                <p className="text-sm text-stone-500 text-center py-4">No characters yet.</p>
              ) : characters.map((c) => (
                <Link
                  key={c.id}
                  href={`/characters/${c.id}`}
                  className="flex items-center justify-between rounded-lg border border-stone-700 bg-stone-900 px-5 py-3 transition-colors hover:border-stone-500 hover:bg-stone-800"
                >
                  <div className="min-w-0 text-left">
                    <p className="font-uncial text-[var(--color-gold)] leading-snug">{c.name || "Unnamed Adventurer"}</p>
                    <p className="text-sm text-stone-400 mt-0.5">
                      Lvl {c.level} {c.ancestry} {c.class}
                    </p>
                  </div>
                  {c.isAdventuring && (
                    <span className="ml-3 shrink-0 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-[var(--color-gold-dim)] text-[var(--color-gold-dim)]">
                      Adventuring
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* New adventure CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {session ? (
          <>
            <button
              onClick={() => router.push("/new-adventure")}
              className="font-cinzel rounded-lg border border-[var(--color-gold-dim)] bg-stone-900 px-8 py-3 text-lg font-semibold text-[var(--color-gold)] transition-colors hover:border-[var(--color-gold)] hover:bg-stone-800 cursor-pointer"
            >
              Begin New Adventure
            </button>
            <button
              onClick={() => router.push("/adventures")}
              className="font-cinzel rounded-lg border border-[var(--color-gold-dim)] bg-stone-900 px-8 py-3 text-lg font-semibold text-[var(--color-gold)] transition-colors hover:border-[var(--color-gold)] hover:bg-stone-800 cursor-pointer"
            >
              Choose an Adventure
            </button>
          </>
        ) : (
          <button
            onClick={() => router.push("/login")}
            className="font-cinzel rounded-lg border border-[var(--color-gold-dim)] bg-stone-900 px-8 py-3 text-lg font-semibold text-[var(--color-gold)] transition-colors hover:border-[var(--color-gold)] hover:bg-stone-800 cursor-pointer"
          >
            Sign In
          </button>
        )}
      </div>

      {session && (
        <div className="flex items-center gap-5 mt-4 text-xs">
          <Link href="/how-to-play" className="text-[var(--color-gold-dim)] hover:text-[var(--color-gold)] transition-colors">How to Play</Link>
          <Link href="/account" className="text-[var(--color-gold-dim)] hover:text-[var(--color-gold)] transition-colors">Settings</Link>
          <button
            onClick={async () => { await authClient.signOut(); window.location.href = "/login"; }}
            className="text-[var(--color-gold-dim)] hover:text-[var(--color-gold)] transition-colors cursor-pointer"
          >
            Sign out
          </button>
        </div>
      )}

      <SiteFooter />
      </div>{/* /restRef */}
      </div>
    </main>
  );
}
