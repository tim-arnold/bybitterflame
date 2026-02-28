"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserNav } from "@/components/UserNav";
import { authClient } from "@/lib/auth/client";

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

type DeleteTarget = "adventure" | "character" | "both";

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

  // New adventure flow
  const [showNewOptions, setShowNewOptions] = useState(false);
  const [gmAnswers, setGmAnswers] = useState<Record<string, string>>({});
  const [isStartingGm, setIsStartingGm] = useState(false);

  useEffect(() => {
    fetch("/api/campaigns")
      .then((r) => r.json())
      .then((data) => setCampaigns(data.campaigns ?? []))
      .catch(() => {});
  }, []);

  async function handleDelete(campaignId: string, target: DeleteTarget) {
    setIsDeleting(true);
    try {
      await fetch(`/api/campaign/${campaignId}?target=${target}`, { method: "DELETE" });
      setCampaigns((prev) => prev.filter((c) => c.campaignId !== campaignId));
      setPendingDeleteId(null);
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleGmBegin() {
    setIsStartingGm(true);
    try {
      const res = await fetch("/api/character", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ character: {}, gmPersona: "", campaignType: "standard" }),
      });
      if (!res.ok) throw new Error("Failed to create campaign");
      const { campaignId } = await res.json() as { campaignId: string };
      sessionStorage.setItem(`gm-create-answers-${campaignId}`, JSON.stringify(gmAnswers));
      router.push(`/play/${campaignId}`);
    } catch {
      setIsStartingGm(false);
    }
  }

  const allAnswered = GM_QUESTIONS.every((q) => gmAnswers[q.id]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center text-center">
      {/* Background */}
      <div className="fixed inset-0 bg-[url('/dungeon-background.webp')] bg-cover bg-center" />


      {/* User nav */}
      <div className="fixed top-4 right-4 z-20">
        <UserNav />
      </div>

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

      {campaigns.length > 0 && !showNewOptions && (
        <div className="mb-8 w-full max-w-md">
          <p className="mb-3 text-sm uppercase tracking-widest text-stone-500">
            Continue Adventure
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
                        Delete {c.character.name || "this adventure"}?
                      </p>
                      <p className="text-xs text-stone-500 mb-4">
                        This cannot be undone. Choose what to remove:
                      </p>
                      <div className="flex flex-col gap-2 mb-3">
                        <button
                          onClick={() => handleDelete(c.campaignId, "adventure")}
                          disabled={isDeleting}
                          className="w-full rounded border border-stone-700 bg-stone-800 px-3 py-2 text-left text-sm hover:border-stone-500 hover:bg-stone-700 disabled:opacity-50 cursor-pointer transition-colors"
                        >
                          <span className="font-medium text-stone-200">Adventure only</span>
                          <span className="ml-2 text-stone-500">— keep the character for a future run</span>
                        </button>
                        <button
                          onClick={() => handleDelete(c.campaignId, "character")}
                          disabled={isDeleting}
                          className="w-full rounded border border-stone-700 bg-stone-800 px-3 py-2 text-left text-sm hover:border-stone-500 hover:bg-stone-700 disabled:opacity-50 cursor-pointer transition-colors"
                        >
                          <span className="font-medium text-stone-200">Character only</span>
                          <span className="ml-2 text-stone-500">— deletes everything</span>
                        </button>
                        <button
                          onClick={() => handleDelete(c.campaignId, "both")}
                          disabled={isDeleting}
                          className="w-full rounded border border-red-900 bg-stone-800 px-3 py-2 text-left text-sm hover:border-red-700 hover:bg-stone-700 disabled:opacity-50 cursor-pointer transition-colors"
                        >
                          <span className="font-medium text-red-400">Delete both</span>
                          <span className="ml-2 text-stone-500">— adventure and character gone</span>
                        </button>
                      </div>
                      <button
                        onClick={() => setPendingDeleteId(null)}
                        disabled={isDeleting}
                        className="text-xs text-stone-600 hover:text-stone-400 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <Link
                        href={`/play/${c.campaignId}`}
                        className="flex items-center justify-between rounded-lg border border-stone-700 bg-stone-900 px-5 py-3 text-left transition-colors hover:border-stone-500 hover:bg-stone-800"
                      >
                        <div>
                          <p className="text-xs text-[var(--color-gold)] mb-0.5">{c.campaignName}</p>
                          <p className="font-semibold text-stone-100">{c.character.name || "Unnamed Adventurer"}</p>
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
                      {/* Lock / unlock button — always right-2; gold when locked, appears on hover when unlocked */}
                      <button
                        onClick={() => toggleLock(c.campaignId)}
                        className={`absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded transition-all cursor-pointer ${
                          isLocked
                            ? "text-[var(--color-gold-dim)]"
                            : "text-stone-600 opacity-0 group-hover:opacity-100 hover:text-stone-400"
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
                      </button>
                      {/* Delete — only available when unlocked */}
                      {!isLocked && (
                        <button
                          onClick={() => setPendingDeleteId(c.campaignId)}
                          className="absolute right-8 top-2 flex h-5 w-5 items-center justify-center rounded text-stone-500 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all cursor-pointer text-sm leading-none"
                          aria-label="Delete adventure"
                        >
                          ×
                        </button>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* New adventure options */}
      <div className="w-full max-w-md">
        {!showNewOptions ? (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => session ? setShowNewOptions(true) : router.push("/login")}
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
        ) : (
          <div className="rounded-lg border border-[var(--color-gold-dim)] bg-stone-900 px-5 py-5 text-left space-y-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-wider text-stone-400">New Adventure</p>
              <button
                onClick={() => { setShowNewOptions(false); setGmAnswers({}); }}
                className="text-xs text-stone-600 hover:text-stone-400 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>

            {/* Option A: build your own */}
            <Link
              href="/create"
              className="block rounded border border-stone-700 bg-stone-800 px-4 py-3 transition-colors hover:border-stone-500 hover:bg-stone-700"
            >
              <p className="font-semibold text-stone-100">Roll a New Character</p>
              <p className="text-xs text-stone-300 mt-0.5">Step through character creation with the GM</p>
            </Link>

            {/* Option B: GM decides */}
            <div>
              <p className="font-semibold text-stone-100 mb-3">Let the GM Decide</p>
              <div className="space-y-4">
                {GM_QUESTIONS.map((q) => (
                  <div key={q.id}>
                    <p className="text-sm text-stone-300 mb-2">{q.question}</p>
                    <div className="grid grid-cols-1 gap-1.5">
                      {q.options.map((opt) => {
                        const selected = gmAnswers[q.id] === opt;
                        return (
                          <button
                            key={opt}
                            onClick={() => setGmAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                            disabled={isStartingGm}
                            className={`w-full rounded border px-3 py-2 text-left text-sm transition-colors cursor-pointer ${
                              selected
                                ? "border-[var(--color-gold-dim)] bg-stone-700 text-[var(--color-gold)]"
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
                  onClick={handleGmBegin}
                  disabled={!allAnswered || isStartingGm}
                  className="w-full rounded border border-[var(--color-gold-dim)] bg-stone-800 px-4 py-2.5 text-sm font-semibold text-[var(--color-gold)] transition-colors hover:border-[var(--color-gold)] hover:bg-stone-700 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isStartingGm ? "Preparing…" : "Begin Adventure →"}
                </button>
              </div>
            </div>
          </div>
        )}
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
      </div>
      </div>
    </div>
  );
}
