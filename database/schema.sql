CREATE DATABASE IF NOT EXISTS bloodlink123;
USE bloodlink123;
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(15) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('DONOR', 'REQUESTER', 'BLOOD_BANK') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS donors (
    donor_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20),
    blood_group VARCHAR(5) NOT NULL,
    city VARCHAR(100) NOT NULL,
    area VARCHAR(100),
    availability BOOLEAN DEFAULT TRUE,
    last_donation_date DATE,
    consent_to_share BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
);
CREATE TABLE IF NOT EXISTS requesters (
    requester_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    area VARCHAR(100),
    relationship_to_patient VARCHAR(50),

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
);
CREATE TABLE IF NOT EXISTS blood_banks (
    blood_bank_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    bank_name VARCHAR(150) NOT NULL,
    official_email VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    license_number VARCHAR(100) NOT NULL UNIQUE,
    bank_type VARCHAR(50) NOT NULL,
    authorized_person_name VARCHAR(100) NOT NULL,
    authorized_person_designation VARCHAR(100),
    authorized_person_contact VARCHAR(15),
    authorized_person_email VARCHAR(255),

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
);

-- dashboard sql

USE bloodlink123;

CREATE TABLE blood_requests (

    request_id INT AUTO_INCREMENT PRIMARY KEY,

    requester_id INT NOT NULL,

    patient_name VARCHAR(100) NOT NULL,

    hospital_name VARCHAR(150) NOT NULL,

    blood_group VARCHAR(5) NOT NULL,

    units_required INT NOT NULL,

    emergency_contact VARCHAR(15) NOT NULL,

    medical_notes TEXT,

    city VARCHAR(100) NOT NULL,

    area VARCHAR(100),

    latitude DECIMAL(10,8),

    longitude DECIMAL(11,8),

    urgency ENUM(
        'CRITICAL',
        'URGENT',
        'NORMAL'
    ) NOT NULL DEFAULT 'NORMAL',

    required_by DATETIME NOT NULL,

    status ENUM(
        'OPEN',
        'MATCHING',
        'PARTIALLY_FULFILLED',
        'FULFILLED',
        'CANCELLED'
    ) NOT NULL DEFAULT 'OPEN',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (requester_id)
        REFERENCES requesters(requester_id)
        ON DELETE CASCADE
);

USE bloodlink123;

CREATE TABLE donor_responses (

    response_id INT AUTO_INCREMENT PRIMARY KEY,

    request_id INT NOT NULL,

    donor_id INT NOT NULL,

    status ENUM(
        'PENDING',
        'ACCEPTED',
        'REJECTED',
        'CANCELLED',
        'COMPLETED'
    ) NOT NULL DEFAULT 'PENDING',

    eta_minutes INT,

    responded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    completed_at TIMESTAMP NULL,

    UNIQUE(request_id, donor_id),

    FOREIGN KEY (request_id)
        REFERENCES blood_requests(request_id)
        ON DELETE CASCADE,

    FOREIGN KEY (donor_id)
        REFERENCES donors(donor_id)
        ON DELETE CASCADE
);

USE bloodlink123;

CREATE TABLE donations (

    donation_id INT AUTO_INCREMENT PRIMARY KEY,

    donor_id INT NOT NULL,

    request_id INT NULL,

    donation_date DATE NOT NULL,

    units_donated INT NOT NULL DEFAULT 1,

    lives_helped INT NOT NULL DEFAULT 1,

    donation_status ENUM(
        'SCHEDULED',
        'COMPLETED',
        'CANCELLED'
    ) NOT NULL DEFAULT 'COMPLETED',

    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (donor_id)
        REFERENCES donors(donor_id)
        ON DELETE CASCADE,

    FOREIGN KEY (request_id)
        REFERENCES blood_requests(request_id)
        ON DELETE SET NULL
);

USE bloodlink123;

CREATE TABLE blood_inventory (

    inventory_id INT AUTO_INCREMENT PRIMARY KEY,

    blood_bank_id INT NOT NULL,

    blood_group VARCHAR(5) NOT NULL,

    total_units INT NOT NULL DEFAULT 0,

    reserved_units INT NOT NULL DEFAULT 0,

    safe_threshold INT NOT NULL DEFAULT 5,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE(blood_bank_id, blood_group),

    FOREIGN KEY (blood_bank_id)
        REFERENCES blood_banks(blood_bank_id)
        ON DELETE CASCADE
);

USE bloodlink123;

CREATE TABLE inventory_batches (
    batch_id INT AUTO_INCREMENT PRIMARY KEY,
    inventory_id INT NOT NULL,
    batch_number VARCHAR(50) NOT NULL,
    units INT NOT NULL,
    collection_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    status ENUM('AVAILABLE','RESERVED','EXPIRED','DISCARDED')
        NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (inventory_id)
        REFERENCES blood_inventory(inventory_id)
        ON DELETE CASCADE
);

USE bloodlink123;

CREATE TABLE blood_bank_responses (
    response_id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    blood_bank_id INT NOT NULL,
    units_offered INT NOT NULL,
    status ENUM('PENDING','ACCEPTED','REJECTED','CANCELLED','COMPLETED')
        NOT NULL DEFAULT 'PENDING',
    responded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(request_id, blood_bank_id),

    FOREIGN KEY (request_id)
        REFERENCES blood_requests(request_id)
        ON DELETE CASCADE,

    FOREIGN KEY (blood_bank_id)
        REFERENCES blood_banks(blood_bank_id)
        ON DELETE CASCADE
);

USE bloodlink123;

CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    notification_type ENUM(
        'BLOOD_REQUEST',
        'DONOR_RESPONSE',
        'BANK_RESPONSE',
        'REQUEST_UPDATE',
        'URGENT_ALERT',
        'SYSTEM'
    ) NOT NULL DEFAULT 'SYSTEM',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);
