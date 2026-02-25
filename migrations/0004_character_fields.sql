-- Add deity, languages, silver, and copper to the characters table.
ALTER TABLE characters ADD COLUMN deity TEXT NOT NULL DEFAULT '';
ALTER TABLE characters ADD COLUMN languages TEXT NOT NULL DEFAULT '[]';
ALTER TABLE characters ADD COLUMN silver INTEGER NOT NULL DEFAULT 0;
ALTER TABLE characters ADD COLUMN copper INTEGER NOT NULL DEFAULT 0;