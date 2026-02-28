"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth/client";

function ResetPasswordForm() {
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
        <p className="mb-2 text-sm font-medium text-red-400">Invalid reset link</p>
        <p className="text-sm text-stone-400">
          This link is missing a token. Please request a new reset link.
        </p>
        <Link
          href="/forgot-password"
          className="mt-6 inline-block text-sm text-stone-400 hover:text-white transition-colors"
        >
          Request new link
        </Link>
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

    const { error } = await authClient.resetPassword({
      newPassword: password,
      token: token!,
    });

    setLoading(false);

    if (error) {
      setError(error.message ?? "Failed to reset password. The link may have expired.");
      return;
    }

    router.push("/login?reset=1");
  }

  return (
    <div className="rounded-lg border border-stone-800 bg-stone-950/90 p-6">
      <p className="mb-5 text-sm text-stone-400">Choose a new password for your account.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-widest text-stone-400">
            New Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            autoFocus
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
          {loading ? "Resetting…" : "Reset password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center">
      <div className="absolute inset-0 bg-[url('/cover.webp')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-stone-950/85" />

      <div className="relative z-10 w-full max-w-sm px-4">
        <h1 className="mb-1 text-center text-3xl font-bold tracking-tight text-[var(--color-gold)]">
          By Torchlight
        </h1>
        <p className="mb-8 text-center text-sm text-stone-400">Reset your password</p>

        <Suspense
          fallback={
            <div className="rounded-lg border border-stone-800 bg-stone-950/90 p-6 text-center text-stone-400">
              Loading…
            </div>
          }
        >
          <ResetPasswordForm />
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
