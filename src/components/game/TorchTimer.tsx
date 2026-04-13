"use client";

import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react";

export interface TorchTimerHandle {
  /** Returns current seconds remaining, or null if no torch is lit. */
  getSecondsLeft: () => number | null;
  /** Freeze the countdown (torch stays lit, timer stops ticking). */
  pause: () => void;
  /** Resume the countdown after a pause. */
  resume: () => void;
}

interface TorchTimerProps {
  /** Remaining seconds from worldState — source of truth on load/resume. */
  torchRemainingSeconds?: number;
  /** Saved seconds from a manually extinguished partial torch — persisted in worldState. */
  torchSavedSeconds?: number;
  /** Number of torches in the character's inventory. Button is disabled when 0 and no partial torch is saved. */
  torchCount?: number;
  /**
   * Called when torch is lit (seconds > 0) or goes out (null).
   * isNewTorch is true only when a fresh torch from inventory is consumed.
   * It is false when relighting a partially-used extinguished torch.
   */
  onTorchChange?: (remainingSeconds: number | null, isNewTorch?: boolean) => void;
  /** Called when savedSeconds changes so the parent can persist it to worldState. */
  onSavedSecondsChange?: (seconds: number | null) => void;
  /** Called when the torch burns out naturally. */
  onExpire?: () => void;
}

const TORCH_DURATION_SECS = 60 * 60; // 60 minutes

export const TorchTimer = forwardRef<TorchTimerHandle, TorchTimerProps>(
  function TorchTimer({ torchRemainingSeconds, torchSavedSeconds, torchCount, onTorchChange, onSavedSecondsChange, onExpire }, ref) {
    const [secondsLeft, setSecondsLeft] = useState<number | null>(() =>
      torchRemainingSeconds && torchRemainingSeconds > 0 ? torchRemainingSeconds : null
    );

    // Seconds saved when the player manually extinguishes. Seeded from worldState on load.
    const [savedSeconds, setSavedSeconds] = useState<number | null>(() =>
      torchSavedSeconds && torchSavedSeconds > 0 ? torchSavedSeconds : null
    );

    // When true the countdown is frozen (session paused) but the torch stays lit.
    const [isPaused, setIsPaused] = useState(false);

    // Flag to distinguish manual extinguish (should preserve savedSeconds) from
    // a narrative GM extinguish arriving via prop change (should clear savedSeconds).
    const isManualExtinguishRef = useRef(false);

    // Expose current value and pause/resume controls to parent.
    useImperativeHandle(ref, () => ({
      getSecondsLeft: () => secondsLeft,
      pause: () => setIsPaused(true),
      resume: () => setIsPaused(false),
    }), [secondsLeft]);

    // Sync when worldState loads or GM emits torchLit true/false.
    useEffect(() => {
      if (torchRemainingSeconds && torchRemainingSeconds > 0) {
        // GM or session resume lit a torch — start fresh, discard any saved partial.
        setSecondsLeft(torchRemainingSeconds);
        setSavedSeconds(null);
      } else if (!torchRemainingSeconds) {
        setSecondsLeft(null);
        if (!isManualExtinguishRef.current) {
          // Narrative extinguish (GM-driven, e.g. fell in water) — torch is gone.
          setSavedSeconds(null);
        }
        isManualExtinguishRef.current = false;
      }
    }, [torchRemainingSeconds]);

    // Countdown tick — stops when paused or torch is out.
    useEffect(() => {
      if (secondsLeft === null || secondsLeft <= 0 || isPaused) return;
      const interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev === null || prev <= 1) return 0;
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }, [secondsLeft !== null && secondsLeft > 0, isPaused]); // eslint-disable-line react-hooks/exhaustive-deps

    // Detect natural expiry.
    useEffect(() => {
      if (secondsLeft === 0) {
        setSecondsLeft(null);
        setSavedSeconds(null); // torch fully consumed — no relight
        onSavedSecondsChange?.(null); // clear any persisted partial torch
        onExpire?.();
      }
    }, [secondsLeft]); // eslint-disable-line react-hooks/exhaustive-deps

    function lightTorch() {
      if (savedSeconds !== null) {
        // Relight the same partially-used torch — resume from saved time.
        const resumeFrom = savedSeconds;
        setSavedSeconds(null);
        setSecondsLeft(resumeFrom);
        onTorchChange?.(resumeFrom, false); // no inventory consumed
        onSavedSecondsChange?.(null); // partial torch is now active, clear persisted save
      } else {
        // Fresh torch from inventory.
        setSecondsLeft(TORCH_DURATION_SECS);
        onTorchChange?.(TORCH_DURATION_SECS, true); // consume one torch
      }
    }

    function extinguish() {
      isManualExtinguishRef.current = true;
      setSavedSeconds(secondsLeft); // save remaining time for potential relight
      setSecondsLeft(null);
      onTorchChange?.(null);
      onSavedSecondsChange?.(secondsLeft); // persist the partial torch time
    }

    const isActive = secondsLeft !== null && secondsLeft > 0;
    const pct = isActive ? (secondsLeft! / TORCH_DURATION_SECS) * 100 : 0;
    const minutes = isActive ? Math.floor(secondsLeft! / 60) : 0;
    const seconds = isActive ? secondsLeft! % 60 : 0;

    const canLight = savedSeconds !== null || (torchCount === undefined || torchCount > 0);
    const lightLabel = savedSeconds !== null ? "Relight" : "Light torch";

    let urgency = "text-[var(--color-gold)]";
    if (pct <= 10) urgency = "text-red-500 animate-pulse";
    else if (pct <= 25) urgency = "text-red-400";
    else if (pct <= 50) urgency = "text-yellow-500";

    return (
      <div className="bg-stone-900 border border-stone-700 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs uppercase tracking-wider text-stone-400">Torch</h3>
          {isActive ? (
            <button
              onClick={extinguish}
              className="text-xs text-stone-400 hover:text-red-400 transition-colors"
            >
              Extinguish
            </button>
          ) : (
            <button
              onClick={lightTorch}
              disabled={!canLight}
              className="text-xs text-[var(--color-gold-dim)] hover:text-[var(--color-gold)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-[var(--color-gold-dim)]"
            >
              {lightLabel}
            </button>
          )}
        </div>

        {torchCount !== undefined && torchCount > 0 && (
          <div className="flex gap-1 mt-2 overflow-visible" aria-label={`${torchCount} torch${torchCount !== 1 ? "es" : ""} remaining`}>
            {Array.from({ length: torchCount }, (_, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={isActive && i === 0 ? "/torch-lit.webp" : "/torch-unlit.webp"}
                alt={isActive && i === 0 ? "Lit torch" : "Unlit torch"}
                style={{ height: "120px", width: "auto" }}
              />
            ))}
          </div>
        )}
        {isActive && (
          <>
            <div
              className={`text-center text-2xl font-mono font-bold mt-2 ${urgency}`}
              aria-label={`${minutes} minutes ${seconds} seconds remaining`}
              aria-live={pct <= 25 ? "polite" : "off"}
              aria-atomic="true"
            >
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </div>
            <div
              role="progressbar"
              aria-label="Torch remaining"
              aria-valuenow={Math.round(pct)}
              aria-valuemin={0}
              aria-valuemax={100}
              className="w-full h-1.5 bg-stone-800 rounded-full mt-2"
            >
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  pct <= 10 ? "bg-red-600" : pct <= 25 ? "bg-red-500" : pct <= 50 ? "bg-yellow-600" : "bg-[var(--color-gold)]"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </>
        )}
      </div>
    );
  }
);