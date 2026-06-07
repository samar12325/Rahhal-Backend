CREATE TABLE IF NOT EXISTS `destination_places` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `destination_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(160) NOT NULL,
  `type` VARCHAR(80) NULL,
  `description` TEXT NULL,
  `image_url` VARCHAR(500) NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT true,
  `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
  `updated_at` TIMESTAMP(0) NULL,

  PRIMARY KEY (`id`),
  INDEX `idx_destination_places_destination`(`destination_id`),
  INDEX `idx_destination_places_active`(`is_active`),
  CONSTRAINT `fk_destination_places_destination`
    FOREIGN KEY (`destination_id`) REFERENCES `destinations`(`id`)
    ON DELETE CASCADE ON UPDATE RESTRICT
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `school_trip_details`
  ADD COLUMN `place_id` BIGINT UNSIGNED NULL,
  ADD INDEX `idx_school_trip_place`(`place_id`),
  ADD CONSTRAINT `fk_school_trip_place`
    FOREIGN KEY (`place_id`) REFERENCES `destination_places`(`id`)
    ON DELETE RESTRICT ON UPDATE RESTRICT;
