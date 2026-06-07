CREATE TABLE IF NOT EXISTS `trip_parent_approvals` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `trip_id` BIGINT UNSIGNED NULL,
  `student_name` VARCHAR(150) NOT NULL,
  `parent_name` VARCHAR(150) NOT NULL,
  `parent_phone` VARCHAR(30) NOT NULL,
  `parent_email` VARCHAR(150) NOT NULL,
  `approval_token` VARCHAR(120) NOT NULL,
  `approval_status` ENUM('pending', 'approved', 'rejected') NULL DEFAULT 'pending',
  `approved_at` TIMESTAMP(0) NULL,
  `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
  `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

  PRIMARY KEY (`id`),
  UNIQUE INDEX `uq_trip_parent_approval_token` (`approval_token`),
  INDEX `idx_parent_approval_trip` (`trip_id`),
  INDEX `idx_parent_approval_email` (`parent_email`),
  INDEX `idx_parent_approval_status` (`approval_status`),
  CONSTRAINT `fk_parent_approval_trip`
    FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`)
    ON DELETE CASCADE ON UPDATE RESTRICT
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `trip_parent_approvals`
  ADD COLUMN IF NOT EXISTS `parent_email` VARCHAR(150) NOT NULL;

ALTER TABLE `trip_parent_approvals`
  ADD COLUMN IF NOT EXISTS `approved_at` TIMESTAMP(0) NULL;

ALTER TABLE `trip_parent_approvals`
  MODIFY COLUMN `trip_id` BIGINT UNSIGNED NULL;
