-- ============================================================================
-- Rollback Migration: 003_create_rbac_system_rollback
-- Description: Remove RBAC tables, functions, and views
-- Created: 2025-11-18
-- ============================================================================

-- Drop views
DROP VIEW IF EXISTS v_roles_with_permissions CASCADE;
DROP VIEW IF EXISTS v_user_roles_detailed CASCADE;

-- Drop triggers
DROP TRIGGER IF EXISTS trigger_roles_updated_at ON roles;

-- Drop functions
DROP FUNCTION IF EXISTS update_roles_updated_at() CASCADE;
DROP FUNCTION IF EXISTS revoke_role_from_user(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS grant_role_to_user(UUID, TEXT, UUID, BOOLEAN, TIMESTAMPTZ) CASCADE;
DROP FUNCTION IF EXISTS get_user_permissions(UUID) CASCADE;
DROP FUNCTION IF EXISTS user_has_permission(UUID, TEXT, TEXT, TEXT) CASCADE;

-- Drop tables (in reverse dependency order)
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

RAISE NOTICE 'RBAC system rollback completed!';
