-- Fix foreign key constraints in tbl_child table
-- Update references to use _code fields instead of _id fields for location tables

-- Start transaction
START TRANSACTION;

-- First, add new columns with proper references to code fields
ALTER TABLE tbl_child 
ADD COLUMN district_code INT AFTER hospital_id,
ADD COLUMN block_code INT AFTER district_code,
ADD COLUMN village_code INT AFTER block_code;

-- Add foreign key constraints for the new code columns
ALTER TABLE tbl_child 
ADD CONSTRAINT fk_child_district_code 
    FOREIGN KEY (district_code) REFERENCES master_district(district_code),
ADD CONSTRAINT fk_child_block_code 
    FOREIGN KEY (block_code) REFERENCES master_block(block_code),
ADD CONSTRAINT fk_child_village_code 
    FOREIGN KEY (village_code) REFERENCES master_village(village_code);

-- Drop old foreign key constraints for id fields (if they exist)
-- These may fail if the constraints don't exist, which is fine
SET foreign_key_checks = 0;

-- Try to drop old constraints (ignore errors if they don't exist)
ALTER TABLE tbl_child DROP FOREIGN KEY fk_child_district_id;
ALTER TABLE tbl_child DROP FOREIGN KEY fk_child_block_id;
ALTER TABLE tbl_child DROP FOREIGN KEY fk_child_village_id;

-- Drop old id columns (but only if they exist and are not being used)
-- Comment out these lines if you want to keep the old columns for now
-- ALTER TABLE tbl_child DROP COLUMN district_id;
-- ALTER TABLE tbl_child DROP COLUMN block_id;
-- ALTER TABLE tbl_child DROP COLUMN village_id;

SET foreign_key_checks = 1;

-- Commit transaction
COMMIT;

-- Show the updated table structure
DESCRIBE tbl_child;
