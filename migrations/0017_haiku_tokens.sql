-- Track Haiku token usage separately from Sonnet so costs can be computed accurately.
-- total* columns continue to hold all tokens; haiku* holds the Haiku subset.
-- Cost = calcCost(total - haiku, sonnet rates) + calcCostHaiku(haiku, haiku rates)
ALTER TABLE "user" ADD COLUMN "haiku_input_tokens" integer NOT NULL DEFAULT 0;
ALTER TABLE "user" ADD COLUMN "haiku_output_tokens" integer NOT NULL DEFAULT 0;
ALTER TABLE "user" ADD COLUMN "haiku_cache_write_tokens" integer NOT NULL DEFAULT 0;
ALTER TABLE "user" ADD COLUMN "haiku_cache_read_tokens" integer NOT NULL DEFAULT 0;
