# Progress

Current state of the project and recent work. Read this at the start of each session.

## Current State

The character creation flow is fully working end-to-end in the browser. The gameplay loop UI works but uses stub data (no database persistence yet).

**What works:**
- Character creation at `/create` — full 9-step chat flow with Claude as GM
- Dice roll animations with phased narrative reveal (gamestate block → dice tumble → flavor text → Continue → scores)
- Streaming AI responses with gamestate suppression during dice rolls
- Live character sheet sidebar updates from gamestate blocks
- GM persona established during creation, stored for session reuse
- Pronoun support throughout narration and NPC dialog
- Selective rules loading based on game context
- Responsive three-column layout with mobile tabs

**What doesn't work yet:**
- Database persistence (schema exists, API routes return stubs)
- Character creation → gameplay handoff (no redirect to `/play/[campaignId]`)
- Session save/resume
- Torch timer
- Combat tracker UI
- Deployment

## Recent Work

### Session 1 (2026-02-24)
- Implemented dice animation phased reveal (gamestate-first streaming, `---` split, Continue button)
- Fixed streaming → final component transition (merged display array preserves React instance)
- Removed clickable option lists in favor of chat-only input
- Added auto-focus on chat input when AI finishes responding
- Added pronouns to character creation (Step 5) and session prompts
- Added GM persona persistence via `campaign.gmPersona`
- Updated feature-list.json to reflect actual state
- Initial commit + README
