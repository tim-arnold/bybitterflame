# Progress

Current state of the project and recent work. Read this at the start of each session.

## Current State

The character creation flow is fully working end-to-end in the browser. Cloudflare D1 persistence is wired up — character save and campaign creation work, and the gameplay loop loads real data from DB.

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
- Campaign state save on each turn (`/api/campaign/[campaignId]/save`)
- Campaign + character load on gameplay start (`/api/campaign/[campaignId]`)

**What doesn't work yet:**
- Session save/resume (session records not yet created; messages not persisted between browser refreshes)
- Torch timer
- Combat tracker UI
- Deployment to Cloudflare Pages (runtime = "edge" routes work in dev; /api/chat still uses nodejs runtime for Anthropic SDK EventEmitter — needs fixing before CF deployment)

## DB Setup

- Local D1 SQLite: `.wrangler/state/v3/d1/` (populated via `npm run db:migrate:local`)
- Production D1: Create with `wrangler d1 create shadowdark`, update `database_id` in `wrangler.toml`, then run migration with `--remote` flag
- `initOpenNextCloudflareForDev()` in `next.config.ts` provides D1 binding during `npm run dev`

## Recent Work

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
- Wired POST /api/campaign/[campaignId]/save — updates character + campaign in D1
- Updated create/page.tsx — tracks campaign state, handles characterComplete, saves to DB, redirects to /play/[campaignId]
- Applied local D1 migration (3 tables created successfully)
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