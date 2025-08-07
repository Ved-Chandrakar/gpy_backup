-- Migration: Create FCM Tokens Table
-- File: migrations/create_fcm_tokens_table.sql
-- Description: Creates table to store Firebase Cloud Messaging tokens for push notifications

CREATE TABLE IF NOT EXISTS `tbl_fcm_tokens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `token` text NOT NULL,
  `device_type` enum('android','ios','web') NOT NULL DEFAULT 'android',
  `device_id` varchar(255) DEFAULT NULL,
  `app_version` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `last_used` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_token` (`token`(255)),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_last_used` (`last_used`),
  CONSTRAINT `fk_fcm_tokens_user_id` FOREIGN KEY (`user_id`) REFERENCES `tbl_user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='FCM tokens for push notifications';

-- Create indexes for better performance
CREATE INDEX `idx_fcm_tokens_user_active` ON `tbl_fcm_tokens` (`user_id`, `is_active`);
CREATE INDEX `idx_fcm_tokens_device_type` ON `tbl_fcm_tokens` (`device_type`);
