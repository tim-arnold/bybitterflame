import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const characters = sqliteTable("characters", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
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
  equipment: text("equipment").notNull().default("[]"),
  spells: text("spells").notNull().default("[]"),
  talents: text("talents").notNull().default("[]"),
  features: text("features").notNull().default("[]"),
  gold: integer("gold").notNull().default(0),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const campaigns = sqliteTable("campaigns", {
  id: text("id").primaryKey(),
  characterId: text("character_id")
    .notNull()
    .references(() => characters.id),
  name: text("name").notNull(),
  state: text("state", { enum: ["active", "completed", "abandoned"] })
    .notNull()
    .default("active"),
  worldState: text("world_state").notNull().default("{}"),
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
