# Plan: Token Optimization

Reduce per-turn API token usage without sacrificing GM quality.
Based on audit findings — see audit summary in progress.md Session 9.

---

## Current Baseline (per turn)

| Source | Size | Type |
|--------|------|------|
| `session.ts` static text | ~22KB | Always |
| Always-loaded rules | ~18KB | Always |
| Message history (20 msgs) | ~3KB | Always |
| Character/world blocks | ~1–2KB | Always |
| `spellcasting.md` | ~14KB | When casting |
| Adventure block | ~1–3KB | Module campaigns |
| `combat.md` | ~4KB | In combat |

**Typical non-combat turn: ~46KB. Casting turn: ~60KB.**

---

## Task 1 — Conditional Companions Block (Easy, ~1.5KB/turn)

**Problem:** `buildCompanionBlock()` in `session.ts` always injects the companion *rules*
section (~1.5KB of GM instructions for loyalty, death saves, hostile turn) even when
`worldState.companions` is empty.

**Fix:** Gate the entire companions rule section on `companions.length > 0`.
The `buildCompanionBlock()` helper already returns an empty string when there are no
companions — extend this so the surrounding rules prose is also omitted.

**File:** `src/lib/ai/prompts/session.ts`

**Change:**
```ts
// Before: companions rules always injected
const companionSection = `## Companions\n...rules...\n${buildCompanionBlock(companions)}`;

// After: entire section gated
const companionSection = companions.length > 0
  ? `## Companions\n...rules...\n${buildCompanionBlock(companions)}`
  : "";
```

**Estimated savings:** ~1.5KB every turn when no companions present (which is most turns).

---

## Task 2 — Split `exploration.md` (Moderate, ~3KB/turn unconditional)

**Problem:** `exploration.md` (149 lines, ~6KB) is always loaded. It covers:
- Light & darkness mechanics — **critical, needed every turn**
- Crawling round structure — needed during exploration
- Movement rates — needed during exploration
- Stealth & surprise — needed during exploration
- Climbing, swimming — rarely needed

Only light/darkness is truly needed every turn (torch timer, darkness enforcement).
The rest is exploration-mode content.

**Fix:** Split into two files:
- `light-and-darkness.md` (~30 lines, ~1.5KB) — ALWAYS loaded
- `exploration-mechanics.md` (~120 lines, ~4.5KB) — loaded when `exploring` flag set

**Files to create:**
- `src/lib/rules/light-and-darkness.md`
- `src/lib/rules/exploration-mechanics.md`

**File to delete:** `src/lib/rules/exploration.md`

**Rules loader change (`src/lib/ai/rules-loader.ts`):**
```ts
// Remove from ALWAYS_LOAD:
"exploration",

// Add to ALWAYS_LOAD:
"light-and-darkness",

// Add to CONTEXT_RULES:
exploring: ["exploration-mechanics"],
```

**Note:** The `exploring` GameContext flag already exists in `types.ts` but may need
to be set in `route.ts` context inference (currently only `inCombat`, `shopping`,
`casting`, `levelingUp` are inferred from message content).

**Estimated savings:** ~4.5KB every non-exploration turn (unconditional reduction).

---

## Task 3 — Tier-Gated `spellcasting.md` (Most effort, 5–8KB on casting turns)

**Problem:** `spellcasting.md` (343 lines, ~14KB) contains:
- General spellcasting rules (~3KB)
- Full Wizard spell list, Tiers 1–5 (~5.5KB)
- Full Priest spell list, Tiers 1–5 (~5.5KB)

When any spell is cast, all 14KB loads. A level-1 Wizard casting `Light` gets every
tier-5 Wizard and Priest spell sent in context unnecessarily.

**Fix:** Split into per-tier files and load only up to the character's tier.
Character tier = `Math.ceil(character.level / 2)` (Shadowdark standard).

**Files to create:**
- `src/lib/rules/spellcasting-core.md` — mechanics only (~3KB, always loaded when casting)
- `src/lib/rules/spellcasting-t1.md` — Tier 1 spells, Wizard + Priest
- `src/lib/rules/spellcasting-t2.md` — Tier 2 spells
- `src/lib/rules/spellcasting-t3.md` — Tier 3 spells
- `src/lib/rules/spellcasting-t4.md` — Tier 4 spells
- `src/lib/rules/spellcasting-t5.md` — Tier 5 spells

**File to delete:** `src/lib/rules/spellcasting.md`

**Rules loader change:** The loader currently takes a `GameContext` and returns file
names. Needs access to `character.level` to determine max tier. Signature change:

```ts
// Current:
export function loadRules(context: GameContext): string

// New:
export function loadRules(context: GameContext, character?: Character): string
```

**Loading logic:**
```ts
if (context.casting) {
  filesToLoad.push("spellcasting-core");
  const maxTier = Math.ceil((character?.level ?? 1) / 2);
  for (let t = 1; t <= maxTier; t++) {
    filesToLoad.push(`spellcasting-t${t}`);
  }
}
```

**Estimated savings per casting turn:**
- Level 1–2 char: loads T1 only → saves ~10KB (was 14KB, now ~4KB)
- Level 3–4 char: loads T1–2 → saves ~7KB
- Level 5–6 char: loads T1–3 → saves ~4KB
- Level 9–10 char: loads all tiers → no savings (but rare)

---

## Task 4 — Deduplicate Equipment Schema (Low effort, ~1KB on creation)

**Problem:** Equipment slot format defined identically in:
- `session.ts` lines 186–198
- `initializer.ts` lines 71–100
- `adventure-create.ts` lines 39–50

**Fix:** Extract to `src/lib/ai/prompts/equipment-schema.ts` and import in all three.

---

## Task 5 — Compress `gm-guidance.md` (Medium effort, ~3KB/turn)

**Problem:** `gm-guidance.md` (~8KB, always loaded) contains both:
- Core GM behaviour (DCs, telegraphing, running NPCs) — needed every turn
- Rare-use sections (carousing rules, death philosophy) — needed infrequently

**Fix:** Split into:
- `gm-guidance.md` — core ethos only (~5KB) — ALWAYS loaded
- `gm-guidance-extended.md` — carousing, long-term consequences — loaded conditionally

---

## Implementation Order

1. Task 1 — Companions conditional (30 min, biggest ease/impact ratio)
2. Task 2 — Split exploration.md (1 hour)
3. Task 3 — Tier-gated spellcasting (2 hours)
4. Task 4 — Equipment dedup (30 min)
5. Task 5 — gm-guidance split (1 hour)

---

## Verification

After each change:
- `npm run build` — confirm clean
- Manual play test: verify GM still has correct context in affected scenarios
- Check rules-loader unit: confirm correct files load for each context

## Not In Scope Here

- Session summarization → see `docs/plans/session-summarization.md`
- Message history pruning → depends on summarization
