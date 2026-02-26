ALTER TABLE `campaigns` ADD `campaign_type` text DEFAULT 'standard' NOT NULL;
--> statement-breakpoint
ALTER TABLE `campaigns` ADD `module_id` text;
--> statement-breakpoint
ALTER TABLE `campaigns` ADD `adventure_id` text;
