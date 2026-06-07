DROP INDEX `idx_trips_is_offer` ON `trips`;

ALTER TABLE `trips`
  DROP COLUMN `is_offer`;
