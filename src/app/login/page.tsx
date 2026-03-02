"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { SiteNav } from "@/components/SiteNav";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";
  const wasReset = searchParams.get("reset") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await authClient.signIn.email({ email, password });
    if (error) {
      setError(error.message ?? "Sign in failed");
      setLoading(false);
      return;
    }

    router.push(redirect);
  }

  return (
    <div className="rounded-lg border border-stone-800 bg-stone-950/90 p-6">
      {wasReset && (
        <p className="mb-5 rounded border border-green-900 bg-green-950/50 px-3 py-2 text-sm text-green-400">
          Password reset! Sign in with your new password.
        </p>
      )}

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
            autoFocus
            autoComplete="email"
            className="w-full rounded border border-stone-700 bg-stone-900 px-3 py-2 text-sm text-stone-100 placeholder-stone-600 focus:border-stone-500 focus:outline-none"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-xs uppercase tracking-widest text-stone-400">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-stone-400 hover:text-white transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full rounded border border-stone-700 bg-stone-900 px-3 py-2 text-sm text-stone-100 placeholder-stone-600 focus:border-stone-500 focus:outline-none"
            placeholder="••••••••"
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
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <div className="mt-5 text-center">
        <Link
          href="/request-access"
          className="text-sm text-stone-400 hover:text-white transition-colors"
        >
          Need an account? Request access →
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center">
      <SiteNav />
      <div className="absolute inset-0 bg-[url('/dungeon-background-rattail.webp')] bg-cover bg-center" />


      <div className="relative z-10 w-full max-w-sm px-4 pt-12">
        <h1 className="mb-1 text-center text-3xl font-bold tracking-tight text-[var(--color-gold)]">
          By Torchlight
        </h1>
        <p className="mb-8 text-center text-sm text-stone-400">AI-Powered Game Master</p>

        <Suspense fallback={<div className="rounded-lg border border-stone-800 bg-stone-950/90 p-6 text-center text-stone-400">Loading…</div>}>
          <LoginForm />
        </Suspense>

        <p className="mt-8 text-xs text-stone-400 text-center leading-relaxed">
          By Torchlight is an independent product published under the Shadowdark RPG Third-Party License and is not affiliated with The Arcane Library, LLC. Shadowdark RPG © 2023 The Arcane Library, LLC.
        </p>
      </div>
    </div>
  );
}
