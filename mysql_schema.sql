-- ============================================
-- MySQL Schema for نظام إدارة الرقابة والتفتيش
-- Administrative Management System
-- ============================================

-- Create Database (Run this first if database doesn't exist)
CREATE DATABASE IF NOT EXISTS blocksystem CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE blocksystem;

-- ============================================
-- Users Table
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  username TEXT NOT NULL UNIQUE KEY,
  password TEXT NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  INDEX idx_username (username(100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Police Stations Table
-- ============================================
CREATE TABLE IF NOT EXISTS police_stations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name TEXT NOT NULL UNIQUE KEY,
  governorate TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_name (name(100)),
  INDEX idx_governorate (governorate(50))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Ports Table
-- ============================================
CREATE TABLE IF NOT EXISTS ports (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name TEXT NOT NULL UNIQUE KEY,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_name (name(100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Records Table
-- ============================================
CREATE TABLE IF NOT EXISTS records (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  record_number INT NOT NULL UNIQUE KEY AUTO_INCREMENT,
  outgoing_number TEXT NOT NULL,
  military_number TEXT,
  action_type TEXT,
  ports TEXT,
  recorded_notes TEXT,
  first_name TEXT NOT NULL,
  second_name TEXT NOT NULL,
  third_name TEXT NOT NULL,
  fourth_name TEXT NOT NULL,
  tour_date DATETIME NOT NULL,
  rank TEXT NOT NULL,
  governorate TEXT NOT NULL,
  office TEXT,
  police_station TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_record_number (record_number),
  INDEX idx_outgoing (outgoing_number(100)),
  INDEX idx_military (military_number(100)),
  INDEX idx_first_name (first_name(100)),
  INDEX idx_governorate (governorate(50)),
  INDEX idx_rank (rank(50)),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Insert Default Admin User
-- ============================================
INSERT INTO users (id, username, password, display_name, role) VALUES
(UUID(), 'admin', '$2a$10$Pb1w85lUMWAc5Q7sHKQXWO3U7.TZzQ3uQ8.K0gx0f8mVT7T9WjJNe', 'مدير النظام', 'admin'),
(UUID(), 'supervisor1', '$2a$10$Pb1w85lUMWAc5Q7sHKQXWO3U7.TZzQ3uQ8.K0gx0f8mVT7T9WjJNe', 'مشرف', 'supervisor')
ON DUPLICATE KEY UPDATE password=VALUES(password);

-- Note: Default passwords are hashed versions of 'Admin@123'
-- To change password, hash a new one using bcrypt and update the password field

-- ============================================
-- End of Schema
-- ============================================
