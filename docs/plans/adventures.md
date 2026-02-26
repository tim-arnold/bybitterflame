# Plan: Adventure Module System

## Context

Tabletop RPG sessions are commonly run using published "modules" — authored adventures with a defined plot, locations, NPCs, and maps. This feature adds support for selecting a oneshot adventure before starting a campaign so the AI GM can "run" it faithfully while still embellishing narratively.

The first collection is *Shots in the Dark #1* (18 oneshots, levels 1–6), already in `docs/adventures/shots-in-the-dark-1/`. Each oneshot is a standalone story — not a chapter in a campaign — with its own recommended level range, hook, locations, and maps. Maps come in GM and PC (player-character) variants; only PC maps are shown to players.

**Approved design choices:**
- System prompt gets a curated synopsis + key locations (not full text)
- Maps: new "Map" tab in right panel + auto-notification when GM signals entering a mapped area
- "GM creates character": brief 2–3 message interview, then GM generates the full character

---

## Data Architecture

### Adventure data files (`src/lib/adventures/`)

```
src/lib/adventures/
├── types.ts                    # AdventureCollection, Adventure, AdventureLocation types
├── index.ts                    # Re-exports all collections as ADVENTURE_COLLECTIONS[]
└── shots-in-the-dark-1.ts     # All 18 adventures in the collection
```

**Type shapes:**
```typescript
interface AdventureLocation {
  id: string;                    // "spore-garden"
  name: string;                  // "The Spore Garden"
  description: string;           // 1-3 sentences for GM brief
  npcs?: string[];               // ["Freya Blackwood, Sewer Witch"]
  hazards?: string[];            // ["Fungal seed infection: CON DC 12 or spores take root"]
  hasPcMap?: boolean;            // whether a PC map exists for this location
}

interface Adventure {
  id: string;                    // "spores-undercity"
  title: string;
  levelMin: number;
  levelMax: number;
  synopsis: string;              // 2-3 sentences for selection UI
  hook: string;                  // 1-2 sentences for GM opening
  locations: AdventureLocation[];
  keyNPCs: string[];
  specialMechanics: string[];    // ["Fungal infection: 7-day gestation, daily CON DC 12"]
  pcMapFile?: string;            // "Spores-Undercity-PC.png" (relative to collection maps/pc/)
}

interface AdventureCollection {
  id: string;                    // "shots-in-the-dark-1"
  title: string;                 // "Shots in the Dark #1"
  adventures: Adventure[];
}
```

### PC Maps — static serving

PC maps are copied from `docs/adventures/shots-in-the-dark-1/maps/pc/` to `public/adventures/shots-in-the-dark-1/`. They are served as static assets at `/adventures/shots-in-the-dark-1/[filename]`. GM maps remain in `docs/` only (not in `public/`, not served).

### Database — new campaign columns

New migration adds to the `campaigns` table:
- `campaign_type` TEXT NOT NULL DEFAULT 'standard' — `"standard"` or `"oneshot"`
- `module_id` TEXT — e.g., `"shots-in-the-dark-1"`
- `adventure_id` TEXT — e.g., `"spores-undercity"`

Drizzle schema and migration file updated accordingly.

### TypeScript types

`Campaign` type in `src/lib/game/types.ts` gains:
```typescript
campaignType?: "standard" | "oneshot";
moduleId?: string;
adventureId?: string;
```

---

## User Flow

```
Homepage
├── "Begin Your Adventure" → /create       (existing standard flow, unchanged)
└── "Choose an Adventure" → /adventures    (new)

/adventures
  → Browse all collections
  → Click a oneshot → /adventures/[collectionId]/[adventureId]

/adventures/[collectionId]/[adventureId]  (character selection)
  → Option A: Use existing character (list from /api/campaigns)
  → Option B: Create new character → /create?adventureId=...&collectionId=...
  → Option C: GM creates a character → /play/[campaignId] in "gm-create" mode
```

When option A or C is chosen, a new campaign is created via `POST /api/character` (extended to accept `moduleId`, `adventureId`, `campaignType`) and the player is redirected to `/play/[campaignId]`.

For option B, `moduleId`/`adventureId` are passed as query params through `/create` and forwarded to the `POST /api/character` call at the end of character creation.

---

## System Prompt Changes

`buildSessionPrompt()` in `src/lib/ai/prompts/session.ts` gets a new helper `buildAdventureBlock(adventure: Adventure): string` that returns a curated module brief:

```
--- ADVENTURE MODULE ---
You are running: Spores from the Undercity (Oneshot, Level 1)

HOOK: Unsettling spores have begun seeping from the city's storm drains...

KEY LOCATIONS:
1. The Drain Pipe — The stench-filled entry point...
2. The Spore Garden — A fungal bloom covering the floor...
   Hazards: Fungal seed infection — 7-day gestation; daily CON DC 12.
[...]

KEY NPCs:
- Freya Blackwood (Sewer Witch): Neutral but territorial...

SPECIAL MECHANICS:
- Fungal Infection: CON DC 12 each day or begin transformation (7 days to full fungal form).

MAP REVEAL INSTRUCTIONS:
When the player first enters an area that has a player map, emit:
  "mapReveal": { "locationName": "[name]" }
Areas with PC maps: [list from adventure data]

IMPORTANT: Run this adventure faithfully. Embellish atmosphere freely, but don't skip the core encounters.
```

Inject after the persona block, before the character block. Only included when `campaign.moduleId` and `campaign.adventureId` are set.

---

## Map Display

### New component: `src/components/game/MapViewer.tsx`
- Displays a PC map image in the right panel
- Zoom/pan with mouse (CSS transform-based)
- Shows "No map for current area" placeholder when no map available
- Image source: `/adventures/[collectionId]/[pcMapFile]`

### Right panel changes in `play/[campaignId]/page.tsx`
- Add "Map" tab to the tab list
- Tab shows a badge/dot when a new map has been revealed since last viewed

### Gamestate key: `mapReveal`

GM emits:
```json
{ "mapReveal": { "locationName": "The Spore Garden" } }
```

Play page matches `locationName` against the adventure's locations to find the right `pcMapFile`. Sets `currentMapFile` state, shows a toast notification, adds badge to Map tab.

### State parser changes
Add `mapReveal` to `extractUpdates()`:
```typescript
if (parsed.mapReveal) {
  updates.push({ type: "mapReveal", data: parsed.mapReveal });
}
```

Add `"mapReveal"` to the `GameStateUpdate` type union.

---

## GM Character Creation Mode

### New prompt: `src/lib/ai/prompts/adventure-create.ts`

Exports `buildAdventureCreatePrompt(adventure: Adventure): string`

Flow:
1. GM greets with adventure hook/atmosphere
2. GM asks 1–2 questions (fighting style, motivation)
3. GM silently picks ancestry, class, stats appropriate for adventure's level
4. GM reveals character: asks player to confirm or suggest a name, shows brief stats
5. GM emits full `characterUpdate` + `characterComplete` gamestate block

Uses `mode: "adventure-create"` in `/api/chat`. After `characterComplete`, the same `saveCharacter()` flow runs as standard creation.

---

## New Pages

### `/adventures/page.tsx`
- Loads `ADVENTURE_COLLECTIONS` from data module (no API call needed — static data)
- Each collection as a section; oneshots as cards
- Card: title, level range badge (color-coded by tier), synopsis, "Select" button

### `/adventures/[collectionId]/[adventureId]/page.tsx`
- Adventure detail: title, hook, level recommendation
- Three character options:
  - **Your Characters** — fetches `/api/campaigns`, lists active characters with level-match indicator (green = fits, yellow = borderline, gray = mismatch)
  - **Create New Character** — `/create?adventureId=...&collectionId=...`
  - **Let the GM Decide** — creates campaign immediately via `POST /api/character`, redirects to `/play/[campaignId]` with `gm-create` mode

---

## Files Modified / Created

### New files
| File | Purpose |
|------|---------|
| `src/lib/adventures/types.ts` | Type definitions |
| `src/lib/adventures/index.ts` | Re-exports all collections |
| `src/lib/adventures/shots-in-the-dark-1/index.ts` | Collection metadata + imports |
| `src/lib/adventures/shots-in-the-dark-1/[adventure-id].ts` | One file per adventure (×18) |
| `src/lib/ai/prompts/adventure-create.ts` | GM character creation prompt |
| `src/components/game/MapViewer.tsx` | Map image viewer component |
| `src/app/adventures/page.tsx` | Adventure browser page |
| `src/app/adventures/[collectionId]/[adventureId]/page.tsx` | Character selection page |
| `drizzle/000X_adventure_fields.sql` | DB migration |
| `public/adventures/shots-in-the-dark-1/` | PC map images (generated by copy-adventure-maps script) |
| `scripts/process-adventure.ts` | PDF → TypeScript structured data (uses pdfjs-dist + Claude) |
| `scripts/copy-adventure-maps.ts` | Copies pc/ maps from docs/ to public/ |

### Modified files
| File | Change |
|------|--------|
| `src/lib/game/types.ts` | Add `campaignType`, `moduleId`, `adventureId` to Campaign; add `"mapReveal"` to GameStateUpdate union |
| `src/lib/db/schema.ts` | Add `campaign_type`, `module_id`, `adventure_id` columns to campaigns |
| `src/lib/ai/prompts/session.ts` | Add `buildAdventureBlock()` helper + inject into `buildSessionPrompt()` |
| `src/lib/game/state-parser.ts` | Parse `mapReveal` key |
| `src/app/page.tsx` | Add "Choose an Adventure" link |
| `src/app/create/page.tsx` | Read `adventureId`/`collectionId` query params; pass to `saveCharacter()` |
| `src/app/api/character/route.ts` | Accept + persist `moduleId`, `adventureId`, `campaignType` |
| `src/app/api/campaign/[campaignId]/route.ts` | Return `moduleId`/`adventureId` in response |
| `src/app/api/chat/route.ts` | Handle `mode: "adventure-create"` |
| `src/app/play/[campaignId]/page.tsx` | Load adventure data; Map tab; `mapReveal` handler; gm-create mode |

---

## Developer Pipeline: Adding New Adventure Collections

This is a developer task only — no UI for loading modules. Source PDFs are copyrighted and gitignored.

### Gitignore additions
```
docs/adventures/**/*.pdf
docs/adventures/**/maps/gm/
```
PC maps in `docs/adventures/**/maps/pc/` and any dev notes remain in git.

### Scripts (`scripts/`)

**`process-adventure.ts`** — converts a PDF collection to structured TypeScript data files
```bash
npx tsx scripts/process-adventure.ts shots-in-the-dark-1
# Reads: docs/adventures/shots-in-the-dark-1/[pdf-name].pdf
# Writes: src/lib/adventures/shots-in-the-dark-1/[adventure-id].ts (one per adventure)
#         src/lib/adventures/shots-in-the-dark-1/index.ts
```

Process:
1. Locate the PDF in `docs/adventures/[collection-id]/` (finds the first `.pdf` in that dir)
2. Extract all text using `pdfjs-dist` (or `pdf-parse`)
3. Send the full text to Claude with a structured extraction prompt that asks it to identify each oneshot and output a JSON array matching the `Adventure` type
4. Write one TypeScript file per adventure with the structured data
5. Write an index file that aggregates all adventures into an `AdventureCollection`

Developer reviews the generated files and makes corrections before committing.

**`copy-adventure-maps.ts`** — copies PC maps to the public directory
```bash
npx tsx scripts/copy-adventure-maps.ts shots-in-the-dark-1
# Copies: docs/adventures/shots-in-the-dark-1/maps/pc/*
#      → public/adventures/shots-in-the-dark-1/
```

### Full developer workflow for a new collection

```
1. Obtain PDF + maps, place in:
     docs/adventures/[collection-id]/[title].pdf
     docs/adventures/[collection-id]/maps/gm/
     docs/adventures/[collection-id]/maps/pc/

2. npx tsx scripts/process-adventure.ts [collection-id]
   → generates src/lib/adventures/[collection-id]/ files

3. Review and edit generated TS files for accuracy

4. npx tsx scripts/copy-adventure-maps.ts [collection-id]
   → populates public/adventures/[collection-id]/

5. Add collection to src/lib/adventures/index.ts

6. git add src/lib/adventures/ public/adventures/
   (PDFs and GM maps stay gitignored)
```

### Adventure data file structure

Each collection gets its own directory with one file per adventure:
```
src/lib/adventures/
├── types.ts
├── index.ts                          # imports all collections
└── shots-in-the-dark-1/
    ├── index.ts                      # exports collection + imports all adventures
    ├── spores-undercity.ts
    ├── flooded-crypt.ts
    ├── rotting-gardens.ts
    └── ... (15 more)
```

This is more files than a single monolithic collection file, but makes individual adventures easy to review, correct, and maintain independently.

---

## Build Order

1. **Scripts**: `scripts/process-adventure.ts` + `scripts/copy-adventure-maps.ts`
2. **Run scripts**: process shots-in-the-dark-1 PDF → generate `src/lib/adventures/shots-in-the-dark-1/` files; copy PC maps to `public/adventures/`
3. **Types + data layer**: `adventures/types.ts` → review/edit generated adventure files → `index.ts`
4. **DB migration**: schema update + SQL migration file + `.gitignore` additions
5. **API changes**: `/api/character`, `/api/campaign/[id]`, `/api/chat`
6. **Prompt changes**: `buildAdventureBlock()` in session.ts; `adventure-create.ts`
7. **State parser**: `mapReveal` support
8. **MapViewer component**
9. **Play page**: Map tab + `mapReveal` handling + gm-create mode trigger
10. **Adventure browser pages**: `/adventures` and `/adventures/[c]/[a]`
11. **Homepage**: Add adventure link
12. **Create page**: Pass through adventure query params

---

## Verification

1. Browse to `/adventures` — all 18 oneshots listed with correct level ranges
2. Select an adventure → character selection page shows all three options
3. "Roll my own" → character creation works normally → play redirects with adventure context in DB
4. "Let GM decide" → brief interview → character created → `[BEGIN ADVENTURE]` triggers with adventure brief in prompt
5. Play page: GM narrates hook matching the selected module
6. GM emits `mapReveal` → Map tab badge appears + toast notification + correct PC map image displayed
7. Build clean (`npm run build`)
8. DB migration applies cleanly

---

## Out of Scope (Future)

- Adding new adventure collections (similar data authoring process)
- Fog-of-war or interactive maps (static image only for now)
- Level enforcement (mismatch is advisory only, not blocked)
- Existing character level-up before starting an out-of-range adventure