ALTER TABLE `trip_parent_approvals`
  MODIFY COLUMN `trip_id` BIGINT UNSIGNED NULL;

ALTER TABLE `trip_parent_approvals`
  ADD COLUMN IF NOT EXISTS `parent_email` VARCHAR(150) NOT NULL;

ALTER TABLE `trip_parent_approvals`
  ADD COLUMN IF NOT EXISTS `approved_at` TIMESTAMP(0) NULL;
