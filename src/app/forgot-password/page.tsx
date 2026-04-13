"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth/client";

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      setError(error.message ?? "Something went wrong. Please try again.");
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-lg border border-stone-800 bg-stone-950/90 p-6 text-center">
        <p className="mb-2 text-sm font-medium text-stone-200">Check your email</p>
        <p className="text-sm text-stone-400">
          If an account exists for <span className="text-stone-200">{email}</span>, you&apos;ll
          receive a password reset link shortly.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm text-stone-400 hover:text-white transition-colors"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-stone-800 bg-stone-950/90 p-6">
      <p className="mb-5 text-sm text-stone-400">
        Enter your email and we&apos;ll send you a reset link.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            autoFocus
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
          {loading ? "Sending…" : "Send reset link"}
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
  );
}

export default function ForgotPasswordPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center">
      <div className="absolute inset-0 bg-[url('/bg-woodcut.webp')] bg-cover bg-center" />


      <div className="relative z-10 w-full max-w-sm px-4">
        <h1 className="mb-1 text-center text-3xl font-bold tracking-tight text-[var(--color-gold)]">
          By Bitter Flame
        </h1>
        <p className="mb-8 text-center text-sm text-stone-400">Forgot your password?</p>

        <Suspense
          fallback={
            <div className="rounded-lg border border-stone-800 bg-stone-950/90 p-6 text-center text-stone-400">
              Loading…
            </div>
          }
        >
          <ForgotPasswordForm />
        </Suspense>

        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-stone-400 hover:text-white transition-colors">
            ← Home
          </Link>
        </div>
      </div>
    </div>
  );
}
