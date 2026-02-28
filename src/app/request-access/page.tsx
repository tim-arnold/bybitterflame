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
              className="mt-6 inline-block text-sm text-stone-400 hover:text-stone-200 transition-colors"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <div className="rounded-lg border border-stone-800 bg-stone-950/90 p-6">
            <p className="mb-5 text-sm text-stone-400">
              Enter your name and email to request access.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-widest text-stone-500">
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
                <label className="mb-1.5 block text-xs uppercase tracking-widest text-stone-500">
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
                className="text-sm text-stone-400 hover:text-stone-200 transition-colors"
              >
                Back to sign in
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
