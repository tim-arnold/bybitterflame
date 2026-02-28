# By Torchlight

An AI-powered Game Master for the [Shadowdark RPG](https://www.thearcanelibrary.com/pages/shadowdark). Create a character through a guided chat flow, then play through campaigns with Claude as your dungeon master. Sessions persist across days and weeks via AI-generated summaries.

Live beta: **[bytorchlight.com](https://bytorchlight.com)** (currently at dark.tim52.io during DNS transition)

## Features

- **Primarily chat-driven** — type what you do, the GM narrates what happens. No button menus.
- **Chat-driven character creation** — step-by-step with atmospheric narration, dice animations, and phased narrative reveals
- **Streaming AI responses** — Claude Sonnet narrates in real time with embedded game state updates
- **Animated dice rolls** — visual dice tumbling with dramatic pacing (flavor text → Continue → scores)
- **Persistent GM persona** — the Game Master establishes an identity during character creation that carries across all sessions
- **Session summaries** — end a session and resume later; the GM recalls what happened via AI-generated summaries
- **Companion NPCs** — NPCs can join your party with full stat sheets, personality, loyalty tracking, and death saves
- **Soul transfer** — when your character dies, inherit a companion and keep adventuring
- **Torch timer** — real-time 60-minute countdown; darkness has mechanical consequences
- **Adventure modules** — pre-written oneshot adventures with maps, locations, and GM context (Shots in the Dark vol. 1)
- **Combat tracker** — initiative order and round tracking
- **Traveler's Journal** — player-side notes that persist across sessions
- **Selective rules loading** — only relevant Shadowdark rules included in each prompt based on game context
- **Responsive layout** — three-column desktop view (character sheet | chat | tools) with tabbed mobile navigation
- **User accounts** — BetterAuth email+password; campaigns scoped to user; API key stored encrypted
- **Bring your own API key** — 20 free turns, then add your own Anthropic key; lifetime token usage tracked in /account

## Getting Started

### Prerequisites

- Node.js 18+
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (for local D1 database)
- An [Anthropic API key](https://console.anthropic.com/)

### Setup

```bash
git clone <repo-url>
cd shadowdark
npm install
```

Create a `.env.local` file:

```
ANTHROPIC_API_KEY=your-key-here
BETTER_AUTH_SECRET=any-random-string
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Apply the local D1 schema:

```bash
wrangler d1 execute shadowdark --local --file=schema.sql
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How It Works

```
Player types action → POST /api/chat → Server builds system prompt
→ Claude Sonnet streams response → Client parses narrative + ```gamestate``` JSON blocks
→ UI updates (character sheet, inventory, HP) → State auto-saved to D1
```

The AI embeds structured JSON in fenced `` ```gamestate ``` `` blocks within its narrative. The client extracts these into typed game state updates that drive the UI — dice animations, character sheet changes, combat actions, companion events, and notifications.

### Character Creation Flow

Two paths:

1. **Roll your own** (`/create`) — step-by-step chat with the GM:
   - Roll ability scores (3d6 in order, animated)
   - Choose ancestry, class, alignment, background
   - Name and pronouns
   - Roll hit points and starting gold, pick equipment

2. **Let the GM Decide** — answer 2 quick questions, jump straight into the adventure; GM builds your character in the opening scene

### Tech Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4**
- **Anthropic SDK** — Claude Sonnet for gameplay, Claude Haiku for session summaries
- **Cloudflare Workers** + **D1** (SQLite) via OpenNext
- **BetterAuth v1.4.19** with Drizzle adapter for auth
- **Drizzle ORM** for type-safe D1 queries
- **Resend** for transactional email (`gm@bytorchlight.com`)

## Project Structure

```
src/
  app/
    /                    # Home / campaign list
    adventures/          # Adventure module browser + detail
    create/              # Character creation (chat-driven)
    play/[campaignId]/   # Gameplay session
    account/             # API key + token usage settings
    api/                 # All API routes (chat, campaign, character, auth, user)
  components/
    chat/                # ChatWindow, ChatMessage, ChatInput, DiceRollDisplay
    character/           # CharacterSheet, AbilityScoreDisplay, HPTracker
    dice/                # DiceRoller, ManualDiceInput
    game/                # TorchTimer, CombatTracker, CompanionPanel, DeathScreen,
                         # AdventureCompleteScreen, SessionControls, TravelersJournal
    layout/              # GameLayout, MobileNav
  lib/
    ai/prompts/          # System prompts (initializer, session, adventure-create)
    ai/rules-loader.ts   # Context-aware rules selection
    adventures/          # Adventure module data (Shots in the Dark vol. 1)
    analytics.ts         # GA4 trackEvent() utility
    auth/                # BetterAuth setup (server + client)
    config.ts            # Shared constants (turn limits, token costs)
    db/                  # Drizzle schema + D1 client
    game/                # Core types, dice logic, state parser
    rules/               # Shadowdark rules as markdown (selectively loaded)

schema.sql               # Single source of truth for D1 schema
docs/
  ai-harness/            # AI session continuity (progress.md, feature-list.json)
  guides/                # Developer guides (ga4-events.md, etc.)
  plans/                 # Architecture planning docs
```

## Deployment

Deployed to Cloudflare Workers via CI/CD on push to `main`.

```bash
npx @opennextjs/cloudflare build   # Build for Cloudflare
wrangler deploy                    # Deploy worker
```

D1 schema: `wrangler d1 execute shadowdark --remote --file=schema.sql`

Required Cloudflare secrets: `ANTHROPIC_API_KEY`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `RESEND_API_KEY`

## License

Private project. By Torchlight is an independent product published under the Shadowdark RPG Third-Party License and is not affiliated with The Arcane Library, LLC. Shadowdark RPG © 2023 The Arcane Library, LLC.
