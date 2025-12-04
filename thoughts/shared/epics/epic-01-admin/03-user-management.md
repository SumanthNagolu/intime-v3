# User Story: User Management

**Epic:** Admin Portal (Epic-01)
**Story ID:** ADMIN-US-003
**Priority:** High
**Estimated Context:** ~40K tokens
**Source Spec:** `docs/specs/20-USER-ROLES/10-admin/05-user-management.md`

---

## User Story

**As an** Admin user,
**I want** to create, edit, and manage user accounts with role and pod assignments,
**So that** I can control who has access to the system and what they can do.

---

## Acceptance Criteria

### AC-1: View Users List
- [ ] Display all users in searchable/sortable table
- [ ] Show name, email, role, pod, status, last login
- [ ] Support filtering by role, pod, status
- [ ] Support search by name or email
- [ ] Show user avatar/initials

### AC-2: Create New User
- [ ] Enter user details (name, email)
- [ ] Assign role (required)
- [ ] Assign pod (required for ICs)
- [ ] Set initial password or send invitation
- [ ] Optional: Enable 2FA requirement
- [ ] Creates user and sends welcome email

### AC-3: Edit User
- [ ] Edit user details (name, phone)
- [ ] Change role (requires confirmation)
- [ ] Change pod assignment
- [ ] Update profile photo
- [ ] Save creates audit log entry

### AC-4: Manage User Status
- [ ] Activate user account
- [ ] Suspend user (temporary disable)
- [ ] Deactivate user (permanent disable)
- [ ] Shows confirmation dialog with impact

### AC-5: Password Management
- [ ] Reset password (sends reset email)
- [ ] Force password change on next login
- [ ] Unlock account (after failed attempts)
- [ ] View password last changed date

### AC-6: Bulk Operations
- [ ] Bulk import users from CSV
- [ ] Bulk role change
- [ ] Bulk pod assignment
- [ ] Bulk status change (activate/deactivate)

### AC-7: User Activity
- [ ] View user's recent activity
- [ ] View user's login history
- [ ] View user's active sessions
- [ ] Force logout all sessions

---

## UI/UX Requirements

### Users List View
```
┌────────────────────────────────────────────────────────────────┐
│ Users                                    [Import] [+ New User] │
├────────────────────────────────────────────────────────────────┤
│ [Search users...]  [Role: All ▼] [Pod: All ▼] [Status: All ▼] │
│                                                                │
│ ┌────────┬──────────────┬─────────────┬───────────┬──────────┐│
│ │ User   │ Email        │ Role        │ Pod       │ Status   ││
│ ├────────┼──────────────┼─────────────┼───────────┼──────────┤│
│ │ 👤 SP  │sarah@co.com  │Tech Recruiter│Alpha     │🟢 Active ││
│ │ 👤 JS  │john@co.com   │Tech Recruiter│Alpha     │🟢 Active ││
│ │ 👤 MJ  │mike@co.com   │Pod Manager  │Alpha     │🟢 Active ││
│ │ 👤 LC  │lisa@co.com   │Bench Sales  │BS-US     │🟡 Suspend││
│ │ 👤 TB  │tom@co.com    │Admin        │—         │🟢 Active ││
│ └────────┴──────────────┴─────────────┴───────────┴──────────┘│
│                                                                │
│ Showing 1-5 of 247 users          [◀ Previous] [Next ▶]      │
└────────────────────────────────────────────────────────────────┘
```

### Create User Modal
```
┌────────────────────────────────────────────────────────────────┐
│ Create New User                                           [×]  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ BASIC INFORMATION                                              │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ First Name *              Last Name *                      ││
│ │ [John                  ]  [Doe                          ]  ││
│ │                                                            ││
│ │ Email *                                                    ││
│ │ [john.doe@company.com                                   ]  ││
│ │                                                            ││
│ │ Phone (optional)                                           ││
│ │ [+1 (555) 123-4567                                      ]  ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ ACCESS                                                         │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ Role *                                                     ││
│ │ [Technical Recruiter                                   ▼]  ││
│ │                                                            ││
│ │ Pod *                                                      ││
│ │ [Recruiting Alpha                                      ▼]  ││
│ │                                                            ││
│ │ Reports To                                                 ││
│ │ [Mike Jones (Pod Manager)                              ▼]  ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ AUTHENTICATION                                                 │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ ● Send invitation email (user sets password)              ││
│ │ ○ Set initial password                                    ││
│ │                                                            ││
│ │ ☐ Require two-factor authentication                       ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ [Cancel]                                        [Create User]  │
└────────────────────────────────────────────────────────────────┘
```

### User Detail View
```
┌────────────────────────────────────────────────────────────────┐
│ ← Back to Users                                                │
│                                                                │
│ ┌──────┐ Sarah Patel                           [Edit] [⋮]     │
│ │  SP  │ sarah.patel@company.com                               │
│ └──────┘ Technical Recruiter | Recruiting Alpha | 🟢 Active   │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ [Profile] [Activity] [Security] [Sessions]                     │
│                                                                │
│ ═══════════════════════════════════════════════════════════   │
│                                                                │
│ PROFILE                                                        │
│ ┌────────────────────────┬─────────────────────────────────┐  │
│ │ Email                  │ sarah.patel@company.com         │  │
│ │ Phone                  │ +1 (555) 234-5678               │  │
│ │ Role                   │ Technical Recruiter             │  │
│ │ Pod                    │ Recruiting Alpha                │  │
│ │ Reports To             │ Mike Jones                      │  │
│ │ Start Date             │ Nov 1, 2024                     │  │
│ │ Last Login             │ Dec 4, 2024 at 9:15 AM          │  │
│ └────────────────────────┴─────────────────────────────────┘  │
│                                                                │
│ PERMISSIONS SUMMARY                                            │
│ • Jobs: Create, Read (Own+RACI), Update (Own+RA)              │
│ • Candidates: Create, Read (Own+RACI), Update (Own+RA)        │
│ • Features: AI Twin ✓, Bulk Email ✗, Advanced Analytics ✗    │
│ [View Full Permissions]                                        │
│                                                                │
│ QUICK ACTIONS                                                  │
│ [Reset Password] [Suspend User] [Force Logout]                │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

```sql
-- User profiles (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  avatar_url TEXT,
  role_id UUID NOT NULL REFERENCES roles(id),
  manager_id UUID REFERENCES user_profiles(id),
  status VARCHAR(20) DEFAULT 'pending', -- pending, active, suspended, deactivated
  start_date DATE,
  last_login_at TIMESTAMPTZ,
  password_changed_at TIMESTAMPTZ,
  two_factor_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id),
  UNIQUE(organization_id, email)
);

-- User sessions tracking
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  session_token VARCHAR(255) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  device_info JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ
);

-- Login history
CREATE TABLE login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  email VARCHAR(255) NOT NULL,
  success BOOLEAN NOT NULL,
  ip_address INET,
  user_agent TEXT,
  failure_reason VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User invitations
CREATE TABLE user_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  email VARCHAR(255) NOT NULL,
  role_id UUID NOT NULL REFERENCES roles(id),
  pod_id UUID REFERENCES pods(id),
  token VARCHAR(255) NOT NULL UNIQUE,
  invited_by UUID NOT NULL REFERENCES user_profiles(id),
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_user_profiles_org ON user_profiles(organization_id);
CREATE INDEX idx_user_profiles_role ON user_profiles(role_id);
CREATE INDEX idx_user_profiles_status ON user_profiles(status);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_login_history_user ON login_history(user_id);
CREATE INDEX idx_login_history_email ON login_history(email);
```

---

## tRPC Endpoints

```typescript
// src/server/routers/admin/users.ts
export const usersRouter = router({
  list: orgProtectedProcedure
    .input(z.object({
      search: z.string().optional(),
      roleId: z.string().uuid().optional(),
      podId: z.string().uuid().optional(),
      status: z.enum(['pending', 'active', 'suspended', 'deactivated']).optional(),
      page: z.number().default(1),
      pageSize: z.number().default(20)
    }))
    .query(async ({ ctx, input }) => {
      // Return paginated users list with role and pod info
    }),

  getById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Return user with full details
    }),

  create: orgProtectedProcedure
    .input(z.object({
      firstName: z.string().min(1).max(100),
      lastName: z.string().min(1).max(100),
      email: z.string().email(),
      phone: z.string().optional(),
      roleId: z.string().uuid(),
      podId: z.string().uuid().optional(),
      managerId: z.string().uuid().optional(),
      sendInvitation: z.boolean().default(true),
      initialPassword: z.string().optional(),
      requireTwoFactor: z.boolean().default(false)
    }))
    .mutation(async ({ ctx, input }) => {
      // Create user in auth.users
      // Create user_profiles record
      // Add to pod if specified
      // Send invitation or set password
      // Create audit log
    }),

  update: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      firstName: z.string().min(1).max(100).optional(),
      lastName: z.string().min(1).max(100).optional(),
      phone: z.string().optional(),
      roleId: z.string().uuid().optional(),
      podId: z.string().uuid().optional(),
      managerId: z.string().uuid().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      // Update user
      // Handle role change implications
      // Create audit log
    }),

  updateStatus: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      status: z.enum(['active', 'suspended', 'deactivated']),
      reason: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      // Update status
      // If deactivating, revoke all sessions
      // Create audit log
    }),

  resetPassword: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Send password reset email
      // Create audit log
    }),

  forcePasswordChange: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Set flag to require password change
      // Create audit log
    }),

  revokeAllSessions: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Revoke all active sessions
      // Create audit log
    }),

  getActivity: orgProtectedProcedure
    .input(z.object({
      userId: z.string().uuid(),
      limit: z.number().default(50)
    }))
    .query(async ({ ctx, input }) => {
      // Return user's recent activity
    }),

  getSessions: orgProtectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Return user's active sessions
    }),

  bulkImport: orgProtectedProcedure
    .input(z.object({
      users: z.array(z.object({
        firstName: z.string(),
        lastName: z.string(),
        email: z.string().email(),
        role: z.string(),
        pod: z.string().optional()
      }))
    }))
    .mutation(async ({ ctx, input }) => {
      // Validate all users
      // Create users in batch
      // Send invitations
      // Return success/error summary
    })
});
```

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| ADMIN-USER-001 | View users list | Shows all org users with correct data |
| ADMIN-USER-002 | Search users | Filters users by name/email |
| ADMIN-USER-003 | Create user with invitation | User created, invitation email sent |
| ADMIN-USER-004 | Create user with password | User created with initial password |
| ADMIN-USER-005 | Create user with duplicate email | Error: "Email already exists" |
| ADMIN-USER-006 | Edit user | User updated, audit log created |
| ADMIN-USER-007 | Change user role | Role changed, permissions updated |
| ADMIN-USER-008 | Suspend user | Status = suspended, sessions revoked |
| ADMIN-USER-009 | Deactivate user | Status = deactivated, cannot login |
| ADMIN-USER-010 | Reactivate user | Status = active, can login |
| ADMIN-USER-011 | Reset password | Reset email sent |
| ADMIN-USER-012 | Force password change | User must change on next login |
| ADMIN-USER-013 | Revoke all sessions | All sessions invalidated |
| ADMIN-USER-014 | Bulk import users | Users created from CSV |
| ADMIN-USER-015 | Non-admin access | Returns 403 Forbidden |

---

## Field Specifications

### First Name
| Property | Value |
|----------|-------|
| Field Name | `firstName` |
| Type | TextInput |
| Required | Yes |
| Min Length | 1 character |
| Max Length | 100 characters |
| Validation | Letters, spaces, hyphens, apostrophes |
| Error Messages | |
| - Empty | "First name is required" |
| - Invalid | "First name contains invalid characters" |

### Last Name
| Property | Value |
|----------|-------|
| Field Name | `lastName` |
| Type | TextInput |
| Required | Yes |
| Min Length | 1 character |
| Max Length | 100 characters |
| Validation | Letters, spaces, hyphens, apostrophes |
| Error Messages | |
| - Empty | "Last name is required" |
| - Invalid | "Last name contains invalid characters" |

### Email
| Property | Value |
|----------|-------|
| Field Name | `email` |
| Type | TextInput (email) |
| Required | Yes |
| Max Length | 255 characters |
| Validation | Valid email format, unique in org |
| Error Messages | |
| - Empty | "Email is required" |
| - Invalid | "Please enter a valid email address" |
| - Duplicate | "A user with this email already exists" |

### Role
| Property | Value |
|----------|-------|
| Field Name | `roleId` |
| Type | Select |
| Required | Yes |
| Options | Active roles from `roles` table |
| Error Messages | |
| - Empty | "Please select a role" |

### Pod
| Property | Value |
|----------|-------|
| Field Name | `podId` |
| Type | Select (searchable) |
| Required | Conditional (required for IC roles) |
| Options | Active pods from `pods` table |
| Error Messages | |
| - Empty | "Please select a pod" (when required) |

---

## Dependencies

- Supabase Auth for user authentication
- Email system for invitations and password resets
- Pod Management (UC-ADMIN-002)
- Role/Permission Management (UC-ADMIN-006)
- Audit Logging (UC-ADMIN-008)

---

## Out of Scope

- SSO/SAML configuration (separate story)
- User profile self-service (different role)
- Org chart visualization (future enhancement)
