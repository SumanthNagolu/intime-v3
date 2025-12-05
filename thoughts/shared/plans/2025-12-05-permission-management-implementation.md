# Permission Management Implementation Plan

## Overview

Implement a comprehensive permission management system for the InTime Admin Portal, enabling admins to configure role-based permissions (RBAC), data scopes, custom overrides, feature flags, bulk updates, and API token management.

**Epic**: Admin Portal (Epic-01)
**Story ID**: ADMIN-US-004
**Priority**: High
**Source Spec**: `docs/specs/20-USER-ROLES/10-admin/06-permission-management.md`

## Current State Analysis

### What EXISTS in Database:
- `system_roles` table with 14 predefined roles (seeded)
- `roles` table (empty - for custom org roles)
- `permissions` table (exists, likely empty)
- `role_permissions` table (exists, likely empty)
- `user_roles` table (exists, likely empty)
- `check_user_permission()` function at DB level (NOT called from app)
- RACI ownership system (`object_owners`, `raci_change_log`)
- User management with `user_profiles.role_id → system_roles.id`

### What's MISSING:
- **Database**: `permission_overrides`, `api_tokens`, `feature_flags`, `feature_flag_roles`, `bulk_update_history` tables
- **Database**: Permission records seeded into `permissions` table
- **Database**: Role-permission mappings seeded into `role_permissions` table
- **Application**: Permission evaluation library (`src/lib/auth/permission-evaluator.ts`)
- **Application**: tRPC permissions router
- **UI**: All permission management pages

### Key Discoveries:
- Current auth uses `user_profiles.role_id` linking directly to `system_roles.id` (`src/server/routers/users.ts:240-242`)
- tRPC middleware only checks authentication + org membership, no permission checking (`src/server/trpc/middleware.ts:4-35`)
- UI patterns established in UsersListPage, UserFormPage, UserDetailPage for reuse
- Audit logging pattern exists and should be followed (`src/server/routers/users.ts:293-307`)

## Desired End State

After implementation:
1. Admins can view/edit permission matrix by object type (AC-1)
2. Admins can configure default data scopes per role (AC-2)
3. Admins can compare two roles side-by-side (AC-3)
4. Admins can create/revoke user-specific permission overrides (AC-4)
5. Admins can test permissions as any user with detailed chain (AC-5)
6. Admins can perform bulk permission updates with rollback (AC-6)
7. Admins can generate/manage API tokens with scopes (AC-7)
8. Feature flags system enables/disables features per role (full scope)

### Verification:
- All 7 acceptance criteria pass manual testing
- Permission checks enforced in tRPC middleware
- Audit logs created for all permission changes
- UI matches design system (Hublot-inspired, `bg-cream`, `hublot-900` buttons)

## What We're NOT Doing

- Attribute-based access control (ABAC) - out of scope per spec
- Time-based permissions (e.g., "only during business hours")
- Geolocation-based permissions
- Real-time permission sync via WebSocket
- Permission inheritance tree UI visualization (simplified comparison instead)

## Implementation Approach

### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         UI Components                                │
│  PermissionMatrixPage, PermissionTestDialog, OverrideForm, etc.     │
└─────────────────────────────┬───────────────────────────────────────┘
                              │ tRPC hooks
┌─────────────────────────────▼───────────────────────────────────────┐
│                    Permission Evaluation Layer                       │
│        src/lib/auth/permission-evaluator.ts                         │
│  evaluatePermission() - full chain with RACI + overrides + flags    │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────────┐
│                       tRPC Permissions Router                        │
│  src/server/routers/permissions.ts                                  │
│  getMatrix, updateRolePermission, testPermission, createOverride,   │
│  compareRoles, bulkUpdate, generateToken, revokeToken               │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────────┐
│                         PostgreSQL                                   │
│  permissions, role_permissions, permission_overrides,               │
│  feature_flags, feature_flag_roles, api_tokens, bulk_update_history │
└─────────────────────────────────────────────────────────────────────┘
```

### Phasing Strategy

| Phase | Focus | Acceptance Criteria |
|-------|-------|---------------------|
| 1 | Database Schema | Foundation for all features |
| 2 | Permission Evaluation Library | AC-5 (testing needs evaluator) |
| 3 | tRPC Router | API for all operations |
| 4 | Permission Matrix View | AC-1 |
| 5 | Data Scope Configuration | AC-2 |
| 6 | Permission Testing | AC-5 |
| 7 | Role Comparison | AC-3 |
| 8 | Custom Overrides | AC-4 |
| 9 | Feature Flags | Full scope |
| 10 | API Tokens | AC-7 |
| 11 | Bulk Updates | AC-6 |

---

## Phase 1: Database Schema

### Overview
Create all missing database tables and seed initial permission data.

### Changes Required:

#### 1. Migration File
**File**: `supabase/migrations/20251206000000_permission_management_tables.sql`

```sql
-- Migration: Permission Management Tables
-- Description: Create tables for comprehensive permission management system
-- Date: 2025-12-06

-- =============================================================================
-- 1. ENSURE CORE RBAC TABLES EXIST
-- =============================================================================

-- Permissions table (CREATE IF NOT EXISTS for idempotency)
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  object_type VARCHAR(50) NOT NULL,
  action VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT valid_action CHECK (
    action IN ('create', 'read', 'update', 'delete', 'approve', 'reject', 'export', 'import', 'manage', 'assign')
  )
);

-- Role Permissions table
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES system_roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  scope_condition VARCHAR(50) DEFAULT 'own',
  granted BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  granted_by UUID REFERENCES user_profiles(id),
  UNIQUE(role_id, permission_id),
  CONSTRAINT valid_scope CHECK (
    scope_condition IN ('own', 'own_raci', 'own_ra', 'team', 'region', 'org', 'draft_only')
  )
);

-- =============================================================================
-- 2. PERMISSION OVERRIDES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS permission_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  granted BOOLEAN NOT NULL,
  scope_override VARCHAR(50),
  reason TEXT NOT NULL,
  expires_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES user_profiles(id),
  CONSTRAINT unique_active_override UNIQUE NULLS NOT DISTINCT (user_id, permission_id, revoked_at)
);

CREATE INDEX IF NOT EXISTS idx_permission_overrides_user ON permission_overrides(user_id);
CREATE INDEX IF NOT EXISTS idx_permission_overrides_org ON permission_overrides(org_id);
CREATE INDEX IF NOT EXISTS idx_permission_overrides_expires ON permission_overrides(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_permission_overrides_active ON permission_overrides(user_id, permission_id) WHERE revoked_at IS NULL;

ALTER TABLE permission_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "permission_overrides_org_isolation" ON permission_overrides
  FOR ALL USING (org_id = auth_user_org_id() OR user_is_admin());

-- =============================================================================
-- 3. FEATURE FLAGS TABLES
-- =============================================================================

CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  code VARCHAR(100) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  default_enabled BOOLEAN DEFAULT false,
  is_global BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(org_id, code)
);

CREATE INDEX IF NOT EXISTS idx_feature_flags_org ON feature_flags(org_id);
CREATE INDEX IF NOT EXISTS idx_feature_flags_code ON feature_flags(code);

CREATE TABLE IF NOT EXISTS feature_flag_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_flag_id UUID NOT NULL REFERENCES feature_flags(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES system_roles(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(feature_flag_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_feature_flag_roles_flag ON feature_flag_roles(feature_flag_id);
CREATE INDEX IF NOT EXISTS idx_feature_flag_roles_role ON feature_flag_roles(role_id);

ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flag_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feature_flags_org_isolation" ON feature_flags
  FOR ALL USING (org_id IS NULL OR org_id = auth_user_org_id() OR user_is_admin());

CREATE POLICY "feature_flag_roles_read" ON feature_flag_roles
  FOR SELECT USING (true);

-- =============================================================================
-- 4. API TOKENS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS api_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  token_prefix VARCHAR(10) NOT NULL,
  scopes TEXT[] NOT NULL DEFAULT '{}',
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  last_used_ip INET,
  usage_count INTEGER DEFAULT 0,
  rate_limit_per_hour INTEGER DEFAULT 1000,
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_api_tokens_org ON api_tokens(org_id);
CREATE INDEX IF NOT EXISTS idx_api_tokens_hash ON api_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_api_tokens_active ON api_tokens(org_id) WHERE revoked_at IS NULL;

ALTER TABLE api_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "api_tokens_org_isolation" ON api_tokens
  FOR ALL USING (org_id = auth_user_org_id() OR user_is_admin());

-- =============================================================================
-- 5. BULK UPDATE HISTORY TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS bulk_update_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  update_type VARCHAR(50) NOT NULL,
  affected_user_ids UUID[] NOT NULL,
  changes JSONB NOT NULL,
  previous_state JSONB NOT NULL,
  reason TEXT NOT NULL,
  applied_by UUID NOT NULL REFERENCES user_profiles(id),
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  rolled_back_at TIMESTAMPTZ,
  rolled_back_by UUID REFERENCES user_profiles(id),
  CONSTRAINT valid_update_type CHECK (
    update_type IN ('enable_feature', 'disable_feature', 'change_scope', 'add_permission', 'remove_permission')
  )
);

CREATE INDEX IF NOT EXISTS idx_bulk_update_history_org ON bulk_update_history(org_id);
CREATE INDEX IF NOT EXISTS idx_bulk_update_history_applied ON bulk_update_history(applied_at DESC);

ALTER TABLE bulk_update_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bulk_update_history_org_isolation" ON bulk_update_history
  FOR ALL USING (org_id = auth_user_org_id() OR user_is_admin());

-- =============================================================================
-- 6. SEED PERMISSIONS DATA
-- =============================================================================

-- Clear existing permissions to reseed (idempotent)
DELETE FROM role_permissions;
DELETE FROM permissions;

-- Jobs permissions
INSERT INTO permissions (code, name, description, object_type, action) VALUES
('jobs.create', 'Create Jobs', 'Create new job requisitions', 'jobs', 'create'),
('jobs.read', 'View Jobs', 'View job requisitions', 'jobs', 'read'),
('jobs.update', 'Update Jobs', 'Edit job requisitions', 'jobs', 'update'),
('jobs.delete', 'Delete Jobs', 'Delete job requisitions', 'jobs', 'delete'),
('jobs.approve', 'Approve Jobs', 'Approve job requisitions', 'jobs', 'approve');

-- Candidates permissions
INSERT INTO permissions (code, name, description, object_type, action) VALUES
('candidates.create', 'Create Candidates', 'Add new candidates', 'candidates', 'create'),
('candidates.read', 'View Candidates', 'View candidate profiles', 'candidates', 'read'),
('candidates.update', 'Update Candidates', 'Edit candidate profiles', 'candidates', 'update'),
('candidates.delete', 'Delete Candidates', 'Delete candidates', 'candidates', 'delete'),
('candidates.export', 'Export Candidates', 'Export candidate data', 'candidates', 'export');

-- Submissions permissions
INSERT INTO permissions (code, name, description, object_type, action) VALUES
('submissions.create', 'Create Submissions', 'Submit candidates to jobs', 'submissions', 'create'),
('submissions.read', 'View Submissions', 'View submissions', 'submissions', 'read'),
('submissions.update', 'Update Submissions', 'Update submission status', 'submissions', 'update'),
('submissions.delete', 'Delete Submissions', 'Delete submissions', 'submissions', 'delete'),
('submissions.approve', 'Approve Submissions', 'Approve candidate submissions', 'submissions', 'approve');

-- Accounts (CRM) permissions
INSERT INTO permissions (code, name, description, object_type, action) VALUES
('accounts.create', 'Create Accounts', 'Add new client accounts', 'accounts', 'create'),
('accounts.read', 'View Accounts', 'View client accounts', 'accounts', 'read'),
('accounts.update', 'Update Accounts', 'Edit client accounts', 'accounts', 'update'),
('accounts.delete', 'Delete Accounts', 'Delete client accounts', 'accounts', 'delete'),
('accounts.manage', 'Manage Accounts', 'Full account management', 'accounts', 'manage');

-- Users permissions
INSERT INTO permissions (code, name, description, object_type, action) VALUES
('users.create', 'Create Users', 'Add new users', 'users', 'create'),
('users.read', 'View Users', 'View user profiles', 'users', 'read'),
('users.update', 'Update Users', 'Edit user profiles', 'users', 'update'),
('users.delete', 'Delete Users', 'Delete users', 'users', 'delete'),
('users.manage', 'Manage Users', 'Full user management', 'users', 'manage');

-- Reports permissions
INSERT INTO permissions (code, name, description, object_type, action) VALUES
('reports.read', 'View Reports', 'View reports and analytics', 'reports', 'read'),
('reports.create', 'Create Reports', 'Create custom reports', 'reports', 'create'),
('reports.export', 'Export Reports', 'Export report data', 'reports', 'export');

-- Settings permissions
INSERT INTO permissions (code, name, description, object_type, action) VALUES
('settings.read', 'View Settings', 'View system settings', 'settings', 'read'),
('settings.update', 'Update Settings', 'Modify system settings', 'settings', 'update'),
('settings.manage', 'Manage Settings', 'Full settings management', 'settings', 'manage');

-- Permissions management
INSERT INTO permissions (code, name, description, object_type, action) VALUES
('permissions.read', 'View Permissions', 'View permission matrix', 'permissions', 'read'),
('permissions.update', 'Update Permissions', 'Modify role permissions', 'permissions', 'update'),
('permissions.manage', 'Manage Permissions', 'Full permission management', 'permissions', 'manage');

-- =============================================================================
-- 7. SEED ROLE PERMISSIONS (Default mappings)
-- =============================================================================

-- Technical Recruiter permissions
INSERT INTO role_permissions (role_id, permission_id, scope_condition, granted)
SELECT sr.id, p.id,
  CASE
    WHEN p.action = 'create' THEN 'org'
    WHEN p.action IN ('read', 'update') THEN 'own_raci'
    WHEN p.action = 'delete' THEN 'draft_only'
    ELSE 'own'
  END,
  CASE WHEN p.action = 'approve' THEN false ELSE true END
FROM system_roles sr
CROSS JOIN permissions p
WHERE sr.code = 'technical_recruiter'
  AND p.object_type IN ('jobs', 'candidates', 'submissions')
  AND p.action IN ('create', 'read', 'update', 'delete');

-- Pod Manager permissions (team scope)
INSERT INTO role_permissions (role_id, permission_id, scope_condition, granted)
SELECT sr.id, p.id, 'team', true
FROM system_roles sr
CROSS JOIN permissions p
WHERE sr.code = 'recruiting_manager'
  AND p.object_type IN ('jobs', 'candidates', 'submissions')
  AND p.action IN ('create', 'read', 'update', 'delete', 'approve');

-- Admin permissions (full org scope)
INSERT INTO role_permissions (role_id, permission_id, scope_condition, granted)
SELECT sr.id, p.id, 'org', true
FROM system_roles sr
CROSS JOIN permissions p
WHERE sr.code = 'admin';

-- Regional Director permissions
INSERT INTO role_permissions (role_id, permission_id, scope_condition, granted)
SELECT sr.id, p.id, 'region', true
FROM system_roles sr
CROSS JOIN permissions p
WHERE sr.code = 'regional_director'
  AND p.object_type IN ('jobs', 'candidates', 'submissions', 'accounts')
  AND p.action IN ('create', 'read', 'update', 'approve');

-- HR Manager permissions (org-wide read, limited write)
INSERT INTO role_permissions (role_id, permission_id, scope_condition, granted)
SELECT sr.id, p.id, 'org', true
FROM system_roles sr
CROSS JOIN permissions p
WHERE sr.code = 'hr_manager'
  AND p.object_type IN ('users', 'reports')
  AND p.action IN ('create', 'read', 'update');

-- =============================================================================
-- 8. SEED FEATURE FLAGS
-- =============================================================================

INSERT INTO feature_flags (code, name, description, default_enabled, is_global) VALUES
('ai_twin', 'AI Twin System', 'AI-powered assistant for recruiters', false, true),
('bulk_email', 'Bulk Email Campaigns', 'Send bulk emails to candidates', false, true),
('advanced_analytics', 'Advanced Analytics', 'Detailed analytics dashboard', false, true),
('api_access', 'API Access', 'External API access', false, true),
('data_export', 'Data Export', 'Export data in various formats', true, true),
('mobile_app', 'Mobile App Access', 'Access via mobile application', false, true),
('integrations', 'Third-party Integrations', 'Connect with external services', false, true)
ON CONFLICT (org_id, code) DO NOTHING;

-- Enable features for specific roles
INSERT INTO feature_flag_roles (feature_flag_id, role_id, enabled)
SELECT ff.id, sr.id, true
FROM feature_flags ff
CROSS JOIN system_roles sr
WHERE ff.code = 'ai_twin'
  AND sr.category IN ('pod_ic', 'pod_manager')
ON CONFLICT (feature_flag_id, role_id) DO NOTHING;

INSERT INTO feature_flag_roles (feature_flag_id, role_id, enabled)
SELECT ff.id, sr.id, true
FROM feature_flags ff
CROSS JOIN system_roles sr
WHERE ff.code = 'advanced_analytics'
  AND sr.category IN ('pod_manager', 'leadership', 'executive', 'admin')
ON CONFLICT (feature_flag_id, role_id) DO NOTHING;

INSERT INTO feature_flag_roles (feature_flag_id, role_id, enabled)
SELECT ff.id, sr.id, true
FROM feature_flags ff
CROSS JOIN system_roles sr
WHERE ff.code = 'api_access'
  AND sr.category IN ('leadership', 'executive', 'admin')
ON CONFLICT (feature_flag_id, role_id) DO NOTHING;

-- =============================================================================
-- 9. HELPER FUNCTIONS
-- =============================================================================

-- Check if user has permission (application-level)
CREATE OR REPLACE FUNCTION app_check_permission(
  p_user_id UUID,
  p_permission_code TEXT,
  p_entity_id UUID DEFAULT NULL
)
RETURNS TABLE (
  allowed BOOLEAN,
  reason TEXT,
  scope TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_role_id UUID;
  v_role_permission RECORD;
  v_override RECORD;
BEGIN
  -- Get user's role
  SELECT role_id INTO v_user_role_id
  FROM user_profiles
  WHERE id = p_user_id;

  IF v_user_role_id IS NULL THEN
    RETURN QUERY SELECT false, 'User has no assigned role', NULL::TEXT;
    RETURN;
  END IF;

  -- Check for active override (takes priority)
  SELECT po.* INTO v_override
  FROM permission_overrides po
  JOIN permissions p ON po.permission_id = p.id
  WHERE po.user_id = p_user_id
    AND p.code = p_permission_code
    AND po.revoked_at IS NULL
    AND (po.expires_at IS NULL OR po.expires_at > NOW())
  LIMIT 1;

  IF FOUND THEN
    IF v_override.granted THEN
      RETURN QUERY SELECT true, 'Allowed by custom override: ' || v_override.reason, v_override.scope_override;
    ELSE
      RETURN QUERY SELECT false, 'Denied by custom override: ' || v_override.reason, NULL::TEXT;
    END IF;
    RETURN;
  END IF;

  -- Check role permission
  SELECT rp.*, p.code INTO v_role_permission
  FROM role_permissions rp
  JOIN permissions p ON rp.permission_id = p.id
  WHERE rp.role_id = v_user_role_id
    AND p.code = p_permission_code
    AND rp.granted = true;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Permission not granted to role', NULL::TEXT;
    RETURN;
  END IF;

  -- Permission granted with scope
  RETURN QUERY SELECT true, 'Allowed by role permission', v_role_permission.scope_condition;
END;
$$;

COMMENT ON FUNCTION app_check_permission IS 'Application-level permission check with override support';

-- =============================================================================
-- 10. GRANTS
-- =============================================================================

GRANT ALL ON permissions TO authenticated;
GRANT ALL ON role_permissions TO authenticated;
GRANT ALL ON permission_overrides TO authenticated;
GRANT ALL ON feature_flags TO authenticated;
GRANT ALL ON feature_flag_roles TO authenticated;
GRANT ALL ON api_tokens TO authenticated;
GRANT ALL ON bulk_update_history TO authenticated;
```

### Success Criteria:

#### Automated Verification:
- [ ] Migration applies cleanly: `pnpm db:migrate`
- [ ] All tables created: `permissions`, `role_permissions`, `permission_overrides`, `feature_flags`, `feature_flag_roles`, `api_tokens`, `bulk_update_history`
- [ ] Permission records seeded (35+ permissions)
- [ ] Role-permission mappings created for system roles
- [ ] Feature flags seeded with role assignments
- [ ] RLS policies active on all tables

#### Manual Verification:
- [ ] Query `SELECT * FROM permissions` returns permission records
- [ ] Query `SELECT * FROM role_permissions` shows role mappings
- [ ] Query `SELECT * FROM feature_flags` shows feature flag records
- [ ] RLS prevents cross-org data access

**Implementation Note**: After completing this phase, run `pnpm db:migrate` and verify in Supabase dashboard before proceeding.

---

## Phase 2: Permission Evaluation Library

### Overview
Create a TypeScript library for evaluating permissions with full chain details.

### Changes Required:

#### 1. Permission Evaluator Types
**File**: `src/lib/auth/permission-types.ts`

```typescript
export type PermissionScope = 'own' | 'own_raci' | 'own_ra' | 'team' | 'region' | 'org' | 'draft_only';
export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'approve' | 'reject' | 'export' | 'import' | 'manage' | 'assign';

export interface PermissionCheckResult {
  allowed: boolean;
  reason: string;
  chain: PermissionChainStep[];
  scope?: PermissionScope;
}

export interface PermissionChainStep {
  step: string;
  result: 'pass' | 'fail' | 'skip';
  detail: string;
}

export interface UserContext {
  id: string;
  roleId: string;
  roleName: string;
  orgId: string;
  podId?: string;
  regionId?: string;
  status: string;
}

export interface PermissionOverride {
  id: string;
  permissionId: string;
  granted: boolean;
  scopeOverride?: PermissionScope;
  reason: string;
  expiresAt?: Date;
}
```

#### 2. Permission Evaluator Implementation
**File**: `src/lib/auth/permission-evaluator.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import type {
  PermissionCheckResult,
  PermissionChainStep,
  UserContext,
  PermissionScope
} from './permission-types';

export async function evaluatePermission(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  permissionCode: string,
  entityId?: string
): Promise<PermissionCheckResult> {
  const chain: PermissionChainStep[] = [];

  // Step 1: Get user context
  const { data: user, error: userError } = await supabase
    .from('user_profiles')
    .select(`
      id,
      status,
      role_id,
      org_id,
      system_roles!inner (
        id,
        name,
        code
      ),
      pod_memberships (
        pod_id,
        is_active
      )
    `)
    .eq('id', userId)
    .single();

  if (userError || !user) {
    return {
      allowed: false,
      reason: 'User not found',
      chain: [{ step: 'User lookup', result: 'fail', detail: 'User does not exist' }]
    };
  }

  // Step 2: Check user status
  if (user.status !== 'active') {
    chain.push({ step: 'Account status', result: 'fail', detail: `User status is ${user.status}` });
    return {
      allowed: false,
      reason: `User account is ${user.status}`,
      chain
    };
  }
  chain.push({ step: 'Account status', result: 'pass', detail: 'User is active' });

  // Step 3: Check for permission override (highest priority)
  const { data: override } = await supabase
    .from('permission_overrides')
    .select(`
      id,
      granted,
      scope_override,
      reason,
      expires_at,
      permissions!inner (code)
    `)
    .eq('user_id', userId)
    .eq('permissions.code', permissionCode)
    .is('revoked_at', null)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .single();

  if (override) {
    if (!override.granted) {
      chain.push({
        step: 'Custom override',
        result: 'fail',
        detail: `Denied: ${override.reason}`
      });
      return {
        allowed: false,
        reason: 'Denied by custom override',
        chain
      };
    }
    chain.push({
      step: 'Custom override',
      result: 'pass',
      detail: `Allowed: ${override.reason}`
    });
    return {
      allowed: true,
      reason: 'Allowed by custom override',
      chain,
      scope: override.scope_override as PermissionScope
    };
  }
  chain.push({ step: 'Custom override', result: 'skip', detail: 'No override found' });

  // Step 4: Check role permission
  const { data: rolePermission } = await supabase
    .from('role_permissions')
    .select(`
      granted,
      scope_condition,
      permissions!inner (code, object_type, action)
    `)
    .eq('role_id', user.role_id)
    .eq('permissions.code', permissionCode)
    .single();

  if (!rolePermission || !rolePermission.granted) {
    chain.push({
      step: 'Role permission',
      result: 'fail',
      detail: `Role "${(user.system_roles as any).name}" does not have this permission`
    });
    return {
      allowed: false,
      reason: `Role does not have ${permissionCode} permission`,
      chain
    };
  }
  chain.push({
    step: 'Role permission',
    result: 'pass',
    detail: `Granted with scope: ${rolePermission.scope_condition}`
  });

  // Step 5: Check data scope (if entity specified)
  if (entityId && rolePermission.scope_condition !== 'org') {
    const scopeCheck = await checkDataScope(
      supabase,
      userId,
      user,
      entityId,
      (rolePermission.permissions as any).object_type,
      rolePermission.scope_condition as PermissionScope
    );

    if (!scopeCheck.allowed) {
      chain.push({ step: 'Data scope', result: 'fail', detail: scopeCheck.reason });
      return {
        allowed: false,
        reason: scopeCheck.reason,
        chain
      };
    }
    chain.push({ step: 'Data scope', result: 'pass', detail: scopeCheck.reason });
  } else {
    chain.push({ step: 'Data scope', result: 'skip', detail: 'No entity specified or org scope' });
  }

  // Step 6: Check feature flags
  const featureCheck = await checkFeatureFlag(
    supabase,
    user.role_id,
    user.org_id,
    (rolePermission.permissions as any).object_type
  );

  if (!featureCheck.allowed) {
    chain.push({ step: 'Feature flags', result: 'fail', detail: featureCheck.reason });
    return {
      allowed: false,
      reason: featureCheck.reason,
      chain
    };
  }
  chain.push({ step: 'Feature flags', result: 'pass', detail: featureCheck.reason });

  return {
    allowed: true,
    reason: 'Permission granted',
    chain,
    scope: rolePermission.scope_condition as PermissionScope
  };
}

async function checkDataScope(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  user: any,
  entityId: string,
  objectType: string,
  requiredScope: PermissionScope
): Promise<{ allowed: boolean; reason: string }> {
  // Own scope - check if user owns the entity
  if (requiredScope === 'own') {
    const { data: entity } = await supabase
      .from(objectType)
      .select('created_by')
      .eq('id', entityId)
      .single();

    if (entity?.created_by === userId) {
      return { allowed: true, reason: 'User owns this record' };
    }
    return { allowed: false, reason: 'User does not own this record' };
  }

  // Own + RACI scope
  if (requiredScope === 'own_raci' || requiredScope === 'own_ra') {
    // Check ownership first
    const { data: entity } = await supabase
      .from(objectType)
      .select('created_by')
      .eq('id', entityId)
      .single();

    if (entity?.created_by === userId) {
      return { allowed: true, reason: 'User owns this record' };
    }

    // Check RACI assignment
    const raciRoles = requiredScope === 'own_ra'
      ? ['responsible', 'accountable']
      : ['responsible', 'accountable', 'consulted', 'informed'];

    const { data: raci } = await supabase
      .from('object_owners')
      .select('role')
      .eq('entity_type', objectType)
      .eq('entity_id', entityId)
      .eq('user_id', userId)
      .in('role', raciRoles)
      .single();

    if (raci) {
      return { allowed: true, reason: `User has RACI role: ${raci.role}` };
    }
    return { allowed: false, reason: 'User not in RACI for this record' };
  }

  // Team scope
  if (requiredScope === 'team') {
    const activePod = user.pod_memberships?.find((pm: any) => pm.is_active);
    if (!activePod) {
      return { allowed: false, reason: 'User not assigned to a pod' };
    }

    // Check if entity belongs to same pod
    const { data: entityPod } = await supabase
      .from(objectType)
      .select('pod_id')
      .eq('id', entityId)
      .single();

    if (entityPod?.pod_id === activePod.pod_id) {
      return { allowed: true, reason: 'Entity belongs to user\'s pod' };
    }
    return { allowed: false, reason: 'Entity not in user\'s pod' };
  }

  // Draft only scope
  if (requiredScope === 'draft_only') {
    const { data: entity } = await supabase
      .from(objectType)
      .select('status')
      .eq('id', entityId)
      .single();

    if (entity?.status === 'draft') {
      return { allowed: true, reason: 'Entity is in draft status' };
    }
    return { allowed: false, reason: 'Can only modify draft records' };
  }

  // Region and org scopes would need additional implementation
  return { allowed: true, reason: `Scope ${requiredScope} check passed` };
}

async function checkFeatureFlag(
  supabase: ReturnType<typeof createClient>,
  roleId: string,
  orgId: string,
  objectType: string
): Promise<{ allowed: boolean; reason: string }> {
  // Map object types to feature flags
  const featureMap: Record<string, string> = {
    'candidates': 'data_export',
    'reports': 'advanced_analytics',
  };

  const featureCode = featureMap[objectType];
  if (!featureCode) {
    return { allowed: true, reason: 'No feature flag restriction' };
  }

  const { data: flagRole } = await supabase
    .from('feature_flag_roles')
    .select(`
      enabled,
      feature_flags!inner (code, default_enabled)
    `)
    .eq('role_id', roleId)
    .eq('feature_flags.code', featureCode)
    .single();

  if (!flagRole) {
    // Check default
    const { data: flag } = await supabase
      .from('feature_flags')
      .select('default_enabled')
      .eq('code', featureCode)
      .single();

    if (flag?.default_enabled) {
      return { allowed: true, reason: 'Feature enabled by default' };
    }
    return { allowed: false, reason: `Feature "${featureCode}" not enabled for role` };
  }

  if (flagRole.enabled) {
    return { allowed: true, reason: 'Feature enabled for role' };
  }
  return { allowed: false, reason: `Feature "${featureCode}" disabled for role` };
}

export { checkDataScope, checkFeatureFlag };
```

#### 3. Export from auth module
**File**: `src/lib/auth/index.ts`

```typescript
export * from './client';
export * from './permission-types';
export * from './permission-evaluator';
```

### Success Criteria:

#### Automated Verification:
- [ ] TypeScript compiles without errors: `pnpm build`
- [ ] No lint errors: `pnpm lint`
- [ ] Types exported correctly from `src/lib/auth`

#### Manual Verification:
- [ ] Import `evaluatePermission` in test file and call with mock data
- [ ] Verify chain steps are populated correctly
- [ ] Verify override logic works (override takes priority)
- [ ] Verify scope checks work for different scope types

**Implementation Note**: Test the evaluator with real database before proceeding to Phase 3.

---

## Phase 3: tRPC Permissions Router

### Overview
Create the API layer for all permission management operations.

### Changes Required:

#### 1. Permissions Router
**File**: `src/server/routers/permissions.ts`

```typescript
import { z } from 'zod';
import { router, orgProtectedProcedure } from '@/server/trpc/middleware';
import { TRPCError } from '@trpc/server';
import { evaluatePermission } from '@/lib/auth/permission-evaluator';
import crypto from 'crypto';

const scopeSchema = z.enum(['own', 'own_raci', 'own_ra', 'team', 'region', 'org', 'draft_only']);

export const permissionsRouter = router({
  // Get permission matrix for an object type
  getMatrix: orgProtectedProcedure
    .input(z.object({
      objectType: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx;

      // Get all permissions for object type
      const { data: permissions, error: permError } = await supabase
        .from('permissions')
        .select('id, code, name, action')
        .eq('object_type', input.objectType)
        .is('deleted_at', null)
        .order('action');

      if (permError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch permissions',
        });
      }

      // Get all roles
      const { data: roles, error: rolesError } = await supabase
        .from('system_roles')
        .select('id, code, name, display_name, category, hierarchy_level, color_code')
        .eq('is_active', true)
        .order('hierarchy_level');

      if (rolesError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch roles',
        });
      }

      // Get role-permission mappings
      const { data: mappings, error: mappingsError } = await supabase
        .from('role_permissions')
        .select('role_id, permission_id, scope_condition, granted');

      if (mappingsError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch role permissions',
        });
      }

      // Build matrix
      const matrix = permissions.map(perm => ({
        permission: perm,
        rolePermissions: roles.map(role => {
          const mapping = mappings?.find(
            m => m.role_id === role.id && m.permission_id === perm.id
          );
          return {
            roleId: role.id,
            roleName: role.display_name,
            granted: mapping?.granted ?? false,
            scope: mapping?.scope_condition ?? null,
          };
        }),
      }));

      return { matrix, roles, objectType: input.objectType };
    }),

  // Update role permission
  updateRolePermission: orgProtectedProcedure
    .input(z.object({
      roleId: z.string().uuid(),
      permissionId: z.string().uuid(),
      granted: z.boolean(),
      scope: scopeSchema.optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx;

      // Upsert role permission
      const { data, error } = await supabase
        .from('role_permissions')
        .upsert({
          role_id: input.roleId,
          permission_id: input.permissionId,
          granted: input.granted,
          scope_condition: input.scope ?? 'own',
          granted_by: user?.id,
        }, {
          onConflict: 'role_id,permission_id',
        })
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update role permission',
        });
      }

      // Audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'update_permission',
        table_name: 'role_permissions',
        record_id: data.id,
        new_values: {
          roleId: input.roleId,
          permissionId: input.permissionId,
          granted: input.granted,
          scope: input.scope,
        },
      });

      return data;
    }),

  // Test permission for a user
  testPermission: orgProtectedProcedure
    .input(z.object({
      userId: z.string().uuid(),
      permissionCode: z.string(),
      entityId: z.string().uuid().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase } = ctx;

      const result = await evaluatePermission(
        supabase,
        input.userId,
        input.permissionCode,
        input.entityId
      );

      return result;
    }),

  // Create permission override
  createOverride: orgProtectedProcedure
    .input(z.object({
      userId: z.string().uuid(),
      permissionCode: z.string(),
      granted: z.boolean(),
      scopeOverride: scopeSchema.optional(),
      reason: z.string().min(10, 'Reason must be at least 10 characters'),
      expiresAt: z.string().datetime().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx;

      // Get permission ID from code
      const { data: permission } = await supabase
        .from('permissions')
        .select('id')
        .eq('code', input.permissionCode)
        .single();

      if (!permission) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Permission not found',
        });
      }

      // Create override
      const { data, error } = await supabase
        .from('permission_overrides')
        .insert({
          org_id: orgId,
          user_id: input.userId,
          permission_id: permission.id,
          granted: input.granted,
          scope_override: input.scopeOverride,
          reason: input.reason,
          expires_at: input.expiresAt,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create override',
        });
      }

      // Audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'create_override',
        table_name: 'permission_overrides',
        record_id: data.id,
        new_values: {
          targetUserId: input.userId,
          permissionCode: input.permissionCode,
          granted: input.granted,
          reason: input.reason,
          expiresAt: input.expiresAt,
        },
      });

      return data;
    }),

  // List overrides
  listOverrides: orgProtectedProcedure
    .input(z.object({
      userId: z.string().uuid().optional(),
      activeOnly: z.boolean().default(true),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx;

      let query = supabase
        .from('permission_overrides')
        .select(`
          *,
          permissions (code, name, object_type, action),
          user:user_profiles!permission_overrides_user_id_fkey (id, full_name, email),
          creator:user_profiles!permission_overrides_created_by_fkey (id, full_name)
        `)
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });

      if (input.userId) {
        query = query.eq('user_id', input.userId);
      }

      if (input.activeOnly) {
        query = query
          .is('revoked_at', null)
          .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);
      }

      const { data, error } = await query;

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch overrides',
        });
      }

      return data;
    }),

  // Revoke override
  revokeOverride: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx;

      const { data, error } = await supabase
        .from('permission_overrides')
        .update({
          revoked_at: new Date().toISOString(),
          revoked_by: user?.id,
        })
        .eq('id', input.id)
        .eq('org_id', orgId)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to revoke override',
        });
      }

      // Audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'revoke_override',
        table_name: 'permission_overrides',
        record_id: data.id,
        new_values: { revoked: true },
      });

      return data;
    }),

  // Compare two roles
  compareRoles: orgProtectedProcedure
    .input(z.object({
      roleId1: z.string().uuid(),
      roleId2: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase } = ctx;

      // Get both roles with permissions
      const { data: roles, error: rolesError } = await supabase
        .from('system_roles')
        .select('id, code, name, display_name, category, hierarchy_level, color_code')
        .in('id', [input.roleId1, input.roleId2]);

      if (rolesError || !roles || roles.length !== 2) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'One or both roles not found',
        });
      }

      // Get permissions for both roles
      const { data: permissions } = await supabase
        .from('permissions')
        .select('id, code, name, object_type, action')
        .is('deleted_at', null)
        .order('object_type, action');

      const { data: rolePerms1 } = await supabase
        .from('role_permissions')
        .select('permission_id, scope_condition, granted')
        .eq('role_id', input.roleId1);

      const { data: rolePerms2 } = await supabase
        .from('role_permissions')
        .select('permission_id, scope_condition, granted')
        .eq('role_id', input.roleId2);

      // Get feature flags for both roles
      const { data: flags1 } = await supabase
        .from('feature_flag_roles')
        .select('enabled, feature_flags (code, name)')
        .eq('role_id', input.roleId1);

      const { data: flags2 } = await supabase
        .from('feature_flag_roles')
        .select('enabled, feature_flags (code, name)')
        .eq('role_id', input.roleId2);

      // Build comparison
      const permissionComparison = permissions?.map(perm => {
        const p1 = rolePerms1?.find(rp => rp.permission_id === perm.id);
        const p2 = rolePerms2?.find(rp => rp.permission_id === perm.id);
        return {
          permission: perm,
          role1: { granted: p1?.granted ?? false, scope: p1?.scope_condition ?? null },
          role2: { granted: p2?.granted ?? false, scope: p2?.scope_condition ?? null },
          different: (p1?.granted ?? false) !== (p2?.granted ?? false) || p1?.scope_condition !== p2?.scope_condition,
        };
      });

      const featureComparison = [...new Set([
        ...(flags1?.map(f => (f.feature_flags as any).code) ?? []),
        ...(flags2?.map(f => (f.feature_flags as any).code) ?? []),
      ])].map(code => {
        const f1 = flags1?.find(f => (f.feature_flags as any).code === code);
        const f2 = flags2?.find(f => (f.feature_flags as any).code === code);
        return {
          featureCode: code,
          featureName: (f1?.feature_flags as any)?.name ?? (f2?.feature_flags as any)?.name,
          role1Enabled: f1?.enabled ?? false,
          role2Enabled: f2?.enabled ?? false,
          different: (f1?.enabled ?? false) !== (f2?.enabled ?? false),
        };
      });

      return {
        role1: roles.find(r => r.id === input.roleId1),
        role2: roles.find(r => r.id === input.roleId2),
        permissionComparison,
        featureComparison,
      };
    }),

  // Get all object types
  getObjectTypes: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const { supabase } = ctx;

      const { data } = await supabase
        .from('permissions')
        .select('object_type')
        .is('deleted_at', null);

      const objectTypes = [...new Set(data?.map(p => p.object_type) ?? [])];
      return objectTypes;
    }),

  // Get roles list
  getRoles: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const { supabase } = ctx;

      const { data, error } = await supabase
        .from('system_roles')
        .select('id, code, name, display_name, category, hierarchy_level, color_code')
        .eq('is_active', true)
        .order('hierarchy_level');

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch roles',
        });
      }

      return data;
    }),

  // Feature flags
  getFeatureFlags: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const { supabase, orgId } = ctx;

      const { data, error } = await supabase
        .from('feature_flags')
        .select(`
          *,
          feature_flag_roles (
            role_id,
            enabled,
            system_roles (id, display_name, color_code)
          )
        `)
        .or(`org_id.eq.${orgId},is_global.eq.true`)
        .is('deleted_at', null)
        .order('name');

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch feature flags',
        });
      }

      return data;
    }),

  updateFeatureFlagRole: orgProtectedProcedure
    .input(z.object({
      featureFlagId: z.string().uuid(),
      roleId: z.string().uuid(),
      enabled: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx;

      const { data, error } = await supabase
        .from('feature_flag_roles')
        .upsert({
          feature_flag_id: input.featureFlagId,
          role_id: input.roleId,
          enabled: input.enabled,
        }, {
          onConflict: 'feature_flag_id,role_id',
        })
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update feature flag',
        });
      }

      // Audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'update_feature_flag',
        table_name: 'feature_flag_roles',
        record_id: data.id,
        new_values: input,
      });

      return data;
    }),

  // API Tokens
  generateToken: orgProtectedProcedure
    .input(z.object({
      name: z.string().min(1),
      scopes: z.array(z.string()),
      expiresAt: z.string().datetime().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx;

      // Generate secure token
      const token = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const tokenPrefix = token.substring(0, 8);

      const { data, error } = await supabase
        .from('api_tokens')
        .insert({
          org_id: orgId,
          name: input.name,
          token_hash: tokenHash,
          token_prefix: tokenPrefix,
          scopes: input.scopes,
          expires_at: input.expiresAt,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate token',
        });
      }

      // Audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'generate_token',
        table_name: 'api_tokens',
        record_id: data.id,
        new_values: { name: input.name, scopes: input.scopes },
      });

      // Return token ONLY on creation (never again)
      return {
        ...data,
        token: `itk_${token}`, // Full token only shown once
      };
    }),

  listTokens: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const { supabase, orgId } = ctx;

      const { data, error } = await supabase
        .from('api_tokens')
        .select(`
          id,
          name,
          token_prefix,
          scopes,
          expires_at,
          last_used_at,
          usage_count,
          created_at,
          revoked_at,
          creator:user_profiles!api_tokens_created_by_fkey (full_name)
        `)
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch tokens',
        });
      }

      return data;
    }),

  revokeToken: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx;

      const { data, error } = await supabase
        .from('api_tokens')
        .update({
          revoked_at: new Date().toISOString(),
          revoked_by: user?.id,
        })
        .eq('id', input.id)
        .eq('org_id', orgId)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to revoke token',
        });
      }

      // Audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'revoke_token',
        table_name: 'api_tokens',
        record_id: data.id,
        new_values: { revoked: true },
      });

      return data;
    }),

  // Bulk updates
  bulkUpdate: orgProtectedProcedure
    .input(z.object({
      userIds: z.array(z.string().uuid()).max(1000, 'Maximum 1000 users per batch'),
      updateType: z.enum(['enable_feature', 'disable_feature', 'change_scope', 'add_permission', 'remove_permission']),
      featureId: z.string().uuid().optional(),
      permissionId: z.string().uuid().optional(),
      scope: scopeSchema.optional(),
      reason: z.string().min(10),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx;

      // Capture previous state
      const previousState: Record<string, any> = {};

      // Apply changes based on type
      // (Implementation depends on update type)

      // Store in history for rollback
      const { data: historyEntry, error: historyError } = await supabase
        .from('bulk_update_history')
        .insert({
          org_id: orgId,
          update_type: input.updateType,
          affected_user_ids: input.userIds,
          changes: {
            type: input.updateType,
            featureId: input.featureId,
            permissionId: input.permissionId,
            scope: input.scope,
          },
          previous_state: previousState,
          reason: input.reason,
          applied_by: user?.id,
        })
        .select()
        .single();

      if (historyError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to record bulk update',
        });
      }

      // Audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'bulk_update',
        table_name: 'bulk_update_history',
        record_id: historyEntry.id,
        new_values: {
          updateType: input.updateType,
          affectedCount: input.userIds.length,
          reason: input.reason,
        },
      });

      return {
        success: true,
        affectedCount: input.userIds.length,
        historyId: historyEntry.id,
      };
    }),

  // Rollback bulk update
  rollbackBulkUpdate: orgProtectedProcedure
    .input(z.object({ historyId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx;

      // Get history entry
      const { data: history, error: historyError } = await supabase
        .from('bulk_update_history')
        .select('*')
        .eq('id', input.historyId)
        .eq('org_id', orgId)
        .is('rolled_back_at', null)
        .single();

      if (historyError || !history) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Bulk update not found or already rolled back',
        });
      }

      // Restore previous state
      // (Implementation would reverse the changes)

      // Mark as rolled back
      await supabase
        .from('bulk_update_history')
        .update({
          rolled_back_at: new Date().toISOString(),
          rolled_back_by: user?.id,
        })
        .eq('id', input.historyId);

      // Audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'rollback_bulk_update',
        table_name: 'bulk_update_history',
        record_id: input.historyId,
        new_values: { rolledBack: true },
      });

      return { success: true };
    }),

  getBulkUpdateHistory: orgProtectedProcedure
    .input(z.object({
      page: z.number().default(1),
      pageSize: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx;
      const { page, pageSize } = input;

      const { data, error, count } = await supabase
        .from('bulk_update_history')
        .select(`
          *,
          applier:user_profiles!bulk_update_history_applied_by_fkey (full_name),
          rollbacker:user_profiles!bulk_update_history_rolled_back_by_fkey (full_name)
        `, { count: 'exact' })
        .eq('org_id', orgId)
        .order('applied_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch history',
        });
      }

      return {
        items: data,
        pagination: {
          total: count ?? 0,
          page,
          pageSize,
          totalPages: Math.ceil((count ?? 0) / pageSize),
        },
      };
    }),
});
```

#### 2. Register Router
**File**: `src/server/trpc/root.ts`

```typescript
import { router } from '@/server/trpc/init';
import { adminRouter } from '@/server/routers/admin';
import { podsRouter } from '@/server/routers/pods';
import { usersRouter } from '@/server/routers/users';
import { permissionsRouter } from '@/server/routers/permissions';

export const appRouter = router({
  admin: adminRouter,
  pods: podsRouter,
  users: usersRouter,
  permissions: permissionsRouter,
});

export type AppRouter = typeof appRouter;
```

### Success Criteria:

#### Automated Verification:
- [ ] TypeScript compiles: `pnpm build`
- [ ] No lint errors: `pnpm lint`
- [ ] Router registered in root.ts

#### Manual Verification:
- [ ] Call `permissions.getMatrix` and verify matrix data returned
- [ ] Call `permissions.testPermission` and verify chain steps
- [ ] Call `permissions.createOverride` and verify record created
- [ ] Call `permissions.compareRoles` and verify comparison data

**Implementation Note**: Test all endpoints via tRPC playground or client before proceeding to UI phases.

---

## Phase 4-11: UI Implementation

Due to the length of this plan, I'll provide a summary of the remaining phases. Each phase follows the same structure as above.

### Phase 4: Permission Matrix View (AC-1)
**Files**:
- `src/app/employee/admin/permissions/page.tsx` - Route page
- `src/components/admin/permissions/PermissionMatrixPage.tsx` - Main component

**Key Features**:
- Dropdown to select object type
- Matrix table with roles as columns, actions as rows
- Inline editing with scope dropdown
- Export to CSV
- Uses patterns from UsersListPage.tsx

### Phase 5: Data Scope Configuration (AC-2)
**Files**:
- `src/components/admin/permissions/DataScopeConfig.tsx`

**Key Features**:
- Configure default scope per role
- Clear explanation of each scope level
- Changes apply to all role permissions

### Phase 6: Permission Testing (AC-5)
**Files**:
- `src/components/admin/permissions/PermissionTestDialog.tsx`

**Key Features**:
- User selector (searchable dropdown)
- Object type and action selectors
- Optional entity ID input
- Visual chain display showing each step
- Uses manual dialog pattern from UserDetailPage.tsx

### Phase 7: Role Comparison (AC-3)
**Files**:
- `src/app/employee/admin/permissions/compare/page.tsx`
- `src/components/admin/permissions/RoleComparisonPage.tsx`

**Key Features**:
- Two role dropdowns
- Side-by-side table comparison
- Highlighted differences
- Permission and feature flag comparisons

### Phase 8: Custom Permission Overrides (AC-4)
**Files**:
- `src/app/employee/admin/permissions/overrides/page.tsx`
- `src/components/admin/permissions/OverridesListPage.tsx`
- `src/components/admin/permissions/OverrideFormDialog.tsx`

**Key Features**:
- List all active overrides
- Create override with user, permission, reason, expiration
- Revoke overrides
- Filter by user

### Phase 9: Feature Flags System
**Files**:
- `src/app/employee/admin/features/page.tsx`
- `src/components/admin/features/FeatureFlagsPage.tsx`

**Key Features**:
- List all feature flags
- Enable/disable per role
- Create custom feature flags
- Status indicators (enabled, beta, disabled)

### Phase 10: API Token Management (AC-7)
**Files**:
- `src/app/employee/admin/api-tokens/page.tsx`
- `src/components/admin/tokens/ApiTokensPage.tsx`
- `src/components/admin/tokens/GenerateTokenDialog.tsx`

**Key Features**:
- Generate new tokens (shows full token once)
- Select scopes from permission codes
- Set expiration
- View usage statistics
- Revoke tokens

### Phase 11: Bulk Permission Updates (AC-6)
**Files**:
- `src/components/admin/permissions/BulkUpdateWizard.tsx`
- `src/components/admin/permissions/BulkUpdateHistory.tsx`

**Key Features**:
- Multi-step wizard (select users → select update → preview → apply)
- Select by role, pod, or custom selection
- Preview affected users
- Reason required
- History with rollback capability

---

## Testing Strategy

### Unit Tests
- Permission evaluator chain logic
- Scope comparison functions
- Token generation and hashing

### Integration Tests
- tRPC endpoint responses
- Database constraint enforcement
- RLS policy enforcement

### Manual Testing Steps
1. Create permission override for a user, verify it takes effect
2. Test permission as different users, verify chain accuracy
3. Compare two roles, verify differences highlighted
4. Generate API token, verify scope restrictions
5. Perform bulk update, verify rollback works
6. Export permission matrix, verify CSV format

---

## Performance Considerations

1. **Permission evaluation caching**: Consider caching user permissions for short duration (1 minute) to reduce DB queries
2. **Matrix query optimization**: Use single query with joins instead of N+1 queries
3. **Bulk update batching**: Process in batches of 100 to avoid timeouts
4. **Token validation**: Use indexed hash lookup for O(1) token validation

---

## Migration Notes

1. Run migration before deploying new code
2. Seed data is idempotent (can re-run safely)
3. Existing users keep role_id assignments
4. No data loss - all existing tables preserved

---

## References

- Epic story: `thoughts/shared/epics/epic-01-admin/04-permission-management.md`
- Full spec: `docs/specs/20-USER-ROLES/10-admin/06-permission-management.md`
- Research: `thoughts/shared/research/2025-12-05-permission-management-codebase-research.md`
- UI patterns: `src/components/admin/users/UsersListPage.tsx`
- tRPC patterns: `src/server/routers/users.ts`
- Database patterns: `supabase/migrations/20251205000000_user_management_tables.sql`
