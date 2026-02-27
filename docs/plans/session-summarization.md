# Plan: Session Summarization

Long-term memory across sessions via AI-generated summaries.
Reduces token usage on long campaigns and enables the GM to reference past events
weeks after they happened.

---

## Problem

Currently:
- Message history window: last 20 messages re-sent every turn
- No memory beyond those 20 messages
- A player who played 3 weeks ago and returns finds the GM has no memory of prior events
- The `sessions` table has a `summary` column that's never populated

---

## How It Works

### Within a Session (Rolling Compression)

After every **10 turns**, compress the oldest 10 messages into a 1–2 sentence summary
and replace them in the history. The most recent 10 messages are always kept verbatim.

```
Turn 1–10:   [full messages 1–10]
Turn 11:     [summary of turns 1–10] + [full messages 11–20]
Turn 21:     [summary of turns 1–20] + [full messages 21–30]
```

This caps history cost at ~15 messages equivalent regardless of session length.

### Between Sessions (Session Summary)

When a player manually ends a session (or after a long idle period), generate a
structured AI summary of the full session covering:
- What happened (key events, decisions, discoveries)
- Current state (location, active quests, party status)
- Notable NPCs encountered
- Unresolved threads

Stored in `sessions.summary`. Loaded into the next session's system prompt as
"Previously on your adventure…" context.

---

## Data Model

### `sessions` table (already exists)
- `summary TEXT` — already exists, currently always null
- No schema change needed for basic summarization

### What gets summarized
```ts
interface SessionSummary {
  sessionNumber: number;
  date: string;
  summary: string;        // 2–4 sentence narrative recap
  keyEvents: string[];    // bullet list: "Defeated the goblin chief"
  stateSnapshot: {        // character state at session end
    level: number;
    hp: number;
    xp: number;
    location: string;
  };
}
```

---

## New API Routes

### `POST /api/campaign/[campaignId]/summarize`
Triggers end-of-session summary generation.

1. Load last N messages from the session
2. Call Claude with a compact summarization prompt (not the full system prompt)
3. Parse response into `SessionSummary` shape
4. Write to `sessions.summary`
5. Return `{ summary }`

**Summarization prompt** (small, cheap):
```
You are summarizing a Shadowdark RPG session. Given these messages, write:
1. A 2–4 sentence narrative summary of what happened
2. A bullet list of 3–6 key events
3. The party's current location and status

Keep it concise. This will be read by the GM at the start of the next session.
```

---

## Frontend Changes

### End-of-session trigger
Options:
1. **Manual** — "End Session" button in the play UI toolbar
2. **Automatic** — triggered when player closes the tab / navigates away (unreliable)
3. **Adventure completion** — triggered by `adventureComplete` gamestate (already planned)

Recommendation: Manual button + adventure completion trigger. No auto on tab close.

### "End Session" button
Add to the right panel Tools tab (or the title bar).
On click:
1. Show confirmation: "End this session? The GM will write a summary."
2. Call `POST /api/campaign/[campaignId]/summarize`
3. Show the generated summary to the player
4. Redirect to home

### Session resume
On `/play/[campaignId]` load, inject summaries into the system prompt:
```ts
// Already scaffolded in session.ts:
const summaryBlock = sessionSummaries.length > 0
  ? `## Previous Sessions\n${sessionSummaries.map(s => `**Session ${s.n}:** ${s.summary}`).join("\n")}`
  : "";
```

Load last 3–5 session summaries (older ones can be dropped — the GM has enough context).

---

## Rolling Compression (Within-Session)

Implemented in `/api/chat/route.ts`:

```ts
// After building the message window:
if (messages.length > 20) {
  const toCompress = messages.slice(0, 10);
  const recent = messages.slice(10);
  const compressionSummary = await generateMiniSummary(toCompress);
  return [
    { role: "user", content: `[Earlier this session: ${compressionSummary}]` },
    ...recent
  ];
}
```

`generateMiniSummary` makes a small, cheap Claude call (Haiku model, no system prompt,
just "summarize these 10 messages in 1–2 sentences").

**Cost:** One extra Haiku API call per 10 turns. Haiku is ~20x cheaper than Sonnet —
the compression call costs less than sending 10 extra messages to Sonnet.

---

## Implementation Order

### Phase 1 — Between-session summaries (high value, self-contained)
1. `POST /api/campaign/[campaignId]/summarize` route
2. "End Session" button in play UI
3. Load summaries into session prompt (`summaryBlock` in `session.ts` already scaffolded)
4. Test: end session → summary generated → resume → GM references it

### Phase 2 — Adventure completion trigger
5. Wire `adventureComplete` gamestate → auto-call summarize route
6. (Ties into adventure-completion-and-character-roster.md plan)

### Phase 3 — Rolling in-session compression
7. Implement `generateMiniSummary` helper
8. Wire into `/api/chat/route.ts` message windowing
9. Adjust window from 20 → 10 recent + compressed older

---

## Token Impact

| Scenario | Before | After |
|----------|--------|-------|
| Turn 50 of a session | ~3KB history | ~2KB (compressed older turns) |
| Resume after 1 week | GM has no memory | ~500 chars summary injected |
| Resume after 5 sessions | GM has no memory | ~2KB (5 × 400 char summaries) |
| Long campaign (20 sessions) | GM has no memory | ~3KB (last 5 summaries only) |

---

## Dependencies

- Auth must be complete (sessions scoped to user) ✅
- Adventure completion feature (for auto-trigger) — see `adventure-completion-and-character-roster.md`
- Haiku model access for compression calls
