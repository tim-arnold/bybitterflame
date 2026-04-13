"use client";

import { useState } from "react";

export function EmailBlastForm({ userCount }: { userCount: number }) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; total: number; errors: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleSend() {
    setSending(true);
    setError(null);
    setResult(null);
    setShowConfirm(false);

    try {
      const res = await fetch("/api/admin/email-blast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          body,
          ctaLabel: ctaLabel || undefined,
          ctaUrl: ctaUrl || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send");
        return;
      }

      setResult(data);
    } catch {
      setError("Network error");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rounded-lg border border-stone-700 bg-stone-950/80 p-6">
      <div className="space-y-4">
        <div>
          <label className="block text-xs text-stone-500 uppercase tracking-wider mb-1.5">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            maxLength={200}
            placeholder="What's new in By Bitter Flame"
            className="w-full rounded border border-stone-700 bg-stone-900/80 px-3 py-2 text-sm text-stone-100 placeholder:text-stone-600 focus:border-stone-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs text-stone-500 uppercase tracking-wider mb-1.5">
            Body <span className="normal-case text-stone-600">(double newline = new paragraph)</span>
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={5000}
            rows={6}
            placeholder={"The dungeon has changed since you were last here.\n\nNew rules, new monsters, new ways to die. Come see what's different."}
            className="w-full rounded border border-stone-700 bg-stone-900/80 px-3 py-2 text-sm text-stone-100 placeholder:text-stone-600 focus:border-stone-500 focus:outline-none resize-y font-mono"
          />
          <p className="mt-1 text-xs text-stone-600">{body.length}/5000</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-stone-500 uppercase tracking-wider mb-1.5">
              Button label <span className="normal-case text-stone-600">(optional)</span>
            </label>
            <input
              type="text"
              value={ctaLabel}
              onChange={(e) => setCtaLabel(e.target.value)}
              placeholder="Back to the Dungeon"
              className="w-full rounded border border-stone-700 bg-stone-900/80 px-3 py-2 text-sm text-stone-100 placeholder:text-stone-600 focus:border-stone-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-stone-500 uppercase tracking-wider mb-1.5">
              Button URL <span className="normal-case text-stone-600">(optional)</span>
            </label>
            <input
              type="text"
              value={ctaUrl}
              onChange={(e) => setCtaUrl(e.target.value)}
              placeholder="https://bybitterflame.com"
              className="w-full rounded border border-stone-700 bg-stone-900/80 px-3 py-2 text-sm text-stone-100 placeholder:text-stone-600 focus:border-stone-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              disabled={!subject.trim() || !body.trim() || sending}
              className="rounded bg-amber-700 px-4 py-2 text-sm font-medium text-stone-100 hover:bg-amber-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Send to {userCount} user{userCount !== 1 ? "s" : ""}
            </button>
          ) : (
            <>
              <span className="text-sm text-amber-400">
                Send to all {userCount} user{userCount !== 1 ? "s" : ""}?
              </span>
              <button
                onClick={handleSend}
                disabled={sending}
                className="rounded bg-red-700 px-4 py-2 text-sm font-medium text-stone-100 hover:bg-red-600 transition-colors disabled:opacity-40 cursor-pointer"
              >
                {sending ? "Sending…" : "Confirm Send"}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                disabled={sending}
                className="text-sm text-stone-500 hover:text-stone-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        {result && (
          <div className="rounded border border-stone-700 bg-stone-900/60 px-4 py-3 text-sm">
            <p className="text-emerald-400">
              Sent {result.sent}/{result.total} emails
            </p>
            {result.errors.length > 0 && (
              <div className="mt-2 text-red-400 text-xs space-y-0.5">
                {result.errors.map((e, i) => <p key={i}>{e}</p>)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
