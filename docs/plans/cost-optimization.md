# Plan: Cost Optimization

Reduce per-turn API costs and establish predictable pricing for users at scale.

---

## Problem Statement

At current pricing (Sonnet 4, no caching), each gameplay turn costs **$0.06–$0.09**. A 2-hour session (~40 turns) costs **$2.40–$3.60**. A weekly player costs **$10–$15/month** in API fees alone.

The system prompt (~12,000–18,000 input tokens) is largely identical every turn but charged at full price each time. Dynamic state (GM notes, world state, session summaries, adventure briefs) can grow unboundedly over a long campaign. There is no mechanism to cap or compress these sections.

---

## Current Cost Breakdown (per turn, Sonnet 4)

| Source | Tokens (est.) | Cost/turn | Changes between turns? |
|--------|--------------|-----------|----------------------|
| Session frame (static instructions) | ~5,000 | $0.015 | Never |
| Always-loaded rules (7 files, ~25KB) | ~6,500 | $0.020 | Never |
| Conditional rules (exploring, etc.) | ~2,000–5,000 | $0.006–$0.015 | Rarely (context flags) |
| Character block | ~300–500 | $0.001 | After state changes |
| World state block | ~200–1,000 | $0.001–$0.003 | After state changes |
| Companion blocks + rules | ~500–2,000 | $0.002–$0.006 | After companion changes |
| Session summaries (up to 5) | ~500–2,000 | $0.002–$0.006 | Between sessions only |
| Adventure module brief | ~500–2,000 | $0.002–$0.006 | Never (within campaign) |
| GM notes | ~100–500 | $0.001 | Occasionally |
| GM persona | ~50–100 | $0.0002 | Never |
| Message history (up to 20) | ~3,000–8,000 | $0.009–$0.024 | Every turn |
| **Total input** | **~15,000–26,000** | **$0.045–$0.078** | |
| AI response (output) | ~500–2,000 | $0.008–$0.030 | Every turn |
| **Total per turn** | | **$0.053–$0.108** | |

---

## Phase 1: Prompt Caching (Highest ROI, ~50–60% input cost reduction)

### What it is

Anthropic's prompt caching lets you mark content blocks as cacheable. On the first request, you pay 1.25x base price to write the cache. On subsequent requests with the same prefix, you pay only 0.1x base price to read from cache. Cache lasts 5 minutes (refreshed on each use).

For Sonnet 4: base input = $3/MTok, cache write = $3.75/MTok, **cache read = $0.30/MTok** (90% savings).

### Why it's the biggest win

The session frame + always-loaded rules + conditional rules are ~10,000–14,000 tokens that are identical across every turn in a session. Currently billed at $3/MTok each turn. With caching, turn 1 pays $3.75/MTok (write), turns 2–40 pay $0.30/MTok (read).

**Example: 40-turn session, 12,000 cached tokens**
- Without caching: 40 × 12,000 × $3/MTok = **$1.44**
- With caching: 1 × 12,000 × $3.75/MTok + 39 × 12,000 × $0.30/MTok = $0.045 + $0.140 = **$0.19**
- **Savings: $1.25 per session (87% reduction on cached portion)**

### Implementation

**Minimum cacheable tokens:** 1,024 for Sonnet 4 (easily met — our static content is ~10,000+ tokens).

**Current code** (`src/lib/ai/client.ts`):
```ts
// system prompt is a plain string
const stream = anthropic.messages.stream({
  model: MODEL,
  max_tokens: MAX_TOKENS,
  system: systemPrompt,  // ← single string, no caching
  messages: [...],
});
```

**New approach — explicit cache breakpoints:**

The Anthropic SDK accepts the `system` parameter as an array of content blocks, each with optional `cache_control`. We split the system prompt into layers ordered from most-stable to least-stable:

```
┌─────────────────────────────────┐
│  Layer 1: Static GM instructions │  ← cache_control breakpoint 1
│  (session frame text, ~5K tok)   │
├─────────────────────────────────┤
│  Layer 2: Rules                  │  ← cache_control breakpoint 2
│  (always-load + conditional,     │
│   ~8K–12K tok)                   │
├─────────────────────────────────┤
│  Layer 3: Dynamic state          │  (no cache — changes each turn)
│  (character, world, companions,  │
│   summaries, adventure, GM notes)│
└─────────────────────────────────┘
```

The cache hierarchy is prefix-based: if Layer 1 + Layer 2 match a previous request, both are served from cache. Layer 3 is always fresh input tokens.

Additionally, use **automatic caching** (`cache_control` at the top level) to cache the growing message history. Each new turn, the system reads previous messages from cache and only writes the new assistant + user messages.

### Files to change

1. **`src/lib/ai/client.ts`** — Change `streamChat` and `createStreamingResponse` signatures:
   - Accept `system` as `string | Anthropic.Messages.TextBlockParam[]` (array of content blocks)
   - Pass through to the SDK, which handles cache_control natively
   - Add top-level `cache_control: { type: "ephemeral" }` for automatic message caching

2. **`src/lib/ai/prompts/session.ts`** — Refactor `buildSessionPrompt` to return a structured object instead of a flat string:
   ```ts
   interface StructuredPrompt {
     /** Static GM instructions — identical every turn, cacheable */
     staticFrame: string;
     /** Rules text — changes only when context flags change */
     rules: string;
     /** Dynamic state — character, world, companions, summaries, etc. */
     dynamicState: string;
   }
   ```
   The route handler assembles these into content blocks with appropriate `cache_control`.

3. **`src/app/api/chat/route.ts`** — Assemble content blocks from the structured prompt:
   ```ts
   const prompt = buildSessionPrompt({ ... });
   const systemBlocks = [
     { type: "text", text: prompt.staticFrame, cache_control: { type: "ephemeral" } },
     { type: "text", text: prompt.rules, cache_control: { type: "ephemeral" } },
     { type: "text", text: prompt.dynamicState },
   ];
   const stream = createStreamingResponse(systemBlocks, trimmedMessages, ...);
   ```

4. **`src/lib/ai/prompts/initializer.ts`** — Character creation prompt is a single static string (~6,000 tokens). Wrap it as a single cached block. This prompt is identical for every character creation across all users, so it benefits heavily from caching.

5. **Token tracking** — Update `StreamResult` to include `cacheCreationInputTokens` and `cacheReadInputTokens` from the API response. Update the DB accumulation in the chat route to track these. Update the cost constants in `config.ts`:
   ```ts
   ANTHROPIC_CACHE_WRITE_COST_PER_TOKEN = $3.75 / 1_000_000  // 1.25x base
   ANTHROPIC_CACHE_READ_COST_PER_TOKEN  = $0.30 / 1_000_000  // 0.1x base
   ```

### Estimated impact

| Scenario | Before | After | Savings |
|----------|--------|-------|---------|
| Typical turn (exploring) | $0.07 | $0.03 | 57% |
| Combat turn | $0.09 | $0.04 | 56% |
| 40-turn session | $3.00 | $1.30 | 57% |
| Weekly player (monthly) | $12.00 | $5.20 | 57% |

---

## Phase 2: Cap and Compress Dynamic State

### Problem

Dynamic state sections grow unboundedly over a long campaign:
- **GM notes**: No enforced size limit (prompt says "under 300 words" but AI doesn't always comply)
- **World state**: NPCs, quests, visited locations accumulate indefinitely
- **Session summaries**: Up to 5 loaded, each could be 200+ words
- **Adventure module brief**: Full module text (~1,000–2,000 tokens) injected every turn even after the player has explored most of it

### Changes

#### 2a. Server-side GM notes truncation
- **File**: `src/lib/ai/prompts/session.ts`
- Truncate `campaign.gmNotes` to 1,500 characters (~375 words) before injection
- Simple `gmNotes.slice(0, 1500)` — the AI is already told to keep it under 300 words, this is just a safety net

#### 2b. Session summary limit
- **File**: `src/lib/ai/prompts/session.ts`
- Reduce from 5 to 3 most recent summaries
- The AI already has GM notes for long-term arc tracking; summaries are for short-term continuity

#### 2c. World state compression
- **File**: `src/lib/ai/prompts/session.ts`
- Cap NPCs at 10 most recently mentioned (sort by last interaction, drop oldest)
- Cap quests at active only (filter out `status: "completed"`)
- Cap visited locations at 15 most recent
- These require minor changes to `buildWorldBlock()`

#### 2d. Adventure brief condensation
- **File**: `src/lib/ai/prompts/session.ts`
- After the first 5 turns of a module campaign, switch to a condensed adventure brief (title + hook + current location details only, omitting already-explored locations)
- Requires passing turn count or explored locations into `buildAdventureBlock()`

### Estimated impact

Caps the dynamic state to a predictable ~3,000–4,000 tokens regardless of campaign length, preventing the worst-case scenario of 8,000+ dynamic tokens in a long campaign.

---

## Phase 3: Haiku for Low-Stakes Turns

### Concept

Not every turn requires Sonnet-quality reasoning. Character creation follows a rigid script. Routine exploration (walking, shopping, talking to friendly NPCs) is straightforward narration. Combat and plot-critical moments need Sonnet's stronger planning.

Haiku 4.5 pricing: $1/$5 per MTok (67% cheaper than Sonnet's $3/$15). Haiku also supports prompt caching ($0.10/MTok cache reads).

### Routing logic

Add a `model` selection step in `src/app/api/chat/route.ts` based on mode and context:

| Mode / Context | Model | Rationale |
|---------------|-------|-----------|
| `mode: "create"` | Haiku 4.5 | Follows rigid 9-step script |
| `mode: "gm-create"` | Haiku 4.5 | Brief character interview |
| `mode: "adventure-create"` | Haiku 4.5 | Brief character interview |
| Gameplay — `inCombat: true` | Sonnet 4 | Complex multi-entity state tracking |
| Gameplay — `levelingUp: true` | Sonnet 4 | Rules-heavy, must be precise |
| Gameplay — default (exploring, shopping, social) | **Test both** | Start with Sonnet, A/B test Haiku |

### Implementation

1. **`src/lib/ai/client.ts`** — Accept `model` parameter in `streamChat` instead of using the hardcoded `MODEL` constant
2. **`src/app/api/chat/route.ts`** — Add model selection logic after context detection
3. **`src/lib/config.ts`** — Add per-model pricing constants

### Risk

Narrative quality may suffer for some players. Mitigation: test Haiku on character creation first (most structured, lowest risk), then evaluate before expanding to gameplay.

### Implementation note

Use Opus for planning this phase — the routing logic involves product-level judgment about which turns are "low-stakes enough" for Haiku vs. which need Sonnet's stronger reasoning. The actual code changes are straightforward once the routing rules are decided.

### Estimated impact

If character creation uses Haiku (typical 8–12 turns): saves ~$0.30–$0.50 per character creation.

If routine exploration uses Haiku (~60% of gameplay turns in a typical session): saves an additional ~30% on those turns.

---

## Phase 4: User Pricing Model

### Recommended: Turn-based credits

Turns are the unit that directly maps to our costs. Time does not — a player thinking for 10 minutes between turns costs us nothing. A player rapid-firing 40 turns in 30 minutes costs the same as 40 turns over 4 hours.

### Pricing tiers

| Tier | Turns/month | Price | Our cost (with caching) | Margin |
|------|------------|-------|------------------------|--------|
| Free trial | 20 turns | $0 | ~$0.60 | Loss leader |
| Adventurer | 200 turns | $5/month | ~$6.00 | ~breakeven |
| Hero | 500 turns | $10/month | ~$15.00 | ~breakeven |
| BYOK (own key) | Unlimited | $0 | $0 | Pure margin |

Note: at current Sonnet pricing without caching, 200 turns costs us ~$14. **Prompt caching is prerequisite to viable subscription pricing.** With caching, 200 turns drops to ~$6.

### Alternative: Per-session pricing
- $1 per session (capped at 60 turns)
- Simple to understand, aligns with tabletop "sit down and play" mental model
- 4 sessions/month = $4 (comparable to Adventurer tier)

### Implementation considerations
- Turn counting already exists (`serverKeyTurnsUsed` in users table)
- Need to add a monthly reset mechanism (cron or check-on-use with `turnResetDate`)
- Stripe integration for payment processing
- Account page needs a usage dashboard showing turns used / remaining

---

## Phase 5: Track Cache Performance and Optimize

### Observability

After implementing caching, we need data to verify savings and identify further opportunities.

1. **Extend token tracking in DB** — Add columns to users table:
   - `totalCacheWriteTokens` (cumulative cache write tokens)
   - `totalCacheReadTokens` (cumulative cache read tokens)

2. **Per-request logging** — Log cache hit rate per request (cache_read / total_input) to identify turns where caching isn't working (e.g., context flag changes causing rules changes)

3. **Admin dashboard** — Show aggregate stats:
   - Average cache hit rate across all users
   - Cost per turn (actual, from token data)
   - Cost per user per month
   - Breakdown by mode (create vs. play)

### Optimization based on data

Once we have cache hit data:
- If rules changes cause frequent cache misses, consider loading ALL rules every turn (the cache hit savings may outweigh the extra tokens)
- If adventure briefs cause cache misses for module campaigns, move them into the dynamic state block
- If message window changes cause automatic cache misses, consider whether the 20-message window is optimal

---

## Implementation Order

| Priority | Phase | Effort | Impact | Status |
|----------|-------|--------|--------|--------|
| 1 | **Phase 1: Prompt caching** | Medium (1 session) | ~57% input cost reduction | ✅ Done |
| 2 | **Phase 2: Cap dynamic state** | Small (1 session) | Prevents unbounded growth | ✅ Done (minus 2d) |
| 3 | **Phase 5: Cache observability** | Small (same session as Phase 1) | Data for future decisions | ✅ Done |
| 4 | **Phase 3: Haiku routing** | Medium (1–2 sessions) | Additional ~20–30% on some turns | ✅ Done (creation only) |
| 5 | **Phase 4: User pricing** | Large (2–3 sessions) | Revenue model | Pending |

**Phase 1 is the critical path.** It's prerequisite for viable subscription pricing and delivers the largest single cost reduction. Phases 2 and 5 are small additions that should ship alongside Phase 1.

### Implementation Notes (Session 14)

**Phase 1 implemented:**
- `buildSessionPrompt` now returns `StructuredPrompt { staticFrame, rules, dynamicState }`
- `STATIC_GM_FRAME` is a module-level constant (~5,000 tokens) — identical every turn across all sessions
- Route assembles three content blocks: Layer 1 (staticFrame, cached), Layer 2 (rules, cached), Layer 3 (dynamicState, uncached)
- Create-mode prompts (character creation, adventure-create, gm-create) each wrapped as single cached block
- `client.ts` accepts `SystemContent = string | SystemBlock[]` throughout
- `StreamResult` now includes `cacheCreationInputTokens` and `cacheReadInputTokens`
- TOKENS sentinel updated to include `cacheWrite` and `cacheRead` fields

**Phase 2 implemented (minus 2d):**
- 2a: GM notes truncated to 1,500 chars in `buildSessionPrompt` before injection
- 2b: Session summaries capped to 3 most recent (`slice(-3)`)
- 2c: NPCs capped at 10 most recent, locations capped at 15 most recent, completed quests filtered out

**Phase 5 implemented:**
- `total_cache_write_tokens` and `total_cache_read_tokens` columns added to users table
- Migration: `migrations/0012_cache_tokens.sql`
- `schema.sql` updated as canonical restore reference
- Both columns accumulated in the `onComplete` callback in `route.ts`

**Phase 3 implemented (creation modes only):**
- `MODEL_SONNET` and `MODEL_HAIKU` constants centralized in `config.ts`
- Haiku pricing constants added to `config.ts`
- `client.ts` accepts `model` parameter (defaults to Sonnet) on `streamChat` and `createStreamingResponse`
- `route.ts` routes: `mode === "play"` → Sonnet, all creation modes (`create`, `adventure-create`, `gm-create`) → Haiku
- `summarize/route.ts` uses shared `MODEL_HAIKU` constant (was local)
- Haiku quality verified on full character creation flow — works well for the rigid scripted steps
- Fixed: Haiku sometimes emits talents as `{name, description}` objects instead of strings — added normalization in `state-parser.ts` and defensive rendering in `CharacterSheet.tsx`
- Gameplay routing to Haiku (exploring/shopping) deferred pending further quality evaluation

**Additional work (Sessions 16–17):**
- Character creation turns no longer count toward free trial limit (`incrementTurnCounter = false` for non-play modes)
- Player exploit mitigation: `[SYSTEM]` injection stripped from user messages in `route.ts`
- Existing character names injected into creation prompt to avoid duplicate suggestions
- Own-key cache tokens tracked separately (`ownKeyCacheWriteTokens`, `ownKeyCacheReadTokens`) for accurate per-user cost display
- `calcCost()` utility in `config.ts` includes all four token types (input, output, cache write, cache read)
- Per-session cost display added to `SessionControls` UI

**Deferred:**
- Phase 2d (adventure brief condensation after 5 turns) — requires tracking explored locations; deferred
- Phase 3 expansion (Haiku for routine gameplay) — creation quality verified; gameplay routing deferred for separate evaluation
- Phase 4 (user pricing) — pricing math needs revisiting; BYOK remains the viable near-term model
- **Rules layer invalidation (investigate):** Extended caching trials show context-flag changes (e.g., entering/leaving combat) invalidate Layer 2 (rules, ~10–15K tokens) and trigger a re-write. Investigate whether always loading all rules every turn produces better cache economics than selective loading — the 90% savings on a stable 15K-token rules block may outweigh the extra uncached tokens on turns where fewer rules would have been loaded.

---

## Real-World Measurements

### Trial 1: Post-optimization (local, dev), 20 turns

| Metric | Value |
|--------|-------|
| Turns | 20 |
| Total input tokens | 79,000 |
| Total output tokens | 13,000 |
| Actual cost | **$1.226** |
| Cost per turn | ~$0.061 |

**Notes:**
- Short sessions are cache-write-heavy: the first turn pays 1.25x to write all three layers (static frame ~5K, rules ~8–12K, dynamic ~3–4K). Cache reads kick in from turn 2 onward.
- Over 20 turns, estimated cache write cost is front-loaded in turns 1–2; turns 3–20 benefit from reads at $0.30/MTok.
- $0.061/turn is already below the pre-optimization estimate of $0.07–$0.09/turn, despite this being a short session where cache warmup represents a larger fraction of cost.
- Savings compound significantly over longer sessions (40–60 turns) as more turns hit the cache.

### Trial 2: Pre-optimization (prod), 20 turns — PENDING

Run a 20-turn session on the unoptimized production branch and record the same metrics for a direct comparison. Expected baseline: ~$1.40–$1.80 ($0.07–$0.09/turn, no caching).

---

## Summary: Projected Cost at Scale (per active user per month)

Assumes 4 sessions/month, 40 turns/session = 160 turns/month.

| Optimization | Monthly cost/user |
|-------------|------------------|
| Current (Sonnet, no caching) | $11.20 |
| + Phase 1 (prompt caching) | $4.80 |
| + Phase 2 (cap dynamic state) | $4.20 |
| + Phase 3 (Haiku for creation) | $3.80 |
| + Phase 3 (Haiku for routine play) | $2.80 |
