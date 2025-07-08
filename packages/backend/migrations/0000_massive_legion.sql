CREATE TABLE `players` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `monster_species` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`base_hp` integer NOT NULL,
	`description` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `owned_monsters` (
	`id` text PRIMARY KEY NOT NULL,
	`player_id` text NOT NULL,
	`species_id` text NOT NULL,
	`nickname` text,
	`current_hp` integer NOT NULL,
	`max_hp` integer NOT NULL,
	`obtained_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`species_id`) REFERENCES `monster_species`(`id`) ON UPDATE no action ON DELETE no action
);
