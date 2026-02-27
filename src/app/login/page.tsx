"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === "signup") {
      const { error } = await authClient.signUp.email({ name, email, password });
      if (error) {
        setError(error.message ?? "Sign up failed");
        setLoading(false);
        return;
      }
    } else {
      const { error } = await authClient.signIn.email({ email, password });
      if (error) {
        setError(error.message ?? "Sign in failed");
        setLoading(false);
        return;
      }
    }

    router.push(redirect);
  }

  return (
    <div className="rounded-lg border border-stone-800 bg-stone-950/90 p-6">
      {/* Mode toggle */}
      <div className="mb-6 flex rounded-md border border-stone-800 bg-stone-900 p-1">
        <button
          type="button"
          onClick={() => { setMode("signin"); setError(null); }}
          className={`flex-1 rounded py-1.5 text-sm font-medium transition-colors cursor-pointer ${
            mode === "signin"
              ? "bg-stone-700 text-stone-100"
              : "text-stone-500 hover:text-stone-300"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { setMode("signup"); setError(null); }}
          className={`flex-1 rounded py-1.5 text-sm font-medium transition-colors cursor-pointer ${
            mode === "signup"
              ? "bg-stone-700 text-stone-100"
              : "text-stone-500 hover:text-stone-300"
          }`}
        >
          Create Account
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {mode === "signup" && (
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-widest text-stone-500">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              className="w-full rounded border border-stone-700 bg-stone-900 px-3 py-2 text-sm text-stone-100 placeholder-stone-600 focus:border-stone-500 focus:outline-none"
              placeholder="Your name"
            />
          </div>
        )}

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

        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-widest text-stone-500">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
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
          {loading
            ? mode === "signup" ? "Creating account…" : "Signing in…"
            : mode === "signup" ? "Create Account" : "Sign In"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center">
      <div className="absolute inset-0 bg-[url('/cover.webp')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-stone-950/85" />

      <div className="relative z-10 w-full max-w-sm px-4">
        <h1 className="mb-1 text-center text-3xl font-bold tracking-tight text-[var(--color-gold)]">
          ShadowDork
        </h1>
        <p className="mb-8 text-center text-sm text-stone-400">AI-Powered Game Master</p>

        <Suspense fallback={<div className="rounded-lg border border-stone-800 bg-stone-950/90 p-6 text-center text-stone-500">Loading…</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
