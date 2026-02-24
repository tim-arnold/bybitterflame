"use client";

import { useState, useEffect, useCallback } from "react";

interface TorchTimerProps {
  onExpire?: () => void;
  campaignId?: string;
}

const TORCH_DURATION = 60 * 60; // 60 minutes in seconds

function getStorageKey(campaignId?: string) {
  return `torch-timer-${campaignId || "default"}`;
}

export function TorchTimer({ onExpire, campaignId }: TorchTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const key = getStorageKey(campaignId);
    const saved = localStorage.getItem(key);
    if (saved) {
      const data = JSON.parse(saved);
      if (data.isActive && data.expiresAt) {
        const remaining = Math.max(0, Math.floor((data.expiresAt - Date.now()) / 1000));
        if (remaining > 0) {
          setSecondsLeft(remaining);
          setIsActive(true);
        } else {
          localStorage.removeItem(key);
        }
      }
    }
  }, [campaignId]);

  // Persist to localStorage
  const persist = useCallback(
    (active: boolean, seconds: number | null) => {
      const key = getStorageKey(campaignId);
      if (active && seconds !== null && seconds > 0) {
        localStorage.setItem(
          key,
          JSON.stringify({ isActive: true, expiresAt: Date.now() + seconds * 1000 })
        );
      } else {
        localStorage.removeItem(key);
      }
    },
    [campaignId]
  );

  // Countdown
  useEffect(() => {
    if (!isActive || secondsLeft === null) return;

    if (secondsLeft <= 0) {
      setIsActive(false);
      persist(false, null);
      onExpire?.();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === null || prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, secondsLeft, onExpire, persist]);

  function lightTorch() {
    setSecondsLeft(TORCH_DURATION);
    setIsActive(true);
    persist(true, TORCH_DURATION);
  }

  function extinguish() {
    setSecondsLeft(null);
    setIsActive(false);
    persist(false, null);
  }

  const minutes = secondsLeft !== null ? Math.floor(secondsLeft / 60) : 0;
  const seconds = secondsLeft !== null ? secondsLeft % 60 : 0;

  const pct = secondsLeft !== null ? (secondsLeft / TORCH_DURATION) * 100 : 0;

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

      {isActive && secondsLeft !== null ? (
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
        <div className="text-center text-stone-600 text-sm py-2">
          No torch lit
        </div>
      )}
    </div>
  );
}
