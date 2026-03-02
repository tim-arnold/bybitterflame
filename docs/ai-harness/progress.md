# Progress

Current state of the project and recent work. Read this at the start of each session.

## Current State

**Production is live at https://bytorchlight.com** (Cloudflare Workers + D1).

Full end-to-end persistence is working. Character creation, gameplay loop, autosave, session resume, companion NPCs, soul transfer, adventure modules, and session summarization all work in production.

**What works:**
- **App is rebranded to "By Torchlight"** — all UI copy, email sender (`gm@bytorchlight.com`), page title updated; domain bytorchlight.com purchased (DNS not yet switched; prod still at dark.tim52.io)
- **GA4 analytics** — G-285WWGVN6Z; `trackEvent()` utility wired to 10 events across the funnel (request_access, adventure_started, character_created, api_key_added, free_turns_exhausted, session_paused, adventure_completed, character_died, soul_transferred, companion_joined); guide at `docs/guides/ga4-events.md`
- **Shadowdark Third-Party logo** — footer of home page, links to thearcanelibrary.com
- **schema.sql** — single unified DB schema replacing drizzle/ and migrations/ directories; use `wrangler d1 execute shadowdark --remote --file=schema.sql` to restore prod
- **Lifetime token usage tracking** — `total_input_tokens` / `total_output_tokens` on users table; shown in /account
- Character creation at `/create` — full 9-step chat flow with Claude as GM
- Dice roll animations with phased narrative reveal (gamestate block → dice tumble → flavor text → Continue → scores)
- Streaming AI responses with gamestate suppression during dice rolls
- Live character sheet sidebar updates from gamestate blocks
- GM persona established during creation, stored for session reuse
- Pronoun support throughout narration and NPC dialog
- Selective rules loading based on game context
- Responsive three-column layout with mobile tabs
- **D1 database persistence** — character + campaign saved after creation, redirect to `/play/[campaignId]`
- **Autosave** — campaign state + full message history saved after every AI response
- **Session resume** — close browser, return to `/play/[campaignId]`, pick up where you left off
- **Opening scene** — auto-generated on first visit (hidden `[BEGIN ADVENTURE]` trigger)
- **Token optimization** — gamestate blocks stripped from assistant history; 20-message window with user-first guard
- Chat input auto-focuses when AI finishes responding
- **Companion NPCs** — full stat sheets, personalities, loyalty drift, death saves, hostile turn; stored in `worldState.companions`; verified in production
- **Soul transfer on death** — `playerDied` triggers DeathScreen overlay; player picks companion; inherit API creates new character; legacy talent appended; adventure continues; verified in production
- **Torch timer** — 60-minute paused countdown; UI owns the clock; GM signals intent only; darkness enforced when no torch lit; AI notified on burnout
- **Cloudflare deployment** — `wrangler deploy` → Workers runtime; D1 binding confirmed
- **Adventure modules** — Shots in the Dark #1 (18 oneshots); /adventures browser; adventure brief in session prompt; mapReveal → Map tab; GM character creation mode; pending DB migration for production
- **Auth** — BetterAuth v1.4.19 with D1 adapter; email+password sign up/in; session cookie; middleware (proxy.ts) redirects unauthenticated users; campaigns scoped to userId; UserNav pill in header; lazy singleton pattern for D1 binding
- **Token optimization** — companion rules block gated on companions.length > 0 (~1.5KB/turn); exploration.md split into light-and-darkness.md (always) + exploration-mechanics.md (conditional); spellcasting.md split into core + per-tier files T1–T5, only tiers ≤ character's max loaded (~10KB saved for low-level casters)
- **Session summarization** — "Pause Session" fires hidden GM summary message + background Haiku call that writes compact summary to `sessions.summary`; campaign GET fixed to order by sessionNumber DESC and return `sessionSummaries[]` from past sessions (last 5 with summaries); `sessionSummaries` passed to `/api/chat` and injected into system prompt via `buildSummaryBlock()`; `gmNotes` column added to campaigns table; `gmNotesUpdate` gamestate type parsed and persisted; `gmNotes` injected as GM-only section in session prompt; "Return Home" button appears after AI finishes responding to pause request; DB migration: `migrations/0008_session_summarization.sql`

**What doesn't work yet:**
- Combat tracker UI

## DB Setup

- Local D1 SQLite: `.wrangler/state/v3/d1/` (populated via `wrangler d1 migrations apply shadowdark --local`)
- Production D1: `shadowdark` DB (`aae22728-e098-4c3e-811e-aa1c73d33fbb`) in Cloudflare account
- **Source of truth: `schema.sql`** — run `wrangler d1 execute shadowdark --remote --file=schema.sql` to restore prod from scratch
- `initOpenNextCloudflareForDev()` in `next.config.ts` provides D1 binding during `npm run dev`

## Deployment

- Build: `npx @opennextjs/cloudflare build` → `.open-next/worker.js` + `.open-next/assets/`
- Deploy: `wrangler deploy` (uses `wrangler.toml` — binding `DB`, assets, `ANTHROPIC_API_KEY` secret)
- `.open-next/` is gitignored (build artifact)
- Live URL: https://bytorchlight.com (also https://shadowdark.tim-arnold.workers.dev)

## Recent Work

### Session 14 (2026-03-02)

**Cost optimization — Phases 1, 2, and 5 implemented:**

**Phase 1: Prompt caching (~57% input cost reduction)**
- `buildSessionPrompt` refactored to return `StructuredPrompt { staticFrame, rules, dynamicState }` instead of a flat string
- `STATIC_GM_FRAME` extracted as a module-level constant in `session.ts` — the entire GM instruction block (~5K tokens) that never changes across turns or users
- `route.ts` assembles three-layer cached system prompt: Layer 1 (staticFrame, cache_control: ephemeral), Layer 2 (rules, cache_control: ephemeral), Layer 3 (dynamicState, uncached)
- Character creation / adventure-create / gm-create prompts each wrapped as single cached block
- `client.ts`: `SystemContent = string | SystemBlock[]`, `StreamResult` gains `cacheCreationInputTokens` + `cacheReadInputTokens`; `UsageResult` interface added for `onComplete` callback type
- TOKENS sentinel updated: now emits `cacheWrite` + `cacheRead` alongside `in`/`out`

**Phase 2: Cap dynamic state**
- 2a: `campaign.gmNotes` truncated to 1,500 chars server-side before injection
- 2b: Session summaries limited to 3 most recent (was 5)
- 2c: NPCs capped at 10 most recent, visited locations at 15 most recent, completed quests filtered out in `buildWorldBlock`
- 2d: Deferred (adventure brief condensation requires tracking explored locations)

**Phase 5: Cache observability**
- `total_cache_write_tokens` + `total_cache_read_tokens` columns added to users table in Drizzle schema
- Migration: `migrations/0012_cache_tokens.sql`
- `schema.sql` updated (canonical restore reference)
- Both columns accumulated per-turn in the `onComplete` callback in `route.ts`
- Pricing constants added to `config.ts`: `ANTHROPIC_CACHE_WRITE_COST_PER_TOKEN` ($3.75/MTok), `ANTHROPIC_CACHE_READ_COST_PER_TOKEN` ($0.30/MTok)

**DB migration to apply to production:**
```
wrangler d1 execute shadowdark --remote --file=migrations/0012_cache_tokens.sql
```

**Build: clean ✓**

### Session 13 (2026-02-28)

**Account request flow fixes + create-password page:**

- Fixed `process.env` → `env.*` for all Cloudflare secrets (`RESEND_API_KEY`, `BETTER_AUTH_URL`) in both account-request routes — secrets set via `wrangler secret put` are only available on the Cloudflare `env` object, not `process.env`
- Added all secrets to `CloudflareEnv` type in `src/env.d.ts`
- Changed `void resend.emails.send()` to `await` in both routes so errors surface
- Fixed email addresses: `from` and `to` both updated to `gm@bytorchlight.com`
- Replaced 3-step approval flow (approve → forgot-password → another email → reset) with direct create-password flow:
  - Approve route no longer creates BetterAuth user; marks request `approved` and emails `/create-password?token=<token>`
  - New `/create-password` page: enter password + confirm → creates account → auto-signs in → redirects to `/`
  - New `POST /api/account-request/set-password` route: validates token (must be `approved`, not `completed`), creates BetterAuth user, marks token `completed`
- SPF fix noted: root `bytorchlight.com` SPF needs `include:spf.resend.com` added (Resend IPs not currently authorized — causes Gmail softfail)

### Session 12 (2026-02-28)

**Rebrand, license compliance, analytics, and housekeeping:**

- **Rules license compliance** — rewrote all verbatim Shadowdark creative text across 6 files (`gm-guidance.md`, `carousing.md`, `deities.md`, `traps-and-hazards.md`, `world.md`, `xp-awards.md`); mechanics preserved, flavor text rewritten
- **Rebrand: "By Torchlight"** — all UI, email sender (`gm@bytorchlight.com`), page title updated across 11 files; `BETTER_AUTH_URL` needs updating when DNS switches to bytorchlight.com
- **Background image** — replaced copyrighted Shadowdark cover with new `dungeon-background.webp` (162KB); dark overlays removed (image is intentionally dark); all 9 pages + 2 components updated
- **Shadowdark Third-Party logo** — converted to WebP (13KB), added to home page footer with link to thearcanelibrary.com
- **Home link in game title bar** — `← Home` link added left of save indicator in `GameLayout.tsx`
- **Prod DB cleanup** — deleted 2 orphaned campaigns with null user_id; applied missing `total_input_tokens`/`total_output_tokens` columns to prod users table
- **schema.sql** — single unified DB schema file replaces duplicate migrations/ and drizzle/ dirs
- **How to Play content** — added "This Is a Chat Game" section; companion NPCs mention; API key cost section using `SERVER_KEY_TURN_LIMIT` const; `/account` link conditional on session
- **`/account` route protected** — added to `src/middleware.ts` matcher
- **GA4 analytics** — `src/lib/analytics.ts` typed `trackEvent()` utility; wired 10 events across request-access page, home page, adventure detail page, character creation, play page, and settings; setup guide at `docs/guides/ga4-events.md`

### Session 11 (2026-02-28)

**Session summarization — fully implemented:**

- `migrations/0008_session_summarization.sql` — `gm_notes TEXT` column on campaigns
- `POST /api/campaign/[campaignId]/summarize` — Haiku call (claude-haiku-4-5), compact system prompt, strips gamestate blocks from chat log, writes to `sessions.summary`
- Campaign GET fixed: `orderBy(desc(sessions.sessionNumber))` — was unordered (bug); returns `sessionSummaries[]` from all past sessions that have a summary (last 5)
- `sessionSummaries` added to `ChatRequest` type; passed from play page state through both the opening-scene fetch and `sendMessage`; used in `buildSessionPrompt` (was hardcoded `[]`)
- `gmNotesUpdate` gamestate type added to parser and type union; handled in play page update loop; persisted via save route; injected into session prompt as GM-only section with format instructions
- "Pause Session" flow: sets `isPausing` state, fires hidden message + background summarize fetch; `SessionControls` swaps button to "Return Home" link when `isPausing && !isLoading`

### Session 10 (2026-02-28)

**World bible + session summarization planning:**

- Created `src/lib/rules/world.md` — setting reference covering tone, tech level, ancestries (6 playable), gods (7 named + The Lost), magic, and society. Derived from Shadowdark manual (`docs/reference/shadowdark-raw.txt`). Prevents anachronisms across all campaigns.
- Added `world.md` to `ALWAYS_LOAD` in `rules-loader.ts` (~1,315 tokens always injected).
- Reviewed and discussed `docs/plans/session-summarization.md` — ready to implement Phase 1.

**Session summarization — Phase 1 plan (NOT YET IMPLEMENTED):**

Ready to build in next session. Implementation order:

1. **DB migration** — add `gmNotes TEXT` to `campaigns` table (campaign arc tracking)
2. **Gamestate support** — `gmNotesUpdate` parsed in `state-parser.ts`; save to campaigns table in save route; inject into session prompt as GM-only section
3. **Fix campaign GET** — currently `limit(1)` with no ordering (bug); needs to load most recent session's messages + previous sessions' summaries separately
4. **Session lifecycle** — current session = most recent row without summary; on "End Session" write summary, next play creates new session row
5. **`POST /api/campaign/[campaignId]/summarize`** — calls Claude Haiku with compact prompt, writes plain-text summary to `sessions.summary`, returns it
6. **"End Session" button** — in right panel Tools tab; confirmation → call summarize → show result → redirect home
7. **Session resume** — campaign GET returns `sessionSummaries: string[]` from past sessions; injected via existing `buildSummaryBlock()`

**Design decisions locked:**
- Summary stored as plain formatted text (not parsed JSON) — narrative paragraph + bullet key events
- Load last 3–5 session summaries only (drop older ones)
- `gmNotes` is GM-only, never shown to player, updated by AI via `gmNotesUpdate` gamestate block

### Session 9 (2026-02-27)

**Auth + token optimization:**

Auth (BetterAuth v1.4.19):
- Schema: `users`, `authSessions`, `accounts`, `verifications` tables with integer timestamps (D1 rejects Date objects)
- `src/lib/auth/index.ts` — lazy singleton `getAuth()` via `getCloudflareContext({ async: true })`
- `src/lib/auth/session.ts` — `requireSession()` / `getSession()` helpers for API routes
- `src/lib/auth/client.ts` — `authClient` with `createAuthClient` for React hooks
- `src/app/api/auth/[...all]/route.ts` — BetterAuth handler (nodejs runtime)
- `src/proxy.ts` (was middleware.ts) — cookie-presence redirect guard; renamed to proxy per Next.js 16 convention; export renamed to `proxy`
- `src/app/login/page.tsx` — combined sign-in/create-account with Suspense boundary for useSearchParams
- `UserNav.tsx` — bordered pill with name + sign out; fixed top-right on home and play pages
- `/api/character` stamps userId; `/api/campaigns` filters by userId
- Background image changed to `fixed` so content scrolls over it
- `cover.png` → `cover.webp` at q85 (910K → 454K, 50% smaller)
- D1 migration `0006_auth_and_userid.sql` applied to production via `--command`
- Cloudflare secrets: BETTER_AUTH_SECRET, BETTER_AUTH_URL, NEXT_PUBLIC_APP_URL

Token optimization (~16KB/turn reduction for typical sessions):
- `session.ts`: companions rules block + soul transfer section gated on `companions.length > 0`
- `exploration.md` → `light-and-darkness.md` (always loaded, ~1.5KB) + `exploration-mechanics.md` (loaded when `exploring`, ~4.5KB)
- `spellcasting.md` → `spellcasting-core.md` + `spellcasting-t{1-5}.md`; rules-loader loads tiers ≤ `ceil(level/2)`; route.ts passes `character?.level`
- Planning docs saved: `docs/plans/token-optimization.md`, `docs/plans/session-summarization.md`

### Session 8 (2026-02-26)

**Rules hardening and GM mechanics improvements:**
- XP tile in CharacterSheet: now shows `current/needed` format (e.g. `3/20`)
- Carousing rules: added CRITICAL prohibition — carousing never awards XP regardless of roll or player suggestion
- New `## XP Timing and Awards` section in gm-guidance.md: XP awarded immediately after combat (by monster level) and when treasure claimed (by quality); explicit list of non-sources; GM checklist updated
- Level-up procedure: added `## Level-Up Procedure` to gm-guidance.md (always-loaded) with trigger conditions, step-by-step (HP roll, talent at odd levels, spell choices for casters, XP reset), emit format
- XP now shown in GM's character block (`XP: N/M`) so GM can track threshold
- Auto-detect level-up in route.ts from character data (`xp >= level * 10`) — loads leveling.md when at threshold, not just on keyword match
- Homepage campaign cards: module-based campaigns now show adventure title (e.g. "Ill-Gotten Gains") instead of "New Adventure"; resolved server-side in campaigns API using `getAdventure()`

### Session 7 (2026-02-26)

**Adventure module system — full implementation:**
- `src/lib/adventures/types.ts` — `AdventureLocation`, `Adventure`, `AdventureCollection` types
- `src/lib/adventures/shots-in-the-dark-1.ts` — all 18 oneshot adventures with locations, NPCs, mechanics, PC map filenames
- `src/lib/adventures/index.ts` — `ADVENTURE_COLLECTIONS`, `getCollection()`, `getAdventure()` helpers
- DB migration `drizzle/0001_adventure_fields.sql` — adds `campaign_type`, `module_id`, `adventure_id` to campaigns
- Drizzle schema updated with those 3 new columns
- `Campaign` type gains `campaignType`, `moduleId`, `adventureId`; `GameStateUpdate` type gains `"mapReveal"`; `ChatRequest.mode` gains `"adventure-create"`
- `src/lib/ai/prompts/adventure-create.ts` — GM-interview character creation prompt for specific adventures
- `session.ts` — `buildAdventureBlock()` helper; injected into session prompt when campaign has moduleId/adventureId
- `state-parser.ts` — `mapReveal` parsed and emitted as `GameStateUpdate`
- `/api/character` — accepts `campaignType`, `moduleId`, `adventureId`; persists to DB
- `/api/campaign/[id]` — returns `campaignType`, `moduleId`, `adventureId` in response
- `/api/chat` — handles `mode: "adventure-create"` using `buildAdventureCreatePrompt`; injects adventure into session prompt for `mode: "play"` when campaign has module
- `/api/character/start-adventure` — new route: creates new campaign for existing character with adventure context
- `MapViewer.tsx` — zoom/pan map image viewer with reset button
- PC maps copied to `public/adventures/shots-in-the-dark-1/`
- `play/[campaignId]/page.tsx` — adventure loaded on page load; gm-create mode if no character name; Map tab in right panel; mapReveal handling; tab badge on new reveal
- `/adventures/page.tsx` — adventure browser with level-range color coding
- `/adventures/[collectionId]/[adventureId]/page.tsx` — adventure detail + 3-option character selection
- Homepage — added "Choose an Adventure" button alongside "Begin Your Adventure"
- `/create` — reads `adventureId`/`collectionId` query params; passes through to `POST /api/character`
- **Build: clean ✓**
- DB migration needs applying: `wrangler d1 execute shadowdark --remote --file=drizzle/0001_adventure_fields.sql`

### Session 6 (2026-02-26)

**Torch timer complete:**
- Marked torch timer as done in feature-list.json (all tests passing)
- Removed from "What doesn't work yet" list
- Multiple bug fixes across previous session: double-notification on burnout, stale closure causing reignite-after-extinguish, wall-clock → paused countdown, darkness enforcement

### Session 5 (2026-02-26)

**Fixed production 500 errors on all DB routes:**
- Root cause: all DB API routes used `runtime = "edge"`, which uses Next.js's strict Edge Runtime bundler — incompatible with drizzle-orm's CJS internals
- Fix: changed all five DB routes to `runtime = "nodejs"` (consistent with `/api/chat`)
- Affected routes: `/api/character`, `/api/campaigns`, `/api/campaign/[id]`, `/api/campaign/[id]/save`, `/api/campaign/[id]/inherit`
- Verified: `/api/character` returns `{characterId, campaignId}`, `/api/campaigns` returns campaign list

**CI/CD via GitHub Actions:**
- Added `.github/workflows/deploy.yml` — triggers on push to `main`, runs `npm run build:cf` then `wrangler deploy`
- Replaces the Cloudflare dashboard git integration (which was using wrong build command)
- Added `account_id` to `wrangler.toml` (required for non-interactive deploy with multi-account token)
- `CLOUDFLARE_API_TOKEN` stored as GitHub Actions secret

### Session 4 (2026-02-25)

**Soul transfer fixes (stale closure bug):**
- `sendMessage` now accepts `initialCharacter`, `initialCampaign`, `initialCompanions` overrides to bypass stale closures
- `handleCompanionInherit` fires an immediate save before `sendMessage` with fresh state
- On page load: filter companions by name to exclude current character (handles stale DB worldState)
- HP on transfer: `companion.hp > 0 ? companion.hp : (companion.maxHp || 1)` (GM rarely emits HP before transfer)
- Languages merge on soul transfer: `[...new Set([...companion.languages, ...deadCharacter.languages])]`
- Deity: stays with the companion's own faith (not inherited from dead character)
- Equipment: companion carries their own gear only; dead character's inventory preserved in `LegacyCharacter.equipment`
- `LegacyCharacter` type gains optional `equipment` field
- `buildWorldBlock` in `session.ts` surfaces "Fallen Heroes" with gear list to GM
- Soul transfer prompt step: dead character's body remains in-world; GM offers loot to party

**Cloudflare production deployment:**
- Created `drizzle.config.ts` (dialect: sqlite, schema: src/lib/db/schema.ts, out: drizzle/)
- Created `open-next.config.ts` (defineCloudflareConfig)
- Fixed `wrangler.toml`: added `main`, `[assets]` block, corrected `database_id` and binding name `DB`
- Added `src/env.d.ts`: `CloudflareEnv` augmented with `DB: D1Database`
- Applied schema migration to production D1 via `wrangler d1 execute --remote`
- Fixed `/api/character` 500 error: replaced `nanoid` (ESM-only, CJS interop crash) with `crypto.randomUUID()`
- Added `isCharacterComplete` computed flag and manual "Begin Adventure →" button to `/create`
- Added `.open-next/` to `.gitignore`
- Auth plan written at `docs/plans/auth.md` (BetterAuth + lazy singleton pattern for D1)

### Session 3 (2026-02-25)
- Added `CompanionPersonality`, `Companion`, `LegacyCharacter` types to `types.ts`
- Updated `WorldState` with optional `companions` and `legacyCharacters` arrays
- Extended `GameStateUpdate.type` union: `companionJoined | companionUpdate | playerDied`
- Updated `state-parser.ts` to extract all three new update types
- Updated `session.ts` prompt:
  - `buildCompanionBlock()` helper formats active companion stat blocks (with id) for GM context
  - Companions section: GM controls all companions per personality; loyalty drift rules; hostile turn; death saves
  - Soul Transfer section (GM-only): playerDied format, transfer flow, system message trigger
- Created `CompanionPanel.tsx`: collapsible right-panel card, HP bar, stats grid, loyalty pips, disposition/risk chips
- Created `DeathScreen.tsx`: fixed overlay with cover.png background; choice of companions; forced inherit for hostile-killer path; no-companion campaign end
- Created `POST /api/campaign/[campaignId]/inherit/route.ts`: inserts new character from companion stats + legacyTalent, updates campaign.characterId and worldState
- Updated `play/[campaignId]/page.tsx`: companions state; isDead + deathData state; companion update handling in both openingScene and sendMessage loops; handleCompanionInherit(); handleCampaignEnd(); CompanionPanel and DeathScreen rendered
- Build: clean ✓

### Session 2 (2026-02-24)
- Installed wrangler, @opennextjs/cloudflare, drizzle-kit, @cloudflare/workers-types
- Created wrangler.toml with D1 binding
- Created migrations/0001_init.sql (characters, campaigns, sessions tables)
- Updated Drizzle schema: added `pronouns` to characters, `gmPersona` to campaigns
- Created src/lib/db/client.ts (getDb using drizzle-orm/d1)
- Created src/env.d.ts (CloudflareEnv augmented with DB: D1Database)
- Updated next.config.ts with initOpenNextCloudflareForDev() for local dev
- Created POST /api/character — saves character + creates campaign, returns campaignId
- Wired GET /api/campaign/[campaignId] — loads from D1
- Wired POST /api/campaign/[campaignId]/save — updates character + campaign in D1, upserts sessions with full message history
- Updated GET route to load messages from sessions table
- Updated create/page.tsx — tracks campaign state, handles characterComplete, saves to DB, redirects to /play/[campaignId]
- Applied local D1 migration (3 tables created successfully)
- Updated play/page.tsx — autosave after every AI response; auto-trigger opening scene for new campaigns (hidden [BEGIN ADVENTURE] message using loaded data before React state is set)
- Added `hidden?: boolean` to Message type + ChatWindow filters hidden messages from display
- Token optimization in /api/chat: strip gamestate blocks from assistant history, 20-message window, user-first guard
- Dice UI: removed borders, enlarged to w-14 h-14, text-4xl on outer container so unicode inherits correctly; labels and totals to text-base; row alignment to items-baseline
- Verified Dryn's campaign (Chaotic Elf Thief) in local D1: 167 gold, Cloak of Elvenkind, Threshold Pendant, 70,696 bytes of message history — session resume confirmed working
- Build clean, all TypeScript passes

### Session 1 (2026-02-24)
- Implemented dice animation phased reveal (gamestate-first streaming, `---` split, Continue button)
- Fixed streaming → final component transition (merged display array preserves React instance)
- Removed clickable option lists in favor of chat-only input
- Added auto-focus on chat input when AI finishes responding
- Added pronouns to character creation (Step 5) and session prompts
- Added GM persona persistence via `campaign.gmPersona`
- Updated feature-list.json to reflect actual state
- Initial commit + README
