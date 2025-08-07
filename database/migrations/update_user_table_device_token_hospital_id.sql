-- Migration: Update User Table - Add device_token and replace hospital_name with hospital_id
-- File: migrations/update_user_table_device_token_hospital_id.sql
-- Description: Adds device_token column and replaces hospital_name with hospital_id in tbl_user

-- Step 1: Add device_token column
ALTER TABLE `tbl_user` 
ADD COLUMN `device_token` TEXT NULL COMMENT 'डिवाइस टोकन (FCM/Push notifications के लिए)' 
AFTER `last_login`;

-- Step 2: Add hospital_id column
ALTER TABLE `tbl_user` 
ADD COLUMN `hospital_id` INT(11) NULL COMMENT 'अस्पताल आईडी' 
AFTER `village_id`;

-- Step 3: Add foreign key constraint for hospital_id (assuming master_hospital table exists)
-- ALTER TABLE `tbl_user` 
-- ADD CONSTRAINT `fk_user_hospital_id` 
-- FOREIGN KEY (`hospital_id`) REFERENCES `master_hospital` (`id`) ON DELETE SET NULL;

-- Step 4: Copy data from hospital_name to hospital_id (if needed)
-- This would require a mapping table or manual data migration
-- For now, we'll keep both columns during transition

-- Step 5: Drop hospital_name column (uncomment when ready)
-- ALTER TABLE `tbl_user` DROP COLUMN `hospital_name`;

-- Create index for better performance
CREATE INDEX `idx_user_device_token` ON `tbl_user` (`device_token`(255));
CREATE INDEX `idx_user_hospital_id` ON `tbl_user` (`hospital_id`);
