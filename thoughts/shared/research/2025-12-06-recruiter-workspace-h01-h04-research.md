# Recruiter Workspace Implementation Research (H01-H04)

## Metadata
- **Date**: 2025-12-06
- **Commit**: 5b62b20
- **Branch**: main
- **Scope**: H01 (Daily Workflow), H02 (Log Activity), H03 (Recruiter Dashboard), H04 (Recruiter Reports)
- **Type**: Codebase research (no implementation plan)

---

## 1. Requirement Summary

### H01 - Daily Workflow
The recruiter's daily workflow focuses on:
- Morning dashboard review (pipeline health, performance metrics)
- Working active pipeline (follow-ups, scheduling, offers)
- Business development activities (leads, calls, meetings)
- End-of-day review (log activities, plan tomorrow)

### H02 - Log Activity
Activity logging modal with fields:
- Activity type (call, email, meeting, note, task)
- Entity association (account, lead, deal, job, candidate, placement)
- Outcome/result options
- Follow-up scheduling
- Notes with rich text
- RCAI ownership model

### H03 - Recruiter Dashboard
Widgets required:
- Sprint Progress (quota attainment, days remaining)
- Pipeline Health (submissions, interviews, offers, placements)
- Account Portfolio (top accounts, revenue, coverage)
- Quick Actions (common tasks)
- Activity Feed (recent activities with filters)
- Calendar View (today's schedule)
- Performance Trends (sparklines, comparisons)

### H04 - Recruiter Reports
Report templates:
- Performance Summary (production, quality, conversion rates)
- Revenue & Commission (billings, collections, forecast)
- Activity Report (calls, emails, meetings by period)
- Quality Metrics (falloff rate, fill rate, time-to-fill)

---

## 2. Existing Infrastructure

### 2.1 tRPC Routers (`src/server/trpc/root.ts:17-32`)

**14 Registered Routers:**
```typescript
export const appRouter = router({
  admin: adminRouter,
  pods: podsRouter,
  users: usersRouter,
  userManagement: userManagementRouter,
  permissions: permissionsRouter,
  settings: settingsRouter,
  integrations: integrationsRouter,
  hr: hrRouter,
  bench: benchRouter,
  activityPatterns: activityPatternsRouter,
  featureFlags: featureFlagsRouter,
  workflows: workflowsRouter,
  emailTemplates: emailTemplatesRouter,
  sla: slaRouter,
})
```

**MISSING for H01-H04:**
- `crm` router (accounts, leads, deals, campaigns)
- `activities` router (CRUD for activities)
- `reports` router (report generation, metrics)
- `recruiting`/`ats` router (jobs, submissions, interviews, placements)
- `dashboard` router (role-specific metrics)

### 2.2 Middleware Pattern (`src/server/trpc/middleware.ts:34-35`)

```typescript
export const protectedProcedure = publicProcedure.use(isAuthenticated)
export const orgProtectedProcedure = protectedProcedure.use(hasOrg)
```

All new routers should use `orgProtectedProcedure` for multi-tenant data access.

### 2.3 Dashboard Components

**Location:** `src/components/dashboard/`

| Component | File | Purpose |
|-----------|------|---------|
| StatsCard | `StatsCard.tsx` | Metric card with trend indicator |
| ActivityFeedWidget | `ActivityFeedWidget.tsx` | Recent activities display |
| QuickActionsWidget | `QuickActionsWidget.tsx` | Action buttons grid |
| DashboardShell | `DashboardShell.tsx` | Dashboard layout wrapper |

**Existing Stats Procedure Pattern** (`src/server/routers/hr.ts`):
```typescript
getStats: orgProtectedProcedure.query(async ({ ctx }) => {
  // Returns { total, pods, benefits_eligible, pending_reviews }
})
```

### 2.4 Navigation Configuration

**Active Config:** `src/lib/navigation/adminNavConfig.ts`
- Admin-only navigation currently active

**Archived Config:** `.archive/ui-reference/navigation/navConfig.ts:63-164`
- Full recruiter navigation exists but is archived
- Sections: Dashboard, Pipeline, Accounts, Leads & Deals, Candidates, Activities, Reports

**Sidebar Types** (`src/components/navigation/Sidebar.tsx:9-20`):
```typescript
export interface SidebarItem {
  label: string
  href?: string
  icon?: LucideIcon
  items?: SidebarItem[]
  badge?: string | number
}
export interface SidebarSection {
  title?: string
  items: SidebarItem[]
}
```

---

## 3. Database Schema

### 3.1 Activity Tables

**Primary Activity Table** (`supabase/migrations/20251201001000_workplan_activity_system.sql:294-365`):

```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY,
  org_id UUID REFERENCES organizations(id),
  title TEXT NOT NULL,
  description TEXT,
  activity_type activity_type NOT NULL,
  priority activity_priority DEFAULT 'normal',
  status activity_status DEFAULT 'pending',
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Entity association (polymorphic)
  entity_type TEXT,
  entity_id UUID,

  -- RCAI ownership
  responsible_user_id UUID,
  accountable_user_id UUID,
  consulted_user_ids UUID[],
  informed_user_ids UUID[],

  -- Metadata
  outcome TEXT,
  notes TEXT,
  follow_up_date TIMESTAMPTZ,
  follow_up_activity_id UUID,

  -- Workplan integration
  workplan_id UUID REFERENCES workplans(id),
  parent_activity_id UUID REFERENCES activities(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_by UUID
);
```

**Activity Types Enum:**
```sql
CREATE TYPE activity_type AS ENUM (
  'call', 'email', 'meeting', 'note', 'task',
  'follow_up', 'interview', 'submission', 'placement'
);
```

**Related Tables:**
| Table | Purpose |
|-------|---------|
| `activity_reminders` | Due date reminders |
| `activity_comments` | Thread comments |
| `activity_attachments` | File attachments |
| `activity_patterns` | Template definitions |
| `workplans` | Activity sequences |
| `workplan_steps` | Individual steps in workplan |

### 3.2 CRM Tables (`supabase/migrations/20251124000000_create_crm_module.sql`)

| Table | Key Fields |
|-------|------------|
| `accounts` | name, type, industry, status, owner_user_id |
| `account_contacts` | account_id, first_name, last_name, email, phone, is_primary |
| `leads` | account_id, source, status, qualified_at |
| `deals` | account_id, name, value, stage, probability, close_date |
| `campaigns` | name, type, status, budget, start_date, end_date |
| `activity_log` | entity_type, entity_id, activity_type, notes, created_by |

### 3.3 ATS Tables (`supabase/migrations/20251124010000_create_ats_module.sql`)

| Table | Key Fields |
|-------|------------|
| `jobs` | account_id, title, status, job_type, billing_rate |
| `candidates` | first_name, last_name, email, status, source |
| `submissions` | job_id, candidate_id, status, submitted_at |
| `interviews` | submission_id, scheduled_at, interview_type, status |
| `offers` | submission_id, salary, start_date, status |
| `placements` | submission_id, start_date, end_date, billing_rate |

### 3.4 HR Tables (`supabase/migrations/20251126000000_create_hr_module.sql`)

| Table | Key Fields |
|-------|------------|
| `employees` | user_id, department, title, hire_date, manager_id |
| `pods` | name, type, manager_id |
| `pod_members` | pod_id, employee_id, role |
| `performance_reviews` | employee_id, period, rating, goals |
| `commissions` | employee_id, placement_id, amount, status |

---

## 4. Archived Systems

### 4.1 Metadata Screen System

**Location:** `.archive/ui-reference/`

The metadata-driven screen system was fully archived:
- `metadata/types/screen.types.ts` - Screen definition types
- `metadata/types/widget.types.ts` - Widget/field types
- `metadata/renderers/` - Component renderers
- `screens/` - Screen definitions by module

**Rendering Pattern:**
```
ScreenRenderer → LayoutRenderer → SectionRenderer → WidgetRenderer
```

### 4.2 Activity Patterns Router

**Location:** `src/server/routers/activityPatterns.ts`

Existing procedures:
- `list` - List all patterns with filters
- `getById` - Get single pattern
- `create` - Create new pattern
- `update` - Update existing pattern
- `delete` - Soft delete pattern
- `duplicate` - Clone pattern

---

## 5. Gap Analysis

### 5.1 Missing tRPC Routers

| Router | Required For | Priority |
|--------|--------------|----------|
| `crm` | H01, H02, H03 | High |
| `activities` | H02, H03 | High |
| `dashboard` | H03 | High |
| `reports` | H04 | High |
| `ats`/`recruiting` | H01, H03 | High |

### 5.2 Missing Components

| Component | Spec Reference | Purpose |
|-----------|----------------|---------|
| SprintProgressWidget | H03 | Quota attainment |
| PipelineHealthWidget | H03 | Submission/interview/offer counts |
| AccountPortfolioWidget | H03 | Top accounts, revenue |
| PerformanceTrendsWidget | H03 | Sparklines, period comparison |
| CalendarWidget | H03 | Daily schedule view |
| LogActivityModal | H02 | Activity creation form |
| ReportBuilder | H04 | Report configuration |
| ReportViewer | H04 | Report display |

### 5.3 Missing Navigation

Recruiter navigation config needs to be created at:
`src/lib/navigation/recruiterNavConfig.ts`

Based on archived config, sections needed:
- Dashboard
- Pipeline (Jobs, Submissions, Interviews, Offers, Placements)
- Accounts & Contacts
- Leads & Deals
- Candidates
- Activities
- Reports

---

## 6. Existing Patterns to Follow

### 6.1 Router Pattern (`src/server/routers/hr.ts`)

```typescript
import { z } from 'zod'
import { router, orgProtectedProcedure } from '../trpc'
import { createClient } from '@/lib/supabase/server'

export const hrRouter = router({
  getStats: orgProtectedProcedure.query(async ({ ctx }) => {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('org_id', ctx.user.org_id)
    // ...
  }),

  list: orgProtectedProcedure
    .input(z.object({
      status: z.enum(['active', 'inactive']).optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      // ...
    }),
})
```

### 6.2 Dashboard Page Pattern (`src/app/employee/admin/page.tsx`)

```typescript
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { StatsCard } from '@/components/dashboard/StatsCard'

export default function AdminDashboard() {
  return (
    <DashboardShell>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="..." value={...} trend={...} />
      </div>
      {/* More widgets */}
    </DashboardShell>
  )
}
```

### 6.3 Modal Pattern (`src/components/ui/dialog.tsx`)

Uses Radix UI Dialog primitive with styling:
```typescript
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
```

---

## 7. File Reference Index

### Core Infrastructure
| File | Line | Description |
|------|------|-------------|
| `src/server/trpc/root.ts` | 17-32 | Router registration |
| `src/server/trpc/middleware.ts` | 34-35 | Auth middleware |
| `src/lib/navigation/adminNavConfig.ts` | - | Active nav config |

### Existing Routers
| File | Description |
|------|-------------|
| `src/server/routers/activityPatterns.ts` | Activity patterns CRUD |
| `src/server/routers/hr.ts` | HR/employees router |
| `src/server/routers/bench.ts` | Bench sales router |
| `src/server/routers/integrations.ts` | Integration management |

### Dashboard Components
| File | Description |
|------|-------------|
| `src/components/dashboard/StatsCard.tsx` | Metric display |
| `src/components/dashboard/ActivityFeedWidget.tsx` | Activity list |
| `src/components/dashboard/QuickActionsWidget.tsx` | Action buttons |
| `src/components/dashboard/DashboardShell.tsx` | Layout wrapper |

### Database Migrations
| File | Description |
|------|-------------|
| `supabase/migrations/20251201001000_workplan_activity_system.sql` | Activities schema |
| `supabase/migrations/20251124000000_create_crm_module.sql` | CRM tables |
| `supabase/migrations/20251124010000_create_ats_module.sql` | ATS tables |
| `supabase/migrations/20251126000000_create_hr_module.sql` | HR tables |
| `supabase/migrations/20251130211000_crm_complete_schema.sql` | Extended CRM |

### Archived Reference
| File | Description |
|------|-------------|
| `.archive/ui-reference/navigation/navConfig.ts` | Recruiter nav (archived) |
| `.archive/ui-reference/metadata/` | Screen metadata system |
| `.archive/ui-reference/screens/` | Screen definitions |

---

## 8. Key Insights

1. **Database schema is comprehensive** - All required tables for CRM, ATS, activities, and HR exist in migrations

2. **tRPC layer is incomplete** - Core business routers (crm, activities, ats, reports) are missing; only admin/system routers exist

3. **Navigation is admin-only** - Recruiter navigation was archived; needs to be recreated

4. **Metadata system archived** - The declarative screen system is archived but could be referenced for patterns

5. **Activity system is unified** - Tasks and activities share the same table with RCAI ownership model

6. **Dashboard widgets exist** - Basic StatsCard, ActivityFeed, QuickActions components are available

7. **Report infrastructure missing** - No report generation, template, or export system exists

8. **Follow established patterns** - Use `orgProtectedProcedure`, Supabase client, existing component patterns
