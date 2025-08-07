-- Green Paalna Yojna Database Schema
-- This file contains the MySQL database schema for the Green Paalna Yojna project

-- Create database
CREATE DATABASE IF NOT EXISTS green_paalna_yojna;
USE green_paalna_yojna;

-- 1. Roles table
CREATE TABLE IF NOT EXISTS Role (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    permissions JSON,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Districts table
CREATE TABLE IF NOT EXISTS District (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    state VARCHAR(50) NOT NULL DEFAULT 'Chhattisgarh',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Blocks table
CREATE TABLE IF NOT EXISTS Block (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL,
    district_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (district_id) REFERENCES District(id)
);

-- 4. Villages table
CREATE TABLE IF NOT EXISTS Village (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL,
    block_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (block_id) REFERENCES Block(id)
);

-- 5. Users table
CREATE TABLE IF NOT EXISTS User (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userid VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    mobile VARCHAR(15) NOT NULL UNIQUE,
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    district_id INT,
    block_id INT,
    hospital_name VARCHAR(200),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES Role(id),
    FOREIGN KEY (district_id) REFERENCES District(id),
    FOREIGN KEY (block_id) REFERENCES Block(id)
);

-- 6. Children table
CREATE TABLE IF NOT EXISTS Child (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mother_name VARCHAR(100) NOT NULL,
    mother_mobile VARCHAR(15) NOT NULL,
    mother_aadhar VARCHAR(12),
    child_name VARCHAR(100),
    dob DATE NOT NULL,
    gender ENUM('male', 'female') NOT NULL,
    weight_at_birth DECIMAL(5,2),
    hospital_id INT NOT NULL,
    district_id INT NOT NULL,
    block_id INT NOT NULL,
    village_code INT NOT NULL,
    address TEXT,
    assigned_mitanin_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (hospital_id) REFERENCES User(id),
    FOREIGN KEY (district_id) REFERENCES District(id),
    FOREIGN KEY (block_id) REFERENCES Block(id),
    FOREIGN KEY (village_code) REFERENCES Village(village_code),
    FOREIGN KEY (assigned_mitanin_id) REFERENCES User(id)
);

-- 7. Plants table
CREATE TABLE IF NOT EXISTS Plant (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    species VARCHAR(100) NOT NULL,
    category ENUM('medicinal', 'fruit', 'flower', 'timber', 'other') NOT NULL,
    local_name VARCHAR(100),
    description TEXT,
    care_instructions TEXT,
    growth_period_months INT DEFAULT 12,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 8. Plant Assignments table
CREATE TABLE IF NOT EXISTS PlantAssignment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    child_id INT NOT NULL,
    plant_id INT NOT NULL,
    assigned_date DATE NOT NULL,
    status ENUM('active', 'completed', 'replaced', 'dead') NOT NULL DEFAULT 'active',
    assigned_by INT NOT NULL,
    completion_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (child_id) REFERENCES Child(id),
    FOREIGN KEY (plant_id) REFERENCES Plant(id),
    FOREIGN KEY (assigned_by) REFERENCES User(id)
);

-- 9. Plant Photos table
CREATE TABLE IF NOT EXISTS PlantPhoto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT NOT NULL,
    photo_url VARCHAR(500) NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    upload_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    uploaded_by INT NOT NULL,
    week_number INT NOT NULL COMMENT 'Week number since plant assignment',
    growth_stage ENUM('seedling', 'sapling', 'young', 'mature') NOT NULL DEFAULT 'seedling',
    health_status ENUM('healthy', 'moderate', 'poor', 'dead') NOT NULL DEFAULT 'healthy',
    notes TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES PlantAssignment(id),
    FOREIGN KEY (uploaded_by) REFERENCES User(id)
);

-- 10. Replacement Requests table
CREATE TABLE IF NOT EXISTS ReplacementRequest (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT NOT NULL,
    reason ENUM('died', 'diseased', 'damaged', 'stolen', 'other') NOT NULL,
    description TEXT,
    status ENUM('pending', 'approved', 'rejected', 'completed') NOT NULL DEFAULT 'pending',
    requested_by INT NOT NULL,
    request_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_by INT,
    review_date TIMESTAMP NULL,
    review_notes TEXT,
    new_assignment_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES PlantAssignment(id),
    FOREIGN KEY (requested_by) REFERENCES User(id),
    FOREIGN KEY (reviewed_by) REFERENCES User(id),
    FOREIGN KEY (new_assignment_id) REFERENCES PlantAssignment(id)
);

-- Create indexes for better performance
CREATE INDEX idx_user_mobile ON User(mobile);
CREATE INDEX idx_user_role ON User(role_id);
CREATE INDEX idx_child_mother_mobile ON Child(mother_mobile);
CREATE INDEX idx_child_hospital ON Child(hospital_id);
CREATE INDEX idx_child_district ON Child(district_id);
CREATE INDEX idx_child_mitanin ON Child(assigned_mitanin_id);
CREATE INDEX idx_plant_assignment_child ON PlantAssignment(child_id);
CREATE INDEX idx_plant_assignment_status ON PlantAssignment(status);
CREATE INDEX idx_plant_photo_assignment ON PlantPhoto(assignment_id);
CREATE INDEX idx_plant_photo_upload_date ON PlantPhoto(upload_date);
CREATE INDEX idx_replacement_request_status ON ReplacementRequest(status);
CREATE INDEX idx_replacement_request_assignment ON ReplacementRequest(assignment_id);
