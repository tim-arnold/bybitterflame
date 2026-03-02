import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export const characters = sqliteTable("characters", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  pronouns: text("pronouns").notNull().default("they/them"),
  ancestry: text("ancestry").notNull(),
  class: text("class").notNull(),
  level: integer("level").notNull().default(1),
  xp: integer("xp").notNull().default(0),
  alignment: text("alignment").notNull(),
  background: text("background").notNull(),
  str: integer("str").notNull(),
  dex: integer("dex").notNull(),
  con: integer("con").notNull(),
  int: integer("int").notNull(),
  wis: integer("wis").notNull(),
  cha: integer("cha").notNull(),
  hp: integer("hp").notNull(),
  maxHp: integer("max_hp").notNull(),
  ac: integer("ac").notNull(),
  deity: text("deity").notNull().default(""),
  languages: text("languages").notNull().default("[]"),
  equipment: text("equipment").notNull().default("[]"),
  spells: text("spells").notNull().default("[]"),
  talents: text("talents").notNull().default("[]"),
  features: text("features").notNull().default("[]"),
  gold: integer("gold").notNull().default(0),
  silver: integer("silver").notNull().default(0),
  copper: integer("copper").notNull().default(0),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

// ── Auth tables (BetterAuth) ──────────────────────────────────────────────────

export const users = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  anthropicApiKey: text("anthropic_api_key"),
  betaApiKey: text("beta_api_key"),
  betaKeyMode: text("beta_key_mode"),    // "trial" | "full" | null
  serverKeyTurnsUsed: integer("server_key_turns_used").notNull().default(0),
  totalInputTokens: integer("total_input_tokens").notNull().default(0),
  totalOutputTokens: integer("total_output_tokens").notNull().default(0),
  totalCacheWriteTokens: integer("total_cache_write_tokens").notNull().default(0),
  totalCacheReadTokens: integer("total_cache_read_tokens").notNull().default(0),
  ownKeyInputTokens: integer("own_key_input_tokens").notNull().default(0),
  ownKeyOutputTokens: integer("own_key_output_tokens").notNull().default(0),
  ownKeyCacheWriteTokens: integer("own_key_cache_write_tokens").notNull().default(0),
  ownKeyCacheReadTokens: integer("own_key_cache_read_tokens").notNull().default(0),
});

export const authSessions = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
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
  accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verifications = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

export const accountRequests = sqliteTable("account_requests", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  status: text("status").notNull().default("pending"), // "pending" | "approved" | "completed"
  betaApiKey: text("beta_api_key"),
  betaKeyMode: text("beta_key_mode").notNull().default("trial"), // "trial" | "full"
  createdAt: integer("created_at").notNull(),
});

// ── Game tables ───────────────────────────────────────────────────────────────

export const campaigns = sqliteTable("campaigns", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  characterId: text("character_id")
    .notNull()
    .references(() => characters.id),
  name: text("name").notNull(),
  state: text("state", { enum: ["active", "completed", "abandoned"] })
    .notNull()
    .default("active"),
  gmPersona: text("gm_persona").notNull().default(""),
  worldState: text("world_state").notNull().default("{}"),
  gmNotes: text("gm_notes"),
  campaignType: text("campaign_type").notNull().default("standard"),
  moduleId: text("module_id"),
  adventureId: text("adventure_id"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  campaignId: text("campaign_id")
    .notNull()
    .references(() => campaigns.id),
  sessionNumber: integer("session_number").notNull(),
  messages: text("messages").notNull().default("[]"),
  summary: text("summary"),
  gameStateSnapshot: text("game_state_snapshot").notNull().default("{}"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});
