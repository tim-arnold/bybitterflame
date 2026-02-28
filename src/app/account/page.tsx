"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SERVER_KEY_TURN_LIMIT } from "@/lib/config";

export default function AccountPage() {
  const [hasKey, setHasKey] = useState(false);
  const [maskedKey, setMaskedKey] = useState<string | null>(null);
  const [turnsUsed, setTurnsUsed] = useState(0);
  const [inputKey, setInputKey] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/api-key")
      .then((r) => r.json())
      .then((data) => {
        setHasKey(data.hasKey);
        setMaskedKey(data.maskedKey);
        setTurnsUsed(data.turnsUsed ?? 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSave() {
    setError(null);
    setSuccess(false);

    const key = inputKey.trim();
    if (key && !key.startsWith("sk-ant-")) {
      setError("Key must start with sk-ant-");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/user/api-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: key }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to save");
      } else {
        setHasKey(!!data.maskedKey);
        setMaskedKey(data.maskedKey);
        setInputKey("");
        setIsEditing(false);
        setSuccess(true);
      }
    } catch {
      setError("Network error — try again");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    setError(null);
    setSuccess(false);
    setSaving(true);
    try {
      const res = await fetch("/api/user/api-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: "" }),
      });
      if (res.ok) {
        setHasKey(false);
        setMaskedKey(null);
        setIsEditing(false);
        setSuccess(true);
      }
    } catch {
      setError("Network error — try again");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center">
      <div className="absolute inset-0 bg-[url('/cover.webp')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-stone-950/85" />

      <div className="relative z-10 w-full max-w-sm px-4">
        <div className="mb-6">
          <Link
            href="/"
            className="text-xs text-stone-400 hover:text-stone-300 transition-colors"
          >
            ← Back
          </Link>
        </div>

        <h1 className="mb-1 text-center text-3xl font-bold tracking-tight text-[var(--color-gold)]">
          ShadowDork
        </h1>
        <p className="mb-8 text-center text-sm text-stone-400">Account Settings</p>

        <div className="rounded-lg border border-stone-800 bg-stone-950/90 p-6 flex flex-col gap-6">
          {/* API Key section */}
          <div>
            <h2 className="mb-1 text-sm font-semibold text-stone-200">Your API Key</h2>
            <p className="mb-4 text-xs text-stone-500">
              Anthropic API key used for all AI gameplay.{" "}
              <a
                href="https://console.anthropic.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-400 hover:text-stone-200 underline underline-offset-2"
              >
                Get yours at console.anthropic.com
              </a>
            </p>

            {loading ? (
              <div className="text-xs text-stone-600">Loading…</div>
            ) : hasKey && !isEditing ? (
              <div className="flex items-center gap-2">
                <span className="flex-1 rounded border border-stone-700 bg-stone-900 px-3 py-2 text-sm text-stone-400 font-mono truncate">
                  {maskedKey}
                </span>
                <button
                  onClick={() => setIsEditing(true)}
                  disabled={saving}
                  className="rounded border border-stone-600 px-3 py-2 text-xs text-stone-400 hover:border-stone-400 hover:text-stone-200 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Change
                </button>
                <button
                  onClick={handleRemove}
                  disabled={saving}
                  className="rounded border border-red-900 px-3 py-2 text-xs text-red-500 hover:border-red-600 hover:text-red-300 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="sk-ant-api03-..."
                  className="w-full rounded border border-stone-700 bg-stone-900 px-3 py-2 text-sm text-stone-100 placeholder-stone-600 font-mono focus:border-stone-500 focus:outline-none"
                  autoComplete="off"
                  spellCheck={false}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving || !inputKey.trim()}
                    className="flex-1 rounded border border-[var(--color-gold)] bg-transparent px-4 py-2 text-sm font-semibold text-[var(--color-gold)] transition-colors hover:bg-[var(--color-gold)] hover:text-stone-950 disabled:opacity-50 cursor-pointer"
                  >
                    {saving ? "Saving…" : "Save Key"}
                  </button>
                  {isEditing && (
                    <button
                      onClick={() => { setIsEditing(false); setInputKey(""); setError(null); }}
                      disabled={saving}
                      className="rounded border border-stone-700 px-4 py-2 text-sm text-stone-500 hover:text-stone-300 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            )}

            {error && (
              <p className="mt-3 rounded border border-red-900 bg-red-950/50 px-3 py-2 text-xs text-red-400">
                {error}
              </p>
            )}
            {success && (
              <p className="mt-3 text-xs text-green-500">Saved.</p>
            )}
          </div>

          {/* Turn counter — only shown when using server key */}
          {!hasKey && (
            <div className="border-t border-stone-800 pt-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-stone-500">Free turns used</span>
                <span className="text-xs font-mono text-stone-400">
                  {turnsUsed} / {SERVER_KEY_TURN_LIMIT}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-stone-800">
                <div
                  className="h-1.5 rounded-full bg-[var(--color-gold)] transition-all"
                  style={{ width: `${Math.min(100, (turnsUsed / SERVER_KEY_TURN_LIMIT) * 100)}%` }}
                />
              </div>
              {turnsUsed >= SERVER_KEY_TURN_LIMIT && (
                <p className="mt-2 text-xs text-amber-500">
                  Free turns exhausted. Add your own API key above to continue playing.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
