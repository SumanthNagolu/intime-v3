-- ============================================================================
-- Migration: 002_create_user_profiles
-- Description: Unified user table supporting all role types (students, employees,
--              candidates, clients, recruiters, admins). Follows the principle of
--              ONE user table to avoid data silos from legacy mistakes.
-- Created: 2025-11-18
-- Author: Database Architect Agent
-- Epic: FOUND-001 - Create Unified user_profiles Table
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search on names/emails

-- ============================================================================
-- TABLE: user_profiles
-- Purpose: Single source of truth for ALL users across all business pillars
-- Design Philosophy: Role-agnostic core fields + nullable role-specific fields
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  -- ===========================
  -- Primary Identification
  -- ===========================
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Link to Supabase Auth (auth.users table)
  auth_id UUID UNIQUE,

  -- ===========================
  -- Core Fields (ALL users)
  -- ===========================
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  timezone TEXT DEFAULT 'America/New_York',
  locale TEXT DEFAULT 'en-US',

  -- ===========================
  -- Student Fields (Training Academy)
  -- ===========================
  student_enrollment_date TIMESTAMPTZ,
  student_course_id UUID, -- FK to courses table (created in Epic 2)
  student_current_module TEXT,
  student_course_progress JSONB DEFAULT '{}', -- {module_1: 75, module_2: 30, ...}
  student_graduation_date TIMESTAMPTZ,
  student_certificates JSONB DEFAULT '[]', -- [{cert_id, issued_date, url}, ...]

  -- ===========================
  -- Employee Fields (HR Module)
  -- ===========================
  employee_hire_date TIMESTAMPTZ,
  employee_department TEXT, -- 'recruiting', 'training', 'sales', 'admin'
  employee_position TEXT,
  employee_salary NUMERIC(10,2),
  employee_status TEXT, -- 'active', 'on_leave', 'terminated'
  employee_manager_id UUID, -- Self-referencing FK to user_profiles(id)
  employee_performance_rating NUMERIC(3,2), -- 0.00 to 5.00

  -- ===========================
  -- Candidate Fields (Recruiting/Bench Sales)
  -- ===========================
  candidate_status TEXT, -- 'active', 'placed', 'bench', 'inactive', 'blacklisted'
  candidate_resume_url TEXT,
  candidate_skills TEXT[], -- Array: ['Java', 'Spring Boot', 'AWS', ...]
  candidate_experience_years INTEGER,
  candidate_current_visa TEXT, -- 'H1B', 'GC', 'USC', 'OPT', 'CPT', 'TN'
  candidate_visa_expiry TIMESTAMPTZ,
  candidate_hourly_rate NUMERIC(10,2), -- Bill rate
  candidate_bench_start_date TIMESTAMPTZ,
  candidate_availability TEXT, -- 'immediate', '2_weeks', '1_month'
  candidate_location TEXT, -- 'Remote', 'New York, NY', 'Hybrid - Boston, MA'
  candidate_willing_to_relocate BOOLEAN DEFAULT FALSE,

  -- ===========================
  -- Client Fields (Client Companies)
  -- ===========================
  client_company_name TEXT,
  client_industry TEXT, -- 'Finance', 'Healthcare', 'Tech', 'Insurance'
  client_tier TEXT, -- 'preferred', 'strategic', 'exclusive'
  client_contract_start_date TIMESTAMPTZ,
  client_contract_end_date TIMESTAMPTZ,
  client_payment_terms INTEGER DEFAULT 30, -- Days (Net 30, Net 60)
  client_preferred_markup_percentage NUMERIC(5,2), -- 35.00 means 35%

  -- ===========================
  -- Recruiter-Specific Fields
  -- ===========================
  recruiter_territory TEXT, -- Geographic or industry focus
  recruiter_specialization TEXT[], -- ['Java', 'Salesforce', 'SAP']
  recruiter_monthly_placement_target INTEGER DEFAULT 2,
  recruiter_pod_id UUID, -- FK to pods table (Epic 7)

  -- ===========================
  -- Metadata & Audit Fields
  -- ===========================
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID, -- FK to user_profiles(id) - who created this user
  updated_by UUID, -- FK to user_profiles(id) - who last updated
  deleted_at TIMESTAMPTZ, -- Soft delete
  is_active BOOLEAN DEFAULT TRUE,

  -- ===========================
  -- Search & Indexing
  -- ===========================
  search_vector TSVECTOR, -- Full-text search (name, email, skills)

  -- ===========================
  -- Constraints
  -- ===========================
  CONSTRAINT valid_email CHECK (
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'
  ),
  CONSTRAINT valid_candidate_status CHECK (
    candidate_status IS NULL OR
    candidate_status IN ('active', 'placed', 'bench', 'inactive', 'blacklisted')
  ),
  CONSTRAINT valid_employee_status CHECK (
    employee_status IS NULL OR
    employee_status IN ('active', 'on_leave', 'terminated')
  ),
  CONSTRAINT valid_client_tier CHECK (
    client_tier IS NULL OR
    client_tier IN ('preferred', 'strategic', 'exclusive')
  ),
  CONSTRAINT valid_candidate_availability CHECK (
    candidate_availability IS NULL OR
    candidate_availability IN ('immediate', '2_weeks', '1_month')
  ),
  CONSTRAINT valid_phone CHECK (
    phone IS NULL OR
    phone ~* '^\+?[1-9]\d{1,14}$' -- E.164 format
  )
);

-- ============================================================================
-- INDEXES for Query Performance
-- ============================================================================

-- Core lookups (most frequent queries)
CREATE INDEX idx_user_profiles_email ON user_profiles(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_user_profiles_auth_id ON user_profiles(auth_id) WHERE deleted_at IS NULL;

-- Active users (excluding soft-deleted)
CREATE INDEX idx_user_profiles_active ON user_profiles(is_active) WHERE deleted_at IS NULL;

-- Role-specific queries
CREATE INDEX idx_user_profiles_candidate_status ON user_profiles(candidate_status)
  WHERE candidate_status IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX idx_user_profiles_employee_department ON user_profiles(employee_department)
  WHERE employee_department IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX idx_user_profiles_client_tier ON user_profiles(client_tier)
  WHERE client_tier IS NOT NULL AND deleted_at IS NULL;

-- Skills search (GIN index for array containment)
CREATE INDEX idx_user_profiles_candidate_skills ON user_profiles USING GIN(candidate_skills)
  WHERE candidate_skills IS NOT NULL AND deleted_at IS NULL;

-- Full-text search
CREATE INDEX idx_user_profiles_search ON user_profiles USING GIN(search_vector);

-- Audit queries
CREATE INDEX idx_user_profiles_created_at ON user_profiles(created_at DESC);
CREATE INDEX idx_user_profiles_updated_at ON user_profiles(updated_at DESC);

-- Soft delete filtering (partial index for better performance)
CREATE INDEX idx_user_profiles_not_deleted ON user_profiles(id) WHERE deleted_at IS NULL;

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Auto-update search_vector for full-text search
CREATE OR REPLACE FUNCTION update_user_profiles_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.full_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.email, '')), 'B') ||
    setweight(to_tsvector('english', array_to_string(COALESCE(NEW.candidate_skills, ARRAY[]::TEXT[]), ' ')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.client_company_name, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Prevent hard deletes (enforce soft delete)
CREATE OR REPLACE FUNCTION prevent_user_hard_delete()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Hard deletes are not allowed on user_profiles. Use soft delete (UPDATE deleted_at) instead.';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update updated_at
CREATE TRIGGER trigger_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();

-- Trigger: Auto-update search_vector
CREATE TRIGGER trigger_user_profiles_search
  BEFORE INSERT OR UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_search_vector();

-- Trigger: Prevent hard deletes
CREATE TRIGGER trigger_prevent_user_hard_delete
  BEFORE DELETE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_user_hard_delete();

-- ============================================================================
-- HELPER VIEWS
-- ============================================================================

-- View: Active users only (most common query)
CREATE OR REPLACE VIEW v_active_users AS
SELECT *
FROM user_profiles
WHERE deleted_at IS NULL AND is_active = TRUE;

-- View: Students with enrollment status
CREATE OR REPLACE VIEW v_students AS
SELECT
  id,
  email,
  full_name,
  student_enrollment_date,
  student_current_module,
  student_course_progress,
  student_graduation_date,
  created_at
FROM user_profiles
WHERE student_enrollment_date IS NOT NULL
  AND deleted_at IS NULL
ORDER BY student_enrollment_date DESC;

-- View: Bench candidates (available for placement)
CREATE OR REPLACE VIEW v_bench_candidates AS
SELECT
  id,
  email,
  full_name,
  candidate_skills,
  candidate_experience_years,
  candidate_current_visa,
  candidate_hourly_rate,
  candidate_availability,
  candidate_location,
  candidate_bench_start_date
FROM user_profiles
WHERE candidate_status = 'bench'
  AND deleted_at IS NULL
ORDER BY candidate_bench_start_date ASC;

-- View: Active employees
CREATE OR REPLACE VIEW v_employees AS
SELECT
  id,
  email,
  full_name,
  employee_department,
  employee_position,
  employee_hire_date,
  employee_manager_id,
  employee_status
FROM user_profiles
WHERE employee_hire_date IS NOT NULL
  AND employee_status = 'active'
  AND deleted_at IS NULL
ORDER BY employee_hire_date DESC;

-- View: Client companies
CREATE OR REPLACE VIEW v_clients AS
SELECT
  id,
  email,
  full_name AS contact_name,
  client_company_name,
  client_industry,
  client_tier,
  client_contract_start_date,
  client_contract_end_date,
  client_payment_terms
FROM user_profiles
WHERE client_company_name IS NOT NULL
  AND deleted_at IS NULL
ORDER BY client_tier DESC, client_company_name ASC;

-- ============================================================================
-- COMMENTS for Documentation
-- ============================================================================

COMMENT ON TABLE user_profiles IS
'Unified user table supporting all roles: students, employees, candidates, clients, recruiters, admins.
Uses nullable role-specific columns to avoid data silos while maintaining a single source of truth.';

COMMENT ON COLUMN user_profiles.auth_id IS
'Link to Supabase auth.users table. Nullable to support users created outside auth flow (e.g., imported candidates).';

COMMENT ON COLUMN user_profiles.search_vector IS
'Auto-maintained full-text search vector. Updated via trigger on INSERT/UPDATE.';

COMMENT ON COLUMN user_profiles.deleted_at IS
'Soft delete timestamp. NULL = active, NOT NULL = deleted. Hard deletes are prevented by trigger.';

COMMENT ON COLUMN user_profiles.candidate_status IS
'Candidate lifecycle: active (sourced) → bench (available) → placed (working) → inactive (not pursuing).';

COMMENT ON COLUMN user_profiles.client_tier IS
'Client relationship tier: preferred (standard) → strategic (high volume) → exclusive (partnership).';

-- ============================================================================
-- SAMPLE DATA (for development/testing)
-- ============================================================================

-- Example: Admin user
INSERT INTO user_profiles (
  email,
  full_name,
  employee_department,
  employee_position,
  employee_hire_date,
  employee_status
) VALUES (
  'admin@intimesolutions.com',
  'System Administrator',
  'admin',
  'Platform Admin',
  NOW(),
  'active'
) ON CONFLICT (email) DO NOTHING;

-- Example: Student
INSERT INTO user_profiles (
  email,
  full_name,
  student_enrollment_date,
  student_current_module,
  student_course_progress
) VALUES (
  'student@example.com',
  'Jane Student',
  NOW() - INTERVAL '2 weeks',
  'Module 3: Advanced Java',
  '{"module_1": 100, "module_2": 100, "module_3": 45}'::jsonb
) ON CONFLICT (email) DO NOTHING;

-- Example: Bench candidate
INSERT INTO user_profiles (
  email,
  full_name,
  candidate_status,
  candidate_skills,
  candidate_experience_years,
  candidate_current_visa,
  candidate_hourly_rate,
  candidate_availability,
  candidate_location,
  candidate_bench_start_date
) VALUES (
  'candidate@example.com',
  'John Candidate',
  'bench',
  ARRAY['Java', 'Spring Boot', 'Microservices', 'AWS'],
  8,
  'H1B',
  85.00,
  'immediate',
  'Remote',
  NOW() - INTERVAL '15 days'
) ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Migration 002_create_user_profiles.sql completed successfully!';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Table created: user_profiles';
  RAISE NOTICE 'Views created: v_active_users, v_students, v_bench_candidates, v_employees, v_clients';
  RAISE NOTICE 'Indexes created: 11 strategic indexes for performance';
  RAISE NOTICE 'Triggers: updated_at, search_vector, prevent_hard_delete';
  RAISE NOTICE 'Sample data: 3 example users inserted';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Next: Run 003_create_rbac_system.sql';
  RAISE NOTICE '============================================================';
END $$;
