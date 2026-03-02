"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

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

export default function NewAdventurePage() {
  const router = useRouter();
  const [gmAnswers, setGmAnswers] = useState<Record<string, string>>({});
  const [isStartingGm, setIsStartingGm] = useState(false);

  const allAnswered = GM_QUESTIONS.every((q) => gmAnswers[q.id]);

  async function handleGmBegin() {
    setIsStartingGm(true);
    try {
      const res = await fetch("/api/character", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ character: {}, gmPersona: "", campaignType: "standard" }),
      });
      if (!res.ok) { setIsStartingGm(false); return; }
      const { campaignId } = await res.json() as { campaignId: string };
      sessionStorage.setItem(`gm-create-answers-${campaignId}`, JSON.stringify(gmAnswers));
      trackEvent({ name: "adventure_started", type: "gm_decides" });
      router.push(`/play/${campaignId}`);
    } catch {
      setIsStartingGm(false);
    }
  }

  return (
    <main className="relative min-h-screen">
      <div className="fixed inset-0 bg-[url('/dungeon-background-rattail.webp')] bg-cover bg-center" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-3xl font-bold text-[var(--color-gold)] mb-1">Begin New Adventure</h1>
        <Link href="/" className="text-sm text-stone-400 hover:text-stone-300 transition-colors">
          ← Back to Home
        </Link>

        <div className="mt-8 rounded-lg border border-stone-800 bg-stone-950/90 p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">

          {/* Option A: roll your own */}
          <div className="flex flex-col">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-400 mb-3">
              Roll Your Own Character
            </h2>
            <Link
              href="/create"
              className="flex-1 flex flex-col items-center justify-center rounded-lg border border-[var(--color-gold-dim)] bg-stone-900 px-4 py-3 text-center transition-colors hover:border-[var(--color-gold)] hover:bg-stone-800"
            >
              <p className="font-semibold text-[var(--color-gold)]">Create a New Character</p>
              <p className="text-sm text-stone-400 mt-0.5">
                Step through character creation with the GM, then begin your adventure
              </p>
            </Link>
          </div>

          {/* Option B: GM decides */}
          <div className="flex flex-col">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-400 mb-3">
              Let the GM Decide
            </h2>

            <div className="rounded-lg border border-[var(--color-gold-dim)] bg-stone-900 px-4 py-5 space-y-6">
                {GM_QUESTIONS.map((q) => (
                  <div key={q.id}>
                    <p className="text-sm font-semibold text-stone-200 mb-3">{q.question}</p>
                    <div className="grid grid-cols-1 gap-2">
                      {q.options.map((opt) => {
                        const selected = gmAnswers[q.id] === opt;
                        return (
                          <button
                            key={opt}
                            onClick={() => setGmAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                            disabled={isStartingGm}
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
                  onClick={handleGmBegin}
                  disabled={!allAnswered || isStartingGm}
                  className="w-full rounded-lg border border-[var(--color-gold-dim)] bg-stone-800 px-4 py-2.5 text-sm font-semibold text-[var(--color-gold)] transition-colors hover:border-[var(--color-gold)] hover:bg-stone-700 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isStartingGm ? "Preparing…" : "Begin Adventure →"}
                </button>
              </div>
          </div>

        </div>
      </div>
    </main>
  );
}
