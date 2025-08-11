-- Migration: Rename Plural Table Names to Singular
-- File: migrations/rename_plural_tables_to_singular.sql
-- Description: Renames all plural table names to singular names for consistency

-- Before running this migration, ensure you have a backup of your database

-- Step 1: Rename master tables
RENAME TABLE `master_villages` TO `master_village`;
RENAME TABLE `master_panchayats` TO `master_panchayat`;
RENAME TABLE `master_districts` TO `master_district`;
RENAME TABLE `master_blocks` TO `master_block`;

-- Step 2: Rename application tables
RENAME TABLE `tbl_fcm_tokens` TO `tbl_fcm_token`;
RENAME TABLE `tbl_awcs` TO `tbl_awc`;

-- Step 3: Update foreign key constraints (if any exist)
-- Note: MySQL will automatically update foreign key references when table is renamed

-- Verification: Show all renamed tables
SELECT TABLE_NAME as 'Renamed Tables' 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME IN (
  'master_village',
  'master_panchayat', 
  'master_district',
  'master_block',
  'tbl_fcm_token',
  'tbl_awc'
)
ORDER BY TABLE_NAME;
