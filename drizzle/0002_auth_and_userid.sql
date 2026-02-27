-- BetterAuth tables
CREATE TABLE `user` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `email` text NOT NULL UNIQUE,
  `email_verified` integer NOT NULL DEFAULT false,
  `image` text,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);

CREATE TABLE `session` (
  `id` text PRIMARY KEY NOT NULL,
  `expires_at` text NOT NULL,
  `token` text NOT NULL UNIQUE,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL,
  `ip_address` text,
  `user_agent` text,
  `user_id` text NOT NULL REFERENCES `user`(`id`)
);

CREATE TABLE `account` (
  `id` text PRIMARY KEY NOT NULL,
  `account_id` text NOT NULL,
  `provider_id` text NOT NULL,
  `user_id` text NOT NULL REFERENCES `user`(`id`),
  `access_token` text,
  `refresh_token` text,
  `id_token` text,
  `access_token_expires_at` text,
  `refresh_token_expires_at` text,
  `scope` text,
  `password` text,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);

CREATE TABLE `verification` (
  `id` text PRIMARY KEY NOT NULL,
  `identifier` text NOT NULL,
  `value` text NOT NULL,
  `expires_at` text NOT NULL,
  `created_at` text,
  `updated_at` text
);

-- Add userId to campaigns
ALTER TABLE `campaigns` ADD COLUMN `user_id` text REFERENCES `user`(`id`);
