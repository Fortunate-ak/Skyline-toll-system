CREATE TABLE `tollgates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`latitude` decimal(10,8) NOT NULL,
	`longitude` decimal(11,8) NOT NULL,
	`address` text,
	`tollFee` decimal(10,2) NOT NULL,
	`tollFeeType` varchar(50) NOT NULL,
	`vehicleTypes` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`operatingHours` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tollgates_id` PRIMARY KEY(`id`)
);
