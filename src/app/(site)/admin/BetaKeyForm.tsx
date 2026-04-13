"use client";

import { useState } from "react";

interface Props {
  endpoint: string;
  initialMasked: string | null;
  initialMode: "trial" | "full" | null;
}

export function BetaKeyForm({ endpoint, initialMasked, initialMode }: Props) {
  const [masked, setMasked] = useState<string | null>(initialMasked);
  const [mode, setMode] = useState<"trial" | "full">(initialMode ?? "trial");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function post(body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        masked?: string | null;
        mode?: "trial" | "full" | null;
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Failed");
      } else {
        if (data.masked !== undefined) setMasked(data.masked ?? null);
        if (data.mode) setMode(data.mode);
      }
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  async function handleSetKey() {
    await post({ apiKey: input.trim(), mode });
    setInput("");
  }

  async function handleClear() {
    await post({ apiKey: "" });
    setMasked(null);
    setMode("trial");
  }

  async function handleModeChange(newMode: "trial" | "full") {
    setMode(newMode);
    await post({ mode: newMode });
  }

  return (
    <div className="flex flex-col gap-1.5">
      {/* Key row */}
      {masked ? (
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-stone-400">{masked}</span>
          <button
            onClick={handleClear}
            disabled={busy}
            className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors"
          >
            {busy ? "…" : "Clear"}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="sk-ant-..."
            className="w-40 rounded border border-stone-700 bg-stone-900 px-2 py-1 font-mono text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:border-stone-500"
          />
          <button
            onClick={handleSetKey}
            disabled={busy || !input.trim()}
            className="text-xs text-[var(--color-gold)] hover:text-yellow-300 disabled:opacity-40 transition-colors"
          >
            {busy ? "…" : "Set"}
          </button>
        </div>
      )}

      {/* Mode radios — only shown when a key is set */}
      {masked && (
        <div className="flex items-center gap-3">
          {(["trial", "full"] as const).map((m) => (
            <label key={m} className="flex items-center gap-1 cursor-pointer select-none">
              <input
                type="radio"
                name={`mode-${endpoint}`}
                value={m}
                checked={mode === m}
                onChange={() => handleModeChange(m)}
                disabled={busy}
                className="accent-[var(--color-gold)]"
              />
              <span className={`text-xs ${mode === m ? "text-stone-200" : "text-stone-500"}`}>
                {m === "trial" ? "Trial" : "Full"}
              </span>
            </label>
          ))}
        </div>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
