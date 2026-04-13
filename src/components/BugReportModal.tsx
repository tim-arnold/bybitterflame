"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { authClient } from "@/lib/auth/client";
import { useFocusTrap } from "@/hooks/useFocusTrap";

export function BugReportModal({ onClose, mode = "bug" }: { onClose: () => void; mode?: "bug" | "feature" }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, true);
  const { data: session } = authClient.useSession();
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error" | "rate_limited">("idle");
  const [issueKey, setIssueKey] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<Record<string, string>>({});

  const isBug = mode === "bug";

  useEffect(() => {
    if (session?.user?.email) setEmail(session.user.email);
  }, [session]);

  useEffect(() => {
    setDebugInfo({
      URL: window.location.href,
      Browser: navigator.userAgent,
      Viewport: `${window.innerWidth}×${window.innerHeight}`,
      Timestamp: new Date().toISOString(),
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    setStatus("submitting");
    try {
      const res = await fetch("/api/bug-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: email, description, debugInfo, issueType: isBug ? "Bug" : "Story" }),
      });
      if (res.ok) {
        const data = (await res.json()) as { ok: boolean; issueKey?: string };
        setIssueKey(data.issueKey ?? null);
        setStatus("success");
      } else if (res.status === 429) {
        setStatus("rate_limited");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-950/70 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bug-report-title"
        className="relative z-10 flex max-h-[90vh] w-full max-w-xl flex-col rounded-lg border border-stone-700 bg-stone-950 shadow-2xl"
      >
        {/* Header */}
        <div className="flex-shrink-0 border-b border-stone-800 px-6 py-4 flex items-center justify-between">
          <h2 id="bug-report-title" className={`text-lg font-bold tracking-tight ${isBug ? "text-[#CFF200]" : "text-sky-400"}`}>
            {isBug ? "Report a Bug" : "Suggest a Feature"}
          </h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white transition-colors cursor-pointer text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {status === "success" ? (
            <div className="text-center py-8 space-y-3">
              <p className={`text-lg font-semibold ${isBug ? "text-[#CFF200]" : "text-sky-400"}`}>
                {isBug ? "Report filed!" : "Suggestion received!"}
              </p>
              <p className="text-stone-400 text-sm leading-relaxed">
                Thanks for helping improve <strong className="text-stone-200">By Bitter Flame</strong>.
              </p>
              <p className="text-stone-500 text-sm leading-relaxed">
                {isBug
                  ? <>If your bug makes it into a release, you&rsquo;ll be awarded <strong className="text-[var(--color-gold)]">+10 free turns</strong> as a thank-you bounty.</>
                  : <>If your idea is accepted and shipped, you&rsquo;ll be awarded <strong className="text-[var(--color-gold)]">+20 free turns</strong> as a bounty.</>
                }
              </p>
              {issueKey && (
                <p className="font-mono text-xs text-stone-600">
                  Ticket: {issueKey}
                </p>
              )}
              <button
                onClick={onClose}
                className="mt-2 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded text-sm transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-stone-400">
                {isBug
                  ? "Found something broken? Drop a note. Debug info is captured automatically."
                  : "Have an idea for something new or an improvement? I'd love to hear it."}
              </p>

              <div>
                <label htmlFor="bug-email" className="block text-xs font-medium text-stone-400 mb-1">
                  Your email <span className="text-stone-600">(optional)</span>
                </label>
                <input
                  id="bug-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded border border-stone-700 bg-stone-900 px-3 py-2 text-sm text-stone-100 placeholder-stone-600 focus:border-stone-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="bug-description" className="block text-xs font-medium text-stone-400 mb-1">
                  {isBug ? "What happened?" : "What would you like to see?"} <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="bug-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={isBug ? "Describe what went wrong and what you were doing when it happened..." : "Describe the feature or improvement you have in mind..."}
                  rows={5}
                  required
                  className="w-full rounded border border-stone-700 bg-stone-900 px-3 py-2 text-sm text-stone-100 placeholder-stone-600 focus:border-stone-500 focus:outline-none resize-none"
                />
              </div>

              {/* Debug info preview */}
              <details className="text-xs text-stone-500">
                <summary className="cursor-pointer hover:text-stone-400 transition-colors select-none">
                  Debug info (sent automatically)
                </summary>
                <div className="mt-2 rounded border border-stone-800 bg-stone-900 p-3 font-mono space-y-1">
                  {Object.entries(debugInfo).map(([k, v]) => (
                    <div key={k}>
                      <span className="text-stone-400">{k}:</span>{" "}
                      <span className="text-stone-300 break-all">{v}</span>
                    </div>
                  ))}
                </div>
              </details>

              {status === "error" && (
                <p className="text-sm text-red-400">Something went wrong. Please try again.</p>
              )}
              {status === "rate_limited" && (
                <p className="text-sm text-amber-400">You&rsquo;ve sent several reports recently. Please wait a bit before submitting another.</p>
              )}

              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={status === "submitting" || status === "rate_limited" || !description.trim()}
                  className="px-4 py-2 bg-[var(--color-gold)] text-stone-950 rounded text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  {status === "submitting" ? "Sending…" : isBug ? "Send Report" : "Send Suggestion"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}