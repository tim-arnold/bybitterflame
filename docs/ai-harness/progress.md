# Progress

Current state of the project and recent work. Read this at the start of each session.

## Current State

**Production is live at https://bybitterflame.com** (Cloudflare Workers + D1).

Full end-to-end persistence is working. Character creation, gameplay loop, autosave, session resume, companion NPCs, soul transfer, adventure modules, and session summarization all work in production.

**What works:**
- **Cinematic first-visit intro** — GSAP timeline animation on homepage: fade from black over 7s, tagline lines animate in sequentially (scale 4.5→1 + blur, power4.out), logo fades in after 2s pause; sessionStorage gate (once per session); hydration-safe
- **Character management page** (`/characters`) — lists all roster characters with status; adventuring chars get "Continue →", idle chars get "New adventure →" and "Delete"; `userId` on characters table (migration 0014) fixes data scoping; companions/available no longer leaks cross-user data; delete adventure dialog has "Also delete [name]" checkbox (server guards FK safety)
- **Bug report + feature suggestion** — `BugReportModal` (with `mode="bug"|"feature"`) captures description + auto-collects debug info; creates Jira Bug or Story via REST API v3; shows ticket key on success; "Report a Bug" (lime #CFF200) and "Suggest Feature" (sky-400) links in `UserNav` on all pages and GameLayout mobile menu; modal renders via React portal (escapes backdrop-blur stacking context on site header)
- **Economy mode toggle** — right sidebar toggle switches all gameplay turns to Haiku (~67% cheaper); instant and reversible; tooltip warns on quality tradeoff; model name logged in TOKENS sentinel for verification
- **Shopping turns → Haiku** — when `shopping` context flag is set (and no combat/leveling/casting), uses Haiku automatically; all other gameplay remains on Sonnet
- **Anti-metagaming rules** — GM prompt `STATIC_GM_FRAME` has explicit "No Metagaming" section; adventure module block wrapped in `GM EYES ONLY` with specific prohibitions on leaking undiscovered locations or referencing "the adventure hook"
- **API key encryption at rest** — AES-256-GCM via Web Crypto API (`src/lib/crypto.ts`); all user and beta API keys encrypted before DB write; decrypted in server memory only when needed; `enc:v1:` prefix distinguishes encrypted from legacy plaintext; one-time admin migration route + button at `/admin`; `API_KEY_ENCRYPTION_SECRET` env var required
- **API key validation** — `POST /api/user/api-key` makes a lightweight test call to Anthropic before saving; 401/403 returns user-friendly error instead of silently storing a broken key
- **Token usage DB fix** — `onComplete` callback now `await`ed before `controller.close()` so DB write completes before Cloudflare Workers execution context is killed (was silently dropped on every turn)
- **Spell fix (BTORCH-5)** — `enrichSpell()` strips parenthetical suffixes before lookup; `applyCharacterUpdates()` normalizes spells via `enrichSpell`; raw JSON gamestate fallback when AI omits fences; initializer/adventure-create prompts have CRITICAL sections forbidding D&D 5e names and wrong spell syntax
- **App is rebranded to "By Bitter Flame"** — logo image (`logo-bybitterflame-400.webp`) used across all pages; all UI copy, email sender (`gm@bybitterflame.com`), page title updated; domain bybitterflame.com purchased (DNS not yet switched; prod still at dark.tim52.io)
- **GA4 analytics** — G-285WWGVN6Z; `trackEvent()` utility wired to 10 events across the funnel (request_access, adventure_started, character_created, api_key_added, free_turns_exhausted, session_paused, adventure_completed, character_died, soul_transferred, companion_joined); guide at `docs/guides/ga4-events.md`
- **schema.sql** — single unified DB schema replacing drizzle/ and migrations/ directories; use `wrangler d1 execute bitterflame --remote --file=schema.sql` to restore prod
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
- **Combat tracker UI** — `CombatTracker` component in right panel; GM emits `combatAction` with `active`, `round`, `combatants`; player gold, companions emerald, enemies gray; clears on combat end
- **Companion NPCs** — full stat sheets, personalities, loyalty drift, death saves, hostile turn; stored in `worldState.companions`; verified in production
- **Soul transfer on death** — `playerDied` triggers DeathScreen overlay; player picks companion; inherit API creates new character; legacy talent appended; adventure continues; verified in production
- **Torch timer** — 60-minute paused countdown; UI owns the clock; GM signals intent only; darkness enforced when no torch lit; AI notified on burnout
- **Cloudflare deployment** — `wrangler deploy` → Workers runtime; D1 binding confirmed
- **Adventure modules** — Shots in the Dark #1 (18 oneshots); /adventures browser; adventure brief in session prompt; mapReveal → Map tab; GM character creation mode; pending DB migration for production
- **Auth** — BetterAuth v1.4.19 with D1 adapter; email+password sign up/in; session cookie; middleware (proxy.ts) redirects unauthenticated users; campaigns scoped to userId; UserNav pill in header; lazy singleton pattern for D1 binding
- **Token optimization** — companion rules block gated on companions.length > 0 (~1.5KB/turn); exploration.md split into light-and-darkness.md (always) + exploration-mechanics.md (conditional); spellcasting.md split into core + per-tier files T1–T5, only tiers ≤ character's max loaded (~10KB saved for low-level casters)
- **Session summarization** — "Pause Session" fires hidden GM summary message + background Haiku call that writes compact summary to `sessions.summary`; campaign GET fixed to order by sessionNumber DESC and return `sessionSummaries[]` from past sessions (last 5 with summaries); `sessionSummaries` passed to `/api/chat` and injected into system prompt via `buildSummaryBlock()`; `gmNotes` column added to campaigns table; `gmNotesUpdate` gamestate type parsed and persisted; `gmNotes` injected as GM-only section in session prompt; "Return Home" button appears after AI finishes responding to pause request; DB migration: `migrations/0008_session_summarization.sql`

**What doesn't work yet:**
- Nothing known — all planned features complete

**BTORCH-13 status:** Done (carousing + level-up flow fully implemented and verified)

## DB Setup

- Local D1 SQLite: `.wrangler/state/v3/d1/` (populated via `wrangler d1 migrations apply bitterflame --local`)
- Production D1: `bitterflame` DB in Cloudflare account
- **Source of truth: `schema.sql`** — run `wrangler d1 execute bitterflame --remote --file=schema.sql` to restore prod from scratch
- `initOpenNextCloudflareForDev()` in `next.config.ts` provides D1 binding during `npm run dev`

## Deployment

- Build: `npx @opennextjs/cloudflare build` → `.open-next/worker.js` + `.open-next/assets/`
- Deploy: `wrangler deploy` (uses `wrangler.toml` — binding `DB`, assets, `ANTHROPIC_API_KEY` secret)
- `.open-next/` is gitignored (build artifact)
- Live URL: https://bybitterflame.com (also https://bitterflame.tim-arnold.workers.dev)

## Recent Work

### Session 31 (2026-03-14)

**IP cleanup Task 9: Full rewrite of all 19 encounter tables:**

- Rewrote ~850 entries across all 19 encounter files in `src/lib/rules/encounters/` with fully original BBF folklore content
- Replaced all D&D-specific creatures with BBF-original or public-domain folklore names: thornbear, muckfiend, hungering mass, ironblight, shroud-wing, gloom-cap, stone-jaw, bore-wyrm, tunnel-maw, furnace-wyrm, strangler, grey knockers, sabretooth, lindworm, spriggan, kelpie, black dog
- Placed all 10 factions consistently: Briarthorn, Ashmark, Mudcap, Guttersnipe, Foxglove, Snowburrow, Redcap, Thornscale, Ember-Eye, hollow fey
- Preserved structural elements: d100 roll ranges, The Tinker at 96-97, reroll at 98-99, recurring NPCs (Grukk, Nodwick & Bramble, Grizzel)
- Added explicit Builder/Underways references to all wilderness and dungeon files
- All IP cleanup tasks (1-10) now complete — no third-party-derived content remains
- **Build: clean**

### Session 30 (2026-03-14)

**Phase 8 Playtest: Test Gauntlet adventures, Quick Start, bug fixes, GM prompt tuning:**

- **Test Gauntlet**: 6 new adventures with preset characters for Quick Start (Sorcerer's Trial, Druid's Burden, The Last Stand, Victory Feast, The Fence, The Study). Quick Start button on adventure detail page skips character creation entirely.
- **DB persistence fix**: `specialization`, `toll`, `tollPermanent` columns added to characters table (migration 0018). Save route and character creation route updated to persist these fields.
- **Specialization accent colors**: 9-color palette in `SPECIALIZATION_COLORS` map. Character sheet name/class colored by specialization. GM prompt includes canonical color list for narration.
- **GM prompt improvements**: Specialization narration guidance (affinity signals, canonical colors). Toll tracking strengthened ("emit every single time"). Mechanical roll prompts must be separate from narrative/dialog. Death cause should be "a short, evocative phrase".
- **Deferred death screen**: Player reads GM's final death narrative before DeathScreen overlay appears. Contextual button (e.g. "Surrender to the Green") replaces chat input via `footerOverride` prop.
- **Stat display on talent rolls**: LevelUpTalentPhase shows current score and color-coded modifier for each stat choice.
- **Character delete FK fix**: Delete route now cascades sessions → campaigns → character instead of failing on FK constraint.
- **Downtime adventure fixes**: Rewrote specialMechanics with hard rules ("CRITICAL — EMIT adventureComplete IN YOUR SECOND RESPONSE").
- **All 6 Test Gauntlet adventures completed and verified.** Phase 8 playtest items checked off in implementation.md.

### Session 29 (2026-03-12)

**BTORCH-52 Phases 5-7: Encounter tables, adventure modules, app chrome:**

- **Phase 5**: All 19 encounter table files rewritten with folklore replacements (stingbats→thornwings, drow→hollow fey, temples→shrines, etc.)
- **Phase 6**: All 18 adventure modules renamed with original titles, locations, NPCs, and factions. Underways connections added. Class/ancestry/religion references updated throughout.
- **Phase 7**: Removed all remaining third-party references from code (email templates, page titles, approval emails, summarization prompt). Updated CLAUDE.md with new game system overview. Updated feature-list.json project name.
- **Build: clean**

### Session 28 (2026-03-12)

**BTORCH-52 Phase 1: Core Rules Files — complete rewrite of all rules markdown:**

All `src/lib/rules/` files rewritten from scratch with original game mechanics for a folklore-on-the-brink setting.

- **New game systems**: The Toll (cumulative spellcasting cost 0-20 with threshold bands), Fate Roll death (d6 per round, 3-round cap), specialization at level 3 (9 paths from 3 base classes)
- **6 folklore ancestries**: Human, Fey, Knocker, Hob, Revenant, Leshy — each with passive + active abilities
- **3 base classes**: Fighter (d8), Rogue (d6), Caster (d4) → 9 specializations at level 3
- **86 original spells**: 20 cantrips + 12 neutral T1 + 18 per path (Druid/Sorcerer/Enchanter) across T2-T5
- **New spell files**: `spellcasting.md` (Toll system), `spells-neutral.md`, `spells-druid.md`, `spells-sorcerer.md`, `spells-enchanter.md`
- **New downtime**: `downtime.md` replaces `carousing.md` — 3 class-specific tables (Carousing/Wheeling & Dealing/Studying), 42 outcomes total
- **Deleted files**: `deities.md`, `carousing.md`, `spellcasting-core.md`, `spellcasting-t1.md` through `spellcasting-t5.md`
- **Updated infrastructure**: `bundle.ts` imports updated, `rules-loader.ts` spell loading logic (neutral always, path files at level 3+)
- **Minor updates**: equipment (holy items → iron ward + salt), monsters/treasure/traps (removed third-party refs), random-tables (new ancestry names, folklore rumors)
- **Build: clean**

### Session 27 (2026-03-10)

**BTORCH-47: Encrypt Anthropic API keys at rest:**

- New `src/lib/crypto.ts` — AES-256-GCM encrypt/decrypt using Web Crypto API (Cloudflare Workers compatible)
- Encrypted format: `enc:v1:{iv_hex}:{ciphertext_hex}` — distinguishes from legacy plaintext for graceful migration
- All API routes that write keys (user api-key, admin beta-key, admin requests beta-key) now encrypt before DB write
- All API routes that read keys (chat, user api-key GET, admin page) decrypt before use
- `getEncryptionSecret()` helper falls back to `process.env` when Cloudflare env bindings unavailable (local dev)
- One-time migration route `POST /api/admin/migrate-keys` with button on `/admin` page — encrypts all existing plaintext keys
- Settings page updated with encryption disclosure text
- `API_KEY_ENCRYPTION_SECRET` added to env types and `.env.example`
- Tested locally: migration encrypted 4 keys; gameplay confirmed working with encrypted keys
- **Deploy notes**: Add `API_KEY_ENCRYPTION_SECRET` secret to Cloudflare before deploying; run migration from `/admin` after deploy; delete migration route + button in follow-up commit
- **Build: clean**

### Session 26 (2026-03-09)

**BTORCH-29: Security hardening (critical/high items) — fully tested and closed:**

- **Ownership check** (`/api/character/start-adventure`): `sourceCampaignId` lookup now verifies `campaign.userId === session.user.id` before allowing use; returns 403 if mismatched. Prevents character hijacking via guessed campaign IDs.
- **Rate limiting**: New D1-backed sliding-window rate limiter (`src/lib/auth/rate-limit.ts`); migration `0016_rate_limits.sql`. Applied to `/api/account-request` (5/hr), `/api/bug-report` (10/hr), `/api/chat` anonymous (30/10min). All three wrapped in try/catch to fail open if migration not yet run.
- **Admin auth helper**: `src/lib/auth/admin.ts` exports `isAdmin(session)` and `ADMIN_EMAIL` — eliminates hardcoded string duplicated across 4 admin routes.
- **Zod validation**: Runtime body validation added to `start-adventure`, `campaign/[id]/save`, `companion/promote`. Bug report description capped at 5000 chars.
- **Bug report rate limit UX**: `BugReportModal` now shows friendly amber message on 429 instead of generic error; submit button disabled after limit hit.
- **Turn counter UI fix** (found during Fix 3 testing): `SessionControls` and `SettingsContent` were hardcoded to `SERVER_KEY_TURN_LIMIT` (20), ignoring admin-granted bonus turns. `/api/user/api-key` now returns `turnsLimit` (base + bonus); both components use it.
- All 4 fixes fully tested and passing. BTORCH-29 closed as Done.
- **Migration applied**: `0016_rate_limits.sql` (applied to production during session)
- **Build: clean ✓**

### Session 25 (2026-03-08)

**BTORCH-23: Admin bounty system — grant bonus free turns per user:**

- `serverKeyTurnsBonus integer NOT NULL DEFAULT 0` added to `user` table (Drizzle schema + migration generated to `drizzle/0000_tough_lifeguard.sql`)
- Turn gate in `/api/chat` now computes `effectiveLimit = SERVER_KEY_TURN_LIMIT + user.serverKeyTurnsBonus`; all three limit-check sites updated; `limit` field in 402 response reflects effective limit
- New `PATCH /api/admin/users/[userId]/turns` route — sets `serverKeyTurnsBonus` to an absolute value; looks up user before updating and sends a Resend notification email to the user when bonus increases
- New `GrantTurnsForm` client component — shows used/effective-limit/remaining; inline number input per user row; hidden for own-key and full-beta users
- Admin page: `serverKeyTurnsBonus` fetched in DB query; `keyStatusBadge` uses effective limit (e.g. "Trial 18/40"); new "Bonus Turns" column in users table with `GrantTurnsForm`
- Bounty notification email sent to user on turn grant: shows turns added, remaining turns, CTA back to the game
- `BugReportModal` success screen updated with bounty messaging: bug → "+10 free turns if your fix ships", feature → "+20 free turns if your idea ships"
- Modal form copy de-"we"'d: "Let us know" → "Drop a note", "We'd love to hear it" → "I'd love to hear it", "helping us improve" → "helping improve", "we'll award you" → "you'll be awarded"
- Welcome email bounty paragraph updated to name both amounts (+20 feature, +10 bug)

**Build: clean ✓**

### Session 24 (2026-03-07)

**BTORCH-17: Bug report link on all pages:**
- `UserNav` now self-manages `BugReportModal` when no `onBugReport` prop is passed (uses internal `showBugReport` state)
- Bug report button always visible for authenticated users on all pages

**BTORCH-20: Suggest Feature link:**
- Added "Suggest Feature" link (sky-400) next to "Report a Bug" in `UserNav` and GameLayout mobile menu
- `BugReportModal` accepts `mode="bug"|"feature"` — adapts title, placeholder, submit label, title color, and Jira issue type (Bug vs Story)
- API route accepts `issueType` param; prefixes summary with `[Bug]` or `[Feature]`
- Modal renders via `createPortal` into `document.body` — fixes positioning bug on pages where site header has `backdrop-blur-sm` (creates stacking context that trapped fixed children)

**Build: clean ✓**

### Session 23 (2026-03-07)

**BTORCH-14: Fix GM stuck emitting HP rolls after level-up:**
- Removed text-based `levelingUp` detection from `route.ts` — matching "level up" in recent messages persisted for many turns after leveling, causing `leveling.md` to keep loading
- XP threshold check (`xp >= level * 10`) is now the sole signal; resets correctly to false after level-up sets xp=0

**BTORCH-15: Quest deduplication and giver display:**
- Removed `buildQuestJournalEntries` and both call sites — quests were appearing in both Traveller's Journal and Quest Log
- Quests now only appear in the Quest Log (which handles active/completed/failed)
- Quest giver now shown as always-visible subtitle in collapsed Quest Log card

**Build: clean ✓**

### Session 22 (2026-03-07)

**BTORCH-13: Carousing level-up flow:**

- New `src/lib/game/leveling.ts` — pure TS functions: `shouldLevelUp`, `getHitDie`, `getStatMod`, `isOddLevel`, `getSpellsGained`, `getTalentResult`, `buildTalentString`, `statUpdatesFromTalent`; talent tables for all 4 classes; Priest/Wizard spell progression tables T1–T5 per level
- Extended `src/lib/game/spells.ts` — `CLASS_SPELLS` map + `getAvailableSpellsForPicker` (excludes already-known spells)
- `AdventureCompleteScreen.tsx` — 3 new phases between "result" and "done":
  - `leveling-hp`: animated hit die roll with Dwarf advantage, CON mod display, maxHp/hp update
  - `leveling-talent`: animated 2d6 roll on class table; choice UI: stat buttons, spell list, or text input; Wizard 12 deferred to spell picker
  - `leveling-spells`: tier-by-tier spell picker with descriptions; Wizard 12 free-pick inserts a pick of any tier ≤ current
- `play/[campaignId]/page.tsx` — `handleCarouseComplete` accepts optional `levelUpOverride: Partial<Character>`; if present, merges overrides (level, xp=0, maxHp, hp, talents, spells, stats) instead of adding XP; gold deduction always applied
- Level 10 characters skip the flow; skip-carousing path never triggers level-up
- **Build: clean ✓**

### Session 21 (2026-03-07)

**BTORCH-3: Combat tracker UI (already committed, harness not updated):**

- Confirmed `CombatTracker.tsx` implemented with `combatAction` gamestate support
- GM session prompt updated to emit `active`, `round`, `combatants` fields
- `isCompanion` field distinguishes companions (emerald) from player (gold) and enemies (gray)
- Clears on combat end; lives in right panel
- Updated feature-list.json and progress.md to reflect done status

**BTORCH-11: Enhanced account settings:**

- Added display name change (`authClient.updateUser`)
- Added email change with verification (`authClient.changeEmail`) — requires BetterAuth `emailVerification` + `user.changeEmail.enabled`
- Added password change (`authClient.changePassword`)
- Added delete account with "DELETE" confirmation (`authClient.deleteUser`) — requires `user.deleteUser.enabled`
- Added sign out all other sessions (`authClient.revokeOtherSessions`)
- Created shared `src/lib/auth/password-validation.ts` — min 12 chars + HIBP Pwned Passwords k-anonymity check (SHA-1 prefix, Web Crypto API)
- Applied password validation to create-password, reset-password, change-password forms and set-password API route
- Set BetterAuth `minPasswordLength: 12` as server-side backstop

**Build: clean ✓**

### Previously undocumented work (2026-03-04 to 2026-03-06)

**Bug report, API key validation, token DB fix (March 4):**
- `BugReportModal.tsx` + `/api/bug-report` — Jira REST API v3 issue creation; lime-green button in UserNav + mobile menu; debug info auto-collected
- `/api/user/api-key` — validates key against Anthropic (lightweight test call) before persisting; rejects 401/403 with friendly error
- `client.ts` — `await onComplete` before `controller.close()` fixes Cloudflare Workers execution context killing async DB token writes

**Cost optimization extras and GM quality fixes (March 5):**
- `route.ts` — shopping context flag routes to Haiku; economy mode toggle in `SessionControls.tsx` allows player to force Haiku for all turns
- `session.ts` — "No Metagaming" section + `GM EYES ONLY` framing on adventure block
- BTORCH-5: `enrichSpell()` strips parentheticals; `applyCharacterUpdates()` normalizes spells; raw JSON gamestate fallback parser in `parseResponse()`; initializer + adventure-create prompts hardened with CRITICAL sections (valid class list, spell counts, fence syntax)
- BTORCH-6: `/characters` roster page; `userId` on characters table (migration 0014); DELETE `/api/character/[characterId]`; data scoping fix in `/api/companions/available`; "Also delete character" checkbox in delete dialog

**BTORCH-10 cinematic intro (March 6):**
- GSAP (`npm install gsap`) timeline animation; first-visit fade-from-black with sequential tagline lines (scale 4.5→1, blur, power4.out) + logo fade-in; `sessionStorage` gate; hydration-safe `isFirstVisit` pattern

**Build: clean ✓**

### Session 20 (2026-03-05)

**BTORCH-9: Unified adventure start flows:**

- Extracted three shared components into `src/components/adventure-start/`:
  - `CharacterTypeStep.tsx` — Roll Your Own / Existing Character / GM Decides options
  - `CompanionStep.tsx` — companion selection with former companions + "Play as" button
  - `GmInterviewStep.tsx` — 3-question interview with conditional power-source follow-up
  - `types.ts` — shared types (RosterCharacter, AvailableCharacter, FormerCompanionEntry, AvailableResponse)
- Both pages now compose the same components; zero duplicate logic
- `/new-adventure` changes: added Existing Character option, moved GM interview to separate post-companion step, maxCompanions=1 for all paths, analytics `type: "standard"`
- `/adventures/[collectionId]/[adventureId]`: structurally identical flow; GM interview now separate step after companions
- Updated `start-adventure` API to support standard campaigns (no moduleId/adventureId required)
- Added `"standard"` to `adventure_started` analytics event type union

Also fixed `gm-create.ts` prompt (used by "Let GM Decide" on `/new-adventure`):
- Was using "Mage" (not a valid class) and "Ranger"/"Barbarian" (also invalid)
- Missing all spell count rules — Haiku was generating 5–6 D&D 5e spells instead of 3 T1 spells
- Added CRITICAL section: valid classes (Fighter/Priest/Thief/Wizard ONLY), valid spell names, exact counts
- Now matches the quality of `adventure-create.ts`

**Build: clean ✓**

### Session 19 (2026-03-05)

**BTORCH-8: Expanded GM character interview questions:**

- Replaced ambiguous 4-option style question with 3 clear class-mapped options: Fighter (steel/muscle), Thief (cunning/shadows), Power (wizard/priest)
- Added conditional power-source follow-up when "Power" is selected: arcane study → Wizard, divine devotion → Priest
- Added alignment signal question (Lawful/Neutral/Chaotic) as Q2
- Removed "Words and wit" (no class mapping); consolidated into single Thief-appropriate option
- Updated `allAnswered` gate to require `powerSource` when "Power" is chosen
- Applied identical changes to both `/new-adventure` and `/adventures/[collectionId]/[adventureId]` flows
- Updated button copy in adventure detail from "2 quick questions" → "a few quick questions"

**Build: clean ✓**

### Session 18 (2026-03-05)

**Quest tracking system:**

- Added `giver?` and `reward?` fields to `Quest` type in `types.ts`
- Updated `buildWorldBlock()` in `session.ts` to display active quest objectives, giver, and reward — gives GM full quest context every turn
- Added **Quest Tracking** section to static GM prompt instructing when to emit `campaignUpdates.quests` (full array, always): on quest acceptance, completion, or failure
- Added **Quest Review Milestone** rules: GM must weave active quests into narration organically after combat ends, when `locationType` changes (entering/leaving an area), and at session start
- Created `QuestLog.tsx` component in right panel: shows active quests with objectives, giver, reward; collapsed section for completed/failed quests; hidden when no quests exist
- Play page auto-creates journal entries (category: "quest") when new active quests detected in `campaignUpdates.quests` — deduplicates by name, handles both opening scene and mid-session handlers
- `QuestLog` wired above `TravelersJournal` in right panel

**Build: clean ✓**

### Session 17 (2026-03-04)

**Branding, navigation overhaul, and UX polish:**

**Logo integration:**
- Replaced all "By Bitter Flame" text headings with logo image (`logo-bybitterflame-400.webp`, 31% smaller than PNG)
- Logo used on: homepage, play screen sidebar, login, request-access, how-to-play, account pages
- Deleted 5 unused assets (3 old logo PNGs + 2 unused background images, freed 1.66MB)

**Navigation restructure:**
- Deleted `SiteNav` component; replaced with inline `UserNav` in site layout (right-aligned, no "Back to Home")
- `GameLayout` restructured: adventure title moved to left sidebar below logo; desktop nav bar is right-aligned only
- Added "Pause & Leave" button to desktop nav and mobile hamburger menu — turns amber with warning tooltip when AI is mid-response
- Removed username display from `UserNav` (unnecessary during gameplay)
- Added `UserNav` top bar to login and request-access pages (were missing navigation)

**Shared footer:**
- Created `SiteFooter` component with third-party logo + copyright (later removed)
- Added to homepage (inline in centered content), how-to-play, account, login, request-access
- Not shown on play screen (correct — GameLayout is separate)

**Other fixes:**
- Play page fade-in: full-screen dungeon background overlay fades out over 700ms once campaign data loads
- Fixed sign-out not working: `window.location.href` replaces `router.push` for hard redirect (clears cached session state)
- Added `localhost:3001` to Better Auth `trustedOrigins` (fixes invalid origin error on alternate dev port)
- Logo image added to how-to-play and account page headers (right-aligned opposite title)

**Build: clean ✓**

### Session 16 (2026-03-02)

**Cost optimization — Phase 3: Haiku for character creation:**

- `MODEL_SONNET` and `MODEL_HAIKU` constants centralized in `src/lib/config.ts` (were scattered/hardcoded)
- Haiku pricing constants added to `config.ts` ($1/$5/MTok input/output, $1.25 cache write, $0.10 cache read)
- `client.ts` `streamChat` and `createStreamingResponse` accept `model` param (defaults to Sonnet)
- `route.ts` routing: `mode === "play"` → Sonnet, creation modes (`create`, `adventure-create`, `gm-create`) → Haiku
- `summarize/route.ts` uses shared `MODEL_HAIKU` from config (replaced local constant)
- Haiku quality verified on full character creation — works well for the rigid scripted flow
- **Bug fix:** Haiku emits talents as `{name, description}` objects instead of strings — added normalization in `state-parser.ts` (`applyCharacterUpdates`) and defensive rendering in `CharacterSheet.tsx`
- Gameplay Haiku routing (exploring/shopping) deferred pending further quality evaluation

**Build: clean ✓**

### Session 15 (2026-03-02)

**Companion selection at adventure start, carousing, homepage UX, new-adventure flow:**

**Companion selection (pre-adventure step):**
- Two-step flow on adventure detail page: select character → select companions
- New `GET /api/companions/available?characterId=X`: returns former companions from completed/abandoned campaigns (filters dead/hostile, deduplicates by name) + available roster characters with full stats
- New `POST /api/companion/promote`: creates a `characters` row + campaign from companion data; allows former companions to become the main playable character
- `POST /api/character/start-adventure` accepts optional `companions[]`; each companion added to initial `worldState.companions` with HP restored to max
- Multi-companion support: slot limit formula `min(3, max(1, 1 + max(0, adventure.levelMin - character.level)))`
- "Play as [Name]" path for former companions (no roster character equivalent — they're already in the picker)

**Carousing at adventure end:**
- `AdventureCompleteScreen` multi-phase flow: `victory → carousing → rolling → result → done`
- Carousing mechanic: 7 tiers (30gp–1800gp), roll d8 + tier bonus for XP; 14 thematic outcomes
- Animated dice tumble (18 ticks, biases toward final value)
- Gold deducted from character on completion; `/complete` API deferred until after carousing so XP/gold saves first

**Homepage UX:**
- "Continue Adventure" tiles: adventure name as gold heading, character info secondary, companions on third line
- Delete simplified to adventure-only (character row always preserved)
- Delete confirmation heading now shows adventure name
- Trash can SVG replaces × icon; tooltips on lock/delete via `group/tip` scoped Tailwind groups
- Fixed icon/date collision: actions moved into a dedicated flex column alongside the Link

**New adventure flow:**
- `/new-adventure` now skips the intermediate collapsed two-card state; lands directly with GM interview visible

**Production rules-loading fix:**
- `readFileSync` / `process.cwd()` silently fail in Cloudflare Workers (no filesystem) — rules were never loading in prod
- Before prompt caching refactor this was harmless (empty string in flat prompt); after Session 14's structured blocks, empty rules = empty text block = Anthropic API 400 rejection
- Fix: created `src/lib/rules/bundle.ts` — static imports of all 43 rule files via webpack `asset/source` + turbopack `raw-loader`; `rules-loader.ts` now reads from `RULE_FILES[filename]` instead of `readFileSync`
- Added `src/markdown.d.ts` ambient module declaration for `*.md` imports
- Added guard in `route.ts` to skip empty rules block (Anthropic rejects `{ type: "text", text: "" }`)
- Added `turbopack.rules` config in `next.config.ts` alongside webpack config (Next.js 16 defaults to Turbopack for builds)
- Installed `raw-loader` as devDependency

**Cleanup:**
- Removed leftover QA logging from `route.ts`
- Removed incorrect `system as string` cast in `client.ts` (SDK accepts `string | TextBlockParam[]` natively)
- Updated `feature-list.json`: companion-selection tests marked passing

**Build: clean ✓**

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
wrangler d1 execute bitterflame --remote --file=migrations/0012_cache_tokens.sql
```

**Build: clean ✓**

### Session 13 (2026-02-28)

**Account request flow fixes + create-password page:**

- Fixed `process.env` → `env.*` for all Cloudflare secrets (`RESEND_API_KEY`, `BETTER_AUTH_URL`) in both account-request routes — secrets set via `wrangler secret put` are only available on the Cloudflare `env` object, not `process.env`
- Added all secrets to `CloudflareEnv` type in `src/env.d.ts`
- Changed `void resend.emails.send()` to `await` in both routes so errors surface
- Fixed email addresses: `from` and `to` both updated to `gm@bybitterflame.com`
- Replaced 3-step approval flow (approve → forgot-password → another email → reset) with direct create-password flow:
  - Approve route no longer creates BetterAuth user; marks request `approved` and emails `/create-password?token=<token>`
  - New `/create-password` page: enter password + confirm → creates account → auto-signs in → redirects to `/`
  - New `POST /api/account-request/set-password` route: validates token (must be `approved`, not `completed`), creates BetterAuth user, marks token `completed`
- SPF fix noted: root `bybitterflame.com` SPF needs `include:spf.resend.com` added (Resend IPs not currently authorized — causes Gmail softfail)

### Session 12 (2026-02-28)

**Rebrand, license compliance, analytics, and housekeeping:**

- **Rules rewrite** — rewrote all creative text across 6 files (`gm-guidance.md`, `carousing.md`, `deities.md`, `traps-and-hazards.md`, `world.md`, `xp-awards.md`); mechanics preserved, flavor text fully original
- **Rebrand: "By Bitter Flame"** — all UI, email sender (`gm@bybitterflame.com`), page title updated across 11 files; `BETTER_AUTH_URL` needs updating when DNS switches to bybitterflame.com
- **Background image** — replaced old cover with new `dungeon-background.webp` (162KB); dark overlays removed (image is intentionally dark); all 9 pages + 2 components updated
- **Footer logo** — converted to WebP (13KB), added to home page footer (later removed)
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

- Created `src/lib/rules/world.md` — setting reference covering tone, tech level, ancestries (6 playable), gods (7 named + The Lost), magic, and society. Prevents anachronisms across all campaigns.
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
- DB migration applied: `drizzle/0001_adventure_fields.sql`

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

### Session (2026-03-10) — BTORCH-49: Companion gold + adventure reward splitting
- Added `gold?: number` to `Companion` type in `src/lib/game/types.ts`
- Updated `processGamestateUpdates.ts`: when `characterUpdate.gold` is a gain, split it equally among active companions; player retains rounding remainder; companions' gold incremented; `companionsChanged` flagged
- Updated `CarousingPhase.tsx`: accepts `activeCompanionCount`; computes per-tier player share; affordability check uses player share; shows "cost split N ways" note when companions present; shows "your share" vs "total" in tier list
- Updated `AdventureCompleteScreen.tsx`: computes party size split in `handleRoll`; tracks companion shortfalls (player covers if companion can't pay); stores `playerTierCost` and `companionShortfall` state
- Added `goldDeducted` and `goldShortfall` to `CompanionCarouseResult` type
- Updated `ResultPhase.tsx`: shows per-companion gold deductions; shortfall note in red; player gold breakdown (tier share + penalty + shortfall)
- Branch: `btorch-49-companion-gold`
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
