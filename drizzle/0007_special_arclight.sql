CREATE TABLE `companies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`domain` varchar(255) NOT NULL,
	`logo` text,
	`plan` enum('starter','professional','enterprise') NOT NULL DEFAULT 'starter',
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `companies_id` PRIMARY KEY(`id`),
	CONSTRAINT `companies_domain_unique` UNIQUE(`domain`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','manager','rep') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `alerts` ADD `companyId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `customers` ADD `companyId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `distributors` ADD `companyId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `gps_tracks` ADD `companyId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `mileage_logs` ADD `companyId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `companyId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `photos` ADD `companyId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `routes` ADD `companyId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `companyId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `visits` ADD `companyId` int NOT NULL;--> statement-breakpoint
CREATE INDEX `alerts_companyId_idx` ON `alerts` (`companyId`);--> statement-breakpoint
CREATE INDEX `customers_companyId_idx` ON `customers` (`companyId`);--> statement-breakpoint
CREATE INDEX `distributors_companyId_idx` ON `distributors` (`companyId`);--> statement-breakpoint
CREATE INDEX `gpsTracks_companyId_idx` ON `gps_tracks` (`companyId`);--> statement-breakpoint
CREATE INDEX `mileageLogs_companyId_idx` ON `mileage_logs` (`companyId`);--> statement-breakpoint
CREATE INDEX `orders_companyId_idx` ON `orders` (`companyId`);--> statement-breakpoint
CREATE INDEX `photos_companyId_idx` ON `photos` (`companyId`);--> statement-breakpoint
CREATE INDEX `routes_companyId_idx` ON `routes` (`companyId`);--> statement-breakpoint
CREATE INDEX `users_companyId_idx` ON `users` (`companyId`);--> statement-breakpoint
CREATE INDEX `visits_companyId_idx` ON `visits` (`companyId`);