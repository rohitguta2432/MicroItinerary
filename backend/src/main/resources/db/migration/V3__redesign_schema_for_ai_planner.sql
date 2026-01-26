-- Migration V3: Complete schema redesign for AI Travel Planner
-- This migration drops all old tables and creates the new schema

-- Drop old tables (in reverse dependency order)
DROP TABLE IF EXISTS packing_items CASCADE;
DROP TABLE IF EXISTS places CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS trip_days CASCADE;
DROP TABLE IF EXISTS trips CASCADE;

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    picture_url TEXT,
    google_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);

-- ============================================
-- ANNUAL PLANS TABLE
-- ============================================
CREATE TABLE annual_plans (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    total_budget DECIMAL(12, 2) DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, year)
);

CREATE INDEX idx_annual_plans_user_id ON annual_plans(user_id);

-- ============================================
-- TRIPS TABLE
-- ============================================
CREATE TABLE trips (
    id UUID PRIMARY KEY,
    annual_plan_id UUID NOT NULL REFERENCES annual_plans(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    destination_country VARCHAR(100),
    destination_state VARCHAR(100),
    destination_city VARCHAR(100),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    travel_type VARCHAR(50), -- LEISURE, BUSINESS, ADVENTURE, RELIGIOUS
    group_type VARCHAR(20) NOT NULL DEFAULT 'SOLO', -- SOLO, FRIENDS, FAMILY
    amenities TEXT[], -- Array of amenity strings
    estimated_cost DECIMAL(12, 2) DEFAULT 0,
    ai_suggestion_cache JSONB, -- Cached AI response
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trips_annual_plan_id ON trips(annual_plan_id);
CREATE INDEX idx_trips_start_date ON trips(start_date);

-- ============================================
-- TRIP MEMBERS TABLE
-- ============================================
CREATE TABLE trip_members (
    id UUID PRIMARY KEY,
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'MEMBER', -- OWNER, MEMBER
    joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(trip_id, user_id)
);

CREATE INDEX idx_trip_members_trip_id ON trip_members(trip_id);
CREATE INDEX idx_trip_members_user_id ON trip_members(user_id);

-- ============================================
-- EXPENSES TABLE
-- ============================================
CREATE TABLE expenses (
    id UUID PRIMARY KEY,
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    paid_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL, -- HOTEL, FOOD, TRANSPORT, ACTIVITY, OTHER
    amount DECIMAL(12, 2) NOT NULL,
    description VARCHAR(500),
    expense_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_expenses_trip_id ON expenses(trip_id);
CREATE INDEX idx_expenses_paid_by ON expenses(paid_by_user_id);

-- ============================================
-- EXPENSE SPLITS TABLE
-- ============================================
CREATE TABLE expense_splits (
    id UUID PRIMARY KEY,
    expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    is_settled BOOLEAN DEFAULT FALSE,
    settled_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(expense_id, user_id)
);

CREATE INDEX idx_expense_splits_expense_id ON expense_splits(expense_id);
CREATE INDEX idx_expense_splits_user_id ON expense_splits(user_id);

-- ============================================
-- INVITATIONS TABLE
-- ============================================
CREATE TABLE invitations (
    id UUID PRIMARY KEY,
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    invited_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    invite_code VARCHAR(50) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, ACCEPTED, EXPIRED
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invitations_trip_id ON invitations(trip_id);
CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_invite_code ON invitations(invite_code);

-- ============================================
-- AI CACHE TABLE (for Redis fallback)
-- ============================================
CREATE TABLE ai_cache (
    id UUID PRIMARY KEY,
    cache_key VARCHAR(500) NOT NULL UNIQUE,
    response JSONB NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_cache_key ON ai_cache(cache_key);
CREATE INDEX idx_ai_cache_expires ON ai_cache(expires_at);
