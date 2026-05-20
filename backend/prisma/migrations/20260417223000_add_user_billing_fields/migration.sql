-- Add required billing/profile fields for paid SaaS onboarding
ALTER TABLE `User`
  ADD COLUMN `phone` VARCHAR(191) NOT NULL DEFAULT '',
  ADD COLUMN `documentNumber` VARCHAR(191) NOT NULL DEFAULT '',
  ADD COLUMN `legalName` VARCHAR(191) NOT NULL DEFAULT '',
  ADD COLUMN `billingZip` VARCHAR(191) NOT NULL DEFAULT '',
  ADD COLUMN `billingStreet` VARCHAR(191) NOT NULL DEFAULT '',
  ADD COLUMN `billingNumber` VARCHAR(191) NOT NULL DEFAULT '',
  ADD COLUMN `billingNeighborhood` VARCHAR(191) NOT NULL DEFAULT '',
  ADD COLUMN `billingCity` VARCHAR(191) NOT NULL DEFAULT '',
  ADD COLUMN `billingState` VARCHAR(191) NOT NULL DEFAULT '';
