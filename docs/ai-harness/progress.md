# Progress

Current state of the project and recent work. Read this at the start of each session.

## Current State

Full end-to-end persistence is working. Character creation, gameplay loop, autosave, and session resume all work. Verified live with Dryn's campaign (Chaotic Elf Thief, 70K+ bytes of message history).

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

**What doesn't work yet:**
- Session management with AI-generated summaries (long-term memory across many sessions)
- Torch timer
- Combat tracker UI
- Deployment to Cloudflare Pages (/api/chat uses nodejs runtime for Anthropic SDK — needs fixing before CF deployment)

## DB Setup

- Local D1 SQLite: `.wrangler/state/v3/d1/` (populated via `npm run db:migrate:local`)
- Production D1: Create with `wrangler d1 create shadowdark`, update `database_id` in `wrangler.toml`, then run migration with `--remote` flag
- `initOpenNextCloudflareForDev()` in `next.config.ts` provides D1 binding during `npm run dev`

## Recent Work

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