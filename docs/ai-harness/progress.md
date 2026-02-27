# Progress

Current state of the project and recent work. Read this at the start of each session.

## Current State

**Production deployment is live at https://dark.tim52.io** (Cloudflare Workers + D1).

Full end-to-end persistence is working. Character creation, gameplay loop, autosave, and session resume all work. Companion NPC and soul transfer mechanics are implemented (code complete, not yet manually verified in production). Verified live character creation → play flow in production after fixing the `/api/character` 500 error.

**What works:**
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

**What doesn't work yet:**
- Session management with AI-generated summaries (long-term memory across many sessions)
- Combat tracker UI
- Auth (BetterAuth integration planned at `docs/plans/auth.md`)

## DB Setup

- Local D1 SQLite: `.wrangler/state/v3/d1/` (populated via `wrangler d1 migrations apply shadowdark --local`)
- Production D1: `shadowdark` DB (`aae22728-e098-4c3e-811e-aa1c73d33fbb`) in Cloudflare account
- Migration applied via `wrangler d1 execute shadowdark --remote --file=drizzle/0000_eager_firebrand.sql`
- `initOpenNextCloudflareForDev()` in `next.config.ts` provides D1 binding during `npm run dev`

## Deployment

- Build: `npx @opennextjs/cloudflare build` → `.open-next/worker.js` + `.open-next/assets/`
- Deploy: `wrangler deploy` (uses `wrangler.toml` — binding `DB`, assets, `ANTHROPIC_API_KEY` secret)
- `.open-next/` is gitignored (build artifact)
- Live URL: https://dark.tim52.io (also https://shadowdark.tim-arnold.workers.dev)

## Recent Work

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
