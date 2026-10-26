-- ============================================================================
-- RupeeTrack: India-Focused Expense Tracker Database Schema
-- Database: MySQL 8.0+
-- Collation: utf8mb4_unicode_ci
-- ============================================================================

CREATE DATABASE IF NOT EXISTS expense_tracker_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE expense_tracker_db;

-- ----------------------------------------------------------------------------
-- Table: users
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Kolkata',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: categories
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(60) NOT NULL,
    type ENUM('EXPENSE', 'INCOME') NOT NULL DEFAULT 'EXPENSE',
    icon VARCHAR(50) DEFAULT 'Tags',
    color VARCHAR(20) DEFAULT '#8b5cf6',
    is_custom BOOLEAN NOT NULL DEFAULT FALSE,
    user_id BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_cat_user (user_id),
    INDEX idx_cat_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: expenses
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS expenses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    category_id BIGINT NOT NULL,
    payment_method ENUM('UPI', 'CASH', 'DEBIT_CARD', 'CREDIT_CARD', 'BANK_TRANSFER', 'OTHER') NOT NULL DEFAULT 'UPI',
    expense_date DATE NOT NULL,
    notes TEXT NULL,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_exp_user_date (user_id, expense_date),
    INDEX idx_exp_category (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: income
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS income (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    source ENUM('SALARY', 'POCKET_MONEY', 'FREELANCE', 'BUSINESS', 'GIFTS', 'OTHER') NOT NULL DEFAULT 'SALARY',
    income_date DATE NOT NULL,
    notes TEXT NULL,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_inc_user_date (user_id, income_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: budgets
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS budgets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    budget_month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    category_id BIGINT NULL,          -- NULL indicates Overall Monthly Budget
    amount DECIMAL(12, 2) NOT NULL,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_user_month_cat (user_id, budget_month, category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: savings_goals
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS savings_goals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    target_amount DECIMAL(12, 2) NOT NULL,
    current_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    target_date DATE NOT NULL,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_goal_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Default Indian Expense Categories Seeding
-- ----------------------------------------------------------------------------
INSERT INTO categories (id, name, type, icon, color, is_custom, user_id) VALUES
(1, 'Food and Dining', 'EXPENSE', 'Utensils', '#f97316', FALSE, NULL),
(2, 'Canteen and Mess', 'EXPENSE', 'Coffee', '#eab308', FALSE, NULL),
(3, 'Transport', 'EXPENSE', 'Bus', '#3b82f6', FALSE, NULL),
(4, 'Shopping', 'EXPENSE', 'ShoppingBag', '#ec4899', FALSE, NULL),
(5, 'Rent and Hostel', 'EXPENSE', 'Home', '#8b5cf6', FALSE, NULL),
(6, 'Bills and Utilities', 'EXPENSE', 'Zap', '#06b6d4', FALSE, NULL),
(7, 'Education', 'EXPENSE', 'GraduationCap', '#10b981', FALSE, NULL),
(8, 'Healthcare', 'EXPENSE', 'HeartPulse', '#ef4444', FALSE, NULL),
(9, 'Entertainment', 'EXPENSE', 'Film', '#a855f7', FALSE, NULL),
(10, 'Mobile Recharge', 'EXPENSE', 'Smartphone', '#14b8a6', FALSE, NULL),
(11, 'Subscriptions', 'EXPENSE', 'Tv', '#6366f1', FALSE, NULL),
(12, 'Family Expenses', 'EXPENSE', 'Users', '#f43f5e', FALSE, NULL),
(13, 'Travel', 'EXPENSE', 'Plane', '#0ea5e9', FALSE, NULL),
(14, 'Other', 'EXPENSE', 'MoreHorizontal', '#64748b', FALSE, NULL)
ON DUPLICATE KEY UPDATE name=VALUES(name);
