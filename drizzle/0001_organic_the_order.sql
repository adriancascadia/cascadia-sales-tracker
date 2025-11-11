CREATE TABLE `customers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`address` text,
	`city` varchar(100),
	`state` varchar(50),
	`zipCode` varchar(20),
	`phone` varchar(50),
	`email` varchar(320),
	`latitude` text,
	`longitude` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gps_tracks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`latitude` text NOT NULL,
	`longitude` text NOT NULL,
	`accuracy` int,
	`speed` text,
	`heading` text,
	`timestamp` datetime NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gps_tracks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mileage_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`routeId` int,
	`startTime` datetime NOT NULL,
	`endTime` datetime,
	`startLocation` text,
	`endLocation` text,
	`totalDistance` text,
	`status` enum('active','completed') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mileage_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`productId` int NOT NULL,
	`quantity` int NOT NULL,
	`unitPrice` text NOT NULL,
	`lineTotal` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`visitId` int,
	`userId` int NOT NULL,
	`customerId` int NOT NULL,
	`orderNumber` varchar(100) NOT NULL,
	`orderDate` datetime NOT NULL,
	`totalAmount` text NOT NULL,
	`status` enum('pending','submitted','confirmed','cancelled') NOT NULL DEFAULT 'pending',
	`distributorId` varchar(100),
	`submittedAt` datetime,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_orderNumber_unique` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `photos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`visitId` int,
	`userId` int NOT NULL,
	`customerId` int,
	`fileKey` varchar(500) NOT NULL,
	`url` text NOT NULL,
	`photoType` enum('before','after','merchandising','pos','display','other') NOT NULL,
	`caption` text,
	`latitude` text,
	`longitude` text,
	`takenAt` datetime NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `photos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sku` varchar(100) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`price` text NOT NULL,
	`category` varchar(100),
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_sku_unique` UNIQUE(`sku`)
);
--> statement-breakpoint
CREATE TABLE `route_stops` (
	`id` int AUTO_INCREMENT NOT NULL,
	`routeId` int NOT NULL,
	`customerId` int NOT NULL,
	`stopOrder` int NOT NULL,
	`plannedArrival` datetime,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `route_stops_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `routes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`routeName` varchar(255) NOT NULL,
	`routeDate` date NOT NULL,
	`status` enum('planned','in_progress','completed') NOT NULL DEFAULT 'planned',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `routes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `visit_activities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`visitId` int NOT NULL,
	`activityType` enum('sales_call','merchandising','service','delivery','other') NOT NULL,
	`notes` text,
	`outcome` enum('order_placed','follow_up','no_action','issue_resolved'),
	`competitorInfo` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `visit_activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `visits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`customerId` int NOT NULL,
	`routeStopId` int,
	`checkInTime` datetime NOT NULL,
	`checkInLatitude` text,
	`checkInLongitude` text,
	`checkOutTime` datetime,
	`checkOutLatitude` text,
	`checkOutLongitude` text,
	`visitDuration` int,
	`visitType` enum('scheduled','unscheduled') NOT NULL DEFAULT 'scheduled',
	`status` enum('in_progress','completed') NOT NULL DEFAULT 'in_progress',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `visits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `customers_userId_idx` ON `customers` (`userId`);--> statement-breakpoint
CREATE INDEX `gpsTracks_userId_idx` ON `gps_tracks` (`userId`);--> statement-breakpoint
CREATE INDEX `gpsTracks_timestamp_idx` ON `gps_tracks` (`timestamp`);--> statement-breakpoint
CREATE INDEX `mileageLogs_userId_idx` ON `mileage_logs` (`userId`);--> statement-breakpoint
CREATE INDEX `mileageLogs_routeId_idx` ON `mileage_logs` (`routeId`);--> statement-breakpoint
CREATE INDEX `orderItems_orderId_idx` ON `order_items` (`orderId`);--> statement-breakpoint
CREATE INDEX `orderItems_productId_idx` ON `order_items` (`productId`);--> statement-breakpoint
CREATE INDEX `orders_userId_idx` ON `orders` (`userId`);--> statement-breakpoint
CREATE INDEX `orders_customerId_idx` ON `orders` (`customerId`);--> statement-breakpoint
CREATE INDEX `orders_orderDate_idx` ON `orders` (`orderDate`);--> statement-breakpoint
CREATE INDEX `orders_status_idx` ON `orders` (`status`);--> statement-breakpoint
CREATE INDEX `photos_visitId_idx` ON `photos` (`visitId`);--> statement-breakpoint
CREATE INDEX `photos_userId_idx` ON `photos` (`userId`);--> statement-breakpoint
CREATE INDEX `photos_customerId_idx` ON `photos` (`customerId`);--> statement-breakpoint
CREATE INDEX `routeStops_routeId_idx` ON `route_stops` (`routeId`);--> statement-breakpoint
CREATE INDEX `routeStops_customerId_idx` ON `route_stops` (`customerId`);--> statement-breakpoint
CREATE INDEX `routes_userId_idx` ON `routes` (`userId`);--> statement-breakpoint
CREATE INDEX `routes_routeDate_idx` ON `routes` (`routeDate`);--> statement-breakpoint
CREATE INDEX `routes_status_idx` ON `routes` (`status`);--> statement-breakpoint
CREATE INDEX `visitActivities_visitId_idx` ON `visit_activities` (`visitId`);--> statement-breakpoint
CREATE INDEX `visits_userId_idx` ON `visits` (`userId`);--> statement-breakpoint
CREATE INDEX `visits_customerId_idx` ON `visits` (`customerId`);--> statement-breakpoint
CREATE INDEX `visits_checkInTime_idx` ON `visits` (`checkInTime`);--> statement-breakpoint
CREATE INDEX `visits_status_idx` ON `visits` (`status`);