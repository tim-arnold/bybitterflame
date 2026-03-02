ALTER TABLE "user" ADD COLUMN "own_key_cache_write_tokens" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "user" ADD COLUMN "own_key_cache_read_tokens" INTEGER NOT NULL DEFAULT 0;
