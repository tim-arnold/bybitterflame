-- Add specialization and toll columns to characters table
ALTER TABLE characters ADD COLUMN specialization TEXT DEFAULT NULL;
ALTER TABLE characters ADD COLUMN toll INTEGER NOT NULL DEFAULT 0;
ALTER TABLE characters ADD COLUMN toll_permanent INTEGER NOT NULL DEFAULT 0;
