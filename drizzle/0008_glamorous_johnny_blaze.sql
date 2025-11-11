CREATE TABLE `playbook_bookmarks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`entryId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `playbook_bookmarks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `playbook_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`icon` varchar(50),
	`displayOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `playbook_categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `playbook_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`categoryId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`content` text NOT NULL,
	`entryType` enum('product_strategy','objection_handling','cafe_tactic','launch_strategy','quick_reference') NOT NULL,
	`productId` int,
	`tags` varchar(500),
	`displayOrder` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `playbook_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `playbookBookmarks_userId_idx` ON `playbook_bookmarks` (`userId`);--> statement-breakpoint
CREATE INDEX `playbookBookmarks_entryId_idx` ON `playbook_bookmarks` (`entryId`);--> statement-breakpoint
CREATE INDEX `playbookBookmarks_unique` ON `playbook_bookmarks` (`userId`,`entryId`);--> statement-breakpoint
CREATE INDEX `playbookCategories_companyId_idx` ON `playbook_categories` (`companyId`);--> statement-breakpoint
CREATE INDEX `playbookEntries_companyId_idx` ON `playbook_entries` (`companyId`);--> statement-breakpoint
CREATE INDEX `playbookEntries_categoryId_idx` ON `playbook_entries` (`categoryId`);--> statement-breakpoint
CREATE INDEX `playbookEntries_productId_idx` ON `playbook_entries` (`productId`);