-- KrishiMap database schema
-- Run this first: `mysql -u root -p < sql/schema.sql`

CREATE DATABASE IF NOT EXISTS krishimap;
USE krishimap;

-- Registered users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- State-wise soil / crop / climate reference data
-- `name` must exactly match the "name" property in public/data/india_states.geojson
CREATE TABLE IF NOT EXISTS states (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  soil_type VARCHAR(255),
  major_crops VARCHAR(255),
  climate VARCHAR(255),
  farming_notes TEXT
);

-- One row per successful login, for the CCN IP-logging requirement
CREATE TABLE IF NOT EXISTS login_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  ip_address VARCHAR(64),
  login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
