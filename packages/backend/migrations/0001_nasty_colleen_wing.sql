ALTER TABLE players ADD `firebase_uid` text;--> statement-breakpoint
CREATE UNIQUE INDEX `players_firebase_uid_unique` ON `players` (`firebase_uid`);