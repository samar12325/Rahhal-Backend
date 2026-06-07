ALTER TABLE `school_trip_details`
  ADD COLUMN `trip_live_status` ENUM('created', 'in_progress', 'completed') NOT NULL DEFAULT 'created' AFTER `is_ready`,
  ADD COLUMN `departure_time` TIMESTAMP(0) NULL AFTER `trip_live_status`,
  ADD COLUMN `return_time` TIMESTAMP(0) NULL AFTER `departure_time`,
  ADD COLUMN `supervisor_notes` TEXT NULL AFTER `return_time`,
  ADD COLUMN `tracking_last_updated_at` TIMESTAMP(0) NULL AFTER `supervisor_notes`;

ALTER TABLE `trip_parent_approvals`
  ADD COLUMN `tracking_token` VARCHAR(120) NULL AFTER `approval_token`,
  ADD COLUMN `attendance_status` ENUM('unprepared', 'present', 'absent') NULL DEFAULT 'unprepared' AFTER `tracking_token`,
  ADD COLUMN `attendance_marked_at` TIMESTAMP(0) NULL AFTER `attendance_status`,
  ADD COLUMN `attendance_marked_by_name` VARCHAR(120) NULL AFTER `attendance_marked_at`,
  ADD COLUMN `tracking_link_sent_at` TIMESTAMP(0) NULL AFTER `attendance_marked_by_name`;

ALTER TABLE `trip_parent_approvals`
  ADD UNIQUE INDEX `uq_trip_parent_tracking_token` (`tracking_token`);
