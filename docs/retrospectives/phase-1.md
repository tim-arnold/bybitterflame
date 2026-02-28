# Phase 1 Retrospective — By Torchlight

**Period:** Feb 24–28, 2026
**Total commits:** 126
**Estimated active hours:** ~39–40 hours over 5 days

---

## Working Hours Breakdown

Using session-based estimation (gaps >2 hours treated as breaks):

| Day | Active Window | Estimated Hours |
|-----|--------------|-----------------|
| Feb 24 | 1:24 PM – 7:46 PM | ~6.5 h |
| Feb 25 | 10:47 AM – 9:45 PM | ~11 h |
| Feb 26 | 12:21 PM – 6:12 PM | ~6 h |
| Feb 27 | 9:33 AM – 5:49 PM, then 10:47 PM – midnight | ~9.5 h |
| Feb 28 | midnight (1 commit), 9:49 AM – 4:11 PM | ~6.5 h |

**Total: ~39–40 hours**

---

## What Was Built

### Day 1 — Feb 24: Foundation
Initial commit through full D1 persistence working. Character creation chat flow, dice animation, equipment accordion, Cloudflare D1 auto-save, and the AI agent harness for session continuity.

### Day 2 — Feb 25: Game Systems + Deployment
The heaviest day (~11 hours). Companion NPCs with full stat sheets, soul transfer on player death, torch mechanics (timer, burnout, darkness enforcement), death screen, time/weather tracking, Traveler's Journal, and full Cloudflare production deployment including CI/CD.

### Day 3 — Feb 26: Adventure Modules
Adventure module system (Shots in the Dark #1), map-derived spatial awareness, automatic level-up detection, XP rules hardening, campaign list with lock toggle, cover art background, and GM-create character flow.

### Day 4 — Feb 27: Auth + Polish
BetterAuth authentication (phases 1–2), per-user Anthropic API key (BYOK) with free-tier turn limit, adventure completion flow, character roster, auth ownership enforcement, conditional rules loading for token optimization, character creation UX overhaul (numbered choices, pronoun gate easter egg, ancestry list, name suggestions), full rules files rewrite (encounter tables, luck tokens, traps, scrolls, XP), and a late-night session adding token usage tracking and spell/equipment lookup tables.

### Day 5 — Feb 28: Launch Prep
Rebrand from ShadowDork to By Torchlight, Shadowdark Third-Party License compliance (attribution, rules rewrite, logos), session summarization with GM arc notes, world bible, in-game Settings modal, How to Play page, mobile hamburger nav, forgot/reset password flow, account request/approval flow, GA4 analytics, production DB migrations, and final bug fixes.

---

## Notable Patterns

- **Commit velocity:** ~3.2 commits/hour — rapid iteration with small, focused changes
- **AI-assisted sessions:** ~13 sessions over 5 days (~3 hours each), tracked via the ai-harness
- **Feb 25 was the deepest day** — most complex interconnected systems built in a single stretch
- **Feb 27 was the widest day** — most features shipped across the most surface area
- **Feb 28 was a launch day** — compliance, branding, and polish rather than new systems

---

## Phase 1 Scope (What Shipped)

- Full character creation chat flow (10-step, dice-animated)
- Live gameplay loop with Claude as GM (streaming, gamestate JSON parsing)
- Adventure module system with spatial awareness
- Companion NPCs and soul transfer on death
- Torch/light mechanics with real-time countdown
- Cloudflare D1 persistence + CI/CD deployment
- BetterAuth authentication with BYOK support
- Session summarization and world bible
- Shadowdark Third-Party License compliance
- Production launch at bytorchlight.com