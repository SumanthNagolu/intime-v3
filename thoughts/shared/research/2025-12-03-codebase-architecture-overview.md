---
date: 2025-12-03T18:13:07Z
researcher: Claude
git_commit: df2bd238ff7c74319acc6a746b018cd24a7bb243
branch: main
repository: intime-v3
topic: "InTime v3 Codebase Architecture Overview"
tags: [research, codebase, architecture, next-js, trpc, metadata-ui, activities, guidewire, phase-4, cleanup]
status: complete
last_updated: 2025-12-03
last_updated_by: Claude
last_updated_note: "Added Phase 4 cleanup analysis with file counts and remaining work"
---

# Research: InTime v3 Codebase Architecture Overview

**Date**: 2025-12-03T18:13:07Z
**Researcher**: Claude
**Git Commit**: df2bd238ff7c74319acc6a746b018cd24a7bb243
**Branch**: main
**Repository**: intime-v3

## Research Question

Comprehensive exploration of the intime-v3 codebase to understand how the system works, what the architecture is, and identify the key files and patterns.

## Summary

InTime v3 is a **multi-agent staffing platform** built with a **Guidewire-inspired architecture** that combines:

1. **Metadata-Driven UI Framework** - Declarative screen definitions that render automatically
2. **Activity-Centric Workflow Engine** - "No work is considered done unless an activity is created"
3. **Event-Driven Architecture** - Immutable event logging with handler pipelines
4. **Role-Based Multi-Portal System** - 9 internal roles + 3 external portals
5. **AI-Powered Features** - Multi-agent orchestration with RAG and AI twins

The platform serves recruiters, bench sales, HR, talent acquisition, executives, and administrators internally, plus clients, candidates, and students externally.

---

## Detailed Findings

### 1. Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Framework** | Next.js (App Router) | 15.1.3 |
| **UI** | React | 19.0.0 |
| **Language** | TypeScript | 5.7.2 |
| **Styling** | Tailwind CSS | 3.4.18 |
| **API Layer** | tRPC | 11.7.1 |
| **Database** | PostgreSQL via Supabase | - |
| **ORM** | Drizzle ORM | 0.44.7 |
| **Auth** | Supabase Auth | 2.83.0 |
| **State** | Zustand + TanStack Query | 5.0.8 / 5.90.10 |
| **UI Components** | Radix UI + shadcn/ui | Various |
| **AI** | OpenAI + Anthropic + Gemini | Multiple |

### 2. Project Structure

```
intime-v3/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── employee/           # Internal employee routes (9 roles)
│   │   ├── client/             # Client portal routes
│   │   ├── talent/             # Candidate/talent portal routes
│   │   ├── training/           # Academy routes
│   │   └── api/trpc/           # tRPC API endpoint
│   ├── components/             # React components by domain
│   │   ├── layouts/            # Layout shells and navigation
│   │   ├── ui/                 # Base primitives (shadcn/ui)
│   │   ├── crm/                # CRM module components
│   │   ├── recruiting/         # Recruiting components
│   │   ├── bench/              # Bench sales components
│   │   ├── activities/         # Activity-centric components
│   │   ├── forms/              # Form system
│   │   ├── tables/             # Data table system
│   │   ├── cards/              # Card components
│   │   └── modals/             # Modal/dialog system
│   ├── lib/                    # Core libraries
│   │   ├── metadata/           # Metadata-driven UI framework
│   │   ├── activities/         # Activity engine
│   │   ├── events/             # Event bus
│   │   ├── navigation/         # Navigation config
│   │   ├── validations/        # Zod schemas
│   │   ├── auth/               # Auth helpers
│   │   ├── ai/                 # AI agents and orchestration
│   │   ├── trpc/               # tRPC config
│   │   └── db/                 # Drizzle ORM setup
│   ├── server/                 # tRPC server
│   │   ├── trpc/               # Root router and middleware
│   │   └── routers/            # Business domain routers
│   └── screens/                # Screen metadata definitions
│       ├── recruiting/         # Recruiting screens
│       ├── crm/                # CRM screens
│       ├── bench-sales/        # Bench sales screens
│       ├── hr/                 # HR screens
│       ├── admin/              # Admin screens
│       └── portals/            # Portal screens
├── supabase/
│   └── migrations/             # 70+ database migrations
└── docs/specs/                 # Detailed specifications
```

### 3. Frontend Architecture

#### Routing Structure (`src/app/`)

**Employee Portal** (`/employee/*`):
- `/employee/recruiting/*` - Recruiter workspace (jobs, candidates, submissions, placements)
- `/employee/bench/*` - Bench sales workspace (consultants, hotlists, immigration)
- `/employee/hr/*` - HR workspace (employees, payroll, benefits, compliance)
- `/employee/ta/*` - Talent acquisition (leads, deals, campaigns)
- `/employee/admin/*` - Admin console (users, roles, pods, settings)
- `/employee/manager/*` - Manager tools (pod dashboard, sprint board, 1:1s)
- `/employee/ceo/*`, `/employee/cfo/*`, `/employee/coo/*` - Executive dashboards

**External Portals**:
- `/client/*` - Client portal (jobs, submissions, interviews, placements)
- `/talent/*` - Candidate portal (profile, job search, applications)
- `/training/*` - Academy (courses, progress, certificates)

#### Layout System (`src/components/layouts/`)

- **AppShell**: Main layout shell with automatic portal detection
- **Module Layouts**: `RecruitingLayout`, `BenchLayout`, `HRLayout`, `TALayout`, `AdminLayout`
- **Header/Sidebar**: Consistent navigation with role-based sections
- **CommandBar**: Cmd+K quick actions

**Key Files**:
- `src/components/layouts/AppShell.tsx` - Main shell component
- `src/components/layouts/RecruitingLayout.tsx` - Full recruiting layout with modals
- `src/lib/navigation/navConfig.ts` - Navigation configuration for all roles

#### Component Organization

Components follow domain-based organization with barrel exports:

- **Renderers**: `AccountsListRenderer`, `DashboardRenderer`, `DealPipelineRenderer`
- **Workspaces**: `JobWorkspace`, `DealWorkspace`, `TalentWorkspace`
- **Activities**: `ActivityTimeline`, `ActivityQueue`, `ActivityMetricsWidget`

**Pattern**: Components accept `ScreenDefinition` props and use tRPC for data.

### 4. Backend Architecture

#### tRPC Setup (`src/server/`)

**Root Router** (`src/server/trpc/root.ts:66-128`):
- Academy module: 15+ routers (enrollment, courses, video, quiz, etc.)
- Business modules: `crm`, `ats`, `bench`, `hr`, `taHr`, `dashboard`, `activities`
- Admin module: `events`, `handlers`, `users`

**Middleware** (`src/server/trpc/middleware.ts`):
- `isAuthenticated` - Requires userId and session
- `requireOrganization` - Requires orgId
- `isAdmin` - Validates admin role
- `hasPermission(resource, action)` - Resource-level permissions
- `withOwnershipContext` - RACI filtering context

**Procedure Builders**:
- `publicProcedure` - No auth required
- `protectedProcedure` - Requires authentication
- `orgProtectedProcedure` - Requires organization
- `adminProcedure` - Requires admin role
- `ownershipProcedure` - Ownership-filtered queries

**Key Routers**:
- `src/server/routers/activities.ts` (1,446 lines) - 30+ procedures
- `src/server/routers/events.ts` (556 lines) - Event queries and subscriptions
- `src/server/routers/crm.ts` - Accounts, leads, deals, contacts
- `src/server/routers/dashboard.ts` (1,231 lines) - Dashboard widgets

#### API Patterns

```typescript
// List with pagination and ownership filtering
list: ownershipProcedure
  .input(z.object({
    limit: z.number().default(25),
    offset: z.number().default(0),
    ownership: ownershipFilterSchema.nullish(),
  }))
  .query(async ({ ctx, input }) => { ... });

// Create with org scoping
create: orgProtectedProcedure
  .input(createSchema)
  .mutation(async ({ ctx, input }) => { ... });
```

### 5. Metadata-Driven UI System

#### Architecture (`src/lib/metadata/`)

```
Screen Definition → ScreenRenderer → LayoutRenderer → SectionRenderer → WidgetRenderer
```

**Types** (`types/*.types.ts`):
- Screen types: `detail`, `list`, `list-detail`, `wizard`, `dashboard`, `popup`
- Layout types: `single-column`, `two-column`, `sidebar-main`, `tabs`, `wizard-steps`
- Section types: `info-card`, `metrics-grid`, `field-grid`, `table`, `form`, `timeline`
- Field types: 30+ types (text, number, select, date, currency, user, computed, etc.)

**Renderers** (`renderers/`):
- `ScreenRenderer.tsx` - Main orchestrator with form state management
- `LayoutRenderer.tsx` - Handles layout patterns
- `SectionRenderer.tsx` - Renders sections (736 lines)
- `WidgetRenderer.tsx` - Individual widget rendering

**Widget Registry** (`registry/widget-registry.ts`):
- Map-based registry for widgets
- Format utilities (currency, date, phone)
- Dynamic registration at runtime

**Screen Definitions** (`src/screens/`):

```typescript
// Example: src/screens/recruiting/recruiter-dashboard.screen.ts
export const recruiterDashboardScreen: ScreenDefinition = {
  id: 'recruiter-dashboard',
  type: 'dashboard',
  title: 'My Dashboard',
  dataSource: {
    type: 'aggregate',
    queries: [
      { key: 'sprintMetrics', procedure: 'dashboard.getSprintProgress' },
      { key: 'tasks', procedure: 'dashboard.getTasks' },
      // ... more queries
    ],
  },
  layout: {
    type: 'single-column',
    sections: [
      { type: 'custom', component: 'SprintProgressWidget', ... },
      { type: 'custom', component: 'RACIWatchlistWidget', ... },
      // ... more sections
    ],
  },
};
```

**InputSets** - Reusable field groups:
- `addressInputSet`, `contactInputSet`, `compensationInputSet`
- `workAuthInputSet`, `interviewScheduleInputSet`
- Domain-specific: HR, CRM, ATS sets

### 6. Activity-Centric Architecture

#### Activity Engine (`src/lib/activities/`)

**Core Principle**: "NO WORK IS CONSIDERED DONE UNLESS AN ACTIVITY IS CREATED"

**ActivityEngine** (`activity-engine.ts`):
- Processes events and auto-creates activities from patterns
- Static auto-rules for common events (submission, interview, lead, etc.)
- Assignee resolution: owner, RACI role, round robin, least busy, manager

**Activity Types**:
- `call`, `email`, `meeting`, `task`, `follow_up`, `reminder`
- `interview`, `submission`, `placement_check`, `visa_tracking`

**Activity Flow**:
1. Event occurs (e.g., submission created)
2. EventBus dispatches to handlers
3. ActivityCreationHandler matches patterns
4. Activity created with assignee, due date, SLA

**Key Files**:
- `src/lib/activities/activity-engine.ts` - Main engine
- `src/lib/activities/PatternService.ts` - Pattern management
- `src/lib/activities/QueueManager.ts` - Work queue management

### 7. Event-Driven Architecture

#### Event Bus (`src/lib/events/`)

**EventBus** (`event-bus.ts`):
- Middleware pipeline (Audit → Activity → Notification → Webhook)
- Type-specific and wildcard subscriptions
- Async queue with sequential processing

**Built-in Handlers** (`handlers/`):
- `AuditHandler` - Records all events
- `ActivityCreationHandler` - Creates activities from events
- `NotificationHandler` - Sends user notifications
- `WebhookHandler` - Triggers external webhooks

**Subscription System**:
- User-specific subscriptions
- Channel preferences (in-app, email, push)
- Notification delivery service

### 8. Navigation System

#### Configuration (`src/lib/navigation/`)

**Role-Based Navigation** (`navConfig.ts`):
- 9 internal roles with dedicated nav sections
- Manager inheritance (manager + base role)
- Admin aggregation (sees all)

**Breadcrumb System** (`breadcrumbs.ts`):
- Static mappings for 500+ routes
- Dynamic generation fallback
- Pattern matching for detail pages

**Navigation State** (`useNavigation.ts` hook):
- Collapsed state with localStorage persistence
- Pinned/recent items (max 5 each)
- Badge count management

### 9. Database Layer

**Drizzle ORM** (`src/lib/db/`):
- PostgreSQL with connection pooling (max 10)
- Schema-based organization
- Global singleton in development

**Supabase Integration**:
- Auth via `@supabase/ssr`
- Storage for files
- 70+ migrations in `supabase/migrations/`

**Key Tables**:
- Multi-tenancy with `org_id` scoping
- Event bus tables for event sourcing
- Activity and workplan tables
- RACI assignments and SLA tracking
- Complete CRM, ATS, Bench, HR schemas
- Academy LMS tables

### 10. AI Infrastructure

#### AI Module (`src/lib/ai/`)

**Orchestrator** (`orchestrator.ts`):
- Intent classification with GPT-4o-mini
- Agent routing based on intent
- Context handoff between agents

**BaseAgent** (`agents/BaseAgent.ts`):
- Model routing (Claude, GPT-4, Gemini)
- Memory management
- RAG knowledge search
- Cost tracking with Helicone

**Specialist Agents**:
- `CodeMentorAgent` - Socratic code mentoring
- `ResumeBuilderAgent` - Resume creation
- `InterviewCoachAgent` - Interview preparation
- `ProjectPlannerAgent` - Sprint planning

**AI Twins** (`twins/`):
- `EmployeeTwin` - Role-specific AI assistant
- `OrganizationTwin` - Org-level intelligence
- Twin event bus for communication

---

## Code References

### Key Entry Points

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout with TRPCProvider |
| `src/server/trpc/root.ts:66` | Main tRPC router |
| `src/lib/metadata/index.ts` | Metadata system exports |
| `src/lib/activities/index.ts` | Activity system exports |
| `src/lib/events/index.ts` | Event bus exports |
| `src/lib/navigation/navConfig.ts` | Navigation configuration |

### Screen Definition Examples

| Screen | Location |
|--------|----------|
| Recruiter Dashboard | `src/screens/recruiting/recruiter-dashboard.screen.ts` |
| Account Detail | `src/screens/crm/account-detail.screen.ts` |
| TA Dashboard | `src/screens/crm/ta-dashboard.screen.ts` |
| Bench Dashboard | `src/screens/bench-sales/bench-dashboard.screen.ts` |

### Component Examples

| Component | Location |
|-----------|----------|
| AppShell | `src/components/layouts/AppShell.tsx` |
| RecruitingLayout | `src/components/layouts/RecruitingLayout.tsx` |
| DashboardRenderer | `src/components/recruiting/DashboardRenderer.tsx` |
| ActivityTimeline | `src/components/activities/ActivityTimeline.tsx` |

### Router Examples

| Router | Location | Lines |
|--------|----------|-------|
| Activities | `src/server/routers/activities.ts` | 1,446 |
| Events | `src/server/routers/events.ts` | 556 |
| Dashboard | `src/server/routers/dashboard.ts` | 1,231 |
| CRM | `src/server/routers/crm.ts` | - |

---

## Architecture Documentation

### Design Patterns

1. **Metadata-Driven UI** - Declarative screen definitions with automatic rendering
2. **Activity-Centric Workflow** - Every action generates activities/events
3. **Event Sourcing** - Immutable event log with handler pipelines
4. **RACI Model** - Responsibility assignment for ownership filtering
5. **Multi-Tenancy** - Organization-scoped data with RLS
6. **Type-Safe APIs** - End-to-end TypeScript with tRPC

### Rendering Pipeline

```
Page Component
    └── AppLayout / ModuleLayout
        └── ScreenRenderer (definition prop)
            └── LayoutRenderer (handles layout type)
                └── SectionRenderer (handles section type)
                    └── WidgetRenderer (handles field/widget type)
                        └── Registry Component (Display or Input)
```

### Data Flow

```
User Action
    └── tRPC Mutation
        └── Database Update
            └── Event Published
                └── EventBus Dispatch
                    ├── AuditHandler (log)
                    ├── ActivityCreationHandler (create activity)
                    ├── NotificationHandler (notify user)
                    └── WebhookHandler (external)
```

---

## Open Questions

1. **Performance at Scale**: How does the metadata-driven UI perform with very large screen definitions?
2. **Activity Pattern Coverage**: Are there edge cases where activities aren't auto-created?
3. **AI Agent Integration**: How are AI twins integrated into the daily workflow?
4. **Migration Strategy**: What's the plan for the 70+ database migrations in production?

---

## Follow-up Research: Phase 4 Cleanup Analysis (2025-12-03)

### Cleanup Summary

A comprehensive analysis was performed comparing specs vs implementation with the following results:

#### Files Cleaned Up
- **321 legacy files deleted** from the codebase
- **116 new files added** (new pages, components, renderers)
- **111 modified files** (updated to new patterns)

#### Legacy Components Removed
| Category | Count | Examples |
|----------|-------|----------|
| Old workspace components | 75 | `src/components/workspaces/*` |
| Legacy lib modules | 28 | Old migrations, deprecated helpers |
| Old test files | 41 | E2E tests, unit tests for removed components |
| Archive files | 21 | Planning docs, status reports |
| Old claude/cursor config | 34 | Skills, rules, mcp presets |
| Screenshots/docs | 30 | Old screenshots, redundant documentation |

#### UI Migration Status: 90% Complete

**All pages now use modern patterns:**
- ScreenRenderer for standard pages
- Specialized renderers (11 total) for domain-specific needs
- 127 screen definitions across all modules
- 20+ dashboard widgets registered

**Remaining Work (4-5 days estimated):**
1. 4 widget placeholders need implementation
2. Custom component verification (~14 components)
3. tRPC procedure verification
4. Testing (target: >80% coverage)
5. Performance optimization

#### Issue Created
See `thoughts/shared/issues/phase4-ui-completion.md` for the full issue template to track remaining work.

---

## Related Files

- `docs/specs/20-USER-ROLES/` - Role specifications
- `docs/specs/30-SCREENS/` - Screen specifications
- `docs/specs/PROMPTS/phase4/` - Phase 4 implementation prompts
- `supabase/migrations/` - Database migrations
- `.claude/commands/` - Development workflow commands
- `thoughts/shared/issues/phase4-ui-completion.md` - Issue for remaining work
