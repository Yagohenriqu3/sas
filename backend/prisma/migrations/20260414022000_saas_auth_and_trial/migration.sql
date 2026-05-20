-- Create User table
CREATE TABLE `User` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `fullName` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `passwordHash` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `User_email_key`(`email`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Alter Store for SaaS ownership and trial
ALTER TABLE `Store`
  ADD COLUMN `ownerUserId` INTEGER NULL,
  ADD COLUMN `trialEndsAt` DATETIME(3) NULL,
  ADD COLUMN `subscriptionStatus` VARCHAR(191) NOT NULL DEFAULT 'trial';

CREATE INDEX `Store_ownerUserId_idx` ON `Store`(`ownerUserId`);

ALTER TABLE `Store`
  ADD CONSTRAINT `Store_ownerUserId_fkey`
  FOREIGN KEY (`ownerUserId`) REFERENCES `User`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;
