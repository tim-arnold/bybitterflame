# Rebrand Deployment: By Bitter Flame

Steps to cut over from `bytorchlight.com` to `bybitterflame.com` in production.
All code changes are done and deployed on branch `btorch-10-rebrand-bitter-flame`.

---

## 1. Purchase domain

Buy `bybitterflame.com` and add it to your Cloudflare account (or transfer DNS to Cloudflare).

---

## 2. Cloudflare DNS → Workers route

In the Cloudflare dashboard for `bybitterflame.com`:

1. Add a DNS record pointing to your Worker:
   - Type: `AAAA`, Name: `@`, Content: `100::` (placeholder — Workers routes override this)
   - Proxied: ✅
2. Go to **Workers & Pages → your worker (`bitterflame`) → Settings → Domains & Routes**
3. Add route: `bybitterflame.com/*` → worker `bitterflame`
4. Also add `www.bybitterflame.com/*` if you want www to work

---

## 3. Update Cloudflare secrets

```bash
# BetterAuth needs to know its own URL for cookie domain + OAuth callbacks
wrangler secret put BETTER_AUTH_URL
# Enter: https://bybitterflame.com

# BETTER_AUTH_SECRET stays the same — no change needed
```

---

## 4. Resend — verified domain

1. Log in to [resend.com](https://resend.com) → **Domains**
2. Add `bybitterflame.com` as a new verified domain
3. Add the DNS records Resend gives you (DKIM TXT records) to Cloudflare DNS
4. Add SPF record to Cloudflare DNS:
   - Type: `TXT`, Name: `@`
   - Content: `v=spf1 include:spf.resend.com ~all`
5. Wait for Resend to verify (usually a few minutes)
6. Update the **from address** in Resend if you have a sending identity configured

The `gm@bybitterflame.com` address is already in code — no code change needed once the domain is verified.

---

## 5. Deploy the rebrand branch

```bash
git checkout btorch-10-rebrand-bitter-flame
npx @opennextjs/cloudflare build
wrangler deploy
```

Or merge to `main` and let GitHub Actions deploy automatically.

---

## 6. Redirect bytorchlight.com → bybitterflame.com

To preserve any existing links/bookmarks:

**Option A — Cloudflare Redirect Rule (recommended):**
1. In Cloudflare dashboard for `bytorchlight.com` → **Rules → Redirect Rules**
2. Create rule:
   - Match: `Hostname equals bytorchlight.com`
   - Action: Dynamic redirect
   - URL: `https://bybitterflame.com${http.request.uri.path}`
   - Status code: 301

**Option B — Worker redirect (if you prefer code):**
Deploy a tiny Worker on `bytorchlight.com` that returns 301s.

---

## 7. Update assets subdomain

`images.bybitterflame.com` is configured in `wrangler.toml` as `NEXT_PUBLIC_ASSETS_URL` for Cloudflare R2 adventure map images. If R2 is in use:

1. Add CNAME in Cloudflare DNS for `bybitterflame.com`:
   - Type: `CNAME`, Name: `images`, Content: your R2 bucket public URL
2. Or update the R2 custom domain in the Cloudflare dashboard

If R2 is not yet configured, this env var is a no-op in production (asset paths fall back to `/public`).

---

## 8. Smoke test checklist

- [ ] `https://bybitterflame.com` loads homepage
- [ ] Sign up / sign in works (BetterAuth cookie domain)
- [ ] Request access email arrives from `gm@bybitterflame.com`
- [ ] Approval email sends create-password link to `https://bybitterflame.com/create-password?token=...`
- [ ] `https://bytorchlight.com` → 301 → `https://bybitterflame.com`
- [ ] Character creation → gameplay works end-to-end
- [ ] Resend domain shows "Verified" status

---

## 9. After cutover

Once everything is verified:

```bash
# Update the secret if you haven't already
wrangler secret put BETTER_AUTH_URL
# https://bybitterflame.com
```

Keep `bytorchlight.com` registered and redirecting for at least 6–12 months for SEO and bookmark continuity.
