"use client";

import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react";

export interface TorchTimerHandle {
  /** Returns current seconds remaining, or null if no torch is lit. */
  getSecondsLeft: () => number | null;
}

interface TorchTimerProps {
  /** Remaining seconds from worldState — source of truth on load/resume. */
  torchRemainingSeconds?: number;
  /** Called when torch is lit (seconds > 0) or goes out (null). */
  onTorchChange?: (remainingSeconds: number | null) => void;
  /** Called when the torch burns out naturally. */
  onExpire?: () => void;
}

const TORCH_DURATION_SECS = 60 * 60; // 60 minutes

export const TorchTimer = forwardRef<TorchTimerHandle, TorchTimerProps>(
  function TorchTimer({ torchRemainingSeconds, onTorchChange, onExpire }, ref) {
    const [secondsLeft, setSecondsLeft] = useState<number | null>(() =>
      torchRemainingSeconds && torchRemainingSeconds > 0 ? torchRemainingSeconds : null
    );

    // Expose current value to parent without triggering re-renders.
    useImperativeHandle(ref, () => ({
      getSecondsLeft: () => secondsLeft,
    }), [secondsLeft]);

    // Sync when worldState loads (prop arrives after initial render).
    useEffect(() => {
      if (torchRemainingSeconds && torchRemainingSeconds > 0) {
        setSecondsLeft(torchRemainingSeconds);
      } else if (!torchRemainingSeconds) {
        setSecondsLeft(null);
      }
    }, [torchRemainingSeconds]);

    // Countdown tick.
    useEffect(() => {
      if (secondsLeft === null || secondsLeft <= 0) return;
      const interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev === null || prev <= 1) return 0;
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }, [secondsLeft !== null && secondsLeft > 0]); // eslint-disable-line react-hooks/exhaustive-deps

    // Detect natural expiry.
    useEffect(() => {
      if (secondsLeft === 0) {
        setSecondsLeft(null);
        onExpire?.();
      }
    }, [secondsLeft]); // eslint-disable-line react-hooks/exhaustive-deps

    function lightTorch() {
      setSecondsLeft(TORCH_DURATION_SECS);
      onTorchChange?.(TORCH_DURATION_SECS);
    }

    function extinguish() {
      setSecondsLeft(null);
      onTorchChange?.(null);
    }

    const isActive = secondsLeft !== null && secondsLeft > 0;
    const pct = isActive ? (secondsLeft! / TORCH_DURATION_SECS) * 100 : 0;
    const minutes = isActive ? Math.floor(secondsLeft! / 60) : 0;
    const seconds = isActive ? secondsLeft! % 60 : 0;

    let urgency = "text-[var(--color-gold)]";
    if (pct <= 10) urgency = "text-red-500 animate-pulse";
    else if (pct <= 25) urgency = "text-red-400";
    else if (pct <= 50) urgency = "text-yellow-500";

    return (
      <div className="bg-stone-900 border border-stone-700 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs uppercase tracking-wider text-stone-500">Torch</h3>
          {isActive ? (
            <button
              onClick={extinguish}
              className="text-xs text-stone-500 hover:text-red-400 transition-colors"
            >
              Extinguish
            </button>
          ) : (
            <button
              onClick={lightTorch}
              className="text-xs text-[var(--color-gold-dim)] hover:text-[var(--color-gold)] transition-colors"
            >
              Light torch
            </button>
          )}
        </div>

        {isActive ? (
          <>
            <div className={`text-center text-2xl font-mono font-bold ${urgency}`}>
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </div>
            <div className="w-full h-1.5 bg-stone-800 rounded-full mt-2">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  pct <= 10 ? "bg-red-600" : pct <= 25 ? "bg-red-500" : pct <= 50 ? "bg-yellow-600" : "bg-[var(--color-gold)]"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </>
        ) : (
          <div className="text-center text-stone-600 text-sm py-2">No torch lit</div>
        )}
      </div>
    );
  }
);
