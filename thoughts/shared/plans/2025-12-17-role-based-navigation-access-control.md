# Role-Based Navigation & Access Control Implementation Plan

## Overview

Implement role-based navigation visibility and RACI-based data access control for InTime v3. The goal is to show each user role only the tabs/screens relevant to their workflows while ensuring data access follows the ownership model (own + RACI).

## Current State Analysis

### What Exists
- **10 Top Navigation Tabs**: My Work, Accounts, Contacts, Jobs, Candidates, CRM, Pipeline, Finance, HR, Administration
- **All tabs visible to ALL users** - no role-based filtering
- **Route-based sidebar selection**: `adminNavSections` for `/admin/*`, `recruiterNavSections` for others
- **RBAC System**: 13+ roles, 6 categories, 7 permission scopes including `own_raci`
- **RACI Table**: `object_owners` table exists with R/A/C/I assignments

### What's Missing
- Navigation tabs not filtered by user role
- No role context passed to TopNavigation component
- List queries don't filter by RACI ownership
- No default tab configuration per role

## Desired End State

After implementation:
1. Users see only tabs relevant to their role
2. Default landing page matches their primary workflow
3. List views show records where user is owner (created_by) OR has RACI assignment (R, A, C, or I)
4. The system supports the pod structure where everyone does end-to-end work

### Verification Criteria
- Admin user sees all 10 tabs, lands on Administration
- HR user sees My Work, Contacts, HR tabs, lands on My Work
- Pod IC/Manager sees My Work, Accounts, Contacts, Jobs, Candidates, CRM, Pipeline tabs, lands on My Work
- "My Jobs" shows jobs where user is R or A in `object_owners`
- "My Accounts" shows accounts where user is R or A in `object_owners`

## What We're NOT Doing

- Custom navigation per individual user (only role-based)
- Hiding dropdown items within tabs (entire tab visibility only)
- Changing sidebar behavior (already route-based, working correctly)
- Modifying permission evaluation chain (backend RBAC already solid)
- Creating separate Bench Sales vs Recruiter navigation (same pod workflow)

## Implementation Approach

The implementation follows a **progressive enhancement** approach:
1. First, add role context to navigation (no visible change)
2. Then, filter tabs based on role (visible change)
3. Finally, update list queries to use RACI filtering (data change)

---

## Phase 1: Role Context in Navigation

### Overview
Pass user role information to the TopNavigation component so it can filter tabs.

### Changes Required

#### 1. Create Navigation Auth Hook
**File**: `src/lib/navigation/useNavigationAuth.ts` (NEW)

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface NavigationUser {
  id: string
  roleCode: string
  roleCategory: string
  orgId: string
  podId: string | null
}

export function useNavigationAuth() {
  const [user, setUser] = useState<NavigationUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchUser() {
      try {
        const supabase = createClient()
        const { data: { user: authUser } } = await supabase.auth.getUser()

        if (!authUser) {
          setUser(null)
          setIsLoading(false)
          return
        }

        const { data: profile } = await supabase
          .from('user_profiles')
          .select(`
            id,
            org_id,
            active_pod_id,
            system_roles:role_id (
              code,
              category
            )
          `)
          .eq('auth_id', authUser.id)
          .single()

        if (profile?.system_roles) {
          const role = Array.isArray(profile.system_roles)
            ? profile.system_roles[0]
            : profile.system_roles

          setUser({
            id: profile.id,
            roleCode: role.code,
            roleCategory: role.category,
            orgId: profile.org_id,
            podId: profile.active_pod_id,
          })
        }
      } catch (error) {
        console.error('Failed to fetch navigation user:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [])

  return { user, isLoading }
}
```

#### 2. Define Role-Tab Visibility Configuration
**File**: `src/lib/navigation/role-navigation.config.ts` (NEW)

```typescript
import type { RoleCategory } from '@/lib/auth/permission-types'

/**
 * Defines which top navigation tabs are visible for each role category.
 * Pod ICs and Managers see the same tabs (they do the same end-to-end work).
 */

// Tab IDs from top-navigation.ts
type TabId = 'workspace' | 'accounts' | 'contacts' | 'jobs' | 'candidates' | 'crm' | 'pipeline' | 'finance' | 'hr' | 'admin'

interface RoleNavigationConfig {
  visibleTabs: TabId[]
  defaultTab: TabId
  defaultPath: string
}

export const ROLE_NAVIGATION_CONFIG: Record<RoleCategory, RoleNavigationConfig> = {
  // Admin - full access, default to Administration
  admin: {
    visibleTabs: ['workspace', 'accounts', 'contacts', 'jobs', 'candidates', 'crm', 'pipeline', 'finance', 'hr', 'admin'],
    defaultTab: 'admin',
    defaultPath: '/employee/admin/dashboard',
  },

  // Executive - full access, default to My Work (dashboard focus)
  executive: {
    visibleTabs: ['workspace', 'accounts', 'contacts', 'jobs', 'candidates', 'crm', 'pipeline', 'finance', 'hr', 'admin'],
    defaultTab: 'workspace',
    defaultPath: '/employee/workspace/dashboard',
  },

  // Leadership - full access except some admin settings
  leadership: {
    visibleTabs: ['workspace', 'accounts', 'contacts', 'jobs', 'candidates', 'crm', 'pipeline', 'finance', 'hr', 'admin'],
    defaultTab: 'workspace',
    defaultPath: '/employee/workspace/dashboard',
  },

  // Pod Manager - same as IC (end-to-end workflow) + team visibility
  pod_manager: {
    visibleTabs: ['workspace', 'accounts', 'contacts', 'jobs', 'candidates', 'crm', 'pipeline'],
    defaultTab: 'workspace',
    defaultPath: '/employee/workspace/dashboard',
  },

  // Pod IC (Recruiter, Bench Sales, TA) - full workflow access
  pod_ic: {
    visibleTabs: ['workspace', 'accounts', 'contacts', 'jobs', 'candidates', 'crm', 'pipeline'],
    defaultTab: 'workspace',
    defaultPath: '/employee/workspace/dashboard',
  },

  // Portal users (client, candidate) - not applicable for employee portal
  portal: {
    visibleTabs: ['workspace'],
    defaultTab: 'workspace',
    defaultPath: '/employee/workspace/dashboard',
  },
}

// HR-specific override (HR roles within pod_ic category need different tabs)
export const ROLE_CODE_OVERRIDES: Record<string, RoleNavigationConfig> = {
  hr_manager: {
    visibleTabs: ['workspace', 'contacts', 'hr', 'admin'],
    defaultTab: 'workspace',
    defaultPath: '/employee/workspace/dashboard',
  },
}

/**
 * Get navigation config for a user based on their role
 */
export function getNavigationConfig(roleCode: string, roleCategory: RoleCategory): RoleNavigationConfig {
  // Check for role-specific override first
  if (ROLE_CODE_OVERRIDES[roleCode]) {
    return ROLE_CODE_OVERRIDES[roleCode]
  }

  // Fall back to category-based config
  return ROLE_NAVIGATION_CONFIG[roleCategory]
}

/**
 * Check if a tab is visible for a given role
 */
export function isTabVisible(tabId: string, roleCode: string, roleCategory: RoleCategory): boolean {
  const config = getNavigationConfig(roleCode, roleCategory)
  return config.visibleTabs.includes(tabId as TabId)
}
```

### Success Criteria

#### Automated Verification:
- [x] TypeScript compiles without errors: `pnpm tsc --noEmit`
- [x] New files exist and export correctly
- [x] No linting errors: `pnpm lint`

#### Manual Verification:
- [x] Hook can be imported and used in a test component
- [x] Config returns correct tabs for each role category

---

## Phase 2: Filter TopNavigation Tabs

### Overview
Modify TopNavigation component to filter tabs based on user role.

### Changes Required

#### 1. Update TopNavigation Component
**File**: `src/components/navigation/TopNavigation.tsx`

Add role-based filtering to the tab rendering:

```typescript
// Add imports at top
import { useNavigationAuth } from '@/lib/navigation/useNavigationAuth'
import { isTabVisible } from '@/lib/navigation/role-navigation.config'

// Inside component, after existing hooks:
const { user: navUser, isLoading: isNavLoading } = useNavigationAuth()

// Filter tabs based on role
const visibleTabs = useMemo(() => {
  if (!navUser) {
    // Show all tabs while loading or if no user (will redirect anyway)
    return topNavigationTabs
  }

  return topNavigationTabs.filter(tab =>
    isTabVisible(tab.id, navUser.roleCode, navUser.roleCategory as RoleCategory)
  )
}, [navUser])

// Replace mapping over `topNavigationTabs` with `visibleTabs`
// Line ~252: {topNavigationTabs.map((tab) => ...
// Change to: {visibleTabs.map((tab) => ...

// Line ~544 (mobile menu): {topNavigationTabs.map((tab) => ...
// Change to: {visibleTabs.map((tab) => ...
```

#### 2. Update Auth Client Redirect Logic
**File**: `src/lib/auth/client.ts`

Update `getEmployeeRedirectPath` to use the new config:

```typescript
import { getNavigationConfig } from '@/lib/navigation/role-navigation.config'
import type { RoleCategory } from '@/lib/auth/permission-types'

export function getEmployeeRedirectPath(role: UserRole | null): string {
  if (!role) {
    return '/employee/workspace/dashboard'
  }

  const config = getNavigationConfig(role.code, role.category as RoleCategory)
  return config.defaultPath
}
```

### Success Criteria

#### Automated Verification:
- [x] TypeScript compiles without errors: `pnpm tsc --noEmit`
- [x] No linting errors: `pnpm lint`
- [x] Build succeeds: `pnpm build`

#### Manual Verification:
- [ ] Login as Admin → see all 10 tabs, land on Administration dashboard
- [ ] Login as Recruiter → see 7 tabs (My Work, Accounts, Contacts, Jobs, Candidates, CRM, Pipeline)
- [ ] Login as HR Manager → see 4 tabs (My Work, Contacts, HR, Administration)
- [ ] Tabs filter correctly on page refresh
- [ ] Mobile menu shows same filtered tabs

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation that role-based filtering works correctly before proceeding.

---

## Phase 3: RACI-Based Data Access in Lists

### Overview
Update list queries to filter by RACI ownership so users see records where they are R, A, C, or I.

### Changes Required

#### 1. Create RACI Query Helper
**File**: `src/server/lib/raci-filter.ts` (NEW)

```typescript
import { adminClient } from '@/lib/supabase/admin'

/**
 * Get entity IDs where user has RACI assignment
 */
export async function getRAciEntityIds(
  userId: string,
  entityType: string,
  roles: ('responsible' | 'accountable' | 'consulted' | 'informed')[] = ['responsible', 'accountable', 'consulted', 'informed']
): Promise<string[]> {
  const { data, error } = await adminClient
    .from('object_owners')
    .select('entity_id')
    .eq('user_id', userId)
    .eq('entity_type', entityType)
    .in('role', roles)
    .is('deleted_at', null)

  if (error) {
    console.error('Failed to fetch RACI entities:', error)
    return []
  }

  return data?.map(row => row.entity_id) ?? []
}

/**
 * Build filter for "own + RACI" access pattern
 * Returns entity IDs that user created OR has RACI assignment for
 */
export async function getOwnAndRaciEntityIds(
  userId: string,
  entityType: string,
  tableName: string,
  orgId: string
): Promise<string[]> {
  // Get RACI assigned entities
  const raciIds = await getRAciEntityIds(userId, entityType)

  // Get created entities
  const { data: createdEntities } = await adminClient
    .from(tableName)
    .select('id')
    .eq('org_id', orgId)
    .eq('created_by', userId)
    .is('deleted_at', null)

  const createdIds = createdEntities?.map(row => row.id) ?? []

  // Combine and deduplicate
  return [...new Set([...raciIds, ...createdIds])]
}
```

#### 2. Update List Procedures with RACI Filter Option
**File**: `src/server/routers/ats.ts` (jobs.list procedure)

Add `owner` filter option:

```typescript
// In jobs.list input schema, add:
owner: z.enum(['all', 'me', 'raci']).optional().default('all'),

// In the query logic:
let query = adminClient
  .from('jobs')
  .select('*, account:accounts(*)', { count: 'exact' })
  .eq('org_id', orgId)
  .is('deleted_at', null)

// Apply owner filter
if (input.owner === 'me') {
  query = query.eq('created_by', ctx.userId)
} else if (input.owner === 'raci') {
  const raciIds = await getOwnAndRaciEntityIds(ctx.userId, 'job', 'jobs', orgId)
  if (raciIds.length > 0) {
    query = query.in('id', raciIds)
  } else {
    // No access - return empty
    return { items: [], total: 0, pagination: { page: 1, pageSize: input.pageSize, total: 0, totalPages: 0 } }
  }
}
```

#### 3. Update "My X" Links to Use RACI Filter
**File**: `src/lib/navigation/top-navigation.ts`

Update the "My Jobs", "My Accounts", etc. links:

```typescript
// Change:
{ id: 'my-jobs', label: 'My Jobs', icon: Briefcase, href: '/employee/recruiting/jobs?assigned=me', type: 'link' },

// To:
{ id: 'my-jobs', label: 'My Jobs', icon: Briefcase, href: '/employee/recruiting/jobs?owner=raci', type: 'link' },
```

#### 4. Create RACI Assignment on Entity Creation
**File**: `src/server/routers/ats.ts` (jobs.create procedure)

After creating a job, assign R and A to the creator:

```typescript
// After job creation:
const [job] = await tx.insert(jobs).values(jobData).returning()

// Assign creator as Responsible and Accountable
await tx.insert(objectOwners).values([
  {
    orgId: ctx.orgId,
    entityType: 'job',
    entityId: job.id,
    userId: ctx.userId,
    role: 'responsible',
    permission: 'edit',
    isPrimary: true,
  },
  {
    orgId: ctx.orgId,
    entityType: 'job',
    entityId: job.id,
    userId: ctx.userId,
    role: 'accountable',
    permission: 'edit',
    isPrimary: false,
  },
])
```

### Success Criteria

#### Automated Verification:
- [ ] TypeScript compiles without errors: `pnpm tsc --noEmit`
- [ ] No linting errors: `pnpm lint`
- [ ] Build succeeds: `pnpm build`

#### Manual Verification:
- [ ] Create a new job → creator automatically has R and A assignments in `object_owners`
- [ ] "My Jobs" link shows only jobs where user is R or A
- [ ] User without any RACI assignment sees empty "My Jobs" list
- [ ] All Jobs (without filter) still shows all org jobs (for those with permission)

**Implementation Note**: After completing this phase, verify RACI assignment works for at least jobs and accounts before proceeding.

---

## Phase 4: Apply Pattern to All Entity Types

### Overview
Apply the RACI filtering pattern consistently across all major entity types.

### Changes Required

Apply the same pattern from Phase 3 to:

| Entity Type | Table | Router File | List Procedure |
|-------------|-------|-------------|----------------|
| Accounts | `companies` | `src/server/routers/crm.ts` | `accounts.list` |
| Candidates | `contacts` | `src/server/routers/ats.ts` | `candidates.list` |
| Submissions | `submissions` | `src/server/routers/ats.ts` | `submissions.list` |
| Leads | `leads` | `src/server/routers/crm.ts` | `leads.list` |
| Deals | `deals` | `src/server/routers/crm.ts` | `deals.list` |
| Campaigns | `campaigns` | `src/server/routers/crm.ts` | `campaigns.list` |

For each:
1. Add `owner: z.enum(['all', 'me', 'raci']).optional()` to input schema
2. Apply RACI filter in query logic
3. Auto-assign R/A on creation
4. Update "My X" navigation links

### Success Criteria

#### Automated Verification:
- [ ] TypeScript compiles without errors: `pnpm tsc --noEmit`
- [ ] All list procedures support `owner` filter
- [ ] Build succeeds: `pnpm build`

#### Manual Verification:
- [ ] "My Accounts" shows RACI-filtered accounts
- [ ] "My Submissions" shows RACI-filtered submissions
- [ ] Creating any entity auto-assigns R/A to creator
- [ ] Users see consistent "My X" behavior across all entity types

---

## Phase 5: Manager Team View (Future Enhancement)

### Overview
Add team visibility for pod managers to see their team's records.

### Changes Required

#### 1. Add Team Filter Option
Add `owner: 'team'` option to list queries that:
- Gets user's active pod
- Fetches all pod members
- Returns records where any pod member has RACI assignment

#### 2. Add "My Team" Section to My Work Tab
For users with `pod_manager` role category:
- Show "My Team's Jobs", "My Team's Submissions" links
- Add team dashboard widget

### Success Criteria

#### Manual Verification:
- [ ] Pod managers see "My Team" links in My Work dropdown
- [ ] Team filter shows records from all pod members
- [ ] Non-managers don't see team options

---

## Testing Strategy

### Unit Tests
- `useNavigationAuth` hook returns correct user data
- `getNavigationConfig` returns correct config for each role
- `isTabVisible` correctly filters tabs
- `getRAciEntityIds` returns correct entity IDs

### Integration Tests
- Login flow redirects to correct default path per role
- TopNavigation renders only visible tabs
- List queries correctly filter by RACI

### Manual Testing Steps
1. Create test users for each role category
2. Login as each user and verify:
   - Correct tabs visible
   - Correct default landing page
   - "My X" links show only owned/RACI records
3. Create entity as one user, verify another user without RACI doesn't see it in "My X"
4. Add RACI assignment to another user, verify they now see it in "My X"

---

## Performance Considerations

### RACI Query Optimization
- `object_owners` table should have index on `(user_id, entity_type)`
- Consider caching RACI entity IDs for frequently accessed users
- For large result sets, use pagination before RACI filtering

### Navigation Auth Caching
- `useNavigationAuth` fetches on mount - consider SWR or React Query for caching
- Role rarely changes - cache aggressively with manual invalidation on role update

---

## Migration Notes

### Existing Data
- Existing entities have no RACI assignments
- Option 1: Assign R/A to `created_by` user for all existing records (migration script)
- Option 2: "My X" falls back to `created_by` filter if no RACI found
- Recommendation: Option 2 for backwards compatibility, then backfill RACI

### Backfill Script (Optional)
```sql
-- Assign R and A to creators for existing jobs
INSERT INTO object_owners (org_id, entity_type, entity_id, user_id, role, permission, is_primary)
SELECT
  org_id,
  'job',
  id,
  created_by,
  'responsible',
  'edit',
  true
FROM jobs
WHERE created_by IS NOT NULL
  AND deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM object_owners
    WHERE entity_type = 'job'
    AND entity_id = jobs.id
    AND role = 'responsible'
  );
```

---

## References

- Research document: `thoughts/shared/research/2025-12-17-permissions-access-control-system.md`
- Top navigation config: `src/lib/navigation/top-navigation.ts`
- Auth client: `src/lib/auth/client.ts`
- Permission types: `src/lib/auth/permission-types.ts`
- Object owners table: `database/schema.sql:24706-24725`
