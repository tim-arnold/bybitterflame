ALTER TABLE "characters" ADD COLUMN "user_id" TEXT REFERENCES "user"("id");

-- Backfill user_id from campaigns (use most recent campaign per character)
UPDATE "characters"
SET "user_id" = (
  SELECT "user_id"
  FROM "campaigns"
  WHERE "campaigns"."character_id" = "characters"."id"
  ORDER BY "campaigns"."updated_at" DESC
  LIMIT 1
)
WHERE "user_id" IS NULL;
