-- AlterTable
ALTER TABLE `store` ADD COLUMN `deliveryRadius` DECIMAL(10, 2) NOT NULL DEFAULT 15,
    ADD COLUMN `storeLatitude` DECIMAL(10, 7) NULL,
    ADD COLUMN `storeLongitude` DECIMAL(10, 7) NULL;
