# FOUND-002: Implement Role-Based Access Control (RBAC)

**Story Points:** 8
**Sprint:** Sprint 1 (Week 1-2)
**Priority:** CRITICAL

---

## User Story

As a **Security Architect**,
I want **a flexible role-based access control system**,
So that **users can have multiple roles with granular permissions**.

---

## Acceptance Criteria

- [ ] `roles` table created with predefined system roles
- [ ] `permissions` table created with all permission types
- [ ] `role_permissions` junction table links roles to permissions
- [ ] `user_roles` junction table supports multi-role users
- [ ] Helper functions created for permission checks
- [ ] Migration includes seed data for all 5 pillars + admin
- [ ] TypeScript types generated from database schema

---

## Technical Implementation

### Database Schema

Create file: `supabase/migrations/002_create_rbac_system.sql`

```sql
-- Roles table
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Permissions table
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  resource TEXT NOT NULL, -- 'candidates', 'jobs', 'students', etc.
  action TEXT NOT NULL,    -- 'create', 'read', 'update', 'delete', 'approve'
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_permission UNIQUE (resource, action)
);

-- Role-Permission junction (many-to-many)
CREATE TABLE role_permissions (
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- User-Role junction (many-to-many)
CREATE TABLE user_roles (
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES user_profiles(id),
  PRIMARY KEY (user_id, role_id)
);

-- Indexes
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);

-- Helper function: Check if user has permission
CREATE OR REPLACE FUNCTION user_has_permission(
  p_user_id UUID,
  p_resource TEXT,
  p_action TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN role_permissions rp ON ur.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = p_user_id
      AND p.resource = p_resource
      AND p.action = p_action
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: Get user's roles
CREATE OR REPLACE FUNCTION get_user_roles(p_user_id UUID)
RETURNS TABLE (role_name TEXT, role_description TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT r.name, r.description
  FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: Grant role to user
CREATE OR REPLACE FUNCTION grant_role_to_user(
  p_user_id UUID,
  p_role_name TEXT,
  p_assigned_by UUID DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_role_id UUID;
BEGIN
  -- Get role ID
  SELECT id INTO v_role_id FROM roles WHERE name = p_role_name;

  IF v_role_id IS NULL THEN
    RAISE EXCEPTION 'Role % does not exist', p_role_name;
  END IF;

  -- Insert if not exists
  INSERT INTO user_roles (user_id, role_id, assigned_by)
  VALUES (p_user_id, v_role_id, p_assigned_by)
  ON CONFLICT (user_id, role_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Seed Data

```sql
-- Insert roles (5 pillars + admin + guest)
INSERT INTO roles (name, description) VALUES
  ('admin', 'Full system access, manages all users and settings'),
  ('student', 'Enrolled in Training Academy, accessing courses'),
  ('employee', 'IntimeESolutions staff member (recruiters, specialists)'),
  ('candidate', 'Job seeker, managed by recruiting/bench teams'),
  ('client', 'Company hiring Guidewire talent'),
  ('guest', 'Unauthenticated visitor, read-only access');

-- Insert permissions
INSERT INTO permissions (resource, action, description) VALUES
  -- Candidate management
  ('candidates', 'create', 'Create new candidate profiles'),
  ('candidates', 'read', 'View candidate profiles'),
  ('candidates', 'update', 'Edit candidate information'),
  ('candidates', 'delete', 'Remove candidates from system'),
  ('candidates', 'submit', 'Submit candidates to jobs'),

  -- Job management
  ('jobs', 'create', 'Post new job openings'),
  ('jobs', 'read', 'View job listings'),
  ('jobs', 'update', 'Edit job details'),
  ('jobs', 'delete', 'Remove job postings'),

  -- Student management
  ('students', 'create', 'Enroll new students'),
  ('students', 'read', 'View student profiles and progress'),
  ('students', 'update', 'Update student information'),
  ('students', 'grade', 'Grade student assignments'),

  -- Employee management
  ('employees', 'create', 'Hire new employees'),
  ('employees', 'read', 'View employee information'),
  ('employees', 'update', 'Update employee details'),
  ('timesheets', 'approve', 'Approve employee timesheets'),

  -- Client management
  ('clients', 'create', 'Onboard new clients'),
  ('clients', 'read', 'View client accounts'),
  ('clients', 'update', 'Update client information'),

  -- Admin functions
  ('system', 'admin', 'Full administrative access'),
  ('reports', 'view', 'View analytics and reports'),
  ('audit_logs', 'read', 'Access audit trails');

-- Grant permissions to roles
DO $$
DECLARE
  admin_role_id UUID;
  student_role_id UUID;
  employee_role_id UUID;
  candidate_role_id UUID;
  client_role_id UUID;
BEGIN
  -- Get role IDs
  SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';
  SELECT id INTO student_role_id FROM roles WHERE name = 'student';
  SELECT id INTO employee_role_id FROM roles WHERE name = 'employee';
  SELECT id INTO candidate_role_id FROM roles WHERE name = 'candidate';
  SELECT id INTO client_role_id FROM roles WHERE name = 'client';

  -- Admin gets all permissions
  INSERT INTO role_permissions (role_id, permission_id)
  SELECT admin_role_id, id FROM permissions;

  -- Student permissions
  INSERT INTO role_permissions (role_id, permission_id)
  SELECT student_role_id, id FROM permissions
  WHERE resource IN ('students') AND action IN ('read', 'update');

  -- Employee permissions (recruiters, specialists)
  INSERT INTO role_permissions (role_id, permission_id)
  SELECT employee_role_id, id FROM permissions
  WHERE resource IN ('candidates', 'jobs', 'students', 'clients')
    AND action IN ('create', 'read', 'update', 'submit');

  INSERT INTO role_permissions (role_id, permission_id)
  SELECT employee_role_id, id FROM permissions
  WHERE resource = 'reports' AND action = 'view';

  -- Candidate permissions (self-service)
  INSERT INTO role_permissions (role_id, permission_id)
  SELECT candidate_role_id, id FROM permissions
  WHERE resource IN ('candidates', 'jobs') AND action = 'read';

  INSERT INTO role_permissions (role_id, permission_id)
  SELECT candidate_role_id, id FROM permissions
  WHERE resource = 'candidates' AND action = 'update';

  -- Client permissions
  INSERT INTO role_permissions (role_id, permission_id)
  SELECT client_role_id, id FROM permissions
  WHERE resource IN ('jobs', 'candidates') AND action IN ('read', 'create', 'update');
END $$;
```

### TypeScript Types

Create file: `src/types/rbac.ts`

```typescript
export type RoleName =
  | 'admin'
  | 'student'
  | 'employee'
  | 'candidate'
  | 'client'
  | 'guest';

export type Resource =
  | 'candidates'
  | 'jobs'
  | 'students'
  | 'employees'
  | 'clients'
  | 'timesheets'
  | 'system'
  | 'reports'
  | 'audit_logs';

export type Action =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'submit'
  | 'approve'
  | 'grade'
  | 'admin'
  | 'view';

export interface Role {
  id: string;
  name: RoleName;
  description: string;
  created_at: string;
}

export interface Permission {
  id: string;
  name: string;
  resource: Resource;
  action: Action;
  description: string;
}

export interface UserRole {
  user_id: string;
  role_id: string;
  assigned_at: string;
  assigned_by: string | null;
}
```

### Helper Utilities

Create file: `src/lib/rbac.ts`

```typescript
import { createClient } from '@/lib/supabase/server';
import type { Resource, Action } from '@/types/rbac';

export async function checkPermission(
  userId: string,
  resource: Resource,
  action: Action
): Promise<boolean> {
  const supabase = createClient();

  const { data, error } = await supabase
    .rpc('user_has_permission', {
      p_user_id: userId,
      p_resource: resource,
      p_action: action
    });

  if (error) {
    console.error('Permission check failed:', error);
    return false;
  }

  return data === true;
}

export async function getUserRoles(userId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .rpc('get_user_roles', { p_user_id: userId });

  if (error) {
    console.error('Get user roles failed:', error);
    return [];
  }

  return data;
}

export async function grantRole(
  userId: string,
  roleName: string,
  assignedBy?: string
) {
  const supabase = createClient();

  const { error } = await supabase
    .rpc('grant_role_to_user', {
      p_user_id: userId,
      p_role_name: roleName,
      p_assigned_by: assignedBy
    });

  if (error) {
    throw new Error(`Failed to grant role: ${error.message}`);
  }
}

// Middleware helper for route protection
export async function requirePermission(
  userId: string,
  resource: Resource,
  action: Action
) {
  const hasPermission = await checkPermission(userId, resource, action);

  if (!hasPermission) {
    throw new Error(`Permission denied: ${action} on ${resource}`);
  }
}
```

---

## Dependencies

- **Requires:** FOUND-001 (user_profiles table must exist)
- **Blocks:** FOUND-004 (RLS policies use these roles)

---

## Testing Checklist

- [ ] All seed data inserts successfully
- [ ] Helper functions return correct results
- [ ] Admin role has all permissions
- [ ] Student role has limited permissions
- [ ] Multi-role users get union of permissions
- [ ] TypeScript types match database schema
- [ ] Permission checks handle missing users gracefully

---

## Verification Queries

```sql
-- Test: Check admin has all permissions
SELECT COUNT(*) FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
WHERE r.name = 'admin';
-- Expected: 21 (all permissions)

-- Test: Create test user and grant role
INSERT INTO user_profiles (email, full_name)
VALUES ('test@admin.com', 'Test Admin');

SELECT grant_role_to_user(
  (SELECT id FROM user_profiles WHERE email = 'test@admin.com'),
  'admin'
);

-- Test: Check user has permission
SELECT user_has_permission(
  (SELECT id FROM user_profiles WHERE email = 'test@admin.com'),
  'candidates',
  'create'
);
-- Expected: true

-- Test: Get user's roles
SELECT * FROM get_user_roles(
  (SELECT id FROM user_profiles WHERE email = 'test@admin.com')
);
-- Expected: admin role
```

---

## Documentation Updates

- [ ] Update `/docs/architecture/RBAC-DESIGN.md` with complete role matrix
- [ ] Document permission naming conventions
- [ ] Add examples of permission checks in route handlers

---

## Related Stories

- **Depends on:** FOUND-001 (database schema)
- **Leads to:** FOUND-004 (RLS policies), FOUND-006 (role assignment)

---

**Created:** 2025-11-18
**Assigned:** TBD
**Status:** Ready for Development
