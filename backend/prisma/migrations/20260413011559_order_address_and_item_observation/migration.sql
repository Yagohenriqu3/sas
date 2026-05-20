-- AlterTable
ALTER TABLE `order` ADD COLUMN `customerCep` VARCHAR(191) NULL,
    ADD COLUMN `customerCity` VARCHAR(191) NULL,
    ADD COLUMN `customerComplement` VARCHAR(191) NULL,
    ADD COLUMN `customerLatitude` DECIMAL(10, 7) NULL,
    ADD COLUMN `customerLongitude` DECIMAL(10, 7) NULL,
    ADD COLUMN `customerMapsLink` VARCHAR(191) NULL,
    ADD COLUMN `customerNeighborhood` VARCHAR(191) NULL,
    ADD COLUMN `customerNumber` VARCHAR(191) NULL,
    ADD COLUMN `customerState` VARCHAR(191) NULL,
    ADD COLUMN `customerStreet` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `orderitem` ADD COLUMN `observation` VARCHAR(191) NULL;
