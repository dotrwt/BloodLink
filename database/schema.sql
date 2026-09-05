CREATE DATABASE bloodlink_db;
USE bloodlink_db;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(15) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('DONOR', 'REQUESTER', 'BLOOD_BANK') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE donors (
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

    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE requesters (
    requester_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    area VARCHAR(100),
    relationship_to_patient VARCHAR(50),

    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE blood_banks (
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

    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
