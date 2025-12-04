# User Story: Permission Management

**Epic:** Admin Portal (Epic-01)
**Story ID:** ADMIN-US-004
**Priority:** High
**Estimated Context:** ~50K tokens
**Source Spec:** `docs/specs/20-USER-ROLES/10-admin/06-permission-management.md`

---

## User Story

**As an** Admin user,
**I want** to configure role-based permissions, data scopes, feature flags, and custom permission overrides,
**So that** I can control user access to data and features based on their role and business needs.

---

## Acceptance Criteria

### AC-1: Permission Matrix View
- [ ] Display permission matrix by object type (Jobs, Candidates, etc.)
- [ ] Show all roles as columns
- [ ] Show permission actions as rows (Create, Read, Update, Delete, Approve)
- [ ] Indicate scope for each permission (Own, Team, Region, Org)
- [ ] Support editing permissions inline
- [ ] Export permission matrix

### AC-2: Data Scope Configuration
- [ ] Configure default data scope per role
- [ ] Scope levels: Own, Team, Region, Organization
- [ ] Show clear explanation of each scope level
- [ ] Changes apply to all users with that role

### AC-3: Role Comparison
- [ ] Compare two roles side-by-side
- [ ] Show differences in permissions highlighted
- [ ] Show differences in data scope
- [ ] Show differences in feature access

### AC-4: Custom Permission Overrides
- [ ] Create override for specific user
- [ ] Grant or deny specific permission
- [ ] Set scope override
- [ ] Require reason (documented)
- [ ] Set expiration (temporary) or permanent
- [ ] List all active overrides
- [ ] Revoke/delete overrides

### AC-5: Permission Testing
- [ ] "Test as user" functionality
- [ ] Select user, object type, action
- [ ] Optionally specify object ID
- [ ] Show ALLOW or DENY result
- [ ] Show permission chain (why allowed/denied)

### AC-6: Bulk Permission Updates
- [ ] Select users by role, pod, or custom selection
- [ ] Choose update type (enable feature, change scope, etc.)
- [ ] Preview affected users
- [ ] Apply changes with reason
- [ ] Rollback capability

### AC-7: API Token Management
- [ ] Generate API tokens
- [ ] Set token permissions (scopes)
- [ ] Set token expiration
- [ ] View token usage
- [ ] Revoke tokens

---

## UI/UX Requirements

### Permission Matrix View
```
┌────────────────────────────────────────────────────────────────┐
│ Permission Matrix                              [Edit] [Export] │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ OBJECT: [Jobs ▼]                                               │
│ ┌──────────────┬───────┬───────┬────────┬────────┬──────────┐│
│ │ Role         │Create │ Read  │ Update │ Delete │ Approve  ││
│ ├──────────────┼───────┼───────┼────────┼────────┼──────────┤│
│ │Tech Recruiter│ ✓     │ Own+R │ Own+RA │ Draft  │ ✗        ││
│ │Bench Sales   │ ✓     │ Own+R │ Own+RA │ Draft  │ ✗        ││
│ │TA Specialist │ ✓     │ Own+R │ Own+RA │ Draft  │ ✗        ││
│ │Pod Manager   │ ✓     │ Team  │ Team   │ ✓      │ ✓        ││
│ │Regional Dir  │ ✓     │ Region│ Region │ ✓      │ ✓        ││
│ │HR Manager    │ ✓     │ Org   │ Org    │ ✗      │ ✓        ││
│ │Admin         │ ✓     │ Org   │ Org    │ ✓      │ ✓        ││
│ └──────────────┴───────┴───────┴────────┴────────┴──────────┘│
│                                                                │
│ Legend:                                                        │
│ • Own: Objects user created or owns (R/A)                     │
│ • Own+R: Own + RACI assignments (any role)                    │
│ • Own+RA: Own + R or A role only                              │
│ • Team: User's pod/team                                       │
│ • Region: User's region                                       │
│ • Org: All objects in organization                            │
│ • Draft: Only if status = Draft                               │
│                                                                │
│ [Jobs] [Candidates] [Submissions] [Accounts] [Users] [Reports]│
└────────────────────────────────────────────────────────────────┘
```

### Permission Test Tool
```
┌────────────────────────────────────────────────────────────────┐
│ Test Permissions                                          [×]  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ TEST AS USER                                                   │
│ [Sarah Patel - Tech Recruiter                             ▼]  │
│                                                                │
│ Role:           Technical Recruiter                            │
│ Pod:            Recruiting Pod Alpha                           │
│ Data Scope:     Own + RACI                                     │
│                                                                │
│ TEST PERMISSION                                                │
│ Object Type:    [Jobs                                     ▼]  │
│ Action:         [Update                                   ▼]  │
│ Object ID:      [JOB-2024-1234] (optional)                    │
│                                                                │
│ [Test Permission]                                              │
│                                                                │
│ RESULT                                                         │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ ✓ ALLOWED                                                  ││
│ │                                                            ││
│ │ Reason:                                                    ││
│ │ • User is Responsible (R) for this job                    ││
│ │ • Role "Tech Recruiter" has Update on Own+RA objects      ││
│ │ • No conflicting overrides                                ││
│ │                                                            ││
│ │ Permission Chain:                                          ││
│ │ 1. Check role base permissions: ✓ Update allowed          ││
│ │ 2. Check data scope: ✓ User is R (owns object)            ││
│ │ 3. Check custom overrides: ✓ None found                   ││
│ │ 4. Check feature flags: ✓ No restrictions                 ││
│ │ 5. RESULT: ALLOW                                           ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ [Test Another] [Close]                                         │
└────────────────────────────────────────────────────────────────┘
```

### Custom Override Modal
```
┌────────────────────────────────────────────────────────────────┐
│ Create Permission Override                                [×]  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ User: Sarah Patel (Technical Recruiter)                        │
│                                                                │
│ OVERRIDE DETAILS                                               │
│ Object Type:    [Jobs                                     ▼]  │
│ Permission:     [Delete                                   ▼]  │
│ Grant Type:     ● Allow  ○ Deny                               │
│ Scope:          [All Jobs (Organization)                  ▼]  │
│                                                                │
│ Reason: *                                                      │
│ [Sarah is handling bulk cleanup of old jobs for Q4 audit.  ]  │
│ [Temporary permission needed.                              ]  │
│                                                                │
│ Duration:                                                      │
│ ● Temporary (expires)                                         │
│   Expires: [Dec 31, 2024                           ] [📅]     │
│ ○ Permanent (does not expire)                                 │
│                                                                │
│ ⚠️ WARNING: Overrides bypass role-based security              │
│                                                                │
│ [Cancel]                               [Create Override]       │
└────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

```sql
-- Roles table
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_system_role BOOLEAN DEFAULT false,
  default_data_scope VARCHAR(20) DEFAULT 'own', -- own, team, region, org
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, name)
);

-- Permissions table
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) NOT NULL UNIQUE, -- e.g., 'jobs.create'
  name VARCHAR(100) NOT NULL,
  description TEXT,
  object_type VARCHAR(50) NOT NULL, -- jobs, candidates, users, etc.
  action VARCHAR(20) NOT NULL, -- create, read, update, delete, approve
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Role-Permission assignments
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id),
  scope_condition VARCHAR(50), -- null = default, or 'own', 'team', etc.
  granted BOOLEAN DEFAULT true, -- true = allow, false = deny
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

-- Custom permission overrides
CREATE TABLE permission_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id),
  granted BOOLEAN NOT NULL, -- true = allow, false = deny
  scope_override VARCHAR(50), -- null = role default, or specific scope
  reason TEXT NOT NULL,
  expires_at TIMESTAMPTZ, -- null = permanent
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES user_profiles(id)
);

-- API tokens
CREATE TABLE api_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name VARCHAR(100) NOT NULL,
  token_hash VARCHAR(255) NOT NULL, -- hashed token
  token_prefix VARCHAR(10) NOT NULL, -- first chars for identification
  scopes TEXT[] NOT NULL, -- array of permission codes
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX idx_permission_overrides_user ON permission_overrides(user_id);
CREATE INDEX idx_permission_overrides_expires ON permission_overrides(expires_at);
CREATE INDEX idx_api_tokens_org ON api_tokens(organization_id);
CREATE INDEX idx_api_tokens_hash ON api_tokens(token_hash);
```

---

## Permission Evaluation Logic

```typescript
// src/lib/auth/permission-evaluator.ts
interface PermissionCheckResult {
  allowed: boolean;
  reason: string;
  chain: PermissionChainStep[];
}

interface PermissionChainStep {
  step: string;
  result: 'pass' | 'fail' | 'skip';
  detail: string;
}

export async function evaluatePermission(
  userId: string,
  objectType: string,
  action: string,
  objectId?: string
): Promise<PermissionCheckResult> {
  const chain: PermissionChainStep[] = [];

  // 1. Check user account active
  const user = await getUser(userId);
  if (user.status !== 'active') {
    return {
      allowed: false,
      reason: 'User account is not active',
      chain: [{ step: 'Account status', result: 'fail', detail: `Status: ${user.status}` }]
    };
  }
  chain.push({ step: 'Account status', result: 'pass', detail: 'User is active' });

  // 2. Check role base permission
  const rolePermission = await getRolePermission(user.roleId, objectType, action);
  if (!rolePermission) {
    return {
      allowed: false,
      reason: `Role "${user.role.name}" does not have ${action} permission on ${objectType}`,
      chain: [...chain, { step: 'Role permission', result: 'fail', detail: 'Permission not granted' }]
    };
  }
  chain.push({ step: 'Role permission', result: 'pass', detail: `${action} allowed` });

  // 3. Check data scope
  if (objectId) {
    const inScope = await checkDataScope(user, objectType, objectId, rolePermission.scope);
    if (!inScope.allowed) {
      return {
        allowed: false,
        reason: inScope.reason,
        chain: [...chain, { step: 'Data scope', result: 'fail', detail: inScope.reason }]
      };
    }
    chain.push({ step: 'Data scope', result: 'pass', detail: inScope.reason });
  }

  // 4. Check custom overrides
  const override = await getPermissionOverride(userId, objectType, action);
  if (override) {
    if (!override.granted) {
      return {
        allowed: false,
        reason: 'Denied by custom override',
        chain: [...chain, { step: 'Custom override', result: 'fail', detail: override.reason }]
      };
    }
    chain.push({ step: 'Custom override', result: 'pass', detail: 'Allowed by override' });
  } else {
    chain.push({ step: 'Custom override', result: 'skip', detail: 'No override found' });
  }

  // 5. Check feature flags
  const featureCheck = await checkFeatureFlags(user, objectType, action);
  if (!featureCheck.allowed) {
    return {
      allowed: false,
      reason: 'Feature is disabled for this user',
      chain: [...chain, { step: 'Feature flags', result: 'fail', detail: featureCheck.reason }]
    };
  }
  chain.push({ step: 'Feature flags', result: 'pass', detail: 'No restrictions' });

  return {
    allowed: true,
    reason: 'Permission granted',
    chain
  };
}
```

---

## tRPC Endpoints

```typescript
// src/server/routers/admin/permissions.ts
export const permissionsRouter = router({
  getMatrix: orgProtectedProcedure
    .input(z.object({ objectType: z.string() }))
    .query(async ({ ctx, input }) => {
      // Return permission matrix for object type
    }),

  updateRolePermission: orgProtectedProcedure
    .input(z.object({
      roleId: z.string().uuid(),
      permissionId: z.string().uuid(),
      granted: z.boolean(),
      scope: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      // Update role permission
      // Create audit log
    }),

  testPermission: orgProtectedProcedure
    .input(z.object({
      userId: z.string().uuid(),
      objectType: z.string(),
      action: z.string(),
      objectId: z.string().optional()
    }))
    .query(async ({ ctx, input }) => {
      // Run permission evaluation
      return evaluatePermission(input.userId, input.objectType, input.action, input.objectId);
    }),

  createOverride: orgProtectedProcedure
    .input(z.object({
      userId: z.string().uuid(),
      permissionId: z.string().uuid(),
      granted: z.boolean(),
      scope: z.string().optional(),
      reason: z.string().min(10),
      expiresAt: z.date().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      // Create override
      // Create audit log
    }),

  listOverrides: orgProtectedProcedure
    .input(z.object({
      userId: z.string().uuid().optional(),
      activeOnly: z.boolean().default(true)
    }))
    .query(async ({ ctx, input }) => {
      // Return overrides list
    }),

  revokeOverride: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Revoke override
      // Create audit log
    }),

  compareRoles: orgProtectedProcedure
    .input(z.object({
      roleId1: z.string().uuid(),
      roleId2: z.string().uuid()
    }))
    .query(async ({ ctx, input }) => {
      // Return side-by-side comparison
    }),

  bulkUpdate: orgProtectedProcedure
    .input(z.object({
      userIds: z.array(z.string().uuid()),
      updateType: z.enum(['enable_feature', 'disable_feature', 'change_scope']),
      featureId: z.string().uuid().optional(),
      scope: z.string().optional(),
      reason: z.string().min(10)
    }))
    .mutation(async ({ ctx, input }) => {
      // Apply bulk update
      // Create audit logs
      // Support rollback
    }),

  // API Tokens
  generateToken: orgProtectedProcedure
    .input(z.object({
      name: z.string(),
      scopes: z.array(z.string()),
      expiresAt: z.date().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      // Generate token (only returns full token once)
    }),

  listTokens: orgProtectedProcedure
    .query(async ({ ctx }) => {
      // Return tokens (masked)
    }),

  revokeToken: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Revoke token
    })
});
```

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| ADMIN-PRM-001 | View permission matrix | Shows all roles and permissions for object type |
| ADMIN-PRM-002 | Edit role permissions | Permission updated, audit log created |
| ADMIN-PRM-003 | Test user permission (allowed) | Shows ALLOW with permission chain |
| ADMIN-PRM-004 | Test user permission (denied) | Shows DENY with reason |
| ADMIN-PRM-005 | Create temporary override | Override created with expiration |
| ADMIN-PRM-006 | Create permanent override | Override created without expiration |
| ADMIN-PRM-007 | Revoke override | Override marked revoked |
| ADMIN-PRM-008 | Expired override cleanup | Expired overrides no longer apply |
| ADMIN-PRM-009 | Compare two roles | Side-by-side comparison displayed |
| ADMIN-PRM-010 | Bulk enable feature | Feature enabled for selected users |
| ADMIN-PRM-011 | Rollback bulk update | Changes reverted |
| ADMIN-PRM-012 | Generate API token | Token generated, full token shown once |
| ADMIN-PRM-013 | Revoke API token | Token invalidated |
| ADMIN-PRM-014 | Deny override takes priority | DENY override blocks access |
| ADMIN-PRM-015 | Data scope enforcement | Out-of-scope access denied |

---

## Dependencies

- User Management (UC-ADMIN-005)
- Feature Flags (UC-ADMIN-014)
- Audit Logging (UC-ADMIN-008)

---

## Out of Scope

- Attribute-based access control (ABAC)
- Time-based permissions
- Geolocation-based permissions
