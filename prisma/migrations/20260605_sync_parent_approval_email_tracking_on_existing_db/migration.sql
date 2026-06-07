SET @add_email_sent_at = (
  SELECT IF(
    EXISTS(
      SELECT 1
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'trip_parent_approvals'
        AND COLUMN_NAME = 'email_sent_at'
    ),
    'SELECT 1',
    'ALTER TABLE `trip_parent_approvals` ADD COLUMN `email_sent_at` TIMESTAMP NULL AFTER `approved_at`'
  )
);

PREPARE stmt FROM @add_email_sent_at;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_last_email_error = (
  SELECT IF(
    EXISTS(
      SELECT 1
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'trip_parent_approvals'
        AND COLUMN_NAME = 'last_email_error'
    ),
    'SELECT 1',
    'ALTER TABLE `trip_parent_approvals` ADD COLUMN `last_email_error` TEXT NULL AFTER `email_sent_at`'
  )
);

PREPARE stmt FROM @add_last_email_error;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
