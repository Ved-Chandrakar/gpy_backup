-- Migration to add userid column to existing User table
-- Run this script to update existing database schema

USE green_paalna_yojna;

-- Add the userid column to the User table
ALTER TABLE User ADD COLUMN userid VARCHAR(50) NOT NULL DEFAULT '' AFTER id;

-- Update existing users to generate userids based on their roles and IDs
-- Hospital users: H001, H002, etc.
UPDATE User SET userid = CONCAT('H', LPAD(id, 3, '0'))
WHERE role_id = (SELECT id FROM Role WHERE name = 'hospital');

-- Mitanin users: M001, M002, etc.
UPDATE User SET userid = CONCAT('M', LPAD(id, 3, '0'))
WHERE role_id = (SELECT id FROM Role WHERE name = 'mitanin');

-- AWW users: A001, A002, etc.
UPDATE User SET userid = CONCAT('A', LPAD(id, 3, '0'))
WHERE role_id = (SELECT id FROM Role WHERE name = 'aww');

-- Mother users: MO001, MO002, etc.
UPDATE User SET userid = CONCAT('MO', LPAD(id, 3, '0'))
WHERE role_id = (SELECT id FROM Role WHERE name = 'mother');

-- State users: S001, S002, etc.
UPDATE User SET userid = CONCAT('S', LPAD(id, 3, '0'))
WHERE role_id = (SELECT id FROM Role WHERE name = 'state');

-- Collector users: C001, C002, etc.
UPDATE User SET userid = CONCAT('C', LPAD(id, 3, '0'))
WHERE role_id = (SELECT id FROM Role WHERE name = 'collector');

-- Make the userid column unique after updating existing records
ALTER TABLE User ADD UNIQUE INDEX unique_userid (userid);

-- Show the updated users
SELECT id, userid, name, mobile, role_id FROM User ORDER BY id;
