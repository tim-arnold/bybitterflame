# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-powered Game Master for the Shadowdark RPG tabletop game. A single player creates a character through a guided chat flow, then plays through campaigns with Claude AI as the dungeon master. Sessions persist across weeks/months via summaries.

## Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build (uses Turbopack)
npm run lint     # ESLint
```

## Architecture

**Stack**: Next.js 16 (App Router) + TypeScript + Tailwind CSS v4

### AI Interaction Pattern

```
Player types action → POST /api/chat → Server builds system prompt
→ Claude Sonnet streams response → Client parses narrative + ```gamestate``` JSON blocks
→ UI updates (character sheet, inventory, HP) → State persisted
```

The AI embeds structured JSON in fenced ` ```gamestate ``` ` blocks within its narrative. `src/lib/game/state-parser.ts` extracts these into typed `GameStateUpdate` objects (characterUpdate, campaignUpdate, combatAction, diceRoll, notification).

### Dual-Agent Prompting

- **Initializer** (`src/lib/ai/prompts/initializer.ts`): Guides character creation step by step
- **Session** (`src/lib/ai/prompts/session.ts`): Assembled dynamically per turn with character data, campaign state, session summaries, and selectively loaded rules

### Selective Rules Loading

`src/lib/ai/rules-loader.ts` picks which rules markdown files to include in the system prompt based on `GameContext` flags (inCombat, exploring, casting, etc.). Rules live in `src/lib/rules/*.md` — curated from the Shadowdark v4.9 PDF.

### Key Data Types

All core types in `src/lib/game/types.ts`: Character, Campaign, Session, GameContext, GameStateUpdate, ParsedResponse, DiceResult.

### Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing page |
| `/create` | Character creation (chat-driven, auto-starts) |
| `/play/[campaignId]` | Gameplay session |
| `/api/chat` | Streaming chat endpoint (mode: "create" or "play") |
| `/api/campaign/[campaignId]` | Load campaign data |
| `/api/campaign/[campaignId]/save` | Persist campaign state |

### Layout

Three-column `GameLayout` on desktop (left sidebar: character sheet, center: chat, right: tools). Tabbed on mobile via `MobileNav`.

## Environment Variables

- `ANTHROPIC_API_KEY` — required for Claude API access

## TODO / Not Yet Wired

- Database (Cloudflare D1 via Drizzle) — schema exists at `src/lib/db/schema.ts` but campaign API routes return stub data
- Session save/resume with AI-generated summaries
- Deployment config (wrangler.toml for Cloudflare Pages)
