ALTER TABLE `orders` ADD `specialInstructions` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `internalNotes` text;--> statement-breakpoint
ALTER TABLE `orders` DROP COLUMN `notes`;