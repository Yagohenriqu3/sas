ALTER TABLE `Addon`
  ADD COLUMN `categoryId` INT NULL,
  ADD INDEX `Addon_categoryId_idx` (`categoryId`),
  ADD CONSTRAINT `Addon_categoryId_fkey`
    FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE;
