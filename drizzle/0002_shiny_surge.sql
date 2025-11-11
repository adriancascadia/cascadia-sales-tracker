CREATE TABLE `alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`routeId` int,
	`alertType` enum('route_deviation','significant_delay','missed_stop','extended_visit') NOT NULL,
	`severity` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`message` text NOT NULL,
	`metadata` text,
	`isRead` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `alerts_userId_idx` ON `alerts` (`userId`);--> statement-breakpoint
CREATE INDEX `alerts_routeId_idx` ON `alerts` (`routeId`);--> statement-breakpoint
CREATE INDEX `alerts_isRead_idx` ON `alerts` (`isRead`);