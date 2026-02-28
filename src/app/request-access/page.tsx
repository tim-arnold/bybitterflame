"use client";

import { useState } from "react";
import Link from "next/link";

export default function RequestAccessPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/account-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });

      if (!res.ok) {
        setError("Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center">
      <div className="absolute inset-0 bg-[url('/cover.webp')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-stone-950/85" />

      <div className="relative z-10 w-full max-w-sm px-4">
        <h1 className="mb-1 text-center text-3xl font-bold tracking-tight text-[var(--color-gold)]">
          ShadowDork
        </h1>
        <p className="mb-8 text-center text-sm text-stone-400">AI-Powered Game Master</p>

        {submitted ? (
          <div className="rounded-lg border border-stone-800 bg-stone-950/90 p-6 text-center">
            <p className="mb-2 text-sm font-medium text-stone-200">Request received!</p>
            <p className="text-sm text-stone-400">
              We&apos;ll email you at <span className="text-stone-200">{email}</span> when your
              account is approved.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-block text-sm text-stone-400 hover:text-white transition-colors"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <div className="rounded-lg border border-stone-800 bg-stone-950/90 p-6">
            <p className="mb-5 text-sm text-stone-400">
              Enter your name and email to request access.
            </p>

            <div className="mb-6 space-y-3 rounded border border-stone-700 bg-stone-900 px-4 py-4 text-sm text-stone-400">
              <div>
                <p className="font-semibold text-stone-200">Free trial — 20 turns included</p>
                <p className="mt-1">
                  Once your character is created, you get 20 AI turns on us. That&apos;s enough
                  to explore a dungeon, fight a few encounters, and see how the GM plays.
                </p>
              </div>
              <div>
                <p className="font-semibold text-stone-200">Unlimited play with your own API key</p>
                <p className="mt-1">
                  After your free turns, bring your own{" "}
                  <a
                    href="https://console.anthropic.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-stone-300 underline hover:text-white transition-colors"
                  >
                    Anthropic API key
                  </a>{" "}
                  and play as much as you like. Keys are stored encrypted and never shared.
                  A typical session costs a few cents.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-widest text-stone-400">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                  autoComplete="name"
                  className="w-full rounded border border-stone-700 bg-stone-900 px-3 py-2 text-sm text-stone-100 placeholder-stone-600 focus:border-stone-500 focus:outline-none"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-widest text-stone-400">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full rounded border border-stone-700 bg-stone-900 px-3 py-2 text-sm text-stone-100 placeholder-stone-600 focus:border-stone-500 focus:outline-none"
                  placeholder="you@example.com"
                />
              </div>

              {error && (
                <p className="rounded border border-red-900 bg-red-950/50 px-3 py-2 text-sm text-red-400">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-1 rounded border border-[var(--color-gold)] bg-transparent px-4 py-2.5 text-sm font-semibold text-[var(--color-gold)] transition-colors hover:bg-[var(--color-gold)] hover:text-stone-950 disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Submitting…" : "Request Access"}
              </button>
            </form>

            <div className="mt-5 text-center">
              <Link
                href="/login"
                className="text-sm text-stone-400 hover:text-white transition-colors"
              >
                Back to sign in
              </Link>
            </div>
          </div>
        )}

        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-stone-400 hover:text-white transition-colors">
            ← Home
          </Link>
        </div>
      </div>
    </div>
  );
}
