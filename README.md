# Shadowdark AI Game Master

An AI-powered Game Master for the [Shadowdark RPG](https://www.thearcanelibrary.com/pages/shadowdark). Create a character through a guided chat flow, then play through campaigns with Claude as your dungeon master.

## Features

- **Chat-driven character creation** — step-by-step with atmospheric narration, dice animations, and phased narrative reveals
- **Streaming AI responses** — Claude Sonnet narrates in real time with embedded game state updates
- **Animated dice rolls** — visual dice tumbling with dramatic pacing (flavor text, then scores on click)
- **Persistent GM persona** — the Game Master establishes an identity during character creation that carries across sessions
- **Selective rules loading** — only the relevant Shadowdark rules are included in each prompt based on game context
- **Responsive layout** — three-column desktop view (character sheet, chat, tools) with tabbed mobile navigation

## Getting Started

### Prerequisites

- Node.js 18+
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
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and click "Create Character" to begin.

## How It Works

```
Player types action → POST /api/chat → Server builds system prompt
→ Claude streams response → Client parses narrative + gamestate JSON
→ UI updates (character sheet, inventory, HP) → State persisted
```

The AI embeds structured JSON in fenced `` ```gamestate ``` `` blocks within its narrative. The client extracts these into typed game state updates that drive the UI — dice animations, character sheet changes, combat actions, and notifications.

### Character Creation Flow

1. Roll ability scores (3d6 in order, with animated dice)
2. Choose ancestry (Human, Elf, Dwarf, Halfling, Half-Orc, Goblin)
3. Choose class (Fighter, Priest, Thief, Wizard)
4. Choose alignment
5. Name your character and set pronouns
6. Choose background
7. Roll hit points
8. Roll starting gold and pick equipment

### Tech Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4** with typography plugin
- **Anthropic SDK** for Claude API streaming
- **React Markdown** for narrative rendering

## Project Structure

```
src/
  app/
    create/          # Character creation page
    play/[campaignId]/ # Gameplay session
    api/chat/        # Streaming chat endpoint
  components/
    chat/            # ChatWindow, ChatMessage, ChatInput, DiceRollDisplay
    character/       # CharacterSheet, AbilityScoreDisplay, HPTracker
    dice/            # DiceRoller, ManualDiceInput
    layout/          # GameLayout, MobileNav
  lib/
    ai/prompts/      # System prompts (initializer + session)
    ai/rules-loader  # Context-aware rules selection
    game/            # Types, dice logic, state parser
    rules/           # Shadowdark rules as markdown
```

## License

Private project. Shadowdark RPG is a product of [The Arcane Library](https://www.thearcanelibrary.com/).
