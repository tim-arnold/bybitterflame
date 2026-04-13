# Pricing & Payment Plan

## Payment Processor

**Stripe** is the right choice:
- No card data touches the app (Stripe.js handles it all)
- Excellent subscription + metered billing support
- Strong Next.js/API route integration
- Handles taxes (Stripe Tax addon)
- Usage records API for metered billing

Alternatives: Paddle (better for global tax handling), LemonSqueezy (simpler but less flexible).

---

## Core Tradeoff

Cost structure is **per-token** (Claude API). Pricing model must either:
- **Bound exposure** (subscriptions with limits)
- **Pass through variably** (credits/wallet)
- **Eat the variance** (flat unlimited — risky)

---

## Pricing Model Options

### Option A: Subscription Tiers (Capped Usage)
| Tier | Price | Allowance |
|------|-------|-----------|
| Free | $0 | ~10 sessions/mo |
| Adventurer | $8/mo | ~50 sessions/mo |
| Hero | $20/mo | ~200 sessions/mo |

**Pros:** Predictable revenue, easy to understand, fits SaaS norms
**Cons:** Must define "session" precisely; hard to stop power users from burning budget

### Option B: Prepaid Credit Wallet
User buys credit packs; each AI exchange costs credits.

**Pros:** Zero risk, aligns cost to usage, players buy when they want to play
**Cons:** Feels transactional, breaks immersion, players hoard/obsess over credits

### Option C: Hybrid (Recommended)
- **Free tier**: Limited trial (500 AI exchanges lifetime)
- **Subscription**: Grants a monthly credit refresh
- **Top-up**: Buy extra credits any time if you hit the ceiling

This is what most AI apps land on (e.g. ChatGPT Plus + API credits).

---

## What to Track

```
UserUsage table:
- user_id
- period_start / period_end
- exchanges_used     (user-facing unit)
- tokens_used        (internal cost modeling)
- credits_balance    (if wallet enabled)
```

**Unit:** Track **exchanges** (one player message + one AI response = 1 exchange) as the user-facing unit. Track **tokens** internally for cost accounting. Exchanges are easier to explain than tokens.

---

## Recommended Starting Point

| Tier | Price | Exchanges/mo |
|------|-------|--------------|
| Free | $0 | 100 (lifetime trial) |
| Standard | $9/mo | 500 |
| Unlimited | $20/mo | 2000 |
| Top-up | $5 | +300 |

**Rationale:**
- 100 free exchanges is enough to experience the full character creation + early gameplay loop
- $9 is impulse-buy territory for tabletop players
- 2000 exchanges at $20/mo leaves comfortable Claude API margin at current pricing
- Top-ups prevent churn when someone hits their limit mid-campaign

**Campaigns are unlimited on all tiers.** There's no meaningful cost difference between 1 campaign and 10 — the cost is in exchanges, not campaigns. If a player accumulates more than 10 active campaigns, prompt them to clean up (archive/delete old ones) as a UX courtesy, not a hard limit.

---

## BYOK (Bring Your Own Key)

Players who provide their own Anthropic API key bypass exchange limits entirely — their token costs hit their own API account. BYOK is not offered alongside paid tiers; it's an alternative path for users who prefer direct API billing.

Current behavior: BYOK users get a limited number of free server-key turns (`SERVER_KEY_TURN_LIMIT`), then must add their own key to continue. This remains the free tier experience. Paid subscriptions replace the need for BYOK — subscribers use server-side API keys with exchange-based limits.

---

## Grace Period & Limit Enforcement

Hard-cutting a player mid-combat or mid-scene would be terrible UX. Rules:

1. **Never interrupt combat.** If a player hits their exchange limit while `inCombat` is true in game context, allow exchanges to continue until combat resolves (the AI emits a gamestate block ending combat).
2. **Finish the current scene.** Outside combat, grant a small grace buffer (e.g. 5 extra exchanges) so the AI can reach a natural stopping point. The system prompt should instruct the GM to wrap up the scene and suggest pausing.
3. **Hard stop after grace.** Once the grace buffer is exhausted, block further exchanges with a clear message: "You've used all your exchanges this month. Subscribe or top up to continue."
4. **No GM manipulation.** The exchange limit is enforced server-side in the chat route, not by the AI. The player cannot talk the GM into continuing — the API route simply rejects the request before it reaches Claude. The AI never sees the limit or knows about it; it's a gate in front of the AI, not a rule the AI follows.
5. **Visibility.** Show remaining exchanges in the UI (account page and/or subtle indicator during play) so players aren't surprised.

---

## Implementation Prerequisites & Order

**Already built:**
- **Auth** — BetterAuth v1.4.19 with D1 adapter, email+password, session cookies, campaign scoping by userId
- **`users` table** — exists with `total_input_tokens`, `total_output_tokens`, `total_cache_write_tokens`, `total_cache_read_tokens` columns for cost accounting
- **BYOK flow** — `SERVER_KEY_TURN_LIMIT` gating, API key storage in user settings

**To build:**
1. **`user_usage` table** — add to D1 schema (period tracking, exchange counts, credits balance)
2. **Exchange counting** — increment per AI response in `/api/chat` route's `onComplete` callback (already tracks tokens there)
3. **Usage gate** — check exchange count + grace period logic before calling Claude in `/api/chat`
4. **Stripe Checkout** — subscription creation (Standard/Unlimited) and one-time top-up purchases
5. **Stripe webhooks** — `POST /api/stripe/webhook` to handle subscription lifecycle (created, renewed, cancelled, payment_failed); resets monthly exchange count on renewal
6. **UI** — exchange counter display, upgrade prompts, limit-reached screen, account page billing section