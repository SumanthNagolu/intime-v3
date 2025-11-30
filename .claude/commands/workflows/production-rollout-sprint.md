# 🚀 InTime v3 Production Rollout Sprint - Claude Code Workflow

## Overview
This workflow systematically analyzes, fixes, and validates each feature module for production readiness. Execute ONE component at a time, ensuring complete Database-Application-UI sync before moving to the next.

---

## 🎯 Feature Rollout Order

1. **Authentication & Access Control** (Foundation)
2. **Admin Console** (System Management)
3. **HR Module** (People Operations)
4. **Talent Acquisition / Sales** (Business Development)
5. **Recruiting** (Core Revenue)
6. **Bench Sales** (Consultant Placement)

---

## 📋 Component Analysis & Delivery Workflow

For EACH component, execute these phases in order:

---

### Phase 1: Deep Analysis (20 minutes)

**Command Pattern:**
```
Analyze [COMPONENT_NAME] for production readiness:

1. DATABASE AUDIT
   - List all related tables from schema files
   - Verify RLS policies exist and are properly configured
   - Check multi-tenancy (org_id) on all tenant-scoped tables
   - Verify audit trail fields (created_at, updated_at, created_by, updated_by, deleted_at)
   - Check indexes on foreign keys and commonly queried fields
   - Document any missing computed columns or triggers

2. API/SERVER AUDIT
   - List all server actions in src/app/actions/
   - List all tRPC routers in src/server/
   - Verify Zod validation on all inputs
   - Check proper error handling with discriminated unions
   - Verify org_id filtering in all queries
   - Document gaps in CRUD operations

3. UI/COMPONENT AUDIT
   - List all pages in src/app/ for this module
   - List all components in src/components/
   - Check form validation implementation
   - Verify loading/error states
   - Check accessibility (WCAG AA)
   - Document mock data vs real data binding

4. GAP ANALYSIS
   - What's hardcoded/mocked that needs database binding?
   - What CRUD operations are missing?
   - What UI forms exist without server actions?
   - What database tables exist without UI?
```

---

### Phase 2: Database Alignment (30 minutes)

**Tasks:**
1. **Schema Verification**
   - Ensure all tables have RLS enabled
   - Add missing RLS policies
   - Add missing indexes
   - Create any missing computed columns

2. **Migration Creation** (if needed)
   ```sql
   -- Migration: [number]_[component]_production_alignment.sql
   -- Description: Production alignment for [COMPONENT_NAME]
   
   -- Enable RLS on tables missing it
   ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;
   
   -- Create org isolation policies
   CREATE POLICY "org_isolation" ON [table_name]
     FOR ALL
     USING (org_id = (SELECT org_id FROM user_profiles WHERE auth_id = auth.uid()));
   
   -- Add missing indexes
   CREATE INDEX IF NOT EXISTS idx_[table]_[column] ON [table]([column]);
   ```

3. **Seed Data** (for testing)
   - Create realistic test data for all roles
   - Ensure test data respects multi-tenancy

---

### Phase 3: Server Actions Implementation (45 minutes)

**Standard Server Action Pattern:**
```typescript
'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// ============================================================================
// Validation Schema
// ============================================================================

const createEntitySchema = z.object({
  // Define all fields with proper validation
});

// ============================================================================
// Types
// ============================================================================

export type ActionResult<T = unknown> = 
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string }; fieldErrors?: Record<string, string[]> };

// ============================================================================
// Create Action
// ============================================================================

export async function createEntity(input: unknown): Promise<ActionResult<Entity>> {
  // 1. Validate input
  const validation = createEntitySchema.safeParse(input);
  if (!validation.success) {
    return { 
      success: false, 
      error: { code: 'VALIDATION_ERROR', message: validation.error.errors[0].message },
      fieldErrors: validation.error.flatten().fieldErrors 
    };
  }

  // 2. Get authenticated user and org context
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } };
  }

  // 3. Get user's org_id
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('org_id')
    .eq('auth_id', user.id)
    .single();

  if (!profile) {
    return { success: false, error: { code: 'NO_PROFILE', message: 'User profile not found' } };
  }

  // 4. Perform database operation with org_id
  const adminSupabase = createAdminClient();
  const { data, error } = await adminSupabase
    .from('entities')
    .insert({
      ...validation.data,
      org_id: profile.org_id,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Create entity error:', error);
    return { success: false, error: { code: 'DB_ERROR', message: 'Failed to create entity' } };
  }

  // 5. Log audit event
  await adminSupabase.from('audit_logs').insert({
    table_name: 'entities',
    action: 'INSERT',
    record_id: data.id,
    user_id: user.id,
    user_email: user.email,
    org_id: profile.org_id,
    new_values: data,
    severity: 'info',
  });

  // 6. Revalidate cache and return
  revalidatePath('/path/to/list');
  return { success: true, data };
}

// ============================================================================
// Read Actions (List, Get by ID)
// ============================================================================

export async function listEntities(): Promise<ActionResult<Entity[]>> {
  const supabase = await createClient();
  
  // RLS automatically filters by org_id
  const { data, error } = await supabase
    .from('entities')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    return { success: false, error: { code: 'DB_ERROR', message: 'Failed to fetch entities' } };
  }

  return { success: true, data: data || [] };
}

// ============================================================================
// Update Action
// ============================================================================

export async function updateEntity(id: string, input: unknown): Promise<ActionResult<Entity>> {
  // Similar pattern with validation, auth check, org_id verification
}

// ============================================================================
// Delete Action (Soft Delete)
// ============================================================================

export async function deleteEntity(id: string): Promise<ActionResult<void>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Soft delete
  const { error } = await supabase
    .from('entities')
    .update({ 
      deleted_at: new Date().toISOString(),
      updated_by: user?.id 
    })
    .eq('id', id);

  if (error) {
    return { success: false, error: { code: 'DB_ERROR', message: 'Failed to delete entity' } };
  }

  revalidatePath('/path/to/list');
  return { success: true, data: undefined };
}
```

---

### Phase 4: UI Component Integration (45 minutes)

**Tasks:**
1. **Replace Mock Data with Server Actions**
   ```typescript
   // Before (mock)
   const [users, setUsers] = useState(MOCK_USERS);
   
   // After (real)
   const [users, setUsers] = useState<User[]>([]);
   const [loading, setLoading] = useState(true);
   
   useEffect(() => {
     async function loadUsers() {
       const result = await listUsers();
       if (result.success) setUsers(result.data);
       setLoading(false);
     }
     loadUsers();
   }, []);
   ```

2. **Wire Up Form Submissions**
   ```typescript
   async function handleSubmit(formData: FormData) {
     setSubmitting(true);
     const result = await createEntity({
       field1: formData.get('field1'),
       field2: formData.get('field2'),
     });
     
     if (result.success) {
       toast.success('Created successfully!');
       router.push('/list');
     } else {
       toast.error(result.error.message);
       if (result.fieldErrors) {
         // Set form field errors
       }
     }
     setSubmitting(false);
   }
   ```

3. **Add Loading & Error States**
   ```tsx
   if (loading) return <LoadingSpinner />;
   if (error) return <ErrorMessage message={error} />;
   if (data.length === 0) return <EmptyState />;
   ```

---

### Phase 5: Playwright E2E Test Creation (60 minutes)

**Test File Structure:**
```typescript
// tests/e2e/[component]-workflows.spec.ts

import { test, expect } from '@playwright/test';

// ============================================================================
// Test Configuration
// ============================================================================

const TEST_USERS = {
  admin: {
    email: 'admin@intime-test.com',
    password: 'TestAdmin123!',
    role: 'admin',
  },
  hr: {
    email: 'hr@intime-test.com',
    password: 'TestHR123!',
    role: 'hr_manager',
  },
  recruiter: {
    email: 'recruiter@intime-test.com',
    password: 'TestRecruiter123!',
    role: 'recruiter',
  },
  // ... more roles
};

// ============================================================================
// Helper Functions
// ============================================================================

async function login(page: Page, user: typeof TEST_USERS.admin) {
  await page.goto('/login');
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', user.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(dashboard|employee)/);
}

async function logout(page: Page) {
  await page.click('[data-testid="user-menu"]');
  await page.click('[data-testid="logout-button"]');
  await page.waitForURL('/login');
}

// ============================================================================
// Test Suite: [COMPONENT_NAME]
// ============================================================================

test.describe('[COMPONENT_NAME] Workflows', () => {
  
  // --------------------------------------------------------------------------
  // Authentication Tests
  // --------------------------------------------------------------------------
  
  test.describe('Access Control', () => {
    test('unauthorized user cannot access admin pages', async ({ page }) => {
      await login(page, TEST_USERS.recruiter);
      await page.goto('/employee/admin/dashboard');
      // Should redirect or show access denied
      await expect(page.locator('text=Access Denied')).toBeVisible();
    });
    
    test('admin can access all admin pages', async ({ page }) => {
      await login(page, TEST_USERS.admin);
      await page.goto('/employee/admin/dashboard');
      await expect(page.locator('h1:has-text("Admin Console")')).toBeVisible();
    });
  });
  
  // --------------------------------------------------------------------------
  // CRUD Workflow Tests
  // --------------------------------------------------------------------------
  
  test.describe('Create Workflow', () => {
    test('admin can create a new user', async ({ page }) => {
      await login(page, TEST_USERS.admin);
      await page.goto('/employee/admin/dashboard');
      
      // Navigate to user management
      await page.click('button:has-text("User Management")');
      
      // Click create new user
      await page.click('button:has-text("Create New User")');
      
      // Fill form
      await page.fill('input[name="fullName"]', 'Test User');
      await page.fill('input[name="email"]', `testuser-${Date.now()}@test.com`);
      await page.selectOption('select[name="role"]', 'recruiter');
      
      // Submit
      await page.click('button:has-text("Create User")');
      
      // Verify success
      await expect(page.locator('text=User created successfully')).toBeVisible();
      
      // Verify user appears in list
      await expect(page.locator('text=Test User')).toBeVisible();
    });
  });
  
  test.describe('Read Workflow', () => {
    test('can view list of entities', async ({ page }) => {
      await login(page, TEST_USERS.admin);
      await page.goto('/list-page');
      
      // Verify data loads
      await expect(page.locator('[data-testid="entity-list"]')).toBeVisible();
      
      // Verify pagination works
      await page.click('[data-testid="next-page"]');
      await expect(page.locator('[data-testid="page-indicator"]')).toContainText('Page 2');
    });
    
    test('can search and filter', async ({ page }) => {
      await login(page, TEST_USERS.admin);
      await page.goto('/list-page');
      
      // Search
      await page.fill('input[placeholder="Search"]', 'specific term');
      await expect(page.locator('[data-testid="entity-list"] > div')).toHaveCount(1);
    });
  });
  
  test.describe('Update Workflow', () => {
    test('can edit existing entity', async ({ page }) => {
      await login(page, TEST_USERS.admin);
      await page.goto('/entity/existing-id');
      
      // Click edit
      await page.click('button:has-text("Edit")');
      
      // Modify field
      await page.fill('input[name="fieldName"]', 'Updated Value');
      
      // Save
      await page.click('button:has-text("Save Changes")');
      
      // Verify update
      await expect(page.locator('text=Updated successfully')).toBeVisible();
      await expect(page.locator('text=Updated Value')).toBeVisible();
    });
  });
  
  test.describe('Delete Workflow', () => {
    test('can soft delete entity', async ({ page }) => {
      await login(page, TEST_USERS.admin);
      await page.goto('/list-page');
      
      const initialCount = await page.locator('[data-testid="entity-item"]').count();
      
      // Click delete on first item
      await page.click('[data-testid="entity-item"]:first-child [data-testid="delete-button"]');
      
      // Confirm deletion
      await page.click('button:has-text("Confirm Delete")');
      
      // Verify removed from list
      await expect(page.locator('[data-testid="entity-item"]')).toHaveCount(initialCount - 1);
    });
  });
  
  // --------------------------------------------------------------------------
  // Multi-Tenancy Isolation Tests (CRITICAL)
  // --------------------------------------------------------------------------
  
  test.describe('Multi-Tenancy Isolation', () => {
    test('org A cannot see org B data', async ({ page, browser }) => {
      // Login as Org A user
      await login(page, TEST_USERS.orgA_user);
      await page.goto('/list-page');
      
      const orgAData = await page.locator('[data-testid="entity-item"]').allTextContents();
      
      // Logout and login as Org B user
      await logout(page);
      await login(page, TEST_USERS.orgB_user);
      await page.goto('/list-page');
      
      const orgBData = await page.locator('[data-testid="entity-item"]').allTextContents();
      
      // Verify no overlap
      for (const item of orgAData) {
        expect(orgBData).not.toContain(item);
      }
    });
  });
  
  // --------------------------------------------------------------------------
  // Database Sync Verification
  // --------------------------------------------------------------------------
  
  test.describe('Database Sync', () => {
    test('UI reflects database state after create', async ({ page }) => {
      await login(page, TEST_USERS.admin);
      
      // Create entity via UI
      await page.goto('/create-form');
      await page.fill('input[name="name"]', 'DB Sync Test Entity');
      await page.click('button:has-text("Create")');
      
      // Refresh page
      await page.reload();
      
      // Verify entity persists
      await expect(page.locator('text=DB Sync Test Entity')).toBeVisible();
    });
    
    test('concurrent edits are handled', async ({ page, browser }) => {
      // Open same entity in two browser contexts
      const context1 = await browser.newContext();
      const context2 = await browser.newContext();
      const page1 = await context1.newPage();
      const page2 = await context2.newPage();
      
      await login(page1, TEST_USERS.admin);
      await login(page2, TEST_USERS.admin);
      
      // Both navigate to same entity
      await page1.goto('/entity/same-id');
      await page2.goto('/entity/same-id');
      
      // Edit on page1
      await page1.fill('input[name="field"]', 'Edit from Page 1');
      await page1.click('button:has-text("Save")');
      
      // Edit on page2 (should handle conflict)
      await page2.fill('input[name="field"]', 'Edit from Page 2');
      await page2.click('button:has-text("Save")');
      
      // Verify conflict handling (either optimistic lock or last-write-wins)
      // Based on your implementation
    });
  });
});
```

---

### Phase 6: Verification & Signoff (15 minutes)

**Checklist for each component:**

```markdown
## [COMPONENT_NAME] Production Readiness Checklist

### Database
- [ ] All tables have RLS enabled
- [ ] RLS policies properly filter by org_id
- [ ] Audit trail fields present (created_at, updated_at, created_by, updated_by, deleted_at)
- [ ] Indexes on foreign keys
- [ ] Soft delete implemented (no hard deletes)
- [ ] Seed data created for testing

### Server Actions
- [ ] Zod validation on all inputs
- [ ] Discriminated union error handling
- [ ] org_id filtering in all queries
- [ ] Audit log entries on mutations
- [ ] Cache revalidation after mutations

### UI Components
- [ ] Forms use server actions (no mock submissions)
- [ ] Loading states implemented
- [ ] Error states with user-friendly messages
- [ ] Empty states for lists
- [ ] Toast notifications for actions
- [ ] Accessibility (keyboard nav, ARIA labels)

### E2E Tests
- [ ] Login/logout flows
- [ ] CRUD operations
- [ ] Role-based access control
- [ ] Multi-tenancy isolation
- [ ] Form validation
- [ ] Database sync verification

### Documentation
- [ ] API documentation updated
- [ ] User workflows documented
- [ ] Test scenarios documented
```

---

## 🔧 Component-Specific Instructions

### 1. Authentication & Access Control

**Scope:**
- Files: `src/app/actions/auth.ts`, `src/app/login/page.tsx`, `src/app/auth/**`
- Schema: `user_profiles`, `roles`, `permissions`, `user_roles`, `role_permissions`
- Components: Login forms, signup forms, role displays

**Key Tests:**
```typescript
test('new user signup creates profile and assigns role', async ({ page }) => {
  // Test the full signup flow
});

test('user cannot access pages without proper role', async ({ page }) => {
  // Test role-based routing
});

test('session persists across page navigation', async ({ page }) => {
  // Test auth state persistence
});
```

**Admin Actions to Implement:**
- `createUser(email, role, orgId)` - Admin creates user
- `updateUserRole(userId, newRole)` - Change user role
- `deactivateUser(userId)` - Soft delete/disable user
- `listUsersByOrg()` - List all users in org
- `listRoles()` - List available roles
- `assignPermission(roleId, permissionId)` - Manage permissions

---

### 2. Admin Console

**Scope:**
- Pages: `src/app/employee/admin/**`
- Components: `src/components/admin/**`
- Schema: `user_profiles`, `roles`, `permissions`, `organizations`, `audit_logs`

**Key Workflows:**
1. **User Management**
   - Create new employee/user
   - Edit user profile
   - Assign/change roles
   - Deactivate user

2. **Role & Permission Management**
   - View role hierarchy
   - Assign permissions to roles
   - Create custom roles

3. **Audit Logs**
   - View system activity
   - Filter by user, action, date
   - Export logs

4. **System Settings**
   - Organization settings
   - Subscription management
   - Feature flags

**Actions to Implement:**
```typescript
// User Management
createUser, updateUser, deleteUser, listUsers, getUserById

// Role Management
createRole, updateRole, listRoles, assignRoleToUser, removeRoleFromUser

// Permission Management
assignPermissionToRole, removePermissionFromRole, listPermissions

// Audit
getAuditLogs, exportAuditLogs

// Settings
getOrgSettings, updateOrgSettings
```

---

### 3. HR Module

**Scope:**
- Pages: `src/app/employee/hr/**`
- Schema: `employee_metadata`, `pods`, `payroll_runs`, `payroll_items`, `performance_reviews`, `time_attendance`, `pto_balances`

**Key Workflows:**
1. **People Management**
   - Add new team member
   - Update employee info
   - Assign to pod
   - View org chart

2. **Hiring Process**
   - Post internal job
   - Track applicants
   - Manage offers
   - Onboarding checklist

3. **Payroll**
   - Create payroll run
   - Review and approve
   - Track history

4. **Performance**
   - Create review cycle
   - Complete reviews
   - Goal tracking

5. **Time & Attendance**
   - Log time
   - Approve timesheets
   - PTO requests

**Actions to Implement:**
```typescript
// People
createEmployee, updateEmployee, listEmployees, getEmployeeById, assignToPod

// Pods
createPod, updatePod, listPods, getPodPerformance

// Payroll
createPayrollRun, approvePayrollRun, listPayrollRuns, getPayrollDetails

// Reviews
createReview, submitReview, acknowledgeReview, listReviews

// Time
logTime, approveTimesheet, getPtoBalance, requestPto, approvePto
```

---

### 4. Talent Acquisition / Sales

**Scope:**
- Pages: `src/app/employee/ta/**`
- Schema: `campaigns`, `campaign_contacts`, `engagement_tracking`, `leads`, `accounts`, `deals`

**Key Workflows:**
1. **Lead Management**
   - Source new leads
   - Qualify leads
   - Convert to opportunity

2. **Campaign Management**
   - Create outreach campaign
   - Track engagement
   - A/B testing

3. **Deal Pipeline**
   - Create opportunities
   - Track stages
   - Close deals

**Actions to Implement:**
```typescript
// Leads
createLead, updateLead, qualifyLead, convertLead, listLeads

// Campaigns
createCampaign, launchCampaign, pauseCampaign, getCampaignAnalytics
addContactToCampaign, trackEngagement

// Deals
createDeal, updateDealStage, closeDeal, listDeals
```

---

### 5. Recruiting

**Scope:**
- Pages: `src/app/employee/recruiting/**`
- Schema: `jobs`, `submissions`, `interviews`, `offers`, `placements`, `accounts`

**Key Workflows:**
1. **Job Management**
   - Post new job
   - Edit job details
   - Close/fill job

2. **Candidate Pipeline**
   - Source candidates
   - Screen submissions
   - Schedule interviews
   - Track progress

3. **Account Management**
   - Create client account
   - Manage contacts
   - Track account health

4. **Submission Workflow**
   - Sourcing → Screening → Submit → Interview → Offer → Placement

**Actions to Implement:**
```typescript
// Jobs
createJob, updateJob, listJobs, getJobById, closeJob

// Submissions
createSubmission, updateSubmissionStatus, getSubmission, listSubmissionsByJob

// Interviews
scheduleInterview, updateInterviewFeedback, listInterviews

// Offers
createOffer, sendOffer, updateOfferStatus, listOffers

// Placements
createPlacement, updatePlacement, listPlacements

// Accounts
createAccount, updateAccount, listAccounts
```

---

### 6. Bench Sales

**Scope:**
- Pages: `src/app/employee/bench/**`
- Schema: `bench_metadata`, `external_jobs`, `job_sources`, `bench_submissions`, `hotlists`, `immigration_cases`

**Key Workflows:**
1. **Bench Talent Management**
   - Track consultants on bench
   - Monitor days on bench (30/60 day alerts)
   - Update availability

2. **External Job Sourcing**
   - Configure job sources
   - View scraped jobs
   - Match candidates to jobs

3. **Submission Pipeline**
   - Submit to vendors
   - Track vendor feedback
   - Close placements

4. **Hotlist Management**
   - Create hotlist
   - Send to vendor lists
   - Track responses

5. **Immigration**
   - Track visa status
   - Manage cases
   - Alert on deadlines

**Actions to Implement:**
```typescript
// Bench
getBenchConsultants, updateBenchStatus, sendBenchAlert

// External Jobs
listExternalJobs, matchJobToCandidate, ignoreJob

// Submissions
createBenchSubmission, updateSubmissionStatus, listBenchSubmissions

// Hotlists
createHotlist, sendHotlist, trackHotlistResponse

// Immigration
createImmigrationCase, updateCaseStatus, getUpcomingDeadlines
```

---

## 🧪 Running Tests

```bash
# Create test users first (run once)
pnpm tsx scripts/seed-test-users.ts

# Run all E2E tests
pnpm playwright test

# Run specific component tests
pnpm playwright test tests/e2e/auth-workflows.spec.ts
pnpm playwright test tests/e2e/admin-workflows.spec.ts
pnpm playwright test tests/e2e/hr-workflows.spec.ts
pnpm playwright test tests/e2e/ta-workflows.spec.ts
pnpm playwright test tests/e2e/recruiting-workflows.spec.ts
pnpm playwright test tests/e2e/bench-workflows.spec.ts

# Run with UI mode for debugging
pnpm playwright test --ui

# Run headed (visible browser)
pnpm playwright test --headed

# Generate HTML report
pnpm playwright show-report
```

---

## 📊 Success Metrics

For each component, verify:

1. **100% Database Coverage** - All CRUD operations hit the database
2. **Zero Mock Data in Production** - All UI shows real data
3. **Multi-Tenancy Verified** - Cross-org data leakage impossible
4. **Role-Based Access Working** - Users see only what they should
5. **All Forms Validated** - Zod validation on client and server
6. **Audit Trail Complete** - All mutations logged
7. **E2E Tests Passing** - All workflow tests green

---

## 🚨 Critical Reminders

1. **NEVER skip RLS** - Every table needs row-level security
2. **NEVER hard delete** - Always use soft delete (deleted_at)
3. **NEVER trust client input** - Always validate with Zod on server
4. **NEVER expose org_id in URL** - Get from auth context
5. **ALWAYS log mutations** - Audit trail is non-negotiable
6. **ALWAYS test isolation** - Multi-tenancy tests are critical

---

## 🔄 Iteration Command

After completing analysis, use this command pattern:

```
Execute Phase [N] for [COMPONENT_NAME]:

Current Status:
- Phase 1 (Analysis): [Complete/In Progress]
- Phase 2 (Database): [Complete/In Progress]  
- Phase 3 (Server Actions): [Complete/In Progress]
- Phase 4 (UI Integration): [Complete/In Progress]
- Phase 5 (E2E Tests): [Complete/In Progress]
- Phase 6 (Verification): [Complete/In Progress]

Blockers: [List any blockers]
Next Action: [Specific next step]
```

---

## 📝 Starting Point

Begin with:

```
@workflow Execute Phase 1: Deep Analysis for Authentication & Access Control

Focus areas:
1. Review src/app/actions/auth.ts - current signup/signin flow
2. Review src/lib/db/schema/rbac.ts - roles, permissions, user_roles
3. Review src/lib/db/schema/user-profiles.ts - user data model
4. List all auth-related UI pages
5. Identify gaps between database schema and UI functionality
6. Document what's currently mocked vs database-connected
```







