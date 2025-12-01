# InTime v3 - Master Orchestration Plan

**Version:** 1.0
**Created:** 2025-11-30
**Purpose:** Parallel execution guide for Claude Code CLI

---

## Overview

This document provides the complete orchestration plan for building InTime v3 using Claude Code CLI with parallel execution across multiple terminal windows.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        INTIME V3 BUILD PHASES                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  PHASE 1: DATABASE (Week 1)                                                  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐              │
│  │ Core    │ │ ATS     │ │ CRM     │ │ Bench   │ │ Academy │              │
│  │ Tables  │ │ Schema  │ │ Schema  │ │ Schema  │ │ Schema  │              │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘              │
│       │           │           │           │           │                     │
│       └───────────┴───────────┴───────────┴───────────┘                     │
│                              │                                               │
│                              ▼                                               │
│  PHASE 2: COMPONENTS (Week 2)                                               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐              │
│  │ Forms   │ │ Tables  │ │ Cards   │ │ Modals  │ │ Layouts │              │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘              │
│       │           │           │           │           │                     │
│       └───────────┴───────────┴───────────┴───────────┘                     │
│                              │                                               │
│                              ▼                                               │
│  PHASE 3: SCREENS (Week 3)                                                  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐              │
│  │Recruiter│ │ Bench   │ │ Manager │ │Executive│ │ Portals │              │
│  │ Screens │ │ Screens │ │ Screens │ │ Screens │ │         │              │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘              │
│       │           │           │           │           │                     │
│       └───────────┴───────────┴───────────┴───────────┘                     │
│                              │                                               │
│                              ▼                                               │
│  PHASE 4: INTEGRATION (Week 4)                                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                           │
│  │ tRPC    │ │Activity │ │ Events  │ │ Testing │                           │
│  │ Routers │ │ System  │ │ System  │ │         │                           │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Terminal Window Setup

Open **6 terminal windows** for maximum parallelization:

```
┌────────────────────┬────────────────────┬────────────────────┐
│   WINDOW 1         │   WINDOW 2         │   WINDOW 3         │
│   Core/Foundation  │   Domain 1         │   Domain 2         │
├────────────────────┼────────────────────┼────────────────────┤
│   WINDOW 4         │   WINDOW 5         │   WINDOW 6         │
│   Domain 3         │   UI Components    │   Integration      │
└────────────────────┴────────────────────┴────────────────────┘
```

---

## Skills to Load

Each prompt should start with loading appropriate skills:

| Work Stream | Skills to Load |
|-------------|----------------|
| Database | `database` |
| ATS/Recruiting | `database`, `recruiting` |
| CRM/Leads | `database`, `crm` |
| Bench Sales | `database`, `bench-sales` |
| Academy | `database`, `academy` |
| HR/TA | `database`, `hr` |
| tRPC Routers | `trpc`, `database` |
| UI/Screens | `metadata` |
| Testing | `testing` |

---

## Phase 1: DATABASE DESIGN

### 1.1 Parallel Execution Map

```
WINDOW 1 (Core)          WINDOW 2 (ATS)           WINDOW 3 (CRM)
─────────────────        ─────────────────        ─────────────────
DB-CORE                  DB-ATS                   DB-CRM
├─ organizations         ├─ jobs                  ├─ accounts
├─ users                 ├─ candidates            ├─ contacts
├─ roles                 ├─ submissions           ├─ leads
├─ permissions           ├─ interviews            ├─ deals
├─ audit_logs            ├─ offers                ├─ campaigns
└─ events                └─ placements            └─ activities

WINDOW 4 (Bench)         WINDOW 5 (HR/Academy)    WINDOW 6 (Workplan)
─────────────────        ─────────────────        ─────────────────
DB-BENCH                 DB-HR-ACADEMY            DB-WORKPLAN
├─ bench_consultants     ├─ employees             ├─ workplan_templates
├─ hotlists              ├─ leave_requests        ├─ activity_patterns
├─ vendor_accounts       ├─ timesheets            ├─ workplan_instances
├─ job_orders            ├─ courses               ├─ activities
├─ rate_cards            ├─ enrollments           ├─ pattern_successors
└─ marketing_profiles    └─ certificates          └─ activity_outcomes
```

---

## PHASE 1 PROMPTS

### WINDOW 1: Core Foundation

```
PROMPT: DB-CORE

cd /Users/sumanthrajkumarnagolu/Projects/intime-v3

Use the database skill. Read the existing schema files in src/lib/db/schema/.

Based on the USER-ROLES documentation in docs/specs/20-USER-ROLES/, design and implement the CORE database tables:

1. **Read First:**
   - docs/specs/20-USER-ROLES/00-MASTER-FRAMEWORK.md
   - docs/specs/20-USER-ROLES/01-ACTIVITIES-EVENTS-FRAMEWORK.md
   - src/lib/db/schema/organizations.ts
   - src/lib/db/schema/rbac.ts

2. **Create/Update:**
   - src/lib/db/schema/organizations.ts - Multi-tenancy, pods, regions
   - src/lib/db/schema/rbac.ts - Roles (all 12 from docs), permissions, RACI
   - src/lib/db/schema/audit.ts - Complete audit logging
   - src/lib/db/schema/events.ts - Event system (268 event types from 03-EVENT-TYPE-CATALOG.md)

3. **Requirements:**
   - Every table has: id, org_id, created_at, updated_at, deleted_at
   - Implement soft delete pattern
   - Add proper indexes for common queries
   - Export types for each table
   - Follow Drizzle ORM patterns from the skill

4. **Tables to create:**
   - organizations (add: tier, industry, country, health_score)
   - pods (type: recruiting/bench_sales/ta, senior_member, junior_member)
   - regions (name, country, timezone, manager_id)
   - system_roles (the 12 roles from USER-ROLES)
   - permissions (entity, action, scope)
   - object_owners (polymorphic RACI assignments)
   - audit_logs (entity_type, entity_id, action, changes, actor)
   - events (event_type, entity_type, entity_id, actor, data, severity)

Generate migration SQL after schema is complete.
```

---

### WINDOW 2: ATS Schema

```
PROMPT: DB-ATS

cd /Users/sumanthrajkumarnagolu/Projects/intime-v3

Use the database skill and recruiting skill. Design the complete ATS database schema.

1. **Read First:**
   - docs/specs/20-USER-ROLES/01-recruiter/00-OVERVIEW.md
   - docs/specs/20-USER-ROLES/01-recruiter/*.md (all workflow files)
   - docs/specs/20-USER-ROLES/00-MASTER-FRAMEWORK.md (visa types, job types)
   - src/lib/db/schema/ats.ts (existing)

2. **Create/Update src/lib/db/schema/ats.ts:**

   JOBS:
   - jobs (title, account_id, status, priority, job_type, work_mode, location)
   - job_requirements (job_id, requirement, is_must_have)
   - job_skills (job_id, skill_id, importance)
   - job_rates (job_id, bill_rate_min/max, pay_rate_min/max, currency)
   - job_assignments (job_id, recruiter_id, role: primary/secondary)

   CANDIDATES:
   - candidates (name, email, phone, status, source, visa_status, work_auth)
   - candidate_profiles (candidate_id, summary, experience_years, education)
   - candidate_skills (candidate_id, skill_id, years, proficiency)
   - candidate_work_history (candidate_id, company, title, start/end, description)
   - candidate_documents (candidate_id, type, file_url, uploaded_at)
   - candidate_availability (candidate_id, available_from, notice_period)

   SUBMISSIONS:
   - submissions (candidate_id, job_id, status, submitted_by, submitted_at)
   - submission_rates (submission_id, bill_rate, pay_rate, margin)
   - submission_feedback (submission_id, stage, feedback, rating, by)
   - submission_status_history (submission_id, from_status, to_status, at, by)

   INTERVIEWS:
   - interviews (submission_id, type, scheduled_at, duration, location)
   - interview_participants (interview_id, participant_type, name, email)
   - interview_feedback (interview_id, interviewer_id, rating, notes, recommendation)

   OFFERS:
   - offers (submission_id, status, salary, start_date, expiry_date)
   - offer_terms (offer_id, term_type, value, description)
   - offer_negotiations (offer_id, requested_by, changes, status)

   PLACEMENTS:
   - placements (offer_id, status, start_date, end_date, actual_end_date)
   - placement_rates (placement_id, bill_rate, pay_rate, effective_from)
   - placement_extensions (placement_id, new_end_date, approved_by)
   - placement_timesheets (placement_id, week_ending, hours, status)
   - placement_milestones (placement_id, milestone_type, due_date, completed_at)

3. **Add relations between all tables**
4. **Create indexes for common queries**
5. **Export all types**

Generate migration SQL when complete.
```

---

### WINDOW 3: CRM Schema

```
PROMPT: DB-CRM

cd /Users/sumanthrajkumarnagolu/Projects/intime-v3

Use the database skill and crm skill. Design the complete CRM database schema.

1. **Read First:**
   - docs/specs/20-USER-ROLES/03-ta/*.md (TA Specialist - lead gen)
   - docs/specs/20-USER-ROLES/01-recruiter/*.md (account management)
   - docs/specs/20-USER-ROLES/00-MASTER-FRAMEWORK.md
   - src/lib/db/schema/crm.ts (existing)

2. **Create/Update src/lib/db/schema/crm.ts:**

   ACCOUNTS:
   - accounts (name, industry, website, tier, status, health_score)
   - account_addresses (account_id, type, street, city, state, country, zip)
   - account_contracts (account_id, type, start_date, end_date, terms)
   - account_preferences (account_id, preferred_skills, rate_range, work_mode)
   - account_metrics (account_id, total_placements, total_revenue, avg_ttf)

   CONTACTS:
   - contacts (account_id, name, title, email, phone, is_primary)
   - contact_preferences (contact_id, preferred_contact_method, timezone)

   LEADS:
   - leads (source, status, company_name, contact_name, email, phone)
   - lead_scores (lead_id, score, factors, calculated_at)
   - lead_qualification (lead_id, budget, authority, need, timeline)
   - lead_touchpoints (lead_id, type, notes, outcome, at, by)

   DEALS:
   - deals (lead_id, account_id, name, stage, value, probability, close_date)
   - deal_stages (deal_id, stage, entered_at, exited_at, duration)
   - deal_stakeholders (deal_id, contact_id, role, influence_level)
   - deal_competitors (deal_id, competitor_name, strengths, weaknesses)

   CAMPAIGNS:
   - campaigns (name, type, status, start_date, end_date, budget)
   - campaign_targets (campaign_id, target_type, target_id)
   - campaign_metrics (campaign_id, impressions, clicks, conversions)

   ACTIVITIES (CRM-specific):
   - crm_activities (entity_type, entity_id, type, subject, description)
   - crm_activity_outcomes (activity_id, outcome, next_steps, follow_up_date)

3. **Implement account health score calculation fields**
4. **Add pipeline stage configuration**
5. **Create proper indexes**

Generate migration SQL when complete.
```

---

### WINDOW 4: Bench Sales Schema

```
PROMPT: DB-BENCH

cd /Users/sumanthrajkumarnagolu/Projects/intime-v3

Use the database skill and bench-sales skill. Design the complete Bench Sales database schema.

1. **Read First:**
   - docs/specs/20-USER-ROLES/02-bench-sales/00-OVERVIEW.md
   - docs/specs/20-USER-ROLES/02-bench-sales/*.md (all workflow files)
   - docs/specs/20-USER-ROLES/00-MASTER-FRAMEWORK.md (visa types, vendor terms)
   - src/lib/db/schema/bench.ts (existing)

2. **Create/Update src/lib/db/schema/bench.ts:**

   BENCH CONSULTANTS:
   - bench_consultants (candidate_id, status, bench_start_date, visa_status)
   - consultant_visa_details (consultant_id, visa_type, expiry, lca_status)
   - consultant_rates (consultant_id, min_rate, target_rate, currency)
   - consultant_availability (consultant_id, available_from, willing_relocate)
   - consultant_skills_matrix (consultant_id, skill_id, proficiency, certified)

   MARKETING:
   - marketing_profiles (consultant_id, headline, summary, highlights)
   - marketing_formats (profile_id, format_type, content, version)
   - hotlists (name, description, status, created_by)
   - hotlist_consultants (hotlist_id, consultant_id, position, added_at)
   - marketing_activities (consultant_id, type, target, sent_at, response)

   VENDORS:
   - vendors (name, type, status, tier, primary_contact)
   - vendor_contacts (vendor_id, name, email, phone, role)
   - vendor_terms (vendor_id, payment_terms, markup_range, preferred_skills)
   - vendor_relationships (vendor_id, account_id, relationship_type)
   - vendor_performance (vendor_id, submissions, placements, avg_margin)

   JOB ORDERS:
   - job_orders (vendor_id, title, description, status, received_at)
   - job_order_requirements (order_id, requirement, priority)
   - job_order_rates (order_id, bill_rate, target_margin)
   - job_order_submissions (order_id, consultant_id, status, submitted_at)

   IMMIGRATION:
   - immigration_cases (consultant_id, case_type, status, attorney)
   - immigration_documents (case_id, document_type, file_url, expires_at)
   - immigration_timelines (case_id, milestone, target_date, actual_date)
   - work_authorization (consultant_id, auth_type, start_date, end_date)

3. **Implement visa expiry tracking with alert levels**
4. **Add rate negotiation tracking**
5. **Create vendor performance metrics**

Generate migration SQL when complete.
```

---

### WINDOW 5: HR & Academy Schema

```
PROMPT: DB-HR-ACADEMY

cd /Users/sumanthrajkumarnagolu/Projects/intime-v3

Use the database skill, hr skill, and academy skill. Design HR and Academy schemas.

1. **Read First:**
   - docs/specs/20-USER-ROLES/05-hr/*.md (HR Manager workflows)
   - docs/specs/20-USER-ROLES/05-hr/20-submit-leave.md through 23-submit-expense.md
   - src/lib/db/schema/ta-hr.ts (existing)
   - src/lib/db/schema/academy.ts (existing)

2. **Create/Update src/lib/db/schema/ta-hr.ts:**

   EMPLOYEES:
   - employees (user_id, employee_number, department, title, manager_id)
   - employee_compensation (employee_id, salary, bonus_target, effective_date)
   - employee_documents (employee_id, document_type, file_url, expires_at)

   LEAVE MANAGEMENT:
   - leave_types (name, accrual_rate, max_carryover, requires_approval)
   - leave_balances (employee_id, leave_type_id, balance, year)
   - leave_requests (employee_id, leave_type_id, start, end, status)
   - leave_approvals (request_id, approver_id, status, notes)

   TIMESHEETS:
   - timesheet_periods (start_date, end_date, status)
   - timesheets (employee_id, period_id, status, submitted_at)
   - timesheet_entries (timesheet_id, date, project_id, hours, description)
   - timesheet_approvals (timesheet_id, approver_id, status)

   EXPENSES:
   - expense_categories (name, requires_receipt, max_amount)
   - expense_reports (employee_id, period, status, total_amount)
   - expense_items (report_id, category_id, amount, description, receipt_url)
   - expense_approvals (report_id, approver_id, status, notes)

   ONBOARDING:
   - onboarding_templates (name, role_type, tasks)
   - onboarding_instances (employee_id, template_id, status, start_date)
   - onboarding_tasks (instance_id, task_name, assigned_to, due_date, status)

3. **Update src/lib/db/schema/academy.ts:**

   COURSES:
   - courses (title, description, category, level, duration, instructor_id)
   - course_modules (course_id, title, sequence, duration)
   - module_lessons (module_id, title, type, content, duration)
   - lesson_resources (lesson_id, resource_type, url, title)

   ENROLLMENTS:
   - enrollments (user_id, course_id, status, enrolled_at, completed_at)
   - lesson_progress (enrollment_id, lesson_id, status, completed_at)
   - quiz_attempts (enrollment_id, quiz_id, score, passed, attempted_at)

   GAMIFICATION:
   - xp_transactions (user_id, amount, reason, entity_type, entity_id)
   - achievements (name, description, xp_reward, criteria)
   - user_achievements (user_id, achievement_id, earned_at)
   - leaderboards (period, user_id, xp_total, rank)
   - streaks (user_id, current_streak, longest_streak, last_activity)

   CERTIFICATES:
   - certificates (enrollment_id, issued_at, expires_at, credential_id)
   - certificate_templates (course_id, template_content)

Generate migration SQL when complete.
```

---

### WINDOW 6: Workplan & Activities Schema

```
PROMPT: DB-WORKPLAN

cd /Users/sumanthrajkumarnagolu/Projects/intime-v3

Use the database skill. Design the complete Workplan/Activities schema based on Guidewire patterns.

1. **Read First:**
   - docs/specs/20-USER-ROLES/01-ACTIVITIES-EVENTS-FRAMEWORK.md
   - docs/specs/20-USER-ROLES/02-ACTIVITY-PATTERN-LIBRARY.md
   - docs/specs/20-USER-ROLES/03-EVENT-TYPE-CATALOG.md
   - src/lib/db/schema/workplan.ts (existing)

2. **Create/Update src/lib/db/schema/workplan.ts:**

   TEMPLATES & PATTERNS:
   - workplan_templates (code, name, entity_type, trigger_event, is_active)
   - activity_patterns (code, name, entity_type, category, target_days, priority)
   - pattern_conditions (pattern_id, field, operator, value)
   - pattern_successors (pattern_id, successor_id, trigger_on, delay_days)
   - template_patterns (template_id, pattern_id, sequence, is_mandatory)

   INSTANCES & ACTIVITIES:
   - workplan_instances (template_id, entity_type, entity_id, status)
   - activities (
       workplan_instance_id, pattern_id,
       entity_type, entity_id,
       subject, description,
       category, priority, status,
       assigned_to, due_date, due_time,
       started_at, completed_at, completed_by,
       outcome, outcome_notes, duration_minutes,
       follow_up_required, follow_up_date, follow_up_activity_id
     )
   - activity_participants (activity_id, user_id, role)
   - activity_notes (activity_id, note, created_by, created_at)
   - activity_attachments (activity_id, file_url, file_name, file_type)

   SLA TRACKING:
   - sla_definitions (entity_type, metric, warning_hours, breach_hours)
   - sla_tracking (entity_type, entity_id, metric, started_at, warning_at, breach_at)
   - sla_violations (tracking_id, violation_type, occurred_at, resolved_at)

   NOTIFICATIONS:
   - notification_templates (event_type, channel, subject_template, body_template)
   - notification_queue (template_id, recipient_id, data, status, scheduled_at)
   - notification_log (queue_id, sent_at, delivery_status, error)

   USER PREFERENCES:
   - activity_preferences (user_id, notification_channel, digest_frequency)
   - activity_filters (user_id, filter_name, criteria, is_default)

3. **Implement:**
   - Auto-activity creation trigger on entity insert
   - Activity chaining logic
   - SLA calculation functions
   - Notification dispatch

Generate migration SQL when complete.
```

---

## PHASE 2: UI COMPONENTS

After Phase 1 database is complete, run these in parallel:

### WINDOW 1: Form Components

```
PROMPT: UI-FORMS

cd /Users/sumanthrajkumarnagolu/Projects/intime-v3

Use the metadata skill. Create reusable form components based on USER-ROLES field specifications.

1. **Read First:**
   - docs/specs/20-USER-ROLES/01-recruiter/02-create-job.md (field specs)
   - docs/specs/20-USER-ROLES/01-recruiter/03-source-candidates.md
   - docs/specs/20-USER-ROLES/02-bench-sales/*.md
   - src/components/ui/ (existing shadcn components)

2. **Create in src/components/forms/:**

   BASE INPUTS:
   - TextInput (with validation, error display)
   - TextArea (with char count)
   - Select (single, searchable)
   - MultiSelect (tags, searchable)
   - DatePicker (with time option)
   - DateRangePicker
   - NumberInput (with currency, percentage options)
   - RateInput (bill/pay rate pair with margin calc)
   - PhoneInput (with country code)
   - EmailInput (with validation)
   - FileUpload (with preview, drag-drop)

   COMPOSITE FIELDS:
   - AddressFields (street, city, state, country, zip)
   - SkillSelector (skill + years + proficiency)
   - ContactFields (name, email, phone, title)
   - AvailabilityFields (date + notice period)
   - VisaStatusFields (type + expiry + alert level)

   FORM LAYOUTS:
   - FormSection (collapsible, with title)
   - FormRow (responsive grid)
   - FormActions (save, cancel, submit)
   - FormStepper (multi-step forms)

3. **Each component must:**
   - Use react-hook-form + zod
   - Support disabled/readonly states
   - Show validation errors
   - Have loading states
   - Be fully typed with TypeScript
```

---

### WINDOW 2: Table Components

```
PROMPT: UI-TABLES

cd /Users/sumanthrajkumarnagolu/Projects/intime-v3

Use the metadata skill. Create data table components based on USER-ROLES list views.

1. **Read First:**
   - docs/specs/20-USER-ROLES/01-recruiter/02-create-job.md (job list wireframe)
   - docs/specs/20-USER-ROLES/00-MASTER-FRAMEWORK.md (component library section)
   - src/components/ui/table.tsx (existing)

2. **Create in src/components/tables/:**

   CORE TABLE:
   - DataTable (
       columns, data, pagination, sorting, filtering,
       row selection, bulk actions, inline editing,
       column visibility, column resize, export
     )
   - TableToolbar (search, filters, view toggle, actions)
   - TablePagination (page size, page nav, total count)
   - TableFilters (quick filters, advanced filters)
   - TableColumns (column config, visibility, order)

   CELL RENDERERS:
   - StatusCell (badge with color)
   - DateCell (relative + absolute)
   - RateCell (currency formatted)
   - UserCell (avatar + name)
   - ActionsCell (dropdown menu)
   - LinkCell (clickable with icon)
   - ProgressCell (bar/percentage)
   - TagsCell (multiple tags)
   - PriorityCell (icon + label)

   SPECIALIZED TABLES:
   - CandidateTable (with quick actions)
   - JobTable (with status filters)
   - SubmissionTable (with pipeline view)
   - ActivityTable (with timeline toggle)
   - PlacementTable (with milestone indicators)

3. **Features:**
   - Virtual scrolling for large datasets
   - Sticky headers
   - Row grouping
   - Expandable rows
   - Keyboard navigation
```

---

### WINDOW 3: Card Components

```
PROMPT: UI-CARDS

cd /Users/sumanthrajkumarnagolu/Projects/intime-v3

Use the metadata skill. Create card components based on USER-ROLES wireframes.

1. **Read First:**
   - docs/specs/20-USER-ROLES/01-recruiter/*.md (card wireframes)
   - docs/specs/20-USER-ROLES/02-bench-sales/*.md
   - docs/specs/20-USER-ROLES/01-ACTIVITIES-EVENTS-FRAMEWORK.md (activity cards)

2. **Create in src/components/cards/:**

   ENTITY CARDS:
   - CandidateCard (name, skills, status, match %, actions)
   - JobCard (title, account, rate, status, applicants)
   - SubmissionCard (candidate + job, stage, rate)
   - PlacementCard (consultant, client, dates, rate)
   - AccountCard (name, tier, health, revenue)
   - LeadCard (company, contact, score, stage)
   - DealCard (name, value, probability, stage)
   - ConsultantCard (name, visa, availability, rate)

   ACTIVITY CARDS:
   - ActivityCard (type icon, subject, due, status, actions)
   - ActivityQueueCard (grouped by due date)
   - TimelineCard (activity + event combined view)

   DASHBOARD CARDS:
   - MetricCard (value, label, trend, sparkline)
   - KPICard (target vs actual, gauge)
   - PipelineCard (stages with counts)
   - LeaderboardCard (ranked list)
   - AlertCard (severity, message, action)

   CARD LAYOUTS:
   - CardGrid (responsive grid of cards)
   - CardList (vertical list of cards)
   - CardCarousel (horizontal scrollable)
   - KanbanBoard (columns of cards)

3. **Each card must:**
   - Show activity badge (overdue/due today count)
   - Have quick action buttons
   - Support skeleton loading
   - Be fully responsive
```

---

### WINDOW 4: Modal & Drawer Components

```
PROMPT: UI-MODALS

cd /Users/sumanthrajkumarnagolu/Projects/intime-v3

Use the metadata skill. Create modal and drawer components.

1. **Read First:**
   - docs/specs/20-USER-ROLES/01-ACTIVITIES-EVENTS-FRAMEWORK.md (activity modals)
   - docs/specs/20-USER-ROLES/01-recruiter/*.md (action modals)

2. **Create in src/components/modals/:**

   CORE MODALS:
   - Modal (base, with variants: sm/md/lg/xl/full)
   - ConfirmModal (title, message, confirm/cancel)
   - AlertModal (success/error/warning/info)
   - FormModal (modal with form, validation, submit)

   ENTITY MODALS:
   - QuickCreateModal (minimal fields for fast creation)
   - EntityDetailModal (full detail view in modal)
   - BulkActionModal (select entities, apply action)
   - AssignmentModal (assign owner/RACI)
   - StatusChangeModal (with reason, notes)

   ACTIVITY MODALS:
   - LogActivityModal (type selector, form, outcome)
   - CompleteActivityModal (outcome, notes, follow-up)
   - ScheduleActivityModal (type, due date, assignee)
   - RescheduleModal (new date, reason)

   DRAWERS:
   - Drawer (base, left/right)
   - EntityDrawer (preview panel)
   - FilterDrawer (advanced filters)
   - ActivityDrawer (activity stream)
   - TimelineDrawer (full timeline view)

   COMMAND:
   - CommandPalette (Cmd+K, global search + actions)
   - QuickSwitcher (recent entities, bookmarks)
```

---

### WINDOW 5: Layout Components

```
PROMPT: UI-LAYOUTS

cd /Users/sumanthrajkumarnagolu/Projects/intime-v3

Use the metadata skill. Create layout components based on role dashboards.

1. **Read First:**
   - docs/specs/20-USER-ROLES/*/00-OVERVIEW.md (dashboard wireframes)
   - docs/specs/20-USER-ROLES/00-MASTER-FRAMEWORK.md (navigation)

2. **Create in src/components/layouts/:**

   APP LAYOUTS:
   - AppShell (sidebar + header + main)
   - RoleDashboard (role-specific home)
   - EntityLayout (detail page with tabs)
   - SettingsLayout (sidebar nav + content)
   - PortalLayout (external user layout)

   NAVIGATION:
   - Sidebar (collapsible, role-based menu)
   - SidebarNav (nav items with icons, badges)
   - Breadcrumbs (with entity names)
   - TabNav (horizontal tabs)
   - SubNav (secondary navigation)

   HEADERS:
   - PageHeader (title, actions, breadcrumbs)
   - EntityHeader (name, status, key info, actions)
   - SectionHeader (title, description, actions)

   CONTENT:
   - PageContent (max-width, padding)
   - SplitPane (resizable left/right or top/bottom)
   - MasterDetail (list + detail panel)
   - TabbedContent (tabs with lazy loading)

   WIDGETS:
   - WidgetGrid (dashboard grid layout)
   - WidgetContainer (title, actions, content)
   - ResizableWidget (user can resize)

3. **Role-based rendering:**
   - Menu items based on user role
   - Permission-based action buttons
   - Feature flags support
```

---

### WINDOW 6: Activity UI Components

```
PROMPT: UI-ACTIVITIES

cd /Users/sumanthrajkumarnagolu/Projects/intime-v3

Use the metadata skill. Create activity-specific UI components.

1. **Read First:**
   - docs/specs/20-USER-ROLES/01-ACTIVITIES-EVENTS-FRAMEWORK.md (all UI sections)
   - docs/specs/20-USER-ROLES/02-ACTIVITY-PATTERN-LIBRARY.md

2. **Create in src/components/activities/:**

   ACTIVITY DISPLAY:
   - ActivityTimeline (chronological activities + events)
   - ActivityFeed (infinite scroll list)
   - ActivityCalendar (calendar view of activities)
   - ActivityKanban (by status columns)

   ACTIVITY WIDGETS:
   - MyActivitiesWidget (dashboard widget)
   - OverdueAlert (overdue activities banner)
   - ActivityCounter (badge with counts)
   - DueTodayList (quick list for today)

   ACTIVITY FORMS:
   - ActivityTypeSelector (icon grid of types)
   - ActivityForm (full creation form)
   - QuickLogButton (floating action button)
   - QuickLogBar (entity header bar with type buttons)

   ACTIVITY COMPLETION:
   - OutcomeSelector (outcome options)
   - DurationInput (minutes/hours)
   - FollowUpCreator (inline follow-up creation)
   - NotesEditor (rich text notes)

   ENTITY INTEGRATION:
   - EntityActivityStream (activity tab on entity)
   - ActivityBadge (overdue/due counts on cards)
   - LastActivityIndicator (time since last activity)
   - StaleWarning (no activity warning)

3. **Activity-centric principles:**
   - Every entity detail page has activity tab
   - Every card shows activity badge
   - Quick log buttons always visible
   - Auto-create activities shown differently
```

---

## PHASE 3: SCREENS

After Phase 2 components are complete:

### WINDOW 1: Recruiter Screens

```
PROMPT: SCREENS-RECRUITER

cd /Users/sumanthrajkumarnagolu/Projects/intime-v3

Build all Technical Recruiter screens based on USER-ROLES specs.

1. **Read First:**
   - docs/specs/20-USER-ROLES/01-recruiter/00-OVERVIEW.md
   - docs/specs/20-USER-ROLES/01-recruiter/*.md (all 27 workflow files)

2. **Create screens in src/app/(employee)/recruiter/:**

   DASHBOARD:
   - page.tsx (recruiter dashboard with widgets)

   JOBS:
   - jobs/page.tsx (job list with filters)
   - jobs/[id]/page.tsx (job detail with tabs)
   - jobs/new/page.tsx (create job form)

   CANDIDATES:
   - candidates/page.tsx (candidate list)
   - candidates/[id]/page.tsx (candidate detail)
   - candidates/new/page.tsx (add candidate)

   SUBMISSIONS:
   - submissions/page.tsx (submission pipeline)
   - submissions/[id]/page.tsx (submission detail)

   INTERVIEWS:
   - interviews/page.tsx (interview calendar)
   - interviews/[id]/page.tsx (interview detail)

   PLACEMENTS:
   - placements/page.tsx (active placements)
   - placements/[id]/page.tsx (placement detail)

   ACCOUNTS:
   - accounts/page.tsx (my accounts)
   - accounts/[id]/page.tsx (account detail)

3. **Each screen must:**
   - Follow the wireframe from the workflow doc
   - Include activity stream
   - Log activities on actions
   - Check permissions
   - Use the components from Phase 2
```

---

### WINDOW 2: Bench Sales Screens

```
PROMPT: SCREENS-BENCH

cd /Users/sumanthrajkumarnagolu/Projects/intime-v3

Build all Bench Sales screens based on USER-ROLES specs.

1. **Read First:**
   - docs/specs/20-USER-ROLES/02-bench-sales/00-OVERVIEW.md
   - docs/specs/20-USER-ROLES/02-bench-sales/*.md (all 23 workflow files)

2. **Create screens in src/app/(employee)/bench-sales/:**

   DASHBOARD:
   - page.tsx (bench sales dashboard)

   BENCH:
   - bench/page.tsx (bench consultant list)
   - bench/[id]/page.tsx (consultant detail)
   - bench/[id]/marketing/page.tsx (marketing profile)

   HOTLISTS:
   - hotlists/page.tsx (hotlist management)
   - hotlists/[id]/page.tsx (hotlist detail)

   JOB ORDERS:
   - job-orders/page.tsx (job order list)
   - job-orders/[id]/page.tsx (job order detail)
   - job-orders/new/page.tsx (import job order)

   VENDORS:
   - vendors/page.tsx (vendor list)
   - vendors/[id]/page.tsx (vendor detail)

   IMMIGRATION:
   - immigration/page.tsx (visa tracking dashboard)
   - immigration/[id]/page.tsx (case detail)

3. **Bench-specific features:**
   - Visa expiry alerts
   - Rate negotiation tracking
   - Marketing activity log
   - Vendor performance metrics
```

---

### WINDOW 3: Manager & HR Screens

```
PROMPT: SCREENS-MANAGER-HR

cd /Users/sumanthrajkumarnagolu/Projects/intime-v3

Build Manager and HR screens.

1. **Read First:**
   - docs/specs/20-USER-ROLES/04-manager/*.md
   - docs/specs/20-USER-ROLES/05-hr/*.md
   - docs/specs/20-USER-ROLES/06-regional/*.md

2. **Create Manager screens in src/app/(employee)/manager/:**
   - page.tsx (manager dashboard)
   - team/page.tsx (team overview)
   - approvals/page.tsx (pending approvals)
   - performance/page.tsx (team performance)
   - reports/page.tsx (team reports)

3. **Create HR screens in src/app/(employee)/hr/:**
   - page.tsx (HR dashboard)
   - employees/page.tsx (employee directory)
   - employees/[id]/page.tsx (employee detail)
   - leave/page.tsx (leave management)
   - timesheets/page.tsx (timesheet approvals)
   - expenses/page.tsx (expense approvals)
   - onboarding/page.tsx (onboarding tracker)
   - compliance/page.tsx (compliance dashboard)

4. **Create Regional screens in src/app/(employee)/regional/:**
   - page.tsx (regional dashboard)
   - pods/page.tsx (pod management)
   - accounts/page.tsx (regional accounts)

5. **Manager-specific features:**
   - Team activity oversight
   - Approval workflows
   - Performance metrics
   - SLA monitoring
```

---

### WINDOW 4: Executive Screens

```
PROMPT: SCREENS-EXECUTIVE

cd /Users/sumanthrajkumarnagolu/Projects/intime-v3

Build Executive (CFO, COO, CEO) screens.

1. **Read First:**
   - docs/specs/20-USER-ROLES/07-cfo/00-OVERVIEW.md
   - docs/specs/20-USER-ROLES/08-coo/00-OVERVIEW.md
   - docs/specs/20-USER-ROLES/09-ceo/00-OVERVIEW.md

2. **Create CFO screens in src/app/(employee)/finance/:**
   - page.tsx (finance dashboard)
   - commissions/page.tsx (commission approvals)
   - invoices/page.tsx (invoice management)
   - revenue/page.tsx (revenue reports)
   - ar-aging/page.tsx (AR aging)
   - payroll/page.tsx (payroll reconciliation)

3. **Create COO screens in src/app/(employee)/operations/:**
   - page.tsx (operations dashboard)
   - sla/page.tsx (SLA management)
   - processes/page.tsx (process management)
   - notifications/page.tsx (INFORMED feed - all events)
   - escalations/page.tsx (escalation queue)

4. **Create CEO screens in src/app/(employee)/executive/:**
   - page.tsx (CEO strategic dashboard)
   - okrs/page.tsx (OKR tracking)
   - board/page.tsx (board reporting)
   - strategic-accounts/page.tsx (top accounts)

5. **Executive-specific features:**
   - Real-time KPI widgets
   - Drill-down analytics
   - Strategic alerts
   - Board deck generation
```

---

### WINDOW 5: Portal Screens

```
PROMPT: SCREENS-PORTALS

cd /Users/sumanthrajkumarnagolu/Projects/intime-v3

Build Client and Candidate Portal screens.

1. **Read First:**
   - docs/specs/20-USER-ROLES/11-client-portal/*.md
   - docs/specs/20-USER-ROLES/12-candidate-portal/*.md

2. **Create Client Portal in src/app/(portal)/client/:**
   - page.tsx (client dashboard)
   - jobs/page.tsx (my job requisitions)
   - jobs/[id]/page.tsx (job detail)
   - jobs/new/page.tsx (create job)
   - submissions/page.tsx (review submissions)
   - submissions/[id]/page.tsx (submission detail)
   - interviews/page.tsx (interview schedule)
   - placements/page.tsx (active placements)
   - invoices/page.tsx (billing history)

3. **Create Candidate Portal in src/app/(portal)/candidate/:**
   - page.tsx (candidate dashboard)
   - profile/page.tsx (my profile)
   - jobs/page.tsx (job search)
   - jobs/[id]/page.tsx (job detail + apply)
   - applications/page.tsx (my applications)
   - applications/[id]/page.tsx (application detail)
   - interviews/page.tsx (my interviews)
   - placement/page.tsx (my placement - if active)
   - timesheets/page.tsx (submit timesheets)

4. **Portal-specific features:**
   - Simplified navigation
   - Limited data access
   - Self-service focus
   - Mobile-optimized
```

---

### WINDOW 6: Admin & Settings Screens

```
PROMPT: SCREENS-ADMIN

cd /Users/sumanthrajkumarnagolu/Projects/intime-v3

Build Admin and Settings screens.

1. **Read First:**
   - docs/specs/20-USER-ROLES/10-admin/*.md

2. **Create Admin screens in src/app/(employee)/admin/:**
   - page.tsx (admin dashboard)
   - users/page.tsx (user management)
   - users/[id]/page.tsx (user detail)
   - roles/page.tsx (role management)
   - permissions/page.tsx (permission matrix)
   - pods/page.tsx (pod configuration)
   - integrations/page.tsx (integration settings)
   - audit/page.tsx (audit logs)
   - system/page.tsx (system health)

3. **Create Settings screens in src/app/(employee)/settings/:**
   - page.tsx (settings home)
   - profile/page.tsx (my profile)
   - notifications/page.tsx (notification preferences)
   - activities/page.tsx (activity preferences)
   - security/page.tsx (password, 2FA)

4. **Create Organization Settings in src/app/(employee)/org-settings/:**
   - page.tsx (org settings home)
   - general/page.tsx (org info)
   - branding/page.tsx (logos, colors)
   - activity-patterns/page.tsx (pattern configuration)
   - workflows/page.tsx (workflow settings)
   - sla/page.tsx (SLA definitions)
   - templates/page.tsx (email templates)

5. **Admin-specific features:**
   - Bulk operations
   - Import/export
   - Audit trail viewer
   - System health monitoring
```

---

## PHASE 4: INTEGRATION

### WINDOW 1: tRPC Routers

```
PROMPT: TRPC-ROUTERS

cd /Users/sumanthrajkumarnagolu/Projects/intime-v3

Use the trpc skill and database skill. Create tRPC routers for all entities.

1. **Read First:**
   - src/server/routers/ (existing routers)
   - src/lib/db/schema/ (all schemas from Phase 1)

2. **Create routers in src/server/routers/:**

   For each entity, create:
   - list (with pagination, filtering, sorting)
   - getById (with relations)
   - create (with validation)
   - update (with partial updates)
   - delete (soft delete)
   - bulk operations (bulkUpdate, bulkDelete)

   Entity routers needed:
   - jobs.ts, candidates.ts, submissions.ts
   - interviews.ts, offers.ts, placements.ts
   - accounts.ts, contacts.ts, leads.ts, deals.ts
   - bench-consultants.ts, vendors.ts, job-orders.ts
   - employees.ts, leave.ts, timesheets.ts, expenses.ts
   - activities.ts, events.ts, workplans.ts
   - users.ts, pods.ts, roles.ts

3. **Every mutation must:**
   - Validate input with zod
   - Check permissions
   - Create activity record
   - Emit event
   - Return updated entity

4. **Add to src/server/root.ts**
```

---

### WINDOW 2: Activity System

```
PROMPT: ACTIVITY-SYSTEM

cd /Users/sumanthrajkumarnagolu/Projects/intime-v3

Implement the complete activity system based on the framework.

1. **Read First:**
   - docs/specs/20-USER-ROLES/01-ACTIVITIES-EVENTS-FRAMEWORK.md
   - docs/specs/20-USER-ROLES/02-ACTIVITY-PATTERN-LIBRARY.md
   - src/lib/db/schema/workplan.ts

2. **Create in src/lib/activities/:**

   CORE:
   - types.ts (all activity types)
   - patterns.ts (pattern definitions)
   - engine.ts (activity creation engine)
   - sla.ts (SLA calculation)

   SERVICES:
   - createActivity.ts (create manual activity)
   - completeActivity.ts (complete with outcome)
   - rescheduleActivity.ts (reschedule)
   - reassignActivity.ts (reassign)
   - triggerPattern.ts (trigger pattern-based activity)

   QUERIES:
   - getMyActivities.ts (user's activities)
   - getEntityActivities.ts (activities for entity)
   - getOverdueActivities.ts (overdue list)
   - getActivityStats.ts (activity metrics)

3. **Create hooks in src/hooks/:**
   - useActivities.ts
   - useActivityMutations.ts
   - useActivityStream.ts (real-time)

4. **Integrate with entity mutations:**
   - Auto-create activities on entity create
   - Log activities on status changes
   - Trigger patterns on events
```

---

### WINDOW 3: Event System

```
PROMPT: EVENT-SYSTEM

cd /Users/sumanthrajkumarnagolu/Projects/intime-v3

Implement the complete event system.

1. **Read First:**
   - docs/specs/20-USER-ROLES/03-EVENT-TYPE-CATALOG.md
   - docs/specs/20-USER-ROLES/01-ACTIVITIES-EVENTS-FRAMEWORK.md
   - src/lib/db/schema/events.ts

2. **Create in src/lib/events/:**

   CORE:
   - types.ts (268 event types enum)
   - schema.ts (event data schemas)
   - emitter.ts (event emission)
   - handlers.ts (event handlers)

   SERVICES:
   - emitEvent.ts (emit with validation)
   - subscribeToEvents.ts (websocket subscription)
   - getEventHistory.ts (event log query)

   HANDLERS:
   - activityTriggerHandler.ts (create auto-activities)
   - notificationHandler.ts (send notifications)
   - auditHandler.ts (write audit log)
   - webhookHandler.ts (external webhooks)

3. **Create event bus:**
   - src/lib/events/bus.ts (in-memory for dev)
   - Integration with Redis for production

4. **COO INFORMED feed:**
   - Real-time event stream
   - Filtering and severity
   - Notification preferences
```

---

### WINDOW 4-6: Testing

```
PROMPT: TESTING

cd /Users/sumanthrajkumarnagolu/Projects/intime-v3

Use the testing skill. Create comprehensive tests.

1. **Unit Tests (src/__tests__/unit/):**
   - Activity engine tests
   - Event emitter tests
   - Permission checks
   - SLA calculations

2. **Integration Tests (src/__tests__/integration/):**
   - tRPC router tests
   - Activity creation flow
   - Event handling
   - Workflow tests

3. **E2E Tests (e2e/):**
   - Recruiter workflow (create job → submit candidate → place)
   - Bench sales workflow (onboard → market → place)
   - Manager approval workflow
   - Portal workflows

4. **Run tests:**
   pnpm test (unit)
   pnpm test:e2e (E2E)
```

---

## Execution Summary

### Quick Reference: What to Run Where

| Window | Phase 1 | Phase 2 | Phase 3 | Phase 4 |
|--------|---------|---------|---------|---------|
| 1 | DB-CORE | UI-FORMS | SCREENS-RECRUITER | TRPC-ROUTERS |
| 2 | DB-ATS | UI-TABLES | SCREENS-BENCH | ACTIVITY-SYSTEM |
| 3 | DB-CRM | UI-CARDS | SCREENS-MANAGER-HR | EVENT-SYSTEM |
| 4 | DB-BENCH | UI-MODALS | SCREENS-EXECUTIVE | TESTING |
| 5 | DB-HR-ACADEMY | UI-LAYOUTS | SCREENS-PORTALS | TESTING |
| 6 | DB-WORKPLAN | UI-ACTIVITIES | SCREENS-ADMIN | TESTING |

### Skills per Phase

| Phase | Load These Skills |
|-------|-------------------|
| Phase 1 | `database`, domain-specific skill |
| Phase 2 | `metadata` |
| Phase 3 | `metadata`, domain-specific skill |
| Phase 4 | `trpc`, `database`, `testing` |

### Dependencies

```
Phase 1 (Database) ──┐
                     ├──▶ Phase 2 (Components) ──▶ Phase 3 (Screens)
                     │                                    │
                     └──────────────────────────▶ Phase 4 (Integration)
```

---

## Starting Commands

Open 6 terminals and run:

```bash
# All terminals - navigate to project
cd /Users/sumanthrajkumarnagolu/Projects/intime-v3

# Start Claude Code in each
claude

# Then paste the relevant PROMPT from above
```

---

**End of Master Orchestration Plan**
