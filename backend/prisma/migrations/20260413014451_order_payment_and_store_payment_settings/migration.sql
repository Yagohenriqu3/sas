-- AlterTable
ALTER TABLE `order` ADD COLUMN `changeFor` DECIMAL(10, 2) NULL,
    ADD COLUMN `needsChange` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `paymentDetail` VARCHAR(191) NULL,
    ADD COLUMN `paymentMethod` ENUM('pix_online', 'pix_on_delivery', 'credit_card', 'debit_card', 'cash') NOT NULL DEFAULT 'cash',
    ADD COLUMN `paymentStatus` VARCHAR(191) NULL,
    ADD COLUMN `pixCopyPaste` TEXT NULL;

-- AlterTable
ALTER TABLE `store` ADD COLUMN `acceptsCash` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `acceptsCreditCard` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `acceptsDebitCard` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `acceptsPixOnDelivery` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `acceptsPixOnline` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `pixCity` VARCHAR(191) NULL,
    ADD COLUMN `pixKey` VARCHAR(191) NULL,
    ADD COLUMN `pixReceiverName` VARCHAR(191) NULL;
