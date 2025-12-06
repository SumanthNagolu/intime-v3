# Recruiter Workspace Implementation Research

**Date**: 2025-12-05
**Branch**: main
**Commit**: 5b62b20 (Add integration management and data management features)
**Scope**: All Recruiter specs (A01-H04) - 38 use cases

---

## Executive Summary

This research document maps all 38 Recruiter Workspace use cases to existing codebase infrastructure, identifying what exists, what needs to be built, and providing implementation patterns for planning/implementing agents.

### Key Findings

1. **CRM tRPC Router Does NOT Exist** - Must be created from scratch
2. **Two Campaign Systems** - TA/HR (`campaigns`) and CRM (`crm_campaigns`) - use CRM for BD workflow
3. **Activity Engine NOT Implemented** - Database tables exist, TypeScript code doesn't
4. **Metadata Screen System Archived** - Reference implementation in `.archive/ui-reference/`
5. **`lead_sourcing_credits` Table Missing** - Referenced in A04 but not in migrations

---

## Use Case Catalog

### Category A: Campaigns & Lead Generation (4 Use Cases)

| ID | Use Case | Primary Table(s) | tRPC Procedure(s) | Status |
|----|----------|------------------|-------------------|--------|
| A01 | Run Campaign | `crm_campaigns`, `crm_campaign_targets`, `crm_campaign_content` | `crm.campaigns.create`, `.launch`, `.pause`, `.complete` | Tables: Exist, Router: Missing |
| A02 | Track Campaign Metrics | `crm_campaign_metrics`, `crm_campaign_targets` | `crm.campaigns.getMetrics`, `.getTargetResponses` | Tables: Exist, Router: Missing |
| A03 | Generate Lead from Campaign | `leads`, `crm_campaign_targets` | `crm.leads.createFromCampaign` | Tables: Exist, Router: Missing |
| A04 | Create Lead | `leads`, `lead_tasks`, `lead_sourcing_credits` | `crm.leads.create`, `.quickCreate` | `lead_sourcing_credits`: Missing |

### Category B: Lead Qualification & Deals (5 Use Cases)

| ID | Use Case | Primary Table(s) | tRPC Procedure(s) | Status |
|----|----------|------------------|-------------------|--------|
| B01 | Prospect New Client | `leads`, `accounts` | `crm.leads.search`, `.qualify` | Tables: Exist, Router: Missing |
| B02 | Qualify Opportunity | `leads` (bant_* fields) | `crm.leads.updateBant`, `.calculateScore` | Tables: Exist, Router: Missing |
| B03 | Create Deal | `deals`, `deal_contacts` | `crm.deals.create`, `.createFromLead` | Tables: Exist, Router: Missing |
| B04 | Manage Deal Pipeline | `deals`, `deal_stage_history` | `crm.deals.list`, `.updateStage`, `.bulkMove` | Tables: Exist, Router: Missing |
| B05 | Close Deal | `deals`, `accounts` | `crm.deals.close`, `.markWon`, `.markLost` | Tables: Exist, Router: Missing |

### Category C: Account Management (7 Use Cases)

| ID | Use Case | Primary Table(s) | tRPC Procedure(s) | Status |
|----|----------|------------------|-------------------|--------|
| C01 | Create Account | `accounts`, `account_contacts` | `crm.accounts.create` | Tables: Exist, Router: Missing |
| C02 | Onboard Account | `accounts`, `account_documents` | `crm.accounts.onboard`, `.uploadDocument` | Tables: Exist, Router: Missing |
| C03 | Manage Account Profile | `accounts` | `crm.accounts.update`, `.getById` | Tables: Exist, Router: Missing |
| C04 | Manage Client Relationship | `accounts`, `account_contacts`, `activities` | `crm.accounts.addContact`, `.logActivity` | Tables: Exist, Router: Missing |
| C05 | Conduct Client Meeting | `activities`, `account_notes` | `crm.meetings.schedule`, `.logOutcome` | Tables: Exist, Router: Missing |
| C06 | Handle Client Escalation | `escalations`, `activities` | `crm.escalations.create`, `.resolve` | `escalations`: Check if exists |
| C07 | Take Job Requisition | `jobs`, `job_intake_forms` | `ats.jobs.createFromRequisition` | Tables: Exist, Router: Partial |

### Category D: Job Lifecycle (6 Use Cases)

| ID | Use Case | Primary Table(s) | tRPC Procedure(s) | Status |
|----|----------|------------------|-------------------|--------|
| D01 | Create Job | `jobs`, `job_requirements`, `job_skills` | `ats.jobs.create`, `.draft` | Tables: Exist, Router: Partial |
| D02 | Publish Job | `jobs`, `job_postings` | `ats.jobs.publish`, `.publishToBoards` | Tables: Exist, Router: Partial |
| D03 | Update Job | `jobs` | `ats.jobs.update` | Tables: Exist, Router: Partial |
| D04 | Manage Pipeline | `submissions`, `submission_stage_history` | `ats.submissions.list`, `.moveStage` | Tables: Exist, Router: Partial |
| D05 | Update Job Status | `jobs` | `ats.jobs.updateStatus` | Tables: Exist, Router: Partial |
| D06 | Close Job | `jobs`, `placements` | `ats.jobs.close`, `.closeWithPlacement` | Tables: Exist, Router: Partial |

### Category E: Sourcing & Screening (5 Use Cases)

| ID | Use Case | Primary Table(s) | tRPC Procedure(s) | Status |
|----|----------|------------------|-------------------|--------|
| E01 | Source Candidates | `candidates`, `candidate_sources` | `ats.candidates.search`, `.import` | Tables: Exist, Router: Partial |
| E02 | Search Candidates | `candidates`, `candidate_skills` | `ats.candidates.advancedSearch` | Tables: Exist, Router: Partial |
| E03 | Screen Candidate | `candidates`, `candidate_screenings` | `ats.candidates.screen`, `.addScreeningNotes` | Tables: Exist, Router: Partial |
| E04 | Manage Hotlist | `hotlists`, `hotlist_candidates` | `ats.hotlists.create`, `.addCandidate` | Tables: Check if exists |
| E05 | Prepare Candidate Profile | `candidate_profiles`, `candidate_documents` | `ats.candidates.prepareProfile` | Tables: Check if exists |

### Category F: Submission & Interview (6 Use Cases)

| ID | Use Case | Primary Table(s) | tRPC Procedure(s) | Status |
|----|----------|------------------|-------------------|--------|
| F01 | Submit Candidate | `submissions` | `ats.submissions.create`, `.submit` | Tables: Exist, Router: Partial |
| F02 | Track Submission | `submissions`, `submission_status_history` | `ats.submissions.track`, `.getHistory` | Tables: Exist, Router: Partial |
| F03 | Schedule Interview | `interviews`, `interview_participants` | `ats.interviews.schedule` | Tables: Exist, Router: Partial |
| F04 | Prepare Candidate for Interview | `interview_prep`, `activities` | `ats.interviews.sendPrep` | Tables: Check if exists |
| F05 | Coordinate Interview Rounds | `interviews`, `interview_rounds` | `ats.interviews.addRound`, `.reschedule` | Tables: Exist, Router: Partial |
| F06 | Collect Interview Feedback | `interview_feedback`, `interview_scorecards` | `ats.interviews.submitFeedback` | Tables: Exist, Router: Partial |

### Category G: Offers & Placements (8 Use Cases)

| ID | Use Case | Primary Table(s) | tRPC Procedure(s) | Status |
|----|----------|------------------|-------------------|--------|
| G01 | Extend Offer | `offers`, `offer_terms` | `ats.offers.create`, `.send` | Tables: Exist, Router: Partial |
| G02 | Negotiate Offer | `offers`, `offer_negotiations` | `ats.offers.counter`, `.revise` | Tables: Check if exists |
| G03 | Confirm Placement | `placements`, `placement_terms` | `ats.placements.confirm` | Tables: Exist, Router: Partial |
| G04 | Manage Placement | `placements`, `placement_extensions` | `ats.placements.update`, `.extend` | Tables: Exist, Router: Partial |
| G05 | Track Commission | `commissions`, `commission_payments` | `ats.commissions.calculate`, `.track` | Tables: Check if exists |
| G06 | Handle Extension | `placement_extensions` | `ats.placements.requestExtension` | Tables: Check if exists |
| G07 | Handle Early Termination | `placements`, `placement_terminations` | `ats.placements.terminate` | Tables: Check if exists |
| G08 | Make Placement | `placements` | `ats.placements.create` | Tables: Exist, Router: Partial |

### Category H: Daily Operations (4 Use Cases)

| ID | Use Case | Primary Table(s) | tRPC Procedure(s) | Status |
|----|----------|------------------|-------------------|--------|
| H01 | Daily Workflow | `activities`, `tasks`, `reminders` | `dashboard.getRecruiterMetrics` | Tables: Exist, Router: Partial |
| H02 | Log Activity | `activities`, `activity_patterns` | `activities.create`, `.logCall`, `.logEmail` | Tables: Exist, Router: Missing |
| H03 | Recruiter Dashboard | Multiple (aggregation) | `dashboard.getRecruiterDashboard` | Router: Partial |
| H04 | Recruiter Reports | Multiple (aggregation) | `reports.recruiterPerformance` | Router: Missing |

---

## Database Schema Analysis

### Existing Tables (Confirmed in Migrations)

#### CRM Module (`20251124000000_create_crm_module.sql`)
```
leads
├── id, org_id, owner_id
├── company_name, industry, company_size, revenue_range
├── contact_name, contact_title, contact_email, contact_phone
├── source, source_detail, status, priority
├── bant_budget, bant_authority, bant_need, bant_timeline, bant_score
├── conversion_probability, estimated_value
├── next_follow_up_date, last_contact_date
└── created_at, updated_at, deleted_at

accounts
├── id, org_id, owner_id
├── name, industry, company_size, revenue_range, website
├── status (prospect|active|inactive|churned)
├── account_type (direct|agency|msp|vms)
├── billing_*, address_*
└── created_at, updated_at, deleted_at

deals
├── id, org_id, account_id, lead_id, owner_id
├── name, value, currency, stage, probability
├── expected_close_date, actual_close_date
├── won_reason, lost_reason, competitor
└── created_at, updated_at, deleted_at
```

#### CRM Campaigns (`20251130211000_crm_complete_schema.sql`)
```
crm_campaigns
├── id, org_id, owner_id
├── name, description, type (email|linkedin|call|multi_channel)
├── status (draft|scheduled|active|paused|completed|cancelled)
├── start_date, end_date
├── target_criteria (JSONB), total_targets, budget
└── created_at, updated_at, deleted_at

crm_campaign_targets
├── id, campaign_id, lead_id, contact_id
├── status (pending|contacted|responded|converted|opted_out)
├── contact_attempts, last_contact_at, response_type, notes
└── created_at, updated_at

crm_campaign_content
├── id, campaign_id
├── content_type (email_template|linkedin_message|call_script)
├── name, subject, body, sequence_order, delay_days
└── created_at, updated_at

crm_campaign_metrics
├── id, campaign_id
├── total_sent, total_delivered, total_opened, total_clicked
├── total_replied, total_bounced, total_unsubscribed
├── leads_generated, deals_created, revenue_attributed
└── recorded_at
```

#### Activity System (`20251201001000_workplan_activity_system.sql`)
```
activities
├── id, org_id, owner_id
├── type (call|email|meeting|note|task|status_change|system)
├── entity_type, entity_id
├── subject, description, outcome
├── scheduled_at, completed_at, due_at
├── is_automated, pattern_id
└── created_at, updated_at, deleted_at

activity_patterns
├── id, org_id
├── name, description, trigger_type, trigger_config (JSONB)
├── action_type, action_config (JSONB)
├── is_active, execution_count
└── created_at, updated_at
```

### Tables Needing Verification/Creation

| Table | Referenced In | Status |
|-------|---------------|--------|
| `lead_sourcing_credits` | A04 | **NOT FOUND** - needs creation |
| `escalations` | C06 | Needs verification |
| `hotlists` | E04 | Needs verification |
| `hotlist_candidates` | E04 | Needs verification |
| `candidate_profiles` | E05 | Needs verification |
| `interview_prep` | F04 | Needs verification |
| `offer_negotiations` | G02 | Needs verification |
| `commissions` | G05 | Needs verification |
| `commission_payments` | G05 | Needs verification |
| `placement_terminations` | G07 | Needs verification |

---

## tRPC Router Analysis

### Existing Routers

| Router | File | Status |
|--------|------|--------|
| `ats` | `src/server/routers/ats.ts` | Partial - needs expansion |
| `crm` | `src/server/routers/crm.ts` | **DOES NOT EXIST** |
| `dashboard` | `src/server/routers/dashboard.ts` | Partial |
| `activities` | `src/server/routers/activities.ts` | **DOES NOT EXIST** |
| `reports` | `src/server/routers/reports.ts` | **DOES NOT EXIST** |

### Root Router (`src/server/trpc/root.ts`)
```typescript
// Current exports - CRM not included
export const appRouter = createTRPCRouter({
  // ... other routers
  // crm: crmRouter,  // MISSING
  // activities: activitiesRouter,  // MISSING
  // reports: reportsRouter,  // MISSING
});
```

### Implementation Pattern Reference

**List Query Pattern** (`src/server/routers/pods.ts:14-77`):
```typescript
list: orgProtectedProcedure
  .input(z.object({
    page: z.number().min(1).default(1),
    pageSize: z.number().min(1).max(100).default(20),
    search: z.string().optional(),
    status: z.enum(['active', 'inactive']).optional(),
    sortBy: z.enum(['name', 'created_at']).default('created_at'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }))
  .query(async ({ ctx, input }) => {
    const { page, pageSize, search, status, sortBy, sortOrder } = input;
    const offset = (page - 1) * pageSize;

    // Build query with filters
    let query = ctx.db.select().from(pods)
      .where(eq(pods.org_id, ctx.orgId));

    if (search) {
      query = query.where(ilike(pods.name, `%${search}%`));
    }
    if (status) {
      query = query.where(eq(pods.status, status));
    }

    // Execute with pagination
    const [items, countResult] = await Promise.all([
      query.orderBy(sortOrder === 'asc' ? asc(pods[sortBy]) : desc(pods[sortBy]))
        .limit(pageSize).offset(offset),
      ctx.db.select({ count: count() }).from(pods)
        .where(eq(pods.org_id, ctx.orgId))
    ]);

    return {
      items,
      pagination: {
        page, pageSize,
        totalItems: countResult[0].count,
        totalPages: Math.ceil(countResult[0].count / pageSize)
      }
    };
  }),
```

**Create Mutation Pattern** (`src/server/routers/pods.ts:120-213`):
```typescript
create: orgProtectedProcedure
  .input(z.object({
    name: z.string().min(1).max(100),
    description: z.string().optional(),
    manager_id: z.string().uuid().optional(),
    // ... other fields
  }))
  .mutation(async ({ ctx, input }) => {
    const [pod] = await ctx.db.insert(pods).values({
      ...input,
      org_id: ctx.orgId,
      created_by: ctx.userId,
      updated_by: ctx.userId,
    }).returning();

    // Audit log
    await ctx.db.insert(audit_logs).values({
      org_id: ctx.orgId,
      user_id: ctx.userId,
      action: 'create',
      entity_type: 'pod',
      entity_id: pod.id,
      new_values: pod,
    });

    return pod;
  }),
```

**Middleware Reference** (`src/server/trpc/middleware.ts:35`):
```typescript
export const orgProtectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
  if (!ctx.userId || !ctx.orgId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({ ctx: { ...ctx, userId: ctx.userId, orgId: ctx.orgId } });
});
```

---

## Event & Activity System

### Database Functions (Exist)

**Event Publishing** (`supabase/migrations/20251201001000_workplan_activity_system.sql`):
```sql
CREATE OR REPLACE FUNCTION publish_event(
  p_event_type TEXT,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_payload JSONB DEFAULT '{}'::JSONB,
  p_org_id UUID DEFAULT NULL
) RETURNS UUID AS $$
  -- Creates event record and triggers handlers
$$ LANGUAGE plpgsql;
```

### TypeScript Implementation (MISSING)

**Event Emitter** - Does NOT exist, needs creation at `src/lib/events/event-emitter.ts`:
```typescript
// Pattern from specs
interface Event {
  type: string;
  entityType: string;
  entityId: string;
  payload: Record<string, unknown>;
  orgId: string;
  userId: string;
  timestamp: Date;
}

class EventEmitter {
  emit(event: Event): Promise<void>;
  subscribe(eventType: string, handler: EventHandler): void;
}
```

**Activity Engine** - Does NOT exist, needs creation at `src/lib/activities/activity-engine.ts`:
```typescript
// Pattern from specs
interface ActivityEngine {
  createActivity(params: CreateActivityParams): Promise<Activity>;
  applyPattern(patternId: string, context: PatternContext): Promise<Activity[]>;
  scheduleFollowUp(entityType: string, entityId: string, dueDate: Date): Promise<Activity>;
}
```

### Event Types Required by Use Cases

| Category | Event Types |
|----------|-------------|
| Campaigns | `campaign.created`, `campaign.launched`, `campaign.paused`, `campaign.completed`, `campaign.target_added`, `campaign.response_received` |
| Leads | `lead.created`, `lead.qualified`, `lead.converted`, `lead.bant_updated`, `lead.status_changed` |
| Deals | `deal.created`, `deal.stage_changed`, `deal.won`, `deal.lost`, `deal.value_updated` |
| Accounts | `account.created`, `account.onboarded`, `account.contact_added`, `account.escalation_created` |
| Jobs | `job.created`, `job.published`, `job.status_changed`, `job.closed` |
| Submissions | `submission.created`, `submission.stage_changed`, `submission.rejected`, `submission.advanced` |
| Interviews | `interview.scheduled`, `interview.completed`, `interview.feedback_submitted`, `interview.rescheduled` |
| Offers | `offer.created`, `offer.sent`, `offer.accepted`, `offer.declined`, `offer.negotiated` |
| Placements | `placement.created`, `placement.confirmed`, `placement.extended`, `placement.terminated` |

---

## Metadata Screen System

### Location
- **Current**: Archived at `.archive/ui-reference/`
- **Active Types**: `src/lib/metadata/types/screen.types.ts`

### Screen Definition Pattern

**Type Definitions** (`.archive/ui-reference/types/screen.types.ts`):
```typescript
interface ScreenDefinition {
  id: string;
  type: 'list' | 'detail' | 'form' | 'wizard' | 'dashboard';
  entityType: string;
  title: string | DynamicValue;
  layout: LayoutDefinition;
  sections: SectionDefinition[];
  actions?: ActionDefinition[];
  permissions?: PermissionConfig;
}

interface LayoutDefinition {
  type: 'single' | 'sidebar-main' | 'tabs' | 'wizard';
  sidebar?: SectionDefinition[];
  main?: SectionDefinition[];
  tabs?: TabDefinition[];
  steps?: WizardStepDefinition[];
}
```

### Example: Campaign Builder Wizard (`.archive/ui-reference/screens/ta/campaign-builder.screen.ts`)
```typescript
export const campaignBuilderScreen: ScreenDefinition = {
  id: 'ta.campaign-builder',
  type: 'wizard',
  entityType: 'campaign',
  title: 'Create Campaign',
  layout: {
    type: 'wizard',
    steps: [
      {
        id: 'basics',
        title: 'Campaign Basics',
        sections: [
          {
            id: 'basic-info',
            type: 'form',
            fields: [
              { name: 'name', type: 'text', label: 'Campaign Name', required: true },
              { name: 'type', type: 'select', label: 'Type', options: [...] },
              { name: 'description', type: 'textarea', label: 'Description' }
            ]
          }
        ]
      },
      {
        id: 'targeting',
        title: 'Target Audience',
        sections: [...]
      },
      {
        id: 'content',
        title: 'Content',
        sections: [...]
      },
      {
        id: 'schedule',
        title: 'Schedule',
        sections: [...]
      }
    ]
  }
};
```

### Rendering Hierarchy
```
ScreenRenderer (src/lib/metadata/renderers/ScreenRenderer.tsx)
  → LayoutRenderer
    → SectionRenderer
      → WidgetRenderer (fields, tables, charts, etc.)
```

---

## Navigation Configuration

### Structure (`src/lib/navigation/`)
```
navConfig.ts        - Main navigation factory
adminNavConfig.ts   - Admin-specific sections
recruiterNavConfig.ts - Recruiter-specific (NEEDS CREATION)
```

### Pattern (`src/components/navigation/Sidebar.tsx:9-20`):
```typescript
interface SidebarItem {
  label: string;
  href: string;
  icon?: React.ComponentType;
  badge?: number | string;
  children?: SidebarItem[];
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}
```

### Recruiter Navigation Structure (From H01 Spec)
```typescript
const recruiterNavSections: SidebarSection[] = [
  {
    title: 'Dashboard',
    items: [
      { label: 'Home', href: '/employee/recruiting', icon: HomeIcon },
      { label: 'My Pipeline', href: '/employee/recruiting/pipeline', icon: KanbanIcon },
    ]
  },
  {
    title: 'Business Development',
    items: [
      { label: 'Campaigns', href: '/employee/recruiting/campaigns', icon: MegaphoneIcon },
      { label: 'Leads', href: '/employee/recruiting/leads', icon: UsersIcon },
      { label: 'Deals', href: '/employee/recruiting/deals', icon: HandshakeIcon },
    ]
  },
  {
    title: 'Accounts',
    items: [
      { label: 'All Accounts', href: '/employee/recruiting/accounts', icon: BuildingIcon },
      { label: 'My Accounts', href: '/employee/recruiting/accounts/mine', icon: UserIcon },
    ]
  },
  {
    title: 'Jobs',
    items: [
      { label: 'Active Jobs', href: '/employee/recruiting/jobs', icon: BriefcaseIcon },
      { label: 'My Jobs', href: '/employee/recruiting/jobs/mine', icon: ClipboardIcon },
    ]
  },
  {
    title: 'Candidates',
    items: [
      { label: 'Search', href: '/employee/recruiting/candidates/search', icon: SearchIcon },
      { label: 'Hotlists', href: '/employee/recruiting/hotlists', icon: StarIcon },
    ]
  },
  {
    title: 'Activity',
    items: [
      { label: 'Tasks', href: '/employee/recruiting/tasks', icon: CheckSquareIcon },
      { label: 'Calendar', href: '/employee/recruiting/calendar', icon: CalendarIcon },
    ]
  }
];
```

---

## Implementation Priority Matrix

### Phase 1: Core Infrastructure (Foundation)

| Priority | Component | Dependencies | Effort |
|----------|-----------|--------------|--------|
| P0 | CRM tRPC Router | Drizzle schemas | High |
| P0 | Activities tRPC Router | Activity tables | Medium |
| P0 | Event Emitter Service | None | Medium |
| P1 | Activity Engine | Event Emitter | High |
| P1 | Missing DB migrations | Schema design | Medium |

### Phase 2: Business Development (A01-B05)

| Priority | Use Cases | Dependencies |
|----------|-----------|--------------|
| P1 | A04 Create Lead | CRM Router |
| P1 | B01-B02 Qualification | CRM Router |
| P1 | B03 Create Deal | CRM Router, Leads |
| P2 | A01-A03 Campaigns | CRM Router, Email service |
| P2 | B04-B05 Pipeline | CRM Router, Deals |

### Phase 3: Account & Job Management (C01-D06)

| Priority | Use Cases | Dependencies |
|----------|-----------|--------------|
| P1 | C01-C03 Account CRUD | CRM Router |
| P1 | D01-D03 Job CRUD | ATS Router |
| P2 | C04-C07 Relationship | Activities |
| P2 | D04-D06 Pipeline | ATS Router |

### Phase 4: Recruiting Operations (E01-G08)

| Priority | Use Cases | Dependencies |
|----------|-----------|--------------|
| P1 | E01-E02 Sourcing | ATS Router |
| P1 | F01-F03 Submissions | ATS Router |
| P2 | E03-E05 Screening | ATS Router |
| P2 | F04-F06 Interviews | ATS Router, Calendar |
| P2 | G01-G08 Placements | ATS Router |

### Phase 5: Dashboard & Reports (H01-H04)

| Priority | Use Cases | Dependencies |
|----------|-----------|--------------|
| P2 | H01 Daily Workflow | All routers |
| P2 | H03 Dashboard | Dashboard Router |
| P3 | H02 Activity Log | Activities Router |
| P3 | H04 Reports | Reports Router |

---

## Key Business Rules

### BANT Scoring (B02)
- **Budget**: 0-25 points (Does org have budget for staffing?)
- **Authority**: 0-25 points (Is contact the decision maker?)
- **Need**: 0-25 points (Urgency of hiring need?)
- **Timeline**: 0-25 points (When do they need to hire?)
- **Total Score**: 0-100, categories: Cold (<25), Warm (25-50), Hot (51-75), Very Hot (>75)

### Commission Model (G05)
- Base rate: 5% of gross revenue
- Calculated on: placement value * duration
- Payable: Upon placement confirmation
- Clawback: If placement ends within guarantee period

### Replacement Guarantee (G07)
- **0-7 days**: Free replacement, no questions
- **8-30 days**: Performance-related issues only
- **31-60 days**: 50% discount on replacement fee
- **61-90 days**: 25% discount on replacement fee
- **>90 days**: Standard fee applies

### Lead Sources (A04)
- **Marketing**: Campaigns, website, content downloads
- **BD Outreach**: Cold calls, LinkedIn, referrals
- **Cross-Pillar**: Bench sales leads, VMS leads, partner referrals
- **Inbound**: Website forms, job applications, direct contact

### Job Status Flow (D05)
```
Draft → Pending Approval → Open → On Hold → Filled → Closed
                              ↓
                          Cancelled
```

### Submission Status Flow (D04)
```
Submitted → Under Review → Shortlisted → Interview → Offer → Placed
    ↓           ↓              ↓            ↓         ↓
Rejected   Rejected       Rejected    Rejected  Declined
```

---

## Context for Implementation Agents

### When Implementing CRM Features (A01-B05):
1. Create `src/server/routers/crm.ts` using `pods.ts` as pattern
2. Use `crm_campaigns`, `leads`, `deals`, `accounts` tables
3. All queries must filter by `org_id` using `orgProtectedProcedure`
4. Emit events for all state changes (use `publish_event` DB function until TypeScript EventEmitter is built)
5. Reference BANT scoring rules for lead qualification

### When Implementing ATS Features (C07-G08):
1. Expand existing `src/server/routers/ats.ts`
2. Use `jobs`, `submissions`, `interviews`, `placements` tables
3. Implement status flows as defined in specs
4. Create activities for all recruiter actions
5. Reference commission and guarantee rules for placements

### When Implementing Activities (H02):
1. Create `src/server/routers/activities.ts`
2. Use `activities`, `activity_patterns` tables
3. Support all activity types: call, email, meeting, note, task, status_change, system
4. Implement pattern matching for auto-activities
5. Schedule follow-ups using due_at field

### When Implementing Screens:
1. Reference `.archive/ui-reference/` for patterns
2. Use `ScreenDefinition` type from `src/lib/metadata/types/`
3. Create screen files in `src/screens/recruiting/`
4. Register in `src/screens/recruiting/index.ts`
5. Follow wizard pattern for multi-step flows (campaigns, job creation)

### When Implementing Dashboard (H03):
1. Expand `src/server/routers/dashboard.ts`
2. Aggregate from multiple tables for metrics
3. Support date range filtering
4. Include: active jobs, submissions, interviews, placements, pipeline value

---

## File References Summary

### Must Create
- `src/server/routers/crm.ts` - CRM router (leads, deals, accounts, campaigns)
- `src/server/routers/activities.ts` - Activities router
- `src/server/routers/reports.ts` - Reports router
- `src/lib/events/event-emitter.ts` - Event emitter service
- `src/lib/activities/activity-engine.ts` - Activity engine
- `src/lib/navigation/recruiterNavConfig.ts` - Recruiter navigation
- `supabase/migrations/YYYYMMDD_lead_sourcing_credits.sql` - Missing table

### Must Extend
- `src/server/routers/ats.ts` - Add missing procedures
- `src/server/routers/dashboard.ts` - Add recruiter metrics
- `src/server/trpc/root.ts` - Add new routers

### Reference for Patterns
- `src/server/routers/pods.ts:14-77` - List query pattern
- `src/server/routers/pods.ts:120-213` - Create mutation pattern
- `src/server/trpc/middleware.ts:35` - Org protection
- `.archive/ui-reference/screens/ta/campaign-builder.screen.ts` - Wizard screen
- `src/components/navigation/Sidebar.tsx:9-20` - Navigation interfaces
- `src/lib/navigation/adminNavConfig.ts` - Navigation config pattern

---

## Appendix: Use Case to Event Mapping

| Use Case | Primary Event | Secondary Events |
|----------|---------------|------------------|
| A01 Run Campaign | `campaign.launched` | `campaign.paused`, `campaign.completed` |
| A02 Track Metrics | `campaign.metrics_updated` | - |
| A03 Generate Lead | `lead.created` | `campaign.lead_generated` |
| A04 Create Lead | `lead.created` | `lead.assigned` |
| B01 Prospect Client | `lead.qualified` | `lead.status_changed` |
| B02 Qualify Opportunity | `lead.bant_updated` | `lead.score_changed` |
| B03 Create Deal | `deal.created` | `lead.converted` |
| B04 Manage Pipeline | `deal.stage_changed` | - |
| B05 Close Deal | `deal.won` OR `deal.lost` | `account.created` (if won) |
| C01 Create Account | `account.created` | - |
| C02 Onboard Account | `account.onboarded` | `document.uploaded` |
| C03 Manage Profile | `account.updated` | - |
| C04 Manage Relationship | `activity.created` | `contact.added` |
| C05 Client Meeting | `meeting.scheduled` | `meeting.completed` |
| C06 Handle Escalation | `escalation.created` | `escalation.resolved` |
| C07 Take Requisition | `job.created` | `job.intake_completed` |
| D01 Create Job | `job.created` | - |
| D02 Publish Job | `job.published` | `job.posted_to_board` |
| D03 Update Job | `job.updated` | - |
| D04 Manage Pipeline | `submission.stage_changed` | - |
| D05 Update Status | `job.status_changed` | - |
| D06 Close Job | `job.closed` | - |
| E01 Source Candidates | `candidate.sourced` | `candidate.imported` |
| E02 Search Candidates | - | - |
| E03 Screen Candidate | `candidate.screened` | `screening.completed` |
| E04 Manage Hotlist | `hotlist.candidate_added` | `hotlist.created` |
| E05 Prepare Profile | `candidate.profile_prepared` | - |
| F01 Submit Candidate | `submission.created` | - |
| F02 Track Submission | - | - |
| F03 Schedule Interview | `interview.scheduled` | - |
| F04 Prepare for Interview | `interview.prep_sent` | - |
| F05 Coordinate Rounds | `interview.round_added` | `interview.rescheduled` |
| F06 Collect Feedback | `interview.feedback_submitted` | - |
| G01 Extend Offer | `offer.created` | `offer.sent` |
| G02 Negotiate Offer | `offer.negotiated` | `offer.revised` |
| G03 Confirm Placement | `placement.confirmed` | - |
| G04 Manage Placement | `placement.updated` | - |
| G05 Track Commission | `commission.calculated` | `commission.paid` |
| G06 Handle Extension | `placement.extended` | - |
| G07 Handle Termination | `placement.terminated` | - |
| G08 Make Placement | `placement.created` | `job.filled` |
| H01 Daily Workflow | - | - |
| H02 Log Activity | `activity.created` | - |
| H03 Dashboard | - | - |
| H04 Reports | - | - |
