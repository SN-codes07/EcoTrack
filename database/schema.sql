-- ============================================================================
-- EcoTrack – Personal Carbon Footprint Tracker
-- Complete MySQL 8.0+ Database Schema
-- ============================================================================

CREATE DATABASE IF NOT EXISTS ecotrack_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ecotrack_db;

-- ----------------------------------------------------------------------------
-- 1. USERS TABLE
-- Stores user credentials, environmental profile, carbon budget, and gamification state
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'ROLE_USER',
    city VARCHAR(100) DEFAULT 'Pune',
    country VARCHAR(100) DEFAULT 'India',
    monthly_carbon_budget_kg DOUBLE NOT NULL DEFAULT 250.0,
    carbon_score INT NOT NULL DEFAULT 75,
    carbon_status VARCHAR(50) NOT NULL DEFAULT 'IMPROVING', -- ECO_CHAMPION, IMPROVING, HIGH_IMPACT, CRITICAL_IMPACT
    total_eco_points INT NOT NULL DEFAULT 0,
    eco_level VARCHAR(50) NOT NULL DEFAULT 'Eco Beginner',
    current_streak_days INT NOT NULL DEFAULT 0,
    last_activity_date DATE DEFAULT NULL,
    dark_mode BOOLEAN NOT NULL DEFAULT TRUE,
    anonymous_leaderboard BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_eco_points (total_eco_points DESC)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 2. VEHICLES TABLE
-- Tracks personal vehicles for fuel efficiency, cost, and custom emission calculations
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    nickname VARCHAR(100) NOT NULL,
    make VARCHAR(80) NOT NULL,
    model VARCHAR(80) NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL, -- CAR_PETROL, CAR_DIESEL, CAR_EV, CAR_HYBRID, TWO_WHEELER, E_BIKE, BICYCLE
    fuel_type VARCHAR(30) NOT NULL,    -- PETROL, DIESEL, ELECTRIC, CNG, HYBRID, NONE
    fuel_efficiency DOUBLE NOT NULL,   -- km per liter (or km per kWh for EV)
    fuel_cost_per_unit DOUBLE NOT NULL DEFAULT 104.0,
    emission_factor_kg_per_km DOUBLE NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_vehicles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_vehicles_user (user_id)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 3. TRIPS TABLE
-- Detailed Smart Transportation & Route tracker with geo-coordinates & pollutants
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trips (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    vehicle_id BIGINT DEFAULT NULL,
    transport_mode VARCHAR(50) NOT NULL, -- WALKING, CYCLING, E_BIKE, TWO_WHEELER, CAR_PETROL, CAR_DIESEL, CAR_EV, CAR_CNG, BUS, TRAIN, METRO, FLIGHT
    fuel_type VARCHAR(30) NOT NULL DEFAULT 'PETROL',
    origin_name VARCHAR(150) NOT NULL,
    origin_lat DOUBLE DEFAULT NULL,
    origin_lng DOUBLE DEFAULT NULL,
    destination_name VARCHAR(150) NOT NULL,
    destination_lat DOUBLE DEFAULT NULL,
    destination_lng DOUBLE DEFAULT NULL,
    distance_km DOUBLE NOT NULL,
    duration_minutes INT DEFAULT 0,
    passengers INT NOT NULL DEFAULT 1,
    fuel_efficiency_used DOUBLE DEFAULT NULL,
    fuel_consumed DOUBLE NOT NULL DEFAULT 0.0,
    fuel_cost DOUBLE NOT NULL DEFAULT 0.0,
    co2_kg DOUBLE NOT NULL,
    pm25_g DOUBLE NOT NULL DEFAULT 0.0,
    nox_g DOUBLE NOT NULL DEFAULT 0.0,
    co_g DOUBLE NOT NULL DEFAULT 0.0,
    severity_level VARCHAR(20) NOT NULL DEFAULT 'LOW', -- LOW, MEDIUM, HIGH
    trip_date DATE NOT NULL,
    notes VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_trips_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_trips_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL,
    INDEX idx_trips_user_date (user_id, trip_date)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 4. ACTIVITIES TABLE
-- Daily activity logs across Transportation, Electricity, Food, Waste, Water, Lifestyle
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS activities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category VARCHAR(40) NOT NULL,      -- TRANSPORTATION, ELECTRICITY, FOOD, WASTE, WATER, LIFESTYLE
    activity_type VARCHAR(80) NOT NULL, -- e.g., AC_USAGE_HOURS, GRID_ELECTRICITY_KWH, MEAT_MEAL, VEGAN_MEAL, RECYCLING_KG, WATER_LITERS
    description VARCHAR(255) NOT NULL,
    quantity DOUBLE NOT NULL,
    unit VARCHAR(30) NOT NULL,          -- kWh, hours, meals, kg, liters, items, km
    emission_factor_used DOUBLE NOT NULL,
    co2_kg DOUBLE NOT NULL,
    pm25_g DOUBLE NOT NULL DEFAULT 0.0,
    nox_g DOUBLE NOT NULL DEFAULT 0.0,
    co_g DOUBLE NOT NULL DEFAULT 0.0,
    is_sustainable_action BOOLEAN NOT NULL DEFAULT FALSE,
    eco_points_earned INT NOT NULL DEFAULT 0,
    activity_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_activities_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_activities_user_date (user_id, activity_date),
    INDEX idx_activities_category (user_id, category)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 5. EMISSIONS TABLE
-- Unified environmental impact ledger for fast analytics, breakdowns & tree offsets
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS emissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    source_type VARCHAR(30) NOT NULL,   -- TRIP, ACTIVITY
    source_ref_id BIGINT NOT NULL,
    category VARCHAR(40) NOT NULL,      -- TRANSPORTATION, ELECTRICITY, FOOD, WASTE, WATER, LIFESTYLE
    co2_kg DOUBLE NOT NULL,
    pm25_g DOUBLE NOT NULL DEFAULT 0.0,
    nox_g DOUBLE NOT NULL DEFAULT 0.0,
    co_g DOUBLE NOT NULL DEFAULT 0.0,
    distance_km DOUBLE NOT NULL DEFAULT 0.0,
    fuel_consumed DOUBLE NOT NULL DEFAULT 0.0,
    trees_required DOUBLE NOT NULL DEFAULT 0.0,
    recorded_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_emissions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_emissions_user_date (user_id, recorded_date),
    INDEX idx_emissions_user_category (user_id, category)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 6. ECO_GOALS TABLE
-- Custom carbon reduction goals & monthly target tracking
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS eco_goals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    category VARCHAR(40) NOT NULL DEFAULT 'OVERALL', -- OVERALL, TRANSPORTATION, ELECTRICITY, FOOD, WASTE, WATER
    target_reduction_pct DOUBLE NOT NULL DEFAULT 20.0,
    baseline_co2_kg DOUBLE NOT NULL,
    target_max_co2_kg DOUBLE NOT NULL,
    current_co2_kg DOUBLE NOT NULL DEFAULT 0.0,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ON_TRACK', -- ON_TRACK, AT_RISK, COMPLETED, EXCEEDED
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_eco_goals_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_eco_goals_user (user_id)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 7. ECO_POINTS TABLE
-- Eco Journal ledger recording sustainable actions, daily challenges & points awarded
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS eco_points (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    action_code VARCHAR(60) NOT NULL,   -- PUBLIC_TRANSPORT, CYCLING_COMMUTE, SOLAR_USAGE, RECYCLING, DAILY_CHALLENGE, ZERO_CAR_DAY
    title VARCHAR(150) NOT NULL,
    category VARCHAR(40) NOT NULL,
    points INT NOT NULL,
    co2_saved_kg DOUBLE NOT NULL DEFAULT 0.0,
    earned_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_eco_points_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_eco_points_user_date (user_id, earned_date)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 8. ACHIEVEMENTS TABLE
-- Gamification badges, streaks, and environmental milestones per user
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS achievements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    badge_code VARCHAR(60) NOT NULL,    -- SEVEN_DAY_STREAK, LOW_CARBON_COMMUTER, TREE_SAVER, ZERO_WASTE_HERO, PLANET_PROTECTOR
    title VARCHAR(100) NOT NULL,
    description VARCHAR(255) NOT NULL,
    icon_name VARCHAR(50) NOT NULL,     -- Flame, Train, TreePine, Recycle, ShieldCheck, Award
    category VARCHAR(40) NOT NULL,
    points_reward INT NOT NULL DEFAULT 50,
    progress_current DOUBLE NOT NULL DEFAULT 0.0,
    progress_target DOUBLE NOT NULL DEFAULT 1.0,
    unlocked BOOLEAN NOT NULL DEFAULT FALSE,
    unlocked_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_achievements_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_badge (user_id, badge_code),
    INDEX idx_achievements_user (user_id)
) ENGINE=InnoDB;
