---
date: 2026-01-01T00:00:00-08:00
researcher: Claude
git_commit: 8fc9046b9a0045b00d128a3d1b6d82c09ecbac36
branch: main
repository: intime-v3
topic: "Admin User Creation Flow - Login, Roles, Groups, and Pods Assignment"
tags: [research, codebase, admin, users, roles, groups, pods, authentication]
status: complete
last_updated: 2026-01-01
last_updated_by: Claude
---

# Research: Admin User Creation Flow

**Date**: 2026-01-01
**Researcher**: Claude
**Git Commit**: 8fc9046b9a0045b00d128a3d1b6d82c09ecbac36
**Branch**: main
**Repository**: intime-v3

## Research Question

How does the admin user creation system work in InTime v3? Specifically:
1. How to create a new user login via the UI
2. How to assign roles, groups, and pods to a user
3. How the system enables a new user to login and start working

## Summary

The InTime v3 admin system provides a comprehensive user management interface at `/employee/admin/users`. The user creation flow involves:

1. **Creating a user** via the admin UI form at `/employee/admin/users/new`
2. **Automatic auth user creation** - The tRPC `users.create` procedure creates both a Supabase Auth user and a `user_profiles` record in a single transaction
3. **Role assignment** - A required `roleId` is assigned at creation time
4. **Pod assignment** - Optional, but required if the role category is `pod_ic`
5. **Group assignment** - Optional `primaryGroupId` creates a group membership

The system uses a two-table architecture where `auth.users` (Supabase) handles authentication and `user_profiles` stores business data, linked via the `auth_id` column.

---

## Detailed Findings

### 1. Admin User Management UI

#### Routes

| Route | File | Purpose |
|-------|------|---------|
| `/employee/admin/users` | `src/app/employee/admin/users/page.tsx` | Users list page |
| `/employee/admin/users/new` | `src/app/employee/admin/users/new/page.tsx` | Create new user |
| `/employee/admin/users/[id]` | `src/app/employee/admin/users/[id]/page.tsx` | User detail view |
| `/employee/admin/users/[id]/edit` | `src/app/employee/admin/users/[id]/edit/page.tsx` | Edit user |

#### Core Components

| Component | File | Purpose |
|-----------|------|---------|
| `UsersListClient` | `src/components/admin/users/UsersListClient.tsx` | Client-side users list with search/filter |
| `UserDetailClient` | `src/components/admin/users/UserDetailClient.tsx` | User detail view with tabs |
| `UserFormClient` | `src/components/admin/users/UserFormClient.tsx` | Create/edit user form |
| `UserDetailTabs` | `src/components/admin/users/UserDetailTabs.tsx` | Tab navigation for user detail |

#### User Detail Tabs

| Tab | File | Purpose |
|-----|------|---------|
| Basics | `src/components/admin/users/tabs/UserBasicsTab.tsx` | Basic user information |
| Profile | `src/components/admin/users/tabs/UserProfileTab.tsx` | Profile details |
| Roles | `src/components/admin/users/tabs/UserRolesTab.tsx` | Role management |
| Access | `src/components/admin/users/tabs/UserAccessTab.tsx` | Access permissions |
| Attributes | `src/components/admin/users/tabs/UserAttributesTab.tsx` | Custom attributes |
| Region | `src/components/admin/users/tabs/UserRegionTab.tsx` | Regional assignment |
| Authority | `src/components/admin/users/tabs/UserAuthorityTab.tsx` | Authority levels |

---

### 2. User Creation Flow

#### Step 1: Admin Navigates to Create User

- URL: `/employee/admin/users/new`
- Component: `UserFormClient` with `mode="create"`

#### Step 2: Form Fields

The `UserFormClient` (`src/components/admin/users/UserFormClient.tsx:84-94`) manages these fields:

**Basic Information:**
- `firstName` (required) - Line 84
- `lastName` (required) - Line 85
- `email` (required) - Line 86
- `phone` (optional) - Line 87

**Access/Assignment:**
- `roleId` (required) - Line 88
- `podId` (optional/conditional) - Line 89
- `managerId` (optional) - Line 90

**Authentication (create mode only):**
- `authMethod` (`'invitation'` | `'password'`) - Line 91
- `initialPassword` (if authMethod is 'password') - Line 92
- `requireTwoFactor` (boolean) - Line 94

#### Step 3: Form Submission

When the form is submitted (`src/components/admin/users/UserFormClient.tsx:177-188`):

```typescript
createMutation.mutate({
  firstName: firstName.trim(),
  lastName: lastName.trim(),
  email: email.trim().toLowerCase(),
  phone: phone.trim() || undefined,
  roleId,
  podId: podId && podId !== 'none' ? podId : undefined,
  managerId: managerId && managerId !== 'none' ? managerId : undefined,
  sendInvitation: authMethod === 'invitation',
  initialPassword: authMethod === 'password' ? initialPassword : undefined,
  requireTwoFactor,
})
```

#### Step 4: Backend Processing

The `users.create` procedure (`src/server/routers/users.ts:292-440`) performs:

1. **Email Validation** (Lines 310-324)
   - Checks if email already exists in the organization
   - Queries `user_profiles` table filtered by `org_id` and `email`

2. **Supabase Auth User Creation** (Lines 326-345)
   ```typescript
   const { data: authData } = await adminClient.auth.admin.createUser({
     email: input.email,
     password: input.initialPassword || `${Math.random().toString(36).slice(-12)}Aa1!`,
     email_confirm: true,
     user_metadata: {
       first_name: input.firstName,
       last_name: input.lastName,
       org_id: orgId,
     },
   })
   ```

3. **User Profile Creation** (Lines 347-378)
   - Creates record in `user_profiles` table
   - Uses auth user ID as profile ID (1:1 mapping)
   - Sets `role_id`, `manager_id`, `primary_group_id`
   - Status is `'pending'` if sending invitation, `'active'` otherwise

4. **Group Assignment** (Lines 380-390)
   - If `primaryGroupId` provided, creates `group_members` record
   - Sets `is_manager: false`, `is_active: true`

5. **Pod Assignment** (Lines 392-401)
   - If `podId` provided, creates `pod_members` record
   - Sets `role: 'junior'` as default pod role

6. **Invitation Record** (Lines 403-419)
   - If `sendInvitation` is true, creates `user_invitations` record
   - Token expires in 7 days

7. **Audit Logging** (Lines 421-437)
   - Creates entry in `audit_logs` table

---

### 3. Role Assignment

#### Database Tables

| Table | Purpose | File:Line |
|-------|---------|-----------|
| `system_roles` | System-wide predefined roles | `src/db/schema/schema.ts:5683` |
| `roles` | Custom/org-specific roles | `src/db/schema/schema.ts:721` |
| `role_permissions` | Role-permission junction | `src/db/schema/schema.ts:2494` |
| `user_roles` | User-role junction | `src/db/schema/schema.ts:17334` |

#### How Roles Are Assigned

**On User Creation** (`src/server/routers/users.ts:359`):
- `roleId` is saved to `user_profiles.role_id` column
- References `system_roles(id)` table

**Role Selection UI** (`src/components/admin/users/UserFormClient.tsx:285-308`):
- Dropdown populated from `initialData.roles`
- Shows role name, color indicator, and category

**Available Roles Query** (`src/server/routers/users.ts:799-817`):
```typescript
const { data: roles } = await adminClient
  .from('system_roles')
  .select('id, name, display_name, code, category, color_code, description')
  .eq('is_active', true)
  .order('hierarchy_level', { ascending: true })
```

#### Roles tRPC Router

Location: `src/server/routers/permissions.ts`

| Procedure | Lines | Purpose |
|-----------|-------|---------|
| `getRoles` | 38 | List all roles |
| `listRoles` | 60 | List with filtering/pagination |
| `getRoleById` | 116 | Get single role details |
| `createRole` | 289 | Create new role |
| `updateRole` | 381 | Update existing role |
| `deleteRole` | 453 | Delete role |
| `updateRolePermission` | 751 | Update role permissions |

---

### 4. Group Assignment

#### Database Tables

| Table | Purpose |
|-------|---------|
| `groups` | Group entities |
| `group_members` | Group membership junction |
| `group_regions` | Group-region associations |

#### How Groups Are Assigned

**On User Creation** (`src/server/routers/users.ts:380-390`):
```typescript
if (input.primaryGroupId) {
  await adminClient.from('group_members').insert({
    org_id: orgId,
    group_id: input.primaryGroupId,
    user_id: userProfile.id,
    is_manager: false,
    is_active: true,
    created_by: userProfileId,
  })
}
```

**Note**: The current `UserFormClient` does **NOT** include a group selection field. Groups are managed separately via:
- `/employee/admin/groups` routes
- Group detail page → Users tab
- `GroupUsersTab` component

#### Groups tRPC Router

Location: `src/server/routers/groups.ts`

| Procedure | Lines | Purpose |
|-----------|-------|---------|
| `list` | 83-174 | List groups with filters |
| `getById` | 179-269 | Get single group with members |
| `create` | 377-504 | Create new group |
| `addMembers` | 812-908 | Add users to group |
| `removeMembers` | 913-964 | Remove users from group |
| `updateMember` | 969-1008 | Update member settings |

#### Adding Users to Groups (`src/server/routers/groups.ts:812-908`)

Input Schema:
```typescript
{
  groupId: z.string().uuid(),
  members: z.array(z.object({
    userId: z.string().uuid(),
    isManager: z.boolean().default(false),
    loadFactor: z.number().min(0).max(200).default(100),
    loadPermission: z.enum(['normal', 'reduced', 'exempt']).default('normal'),
  })),
}
```

---

### 5. Pod Assignment

#### Database Tables

| Table | Purpose | File:Line |
|-------|---------|-----------|
| `pods` | Pod entities | `src/db/schema/schema.ts:4171` |
| `pod_members` | Pod membership junction | `src/db/schema/schema.ts:5616` |

#### How Pods Are Assigned

**On User Creation** (`src/server/routers/users.ts:392-401`):
```typescript
if (input.podId) {
  await adminClient.from('pod_members').insert({
    org_id: orgId,
    pod_id: input.podId,
    user_id: userProfile.id,
    role: 'junior',  // Default pod role
    is_active: true,
  })
}
```

**Pod Selection UI** (`src/components/admin/users/UserFormClient.tsx:310-327`):
- Dropdown with "No Pod" option
- Conditional requirement based on role category
- If role category is `'pod_ic'`, pod is required

**Conditional Pod Requirement** (`src/components/admin/users/UserFormClient.tsx:146,167-170`):
```typescript
const selectedRole = initialData.roles.find((r) => r.id === roleId)
const requiresPod = selectedRole?.category === 'pod_ic'

if (requiresPod && (!podId || podId === 'none')) {
  toast.error('Please select a pod for this role')
  return
}
```

#### Pods tRPC Router

Location: `src/server/routers/pods.ts`

| Procedure | Lines | Purpose |
|-----------|-------|---------|
| `list` | 69-159 | Paginated list with filters |
| `getById` | 164-197 | Get single pod with members |
| `create` | 202-308 | Create new pod |
| `addMembers` | 439-518 | Add users to pod |
| `removeMembers` | 523-562 | Remove users from pod |
| `transferMembers` | 567-623 | Move members between pods |

#### Adding Users to Pods (`src/server/routers/pods.ts:439-518`)

Input Schema:
```typescript
{
  podId: z.string().uuid(),
  members: z.array(z.object({
    userId: z.string().uuid(),
    role: z.enum(['senior', 'junior']).default('junior'),
  })),
}
```

---

### 6. Authentication Architecture

#### Two-Table Design

| Table | Location | Purpose |
|-------|----------|---------|
| `auth.users` | Supabase managed | Authentication (email, password, sessions) |
| `user_profiles` | Application managed | Business data (name, org, role, pod) |

**Link Field**: `user_profiles.auth_id` → `auth.users.id`

#### Login Flow

1. **User submits credentials** → `supabase.auth.signInWithPassword()`
2. **Supabase validates** → Returns session with `user.id`
3. **Lookup profile** → `SELECT * FROM user_profiles WHERE auth_id = user.id`
4. **Set org cookie** → `/api/auth/set-org-cookie` caches `org_id`
5. **RLS enforcement** → All queries filtered by `org_id`

#### Relevant Files

| Purpose | File |
|---------|------|
| Client auth functions | `src/lib/auth/client.ts` |
| Supabase clients | `src/lib/supabase/client.ts`, `server.ts`, `admin.ts` |
| Org cookie setup | `src/app/api/auth/set-org-cookie/route.ts` |
| tRPC auth middleware | `src/server/trpc/middleware.ts` |

---

## Code References

### User Management

- `src/server/routers/users.ts:292-440` - User creation procedure
- `src/server/routers/users.ts:445-550` - User update procedure
- `src/components/admin/users/UserFormClient.tsx:79-443` - User form component
- `src/components/admin/users/UserFormClient.tsx:177-188` - Create mutation call

### Role Management

- `src/server/routers/permissions.ts:38-60` - Role listing procedures
- `src/server/routers/users.ts:799-817` - Available roles query
- `src/components/admin/users/UserFormClient.tsx:285-308` - Role select UI

### Group Management

- `src/server/routers/groups.ts:812-908` - Add members to group
- `src/server/routers/users.ts:380-390` - Group assignment on user creation
- `src/components/admin/groups/tabs/GroupUsersTab.tsx` - Group users management

### Pod Management

- `src/server/routers/pods.ts:439-518` - Add members to pod
- `src/server/routers/users.ts:392-401` - Pod assignment on user creation
- `src/components/admin/users/UserFormClient.tsx:310-327` - Pod select UI
- `src/components/admin/pods/AddMembersDialog.tsx` - Add members dialog

### Authentication

- `src/lib/auth/client.ts:40-99` - Get user role function
- `src/lib/auth/client.ts:104-124` - Sign in function
- `src/app/api/auth/set-org-cookie/route.ts:10-53` - Org cookie setup

---

## Architecture Documentation

### User Creation Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                     ADMIN USER CREATION FLOW                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. ADMIN UI                                                         │
│     └─> /employee/admin/users/new                                   │
│         └─> UserFormClient (mode="create")                          │
│             └─> Form fields: name, email, role, pod, auth method    │
│                                                                      │
│  2. FORM SUBMISSION                                                  │
│     └─> trpc.users.create.mutate({...})                             │
│                                                                      │
│  3. BACKEND PROCESSING (users.ts:292-440)                           │
│     ├─> Validate email uniqueness                                    │
│     ├─> Create Supabase Auth user (auth.admin.createUser)           │
│     ├─> Create user_profiles record (auth_id = auth user ID)        │
│     ├─> Create group_members record (if primaryGroupId)             │
│     ├─> Create pod_members record (if podId)                        │
│     ├─> Create user_invitations record (if sendInvitation)          │
│     └─> Create audit_logs record                                     │
│                                                                      │
│  4. NEW USER LOGIN                                                   │
│     └─> supabase.auth.signInWithPassword()                          │
│         └─> Session created with auth user ID                       │
│             └─> Profile lookup: WHERE auth_id = session.user.id     │
│                 └─> Role resolved from user_profiles.role_id        │
│                     └─> Org cookie set for RLS enforcement          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Model Relationships

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   auth.users    │     │  user_profiles  │     │  system_roles   │
│─────────────────│     │─────────────────│     │─────────────────│
│ id (PK)         │◄────│ auth_id (FK)    │     │ id (PK)         │
│ email           │     │ id (PK)         │────►│ code            │
│ encrypted_pass  │     │ email           │     │ display_name    │
│ user_metadata   │     │ full_name       │     │ category        │
└─────────────────┘     │ org_id          │     │ permissions     │
                        │ role_id (FK)    │────►└─────────────────┘
                        │ primary_group_id│
                        └─────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
    ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
    │  pod_members  │ │ group_members │ │    groups     │
    │───────────────│ │───────────────│ │───────────────│
    │ pod_id (FK)   │ │ group_id (FK) │ │ id (PK)       │
    │ user_id (FK)  │ │ user_id (FK)  │ │ name          │
    │ role          │ │ is_manager    │ │ group_type    │
    │ is_active     │ │ is_active     │ │ parent_id     │
    └───────────────┘ └───────────────┘ └───────────────┘
            │
            ▼
    ┌───────────────┐
    │     pods      │
    │───────────────│
    │ id (PK)       │
    │ name          │
    │ pod_type      │
    │ manager_id    │
    └───────────────┘
```

---

## Related Research

- No existing related research documents found in `thoughts/shared/research/`

## Open Questions

1. **Group Selection in User Form**: The current `UserFormClient` does not include a group selection dropdown. Groups must be assigned separately via the Groups admin section. Is this intentional or should group assignment be added to the user creation form?

2. **Pod Role Options**: The form only supports 'junior' role assignment for pods during user creation (hardcoded at `users.ts:398`). Senior role must be assigned via pod management separately.

3. **Invitation Flow**: When `sendInvitation: true`, a `user_invitations` record is created but the actual email sending mechanism was not found in this research. The invitation flow may require additional implementation.

4. **Group Membership on Update**: When updating a user's `primaryGroupId`, the `user_profiles.primary_group_id` is updated but the `group_members` table is NOT updated (potential inconsistency at `users.ts:491`).
