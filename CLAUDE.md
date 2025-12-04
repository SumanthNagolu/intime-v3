# InTime v3 - Claude Code Project Guide

## Quick Reference

```bash
# Development
pnpm dev            # Start dev server
pnpm res3000        # Kill port 3000 and start dev server
pnpm build          # Production build
pnpm lint           # ESLint check
pnpm test           # Run Vitest tests

# Database
pnpm db:migrate     # Run migrations
pnpm db:status      # Check migration status
pnpm seed:all       # Reset and seed database
```

---

## Project Overview

**InTime** is a multi-agent staffing platform built with:
- **Next.js 15** (App Router) + **React 19**
- **tRPC** for type-safe APIs
- **Supabase** (PostgreSQL + Auth)
- **Drizzle ORM** for database operations
- **Tailwind CSS** with premium design system
- **Zustand** for state management
- **Radix UI** for accessible components

### Architecture Philosophy

1. **Metadata-Driven UI**: Screens are declaratively defined, not manually coded
2. **Activity-Centric**: Every business action creates an activity via events
3. **Multi-Tenant**: All data is organization-scoped via `org_id`
4. **Role-Based**: UI and permissions vary by user role

---

## Directory Structure

```
/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── employee/        # Employee portal routes
│   │   ├── client/          # Client portal routes
│   │   ├── talent/          # Talent portal routes
│   │   └── api/             # API routes (tRPC, webhooks)
│   ├── components/          # React components
│   │   ├── layouts/         # Layout components (AppShell, role layouts)
│   │   ├── marketing/       # Marketing/public pages
│   │   ├── metadata/        # Metadata-driven screen page
│   │   ├── ui/              # Base UI components (Button, Input, etc.)
│   │   ├── dashboard/       # Dashboard widgets
│   │   └── navigation/      # Navigation components
│   ├── lib/                 # Core libraries
│   │   ├── auth/            # Auth utilities
│   │   ├── supabase/        # Supabase client
│   │   ├── metadata/        # Metadata rendering system
│   │   ├── activities/      # Activity engine
│   │   ├── events/          # Event bus system
│   │   └── navigation/      # Navigation config
│   ├── screens/             # Screen definitions (metadata)
│   │   ├── recruiting/      # ATS screens
│   │   ├── bench-sales/     # Bench sales screens
│   │   ├── crm/             # CRM screens
│   │   ├── admin/           # Admin screens
│   │   ├── hr/              # HR screens
│   │   └── portals/         # Client/Talent/Academy screens
│   └── server/              # Server-side code
│       ├── trpc/            # tRPC configuration
│       └── routers/         # tRPC routers
├── docs/specs/              # Functional specifications
│   ├── 10-DATABASE/         # Database schema specs
│   ├── 20-USER-ROLES/       # Role-specific behavior specs
│   └── PROMPTS/             # Implementation prompts
├── thoughts/shared/         # Research, plans, handoffs
│   ├── research/            # Codebase research documents
│   ├── plans/               # Implementation plans
│   └── handoffs/            # Session handoff documents
└── .claude/                 # Claude Code configuration
    ├── agents/              # Agent definitions
    ├── commands/            # Slash commands
    └── rules/               # Architecture rules
```

---

## Key Concepts

### 1. Metadata-Driven UI System

Screens are defined declaratively in `src/screens/`:

```typescript
// Example: src/screens/recruiting/job-detail.ts
export const jobDetailScreen: ScreenDefinition = {
  id: 'recruiting.job-detail',
  type: 'detail',
  entityType: 'job',
  title: { type: 'field', path: 'title' },
  layout: {
    type: 'sidebar-main',
    sidebar: [...],
    main: [...]
  }
}
```

**Rendering hierarchy**:
```
ScreenRenderer → LayoutRenderer → SectionRenderer → WidgetRenderer
```

**Key files**:
- Types: `src/lib/metadata/types/screen.types.ts`
- Renderers: `src/lib/metadata/renderers/`
- Screens: `src/screens/`

### 2. Activity System

Every business action creates activities:

```
User Action → Event Published → Activity Engine → Activity Created
```

**Key files**:
- Engine: `src/lib/activities/activity-engine.ts`
- Patterns: `src/lib/activities/PatternService.ts`
- Queues: `src/lib/activities/QueueManager.ts`

### 3. Event Bus

Events drive the system:

```typescript
// Publishing an event
EventEmitter.emit({
  type: 'submission.created',
  entityType: 'submission',
  entityId: submissionId,
  payload: { ... }
})
```

**Handler priority**: Audit (100) → Activities (90) → Notifications (80) → Webhooks (70)

### 4. tRPC Routers

Type-safe API layer:

```
src/server/routers/
├── crm.ts        # Accounts, leads, deals
├── ats.ts        # Jobs, submissions, interviews
├── bench.ts      # Consultants, vendors
├── hr.ts         # Employees, pods
├── dashboard.ts  # Role metrics
└── activities.ts # Activity CRUD
```

**Root router**: `src/server/trpc/root.ts`

---

## Design System

### Color Palette

| Usage | Light Mode | Class |
|-------|------------|-------|
| Background | #FDFBF7 | `bg-cream` |
| Cards | #FFFFFF | `bg-white` |
| Primary Text | #1A1A1A | `text-charcoal-900` |
| Primary Action | #0D4C3B | `bg-forest-500` |
| Accent | Gold gradient | `bg-gold-500` |

### Typography

- **Headlines**: Cormorant Garamond (`font-heading`)
- **UI Elements**: Plus Jakarta Sans (`font-body`)
- **Code**: JetBrains Mono (`font-mono`)

### Component Patterns

```tsx
// Premium button
<Button variant="premium" size="default">
  Submit
</Button>

// Card with elevation
<Card className="bg-white rounded-xl shadow-elevation-sm hover:shadow-elevation-md transition-all">
  ...
</Card>

// Glass morphism
<div className="glass rounded-xl p-6">
  ...
</div>
```

**See**: `.claude/rules/ui-design-system.md` for complete design system rules

---

## User Roles

| Role | Portal | Key Features |
|------|--------|--------------|
| **Recruiter** | `/employee/recruiting/` | Pipeline, submissions, interviews |
| **Bench Sales** | `/employee/bench/` | Consultants, vendors, utilization |
| **TA Specialist** | `/employee/ta/` | Leads, deals, campaigns |
| **HR Admin** | `/employee/hr/` | Employees, pods, onboarding |
| **Manager** | `/employee/manager/` | Team metrics, approvals |
| **Admin** | `/employee/admin/` | Settings, users, roles |
| **Client** | `/client/` | Jobs, candidates, interviews |
| **Talent** | `/talent/` | Profile, applications, offers |

**See**: `.claude/rules/ui-per-role.md` for role-specific UI patterns

---

## Database Structure

326 tables across 12 modules:

| Module | Tables | Key Entities |
|--------|--------|--------------|
| CORE | 11 | organizations, users, roles, permissions |
| CRM | 25 | accounts, leads, deals, campaigns |
| RECRUITING | 44 | jobs, candidates, submissions, interviews, placements |
| BENCH-SALES | 23 | consultants, vendors, job_orders |
| ACTIVITIES | 35 | activities, patterns, workflows, queues |
| HR | 32 | employees, pods, benefits, payroll |

**Specs**: `docs/specs/10-DATABASE/`

### Core Patterns

- **Multi-tenancy**: All tables have `org_id`
- **Soft deletes**: Use `deleted_at` timestamp
- **Audit trail**: `created_at`, `updated_at`, `created_by`, `updated_by`
- **Polymorphic**: Activities, comments use `entity_type` + `entity_id`

---

## Common Tasks

### Adding a New Screen

1. Create screen definition in `src/screens/[module]/`
2. Register in `src/screens/[module]/index.ts`
3. Add route in `src/app/employee/[module]/[route]/page.tsx`
4. Use `ScreenRenderer` component

### Adding a tRPC Procedure

1. Add procedure to appropriate router in `src/server/routers/`
2. Follow existing patterns for input validation (Zod)
3. Use `orgProtectedProcedure` for org-scoped data

### Creating Activity Patterns

1. Define pattern in `src/lib/activities/patterns/`
2. Register with `PatternService`
3. Configure triggers in event handlers

---

## Important Guidelines

### DO

- Use cream background (`bg-cream`) for pages
- Apply premium styling from design system
- Create activities for business actions
- Filter data by `org_id`
- Use tRPC for API calls
- Follow metadata-driven patterns for new screens
- Read files before editing them

### DON'T

- Use `bg-gray-50` (use `bg-cream` instead)
- Skip activity creation for important actions
- Bypass org_id filtering
- Create manual API routes (use tRPC)
- Add features not specified in requirements
- Over-engineer or add unnecessary abstractions

---

## Research & Planning

Before implementing features:

1. Check `docs/specs/` for functional requirements
2. Check `thoughts/shared/research/` for prior analysis
3. Check `thoughts/shared/plans/` for existing implementation plans
4. Use `/research_codebase` command for deep analysis

---

## Commands Reference

### Slash Commands

- `/create_plan` - Create implementation plan
- `/implement_plan` - Execute implementation plan
- `/validate_plan` - Verify implementation
- `/commit` - Create git commit
- `/describe_pr` - Generate PR description
- `/research_codebase` - Deep codebase analysis

### Agents

- `codebase-analyzer` - Understand how code works
- `codebase-locator` - Find files and components
- `codebase-pattern-finder` - Find similar implementations
- `web-search-researcher` - Research external topics

---

## File References

### Core Configuration
- `package.json` - Dependencies and scripts
- `tailwind.config.ts` - Design tokens
- `src/app/globals.css` - Global styles and utilities

### Type Definitions
- `src/lib/metadata/types/screen.types.ts` - Screen definitions
- `src/lib/metadata/types/widget.types.ts` - Field/widget types
- `src/lib/metadata/types/data.types.ts` - Dynamic values

### Key Components
- `src/lib/metadata/renderers/ScreenRenderer.tsx` - Screen orchestration
- `src/components/layouts/AppShell.tsx` - Main app shell
- `src/lib/navigation/navConfig.ts` - Role navigation

### API Layer
- `src/server/trpc/root.ts` - Router composition
- `src/server/trpc/middleware.ts` - Auth middleware
