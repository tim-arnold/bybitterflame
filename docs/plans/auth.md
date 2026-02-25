# Auth Plan: BetterAuth + Cloudflare D1

## Why BetterAuth (and the alternatives)

| Library | Verdict |
|---|---|
| **BetterAuth** | ✅ Recommended — Drizzle adapter built-in, TypeScript-first, email+password + OAuth in one package, good learning investment |
| **Auth.js v5 (NextAuth)** | ✅ Strong alternative — more battle-tested, industry standard, edge-first, excellent Next.js docs |
| **Clerk** | ❌ Skip for this project — hosted/black-box, doesn't use your D1, less educational, $$ at scale |
| **Lucia** | ❌ Archived/deprecated |

BetterAuth is a solid choice here. It has a Drizzle adapter that works with SQLite/D1, supports email+password out of the box, and adds OAuth with minimal config. The one complexity is initializing it against a D1 binding — documented in detail below.

---

## What Changes

### Data model
- Add four BetterAuth tables to D1: `user`, `session`, `account`, `verification`
- Add `userId` column to `campaigns` table (FK → `user.id`)

### New files
- `src/lib/auth/index.ts` — BetterAuth instance (lazy singleton, see below)
- `src/app/api/auth/[...all]/route.ts` — catch-all auth handler
- `middleware.ts` (root) — protect `/play/*` and `/create`
- `src/app/login/page.tsx` + `src/app/signup/page.tsx` (or combined `/auth`)

### Modified files
- `src/lib/db/schema.ts` — add auth tables + `userId` to campaigns
- `src/app/api/character/route.ts` — read userId from session, store on campaign
- `src/app/api/campaigns/route.ts` — filter by userId
- `src/app/api/campaign/[campaignId]/route.ts` — verify ownership
- `src/app/api/campaign/[campaignId]/save/route.ts` — verify ownership
- `src/app/api/campaign/[campaignId]/inherit/route.ts` — verify ownership
- App layout/nav — show logged-in user, logout button

---

## Step-by-Step Implementation

### Step 1 — Install BetterAuth

```bash
npm install better-auth
```

No separate adapter package needed — the Drizzle adapter ships inside `better-auth`.

---

### Step 2 — Add tables to schema.ts

BetterAuth requires `user`, `session`, `account`, and `verification` tables. Add them
to `src/lib/db/schema.ts` alongside your existing tables. Also add `userId` to `campaigns`.

```ts
// src/lib/db/schema.ts (additions)
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const authSessions = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: text("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => users.id),
});

export const accounts = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => users.id),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: text("access_token_expires_at"),
  refreshTokenExpiresAt: text("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const verifications = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});
```

And add `userId` to the existing campaigns table definition:

```ts
export const campaigns = sqliteTable("campaigns", {
  // ... existing columns ...
  userId: text("user_id").references(() => users.id), // nullable during migration
});
```

**Then run a D1 migration** (create the tables manually or via `drizzle-kit generate`).

---

### Step 3 — Create the BetterAuth instance

The critical Cloudflare-specific challenge: BetterAuth needs the database at init time,
but the D1 binding only arrives via `getCloudflareContext()` per-request.

Solution: a lazy singleton that initializes on first use and caches for the lifetime of
the Cloudflare isolate (which is long-lived per worker instance).

```ts
// src/lib/auth/index.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db/client";

let _auth: ReturnType<typeof betterAuth> | null = null;

export async function getAuth() {
  if (_auth) return _auth;

  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  _auth = betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
    }),
    emailAndPassword: {
      enabled: true,
    },
    // Optional: add OAuth providers later
    // socialProviders: {
    //   github: { clientId: env.GITHUB_CLIENT_ID, clientSecret: env.GITHUB_CLIENT_SECRET },
    //   google: { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET },
    // },
  });

  return _auth;
}
```

> **Note on the singleton**: Cloudflare isolates are reused across requests to the same
> worker instance, so `_auth` will be set on the first request and reused. On a cold start
> it initializes once. This is the standard pattern for D1-backed singletons on Cloudflare.

---

### Step 4 — Auth catch-all route

BetterAuth handles all auth endpoints (sign-in, sign-up, sign-out, session, etc.) through
a single catch-all route.

```ts
// src/app/api/auth/[...all]/route.ts
import { getAuth } from "@/lib/auth";

export const runtime = "edge";

export async function GET(request: Request) {
  const auth = await getAuth();
  return auth.handler(request);
}

export async function POST(request: Request) {
  const auth = await getAuth();
  return auth.handler(request);
}
```

This exposes:
- `POST /api/auth/sign-in/email` — email+password login
- `POST /api/auth/sign-up/email` — registration
- `POST /api/auth/sign-out` — logout
- `GET /api/auth/session` — current session
- (OAuth callback routes, etc. if configured)

---

### Step 5 — Middleware to protect routes

```ts
// middleware.ts (project root, next to src/)
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/play/:path*", "/create"],
};
```

> **Gotcha**: `getCloudflareContext` in middleware might behave differently from API routes
> depending on the `@opennextjs/cloudflare` version. If it fails, the fallback is to check
> for the session cookie's existence in middleware (lightweight) and do full validation
> inside each API route handler. This is a known rough edge with Cloudflare + Next.js middleware.

---

### Step 6 — Session helper for API routes

Add a shared helper so every protected route can get the current user in one line:

```ts
// src/lib/auth/session.ts
import { getAuth } from "./index";

export async function requireSession(request: Request) {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return session; // session.user.id, session.user.email, etc.
}
```

Usage in any protected route:

```ts
const session = await requireSession(request);
const userId = session.user.id;
```

---

### Step 7 — Update API routes

**`POST /api/character`** — associate new campaign with the logged-in user:

```ts
const session = await requireSession(request);
// pass session.user.id to campaigns.insert():
await db.insert(campaigns).values({ ..., userId: session.user.id });
```

**`GET /api/campaigns`** — filter by userId so users only see their own:

```ts
const session = await requireSession(request);
.where(and(eq(campaigns.state, "active"), eq(campaigns.userId, session.user.id)))
```

**`GET /api/campaign/[campaignId]`** — verify ownership:

```ts
const session = await requireSession(request);
// after loading campaign:
if (campaign.userId !== session.user.id) {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
```

Apply the same ownership check to `/save` and `/inherit`.

---

### Step 8 — Login / Signup UI

BetterAuth ships a React client for making auth calls:

```ts
// src/lib/auth/client.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
});

// Exports: authClient.signIn.email(), authClient.signUp.email(),
//          authClient.signOut(), authClient.useSession()
```

Simple login page:

```tsx
// src/app/login/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await authClient.signIn.email({ email, password });
    if (error) { setError(error.message); return; }
    router.push("/");
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      {error && <p>{error}</p>}
      <button type="submit">Sign In</button>
    </form>
  );
}
```

The `authClient.useSession()` hook gives you session state in any client component
for rendering the user's name/avatar in the nav.

---

### Step 9 — Environment variables

Add to `.env.local` (and Cloudflare Pages env):

```
BETTER_AUTH_SECRET=<random 32+ char string>
BETTER_AUTH_URL=http://localhost:3000   # your production URL in prod
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

If adding OAuth later:
```
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

---

## Migration Strategy for Existing Data

The DB currently has campaigns with no `userId`. Options:

1. **Dev only (simple)**: Drop and recreate the D1 database. Acceptable during development
   when there's no real user data to preserve.

2. **Migration script**: Add `userId` as nullable, backfill with a "legacy" user row
   (one owner for all existing campaigns), then make it NOT NULL.

For a personal project that's still in development, option 1 is fine.

---

## BetterAuth Gotchas for This Stack

| Issue | Notes |
|---|---|
| D1 binding at module level | The lazy singleton pattern in Step 3 solves this |
| `nanoid` vs `crypto.randomUUID()` | BetterAuth generates its own IDs internally; your routes can keep using either |
| `export const runtime = "edge"` | Required on all API routes including the auth catch-all |
| BetterAuth table names | BetterAuth uses `user` / `session` / `account` / `verification` by default. These are configurable but match the defaults in schema above |
| Drizzle schema export names | The Drizzle tables need to be exported from schema so `drizzleAdapter` can discover them. Pass the schema object: `drizzleAdapter(db, { provider: "sqlite", schema: { ... } })` if auto-discovery fails |
| Cookie domain in production | Set `BETTER_AUTH_URL` to your production domain so cookies are scoped correctly |
| Middleware `getCloudflareContext` | May need special handling — see note in Step 5. Worst case, do auth checks in API routes only and use a lightweight cookie-presence check in middleware |

---

## Phased Rollout

**Phase 1** — Core auth (no user enforcement yet)
- Install, schema, auth route, login/signup UI, env vars
- Users can log in but campaigns aren't yet scoped to them

**Phase 2** — Associate campaigns with users
- Add userId to campaigns; update `/api/character` to stamp userId
- Update `/api/campaigns` to filter by userId

**Phase 3** — Enforce ownership
- Add `requireSession` checks to all campaign API routes
- Add middleware protection for `/play/*` and `/create`

**Phase 4** — Polish
- Add OAuth (GitHub/Google)
- Show user info in nav
- "Sign in to save your progress" prompt on homepage
