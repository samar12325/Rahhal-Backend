ALTER TABLE `trip_parent_approvals`
  ADD COLUMN `email_sent_at` TIMESTAMP NULL AFTER `approved_at`,
  ADD COLUMN `last_email_error` TEXT NULL AFTER `email_sent_at`;
