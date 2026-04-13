-- Add prompt cache token tracking columns to users table
ALTER TABLE "user" ADD COLUMN "total_cache_write_tokens" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "user" ADD COLUMN "total_cache_read_tokens" INTEGER NOT NULL DEFAULT 0;