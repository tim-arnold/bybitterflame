# Test Plan: Cost Optimization (Phases 1, 2, 5)

Tests for prompt caching, dynamic state caps, and cache token observability.

**Scope:** Changes in this PR
- `src/lib/ai/client.ts` — SystemContent, StreamResult, UsageResult
- `src/lib/ai/prompts/session.ts` — StructuredPrompt, Phase 2 caps
- `src/app/api/chat/route.ts` — cache block assembly, cache token tracking
- `src/lib/db/schema.ts` — new cache token columns
- `src/app/play/[campaignId]/page.tsx` — TOKENS sentinel regex fix

---

## Prerequisites

- Local dev server running (`npm run dev`)
- Local D1 migration applied: `wrangler d1 execute bitterflame --local --file=migrations/0012_cache_tokens.sql`
- Logged in as a test user
- Browser DevTools → Network tab open

---

## 1. TOKENS Sentinel Parsing

**What changed:** Sentinel now includes `cacheWrite` and `cacheRead` fields. Old regex only matched `{"in":N,"out":N}` and would silently fail. Fixed to `\{[^}]+\}`.

### 1a. Token display still updates during gameplay ✅

1. Start or resume a campaign, send a message
2. Observe the token counter in the session (wherever `sessionInputTokens` / `sessionOutputTokens` are displayed)
3. **Pass:** Counter increments after each AI response

### 1b. Streaming content has no stray TOKENS text ✅

1. Send a message, watch the streaming text as it arrives
2. **Pass:** No `TOKENS:{...}` text visible at any point during or after streaming
3. **Pass:** Final rendered message contains no sentinel artifacts

### 1c. Sentinel regex smoke test (console) ✅

1. Open browser console on the play page
2. Paste and run:
   ```js
   const sentinel = '\x00TOKENS:{"in":1234,"out":567,"cacheWrite":89,"cacheRead":1234}';
   const match = sentinel.match(/\x00TOKENS:(\{[^}]+\})/);
   console.log(match ? JSON.parse(match[1]) : 'NO MATCH');
   ```
3. **Pass:** Logs `{ in: 1234, out: 567, cacheWrite: 89, cacheRead: 1234 }`

   **Actual output:**
   ```
   {in: 1234, out: 567, cacheWrite: 89, cacheRead: 1234}
   ```

---

## 2. Prompt Caching (Phase 1)

### 2a. Cache tokens appear in API response ⚠️ Partial

1. Open Network tab, filter to `/api/chat`
2. Start a gameplay session, send two messages in quick succession (< 5 minutes apart)
3. Inspect the raw streaming response — or check the TOKENS sentinel at the end of the stream

   For the **first request** in a session:
   - **Pass:** `cacheWrite > 0` (the static frame + rules were written to cache)
   - **Pass:** `cacheRead == 0` (nothing to read yet)

   For the **second request** (same session, same context flags):
   - **Pass:** `cacheRead > 0` (cached tokens were read back)
   - **Pass:** `cacheWrite` is 0 or small (only new content written)

   > Note: Cache TTL is 5 minutes. If you wait >5 min between turns, turn 2 will be a cache write, not read.

   **Actual results:**

   | | Request 1 | Request 2 |
   |-|-----------|-----------|
   | `in` | 2,033 | 2,386 |
   | `out` | 384 | 430 |
   | `cacheWrite` | 14,366 | 15,633 |
   | `cacheRead` | 3,076 | 3,076 |

   **Observations:**
   - `cacheRead: 3,076` is consistent across both requests — Layer 1 (static frame) is hitting cache on both turns. ✅
   - `cacheWrite` remains high on request 2 and actually *grows*, instead of dropping near zero. ❌
   - The growing `cacheWrite` strongly suggests the **messages array is also being cached** — each new turn adds new assistant + user messages, extending the cached prefix and triggering a write for the new extent.
   - This is working-as-designed for message caching (each turn extends the cached message history), but it means `cacheWrite` never approaches zero even when the system layers are cache hits.

   **Investigation needed:** Verify whether the expected pattern should be revised. For a session with a long history, cacheRead on messages should grow and offset the per-turn cacheWrite on new messages. The static 3,076 cacheRead confirms Layer 1 is working; Layer 2 (rules, ~11K tokens) may not be stabilizing because context flags differ slightly between turns.

   **Extended 11-turn trial results:**

   | Turn | `in` | `out` | `cacheWrite` | `cacheRead` | Notes |
   |------|------|-------|-------------|-------------|-------|
   | 1 | 2,794 | 251 | 15,645 | 0 | Warmup — writing both layers |
   | 2 | 3,052 | 332 | 10,537 | 3,076 | Layer 1 read from cache; Layer 2 still writing |
   | 3 | 3,406 | 377 | 0 | 15,645 | ✅ Full cache hit |
   | 4 | 3,775 | 375 | 0 | 15,645 | ✅ Full cache hit |
   | 5 | 4,132 | 372 | 0 | 13,613 | ✅ Full cache hit |
   | 6 | 4,457 | 455 | 0 | 13,613 | ✅ Full cache hit |
   | 7 | 4,872 | 425 | 10,541 | 3,076 | ⚠️ Context change — rules layer invalidated and re-written |
   | 8 | 4,915 | 444 | 0 | 13,617 | ✅ Full cache hit — recovered immediately |
   | 9 | 5,003 | 428 | 0 | 13,617 | ✅ Full cache hit |
   | 10 | 4,916 | 348 | 14,780 | 3,076 | ⚠️ Context change — rules layer invalidated again |
   | 11 | 5,021 | 353 | 0 | 13,617 | ✅ Full cache hit — recovered immediately |

   **7 out of 11 turns are full cache hits (cacheWrite: 0).**

   **Key findings:**
   - Full cache hits start at turn 3 and are the dominant pattern from there on
   - `cacheRead` of ~13–15K tokens per cached turn = Layer 1 + Layer 2 served at $0.30/MTok instead of $3/MTok (90% savings on those tokens)
   - Turns 7 and 10 are context-change turns (e.g., entering/leaving combat): the rules layer content changes, triggering a re-write. The cache recovers on the very next turn — no multi-turn penalty
   - `in` (uncached input) grows from ~2.8K → ~5K over the session, reflecting the dynamic state growing as the campaign progresses
   - Estimated per-turn cost on a full cache hit: ~$0.018–0.022 vs ~$0.055–0.070 without caching — roughly **65–70% input savings** on cached turns

   **Revised test criteria:** `cacheWrite: 0` from turn 3 onward (except on context-change turns) and `cacheRead > 10K` on cached turns is the correct passing signal. The initial expectation of `cacheRead: 0` on turn 1 was incorrect for sessions that have prior context.

### 2b. Static frame is not regenerated per-turn

Verify that the prompt structure is correct by adding a temporary `console.log` in `route.ts` and inspecting the system blocks:

1. Temporarily add after the `systemContent` assignment in the `else` branch:
   ```ts
   if (Array.isArray(systemContent)) {
     console.log('System blocks:', systemContent.map(b => ({
       chars: b.text.length,
       cached: !!b.cache_control,
     })));
   }
   ```
2. Send a gameplay message, check server logs
3. **Pass:** Three blocks logged — first two with `cached: true`, third with `cached: false`
4. **Pass:** First block (staticFrame) is the largest (~5,000+ chars) and is identical across different turns

### 2c. Create-mode is cached

1. Start a new character creation (`/create`)
2. Send the first message (accept/begin)
3. Check server logs (same console.log from 2b, or add similar logging to the create branch)
4. **Pass:** Single block with `cached: true`

### 2d. Rules layer re-caches on context change

1. During gameplay, trigger a context change (e.g., type "I attack" to set `inCombat: true`)
2. Then send a non-combat message
3. **Expected behavior:** The rules block cache is invalidated when the rules string changes (combat rules loaded vs. not). Turn 1 after entering combat shows `cacheWrite > 0` for the rules layer. This is expected — the plan notes this as the conditional rules caching trade-off.

---

## 3. Dynamic State Caps (Phase 2)

### 3a. GM notes truncation at 1,500 chars

**Setup:** Inject a long `gmNotes` value into a test campaign via D1:
```sql
UPDATE campaigns SET gm_notes = REPLACE(HEX(ZEROBLOB(800)), '00', 'X') || ' MARKER_END'
WHERE id = '<your-campaign-id>';
```
(This creates a ~1,601-char string with a marker near the end.)

1. Send a message in that campaign
2. Check that the AI's response doesn't reference the `MARKER_END` text
3. As a stronger check: add a `console.log(rawGmNotes?.length)` temporarily in `session.ts` before injection
4. **Pass:** Logged length ≤ 1,500

### 3b. Session summaries capped at 3

**Setup:** Create a campaign that has at least 4 session summaries in the DB:
```sql
UPDATE sessions SET summary = 'Summary for session ' || session_number
WHERE campaign_id = '<your-campaign-id>' AND session_number IN (1,2,3,4);
```

1. Load the campaign and send a message
2. Temporarily `console.log(sessionSummaries)` in route.ts before `buildSessionPrompt`
3. **Pass:** Array has at most 3 entries, with the most recent 3

### 3c. Active quests only — completed quests filtered

**Setup:** Add a mix of active and completed quests to a campaign's world state:
```json
{
  "quests": [
    { "name": "Find the key", "status": "completed", "description": "Already done." },
    { "name": "Defeat the boss", "status": "active", "description": "Still pending." }
  ]
}
```

1. Resume the campaign and send a message
2. **Pass:** AI does not reference or re-narrate the completed quest "Find the key"
3. Alternatively, `console.log` the `activeQuests` array in `buildWorldBlock` to confirm filtering

### 3d. NPC and location caps

**Setup:** Add 12 NPCs and 20 visited locations to a campaign's world state JSON.

1. Resume the campaign and send a message
2. Add temporary logging in `buildWorldBlock`:
   ```ts
   console.log('npcs count:', npcs.length);
   console.log('locations count:', visitedLocations.length);
   ```
3. **Pass:** `npcs.length <= 10`
4. **Pass:** `visitedLocations.length <= 15`
5. **Pass:** The capped lists contain the most recently added entries (last N in array)

---

## 4. Cache Token DB Tracking (Phase 5)

### 4a. Migration applies cleanly

```bash
# Local
wrangler d1 execute bitterflame --local --file=migrations/0012_cache_tokens.sql

# Verify columns exist
wrangler d1 execute bitterflame --local --command "PRAGMA table_info(user);" | grep cache
```

**Pass:** Output includes `total_cache_write_tokens` and `total_cache_read_tokens`

### 4b. Cache tokens accumulate in users table

1. Note current values:
   ```bash
   wrangler d1 execute bitterflame --local \
     --command "SELECT total_cache_write_tokens, total_cache_read_tokens FROM user WHERE email = 'your@email.com';"
   ```
2. Send 2–3 messages in a gameplay session
3. Re-run the query
4. **Pass:** `total_cache_write_tokens > 0` after the first request
5. **Pass:** `total_cache_read_tokens > 0` after the second request (if sent within 5 minutes)
6. **Pass:** Values only increase, never decrease

### 4c. Non-authenticated requests don't error

1. Make a chat request without being logged in (open an incognito window, don't log in, use a direct campaign URL if possible)
2. **Pass:** No 500 error from the `users.totalCacheWriteTokens` update (the DB write is gated on `userId !== null`)

---

## 5. Regression Tests

### 5a. Existing gameplay still works end-to-end

1. Start or resume a campaign
2. Send 3–4 messages covering: exploration, a dice roll, an NPC interaction
3. **Pass:** AI responds with coherent narrative that references the character's name/stats
4. **Pass:** Gamestate blocks parse correctly (character sheet updates)
5. **Pass:** No TOKENS artifacts visible in chat

### 5b. Character creation still works

1. Start a new character (`/create`)
2. Complete all steps through to character complete
3. **Pass:** Dice animations play on steps 1, 8, 9
4. **Pass:** Character sheet sidebar updates throughout
5. **Pass:** "Begin Adventure" button appears on completion
6. **Pass:** Redirect to `/play/[campaignId]` works

### 5c. GM persona still injected

1. Resume a campaign that has a `gmPersona` set
2. Send a message asking the GM their name
3. **Pass:** AI responds with the established persona name and stays in character
   (Verifies that `personaBlock` still reaches the AI in `dynamicState`)

### 5d. Companions still work

1. Resume a campaign with active companions
2. Send a message that would trigger a companion reaction
3. **Pass:** Companion responds in-character
4. **Pass:** CompanionPanel in the right sidebar shows correct HP and stats
   (Verifies that `companionRulesBlock` and `companionBlock` still reach the AI)

### 5e. Adventure module still injected

1. Resume an adventure-module campaign
2. Ask the AI "where am I?"
3. **Pass:** AI references the module's location names and hook
   (Verifies that `adventureBlock` still reaches the AI in `dynamicState`)

---

## Production Deployment Checklist

- [ ] `migrations/0012_cache_tokens.sql` applied to production D1:
  ```bash
  wrangler d1 execute bitterflame --remote --file=migrations/0012_cache_tokens.sql
  ```
- [ ] Verify new columns in production:
  ```bash
  wrangler d1 execute bitterflame --remote \
    --command "PRAGMA table_info(user);" | grep cache
  ```
- [ ] Deploy via `git push` to `main` (CI/CD handles the build + deploy)
- [ ] Send 2 messages in production and confirm `cacheRead > 0` on the second turn (check via D1 query or server logs)

---

## Known Limitations

- **Cache TTL:** Anthropic's cache lasts 5 minutes (refreshed on use). Players who think >5 min between turns pay a cache-write price on that turn instead of a cache-read. This is expected behavior.
- **Rules layer invalidation:** When context flags change (entering/leaving combat), the rules cache block changes, causing a cache write on that turn. This is expected and noted in the plan.
- **Phase 2d deferred:** Adventure brief condensation (after turn 5, omit explored locations) is not implemented — requires tracking explored locations per-session.