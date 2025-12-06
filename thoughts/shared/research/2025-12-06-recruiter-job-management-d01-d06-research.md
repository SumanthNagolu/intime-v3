---
date: 2025-12-06T15:08:42Z
researcher: Claude
git_commit: 5b62b20dddacb8f058d3e7f7447ee275588f985e
branch: main
repository: intime-v3
topic: "Recruiter Job Management (D01-D06): Create, Publish, Update, Pipeline, Status, Close"
tags: [research, codebase, jobs, recruiter, pipeline, ats, tRPC]
status: complete
last_updated: 2025-12-06
last_updated_by: Claude
---

# Research: Recruiter Job Management (D01-D06)

**Date**: 2025-12-06T15:08:42Z
**Researcher**: Claude
**Git Commit**: 5b62b20dddacb8f058d3e7f7447ee275588f985e
**Branch**: main
**Repository**: intime-v3

## Research Question

Research the codebase to understand how the job management system works for implementing the recruiter job management use cases:
- D01-create-job.md
- D02-publish-job.md
- D03-update-job.md
- D04-manage-pipeline.md
- D05-update-job-status.md
- D06-close-job.md

## Summary

The codebase has **partial implementation** of job management. The database schema is complete with the `jobs` table and related normalized tables. The tRPC router (`ats.ts`) has **only read operations** - no create, update, delete, or status change mutations exist. The recruiter workspace has UI structure but **no job forms or management screens**. Activities must be manually logged as the auto-activity engine is not implemented.

**Key Gaps for D01-D06 Implementation:**
1. No job creation mutation or form
2. No job update/edit mutation or form
3. No status transition mutation with validation
4. No pipeline management UI (kanban exists in archive only)
5. No job publishing mechanism
6. No job close wizard

---

## Detailed Findings

### 1. Jobs Database Schema

**Main Table: `jobs`**
- **File**: `supabase/migrations/20251124010000_create_ats_module.sql:64-122`
- **Indexes**: `supabase/migrations/20251124010000_create_ats_module.sql:124-132`
- **Triggers**: `supabase/migrations/20251124010000_create_ats_module.sql:134-152`
- **RLS Policies**: `supabase/migrations/20251124010000_create_ats_module.sql:529-565`

#### Core Columns

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | UUID | gen_random_uuid() | Primary key |
| `org_id` | UUID | NOT NULL | Multi-tenant isolation |
| `account_id` | UUID | FK → accounts | Client/company |
| `deal_id` | UUID | FK → deals | Sales deal |
| `title` | TEXT | NOT NULL | Job title |
| `description` | TEXT | | Job description |
| `job_type` | TEXT | 'contract' | contract, c2h, permanent, contract_to_hire |
| `location` | TEXT | | Location |
| `is_remote` | BOOLEAN | false | Remote work |
| `hybrid_days` | INTEGER | | Days per week in office |
| `rate_min` | NUMERIC(10,2) | | Minimum rate |
| `rate_max` | NUMERIC(10,2) | | Maximum rate |
| `rate_type` | TEXT | 'hourly' | hourly, annual |
| `currency` | TEXT | 'USD' | Currency code |
| `status` | TEXT | 'draft' | Job status |
| `urgency` | TEXT | 'medium' | low, medium, high, critical |
| `positions_count` | INTEGER | 1 | Open positions |
| `positions_filled` | INTEGER | 0 | Filled count |
| `required_skills` | TEXT[] | | Required skills array |
| `nice_to_have_skills` | TEXT[] | | Optional skills array |
| `min_experience_years` | INTEGER | | Min experience |
| `max_experience_years` | INTEGER | | Max experience |
| `visa_requirements` | TEXT[] | | e.g., ['H1B', 'GC', 'USC'] |
| `owner_id` | UUID | FK → user_profiles | Job owner |
| `recruiter_ids` | UUID[] | | Assigned recruiters |
| `posted_date` | DATE | | When published |
| `target_fill_date` | DATE | | Target date |
| `filled_date` | DATE | | When filled |
| `client_submission_instructions` | TEXT | | Client instructions |
| `client_interview_process` | TEXT | | Interview process |
| `created_at` | TIMESTAMPTZ | NOW() | Created timestamp |
| `updated_at` | TIMESTAMPTZ | NOW() | Updated timestamp |
| `created_by` | UUID | FK → user_profiles | Creator |
| `deleted_at` | TIMESTAMPTZ | | Soft delete |
| `search_vector` | TSVECTOR | | Full-text search |

#### Extended Columns (from later migrations)

**File**: `supabase/migrations/20251130100000_add_missing_columns.sql`
- `client_id` UUID (line 46) - synced with account_id
- `priority` TEXT (line 49) - default 'medium'
- `target_start_date` TIMESTAMPTZ (line 52)

**File**: `supabase/migrations/20251129000000_create_unified_workspace.sql:524`
- `accountable_id` UUID - RACI framework A assignment

#### Related Normalized Tables

**File**: `supabase/migrations/20251130210000_add_ats_normalized_tables.sql`
- `job_requirements` (lines 27-42)
- `job_skills` (lines 47-65)
- `job_rates` (lines 70-88)
- `job_assignments` (lines 93-110)
- `job_screening_questions` (lines 115-132)

---

### 2. Job Status Values and Lifecycle

**Current Status Values** (from `ats.ts:29`):
```typescript
z.enum(['draft', 'active', 'on_hold', 'filled', 'cancelled', 'all'])
```

**D05 Spec Status Values** (to be implemented):
- `draft` - Initial creation, internal review
- `open` - Ready to source, no submissions yet
- `active` - Active pipeline, submissions in flight
- `on_hold` - Temporarily paused
- `filled` - All positions filled (terminal)
- `cancelled` - Requisition cancelled (terminal)

**Note**: The spec uses `open` status, but the current router uses `active`. Need to determine if these map to the same concept or if `open` → `active` transition happens on first submission.

#### Database Trigger for Auto-Fill

**File**: `supabase/migrations/20251124010000_create_ats_module.sql:231-247`

```sql
CREATE OR REPLACE FUNCTION update_job_positions_filled()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'placed' AND (TG_OP = 'INSERT' OR OLD.status != 'placed') THEN
    UPDATE jobs
    SET positions_filled = positions_filled + 1
    WHERE id = NEW.job_id;

    -- Auto-close job when all positions filled
    UPDATE jobs
    SET status = 'filled', filled_date = CURRENT_DATE
    WHERE id = NEW.job_id
      AND positions_filled >= positions_count;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

### 3. Jobs tRPC Router (Read-Only)

**File**: `src/server/routers/ats.ts:20-207`
**Router Registration**: `src/server/trpc/root.ts:41`

#### Implemented Procedures

| Procedure | Lines | Description |
|-----------|-------|-------------|
| `jobs.list` | 26-87 | Paginated list with filters |
| `jobs.getById` | 90-113 | Single job with relations |
| `jobs.getStats` | 116-155 | Statistics (total, by status, urgent) |
| `jobs.getMy` | 158-206 | Current user's jobs |

#### `list` Input Schema (lines 27-35)
```typescript
{
  search?: string
  status: 'draft' | 'active' | 'on_hold' | 'filled' | 'cancelled' | 'all'
  accountId?: UUID
  recruiterId?: UUID
  limit: number (1-100, default: 50)
  offset: number (default: 0)
}
```

#### NOT Implemented (Required for D01-D06)
- `jobs.create` - Create new job
- `jobs.update` - Update job details
- `jobs.updateStatus` - Status transitions with validation
- `jobs.publish` - Publish job (draft → open)
- `jobs.close` - Close job wizard
- `jobs.delete` - Soft delete
- `jobs.clone` - Clone existing job
- `jobs.assignRecruiter` - Assign/unassign recruiters

#### Schema/Code Discrepancy

The router references columns that don't exist in the schema:
- `recruiter_id` (lines 44, 61, 131, 175) - Schema has `owner_id` and `recruiter_ids[]`
- `billing_rate` (lines 79, 170, 198) - Schema has `rate_min`, `rate_max`, `rate_type`

---

### 4. Submissions and Pipeline

**File**: `supabase/migrations/20251124010000_create_ats_module.sql:158-228`

#### Submission Status Values

**Current Values** (from archive UI reference):
```typescript
'sourced' | 'screening' | 'vendor_pending' | 'vendor_screening' |
'vendor_accepted' | 'vendor_rejected' | 'submitted_to_client' |
'client_review' | 'client_accepted' | 'client_rejected' |
'client_interview' | 'offer_stage' | 'placed' | 'rejected' | 'withdrawn'
```

**Simplified Kanban Columns** (from archive):
```typescript
'sourced' | 'submitted' | 'client_review' | 'interview_scheduled' |
'interview_completed' | 'offer_pending' | 'placed'
```

#### Key Submission Columns

| Column | Type | Description |
|--------|------|-------------|
| `job_id` | UUID | FK → jobs |
| `candidate_id` | UUID | FK → user_profiles |
| `status` | TEXT | Pipeline stage |
| `ai_match_score` | INTEGER | 0-100 |
| `recruiter_match_score` | INTEGER | 0-100 |
| `submitted_rate` | NUMERIC | Rate submitted |
| `submitted_to_client_at` | TIMESTAMPTZ | When submitted |
| `interview_count` | INTEGER | Interview count |
| `offer_extended_at` | TIMESTAMPTZ | Offer date |
| `rejection_reason` | TEXT | Why rejected |
| `rejection_source` | TEXT | candidate/client/recruiter |

#### Submissions tRPC Router

**File**: `src/server/routers/ats.ts:212-386`

| Procedure | Lines | Description |
|-----------|-------|-------------|
| `submissions.list` | 214-264 | Paginated list with filters |
| `submissions.getById` | 266-290 | Single submission with relations |
| `submissions.getStats` | 292-345 | Statistics by status |
| `submissions.getPending` | 347-385 | Pending submissions (> 3 days stale) |

---

### 5. Recruiter Workspace UI

**Workspace Routes** (src/app/employee/workspace/)
- `layout.tsx` - Uses SidebarLayout with recruiterNavSections
- `dashboard/page.tsx` - RecruiterDashboard component
- `today/page.tsx` - Today's priorities and tasks
- `reports/page.tsx` - Reports selection

**Workspace Components** (src/components/recruiter-workspace/)
- `RecruiterDashboard.tsx` - Main dashboard orchestrator
- `LogActivityModal.tsx` - Manual activity logging
- `ActivityShortcutProvider.tsx` - Keyboard shortcut context
- `ReportViewer.tsx` - Report viewer

**Dashboard Widgets** (src/components/recruiter-workspace/widgets/)
- `SprintProgressWidget.tsx` - Sprint metrics
- `TodaysPrioritiesWidget.tsx` - Task list
- `PipelineHealthWidget.tsx` - Pipeline stage counts
- `AccountPortfolioWidget.tsx` - Account health
- `ActivitySummaryWidget.tsx` - Activity metrics
- `QualityMetricsWidget.tsx` - Quality KPIs
- `UpcomingCalendarWidget.tsx` - Upcoming interviews
- `RecentWinsWidget.tsx` - Achievements

**Navigation Config** (`src/lib/navigation/recruiterNavConfig.ts`)
- Workspace section: Dashboard, Today, Reports
- Recruiting section: Jobs, Candidates, Submissions, Interviews, Placements
- CRM section: Accounts, Leads, Deals
- Settings section: Profile, Preferences

**NOT Implemented**:
- No `/employee/recruiting/jobs` page
- No job creation form
- No job detail view
- No job edit form
- No pipeline kanban (exists in archive only)

---

### 6. UI Components Available

**File**: `src/components/ui/index.ts`

#### Form Components
- `Button` - 9 variants (default, destructive, outline, secondary, ghost, link, premium, gold, glass)
- `Input` - 5 variants with icon support
- `FloatingInput` - Material Design labels
- `Textarea` - With character counter
- `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`
- `FormField` - Wrapper with label/error/hint
- `Switch`, `Checkbox`, `RadioGroup`
- `FileUpload` - Drag-and-drop with preview
- `ColorPicker` - Color picker with presets
- `RichTextEditor` - TipTap WYSIWYG
- `Slider` - Range sliders

#### Overlay Components
- `Dialog` - Modal dialogs (`src/components/ui/dialog.tsx`)
- `AlertDialog` - Confirmation dialogs (`src/components/ui/alert-dialog.tsx`)
- `Popover` - Floating popovers

#### Feedback Components
- `Toast` - Toast notifications
- `Badge` - Status badges (6 variants)
- `Progress` - Progress bars
- `Skeleton` - Loading skeletons

#### Multi-Step Wizard Pattern
**Example**: `src/components/admin/data/ImportWizard.tsx:46-573`
- Step state management with type-safe enum
- Progress bar showing completed steps
- Back/Next navigation with validation
- ScrollArea for long content

---

### 7. Activities System

**File**: `src/server/routers/activities.ts`

#### Activity Types (lines 11-15)
```typescript
'email' | 'call' | 'meeting' | 'note' | 'linkedin_message' | 'task' | 'follow_up'
```

#### Available Procedures

| Procedure | Lines | Description |
|-----------|-------|-------------|
| `activities.log` | 51-197 | Log completed activity |
| `activities.listByEntity` | 202-253 | Get activities for entity |
| `activities.getMyTasks` | 258-334 | Get user's task queue |
| `activities.complete` | 339-384 | Mark activity complete |
| `activities.skip` | 389-415 | Skip an activity |
| `activities.getStats` | 420-496 | Activity statistics |
| `activities.getRecent` | 501-533 | Recent activity feed |
| `activities.searchEntities` | 538-633 | Search for entity to associate |

#### How to Log Job Activities

```typescript
// After creating/updating a job, manually call:
await trpc.activities.log.mutate({
  entityType: 'job',
  entityId: jobId,
  activityType: 'note', // or 'task', 'follow_up'
  subject: 'Job created: {title}',
  body: 'Job details...',
  outcome: 'positive',
  createFollowUp: true,
  followUpSubject: 'Review job performance',
  followUpDueDate: addDays(new Date(), 7)
})
```

#### NOT Implemented
- Auto-activity creation from events
- Activity patterns (template-based)
- Event handlers for job.created, job.status_changed, etc.
- SLA tracking

---

### 8. Event System

**Database**: `supabase/migrations/20251119190000_update_event_bus_multitenancy.sql:10-87`

The `publish_event()` function exists but **no event handlers are implemented**. Events are stored but not processed.

```sql
SELECT publish_event(
  'job.created',            -- event_type
  job_id,                   -- aggregate_id
  '{"title": "..."}'::jsonb, -- payload
  user_id,                  -- user_id
  '{}'::jsonb,              -- metadata
  org_id                    -- org_id
);
```

**Events to implement for D01-D06**:
- `job.created`
- `job.published`
- `job.updated`
- `job.status_changed`
- `job.on_hold`
- `job.reactivated`
- `job.filled`
- `job.cancelled`
- `job.closed`
- `job.reopened`

---

## Code References

### Database Migrations
- `supabase/migrations/20251124010000_create_ats_module.sql:64-122` - Jobs table
- `supabase/migrations/20251124010000_create_ats_module.sql:158-228` - Submissions table
- `supabase/migrations/20251124010000_create_ats_module.sql:231-247` - Auto-fill trigger
- `supabase/migrations/20251130210000_add_ats_normalized_tables.sql:27-132` - Job normalized tables
- `supabase/migrations/20251130210000_add_ats_normalized_tables.sql:282-296` - Status history table

### tRPC Routers
- `src/server/routers/ats.ts:26-206` - Jobs read procedures
- `src/server/routers/ats.ts:212-386` - Submissions procedures
- `src/server/routers/activities.ts:51-197` - Activity logging
- `src/server/routers/dashboard.ts:257-389` - Pipeline health query
- `src/server/trpc/root.ts:41` - Router registration

### UI Components
- `src/components/ui/index.ts` - Component exports
- `src/components/ui/dialog.tsx:8-131` - Modal pattern
- `src/components/ui/form-field.tsx:15-60` - Form field wrapper
- `src/components/ui/select.tsx:8-169` - Select component
- `src/components/admin/data/ImportWizard.tsx:46-573` - Multi-step wizard pattern

### Workspace
- `src/app/employee/workspace/layout.tsx` - Workspace layout
- `src/components/recruiter-workspace/RecruiterDashboard.tsx` - Dashboard
- `src/components/recruiter-workspace/widgets/PipelineHealthWidget.tsx:42-135` - Pipeline metrics
- `src/lib/navigation/recruiterNavConfig.ts` - Navigation config

### Archive References (Patterns to Follow)
- `.archive/ui-reference/widgets/dashboard/KanbanBoard.tsx:71-430` - Kanban pattern
- `.archive/ui-reference/component-renderers/recruiting/SubmissionWorkspace.tsx:28-60` - Status definitions
- `.archive/ui-reference/component-renderers/recruiting/PipelineView.tsx:10-246` - Pipeline view

---

## Architecture Documentation

### Job Management Flow (To Be Implemented)

```
Create Job (D01)
├── Form: JobCreateForm (new)
├── tRPC: jobs.create (new)
├── Validation: Zod schema
├── Activity: job.created event
└── Redirect: Job detail view

Publish Job (D02)
├── Action: From job detail
├── tRPC: jobs.publish (new)
├── Validation: All required fields filled
├── Status: draft → open
├── Activity: job.published event
└── Optional: Post to job boards

Update Job (D03)
├── Form: JobEditForm (new)
├── tRPC: jobs.update (new)
├── Validation: Same as create
├── Activity: job.updated event
└── Version: Track what changed

Manage Pipeline (D04)
├── View: Kanban or list
├── tRPC: submissions.list (existing)
├── Actions: Move between stages
├── Filters: By status, date, score
└── Metrics: Stage counts, aging

Update Status (D05)
├── Modal: StatusChangeModal (new)
├── tRPC: jobs.updateStatus (new)
├── Validation: Valid transitions only
├── Reason: Required for certain transitions
├── Activity: job.status_changed event
└── Notifications: Stakeholders

Close Job (D06)
├── Wizard: JobCloseWizard (new)
├── Steps: Reason → Pipeline → Summary
├── tRPC: jobs.close (new)
├── Actions: Handle active submissions
├── Metrics: Calculate time-to-fill
├── Activity: job.closed event
└── Notifications: Candidates, stakeholders
```

### Status Transition Matrix (From D05 Spec)

| From | To | Requires | Auto-Trigger |
|------|-----|----------|--------------|
| draft | open | Manager approval or 24hr timeout | Yes |
| open | active | First submission to client | Yes |
| active | on_hold | Reason | No |
| active | filled | All positions filled | Yes |
| active | cancelled | Reason | No |
| on_hold | open | Reactivation request | No |
| filled | open | Manager approval | No |
| cancelled | open | Manager approval + reason | No |

---

## Historical Context (from thoughts/)

**File**: `thoughts/shared/research/2025-12-05-recruiter-workspace-implementation-research.md`

Previous research documented:
- Recruiter workspace dashboard structure
- Widget implementation patterns
- Navigation configuration
- Activity logging patterns
- Dashboard data flow

**Key Pattern**: The recruiter workspace follows a widget-based dashboard pattern with tRPC queries providing data. Each widget is self-contained with its own data fetching.

---

## Open Questions

1. **Status Mapping**: Should `open` (spec) map to `active` (current code), or are they separate states?

2. **Column Discrepancy**: The router references `recruiter_id` (singular) but schema has `owner_id` and `recruiter_ids[]`. Which is correct?

3. **Rate Fields**: Should jobs have `billing_rate` or `rate_min`/`rate_max`/`rate_type`?

4. **Job Status History**: The spec mentions `job_status_history` table. Does this exist or need to be created?

5. **Job Board Integration**: D02 mentions posting to job boards. Is there an integration system?

6. **Manager Approval**: How is manager approval implemented for status transitions?

7. **Notification System**: How are notifications sent to stakeholders?

---

*Last Updated: 2025-12-06*
*Document Version: 1.0*
*Status: Complete*
