# Plan: Adventure Completion + Character Roster

Companion to `auth.md`. These two features are developed together because the character
roster requires a user identity to be meaningful — without auth, "your characters" has
no owner.

---

## Overview

When a one-shot adventure's goals are met and the player rests, the GM signals completion
via a new `adventureComplete` gamestate type. An end-of-adventure screen appears with a
short wrap-up and two choices: **Begin New Adventure** or **Return Home**. Both paths
mark the adventure as completed and the character is automatically added to the player's
roster — no "do you want to save?" prompt. Characters accumulate across adventures and
can be selected when starting any new adventure.

---

## Data Model Changes

### campaigns table
Add `status` column: `"active" | "completed"` (default `"active"`).

Already has `adventureId` and `moduleId` — so a completed campaign is the record of
"this character completed this adventure."

```sql
ALTER TABLE campaigns ADD COLUMN status TEXT NOT NULL DEFAULT 'active';
```

### characters table
No changes needed. Characters are already persisted. A character is "in the roster" if:
- They have at least one completed campaign (preferred), OR
- They are simply linked to the authenticated user via any campaign

Query for roster: all distinct characters where `campaigns.userId = $userId`.
Completed-adventure veterans are just sorted/highlighted.

---

## Gamestate Changes

### New update type: `adventureComplete`

Add to `GameStateUpdate` union in `types.ts`:

```ts
{ type: "adventureComplete"; summary: string }
```

`summary` is the GM's wrap-up paragraph (1–3 sentences of narrative closure).

### GM prompt addition

Add to `gm-guidance.md` (always-loaded):

```
## Adventure Completion

When the player has accomplished all stated adventure goals AND has returned to a
place of safety and rest, emit:

```gamestate
{"type":"adventureComplete","summary":"Brief narrative wrap-up, 1-3 sentences."}
```

Do this once, the moment the rest is narrated. Do not re-emit on subsequent turns.
```

---

## New Routes

### `POST /api/campaign/[campaignId]/complete`
- Requires auth (ownership check)
- Sets `campaigns.status = 'completed'`
- Returns `{ ok: true }`

---

## Frontend Changes

### `state-parser.ts`
Parse `adventureComplete` and emit as `GameStateUpdate`.

### `play/[campaignId]/page.tsx`
On receiving `adventureComplete` update:
1. Call `POST /api/campaign/[campaignId]/complete`
2. Store `{ isComplete: true, summary: "..." }` in state
3. Render `<AdventureCompleteScreen>` overlay

### New: `AdventureCompleteScreen.tsx`
Fixed overlay (similar to `DeathScreen`), shown after adventure completion.

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│   [GM wrap-up narrative paragraph]                  │
│                                                     │
│   [Character Name] has been saved to your roster.   │
│                                                     │
│   ┌──────────────────────┐  ┌────────────────────┐  │
│   │  Begin New Adventure │  │   Return to Home   │  │
│   └──────────────────────┘  └────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

- Both buttons mark completion (already done by the time this screen appears)
- **Begin New Adventure** → `/adventures` (character pre-selected, see below)
- **Return to Home** → `/`

### Adventure Browser (`/adventures`)
- Completed adventures show a "Completed" badge/overlay on their card
- Query: `GET /api/campaigns?userId=...` filtered for completed + has adventureId

### `GET /api/campaigns`
Add optional `?completed=true` param to return completed campaigns for badge rendering.

### Adventure Detail Page (`/adventures/[collectionId]/[adventureId]`)
Character selection currently has 3 options. Add a 4th:

```
┌─────────────────────────────────────────────┐
│  > Play as [Existing Character Name]  ←new  │  (shown if user has roster characters)
│    Roll my own character                    │
│    Let the GM create a character            │
│    Use an existing character (full list)    │
└─────────────────────────────────────────────┘
```

If the user has roster characters, the most-recently-played one is pre-highlighted.
"Use an existing character (full list)" opens a character picker showing all roster
entries.

### New: `GET /api/characters`
Returns all characters belonging to the authenticated user, with their last campaign
context (adventure name, level reached, date).

```ts
// Response shape
{ characters: Array<{
  id: string;
  name: string;
  class: string;
  ancestry: string;
  level: number;
  lastAdventure: string | null;   // adventure title
  lastPlayedAt: string | null;
}> }
```

### New: `/characters` page (optional, Phase 4)
Simple roster page showing saved characters as cards. Linked from home page nav.
Each card: name, class/ancestry, level, last adventure played. "Play" button → `/adventures`.

---

## How "Play as Existing Character" Works

When a player selects an existing character on the adventure detail page:
1. `/api/character/start-adventure` is called with the existing `characterId` (already exists)
2. A new campaign is created linked to that `characterId` and the new `adventureId`
3. The character's stats are carried forward as-is (level, equipment, XP reset to 0 for
   the new adventure, or kept — TBD)
4. Redirect to `/play/[newCampaignId]`

> **XP carries forward.** Character level and XP persist across adventures — playing the
> same character through multiple one-shots represents a continuous adventuring career.
> A character who hit level 2 in their first adventure starts the next one at level 2.

---

## Integration with Auth Plan

Auth must land first (or in parallel). The dependency:

| This feature needs | Auth provides |
|---|---|
| Character roster scoped to a user | `userId` on campaigns |
| Completed adventure badges per user | `userId` filter on campaign queries |
| `/api/characters` endpoint | `requireSession` + `userId` lookup |

If implementing simultaneously:
- Auth Phase 1+2 (install + stamp userId on new campaigns) unlocks this feature
- Existing campaigns without userId won't appear in the roster — acceptable, it's dev data

---

## Implementation Order

1. Auth Phase 1–2 (install BetterAuth, stamp userId on campaigns)
2. Add `status` column to campaigns + migration
3. `adventureComplete` gamestate type + parser + GM prompt rule
4. `POST /api/campaign/[campaignId]/complete` route
5. `AdventureCompleteScreen.tsx` component
6. Wire `adventureComplete` in `play/[campaignId]/page.tsx`
7. `GET /api/characters` route
8. Adventure detail page: "play as existing character" option
9. Adventure browser: completed badges
10. Auth Phase 3 (enforce ownership on all routes)
11. `/characters` roster page (optional polish)
