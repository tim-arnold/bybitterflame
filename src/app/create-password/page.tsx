"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth/client";

function CreatePasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="rounded-lg border border-stone-800 bg-stone-950/90 p-6 text-center">
        <p className="mb-2 text-sm font-medium text-red-400">Invalid link</p>
        <p className="text-sm text-stone-400">
          This setup link is missing a token. Please contact support.
        </p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/account-request/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json() as { ok?: boolean; email?: string; error?: string };

      if (!res.ok || !data.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      // Account created — sign in automatically
      const { error: signInError } = await authClient.signIn.email({
        email: data.email!,
        password,
      });

      if (signInError) {
        // Account was created but sign-in failed — send to login
        router.push("/login");
        return;
      }

      router.push("/");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-stone-800 bg-stone-950/90 p-6">
      <p className="mb-5 text-sm text-stone-400">
        Choose a password to complete your account setup.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-widest text-stone-400">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
            autoComplete="new-password"
            className="w-full rounded border border-stone-700 bg-stone-900 px-3 py-2 text-sm text-stone-100 placeholder-stone-600 focus:border-stone-500 focus:outline-none"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-widest text-stone-400">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            autoComplete="new-password"
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
          {loading ? "Setting up your account…" : "Enter the dungeon →"}
        </button>
      </form>
    </div>
  );
}

export default function CreatePasswordPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center">
      <div className="absolute inset-0 bg-[url('/dungeon-background.webp')] bg-cover bg-center" />

      <div className="relative z-10 w-full max-w-sm px-4">
        <h1 className="mb-1 text-center text-3xl font-bold tracking-tight text-[var(--color-gold)]">
          By Torchlight
        </h1>
        <p className="mb-8 text-center text-sm text-stone-400">Welcome — set your password</p>

        <Suspense
          fallback={
            <div className="rounded-lg border border-stone-800 bg-stone-950/90 p-6 text-center text-stone-400">
              Loading…
            </div>
          }
        >
          <CreatePasswordForm />
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
