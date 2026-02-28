"use client";

import { useState, useEffect } from "react";
import { SERVER_KEY_TURN_LIMIT, ANTHROPIC_INPUT_COST_PER_TOKEN, ANTHROPIC_OUTPUT_COST_PER_TOKEN } from "@/lib/config";

export function SettingsContent() {
  const [hasKey, setHasKey] = useState(false);
  const [maskedKey, setMaskedKey] = useState<string | null>(null);
  const [turnsUsed, setTurnsUsed] = useState(0);
  const [totalInputTokens, setTotalInputTokens] = useState(0);
  const [totalOutputTokens, setTotalOutputTokens] = useState(0);
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
        setTotalInputTokens(data.totalInputTokens ?? 0);
        setTotalOutputTokens(data.totalOutputTokens ?? 0);
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
    <div className="flex flex-col gap-6">
      {/* API Key section */}
      <div>
        <h2 className="mb-1 text-sm font-semibold text-stone-200">Your API Key</h2>
        <p className="mb-4 text-xs text-stone-400">
          Anthropic API key used for all AI gameplay.{" "}
          <a
            href="https://console.anthropic.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-300 hover:text-white underline underline-offset-2"
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
                  className="rounded border border-stone-700 px-4 py-2 text-sm text-stone-400 hover:text-stone-200 transition-colors cursor-pointer disabled:opacity-50"
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

      {/* Turn counter */}
      {!hasKey && (
        <div className="border-t border-stone-800 pt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-stone-400">Free turns used</span>
            <span className="text-xs font-mono text-stone-300">
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

      {/* Token usage */}
      {(totalInputTokens > 0 || totalOutputTokens > 0) && (
        <div className="border-t border-stone-800 pt-4">
          <h2 className="mb-3 text-sm font-semibold text-stone-200">Your token usage</h2>
          <div className="flex flex-col gap-1.5 mb-3">
            <div className="flex justify-between text-xs">
              <span className="text-stone-400">Input tokens</span>
              <span className="font-mono text-stone-300">{totalInputTokens.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-stone-400">Output tokens</span>
              <span className="font-mono text-stone-300">{totalOutputTokens.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs border-t border-stone-800 pt-1.5 mt-0.5">
              <span className="text-stone-400">Est. cost (own key)</span>
              <span className="font-mono text-[var(--color-gold)]">
                ${(
                  totalInputTokens * ANTHROPIC_INPUT_COST_PER_TOKEN +
                  totalOutputTokens * ANTHROPIC_OUTPUT_COST_PER_TOKEN
                ).toFixed(4)}
              </span>
            </div>
          </div>
          <p className="text-xs text-stone-600">
            Estimate only — based on claude-sonnet-4 list pricing. Actual charges may differ.
          </p>
        </div>
      )}

      {/* Cost explainer */}
      <div className="border-t border-stone-800 pt-4 flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-stone-200">How costs work</h2>
        <p className="text-xs text-stone-400 leading-relaxed">
          Every turn sends your action plus the full game context — character sheet, active
          rules, session history, GM persona — to the API. A typical session of 20–30 turns
          costs roughly <span className="text-stone-300">$0.50–$2.00</span>, depending on
          context size.
        </p>
        <p className="text-xs text-stone-400 leading-relaxed">
          When using your own key,{" "}
          <span className="text-stone-300">you are responsible for all charges.</span> Set
          spend limits and see exact charges at{" "}
          <a
            href="https://platform.claude.com/settings/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-300 hover:text-white underline underline-offset-2"
          >
            platform.claude.com/settings/keys
          </a>
          .
        </p>
      </div>
    </div>
  );
}
