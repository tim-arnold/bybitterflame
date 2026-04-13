"use client";

import { useState } from "react";

interface Props {
  userId: string;
  initialBonus: number;
  turnsUsed: number;
  baseLimit: number;
}

export function GrantTurnsForm({ userId, initialBonus, turnsUsed, baseLimit }: Props) {
  const safeBonus = initialBonus ?? 0;
  const [bonus, setBonus] = useState(safeBonus);
  const [input, setInput] = useState(String(safeBonus));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveLimit = baseLimit + bonus;
  const remaining = Math.max(0, effectiveLimit - turnsUsed);

  async function handleSave() {
    const val = parseInt(input, 10);
    if (isNaN(val) || val < 0) {
      setError("Must be ≥ 0");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}/turns`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bonus: val }),
      });
      const data = (await res.json()) as { ok?: boolean; bonus?: number; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Failed");
      } else {
        setBonus(val);
      }
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs text-stone-500">
        {turnsUsed}/{effectiveLimit} used &middot; {remaining} left
      </p>
      <div className="flex items-center gap-2">
        <span className="text-xs text-stone-500">+</span>
        <input
          type="number"
          min={0}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-16 rounded border border-stone-700 bg-stone-900 px-2 py-1 font-mono text-xs text-stone-200 focus:outline-none focus:border-stone-500"
        />
        <button
          onClick={handleSave}
          disabled={busy || input === String(bonus)}
          className="text-xs text-[var(--color-gold)] hover:text-yellow-300 disabled:opacity-40 transition-colors"
        >
          {busy ? "…" : "Save"}
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
