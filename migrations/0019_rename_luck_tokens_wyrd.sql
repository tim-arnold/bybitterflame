-- Rename luck_tokens to wyrd on characters table
-- (luck tokens were renamed to "wyrd" during IP cleanup)
ALTER TABLE characters RENAME COLUMN luck_tokens TO wyrd;
