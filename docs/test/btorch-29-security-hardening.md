# BTORCH-29 Test Plan: Security Hardening

Branch: `btorch-29-security-hardening`

---

## Pre-deploy (blocking)

- [ ] Run migration against production D1 **before** deploying code:
  ```
  wrangler d1 execute DB --remote --file=migrations/0016_rate_limits.sql
  ```

---

## Fix 1: Ownership check in `/api/character/start-adventure` ✅ PASSED

- [x] As User B, call `POST /api/character/start-adventure` with a `sourceCampaignId` belonging to User A → expect **403 Forbidden**
- [x] As User A, start a new adventure from your own campaign via the UI → expect success, new campaign created
- [x] Start an adventure via the `characterId` path (Path B) → expect success, unaffected by the ownership check

---

## Fix 2: Rate limiting ✅ PASSED

### Pre-check
- [x] Confirm `rate_limits` table exists in production after running the migration above

### `/api/account-request` (limit: 5/hr per IP)
- [x] Submit the account request form 5 times in quick succession → first 5 succeed (or silently deduplicate)
- [x] Submit a 6th time → expect **429 Too Many Requests**
- [x] Wait for the hour window to roll over → requests succeed again

### `/api/bug-report` (limit: 10/hr per IP)
- [x] Submit 10 bug reports via the in-game feedback form → all succeed
- [x] Submit an 11th → expect **429 Too Many Requests**

### `/api/chat` anonymous (limit: 30 requests / 10 min per IP)
- [x] Authenticated gameplay — play several turns → no rate limit applied, chat works normally
- [N/A] Unauthenticated chat — app requires login, no anonymous chat path exists

### Fail-open safety net
- [x] If you can test with the `rate_limits` table absent (e.g. local dev before migration), confirm that `/api/account-request` and `/api/bug-report` still return normal responses (not 500s)

---

## Fix 3: Admin helper (`isAdmin`) ✅ PASSED

- [x] Log into the admin panel as `gm@bybitterflame.com`
  - [x] Delete a test user → success
  - [x] Set a beta key on an account request → success
  - [x] Set a beta key on a user → success
  - [x] Grant bonus turns to a user → success, notification email sent
- [x] As a non-admin user, attempt to hit an admin endpoint directly (e.g. `PATCH /api/admin/users/{id}/turns`) → expect **403 Forbidden**

---

## Fix 4: Zod validation ✅ PASSED

### `/api/character/start-adventure`
- [x] Start an adventure normally via the UI → success
- [x] Send a malformed body (e.g. `sourceCampaignId: 123` — not a UUID string) directly → expect **400**

### `/api/campaign/[id]/save`
- [x] Play a turn and confirm auto-save works (check network tab for 200 response)
- [x] Send `sessionNumber: 0` directly → expect **400** (min is 1)

### `/api/companion/promote`
- [x] If you have a save with a companion, promote them to a full character → success
- [x] Send a body with `moduleId: ""` directly → expect **400** (min length 1)

### `/api/bug-report` description cap
- [x] Submit a bug report with a very long description (>5000 chars) → submits successfully, Jira issue created (description truncated to 5000 chars)

---

## Regression: general smoke test ✅ PASSED

- [x] Full character creation flow completes without errors
- [x] Load an existing campaign and play a turn
- [x] Save/resume works across page reload
- [x] Account request form submits and admin receives email
- [x] Bug report form submits and Jira issue is created
