-- CreateTable
CREATE TABLE `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(120) NOT NULL,
    `email` VARCHAR(190) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(30) NULL,
    `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `uq_users_email`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bookings` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `trip_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `persons_count` INTEGER UNSIGNED NOT NULL,
    `total_price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `scheduled_date` DATE NULL,
    `scheduled_time` VARCHAR(5) NULL,
    `status` ENUM('pending', 'confirmed', 'cancelled', 'completed') NOT NULL DEFAULT 'pending',
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `idx_bookings_status`(`status`),
    INDEX `idx_bookings_trip`(`trip_id`),
    INDEX `idx_bookings_user`(`user_id`),
    INDEX `idx_bookings_created_at`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `destinations` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(120) NOT NULL,
    `region` ENUM('central', 'west', 'east', 'north', 'south') NOT NULL,
    `description` TEXT NULL,
    `image_url` VARCHAR(500) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `idx_destinations_active`(`is_active`),
    INDEX `idx_destinations_region`(`region`),
    UNIQUE INDEX `uq_destinations_name_region`(`name`, `region`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `destination_places` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `destination_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(160) NOT NULL,
    `type` VARCHAR(80) NULL,
    `description` TEXT NULL,
    `image_url` VARCHAR(500) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `idx_destination_places_destination`(`destination_id`),
    INDEX `idx_destination_places_active`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `group_trip_details` (
    `trip_id` BIGINT UNSIGNED NOT NULL,
    `required_participants` INTEGER UNSIGNED NOT NULL,
    `organizer_id` BIGINT UNSIGNED NOT NULL,
    `join_deadline` DATE NULL,
    `notes` TEXT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `idx_group_organizer`(`organizer_id`),
    PRIMARY KEY (`trip_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `booking_id` BIGINT UNSIGNED NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `method` ENUM('card', 'applepay', 'stcpay', 'cash') NOT NULL,
    `status` ENUM('paid', 'failed', 'refunded') NOT NULL,
    `provider_txn_id` VARCHAR(120) NULL,
    `paid_at` TIMESTAMP(0) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_payments_booking`(`booking_id`),
    INDEX `idx_payments_method`(`method`),
    INDEX `idx_payments_status`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reviews` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `booking_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `rating` TINYINT UNSIGNED NOT NULL,
    `comment` TEXT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `uq_reviews_booking`(`booking_id`),
    INDEX `idx_reviews_rating`(`rating`),
    INDEX `idx_reviews_user`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `school_trip_details` (
    `trip_id` BIGINT UNSIGNED NOT NULL,
    `place_id` BIGINT UNSIGNED NULL,
    `school_name` VARCHAR(200) NOT NULL,
    `education_level` VARCHAR(80) NULL,
    `students_count` INTEGER UNSIGNED NOT NULL,
    `supervisors_count` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `transport_type` VARCHAR(80) NULL,
    `meeting_point` VARCHAR(250) NULL,
    `permit_file_url` VARCHAR(500) NULL,
    `notes` TEXT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL,
    `prep_progress` TINYINT UNSIGNED NOT NULL DEFAULT 12,
    `is_ready` BOOLEAN NOT NULL DEFAULT false,

    INDEX `idx_school_trip_place`(`place_id`),
    PRIMARY KEY (`trip_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trip_parent_approvals` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `trip_id` BIGINT UNSIGNED NULL,
    `student_name` VARCHAR(150) NOT NULL,
    `parent_name` VARCHAR(150) NOT NULL,
    `parent_phone` VARCHAR(30) NOT NULL,
    `parent_email` VARCHAR(150) NOT NULL,
    `approval_status` ENUM('pending', 'approved', 'rejected') NULL DEFAULT 'pending',
    `approval_token` VARCHAR(120) NOT NULL,
    `approved_at` TIMESTAMP(0) NULL,
    `email_sent_at` TIMESTAMP(0) NULL,
    `last_email_error` TEXT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `uq_trip_parent_approval_token`(`approval_token`),
    INDEX `idx_parent_approval_trip`(`trip_id`),
    INDEX `idx_parent_approval_email`(`parent_email`),
    INDEX `idx_parent_approval_status`(`approval_status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tags` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(60) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `uq_tags_name`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trip_tags` (
    `trip_id` BIGINT UNSIGNED NOT NULL,
    `tag_id` BIGINT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_trip_tags_tag`(`tag_id`),
    PRIMARY KEY (`trip_id`, `tag_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trips` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(180) NOT NULL,
    `destination_id` BIGINT UNSIGNED NOT NULL,
    `type` ENUM('individual', 'group', 'school', 'ai') NOT NULL DEFAULT 'individual',
    `description` TEXT NULL,
    `start_date` DATE NULL,
    `end_date` DATE NULL,
    `duration_days` INTEGER UNSIGNED NULL,
    `price_per_person` DECIMAL(10, 2) NULL,
    `old_price` DECIMAL(10, 2) NULL,
    `includes` JSON NULL,
    `image_url` VARCHAR(500) NULL,
    `max_participants` INTEGER UNSIGNED NULL,
    `status` ENUM('draft', 'open', 'full', 'completed', 'cancelled') NOT NULL DEFAULT 'draft',
    `created_by` BIGINT UNSIGNED NOT NULL,
    `reviewed_by` BIGINT UNSIGNED NULL,
    `reviewed_at` TIMESTAMP(0) NULL,
    `rejection_reason` TEXT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `idx_trips_created_by`(`created_by`),
    INDEX `idx_trips_reviewed_by`(`reviewed_by`),
    INDEX `idx_trips_dates`(`start_date`, `end_date`),
    INDEX `idx_trips_destination_id`(`destination_id`),
    INDEX `idx_trips_type`(`type`),
    INDEX `idx_trips_type_status`(`type`, `status`),
    INDEX `idx_trips_destination`(`destination_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_trip_sessions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `title` VARCHAR(180) NOT NULL,
    `city` VARCHAR(120) NOT NULL,
    `days` TINYINT UNSIGNED NOT NULL,
    `people` TINYINT UNSIGNED NOT NULL,
    `min_budget` DECIMAL(10, 2) NULL,
    `max_budget` DECIMAL(10, 2) NULL,
    `style` VARCHAR(40) NULL,
    `prefs` JSON NULL,
    `notes` TEXT NULL,
    `locale` VARCHAR(5) NOT NULL DEFAULT 'ar',
    `plan_json` JSON NOT NULL,
    `last_message_at` TIMESTAMP(0) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `idx_ai_trip_sessions_user`(`user_id`),
    INDEX `idx_ai_trip_sessions_updated_at`(`updated_at`),
    INDEX `idx_ai_trip_sessions_last_message_at`(`last_message_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_trip_messages` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `session_id` BIGINT UNSIGNED NOT NULL,
    `role` ENUM('user', 'assistant') NOT NULL,
    `text` TEXT NOT NULL,
    `plan_json` JSON NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_ai_trip_messages_session`(`session_id`),
    INDEX `idx_ai_trip_messages_created_at`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contact_messages` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(120) NOT NULL,
    `email` VARCHAR(190) NOT NULL,
    `type` ENUM('suggestion', 'complaint', 'inquiry', 'partnership') NOT NULL,
    `message` TEXT NOT NULL,
    `status` ENUM('new', 'sent', 'failed') NOT NULL DEFAULT 'new',
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `read_at` TIMESTAMP(0) NULL,
    `sent_at` TIMESTAMP(0) NULL,
    `ip_address` VARCHAR(64) NULL,
    `user_agent` VARCHAR(1000) NULL,
    `error_message` TEXT NULL,

    INDEX `idx_contact_status`(`status`),
    INDEX `idx_contact_created_at`(`created_at`),
    INDEX `idx_contact_email`(`email`),
    INDEX `idx_contact_read_at`(`read_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `events` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(180) NOT NULL,
    `city` VARCHAR(120) NOT NULL,
    `location` VARCHAR(255) NOT NULL,
    `category` VARCHAR(120) NOT NULL,
    `description` TEXT NULL,
    `image_url` VARCHAR(500) NULL,
    `price_text` VARCHAR(120) NULL,
    `start_datetime` TIMESTAMP(0) NOT NULL,
    `end_datetime` TIMESTAMP(0) NULL,
    `official_booking_url` VARCHAR(500) NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `idx_events_status`(`status`),
    INDEX `idx_events_city`(`city`),
    INDEX `idx_events_category`(`category`),
    INDEX `idx_events_start_datetime`(`start_datetime`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `fk_bookings_trip` FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `fk_bookings_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `destination_places` ADD CONSTRAINT `fk_destination_places_destination` FOREIGN KEY (`destination_id`) REFERENCES `destinations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `group_trip_details` ADD CONSTRAINT `fk_group_trip_organizer` FOREIGN KEY (`organizer_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `group_trip_details` ADD CONSTRAINT `fk_group_trip_trip` FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `fk_payments_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `fk_reviews_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `school_trip_details` ADD CONSTRAINT `fk_school_trip_trip` FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `school_trip_details` ADD CONSTRAINT `fk_school_trip_place` FOREIGN KEY (`place_id`) REFERENCES `destination_places`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trip_parent_approvals` ADD CONSTRAINT `fk_parent_approval_trip` FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trip_tags` ADD CONSTRAINT `fk_trip_tags_tag` FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trip_tags` ADD CONSTRAINT `fk_trip_tags_trip` FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trips` ADD CONSTRAINT `fk_trips_creator` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trips` ADD CONSTRAINT `fk_trips_reviewer` FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trips` ADD CONSTRAINT `fk_trips_destination` FOREIGN KEY (`destination_id`) REFERENCES `destinations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_trip_sessions` ADD CONSTRAINT `fk_ai_trip_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_trip_messages` ADD CONSTRAINT `fk_ai_trip_messages_session` FOREIGN KEY (`session_id`) REFERENCES `ai_trip_sessions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

