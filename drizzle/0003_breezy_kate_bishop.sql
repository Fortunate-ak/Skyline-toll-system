ALTER TABLE `wallets` MODIFY COLUMN `balance` decimal(10,2) NOT NULL DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE `wallets` ADD `lowBalanceThreshold` decimal(10,2) DEFAULT '10.00' NOT NULL;--> statement-breakpoint
ALTER TABLE `wallets` ADD `lastLowBalanceNotificationAt` timestamp;