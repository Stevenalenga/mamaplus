-- AlterTable
ALTER TABLE `courses` ADD COLUMN `location` VARCHAR(500) NULL,
    ADD COLUMN `scheduleDates` VARCHAR(500) NULL,
    ADD COLUMN `durationLabel` VARCHAR(100) NULL,
    ADD COLUMN `specialOffer` TEXT NULL;
