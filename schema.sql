-- By Bitter Flame — full database schema
-- Apply to a fresh D1 database:
--   wrangler d1 execute bitterflame --remote --file=schema.sql
--   wrangler d1 execute bitterflame --local  --file=schema.sql

-- ── Game tables ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS characters (
  id          TEXT PRIMARY KEY NOT NULL,
  user_id     TEXT REFERENCES user(id),
  name        TEXT NOT NULL,
  pronouns    TEXT NOT NULL DEFAULT 'they/them',
  ancestry    TEXT NOT NULL,
  class       TEXT NOT NULL,
  level       INTEGER NOT NULL DEFAULT 1,
  xp          INTEGER NOT NULL DEFAULT 0,
  alignment   TEXT NOT NULL DEFAULT 'Neutral',
  background  TEXT NOT NULL,
  str         INTEGER NOT NULL,
  dex         INTEGER NOT NULL,
  con         INTEGER NOT NULL,
  int         INTEGER NOT NULL,
  wis         INTEGER NOT NULL,
  cha         INTEGER NOT NULL,
  hp          INTEGER NOT NULL,
  max_hp      INTEGER NOT NULL,
  ac          INTEGER NOT NULL,
  deity       TEXT NOT NULL DEFAULT '',
  languages   TEXT NOT NULL DEFAULT '[]',
  equipment   TEXT NOT NULL DEFAULT '[]',
  spells      TEXT NOT NULL DEFAULT '[]',
  talents     TEXT NOT NULL DEFAULT '[]',
  features    TEXT NOT NULL DEFAULT '[]',
  gold        INTEGER NOT NULL DEFAULT 0,
  silver      INTEGER NOT NULL DEFAULT 0,
  copper      INTEGER NOT NULL DEFAULT 0,
  wyrd             INTEGER NOT NULL DEFAULT 0,
  specialization   TEXT DEFAULT NULL,
  toll             INTEGER NOT NULL DEFAULT 0,
  toll_permanent   INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS campaigns (
  id             TEXT PRIMARY KEY NOT NULL,
  user_id        TEXT REFERENCES user(id),
  character_id   TEXT NOT NULL REFERENCES characters(id),
  name           TEXT NOT NULL,
  state          TEXT NOT NULL DEFAULT 'active',
  gm_persona     TEXT NOT NULL DEFAULT '',
  world_state    TEXT NOT NULL DEFAULT '{}',
  gm_notes       TEXT,
  campaign_type  TEXT NOT NULL DEFAULT 'standard',
  module_id      TEXT,
  adventure_id   TEXT,
  created_at     TEXT NOT NULL,
  updated_at     TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id                   TEXT PRIMARY KEY NOT NULL,
  campaign_id          TEXT NOT NULL REFERENCES campaigns(id),
  session_number       INTEGER NOT NULL,
  messages             TEXT NOT NULL DEFAULT '[]',
  summary              TEXT,
  game_state_snapshot  TEXT NOT NULL DEFAULT '{}',
  created_at           TEXT NOT NULL,
  updated_at           TEXT NOT NULL
);

-- ── Auth tables (BetterAuth) ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user (
  id                    TEXT PRIMARY KEY NOT NULL,
  name                  TEXT NOT NULL,
  email                 TEXT NOT NULL UNIQUE,
  email_verified        INTEGER NOT NULL DEFAULT false,
  image                 TEXT,
  created_at            INTEGER NOT NULL,
  updated_at            INTEGER NOT NULL,
  anthropic_api_key     TEXT,
  beta_api_key          TEXT,
  beta_key_mode         TEXT,
  server_key_turns_used  INTEGER NOT NULL DEFAULT 0,
  server_key_turns_bonus INTEGER NOT NULL DEFAULT 0,
  total_input_tokens        INTEGER NOT NULL DEFAULT 0,
  total_output_tokens       INTEGER NOT NULL DEFAULT 0,
  total_cache_write_tokens  INTEGER NOT NULL DEFAULT 0,
  total_cache_read_tokens   INTEGER NOT NULL DEFAULT 0,
  own_key_input_tokens      INTEGER NOT NULL DEFAULT 0,
  own_key_output_tokens     INTEGER NOT NULL DEFAULT 0,
  own_key_cache_write_tokens INTEGER NOT NULL DEFAULT 0,
  own_key_cache_read_tokens  INTEGER NOT NULL DEFAULT 0,
  haiku_input_tokens         INTEGER NOT NULL DEFAULT 0,
  haiku_output_tokens        INTEGER NOT NULL DEFAULT 0,
  haiku_cache_write_tokens   INTEGER NOT NULL DEFAULT 0,
  haiku_cache_read_tokens    INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS session (
  id          TEXT PRIMARY KEY NOT NULL,
  expires_at  INTEGER NOT NULL,
  token       TEXT NOT NULL UNIQUE,
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL,
  ip_address  TEXT,
  user_agent  TEXT,
  user_id     TEXT NOT NULL REFERENCES user(id)
);

CREATE TABLE IF NOT EXISTS account (
  id                         TEXT PRIMARY KEY NOT NULL,
  account_id                 TEXT NOT NULL,
  provider_id                TEXT NOT NULL,
  user_id                    TEXT NOT NULL REFERENCES user(id),
  access_token               TEXT,
  refresh_token              TEXT,
  id_token                   TEXT,
  access_token_expires_at    INTEGER,
  refresh_token_expires_at   INTEGER,
  scope                      TEXT,
  password                   TEXT,
  created_at                 INTEGER NOT NULL,
  updated_at                 INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS verification (
  id          TEXT PRIMARY KEY NOT NULL,
  identifier  TEXT NOT NULL,
  value       TEXT NOT NULL,
  expires_at  INTEGER NOT NULL,
  created_at  INTEGER,
  updated_at  INTEGER
);

CREATE TABLE IF NOT EXISTS account_requests (
  id            TEXT PRIMARY KEY NOT NULL,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  token         TEXT NOT NULL UNIQUE,
  status        TEXT NOT NULL DEFAULT 'pending',
  beta_api_key  TEXT,
  beta_key_mode TEXT NOT NULL DEFAULT 'trial',
  created_at    INTEGER NOT NULL
);

-- ── Rate limiting ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS rate_limits (
  key           TEXT NOT NULL,
  window_start  INTEGER NOT NULL,
  count         INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (key, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_key ON rate_limits (key);
