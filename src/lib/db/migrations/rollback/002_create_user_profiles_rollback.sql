-- ============================================================================
-- Rollback Migration: 002_create_user_profiles_rollback
-- Description: Remove user_profiles table, views, and functions
-- Created: 2025-11-18
-- ============================================================================

-- Drop views
DROP VIEW IF EXISTS v_clients CASCADE;
DROP VIEW IF EXISTS v_employees CASCADE;
DROP VIEW IF EXISTS v_bench_candidates CASCADE;
DROP VIEW IF EXISTS v_students CASCADE;
DROP VIEW IF EXISTS v_active_users CASCADE;

-- Drop triggers
DROP TRIGGER IF EXISTS trigger_prevent_user_hard_delete ON user_profiles;
DROP TRIGGER IF EXISTS trigger_user_profiles_search ON user_profiles;
DROP TRIGGER IF EXISTS trigger_user_profiles_updated_at ON user_profiles;

-- Drop functions
DROP FUNCTION IF EXISTS prevent_user_hard_delete() CASCADE;
DROP FUNCTION IF EXISTS update_user_profiles_search_vector() CASCADE;
DROP FUNCTION IF EXISTS update_user_profiles_updated_at() CASCADE;

-- Drop table
DROP TABLE IF EXISTS user_profiles CASCADE;

RAISE NOTICE 'user_profiles rollback completed!';
