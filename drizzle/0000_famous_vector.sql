CREATE TABLE `screen_access_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`window_start` integer NOT NULL,
	`count` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `screen_media` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`project_id` text NOT NULL,
	`name` text NOT NULL,
	`mime` text NOT NULL,
	`size` integer NOT NULL,
	`object_key` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `media_owner_project` ON `screen_media` (`owner_id`,`project_id`);--> statement-breakpoint
CREATE TABLE `screen_metrics_private` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`project_id` text NOT NULL,
	`name` text NOT NULL,
	`value` real NOT NULL,
	`secondary` real,
	`region` text
);
--> statement-breakpoint
CREATE INDEX `metric_scope` ON `screen_metrics_private` (`owner_id`,`project_id`);--> statement-breakpoint
CREATE TABLE `screen_projects` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`name` text NOT NULL,
	`config_json` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `project_owner` ON `screen_projects` (`owner_id`);--> statement-breakpoint
CREATE TABLE `screen_publications` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`owner_id` text NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`config_json` text NOT NULL,
	`mode` text NOT NULL,
	`password_salt` text,
	`password_hash` text,
	`token_hash` text,
	`session_secret` text NOT NULL,
	`version_id` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `publication_slug` ON `screen_publications` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `publication_owner_project` ON `screen_publications` (`owner_id`,`project_id`);--> statement-breakpoint
CREATE TABLE `screen_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`owner_id` text NOT NULL,
	`name` text NOT NULL,
	`config_json` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `version_owner_project` ON `screen_versions` (`owner_id`,`project_id`);