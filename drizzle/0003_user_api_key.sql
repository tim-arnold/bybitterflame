ALTER TABLE `user` ADD COLUMN `anthropic_api_key` TEXT;
ALTER TABLE `user` ADD COLUMN `server_key_turns_used` INTEGER NOT NULL DEFAULT 0;
