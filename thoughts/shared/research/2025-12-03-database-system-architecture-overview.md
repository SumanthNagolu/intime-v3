---
date: 2025-12-04T01:56:45Z
researcher: Claude
git_commit: df2bd238ff7c74319acc6a746b018cd24a7bb243
branch: main
repository: intime-v3
topic: "Database Architecture and System Overview for UI Rebuild"
tags: [research, database, architecture, metadata-ui, trpc, activities, events]
status: complete
last_updated: 2025-12-03
last_updated_by: Claude
---

# Research: Database Architecture and System Overview for UI Rebuild

**Date**: 2025-12-04T01:56:45Z
**Researcher**: Claude
**Git Commit**: df2bd238ff7c74319acc6a746b018cd24a7bb243
**Branch**: main
**Repository**: intime-v3

## Research Question

Analyze the existing database to understand how it is setup, how the system works, and what files+line numbers are relevant for rebuilding UI with an approach of building user flows and forms from specs, then building screens around them.

## Summary

The InTime v3 codebase implements a comprehensive **metadata-driven staffing platform** with:
- **326 database tables** across 12 modules (CORE, CRM, RECRUITING, BENCH-SALES, ACADEMY, ACTIVITIES, HR, IMMIGRATION, AI, SYSTEM, VIEWS)
- **166 screen definitions** in TypeScript that declaratively define UI structure
- **35+ tRPC routers** providing type-safe API layer
- **Activity-centric architecture** where every action creates activities via event-driven system

The database specs at `/docs/specs/10-DATABASE/` serve as the source of truth for schema design.

---

## Detailed Findings

### 1. Database Module Structure

The database is organized into 12 functional domains:

| Module | Directory | Tables | Purpose |
|--------|-----------|--------|---------|
| **CORE** | `01-CORE/` | 11 | Multi-tenancy, users, RBAC, skills |
| **CRM** | `02-CRM/` | 25 | Accounts, leads, deals, campaigns |
| **RECRUITING** | `03-RECRUITING/` | 44 | Jobs, candidates, submissions, interviews, placements |
| **BENCH-SALES** | `04-BENCH-SALES/` | 23 | Consultants, vendors, job orders, marketing |
| **ACADEMY** | `05-ACADEMY/` | 64 | Courses, enrollments, progress, gamification |
| **ACTIVITIES** | `06-ACTIVITIES/` | 35 | Activities, workflows, approvals, SLAs, queues |
| **HR** | `07-HR/` | 32 | Employees, benefits, payroll, performance, pods |
| **IMMIGRATION** | `08-IMMIGRATION/` | 6 | Visa cases, I-9, attorneys, alerts |
| **AI** | `09-AI/` | ~15 | Embeddings, agents, twins, RAG |
| **SYSTEM** | `10-SYSTEM/` | 17 | Audit, events, notifications, background jobs |
| **VIEWS** | `99-VIEWS/` | Varies | Materialized views and aggregations |

**Key Spec Files**:
- `docs/specs/10-DATABASE/01-CORE/README.md` - Core patterns (lines 1-294)
- `docs/specs/10-DATABASE/02-CRM/README.md` - CRM structure (lines 1-148)
- `docs/specs/10-DATABASE/03-RECRUITING/README.md` - ATS workflow (lines 1-112)
- `docs/specs/10-DATABASE/10-SYSTEM/README.md` - System infrastructure (lines 1-289)

---

### 2. Core Design Patterns

#### 2.1 Multi-Tenancy
Every domain table references `organizations.id` via `org_id`:
```sql
-- All queries filter by org_id
SELECT * FROM jobs WHERE org_id = 'org-uuid' AND deleted_at IS NULL;
```
**Spec**: `01-CORE/README.md:119-123`

#### 2.2 Soft Deletes
Most tables use `deleted_at` timestamp:
- Preserves audit trail
- Partial indexes: `WHERE deleted_at IS NULL`
**Spec**: `01-CORE/README.md:125-128`

#### 2.3 Audit Trail
Standard columns across all tables:
- `created_at`, `updated_at` (timestamps)
- `created_by`, `updated_by` (user references)
**Spec**: `01-CORE/README.md:129-133`

#### 2.4 Polymorphic Relationships
Used by activities, addresses, comments:
- `entity_type` + `entity_id` pattern
- Single table serves multiple parent entities
**Spec**: `01-CORE/README.md:134-138`

#### 2.5 RBAC Pattern
Permission model:
- `permissions`: resource + action + scope
- `roles`: collections of permissions
- `user_roles`: many-to-many with temporal support
**Spec**: `01-CORE/README.md:139-144`

---

### 3. Key Entity Relationships

#### 3.1 Recruiting/ATS Flow
```
jobs (requisitions)
├── job_assignments (recruiter assignments)
├── job_requirements (qualifications)
├── job_skills (skill requirements)
└── job_screening_questions

submissions (candidate-to-job)
├── submission_screening_answers
├── submission_status_history
└── submission_rates

interviews
├── interview_sessions (rounds)
├── interview_participants
├── interview_feedback
└── interview_reminders

offers
├── offer_terms
├── offer_negotiations
└── offer_approvals

placements
├── placement_rates
├── placement_milestones
├── placement_timesheets
└── placement_credits (commission)
```
**Spec**: `03-RECRUITING/README.md:69-81`

#### 3.2 Bench Sales Flow
```
bench_consultants (core)
├── consultant_availability
├── consultant_rates (versioned)
├── consultant_visa_details
└── consultant_work_authorization

marketing_profiles
├── marketing_formats (resume, one-pager)
└── marketing_activities (outreach tracking)

vendors
├── vendor_contacts
├── vendor_terms
├── vendor_performance (time-series)
└── vendor_relationships (polymorphic)

external_job_orders
├── external_job_order_requirements
├── external_job_order_skills
└── external_job_order_submissions
```
**Spec**: `04-BENCH-SALES/README.md` (full structure)

#### 3.3 Activity System
```
activities (core hub)
├── activity_attachments
├── activity_checklist_items
├── activity_comments
├── activity_participants
├── activity_reminders
├── activity_time_entries
└── activity_history (audit)

activity_patterns (templates)
├── pattern_checklist_items
├── pattern_fields
└── activity_pattern_successors

workplan_templates
├── workplan_template_activities
├── workplan_instances
└── workplan_phases

workflows (state machines)
├── workflow_states
├── workflow_transitions
├── workflow_instances
└── workflow_history
```
**Spec**: `06-ACTIVITIES/README.md` (comprehensive)

---

### 4. Metadata-Driven UI System

The UI uses a **Guidewire-inspired metadata framework** where screens are declaratively defined.

#### 4.1 Screen Definition Structure
**Location**: `src/lib/metadata/types/screen.types.ts:30-95`

```typescript
interface ScreenDefinition {
  id: string;
  type: 'detail' | 'list' | 'wizard' | 'dashboard' | 'popup';
  entityType?: EntityType;
  title: string | DynamicValue;
  layout: LayoutDefinition;
  dataSource?: DataSourceDefinition;
  actions?: ActionDefinition[];
  permissions?: PermissionRule[];
}
```

#### 4.2 Layout Types
**Location**: `src/lib/metadata/types/screen.types.ts:118-126`

- `single-column`: Stacked sections
- `two-column`: Equal columns
- `sidebar-main`: Narrow sidebar + main content + tabs
- `tabs`: Full-width tabbed interface
- `wizard-steps`: Multi-step forms
- `split-view`: Split view editor

#### 4.3 Section Types
**Location**: `src/lib/metadata/types/screen.types.ts:176-190`

- `info-card`: Key-value display
- `metrics-grid`: KPI metrics
- `field-grid`: Display-only fields
- `table`: Data tables
- `form`: Editable forms
- `timeline`: Activity history
- `custom`: Registered widget components

#### 4.4 Field Types
**Location**: `src/lib/metadata/types/widget.types.ts:14-88`

48 field types including:
- Text: `text`, `textarea`, `richtext`
- Numeric: `number`, `currency`, `percentage`, `rating`
- Date/Time: `date`, `datetime`, `time`, `duration`
- Choice: `enum`, `select`, `multiselect`, `boolean`
- Special: `tags`, `email`, `phone`, `file`, `image`

#### 4.5 Dynamic Value Resolution
**Location**: `src/lib/metadata/renderers/ScreenRenderer.tsx:64-120`

```typescript
// Resolves at runtime from entity, URL params, or context
{ type: 'field', path: 'job.account.name' }  // Entity field
{ type: 'param', path: 'id' }                 // URL parameter
{ type: 'context', path: 'user.fullName' }    // User context
```

---

### 5. Renderer Hierarchy

The rendering system uses a 4-level hierarchy:

```
ScreenRenderer (src/lib/metadata/renderers/ScreenRenderer.tsx:397-598)
  ↓
LayoutRenderer (src/lib/metadata/renderers/LayoutRenderer.tsx:476-486)
  ↓
SectionRenderer (src/lib/metadata/renderers/SectionRenderer.tsx:702-714)
  ↓
WidgetRenderer (src/lib/metadata/renderers/WidgetRenderer.tsx:112-176)
```

**Key Files**:
- `src/lib/metadata/renderers/ScreenRenderer.tsx` - Orchestrates screen rendering
- `src/lib/metadata/renderers/LayoutRenderer.tsx` - Layout type implementations
- `src/lib/metadata/renderers/SectionRenderer.tsx` - Section type implementations
- `src/lib/metadata/renderers/ListRenderer.tsx` - List screen with tRPC fetching
- `src/lib/metadata/renderers/WidgetRenderer.tsx` - Individual field/widget rendering

---

### 6. Screen Definitions by Module

**Location**: `src/screens/`

| Module | Location | Count | Key Screens |
|--------|----------|-------|-------------|
| **Recruiting** | `screens/recruiting/` | 24 | job-detail, candidate-list, submission-pipeline |
| **Bench Sales** | `screens/bench-sales/` | 16 | bench-dashboard, consultant-list, job-order-detail |
| **CRM/TA** | `screens/crm/`, `screens/ta/` | 18 | account-list, lead-detail, deal-pipeline |
| **HR** | `screens/hr/` | 27 | employee-list, onboarding, pod-detail |
| **Admin** | `screens/admin/` | 29 | users-list, roles, workflows-hub |
| **Operations** | `screens/operations/` | 27 | manager dashboards, CFO/COO/CEO views |
| **Portals** | `screens/portals/` | 33 | client (13), talent (13), academy (7) |

**Total**: 166 screens

**Main Registry**: `src/screens/index.ts:80-176`

---

### 7. tRPC Router Structure

**Root Router**: `src/server/trpc/root.ts:66-122`

| Router | Location | Purpose |
|--------|----------|---------|
| **crm** | `src/server/routers/crm.ts` | Accounts, leads, deals, campaigns |
| **ats** | `src/server/routers/ats.ts` | Jobs, submissions, interviews |
| **bench** | `src/server/routers/bench.ts` | Consultants, vendors, job orders |
| **hr** | `src/server/routers/hr.ts` | Employees, onboarding, time-off |
| **dashboard** | `src/server/routers/dashboard.ts` | Role-specific metrics |
| **activities** | `src/server/routers/activities.ts` | Activity CRUD, queues, patterns |
| **events** | `src/server/routers/events.ts` | Event queries, subscriptions |

**Key Patterns**:
- Middleware: `src/server/trpc/middleware.ts:19-165`
  - `protectedProcedure`: Requires auth (line 113)
  - `orgProtectedProcedure`: Requires org membership (line 118)
  - `ownershipProcedure`: Includes RCAI context (line 173)

---

### 8. Activity Engine

**Core Philosophy**: "No work is done unless an activity is created"

#### 8.1 Event → Activity Flow
**Location**: `src/lib/activities/activity-engine.ts:132-159`

```
Event Published
  ↓
ActivityEngine.processEvent()
  ↓
PatternMatcher.findMatchingPatterns()
  ↓
For each pattern:
  - Resolve assignee
  - Calculate due date
  - Create activity
  ↓
ActivityService.create()
```

#### 8.2 Assignment Resolution
**Location**: `src/lib/activities/activity-engine.ts:274-446`

Strategies:
- `owner`: Gets entity owner from RCAI
- `raci_role`: Uses RACI matrix
- `round_robin`: Distribution across team
- `least_busy`: Assigns to user with fewest activities
- `manager`: Via pod hierarchy

#### 8.3 Pattern System
**Location**: `src/lib/activities/PatternService.ts:69-252`

Patterns define activity templates:
- Default assignee and priority
- SLA calculation
- Checklist items
- Custom fields
- Successor activities

#### 8.4 Queue Management
**Location**: `src/lib/activities/QueueManager.ts:76-471`

- Personal queue with priority scoring
- Team queue for managers
- Activity claiming/unclaiming
- SLA status calculation

---

### 9. Event Bus System

**Location**: `src/lib/events/event-bus.ts:33-263`

#### 9.1 Event Publishing
```typescript
EventEmitter.emit(event) → EventBus.publish() → Middleware Pipeline
```

#### 9.2 Middleware Order
1. **AuditHandler** (Priority 100) - Records everything
2. **ActivityCreationHandler** (Priority 90) - Creates activities
3. **NotificationHandler** (Priority 80) - Sends notifications
4. **WebhookHandler** (Priority 70) - Triggers webhooks

**Handler Locations**:
- `src/lib/events/handlers/AuditHandler.ts:39-82`
- `src/lib/events/handlers/ActivityCreationHandler.ts:26-48`
- `src/lib/events/handlers/NotificationHandler.ts:29-76`
- `src/lib/events/handlers/WebhookHandler.ts`

---

## Code References

### Database Specs
- `docs/specs/10-DATABASE/01-CORE/README.md` - Core patterns and RBAC
- `docs/specs/10-DATABASE/02-CRM/README.md` - CRM tables (25)
- `docs/specs/10-DATABASE/03-RECRUITING/README.md` - ATS tables (44)
- `docs/specs/10-DATABASE/04-BENCH-SALES/README.md` - Bench tables (23)
- `docs/specs/10-DATABASE/06-ACTIVITIES/README.md` - Activity system (35)
- `docs/specs/10-DATABASE/07-HR/README.md` - HR tables (32)
- `docs/specs/10-DATABASE/10-SYSTEM/README.md` - System infrastructure

### Metadata Types
- `src/lib/metadata/types/screen.types.ts:30-95` - ScreenDefinition
- `src/lib/metadata/types/screen.types.ts:118-126` - LayoutTypes
- `src/lib/metadata/types/screen.types.ts:176-190` - SectionTypes
- `src/lib/metadata/types/widget.types.ts:14-88` - FieldTypes
- `src/lib/metadata/types/widget.types.ts:177-295` - FieldDefinition
- `src/lib/metadata/types/data.types.ts:11-50` - DynamicValue

### Renderers
- `src/lib/metadata/renderers/ScreenRenderer.tsx:397-598` - Screen orchestration
- `src/lib/metadata/renderers/LayoutRenderer.tsx:93-462` - Layout types
- `src/lib/metadata/renderers/SectionRenderer.tsx:110-696` - Section types
- `src/lib/metadata/renderers/WidgetRenderer.tsx:112-277` - Widget rendering
- `src/lib/metadata/renderers/ListRenderer.tsx:137-593` - List with tRPC

### Widget Registry
- `src/lib/metadata/registry/widget-registry.ts:65-160` - Registry system
- `src/lib/metadata/widgets/register-widgets.ts:75-341` - Widget registration
- `src/lib/metadata/widgets/dashboard/index.ts` - Dashboard widgets

### Screen Definitions
- `src/screens/index.ts:80-176` - Screen registry
- `src/screens/recruiting/index.ts:56-109` - Recruiting screens
- `src/screens/bench-sales/index.ts` - Bench sales screens
- `src/screens/admin/index.ts:99-148` - Admin screens

### tRPC Routers
- `src/server/trpc/root.ts:66-122` - Root router composition
- `src/server/trpc/middleware.ts:19-173` - Auth middleware
- `src/server/routers/crm.ts:58-499` - CRM procedures
- `src/server/routers/ats.ts:67-485` - ATS procedures
- `src/server/routers/bench.ts:38-2112` - Bench procedures
- `src/server/routers/dashboard.ts:237-1229` - Dashboard procedures
- `src/server/routers/activities.ts:148-1334` - Activity procedures

### Activity System
- `src/lib/activities/activity-engine.ts:116-684` - Core engine
- `src/lib/activities/activity-service.ts:33-533` - CRUD operations
- `src/lib/activities/PatternService.ts:69-477` - Pattern management
- `src/lib/activities/QueueManager.ts:76-467` - Queue management

### Event System
- `src/lib/events/event-bus.ts:33-263` - Event bus
- `src/lib/events/event-emitter.ts:49-259` - Event creation
- `src/lib/events/handlers/index.ts` - Handler exports
- `src/lib/events/DeliveryService.ts:78-409` - Notification delivery
- `src/lib/events/SubscriptionService.ts:50-385` - User subscriptions

### Layouts
- `src/components/layouts/AppShell.tsx:19-149` - Main app shell
- `src/components/layouts/index.ts:1-72` - Layout exports
- `src/lib/navigation/navConfig.ts:63-144` - Role-based navigation

---

## Architecture Documentation

### UI Rebuild Approach

Based on the existing architecture, the recommended approach for rebuilding UI from specs:

1. **Start with Database Specs** (`docs/specs/10-DATABASE/`)
   - Each module has complete table definitions
   - Relationships are documented
   - Data flows are described

2. **Define User Flows First**
   - Map business workflows to database entities
   - Identify primary CRUD operations
   - Document state transitions (workflow_states)

3. **Create Form Definitions**
   - Use `FieldDefinition` structure for each entity
   - Reference field types from `widget.types.ts`
   - Apply validation rules from database constraints

4. **Build Screen Definitions**
   - Use existing `ScreenDefinition` pattern
   - Leverage existing section types
   - Reuse widget components

5. **Connect to tRPC**
   - Existing routers provide most operations
   - Add new procedures as needed
   - Use ownership filtering for RCAI

6. **Wire Up Activities**
   - Define activity patterns for key events
   - Configure auto-creation rules
   - Set up SLA definitions

---

## Related Research

- No prior research documents found in `thoughts/shared/research/`

---

## Open Questions

1. **Academy Module**: 64 tables but UI coverage unclear - needs detailed analysis
2. **AI Module**: Integration points with activity system need documentation
3. **Views Module**: Materialized views for performance - need inventory
4. **Portal Screens**: Client/Talent portal completeness needs verification
