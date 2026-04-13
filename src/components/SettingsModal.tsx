"use client";

import { useRef } from "react";
import { SettingsContent } from "@/components/SettingsContent";
import { useFocusTrap } from "@/hooks/useFocusTrap";

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, true);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 backdrop-blur-sm p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        className="relative flex max-h-[90vh] w-full max-w-xl flex-col rounded-lg border border-stone-700 bg-stone-950 shadow-2xl"
      >
        {/* Header */}
        <div className="flex-shrink-0 border-b border-stone-800 px-6 py-4 flex items-center justify-between">
          <h2 id="settings-title" className="text-lg font-bold tracking-tight text-[var(--color-gold)]">
            Settings
          </h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white transition-colors cursor-pointer text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <SettingsContent />
        </div>
      </div>
    </div>
  );
}
