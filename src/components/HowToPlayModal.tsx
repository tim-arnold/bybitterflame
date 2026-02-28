"use client";

import { useState } from "react";
import { HowToPlayContent } from "@/components/HowToPlayContent";

const STORAGE_KEY = "how-to-play-dismissed";

export function shouldShowHowToPlay(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) !== "1";
}

export function HowToPlayModal({ onClose }: { onClose: () => void }) {
  const [dontShow, setDontShow] = useState(false);

  function handleClose() {
    if (dontShow) localStorage.setItem(STORAGE_KEY, "1");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/90 backdrop-blur-sm p-4">
      <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col rounded-lg border border-stone-700 bg-stone-950 shadow-2xl">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-stone-800 px-6 py-4">
          <h2 className="text-lg font-bold tracking-tight text-[var(--color-gold)]">
            How to Play
          </h2>
          <p className="mt-0.5 text-xs text-stone-500">Read this before you begin</p>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <HowToPlayContent />
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-stone-800 px-6 py-4 flex items-center justify-between gap-4">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShow}
              onChange={(e) => setDontShow(e.target.checked)}
              className="h-3.5 w-3.5 accent-[var(--color-gold)] cursor-pointer"
            />
            <span className="text-xs text-stone-500">Don&apos;t show this again</span>
          </label>

          <button
            onClick={handleClose}
            className="rounded border border-[var(--color-gold)] bg-transparent px-5 py-2 text-sm font-semibold text-[var(--color-gold)] transition-colors hover:bg-[var(--color-gold)] hover:text-stone-950 cursor-pointer"
          >
            Begin Adventure
          </button>
        </div>
      </div>
    </div>
  );
}
