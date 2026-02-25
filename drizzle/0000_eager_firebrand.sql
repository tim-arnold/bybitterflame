CREATE TABLE `campaigns` (
	`id` text PRIMARY KEY NOT NULL,
	`character_id` text NOT NULL,
	`name` text NOT NULL,
	`state` text DEFAULT 'active' NOT NULL,
	`gm_persona` text DEFAULT '' NOT NULL,
	`world_state` text DEFAULT '{}' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`character_id`) REFERENCES `characters`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `characters` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`pronouns` text DEFAULT 'they/them' NOT NULL,
	`ancestry` text NOT NULL,
	`class` text NOT NULL,
	`level` integer DEFAULT 1 NOT NULL,
	`xp` integer DEFAULT 0 NOT NULL,
	`alignment` text NOT NULL,
	`background` text NOT NULL,
	`str` integer NOT NULL,
	`dex` integer NOT NULL,
	`con` integer NOT NULL,
	`int` integer NOT NULL,
	`wis` integer NOT NULL,
	`cha` integer NOT NULL,
	`hp` integer NOT NULL,
	`max_hp` integer NOT NULL,
	`ac` integer NOT NULL,
	`deity` text DEFAULT '' NOT NULL,
	`languages` text DEFAULT '[]' NOT NULL,
	`equipment` text DEFAULT '[]' NOT NULL,
	`spells` text DEFAULT '[]' NOT NULL,
	`talents` text DEFAULT '[]' NOT NULL,
	`features` text DEFAULT '[]' NOT NULL,
	`gold` integer DEFAULT 0 NOT NULL,
	`silver` integer DEFAULT 0 NOT NULL,
	`copper` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`campaign_id` text NOT NULL,
	`session_number` integer NOT NULL,
	`messages` text DEFAULT '[]' NOT NULL,
	`summary` text,
	`game_state_snapshot` text DEFAULT '{}' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON UPDATE no action ON DELETE no action
);
