ALTER TABLE `usersTable` RENAME TO `user`;--> statement-breakpoint
DROP INDEX `usersTable_email_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);