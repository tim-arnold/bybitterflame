# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-powered Game Master for a folklore-inspired tabletop RPG ("By Bitter Flame"). Players create a character through a guided chat flow, then play through campaigns with Claude as the dungeon master.

## Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build (uses Turbopack)
npm run lint     # ESLint
```

## Version Control Conventions

- Do not include Claude attribution in commit messages
- Provide detailed commit messages

## Jira Workflow

This project uses Jira project **BTORCH** on `tim52.atlassian.net`. Look up the cloud ID via `getAccessibleAtlassianResources` if needed.

### Listing Jira issues
Use `searchJiraIssuesUsingJql` with `cloudId` and `jql`. Do not pass a `fields` parameter — it causes a validation error.

### Creating a Jira ticket
Use `createJiraIssue` with `cloudId`, `projectKey`, `issueTypeName`, `summary`, and `description`. Always include:
- A clear summary
- Description with context, current behavior, expected behavior, and acceptance criteria
- Issue type: Story (new features), Task (investigation/testing/chores), Bug (defects)

### Branch naming
When starting work on a Jira ticket, create a branch named `btorch-{number}-{short-slug}`.

```bash
git checkout -b btorch-5-spell-details
```

### Commit messages
Include the Jira ticket number at the start of the commit message subject line.

```
BTORCH-N: Short summary of what changed

- Bullet detail 1
- Bullet detail 2
```

## AI-Assisted Development

This project uses an AI agent harness for session continuity. The harness files live in `docs/ai-harness/`.

| File | Purpose |
|------|---------|
| `docs/ai-harness/progress.md` | Current project state, what works, what doesn't, recent session logs |
| `docs/ai-harness/feature-list.json` | Structured feature checklist with per-feature test criteria and pass/fail status |

### Session Startup

At the start of each session:
1. Read `docs/ai-harness/progress.md` — current state and recent work
2. Check `git log --oneline -10` — recent commits
3. Review `docs/ai-harness/feature-list.json` — feature status and next priorities
4. Run `npm run build` — verify the project compiles cleanly

**Trigger phrases:** "start session", "get up to speed", "read the harness"

### Session Closeout

Before ending a session:
1. Update `docs/ai-harness/progress.md` with work completed
2. Update `docs/ai-harness/feature-list.json` if features or tests were completed
3. Commit changes with descriptive messages

**Trigger phrases:** "close session", "wrap up", "end session"

### Key Principles

- Work on **one feature at a time**. Complete and verify before moving on.
- `feature-list.json` tests are the source of truth for "done". Mark tests as passing only after manual or build verification.
- `progress.md` is for human-readable context. Keep it concise — what works, what doesn't, and a log entry per session.

## Database

The project uses **Cloudflare D1** (SQLite) accessed via **Drizzle ORM** for type-safe queries.

- Drizzle schema (TypeScript source of truth): `src/lib/db/schema.ts`
- DB client: `src/lib/db/client.ts`

### Migrations

**Drizzle's migration runner is NOT used.** Migrations are plain SQL files applied manually via wrangler:

```bash
# Apply a migration to prod
npx wrangler d1 execute bitterflame --remote --file migrations/XXXX_name.sql

# Apply to local
npx wrangler d1 execute bitterflame --local --file migrations/XXXX_name.sql
```

Migration files live in `migrations/`. There is no automatic tracking table — to check what's been applied, inspect the prod schema directly:

```bash
npx wrangler d1 execute bitterflame --remote --command "PRAGMA table_info(table_name);"
```

`schema.sql` is the full schema for bootstrapping a fresh database. Keep it in sync whenever a new migration is added.
