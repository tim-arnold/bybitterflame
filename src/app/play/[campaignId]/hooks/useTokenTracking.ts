"use client";

import { useState, useEffect } from "react";

export interface TokenTrackingReturn {
  sessionInputTokens: number;
  sessionOutputTokens: number;
  sessionCacheWriteTokens: number;
  sessionCacheReadTokens: number;
  sessionHaikuInputTokens: number;
  sessionHaikuOutputTokens: number;
  sessionHaikuCacheWriteTokens: number;
  sessionHaikuCacheReadTokens: number;
  lifetimeBaseInputTokens: number;
  lifetimeBaseOutputTokens: number;
  lifetimeBaseCacheWriteTokens: number;
  lifetimeBaseCacheReadTokens: number;
  lifetimeBaseHaikuInputTokens: number;
  lifetimeBaseHaikuOutputTokens: number;
  lifetimeBaseHaikuCacheWriteTokens: number;
  lifetimeBaseHaikuCacheReadTokens: number;
  trialTurnsUsed: number | null;
  turnsLimit: number | null;
  isOnTrial: boolean;
  economyMode: boolean;
  setEconomyMode: React.Dispatch<React.SetStateAction<boolean>>;
  extractTokens: (response: string) => string;
  incrementTrialTurn: () => void;
}

/** Manages API token accounting and trial-mode turn tracking. */
export function useTokenTracking(): TokenTrackingReturn {
  const [sessionInputTokens, setSessionInputTokens] = useState(0);
  const [sessionOutputTokens, setSessionOutputTokens] = useState(0);
  const [sessionCacheWriteTokens, setSessionCacheWriteTokens] = useState(0);
  const [sessionCacheReadTokens, setSessionCacheReadTokens] = useState(0);
  const [sessionHaikuInputTokens, setSessionHaikuInputTokens] = useState(0);
  const [sessionHaikuOutputTokens, setSessionHaikuOutputTokens] = useState(0);
  const [sessionHaikuCacheWriteTokens, setSessionHaikuCacheWriteTokens] = useState(0);
  const [sessionHaikuCacheReadTokens, setSessionHaikuCacheReadTokens] = useState(0);
  const [lifetimeBaseInputTokens, setLifetimeBaseInputTokens] = useState(0);
  const [lifetimeBaseOutputTokens, setLifetimeBaseOutputTokens] = useState(0);
  const [lifetimeBaseCacheWriteTokens, setLifetimeBaseCacheWriteTokens] = useState(0);
  const [lifetimeBaseCacheReadTokens, setLifetimeBaseCacheReadTokens] = useState(0);
  const [lifetimeBaseHaikuInputTokens, setLifetimeBaseHaikuInputTokens] = useState(0);
  const [lifetimeBaseHaikuOutputTokens, setLifetimeBaseHaikuOutputTokens] = useState(0);
  const [lifetimeBaseHaikuCacheWriteTokens, setLifetimeBaseHaikuCacheWriteTokens] = useState(0);
  const [lifetimeBaseHaikuCacheReadTokens, setLifetimeBaseHaikuCacheReadTokens] = useState(0);
  const [trialTurnsUsed, setTrialTurnsUsed] = useState<number | null>(null);
  const [turnsLimit, setTurnsLimit] = useState<number | null>(null);
  const [isOnTrial, setIsOnTrial] = useState(false);
  const [economyMode, setEconomyMode] = useState(false);

  useEffect(() => {
    fetch("/api/user/api-key")
      .then((r) => r.json())
      .then(
        (data: {
          isOnTrial?: boolean;
          turnsUsed?: number;
          turnsLimit?: number;
          totalInputTokens?: number;
          totalOutputTokens?: number;
          totalCacheWriteTokens?: number;
          totalCacheReadTokens?: number;
          haikuInputTokens?: number;
          haikuOutputTokens?: number;
          haikuCacheWriteTokens?: number;
          haikuCacheReadTokens?: number;
        }) => {
          if (data.isOnTrial) {
            setIsOnTrial(true);
            setTrialTurnsUsed(data.turnsUsed ?? 0);
            setTurnsLimit(data.turnsLimit ?? null);
          }
          setLifetimeBaseInputTokens(data.totalInputTokens ?? 0);
          setLifetimeBaseOutputTokens(data.totalOutputTokens ?? 0);
          setLifetimeBaseCacheWriteTokens(data.totalCacheWriteTokens ?? 0);
          setLifetimeBaseCacheReadTokens(data.totalCacheReadTokens ?? 0);
          setLifetimeBaseHaikuInputTokens(data.haikuInputTokens ?? 0);
          setLifetimeBaseHaikuOutputTokens(data.haikuOutputTokens ?? 0);
          setLifetimeBaseHaikuCacheWriteTokens(data.haikuCacheWriteTokens ?? 0);
          setLifetimeBaseHaikuCacheReadTokens(data.haikuCacheReadTokens ?? 0);
        }
      )
      .catch(() => {});
  }, []);

  /** Strip the \x00TOKENS sentinel from a stream response and accumulate session token counts. */
  function extractTokens(response: string): string {
    const match = response.match(/\x00TOKENS:(\{[^}]+\})/);
    if (match) {
      try {
        const usage = JSON.parse(match[1]) as {
          in: number;
          out: number;
          cacheWrite?: number;
          cacheRead?: number;
          model?: string;
        };
        const isHaiku = usage.model?.includes("haiku") ?? false;
        setSessionInputTokens((prev) => prev + usage.in);
        setSessionOutputTokens((prev) => prev + usage.out);
        if (usage.cacheWrite)
          setSessionCacheWriteTokens((prev) => prev + usage.cacheWrite!);
        if (usage.cacheRead)
          setSessionCacheReadTokens((prev) => prev + usage.cacheRead!);
        if (isHaiku) {
          setSessionHaikuInputTokens((prev) => prev + usage.in);
          setSessionHaikuOutputTokens((prev) => prev + usage.out);
          if (usage.cacheWrite)
            setSessionHaikuCacheWriteTokens((prev) => prev + usage.cacheWrite!);
          if (usage.cacheRead)
            setSessionHaikuCacheReadTokens((prev) => prev + usage.cacheRead!);
        }
        if (usage.model)
          console.log(`[AI Model] ${usage.model} — ${usage.in} in / ${usage.out} out`);
      } catch {
        /* ignore parse errors */
      }
    }
    return response.replace(/\x00TOKENS:\{[^}]+\}/g, "");
  }

  function incrementTrialTurn() {
    setTrialTurnsUsed((prev) => (prev !== null ? prev + 1 : null));
  }

  return {
    sessionInputTokens,
    sessionOutputTokens,
    sessionCacheWriteTokens,
    sessionCacheReadTokens,
    sessionHaikuInputTokens,
    sessionHaikuOutputTokens,
    sessionHaikuCacheWriteTokens,
    sessionHaikuCacheReadTokens,
    lifetimeBaseInputTokens,
    lifetimeBaseOutputTokens,
    lifetimeBaseCacheWriteTokens,
    lifetimeBaseCacheReadTokens,
    lifetimeBaseHaikuInputTokens,
    lifetimeBaseHaikuOutputTokens,
    lifetimeBaseHaikuCacheWriteTokens,
    lifetimeBaseHaikuCacheReadTokens,
    trialTurnsUsed,
    turnsLimit,
    isOnTrial,
    economyMode,
    setEconomyMode,
    extractTokens,
    incrementTrialTurn,
  };
}
