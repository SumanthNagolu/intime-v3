---
date: 2025-12-07T11:30:00-08:00
researcher: Claude
git_commit: e61af168bab02daa1b176f20e120cf9570751f4a
branch: main
repository: intime-v3
topic: "Accounts Tab - Navigation, Routes, Wizard, and Health Dashboard"
tags: [research, codebase, accounts, navigation, crm, recruiting]
status: complete
last_updated: 2025-12-07
last_updated_by: Claude
---

# Research: Accounts Tab - Navigation, Routes, Wizard, and Health Dashboard

**Date**: 2025-12-07T11:30:00-08:00
**Researcher**: Claude
**Git Commit**: e61af168bab02daa1b176f20e120cf9570751f4a
**Branch**: main
**Repository**: intime-v3

## Research Question
User reports multiple issues with Accounts Tab:
1. Dropdown disappearing too easily when hovering
2. Search accounts not working within dropdown
3. Account Health page showing "Account not found"
4. Create new account opening popup instead of wizard
5. Cannot open individual accounts - shows "Account not found"
6. Need to fix all screens/pages and complete Account wizard/workspace

## Summary

The Accounts module has several structural issues stemming from **missing route handlers** for navigation destinations. The navigation configuration defines routes that don't exist as pages, causing the dynamic `[id]` route to incorrectly catch these paths.

### Key Findings

| Issue | Root Cause | Location |
|-------|-----------|----------|
| Account Health "not found" | No `/accounts/health` route exists | `src/lib/navigation/top-navigation.ts:40` points to missing route |
| Create Account opens modal | `accounts/new` caught by `[id]` route, but button triggers modal | `src/app/employee/recruiting/accounts/page.tsx:87` |
| Individual accounts "not found" | tRPC query fails to find account by ID | `src/server/routers/crm.ts:84-102` |
| Dropdown disappearing | `onMouseLeave` closes dropdown immediately | `src/components/navigation/TopNavigation.tsx:248` |
| No search in dropdown | Search is just a link, not functional search box | `top-navigation.ts:35` |

---

## Detailed Findings

### 1. Navigation Dropdown Component

**File**: `src/components/navigation/TopNavigation.tsx`

**Hover Behavior (Lines 240-248)**:
```typescript
onMouseEnter={() => {
  if (!menuItemRefs.current[tab.id]) {
    menuItemRefs.current[tab.id] = []
  }
  setActiveDropdown(tab.id)
}}
onMouseLeave={() => setActiveDropdown(null)}
```

The dropdown opens on `onMouseEnter` (line 246) and closes immediately on `onMouseLeave` (line 248). There is no delay or buffer zone, which can cause the dropdown to close when the user moves their mouse towards dropdown items (especially when the mouse briefly exits the trigger element).

**Dropdown Positioning (Line 286)**:
```typescript
className="absolute left-0 top-full mt-1 w-64 bg-white rounded-lg..."
```
The `mt-1` creates a 4px gap between the trigger and dropdown, which can cause the `onMouseLeave` to fire when crossing this gap.

---

### 2. Accounts Navigation Configuration

**File**: `src/lib/navigation/top-navigation.ts`

**Accounts Tab Configuration (Lines 28-44)**:
```typescript
{
  id: 'accounts',
  label: 'Accounts',
  entityType: 'account',
  icon: Building2,
  defaultHref: '/employee/recruiting/accounts',
  dropdown: [
    { id: 'search-accounts', label: 'Search Accounts', icon: Search, href: '/employee/recruiting/accounts', type: 'link' },
    { id: 'recent-accounts', label: 'Recent Accounts', type: 'recent' },
    { id: 'divider-1', label: '', type: 'divider' },
    { id: 'my-accounts', label: 'My Accounts', icon: Users, href: '/employee/recruiting/accounts?owner=me', type: 'link' },
    { id: 'active-accounts', label: 'Active Accounts', icon: CheckCircle, href: '/employee/recruiting/accounts?status=active', type: 'link' },
    { id: 'account-health', label: 'Account Health', icon: Gauge, href: '/employee/recruiting/accounts/health', type: 'link' },
    { id: 'divider-2', label: '', type: 'divider' },
    { id: 'new-account', label: 'Create Account', icon: Plus, href: '/employee/recruiting/accounts/new', type: 'link' },
  ],
}
```

**Configured Routes vs Existing Routes**:

| Configured Route | Exists? | Notes |
|------------------|---------|-------|
| `/employee/recruiting/accounts` | YES | Main list page |
| `/employee/recruiting/accounts?owner=me` | PARTIAL | Page exists but filter may not work |
| `/employee/recruiting/accounts?status=active` | PARTIAL | Page exists but filter may not work |
| `/employee/recruiting/accounts/health` | NO | Caught by `[id]` route |
| `/employee/recruiting/accounts/new` | NO | Caught by `[id]` route |

---

### 3. Account Routes and Page Files

**Existing Routes**:

| Route File | Path | Purpose |
|------------|------|---------|
| `src/app/employee/recruiting/accounts/page.tsx` | `/employee/recruiting/accounts` | Account list page |
| `src/app/employee/recruiting/accounts/[id]/page.tsx` | `/employee/recruiting/accounts/:id` | Account detail page |
| `src/app/employee/recruiting/accounts/[id]/layout.tsx` | `/employee/recruiting/accounts/:id/*` | Layout for detail pages |

**Missing Routes**:

| Missing Route | Purpose |
|---------------|---------|
| `/employee/recruiting/accounts/health/page.tsx` | Account Health Dashboard |
| `/employee/recruiting/accounts/new/page.tsx` | Account Creation Wizard |
| `/employee/recruiting/accounts/[id]/edit/page.tsx` | Account Edit Page |

**Route Conflict**: When navigating to `/accounts/health`, Next.js matches it to `[id]/page.tsx` with `id = "health"`, which then queries the database for an account with ID "health" and fails.

---

### 4. Account Detail Page

**File**: `src/app/employee/recruiting/accounts/[id]/page.tsx`

**Data Fetching (Line 86)**:
```typescript
const accountQuery = trpc.crm.accounts.getById.useQuery({ id: accountId })
```

**Loading/Error State (Lines 160-166)**:
```typescript
if (accountQuery.isLoading || !account) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
    </div>
  )
}
```

The page shows a loader when `!account` is true, but if the query errors (account not found), the error state is not properly shown to users - it just keeps loading.

**Layout Error Handling**: `src/app/employee/recruiting/accounts/[id]/layout.tsx` provides `EntityContextProvider`, `EntityContentSkeleton`, and `EntityContentError` components, but the page implementation doesn't utilize them properly.

---

### 5. Account Wizard vs Modal

**Current Implementation**:

The "NEW ACCOUNT" button opens `CreateAccountDialog` (a modal), not a full-page wizard.

**Accounts List Page (Lines 87-90)**:
```typescript
<Button onClick={() => setCreateDialogOpen(true)}>
  <Plus className="w-4 h-4 mr-2" />
  New Account
</Button>
```

**CreateAccountDialog**: `src/components/recruiting/accounts/CreateAccountDialog.tsx`
- 3-step modal wizard (Lines 34, 90)
- Step 1: Company Basics (Lines 327-454)
- Step 2: Billing & Terms (Lines 457-569)
- Step 3: Primary Contact (Lines 572-658)

**OnboardingWizardDialog**: `src/components/recruiting/accounts/OnboardingWizardDialog.tsx`
- 6-step wizard for onboarding existing accounts
- Triggered from account detail page when onboarding not completed

**Sidebar Quick Action Button (Lines 505-509 in detail page)**:
```typescript
<Button
  size="sm"
  variant="outline"
  className="w-full mt-2"
  onClick={() => setOnboardingWizardOpen(true)}
>
  <CheckCircle className="w-4 h-4 mr-2" />
  Start Onboarding
</Button>
```

---

### 6. tRPC Account Routers

**File**: `src/server/routers/crm.ts`

**Key Procedures**:

| Procedure | Lines | Description |
|-----------|-------|-------------|
| `list` | 26-81 | List accounts with search/filter/pagination |
| `getById` | 84-102 | Get single account by UUID |
| `getHealth` | 105-175 | Get account health scores and summary |
| `getMy` | 178-211 | Get current user's accounts |
| `create` | 214-328 | Create new account |
| `update` | 331-438 | Update existing account |
| `updateStatus` | 441-466 | Quick status update |
| `completeOnboarding` | 469-591 | Complete onboarding wizard |

**getById Implementation (Lines 84-102)**:
```typescript
getById: orgProtectedProcedure
  .input(z.object({ id: z.string().uuid() }))
  .query(async ({ ctx, input }) => {
    const supabase = getAdminClient()
    const { data: account, error } = await supabase
      .from('accounts')
      .select('*, owner:user_profiles!owner_id(id, full_name, avatar_url), contacts(*), jobs(id, title, status)')
      .eq('id', input.id)
      .eq('org_id', ctx.orgId)
      .single()

    if (error) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Account not found' })
    }
    return account
  })
```

**Issue**: The input expects a valid UUID (`z.string().uuid()`). When "health" or "new" is passed as the ID, Zod validation fails before even querying the database.

**getHealth Implementation (Lines 105-175)**:
- Returns account health data with calculated scores
- Health Score Calculation (Lines 142-155):
  - Base score: 100
  - No contact >14 days: -30 points
  - No contact 7-14 days: -15 points
  - No active jobs: -20 points
  - NPS < 7: -20 points
  - No revenue: -10 points

---

### 7. Account Health Screen

**No dedicated screen definition exists.** The "Account Health" navigation item at `top-navigation.ts:40` links to `/employee/recruiting/accounts/health`, but:

1. No route handler exists at `src/app/employee/recruiting/accounts/health/page.tsx`
2. The path is caught by `[id]/page.tsx` which treats "health" as an account ID
3. The tRPC `getHealth` procedure exists but is not exposed via a dedicated page

**Existing Health Integration**:
- Account list page fetches health data: `src/app/employee/recruiting/accounts/page.tsx:60`
- Health summary cards displayed in list page (Lines 93-141)
- Health data joined to accounts in table (Line 212)

---

## Code References

### Navigation
- `src/lib/navigation/top-navigation.ts:28-44` - Accounts tab dropdown configuration
- `src/components/navigation/TopNavigation.tsx:240-248` - Dropdown hover behavior
- `src/components/navigation/TopNavigation.tsx:283-372` - Dropdown menu rendering

### Routes
- `src/app/employee/recruiting/accounts/page.tsx` - Account list page
- `src/app/employee/recruiting/accounts/[id]/page.tsx` - Account detail page
- `src/app/employee/recruiting/accounts/[id]/layout.tsx` - Account detail layout

### Components
- `src/components/recruiting/accounts/CreateAccountDialog.tsx` - 3-step creation modal
- `src/components/recruiting/accounts/OnboardingWizardDialog.tsx` - 6-step onboarding wizard
- `src/components/recruiting/accounts/LogActivityDialog.tsx` - Log activity modal
- `src/components/recruiting/accounts/AddContactDialog.tsx` - Add contact modal

### tRPC
- `src/server/routers/crm.ts:26-81` - `crm.accounts.list` procedure
- `src/server/routers/crm.ts:84-102` - `crm.accounts.getById` procedure
- `src/server/routers/crm.ts:105-175` - `crm.accounts.getHealth` procedure
- `src/server/routers/crm.ts:214-328` - `crm.accounts.create` procedure

### Archived Screen Definitions
- `.archive/ui-reference/screens/crm/account-list.screen.ts` - Metadata-driven list screen (not in use)
- `.archive/ui-reference/screens/crm/account-detail.screen.ts` - Metadata-driven detail screen (not in use)
- `.archive/ui-reference/screens/crm/account-form.screen.ts` - Metadata-driven wizard (not in use)

---

## Architecture Documentation

### Current Account Flow

```
User Navigation
├── Accounts Tab Click → /employee/recruiting/accounts (list page)
├── Search Accounts → /employee/recruiting/accounts (same page)
├── My Accounts → /employee/recruiting/accounts?owner=me (filtered list)
├── Active Accounts → /employee/recruiting/accounts?status=active (filtered list)
├── Account Health → /employee/recruiting/accounts/health (404 - caught by [id])
├── Create Account → /employee/recruiting/accounts/new (404 - caught by [id])
└── Account Row Click → /employee/recruiting/accounts/{uuid} (detail page)

Account Creation
├── "New Account" Button (page.tsx:87) → Opens CreateAccountDialog modal
├── CreateAccountDialog (3 steps) → trpc.crm.accounts.create
└── On Success → Navigate to /employee/recruiting/accounts/{newId}

Account Detail
├── Dynamic route [id]/page.tsx
├── Fetches via trpc.crm.accounts.getById
├── Tabs: Overview, Contacts, Activities, Meetings, Notes, Escalations
└── Actions: Edit, Add Contact, Log Activity, Create Job, Onboarding
```

### Query Filter Support

**Account List Query Params** (page.tsx:53-57):
```typescript
const accountsQuery = trpc.crm.accounts.list.useQuery({
  search: search || undefined,
  status: statusFilter as 'active' | 'inactive' | 'prospect' | 'all',
  limit: 50,
})
```

The `owner` parameter from URL (`?owner=me`) is **not implemented** - the page doesn't read URL params to filter by owner.

---

## Related Research
- No prior research documents found on this topic

## Open Questions

1. Should `/accounts/health` be a separate page or integrated into the main list?
2. Should "Create Account" use a full-page wizard or keep the modal approach?
3. Are the archived metadata-driven screens intended to replace current implementations?
4. What is the expected behavior for "Search Accounts" in dropdown - inline search or navigation?
