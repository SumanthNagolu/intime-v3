# InTime v3: Complete Implementation Playbook
## Agent-Driven Development with Human Validation

**Version:** 1.0
**Last Updated:** 2025-11-18
**Status:** Ready for Execution

---

## 📖 Table of Contents

1. [Overview](#overview)
2. [Phase 0: Pre-Flight Setup (Week -1)](#phase-0-pre-flight-setup)
3. [Phase 1: Foundation (Weeks 1-3)](#phase-1-foundation)
4. [Phase 2: Internal Platform (Weeks 4-9)](#phase-2-internal-platform)
5. [Phase 3: External Pillars (Weeks 10-21)](#phase-3-external-pillars)
6. [Repeating Weekly Pattern (SOP)](#repeating-weekly-pattern)
7. [Quality Gates & Checkpoints](#quality-gates)
8. [CLI Commands Reference](#cli-commands)
9. [Troubleshooting & Decisions](#troubleshooting)
10. [Design & Marketing Assets](#design-assets)

---

## 🎯 Overview

### Implementation Philosophy

**Approach:** Agent-driven development with human validation at every handover
**Quality Standard:** Best, only the best, nothing but the best
**Timeline:** No time/cost constraints - quality over speed
**Pattern:** Small implementable user stories (1 day max), test and integrate each before next

### Key Principles

1. **Foundation First:** 2-3 weeks setup before features
2. **Integration Designed Upfront:** Event-driven architecture from day 1 (avoids legacy mistakes)
3. **Small Stories:** 1 day max, fully integrated before next
4. **Continuous Validation:** Human checkpoint at every agent handover
5. **Quality Gates:** No merge without passing all checks
6. **Living Documentation:** Update as we learn

### Agent Collaboration Model

```
PM Agent → Human Approval (30 min)
  ↓
Database Architect → Human Approval (review schema)
  ↓
API Developer + Frontend Developer (parallel) → Human Approval (review code)
  ↓
Integration Specialist → Human Approval (test end-to-end)
  ↓
QA Engineer → Human Approval (review tests)
  ↓
Security Auditor → Human Approval (security check)
  ↓
✓ MERGE TO MAIN
```

### Time Investment

- **Week -1:** 6 hours total (2 hours/day × 3 days) - Blueprint creation
- **Ongoing:** ~3.5 hours/week
  - Story validation: 25-35 min/story × 7 stories = ~3 hours
  - Weekly planning review: 30 min (Friday)

---

## 🏗️ Phase 0: Pre-Flight Setup (Week -1)

**Goal:** Create big picture blueprint before writing any code
**Duration:** 3 days
**Why:** Prevent integration hell, establish patterns, understand system holistically

---

### Day 1: Epic Canvases (Big Picture)

#### Step 1.1: Kickoff Session (9am)

**Start new chat session with PM Agent + CEO Advisor:**

```
"I need you to act as the PM Agent and CEO Advisor working together.

Your task: Create 8 Epic Canvases for InTime v3.

Context:
- Review /CLAUDE.md for business vision (5-pillar model)
- Review /docs/requirements/ for detailed requirements
- Review /docs/architecture/DATABASE-SCHEMA.md for technical context

For each module (Admin, HR, Productivity, Recruiting, Bench Sales,
Training Academy, Talent Acquisition, Cross-Border), create a
1-page Epic Canvas using this template:

Epic Canvas Template:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Epic Name: [Module Name]

🎯 Goal: [One sentence - what does this module achieve?]

💰 Business Value: [Why build this? Revenue impact?]

👥 User Personas: [Who uses this module?]

🎁 Key Features: [5-7 bullet points - not detailed, just high-level]
   - Feature 1
   - Feature 2
   - ...

📊 Success Metrics: [How do we know it's successful?]
   - Metric 1
   - Metric 2

🔗 Dependencies:
   Requires: [What must exist before this?]
   Enables: [What does this unblock?]
   Blocks: [What is blocked by this?]

⏱️ Effort Estimate: [Rough # of weeks, # of stories]

📅 Tentative Timeline: [Week X-Y]

🎨 Design References: [Industry examples to learn from]

🔐 Security Considerations: [Critical security requirements]

📝 Open Questions: [Unknowns to clarify later]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Requirements:
1. Research industry best practices for each module
2. Align with InTime vision (cross-pollination, multi-role, event-driven)
3. Identify dependencies between epics (which must come first?)
4. Estimate rough effort (# of user stories)
5. Propose tentative sequence

Deliverable:
- 8 Epic Canvases (one per module)
- Epic Dependency Map (which epics depend on which)
- Rough 6-month roadmap (epic level only)

Please proceed."
```

**Agent Work Time:** ~5 hours

#### Step 1.2: Human Review Checkpoint (5pm)

**⏱️ Duration:** 2 hours

**Your Review Checklist:**
```
□ Read all 8 epic canvases
□ Validate goals align with business vision
□ Confirm dependencies make sense (Admin before Recruiting?)
□ Check for missing features or modules
□ Approve priority (P0 = must-have, P1 = nice-to-have, P2 = future)
□ Validate rough timelines are realistic

Questions to Ask Yourself:
- Does this epic deliver clear business value?
- Are dependencies correctly identified?
- Is scope reasonable (not too ambitious)?
- Does it align with the 5-pillar model?

Decision Point:
✓ Approve → Proceed to Day 2
✗ Changes needed → Agent revises, re-review tomorrow morning
```

#### Step 1.3: Save Deliverables

```bash
# After approval, ensure agent saves to:
mkdir -p docs/planning/epics

# Files to save:
# docs/planning/epics/01-admin-portal.md
# docs/planning/epics/02-hr-system.md
# docs/planning/epics/03-productivity.md
# docs/planning/epics/04-recruiting.md
# docs/planning/epics/05-bench-sales.md
# docs/planning/epics/06-training-academy.md
# docs/planning/epics/07-talent-acquisition.md
# docs/planning/epics/08-cross-border.md
# docs/planning/epics/epic-dependency-map.md
# docs/planning/epics/roadmap-overview.md
```

**Day 1 Outcome:**
✅ 8 epic canvases approved
✅ Epic dependency map created
✅ Rough 6-month roadmap (epic-level)
✅ Complete understanding of what we're building

---

### Day 2: Event Map (Integration Design)

#### Step 2.1: Event Storming Session (9am)

**Start new chat session with Database Architect + Integration Specialist:**

```
"I need you to act as the Database Architect and Integration Specialist.

Your task: Create comprehensive Event Map for InTime v3.

Context:
- Review epic canvases from Day 1 (docs/planning/epics/)
- Review /docs/architecture/DATABASE-SCHEMA.md
- InTime uses event-driven architecture (critical for cross-pollination)
- Legacy project failed due to poor integration - we're designing it upfront

Steps:
1. Brainstorm ALL business events across modules
   Categories:
   - User/Auth events (user_created, user_role_changed, etc.)
   - HR events (timesheet_submitted, leave_requested, expense_submitted)
   - Recruiting events (job_posted, candidate_matched, submission_created, placement_completed)
   - Training events (course_enrolled, module_completed, quiz_passed)
   - Productivity events (activity_logged, sprint_completed, metric_calculated)
   - Cross-pollination events (lead_detected, opportunity_created)

2. Define standard event schema (use this template):
   {
     event_id: 'uuid',
     event_type: 'user_role_changed',
     timestamp: 'ISO8601',
     version: '1.0',
     actor_id: 'who triggered this event',
     org_id: 'tenant isolation',
     payload: { /* event-specific data */ },
     metadata: {
       source: 'module-name',
       correlation_id: 'uuid for tracing related events'
     }
   }

3. Map event flows:
   For each event, document:
   - Which module emits it?
   - Which modules subscribe to it?
   - What action does each subscriber take?
   - Are there cascading events?

4. Create visual event flow diagram
   Format: Module boxes connected by event arrows

5. Document 30-50 core events in detail

Critical Events to Include:
- course_completed → auto-create candidate profile (cross-pollination!)
- timesheet_submitted → update productivity metrics
- lead_detected → notify recruiting, bench, training modules
- placement_completed → update revenue metrics

Deliverable:
- Event catalog (30-50 events documented)
- Event flow diagram (visual representation)
- Event schema standard (enforced format)
- Cross-module integration map

Please proceed."
```

**Agent Work Time:** ~6 hours

#### Step 2.2: Human Review Checkpoint (5pm)

**⏱️ Duration:** 1.5 hours

**Your Review Checklist:**
```
□ Review event catalog (30-50 events listed?)
□ Validate event flows make sense
  Example validations:
  - course_completed → creates candidate profile? ✓
  - timesheet_submitted → triggers productivity metrics? ✓
  - user_role_changed → updates permissions immediately? ✓
  - lead_detected → notifies all relevant modules? ✓

□ Check for missing events (anything obvious missing?)
□ Validate cross-pollination events exist:
  - lead_detected
  - opportunity_created
  - conversation_analyzed

□ Approve event schema standard (consistent format?)
□ Verify tenant isolation (org_id in all events?)

Critical Questions:
- Can we achieve "1 conversation = 5+ leads" with these events?
- Are modules properly decoupled (communicate via events only)?
- Is event schema extensible (can add fields later)?

Decision Point:
✓ Approve → Proceed to Day 3
✗ Changes needed → Agent revises, re-review
```

#### Step 2.3: Save Deliverables

```bash
# After approval:
mkdir -p docs/architecture/events

# Files to save:
# docs/architecture/events/event-catalog.md
# docs/architecture/events/event-flows.md
# docs/architecture/events/event-schema-standard.md
# docs/architecture/events/cross-module-integration.md
```

**Day 2 Outcome:**
✅ Event-driven architecture designed
✅ Integration planned upfront (not bolted on later)
✅ Cross-pollination mechanics clear
✅ Foundation for decoupled modules
✅ Avoid legacy project's biggest mistake (integration hell)

---

### Day 3: Architecture Patterns (Reusable Templates)

#### Step 3.1: Pattern Library Creation (9am)

**Start new chat session with Database Architect + API Developer + Frontend Developer:**

```
"I need you to act as the Database Architect, API Developer,
and Frontend Developer working together.

Your task: Create reusable Architecture Pattern Library.

Context:
- We'll build 100+ user stories across 8 modules
- Need consistency (same patterns everywhere)
- Need speed (don't reinvent wheel per story)
- Tech stack: Next.js 15, Drizzle ORM, tRPC, shadcn/ui, TypeScript strict mode

Create templates for these 5 patterns:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pattern 1: CRUD Resource
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
When to use: Any entity with create, read, update, delete operations
Examples: User, Employee, Job, Candidate, Course

Components:
1. Database Schema (Drizzle)
2. tRPC Router (API endpoints)
3. Zod Validators (input validation)
4. Helper Functions (CRUD operations)
5. React Components (List, Detail, Form)
6. RLS Policies (row-level security)
7. Tests (integration + E2E)

Provide:
- Code template for each component
- Configuration checklist
- Testing approach
- Example usage

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pattern 2: Approval Workflow
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
When to use: Submit → Approve → Complete flows
Examples: Timesheet approval, Leave requests, Expense claims, Job posting approval

Components:
1. State Machine (draft → submitted → approved/rejected → completed)
2. Transition Functions (validateTransition, executeTransition)
3. Notification Triggers (email on state change)
4. Event Emissions (workflow_state_changed)
5. Approval Chain (single approver vs multi-level)
6. Audit Trail (who approved when)

Provide template code + state diagram

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pattern 3: Dashboard/Metrics
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
When to use: Display aggregated data, charts, KPIs
Examples: HR dashboard, Productivity metrics, Revenue tracking

Components:
1. Data Aggregation Queries (Drizzle aggregations)
2. Chart Components (using recharts or similar)
3. Real-time Updates (Supabase Realtime)
4. Export Functionality (CSV, PDF)
5. Filtering/Date Ranges
6. Caching Strategy (avoid expensive queries)

Provide chart library setup + query patterns

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pattern 4: Form Handling
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
When to use: Any user input form
Examples: Create user, Submit timesheet, Post job

Components:
1. React Hook Form setup
2. Zod schema (validation)
3. Form components (using shadcn/ui)
4. Error handling (field-level + form-level)
5. Success feedback (toast notifications)
6. Loading states (submit button disabled)

Provide form template + validation patterns

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pattern 5: Authentication & Authorization
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
When to use: Protect routes, enforce permissions
Examples: Admin-only pages, Manager approval rights, Org-scoped data

Components:
1. Protected Routes (middleware)
2. Role-based Access Control (RBAC)
3. RLS Policy Templates (org isolation, role-based)
4. Permission Checking Helpers (hasPermission, canAccess)
5. Auth Context (current user, roles, org)

Provide auth guard templates + RLS examples

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Also create ADRs (Architecture Decision Records) for:
- ADR-004: Why custom event bus (vs Supabase Realtime or external service)
- ADR-005: Why shadcn/ui (vs Material-UI or other libraries)
- ADR-006: Why React Hook Form (vs Formik or other solutions)
- ADR-007: Why Drizzle ORM (vs Prisma)
- ADR-008: Why tRPC for all APIs (vs REST or GraphQL)

ADR Template:
- Title
- Status (Accepted/Rejected/Superseded)
- Context (what problem are we solving?)
- Decision (what did we choose?)
- Consequences (trade-offs, benefits, drawbacks)
- Alternatives Considered

Deliverable:
- 5 pattern templates (with code examples)
- 5 ADRs (documented decisions)
- Pattern selection guide (when to use which pattern)

Please proceed."
```

**Agent Work Time:** ~6 hours

#### Step 3.2: Human Review Checkpoint (5pm)

**⏱️ Duration:** 2 hours

**Your Review Checklist:**
```
□ Review all 5 patterns
□ Validate code templates are production-quality
  - TypeScript strict mode (no 'any')
  - Proper error handling
  - Security considerations
  - Accessibility (ARIA labels)

□ Verify patterns align with tech stack
  - Next.js 15 App Router
  - Drizzle ORM syntax
  - tRPC v11
  - shadcn/ui components

□ Review ADRs (decisions make sense? trade-offs clear?)
□ Test one pattern locally (validate it works)

Validation Test:
1. Choose CRUD Resource pattern
2. Copy template code
3. Create simple test resource (e.g., "Post")
4. Run TypeScript compiler → No errors?
5. Try to use it → Does it follow best practices?

Decision Point:
✓ Approve → Week -1 complete, ready for Week 1
✗ Changes needed → Agent refines patterns, re-review tomorrow
```

#### Step 3.3: Save Deliverables

```bash
# After approval:
mkdir -p docs/architecture/patterns
mkdir -p docs/architecture/adrs

# Files to save:
# docs/architecture/patterns/01-crud-resource.md
# docs/architecture/patterns/02-approval-workflow.md
# docs/architecture/patterns/03-dashboard-metrics.md
# docs/architecture/patterns/04-form-handling.md
# docs/architecture/patterns/05-authentication.md
# docs/architecture/patterns/pattern-selection-guide.md
#
# docs/architecture/adrs/ADR-004-custom-event-bus.md
# docs/architecture/adrs/ADR-005-shadcn-ui-components.md
# docs/architecture/adrs/ADR-006-react-hook-form.md
# docs/architecture/adrs/ADR-007-drizzle-orm.md
# docs/architecture/adrs/ADR-008-trpc-apis.md
```

**Day 3 Outcome:**
✅ Reusable patterns documented
✅ Consistency guaranteed across modules
✅ Development accelerated (copy templates, don't reinvent)
✅ Architecture decisions documented (ADRs)
✅ Quality standards established

---

### Week -1 Complete: Foundation Blueprint Ready ✅

**📦 Deliverables Created:**
```
docs/planning/epics/
  ├── 01-admin-portal.md
  ├── 02-hr-system.md
  ├── 03-productivity.md
  ├── 04-recruiting.md
  ├── 05-bench-sales.md
  ├── 06-training-academy.md
  ├── 07-talent-acquisition.md
  ├── 08-cross-border.md
  ├── epic-dependency-map.md
  └── roadmap-overview.md

docs/architecture/events/
  ├── event-catalog.md (30-50 events)
  ├── event-flows.md (visual diagrams)
  ├── event-schema-standard.md
  └── cross-module-integration.md

docs/architecture/patterns/
  ├── 01-crud-resource.md
  ├── 02-approval-workflow.md
  ├── 03-dashboard-metrics.md
  ├── 04-form-handling.md
  ├── 05-authentication.md
  └── pattern-selection-guide.md

docs/architecture/adrs/
  ├── ADR-004-custom-event-bus.md
  ├── ADR-005-shadcn-ui-components.md
  ├── ADR-006-react-hook-form.md
  ├── ADR-007-drizzle-orm.md
  └── ADR-008-trpc-apis.md
```

**🎯 Your Understanding:**
✅ Know what to build (8 epic canvases)
✅ Know how it integrates (event map with 30-50 events)
✅ Know patterns to follow (5 reusable templates)
✅ Architecture decisions documented (5 ADRs)
✅ Ready to execute Week 1

**⏱️ Time Investment:** 6 hours total (2 hours/day validation)
**🎉 Value Created:** Complete system blueprint, integration designed upfront

---

## 🏗️ Phase 1: Foundation (Weeks 1-3)

---

## Week 1: Database Foundation

**Goal:** Create unified database schema with RLS policies
**Stories:** 5-7 user stories
**Pattern:** CRUD Resource pattern for all tables
**Human Time:** ~3.5 hours (validation + planning)

---

### FRIDAY (Week 0): Plan Week 1 Stories

#### Step W1.0: Story Breakdown Session (Friday 3pm)

**Start new chat session with PM Agent:**

```
"I need you to act as the PM Agent.

Your task: Break down 'Database Foundation' epic into Week 1 user stories.

Context:
- Review docs/planning/epics/ (especially Admin portal needs)
- Review docs/architecture/events/event-catalog.md (what tables needed for events?)
- Review docs/architecture/DATABASE-SCHEMA.md (proposed schema)
- Review docs/architecture/patterns/01-crud-resource.md (follow this pattern)

Requirements:
- Create 5-7 user stories for Week 1
- Each story = 1 day or less of work
- Follow format: 'As a [persona], I need [feature], so that [benefit]'
- Include specific, testable acceptance criteria
- Sequence stories (identify dependencies)
- Estimate effort (Small/Medium/Large)

Focus on Week 1 core tables:
1. user_profiles, roles, user_roles (multi-role support)
2. organizations, org_members (multi-tenancy)
3. teams, team_members (team structure)
4. permissions, role_permissions (RBAC)
5. notifications (user notifications)
6. system_events (for event bus foundation)
7. audit_logs (compliance)

For each story, specify:
- Database migration filename (e.g., 001_create_users.sql)
- Drizzle schema filename (e.g., users.ts)
- RLS policies required
- Helper functions needed (createUser, getUserById, etc.)
- Test coverage required (integration tests)

Story Template:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Story #X: [Title]

As a [persona],
I need [feature],
So that [business benefit].

Acceptance Criteria:
✓ [Specific, testable criterion 1]
✓ [Specific, testable criterion 2]
✓ ...

Technical Implementation:
- Migration: src/lib/db/migrations/00X_[name].sql
- Schema: src/lib/db/schema/[name].ts
- RLS Policies: [list policies]
- Helpers: src/lib/db/queries/[name].ts
- Tests: tests/integration/[name].test.ts

Effort: Small/Medium/Large (4/6/8 hours)
Dependencies: [Story #Y must complete first, or None]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Deliverable: Week 1 Story Breakdown document with 5-7 sequenced stories

Please proceed."
```

**Agent Work Time:** ~2 hours

#### Step W1.1: Human Review (Friday Evening or Saturday Morning)

**⏱️ Duration:** 30 minutes

**Your Review Checklist:**
```
□ Read all proposed stories
□ Validate each story has:
  - Clear user persona
  - Specific acceptance criteria (testable)
  - Technical implementation plan
  - Realistic effort estimate

□ Check sequencing:
  - Story 1: Core users (no dependencies) ✓
  - Story 2: Organizations (depends on users?) ✓
  - Story 3: Roles (depends on users?) ✓
  - Are dependencies logical?

□ Confirm stories are small enough (1 day max each)
□ Verify coverage of core foundation tables
□ Approve or request changes

Review Example:
You're reading Story 1:
"As a system administrator, I need a unified user management
system that supports multiple roles and organizations, so that
users can have different permissions across different contexts.

Acceptance Criteria:
✓ user_profiles table with id, email, name, timestamps
✓ roles table with predefined roles (admin, recruiter, student, etc.)
✓ user_roles junction table for many-to-many
✓ RLS policies enforce org-level isolation
✓ Soft delete support (deleted_at field)
✓ Helper functions: createUser(), getUserById(), updateUser()
✓ Integration tests with 90%+ coverage"

Questions to ask:
- Is this achievable in 1 day? ✓
- Are acceptance criteria specific enough? ✓
- Does this align with epic canvas? ✓
- Any missing requirements? Add if needed

Decision Point:
✓ Approve all stories → Week 1 execution begins Monday
✗ Request changes → PM agent revises, re-review Monday morning
```

#### Step W1.2: Save Week 1 Plan

```bash
# After approval:
mkdir -p docs/planning/sprints/week-01

# Agent saves:
# docs/planning/sprints/week-01/stories.md (all stories summary)
# docs/planning/sprints/week-01/story-01-core-user-tables.md
# docs/planning/sprints/week-01/story-02-organizations.md
# ... (one file per story)
```

**Friday Outcome:**
✅ Week 1 stories approved and documented
✅ Sequence clear (know what to build Monday)
✅ Ready to execute

---

### MONDAY-THURSDAY: Execute Week 1 Stories

**Daily Pattern:** Build 1-2 stories per day
**Execution Mode:** Multi-agent parallel work with human validation

---

### MONDAY: Story 1 - Core User Tables

#### Step M1.1: Multi-Agent Kickoff (9am)

**Run 3 agents IN PARALLEL (use separate chat windows):**

**🔵 Chat Window 1: Database Architect**
```
"Act as Database Architect.

Task: Implement Story 1 - Core User Tables

Reference:
- docs/planning/sprints/week-01/story-01-core-user-tables.md
- docs/architecture/patterns/01-crud-resource.md
- docs/architecture/DATABASE-SCHEMA.md

Create:
1. Migration file: src/lib/db/migrations/001_create_users.sql
   - user_profiles table (id, email, name, created_at, updated_at, deleted_at)
   - roles table (id, name, description)
   - user_roles junction table (user_id, role_id)
   - Indexes on foreign keys

2. RLS policies in migration:
   - Users can only see users in their organization
   - Admins can see all users in their org
   - Soft deleted users hidden from queries

3. Drizzle schema: src/lib/db/schema/users.ts
   - TypeScript types matching SQL schema
   - Zod validators for insert/update

4. Documentation:
   - Comments in migration explaining RLS policies
   - JSDoc comments in schema file

Requirements:
- PostgreSQL 15+ syntax
- Follow Drizzle ORM conventions
- Use UUID for IDs
- Include up AND down migrations
- TypeScript strict mode (no 'any')

Deliverable: Migration + schema files ready for review"
```

**🟢 Chat Window 2: API Developer**
```
"Act as API Developer.

Task: Create helper functions for User CRUD operations

Prerequisites: Wait for Database Architect to complete schema

Reference:
- docs/planning/sprints/week-01/story-01-core-user-tables.md
- docs/architecture/patterns/01-crud-resource.md

Create:
1. src/lib/db/queries/users.ts
   Functions:
   - createUser(data: InsertUser) → User
   - getUserById(id: string) → User | null
   - getUserByEmail(email: string) → User | null
   - updateUser(id: string, data: Partial<User>) → User
   - deleteUser(id: string) → void (soft delete)
   - listUsers(orgId: string, filters?) → User[]
   - assignRole(userId: string, roleId: string) → void
   - removeRole(userId: string, roleId: string) → void
   - getUserRoles(userId: string) → Role[]

2. Implement using Drizzle ORM
3. Add comprehensive error handling (try/catch)
4. Add JSDoc comments for each function
5. Follow TypeScript strict mode

Deliverable: User query helper functions ready for testing"
```

**🟡 Chat Window 3: QA Engineer**
```
"Act as QA Engineer.

Task: Write integration tests for User CRUD operations

Prerequisites: Wait for API Developer to complete query functions

Reference:
- docs/planning/sprints/week-01/story-01-core-user-tables.md
- docs/architecture/patterns/01-crud-resource.md (testing section)

Create:
1. tests/integration/users.test.ts

Test Cases:
describe('User Management', () => {
  describe('createUser', () => {
    it('creates user with valid data')
    it('rejects duplicate email')
    it('requires name and email')
    it('auto-generates UUID for id')
    it('sets created_at timestamp')
  })

  describe('getUserById', () => {
    it('returns user when exists')
    it('returns null when not found')
    it('hides soft-deleted users')
  })

  describe('RLS Policies', () => {
    it('prevents cross-org access')
    it('allows admin to see all org users')
    it('user can see own profile')
  })

  describe('Multi-role Support', () => {
    it('assigns multiple roles to user')
    it('removes role from user')
    it('lists all user roles')
  })

  describe('Soft Delete', () => {
    it('sets deleted_at when deleting')
    it('preserves user data after delete')
    it('excludes deleted users from queries')
  })
})

Requirements:
- Use Vitest framework
- Set up test database (separate from dev)
- Clean up after each test (delete test data)
- Aim for 90%+ code coverage
- Test both happy paths and error cases

Deliverable: Comprehensive test suite with all tests passing"
```

**Agent Work Time:** ~4-6 hours (parallelized, actual elapsed time ~6 hours)

#### Step M1.2: Integration Checkpoint (3pm)

**Your Actions:**
```bash
# Create feature branch
git checkout -b story-01-core-user-tables

# Copy files from agent outputs:
# From Chat 1 (Database Architect):
# - Copy migration file to src/lib/db/migrations/001_create_users.sql
# - Copy schema file to src/lib/db/schema/users.ts

# From Chat 2 (API Developer):
# - Copy query helpers to src/lib/db/queries/users.ts

# From Chat 3 (QA Engineer):
# - Copy tests to tests/integration/users.test.ts

# Run migration locally:
pnpm drizzle-kit push

# Verify tables created:
pnpm drizzle-kit studio
# (Opens browser GUI - check tables exist)

# Run tests:
pnpm test tests/integration/users.test.ts

# Expected result:
# ✓ All tests passing
# ✓ Coverage >90%
```

#### Step M1.3: Human Review & Validation (3:30pm)

**⏱️ Duration:** 30 minutes

**Review Checklist:**
```
Code Quality Review (15 min):
□ Read migration SQL
  - Tables look correct?
  - RLS policies make sense?
  - Indexes on foreign keys?
  - Up AND down migrations present?

□ Read Drizzle schema
  - Types match SQL schema?
  - Zod validators present?
  - No 'any' types?

□ Read query functions
  - Using Drizzle ORM correctly?
  - Error handling present?
  - JSDoc comments clear?

□ Read tests
  - All acceptance criteria covered?
  - Edge cases tested?
  - RLS policies tested?

Manual Testing (15 min):
□ Run tests locally → All passing?
□ Try to create user:
  const user = await createUser({
    email: 'test@example.com',
    name: 'Test User',
    org_id: 'org-123'
  });
  console.log(user); // Should return created user

□ Try to assign role:
  await assignRole(user.id, 'admin-role-id');
  const roles = await getUserRoles(user.id);
  console.log(roles); // Should include admin role

□ Try to query as different org user:
  // Set session to different org
  // Query for user → Should be blocked by RLS ✓

□ Try to soft delete:
  await deleteUser(user.id);
  const deletedUser = await getUserById(user.id);
  console.log(deletedUser); // Should be null ✓

Security Validation:
□ RLS policies present on ALL tables?
□ No SQL injection possible? (using parameterized queries?)
□ Soft delete working (deleted_at)?
□ Passwords handled securely? (hashed, not in this story but verify plan)

Code Quality:
□ TypeScript strict mode (run: pnpm tsc --noEmit)?
□ ESLint passing (run: pnpm lint)?
□ No console.logs in production code?
□ All functions have JSDoc comments?

Decision Point:
✓ Approve → Proceed to Security Audit
✗ Request changes → List specific issues, agent revises
```

#### Step M1.4: Security Audit (4pm - Automated)

**Run Security Auditor agent:**

```bash
# Chat Window 4: Security Auditor

"Act as Security Auditor.

Task: Security review of Story 1 implementation

Review files:
- src/lib/db/migrations/001_create_users.sql
- src/lib/db/schema/users.ts
- src/lib/db/queries/users.ts
- tests/integration/users.test.ts

Security Checklist:
1. SQL Injection
   □ Are all queries parameterized?
   □ No string concatenation for SQL?

2. RLS (Row Level Security)
   □ RLS enabled on all tables?
   □ Policies correctly enforce org isolation?
   □ No bypass possible?

3. Authentication & Authorization
   □ User verification before queries?
   □ Role checks where needed?
   □ No hardcoded credentials?

4. Sensitive Data
   □ Passwords hashed (if applicable)?
   □ Email addresses protected?
   □ PII (Personally Identifiable Information) secured?

5. OWASP Top 10
   □ No broken access control?
   □ No cryptographic failures?
   □ No injection vulnerabilities?

6. Test Coverage
   □ Security boundaries tested?
   □ RLS policies tested?
   □ Error handling tested?

Deliverable:
- Security report (Pass/Fail for each check)
- List of vulnerabilities (if any) with severity (Critical/Medium/Low)
- Recommendations for fixes

Please proceed."
```

**Agent Work Time:** ~30 minutes

**Your Review:**
```
⏱️ Duration: 10 minutes

□ Read security report
□ Review any flagged issues
□ Verify critical issues = 0
□ Check medium issues addressed or justified
□ Low issues documented for future

Decision Point:
✓ Pass (0 critical, acceptable medium/low) → Approve merge
✗ Fail (critical issues) → MUST fix before merge
```

#### Step M1.5: Final Approval & Merge (4:30pm)

**After all checks pass:**

```bash
# Commit with descriptive message
git add .
git commit -m "feat(database): implement core user tables with multi-role support

- Add user_profiles, roles, user_roles tables
- Implement RLS policies for org-level isolation
- Create Drizzle schema and query helpers
- Add soft delete support (deleted_at)
- Comprehensive integration tests (92% coverage)

Story: #001
Acceptance Criteria: All met ✓
Reviewed-by: Human ✓
Security: Passed ✓
Tests: 92% coverage ✓

Co-authored-by: Database Architect Agent <agent@intime.ai>
Co-authored-by: API Developer Agent <agent@intime.ai>
Co-authored-by: QA Engineer Agent <agent@intime.ai>"

# Push to remote
git push origin story-01-core-user-tables

# Merge to main (via GitHub PR or direct)
git checkout main
git merge story-01-core-user-tables
git push origin main

# Delete feature branch (cleanup)
git branch -d story-01-core-user-tables
git push origin --delete story-01-core-user-tables
```

**✅ Monday Complete:**
- Story 1 merged to main
- Core user tables working
- All tests passing (92% coverage)
- Security approved
- Foundation for Week 1 established

**⏱️ Your Time:** ~50 minutes total
- Integration checkpoint: 10 min
- Code review: 30 min
- Security review: 10 min

---

### TUESDAY-THURSDAY: Stories 2-7

**Repeat the exact same pattern for remaining Week 1 stories:**

**Tuesday:**
- Story 2: Organization Multi-Tenancy (orgs, org_members tables)
- Pattern: Same as Monday (multi-agent → integration → review → security → merge)

**Wednesday:**
- Story 3: Roles and Permissions (permissions, role_permissions tables)
- Story 4: Team Structure (teams, team_members tables) - if time allows

**Thursday:**
- Story 5: Notification Tables (notifications, notification_preferences)
- Story 6: System Events (system_events for event bus)

**Optional (if ahead of schedule):**
- Story 7: Audit Logs (audit_logs table)

**Each day follows:**
```
09:00 - Multi-agent kickoff
15:00 - Integration checkpoint
15:30 - Human review (30 min)
16:00 - Security audit
16:30 - Merge to main
17:00 - Story complete
```

---

### FRIDAY: Integration Testing & Retrospective

#### Step F1.1: Week 1 Integration Testing (Morning)

**⏱️ Duration:** 2-3 hours

**End-to-End Validation:**

```bash
# Create test script: tests/integration/week-01-integration.test.ts

describe('Week 1 Integration - Database Foundation', () => {
  it('creates complete user workflow', async () => {
    // 1. Create organization
    const org = await createOrganization({
      name: 'Test Company',
      slug: 'test-company'
    });

    // 2. Create user in org
    const user = await createUser({
      email: 'john@testcompany.com',
      name: 'John Doe',
      org_id: org.id
    });

    // 3. Assign multiple roles
    await assignRole(user.id, 'recruiter-role-id');
    await assignRole(user.id, 'manager-role-id');

    // 4. Create team
    const team = await createTeam({
      name: 'Recruiting Team',
      org_id: org.id
    });

    // 5. Add user to team
    await addTeamMember(team.id, user.id);

    // 6. Verify cross-org isolation (RLS)
    const org2 = await createOrganization({
      name: 'Different Company'
    });
    const user2 = await createUser({
      email: 'jane@different.com',
      org_id: org2.id
    });

    // User 2 should NOT see User 1's data
    // Set session context to user2
    const users = await listUsers(org2.id);
    expect(users).not.toContainEqual(user);

    // 7. Verify event emissions
    const events = await getSystemEvents();
    expect(events).toContainEvent('user_created');
    expect(events).toContainEvent('user_role_changed');
    expect(events).toContainEvent('team_member_added');

    // 8. Verify audit logs
    const auditLogs = await getAuditLogs({ user_id: user.id });
    expect(auditLogs.length).toBeGreaterThan(0);

    // 9. Soft delete
    await deleteUser(user.id);
    const deletedUser = await getUserById(user.id);
    expect(deletedUser).toBeNull();

    // But data still in database (soft delete)
    const rawUser = await db.query.users.findFirst({
      where: eq(users.id, user.id)
    });
    expect(rawUser).toBeDefined();
    expect(rawUser.deleted_at).toBeDefined();
  });
});
```

**Run integration tests:**
```bash
pnpm test tests/integration/week-01-integration.test.ts
```

**Expected Result:**
```
✓ creates complete user workflow (1523ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Coverage:    87.3% statements
```

**Manual Validation Checklist:**
```
□ Can create organization? ✓
□ Can create users in that org? ✓
□ Can assign multiple roles to user? ✓
□ Can create teams with members? ✓
□ Does RLS prevent cross-org access? ✓
□ Are audit logs being created? ✓
□ Are system events being emitted? ✓
□ Soft delete working correctly? ✓

Result:
✓ All integration tests passing → Week 1 SUCCESS
✗ Issues found → Fix before Week 2
```

#### Step F1.2: Week 1 Retrospective (Lunch)

**⏱️ Duration:** 30 minutes

**Reflection Questions:**

```
What went well?
□ Agent code quality acceptable? (If yes, what %)
□ Review process smooth? (Average time per story?)
□ Timeline met? (Planned 5-7 stories, completed X)
□ Communication clear? (Agent outputs understandable?)
□ Quality high? (Test coverage, security, etc.)

What could improve?
□ Agent mistakes common? (List recurring issues)
  - If yes: Refine agent prompts with specific guidance
□ Review taking too long? (If >35 min per story)
  - Simplify checklist or add more automation?
□ Tests insufficient? (Coverage <80%?)
  - Add more specific test requirements to prompts
□ Integration issues? (Features broke each other?)
  - Better dependency management needed?

Metrics:
- Stories completed: X/7
- Average time per story: Y hours
- Test coverage: Z%
- Critical bugs found: N
- Rework rate: R% (stories needing revision)

Adjustments for Week 2:
□ Agent prompt improvements (if needed)
□ Review checklist refinements
□ Additional quality gates?
□ Better templates/patterns?
□ Time estimates accurate? (adjust if needed)

Action Items:
1. [Specific improvement]
2. [Specific improvement]
3. ...
```

**Document learnings:**
```bash
# Save retrospective:
# docs/planning/sprints/week-01/retrospective.md
```

#### Step F1.3: Plan Week 2 Stories (Afternoon)

**Run PM Agent (2pm):**

```
"Act as PM Agent.

Task: Break down Week 2 epic (Auth + UI Foundation) into user stories.

Context:
- Week 1 complete: Database foundation working ✓
- Review docs/planning/epics/ for Week 2 scope
- Week 2 focus: Supabase Auth + shadcn/ui + Design System + Figma integration

Week 2 Goals:
1. Authentication System
   - Supabase Auth integration (email + OAuth)
   - Login/Signup pages
   - Password reset flow
   - Email verification
   - Protected routes (middleware)

2. UI Foundation
   - shadcn/ui installation + configuration
   - Design system setup (Tailwind colors, typography)
   - Figma design import (we have Figma Premium)
   - Layout components (dashboard sidebar, header, footer)
   - Form system (React Hook Form + Zod integration)

3. Design Assets Integration
   - Export designs from Figma
   - Convert to React components
   - Establish design tokens (colors, spacing, typography)

Create 5-7 user stories for Week 2, sequenced appropriately.

Reference patterns:
- docs/architecture/patterns/04-form-handling.md
- docs/architecture/patterns/05-authentication.md

Deliverable: Week 2 story breakdown

Please proceed."
```

**Agent Work Time:** ~2 hours

**Your Review:** Friday evening or Saturday morning (30 min)

**Approval:** Week 2 ready to execute Monday

---

### Week 1 Complete Summary ✅

**Deliverables:**
```
✅ 5-7 database tables with RLS policies
✅ Drizzle schemas and query helpers
✅ Comprehensive integration tests (>85% coverage)
✅ Security audited and approved
✅ All code merged to main
✅ Event bus foundation (system_events table)
✅ Audit logging (audit_logs table)
```

**⏱️ Time Investment:**
- Monday-Thursday: ~3 hours (50 min/day × 4 days)
- Friday: ~3 hours (integration testing + retrospective + planning)
- Total: ~6 hours human time

**🎯 Value Created:**
- Production-ready database foundation
- Multi-tenancy working
- RLS security enforced
- Event system ready
- Ready for Week 2 (Auth + UI)

---

## 🔁 Repeating Weekly Pattern (Standard Operating Procedure)

**Once Week 1 is complete, every week follows this exact pattern:**

```
┌─────────────────────────────────────────────────────┐
│  STANDARD WEEKLY EXECUTION TEMPLATE                 │
│  (Copy this for each subsequent week)               │
└─────────────────────────────────────────────────────┘

FRIDAY (Previous Week): Plan Next Week
───────────────────────────────────────────────────────
Time: 2-3 hours (mostly agent work, 30 min human review)

□ PM Agent: Research + propose 5-7 stories for next week
□ Human Review: 30 min
  - Read story breakdown
  - Approve/adjust stories
  - Confirm sequencing
  - Mark priority (P0/P1/P2)
□ Save: docs/planning/sprints/week-XX/stories.md
□ Outcome: Week XX ready to execute Monday

MONDAY-THURSDAY: Execute Stories (1-2 per day)
───────────────────────────────────────────────────────
For EACH story:

09:00 - Multi-Agent Kickoff
  Run 3-4 agents in parallel:
  □ Database Architect (if schema changes)
  □ API Developer (backend logic)
  □ Frontend Developer (UI components)
  □ QA Engineer (tests)

  Agent work time: ~4-6 hours (parallelized)

15:00 - Integration Checkpoint (10 min)
  □ Pull agent code to local branch
  □ Run migrations (if any)
  □ Run tests
  □ Expected: All tests passing

15:30 - Human Review (30 min)
  □ Code quality check
    - Read diffs
    - TypeScript strict? No 'any'?
    - Error handling present?
    - Comments/docs clear?

  □ Manual testing
    - Test happy path
    - Test edge cases (empty, null, invalid)
    - Test security (try to bypass auth/RLS)

  □ Test review
    - Coverage >80%?
    - All acceptance criteria tested?

  Decision:
  ✓ Approve → Continue to security audit
  ✗ Request changes → Agent revises

16:00 - Security Audit (15 min - automated)
  □ Security Auditor agent reviews code
  □ Checks: SQL injection, RLS, auth, OWASP Top 10
  □ Human reviews security report
  □ Decision:
    ✓ Pass → Approve merge
    ✗ Critical issues → MUST fix before merge

16:30 - Merge to Main
  □ Commit with descriptive message
  □ Push to main branch
  □ Delete feature branch
  □ Update status (Story X complete ✓)

17:00 - Story COMPLETE
  Move to next story tomorrow

FRIDAY: Integration + Retrospective + Planning
───────────────────────────────────────────────────────
Morning (2-3 hours):
  □ Integration testing
    - Create end-to-end test for week's work
    - Test cross-feature interactions
    - Validate all stories work together

  □ Week XX demo (optional but recommended)
    - Show completed features
    - Record for documentation
    - Share with stakeholders

Midday (30 min):
  □ Retrospective
    - What went well?
    - What could improve?
    - Metrics (stories completed, coverage, etc.)
    - Action items for next week

  □ Document: docs/planning/sprints/week-XX/retrospective.md

Afternoon (2-3 hours):
  □ Plan Week XX+1
    - PM Agent proposes stories
    - Human reviews and approves (30 min)

  □ Outcome: Next week ready to start Monday
```

---

## 📊 Quality Gates & Checkpoints

### Automated Quality Gates (Run Before Every Merge)

```bash
# Create pre-merge checklist script:
# scripts/pre-merge-check.sh

#!/bin/bash
set -e

echo "🔍 Running pre-merge quality checks..."

echo "1️⃣ TypeScript compilation..."
pnpm tsc --noEmit
echo "✅ TypeScript: No errors"

echo "2️⃣ ESLint..."
pnpm lint
echo "✅ ESLint: Passing"

echo "3️⃣ Tests..."
pnpm test
echo "✅ Tests: All passing"

echo "4️⃣ Test Coverage..."
pnpm test:coverage
# Fail if coverage <80%
COVERAGE=$(pnpm test:coverage --silent | grep "All files" | awk '{print $4}' | sed 's/%//')
if [ "$COVERAGE" -lt 80 ]; then
  echo "❌ Coverage: $COVERAGE% (minimum 80% required)"
  exit 1
fi
echo "✅ Coverage: $COVERAGE%"

echo "5️⃣ Build..."
pnpm build
echo "✅ Build: Successful"

echo "6️⃣ Security Scan (optional)..."
pnpm audit --audit-level=high
echo "✅ Security: No critical vulnerabilities"

echo ""
echo "🎉 All quality checks passed!"
echo "✓ TypeScript: No errors"
echo "✓ ESLint: Passing"
echo "✓ Tests: Passing"
echo "✓ Coverage: $COVERAGE%"
echo "✓ Build: Successful"
echo "✓ Security: Clean"
echo ""
echo "Ready to merge! 🚀"
```

**Run before every merge:**
```bash
./scripts/pre-merge-check.sh
# If all pass → Merge approved ✓
# If any fail → Fix before merging ✗
```

### Human Validation Checklist (Per Story)

**⏱️ Time Budget:** 25-35 minutes per story

```
CODE REVIEW (10-15 min):
──────────────────────────────────────────────────────
□ Read code diffs (GitHub PR or local diff)
□ TypeScript strict mode? (no 'any' types)
□ Proper error handling? (try/catch, validation)
□ Comments/docs present? (JSDoc on functions)
□ Follows architecture patterns? (CRUD, forms, etc.)
□ No obvious bugs? (logic errors, infinite loops)
□ Security considerations? (no hardcoded secrets, SQL injection, XSS)

MANUAL TESTING (10-15 min):
──────────────────────────────────────────────────────
□ Pull branch locally: git checkout story-XX-name
□ Run migrations (if any): pnpm drizzle-kit push
□ Start dev server: pnpm dev
□ Test happy path:
  - Feature works as expected?
  - UI looks correct?
  - Forms validate properly?

□ Test edge cases:
  - Empty inputs?
  - Null values?
  - Invalid data?
  - Very long strings?
  - Special characters?

□ Test security:
  - Can bypass authentication?
  - Can access other org's data?
  - Can inject SQL or XSS?

TEST REVIEW (5 min):
──────────────────────────────────────────────────────
□ Run tests: pnpm test
□ Coverage >80%? (check report)
□ Happy path tested?
□ Edge cases tested?
□ Security boundaries tested? (RLS, auth)
□ Tests are understandable? (good descriptions)

DECISION:
──────────────────────────────────────────────────────
✓ APPROVE → Proceed to security audit
  All checks passed
  Confidence level high
  Ready for production

✗ REQUEST CHANGES → Send back to agent
  List specific issues found
  Agent revises and resubmits
  Re-review when ready

⚠️ APPROVE WITH NOTES → Proceed but document concerns
  Minor issues acceptable
  Add TODO for future improvement
  Document in commit message
```

---

## 🛠️ CLI Commands Reference

### Common Commands (Daily Use)

```bash
# DATABASE
pnpm drizzle-kit generate    # Generate migration from schema changes
pnpm drizzle-kit push        # Push migration to database
pnpm drizzle-kit studio      # Open Drizzle Studio (database GUI)
pnpm drizzle-kit drop        # Drop migration (use carefully!)

# TESTING
pnpm test                    # Run all tests
pnpm test:watch              # Watch mode (re-run on file change)
pnpm test:coverage           # Coverage report
pnpm test tests/integration/users.test.ts  # Run specific test file

# DEVELOPMENT
pnpm dev                     # Start Next.js dev server (localhost:3000)
pnpm build                   # Production build
pnpm start                   # Start production server
pnpm lint                    # ESLint check
pnpm lint:fix                # ESLint auto-fix
pnpm tsc --noEmit            # TypeScript type check (no build)

# GIT WORKFLOW
git status                   # Check current status
git checkout -b story-XX-name  # Create feature branch
git add .                    # Stage all changes
git commit -m "message"      # Commit with message
git push origin story-XX-name  # Push to remote
git checkout main            # Switch to main
git merge story-XX-name      # Merge feature branch
git branch -d story-XX-name  # Delete local branch
git push origin --delete story-XX-name  # Delete remote branch

# QUALITY CHECKS
./scripts/pre-merge-check.sh  # Run all quality gates
pnpm audit                   # Security vulnerability scan
pnpm outdated                # Check for outdated packages

# AGENT ORCHESTRATION (if using custom tools)
pnpm orchestrate:feature "feature-name"  # Run feature workflow
pnpm orchestrate:database "table-name"   # Run database workflow
pnpm timeline:add "message"  # Add timeline entry
pnpm timeline:list           # View timeline history
```

### Running Multiple Agents in Parallel

**Option 1: Multiple Browser Tabs/Windows (Recommended)**
```
1. Open 3-4 chat windows in Claude Code
2. Paste different agent prompts simultaneously
3. Agents work in parallel
4. Copy outputs to local files when ready

Agents to run in parallel:
- Tab 1: Database Architect (schema + migration)
- Tab 2: API Developer (backend logic)
- Tab 3: Frontend Developer (UI components)
- Tab 4: QA Engineer (tests)

Coordination:
- API Developer waits for schema (dependency)
- Frontend Developer waits for API (dependency)
- QA Engineer waits for both (dependency)
- But all can start their research/planning simultaneously
```

**Option 2: Terminal Multiplexing (tmux/screen)**
```bash
# Using tmux for parallel CLI work
tmux new-session -s agents
tmux split-window -h
tmux split-window -v

# Run different commands in each pane
# Useful if agents provide CLI tools
```

**Option 3: Orchestration CLI (if implemented)**
```bash
# Future enhancement: Custom orchestration tool
pnpm orchestrate:story 1 --parallel \
  --agents="architect,api-dev,frontend-dev,qa"

# Would run all agents in parallel and combine outputs
```

---

## 🚨 Troubleshooting & Decision Framework

### Common Issues & Solutions

#### Issue 1: Agent Code Quality Poor

**Symptoms:**
- TypeScript errors
- ESLint failures
- Tests not comprehensive (<80% coverage)
- Security vulnerabilities
- Logic bugs
- Doesn't follow patterns

**Root Causes:**
- Agent prompts too vague
- Missing examples
- No reference to pattern library
- Agent not understanding context

**Solutions:**

1. **Refine Agent Prompts**
   ```
   Before: "Create user CRUD functions"

   After: "Create user CRUD functions following the pattern in
   docs/architecture/patterns/01-crud-resource.md. Use Drizzle ORM,
   TypeScript strict mode (no 'any'), include error handling, add
   JSDoc comments, follow naming convention: createX, getXById,
   updateX, deleteX. Reference example: src/lib/db/queries/posts.ts"
   ```

2. **Provide Examples**
   - Show good code vs bad code
   - Reference existing working code
   - Include in pattern library

3. **Use Pattern Library**
   - Always point agents to relevant pattern
   - Update patterns when you discover better approaches

4. **Iterative Improvement**
   - Agent learns from your feedback
   - If same mistake repeats, update prompt permanently

5. **Human Override**
   - For critical code (auth, payments, security), consider human-written
   - Agents can still write tests and documentation

**Decision Rule:**
```
If >30% of agent code needs rework:
  → Refine prompts, add more examples

If >50% needs rework:
  → Consider human-written for this story
  → Or break story into smaller pieces

If agent improves over time:
  → Continue with refined prompts
  → Document learnings in pattern library
```

---

#### Issue 2: Timeline Slipping

**Symptoms:**
- Stories taking >1 day each
- Week goals not met (completed <5 stories when planned 7)
- Integration issues piling up
- Human review taking >35 min per story

**Root Causes:**
- Stories too large (should be <1 day)
- Underestimated complexity
- Too many dependencies
- Agent rework taking time
- Scope creep

**Solutions:**

1. **Break Stories Smaller**
   ```
   Before: "Implement entire user management system" (3 days)

   After:
   - Story 1: Create user table (1 day)
   - Story 2: Add role assignment (1 day)
   - Story 3: Build user list UI (1 day)
   ```

2. **Reduce Scope**
   - Defer P1 features to next week
   - Focus only on P0 (must-have)
   - "Good enough for now" > "Perfect but late"

3. **Add Buffer Time**
   - Plan 5 stories but have 2 backup stories if ahead
   - Better to finish early than late

4. **Improve Review Efficiency**
   - Simplify checklist if too detailed
   - Automate more checks
   - Trust agent more (if quality good)

5. **Check Dependencies**
   - Is Story B actually blocked by Story A?
   - Can some stories run in parallel?
   - Resequence if needed

**Decision Rule:**
```
If 1 story behind:
  → Defer lowest priority story
  → Continue with adjusted scope

If 1 week behind:
  → Defer all P1 features
  → Focus only on P0
  → Retrospective: Why behind? Adjust estimates

If 2+ weeks behind:
  → STOP and reassess
  → Run CEO/CFO advisor session
  → Potential pivot: Reduce scope, simplify approach
  → Document learnings
```

---

#### Issue 3: Integration Breaking

**Symptoms:**
- New story breaks old features
- Tests passing individually but failing together
- Event subscribers not receiving events
- RLS policies conflicting
- Database migrations failing

**Root Causes:**
- Poor dependency management
- Missing integration tests
- Event bus not working correctly
- Schema changes breaking existing code

**Solutions:**

1. **Integration Tests**
   ```typescript
   // After each story, add integration test
   describe('Story X integration', () => {
     it('works with existing features', async () => {
       // Test new feature + old feature together
     });
   });
   ```

2. **Event Flow Validation**
   ```typescript
   // Verify event published and received
   const eventEmitted = await waitForEvent('user_created');
   expect(eventEmitted).toBeTruthy();

   const subscriberCalled = await checkSubscriberCalled('audit-logger');
   expect(subscriberCalled).toBeTruthy();
   ```

3. **Database Migration Safety**
   ```bash
   # Always test migrations in both directions
   pnpm drizzle-kit push     # Apply migration
   pnpm drizzle-kit drop     # Rollback migration
   pnpm drizzle-kit push     # Re-apply (should work!)
   ```

4. **Regression Testing**
   ```bash
   # Before merging ANY story:
   pnpm test  # Run ALL tests (not just new ones)
   # If any old tests fail → Integration issue
   ```

**Decision Rule:**
```
Never merge if integration tests fail:
  → Fix integration before starting new story
  → Better to pause development than accumulate debt

If integration issues frequent (>20% of stories):
  → Improve integration test suite
  → Add more E2E tests
  → Review event bus implementation
  → Check database schema design
```

---

#### Issue 4: Security Vulnerability Found

**Symptoms:**
- Security Auditor flags critical issue
- Can bypass RLS policies
- SQL injection possible
- Authentication bypass found
- XSS vulnerability
- Sensitive data exposed

**Root Causes:**
- Missing security controls
- Incorrect RLS policy
- Unvalidated user input
- Missing authentication check
- Insecure coding practice

**Solutions:**

1. **Immediate Actions**
   ```
   STOP all development immediately
   Do not merge any code until fixed
   Assess severity (Critical/High/Medium/Low)
   ```

2. **Fix Process**
   ```
   Critical vulnerability:
   1. Fix immediately (same day)
   2. Add security test to prevent regression
   3. Review ALL similar code for same pattern
   4. Document in ADR how we prevent this
   5. Update agent prompts to avoid in future

   Medium vulnerability:
   1. Fix within 24 hours
   2. Add to security checklist
   3. Document and continue

   Low vulnerability:
   1. Add to backlog
   2. Fix when convenient (not blocking)
   ```

3. **Prevention**
   ```
   Update security checklist:
   - Add check for this vulnerability type
   - Update agent prompts with guidance
   - Add to pattern library (secure coding practices)
   - Improve automated security scanning
   ```

**Decision Rule:**
```
Critical vulnerability (RLS bypass, auth bypass, SQL injection):
  ❌ BLOCK all merges until fixed
  ⚠️ Highest priority
  ✓ Fix, test, document, prevent

High vulnerability (XSS, sensitive data exposure):
  ⏸️ Pause new development
  🔧 Fix within 24 hours
  ✓ Add regression test

Medium/Low vulnerability:
  📝 Document in backlog
  ⏭️ Continue development
  🔧 Fix when convenient
```

---

### Decision Framework

#### When to Stick to the Plan

✅ **Continue following weekly pattern if:**
- Stories progressing smoothly (1-2 per day)
- Agent code quality acceptable (>70% good first draft)
- Reviews taking <35 min per story
- Integration tests passing
- No critical blockers
- Team morale good
- Quality metrics on target (>80% coverage, 0 critical bugs)

**Action:** Continue with standard weekly execution

---

#### When to Deviate from the Plan

⚠️ **Adjust approach if:**
- Stories consistently taking >1 day
- Agent code quality poor (<50% usable)
- Integration issues frequent (>20% of stories)
- Security vulnerabilities common (>2 per week)
- Human review time increasing (>45 min per story)
- Test coverage declining (<70%)
- Technical debt accumulating

**Action:**
```
1. Pause new development (finish current story first)
2. Run retrospective session (30-60 min)
3. Identify root cause:
   - Are stories too large? → Break smaller
   - Are agents struggling? → Refine prompts, add examples
   - Is review too slow? → Simplify checklist, automate more
   - Are patterns unclear? → Update pattern library
4. Make adjustments
5. Resume with improved process
6. Monitor for 1 week → Validate improvements working
```

---

#### When to Escalate to CEO/CFO Advisors

🚨 **Run strategic review if:**
- Timeline slipping >2 weeks (planned 10 stories, completed 5)
- Scope too large (can't finish in reasonable time)
- Business requirements unclear (agents building wrong thing)
- Technical debt severe (>20% of time spent on fixes)
- Major architecture decision needed
- Pivot consideration (approach not working)
- Resource constraints (need more help?)

**Action:**

```
"Act as CEO Advisor and CFO Advisor working together.

Context:
[Describe current situation]
- Planned timeline: X weeks
- Actual progress: Y weeks
- Stories completed: A/B
- Issues encountered: [list]

Questions:
1. Business Priorities:
   - Which pillars are P0 (must-have) vs P1 (nice-to-have)?
   - Can we reduce scope without losing core value?
   - Should we defer some features to post-MVP?

2. Timeline:
   - Is current timeline realistic given progress?
   - Should we adjust expectations?
   - What's minimum viable for Year 1 revenue goals?

3. Approach:
   - Is agent-driven development working?
   - Should we adjust (more/less agent involvement)?
   - Do we need additional resources?

4. Quality vs Speed:
   - Are we over-engineering?
   - Or are we going too fast and accumulating debt?
   - What's the right balance?

Provide strategic recommendations with rationale.

Please proceed."
```

**Expected Output:**
- Prioritized feature list (P0/P1/P2)
- Revised timeline (realistic)
- Approach adjustments (if needed)
- Action plan (next steps)

---

## 🎨 Design & Marketing Assets

### Figma Integration (Premium Available)

**We have Figma Premium** - leverage for high-quality UI designs

#### When to Use Figma:

**Week 2: UI Foundation**
- Design system creation (colors, typography, components)
- Export design tokens to Tailwind config
- Create component library in Figma
- Share with Frontend Developer agent

**Week 4-5: Admin Portal**
- Design admin dashboard layouts
- Create user management UI mockups
- Export components to React

**Week 10+: Customer-Facing Features**
- Recruiting portal (client-facing)
- Training academy interface (student-facing)
- Marketing landing pages
- Mobile responsive designs

#### Figma → Code Workflow:

```
1. Design in Figma (or use existing designs)
   - Create frames for each page/component
   - Use design tokens (colors, spacing from design system)
   - Add annotations for interactions

2. Export from Figma
   - Design tokens → JSON
   - Assets → SVG/PNG
   - Spacing/sizing → Tailwind classes

3. Convert to Code (Frontend Developer Agent)
   "Convert this Figma design to React component using shadcn/ui.

   Figma URL: [link]

   Requirements:
   - Use existing design system (Tailwind config)
   - shadcn/ui components where possible
   - Responsive (mobile-first)
   - Accessibility (ARIA labels, keyboard nav)
   - TypeScript strict mode

   Deliverable: React component matching Figma design"

4. Validate Design Fidelity
   - Compare rendered component to Figma
   - Check spacing, colors, typography
   - Test responsive breakpoints
   - Approve or request adjustments
```

#### Figma Best Practices:

```
Design System Setup:
- Create design tokens file in Figma
- Match Tailwind CSS naming conventions
- Export as JSON for automated sync

Component Library:
- Build reusable components in Figma
- Match shadcn/ui component structure
- Document variants (button primary/secondary, etc.)

Handoff to Developers:
- Use Figma Dev Mode (Premium feature)
- Auto-generate CSS/Tailwind classes
- Inspect spacing, colors, typography
- Export assets directly
```

---

### Marketing Materials Migration

**Existing Marketing Assets** - migrate to Training Academy module

#### When to Migrate:

**Week 17-19: Training Academy Implementation**

#### What to Migrate:

```
Identify Existing Assets:
□ Landing page copy (hero, benefits, testimonials)
□ Course descriptions (Guidewire bootcamp details)
□ Student success stories (testimonials, case studies)
□ Marketing images/graphics (logos, banners, photos)
□ Email templates (welcome, course updates, completion)
□ Video content (course previews, instructor intros)
□ FAQs (pricing, curriculum, job placement)
□ SEO content (blog posts, keyword-optimized pages)
```

#### Migration Workflow:

```bash
# Week 17: Inventory & Planning (Day 1)

"Act as PM Agent.

Task: Plan migration of existing marketing materials to Training Academy.

Context:
- We have existing marketing materials for Guidewire bootcamp
- Need to integrate into Training Academy module (Week 17-19)

Steps:
1. Inventory existing marketing assets
   - Landing pages
   - Email templates
   - Course descriptions
   - Media (images, videos)

2. Map to Training Academy features
   - Which assets go where?
   - What needs updating/refreshing?
   - What can be reused as-is?

3. Create migration stories
   - Story 1: Import course descriptions
   - Story 2: Migrate email templates
   - Story 3: Add testimonials/case studies
   - Story 4: Set up landing page

4. Identify gaps
   - What's missing?
   - What needs to be created new?

Deliverable: Migration plan + story breakdown

Please proceed."
```

#### Integration Points:

```typescript
// Training Academy → Marketing Content

// 1. Course Catalog Page
// Reuse: Marketing course descriptions, pricing, curriculum
<CoursePage>
  <CourseHero>{marketingCopy.hero}</CourseHero>
  <CourseBenefits>{marketingCopy.benefits}</CourseBenefits>
  <Curriculum>{marketingCopy.curriculum}</Curriculum>
  <Pricing>{marketingCopy.pricing}</Pricing>
  <Testimonials>{marketingCopy.testimonials}</Testimonials>
  <FAQ>{marketingCopy.faq}</FAQ>
  <CTA>{marketingCopy.cta}</CTA>
</CoursePage>

// 2. Email Templates
// Reuse: Welcome email, course reminders, completion certificates
const emailTemplates = {
  welcome: marketingAssets.emails.welcome,
  courseReminder: marketingAssets.emails.reminder,
  completion: marketingAssets.emails.certificate,
};

// 3. Student Success Stories
// Reuse: Testimonials, case studies, job placement stats
<SuccessStories>
  {marketingAssets.testimonials.map(story => (
    <TestimonialCard key={story.id} {...story} />
  ))}
</SuccessStories>

// 4. SEO Content
// Reuse: Blog posts, landing page copy, meta descriptions
const seoContent = {
  title: marketingAssets.seo.title,
  description: marketingAssets.seo.description,
  keywords: marketingAssets.seo.keywords,
};
```

#### Migration Quality Checklist:

```
Content Review:
□ All copy still accurate? (dates, pricing, stats)
□ Testimonials have permissions? (privacy, consent)
□ Images optimized for web? (WebP, lazy loading)
□ Videos hosted properly? (CDN, streaming)
□ Links working? (no broken links)
□ SEO maintained? (meta tags, structured data)

Technical Integration:
□ Content in database or CMS? (not hardcoded)
□ Easily updatable? (by non-technical staff)
□ Mobile responsive? (all content)
□ Accessible? (alt text, captions, ARIA labels)
□ Fast loading? (optimized assets)

Brand Consistency:
□ Design system applied? (colors, typography)
□ Tone/voice consistent? (matches brand)
□ Legal compliance? (disclaimers, terms)
```

---

## 📅 Complete Timeline Summary

```
PHASE 0: PRE-FLIGHT
──────────────────────────────────────────────────────
Week -1 (3 days):
  Day 1: Epic canvases (8 modules)
  Day 2: Event map (30-50 events)
  Day 3: Architecture patterns (5 templates)

PHASE 1: FOUNDATION (Weeks 1-3)
──────────────────────────────────────────────────────
Week 1: Database Foundation
  - Core tables (users, orgs, roles, teams)
  - RLS policies
  - Multi-tenancy
  - Event system foundation
  - Audit logging
  Stories: 5-7

Week 2: Auth + UI Foundation
  - Supabase Auth (email + OAuth)
  - shadcn/ui installation
  - Design system (Tailwind + Figma)
  - Layout components
  - Form system (React Hook Form + Zod)
  Stories: 5-7

Week 3: Event Bus + Testing Infrastructure
  - Custom event bus implementation
  - Pub/sub system
  - Event persistence
  - Vitest configuration
  - Playwright E2E setup
  - Error handling framework
  Stories: 5-6

PHASE 2: INTERNAL PLATFORM (Weeks 4-9)
──────────────────────────────────────────────────────
Week 4: Admin Portal - User Management
  - User list (search, filter, pagination)
  - User detail page
  - Create/edit user forms
  - Role assignment
  - Bulk import (CSV)
  Stories: 6-7

Week 5: Admin Portal - System Administration
  - Organization settings
  - System health dashboard
  - Audit log viewer
  - Notification center
  - Email template management
  - API key management
  Stories: 6-7

Week 6: HR System - Employee Management
  - Employee directory
  - Department management
  - Org chart (reporting structure)
  - Onboarding/offboarding workflows
  - Timesheet submission
  Stories: 6-7

Week 7: HR System - Leave & Expenses
  - Timesheet approval workflow
  - Leave request/approval
  - Leave calendar
  - Expense claim submission/approval
  Stories: 6-7

Week 8: Productivity - Pods & Sprints
  - Pod management (Senior + Junior pairs)
  - Sprint planning (2-week cycles)
  - Activity logging (calls, emails, meetings)
  - Placement tracking
  - Metrics calculation
  Stories: 6-7

Week 9: Productivity - Cross-Pollination Engine
  - Lead opportunity detection (AI)
  - Lead categorization (5 pillars)
  - Cross-pollination dashboard
  - Performance metrics
  - Financial tracking
  Stories: 6-7

PHASE 3: EXTERNAL PILLARS (Weeks 10-21)
──────────────────────────────────────────────────────
Week 10-11: Recruiting Services - ATS Foundation
  - Client management (companies, contacts)
  - Job requisitions (create, post, manage)
  - Candidate pipeline (sourcing, screening)
  - Application tracking
  Stories: 12-14

Week 12: Recruiting Services - AI Matching
  - AI-powered job ↔ candidate matching
  - Submission workflow
  - Interview scheduling
  - Candidate communication (email automation)
  Stories: 6-7

Week 13: Recruiting Services - Placements
  - Placement tracking (start dates, onboarding)
  - Revenue recognition
  - Client invoicing
  - Recruiter commissions
  Stories: 6-7

Week 14-15: Bench Sales
  - Bench consultant management
  - Quick placement workflows (30-day target)
  - Client matching
  - Onboarding workflow
  - Commission tracking (placement + 5%)
  Stories: 12-14

Week 16: Bench Sales - Cross-Pollination
  - Integration with Recruiting module
  - Candidate → Bench opportunity detection
  - Bench → Recruiting referrals
  Stories: 6-7

Week 17-18: Training Academy - LMS
  - Course management (Guidewire bootcamp)
  - Module/lesson structure
  - Sequential mastery (can't skip ahead)
  - Progress tracking
  - Quiz/assessment system
  - **Migrate marketing materials** (landing pages, email templates)
  Stories: 12-14

Week 19: Training Academy - AI Socratic Mentor
  - AI mentor integration (Claude API)
  - Question-driven learning
  - Progress-based hints
  - Student → Candidate pipeline (auto-enrollment)
  Stories: 6-7

Week 20: Talent Acquisition
  - Pipeline building tools
  - Outreach campaigns (email sequences)
  - Candidate relationship management
  - Client TA packages
  Stories: 6-7

Week 21: Cross-Border Solutions
  - Immigration workflow (LMIA, H1B, work permits)
  - 100-day placement timeline tracking
  - Document management (visa, certifications)
  - Compliance checklists
  Stories: 6-7

PHASE 4: POLISH & SCALE (Week 22+)
──────────────────────────────────────────────────────
Ongoing:
  - Performance optimization (Lighthouse 90+)
  - Mobile responsiveness (all pages)
  - Advanced analytics (Looker-style dashboards)
  - AI enhancements (better matching, mentor improvements)
  - SEO optimization (landing page rankings)
  - Customer onboarding flows
  - Help documentation + tutorials
  - SaaS features (if pivoting to B2B in Year 2)
```

---

## ✅ Final Execution Checklist

### Before Starting Week 1:

```
PREREQUISITES:
──────────────────────────────────────────────────────
□ Week -1 complete (epic canvases, event map, patterns all approved)
□ Local environment setup:
  □ Node.js 24+ installed
  □ pnpm installed
  □ Git configured
  □ VS Code (or preferred editor)
  □ Supabase CLI installed

□ Project configuration:
  □ .env.local created (copy from .env.local.example)
  □ Supabase project created
  □ Database connection working
  □ .mcp.json configured (MCP servers)

□ Repository:
  □ Git repo initialized
  □ Main branch clean (git status)
  □ Remote configured (GitHub/GitLab)
  □ .gitignore present

□ Agent system:
  □ MCP servers tested (filesystem, postgres, etc.)
  □ Test agent prompt executed successfully
  □ Multi-chat capability confirmed

□ Calendar:
  □ Daily 30-min review slots blocked (3:30-4pm)
  □ Friday 3-hour blocks for integration testing
  □ Weekend planning time if needed (Sat morning)

□ Documentation:
  □ This playbook saved and accessible
  □ docs/ folder structure created
  □ Ready to document as you build
```

### Every Monday Morning:

```
WEEK START CHECKLIST:
──────────────────────────────────────────────────────
□ Week X stories approved (from Friday planning)
□ Git main branch up to date:
  git checkout main
  git pull origin main

□ Database healthy:
  pnpm drizzle-kit studio  # Check tables look good

□ Review week goals:
  □ How many stories planned? (typically 5-7)
  □ Any dependencies between stories?
  □ Any blockers anticipated?

□ Environment ready:
  □ .env.local up to date
  □ Dependencies installed (pnpm install)
  □ Tests passing (pnpm test)
  □ Build working (pnpm build)

□ Ready to run first agent prompt at 9am ✓
```

### Every Friday End of Day:

```
WEEK END CHECKLIST:
──────────────────────────────────────────────────────
□ Week X integration testing complete
  □ All stories merged to main
  □ Integration tests passing
  □ Manual end-to-end test successful

□ Retrospective documented:
  □ What went well?
  □ What could improve?
  □ Action items for next week
  □ Metrics recorded (stories completed, coverage, etc.)

□ Week X+1 stories planned and approved:
  □ PM Agent proposed 5-7 stories
  □ Human reviewed and approved
  □ Saved to docs/planning/sprints/week-XX+1/

□ Database backup (optional but recommended):
  # Supabase handles this, but good to verify

□ Git clean:
  □ All feature branches deleted
  □ Main branch has all work
  □ No uncommitted changes

□ Ready for Monday ✓
```

---

## 🎉 You're Ready to Execute!

### Quick Start

**1. Save this playbook:**
```bash
# This file is already saved at:
# docs/planning/IMPLEMENTATION-PLAYBOOK.md
```

**2. Start Week -1 Day 1:**
```
Open new Claude Code chat
Copy prompt from "Day 1: Epic Canvases"
Paste and run
Review outputs in ~5 hours
```

**3. Follow step-by-step:**
- Clear instructions for each day
- Know exactly what to do next
- Validate at checkpoints (your approval matters!)
- Repeat weekly pattern once established

### Time Investment

**Upfront (Week -1):**
- 6 hours total (2 hours/day × 3 days)
- Outcome: Complete system understanding

**Ongoing (Weeks 1+):**
- ~3.5 hours/week
  - Story validation: ~3 hours (25-35 min/story × 7 stories)
  - Weekly planning review: ~30 min (Friday)
- Outcome: Production-ready features every week

### Support

**If you get stuck:**
1. Check [Troubleshooting](#troubleshooting) section
2. Review relevant pattern in docs/architecture/patterns/
3. Run retrospective to identify root cause
4. Escalate to CEO/CFO advisors if strategic

**Remember:**
- Quality over speed (no time pressure)
- Small stories (1 day max)
- Validate at handovers (your checkpoints ensure quality)
- Living documentation (update as you learn)
- Agents accelerate, you guide (best of both worlds)

---

**Good luck building InTime v3! 🚀**

This playbook is your complete guide from foundation to production. Follow it step-by-step, validate at checkpoints, and build the best staffing platform. You've got this!

---

**Document Version:** 1.0
**Last Updated:** 2025-11-18
**Status:** Ready for Execution ✅
**Next Step:** Begin Week -1 Day 1 (Epic Canvases)