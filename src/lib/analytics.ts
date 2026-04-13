type GtagEvent =
  | { name: "request_access" }
  | { name: "adventure_started"; type: "gm_decides" | "roll_own" | "module" | "standard" }
  | { name: "character_created" }
  | { name: "api_key_added" }
  | { name: "free_turns_exhausted" }
  | { name: "session_paused" }
  | { name: "adventure_completed" }
  | { name: "character_died" }
  | { name: "soul_transferred" }
  | { name: "companion_joined" };

export function trackEvent(event: GtagEvent) {
  if (typeof window === "undefined") return;
  const w = window as Window & { gtag?: (...args: unknown[]) => void };
  if (!w.gtag) return;

  const { name, ...params } = event as { name: string } & Record<string, unknown>;
  w.gtag("event", name, params);
}
