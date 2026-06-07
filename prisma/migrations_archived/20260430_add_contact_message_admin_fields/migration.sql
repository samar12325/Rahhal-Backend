ALTER TABLE `contact_messages`
  ADD COLUMN `read_at` TIMESTAMP NULL,
  ADD COLUMN `ip_address` VARCHAR(64) NULL,
  ADD COLUMN `user_agent` VARCHAR(1000) NULL;

CREATE INDEX `idx_contact_read_at` ON `contact_messages`(`read_at`);
