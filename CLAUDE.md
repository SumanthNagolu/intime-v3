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
- **Tailwind CSS** with Hublot-inspired luxury design system
- **Zustand** for state management
- **Radix UI** for accessible components

### Architecture Philosophy

1. **Guidewire PolicyCenter-Inspired UI**: Component-based architecture with journey and section navigation patterns
2. **Activity-Centric**: Every business action creates an activity via events
3. **Multi-Tenant**: All data is organization-scoped via `org_id`
4. **Role-Based**: UI and permissions vary by user role
5. **Inline Everything**: Panels and forms replace modal dialogs

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
│   │   ├── layouts/         # Layout components (SidebarLayout, AppShell)
│   │   ├── navigation/      # Navigation components (sidebars, top nav)
│   │   ├── recruiting/      # Recruiting domain components
│   │   ├── crm/             # CRM components (campaigns, leads, deals)
│   │   ├── workspace/       # Workspace/desktop components
│   │   ├── ui/              # Base UI components (Button, InlinePanel, etc.)
│   │   └── dashboard/       # Dashboard widgets
│   ├── lib/                 # Core libraries
│   │   ├── auth/            # Auth utilities
│   │   ├── supabase/        # Supabase client
│   │   ├── navigation/      # Navigation config (journeys, sections, top-nav)
│   │   ├── workflows/       # Workflow engine
│   │   └── trpc/            # tRPC client
│   ├── stores/              # Zustand stores (wizard state)
│   └── server/              # Server-side code
│       ├── trpc/            # tRPC configuration
│       └── routers/         # tRPC routers
├── supabase/
│   ├── migrations/          # Database migrations
│   └── functions/           # Edge functions
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

### 1. Guidewire-Inspired Navigation System

The UI implements a PolicyCenter-inspired architecture with two navigation styles:

#### Top Navigation (8 Tabs)
- **My Work** - Workspace, dashboard, today, activities
- **Accounts** - Account search and recent entities (last 10)
- **Contacts** - Contact management
- **Jobs** - Job requisitions
- **Candidates** - Talent database
- **CRM** - Leads and deals
- **Pipeline** - Submissions, interviews, offers
- **Administration** - System settings

Each dropdown shows recent entities (max 10 per type) with timestamps.

**Unified Sidebar**: Sidebar is context-dependent:
- **List pages** → `SectionSidebar` (nav links + recent entities)
- **Detail pages** → `EntityJourneySidebar` (journey/sections + tools + quick actions)

**Key files**:
- Config: `src/lib/navigation/top-navigation.ts`
- Component: `src/components/navigation/TopNavigation.tsx`

#### Navigation Styles

| Style | Entities | Use Case | URL Pattern |
|-------|----------|----------|-------------|
| **Journey** | job, candidate, submission, placement | Sequential workflow stages | `?step=1` |
| **Sections** | account, contact, deal, lead | Information categories | `?section=overview` |

**Journey Navigation** (workflow entities):
- Visual step indicator with completed/current/future states
- Status-dependent quick actions
- Files: `src/lib/navigation/entity-journeys.ts`, `src/components/navigation/EntityJourneySidebar.tsx`

**Section Navigation** (information entities):
- Category tabs with counts (Contacts, Jobs, Activities, Notes, etc.)
- Files: `src/lib/navigation/entity-sections.ts`, `src/components/navigation/AccountSectionSidebar.tsx`

### 2. Inline Panel Pattern

Inline panels slide in from the right replacing modal dialogs:

```tsx
// Pattern: List with inline panel
<div className="flex gap-4">
  {/* List shrinks when panel open */}
  <div className={cn('flex-1 transition-all duration-300',
    selectedId ? 'max-w-[calc(100%-496px)]' : 'max-w-full'
  )}>
    {items.map(item => <Card onClick={() => setSelectedId(item.id)} />)}
  </div>
  
  {/* Panel appears when item selected */}
  {selectedId && (
    <ContactInlinePanel contactId={selectedId} onClose={() => setSelectedId(null)} />
  )}
</div>
```

**Key files**:
- Base: `src/components/ui/inline-panel.tsx`
- Implementations: `src/components/recruiting/accounts/ActivityInlinePanel.tsx`, `ContactInlinePanel.tsx`, etc.

**Width options**: `sm` (320px), `md` (384px), `lg` (480px), `xl` (560px)

### 3. Editable Info Card Pattern

In-place editing for entity details:

```tsx
<EditableInfoCard
  title="Company Details"
  fields={[
    { key: 'name', label: 'Company Name', type: 'text', required: true },
    { key: 'industry', label: 'Industry', type: 'select', options: [...] },
    { key: 'website', label: 'Website', type: 'url' },
  ]}
  data={account}
  onSave={handleSaveCompanyDetails}
  columns={2}
/>
```

**File**: `src/components/ui/editable-info-card.tsx`

### 4. Inline Forms

Quick entry without leaving context:

```tsx
// Collapsed: "+ Log Activity" button
// Expanded: Full form with activity type, subject, description
<InlineActivityForm entityType="account" entityId={accountId} onSuccess={refetch} />
```

**Files**: `src/components/recruiting/accounts/InlineActivityForm.tsx`, `InlineNoteForm.tsx`

### 5. Page-based Wizards

Multi-step flows with URL-based step tracking:

```typescript
// URL: /jobs/intake?step=2
const currentStep = parseInt(searchParams.get('step') || '1')

const navigateToStep = (step: number) => {
  params.set('step', step.toString())
  router.push(`?${params.toString()}`, { scroll: false })
}
```

**Stores** (Zustand with persistence): `src/stores/job-intake-store.ts`, `account-onboarding-store.ts`, etc.

### 6. Entity Creation Patterns

**IMPORTANT**: Use **Page/Wizard pattern** for entity creation, NOT dialogs.

#### Why Page/Wizard over Dialogs

| Criteria | Page/Wizard | Dialog |
|----------|-------------|--------|
| **Persistence** | localStorage via Zustand | None - lost on close |
| **Draft Recovery** | Survives refresh/navigation | Lost immediately |
| **Multi-step** | Native URL tracking `?step=N` | Tabs within modal |
| **Architecture** | Unified with existing wizards | Inconsistent |

#### Pattern: Persistent Creation Wizard

```typescript
// 1. Create Zustand store with persist
// src/stores/create-[entity]-store.ts
export const useCreate[Entity]Store = create<Store>()(
  persist(
    (set) => ({
      formData: defaultFormData,
      currentStep: 1,
      setFormData: (data) => set((state) => ({
        formData: { ...state.formData, ...data },
        lastSaved: new Date(),
      })),
      resetForm: () => set({ formData: defaultFormData, currentStep: 1 }),
    }),
    { name: 'create-[entity]-draft' }  // localStorage key
  )
)

// 2. Create wizard page
// src/app/employee/[module]/[entity]/new/page.tsx
export default function New[Entity]Page() {
  const { formData, setFormData, currentStep } = useCreate[Entity]Store()
  const searchParams = useSearchParams()
  const step = parseInt(searchParams.get('step') || '1')
  // ... wizard UI with step components
}

// 3. Use href in config (NOT onClick)
// src/configs/entities/[entity].config.ts
primaryAction: {
  label: 'New [Entity]',
  icon: Plus,
  href: '/employee/[module]/[entity]/new',  // ✓ Use href
  // onClick: () => { ... }                  // ✗ Don't use onClick + events
}
```

#### Persistence Behavior

| Scenario | Result |
|----------|--------|
| Close tab | Draft saved in localStorage |
| Refresh page | Form data + step restored |
| Navigate away | Draft preserved |
| Click Cancel | Draft preserved (can resume later) |
| Submit success | Draft cleared, redirect to entity |
| Click "Discard" | Draft cleared, form reset |

#### Existing Wizard Stores

| Store | Entity | Steps |
|-------|--------|-------|
| `job-intake-store.ts` | Job | 6 steps |
| `account-onboarding-store.ts` | Account | 6 steps |
| `candidate-intake-store.ts` | Candidate | 5 steps |
| `create-campaign-store.ts` | Campaign | 5 steps |
| `extend-offer-store.ts` | Offer | 4 steps |

#### When to Use Each Pattern

| Pattern | Use Case | Example |
|---------|----------|---------|
| **Page/Wizard** | Multi-step creation, complex forms | New Campaign, New Account |
| **Inline Panel** | Quick view/edit existing entity | Contact details, Activity log |
| **Inline Form** | Single-field quick entry | Log activity, Add note |
| **Dialog** | Simple confirmation, quick action | Delete confirm, Status change |

### 7. Activity System

Unified activity table for all entity types:

```typescript
// Activity types
'email' | 'call' | 'meeting' | 'note' | 'linkedin_message' | 'task' | 'follow_up'

// Statuses
'scheduled' | 'open' | 'in_progress' | 'completed' | 'skipped' | 'canceled'

// Query pattern
adminClient.from('activities')
  .select('*, creator:user_profiles!created_by(id, full_name, avatar_url)')
  .eq('org_id', orgId)
  .eq('entity_type', 'account')  // or 'campaign', 'lead', etc.
  .eq('entity_id', entityId)
```

**Key files**:
- Router: `src/server/routers/activities.ts`
- Procedures: `log`, `listByEntity`, `getMyTasks`, `complete`, `skip`

### 7. Workspace/Desktop System

Personal workspace with "My X" tables and summary metrics:

| Route | Purpose |
|-------|---------|
| `/employee/workspace/dashboard` | Dashboard with 8 metric widgets |
| `/employee/workspace/desktop` | Personal tables (activities, accounts, jobs, submissions) |
| `/employee/workspace/today` | Task-focused view |

**Files**: `src/app/employee/workspace/desktop/page.tsx`, `src/components/workspace/MySummary.tsx`

### 8. Entity Workspace Architecture

**CRITICAL RULE**: All entity workspaces follow a consistent sidebar structure with **universal sections** and **context-specific sections**.

#### Universal Sections (ALWAYS Present)

These four sections appear on EVERY entity workspace - no exceptions:

| Section | Purpose | Polymorphic Query |
|---------|---------|-------------------|
| **Activities** | Logged actions (calls, emails, meetings, tasks) | `entity_type` + `entity_id` |
| **Notes** | Internal team notes and observations | `entity_type` + `entity_id` |
| **Documents** | Attached files, templates, collateral | `entity_type` + `entity_id` |
| **History** | Complete audit trail of all changes | `entity_type` + `entity_id` |

```typescript
// Universal sections - NEVER conditionally hide these
const UNIVERSAL_SECTIONS = ['activities', 'notes', 'documents', 'history'] as const
```

#### Context-Specific Sections (Vary by Entity Type)

These sections appear based on entity type or context:

| Entity Type | Context Sections |
|-------------|------------------|
| **Account** | Overview, Contacts, Jobs, Deals |
| **Contact** | Overview, Communication, Campaigns, Engagement, Qualification, Deals, Pipeline |
| **Campaign** | Overview, Prospects, Leads, Funnel, Sequence, Analytics |
| **Job** | Overview, Requirements, Submissions, Interviews |
| **Candidate** | Overview, Experience, Pipeline, Submissions |
| **Submission** | Overview, Interview, Feedback, Offer |
| **Placement** | Overview, Assignment, Timesheets, Compliance |

#### Unified Contact Workspace Pattern

The `contacts` table is the **single source of truth** for people. The same Contact Workspace component renders differently based on context:

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONTACT WORKSPACE                             │
│            (Single reusable component)                           │
├─────────────────────────────────────────────────────────────────┤
│  SIDEBAR                                                         │
│  ┌─────────────────┐                                            │
│  │ CONTEXT-SPECIFIC│ ← Varies by entry point                    │
│  │ • Overview      │                                            │
│  │ • Communication │                                            │
│  │ • [Campaigns]   │ ← Only for prospect/lead context           │
│  │ • [Qualification]│ ← Only for prospect context               │
│  │ • [Deals]       │ ← Only for lead context                    │
│  │ • [Pipeline]    │ ← Only for candidate context               │
│  ├─────────────────┤                                            │
│  │ UNIVERSAL       │ ← ALWAYS visible                           │
│  │ • Activities    │                                            │
│  │ • Notes         │                                            │
│  │ • Documents     │                                            │
│  │ • History       │                                            │
│  └─────────────────┘                                            │
└─────────────────────────────────────────────────────────────────┘
```

**URL Routing (same workspace, different contexts):**
```
/crm/campaigns/{id}/prospects/{contactId}  → Contact Workspace (prospect context)
/crm/leads/{contactId}                      → Contact Workspace (lead context)
/contacts/{contactId}                       → Contact Workspace (full context)
/recruiting/candidates/{contactId}          → Contact Workspace (candidate context)
```

**Data Model:**
```
contacts (single source of truth for people)
├── id, name, email, phone, company, title...
├── types: string[]  // ['prospect', 'lead', 'candidate'] - can be multiple
└── Linked via junction tables:
    ├── campaign_prospects → prospect enrollment in campaigns
    ├── leads → lead-specific data (score, status, deal link)
    ├── candidates → candidate-specific data (pipeline stage)
    └── activities, notes, documents → polymorphic (entity_type='contact')
```

**Context Detection:**
```typescript
// Determine which sections to show based on URL and contact types
function getContactSections(pathname: string, contactTypes: string[]) {
  const sections = ['overview', 'communication']  // Always show

  if (pathname.includes('/prospects') || contactTypes.includes('prospect')) {
    sections.push('campaigns', 'qualification', 'engagement')
  }
  if (pathname.includes('/leads') || contactTypes.includes('lead')) {
    sections.push('campaigns', 'deals', 'engagement')
  }
  if (pathname.includes('/candidates') || contactTypes.includes('candidate')) {
    sections.push('pipeline', 'submissions')
  }

  // Universal sections ALWAYS added last
  sections.push('activities', 'notes', 'documents', 'history')
  return sections
}
```

### 9. tRPC Routers

Type-safe API layer organized by domain:

```
src/server/routers/
├── crm.ts        # Accounts, leads, deals, campaigns
├── ats.ts        # Jobs, submissions, interviews
├── bench.ts      # Consultants, vendors
├── hr.ts         # Employees, pods
├── activities.ts # Activity CRUD
└── dashboard.ts  # Role metrics
```

**Root router**: `src/server/trpc/root.ts`

---

## Design System

**Hublot-inspired luxury aesthetic** with black/white/rose gold palette.

### Color Palette

| Usage | Value | Class |
|-------|-------|-------|
| Background | #FDFBF7 | `bg-cream` |
| Cards | #FFFFFF | `bg-white` |
| Primary Text | #171717 | `text-charcoal-900` |
| Primary Action | #000000 | `bg-hublot-900` |
| Accent (Gold) | #C9A961 | `bg-gold-500` / `text-gold-500` |
| Classic Gold | #D4AF37 | `bg-gold-400` / `text-gold-400` |

### Typography

- **Headlines**: Raleway (`font-heading`) - Geometric sans-serif with wide letter-spacing
- **UI Elements**: Raleway (`font-subheading`)
- **Body**: Inter (`font-body`)
- **Code**: JetBrains Mono (`font-mono`)

### Component Patterns

```tsx
// Primary button (black)
<Button variant="default">Submit</Button>

// Premium button (rose gold gradient)
<Button variant="premium">Premium Action</Button>

// Card with elevation
<Card className="bg-white rounded-lg shadow-elevation-sm hover:shadow-elevation-md transition-all duration-300">

// Navigation active state
<div className="bg-gold-50 text-gold-600 border-l-[3px] border-gold-500">
```

### Key Styling Rules
- Border radius: Sharp (4px-8px) - use `rounded-sm`, `rounded-lg`, NOT `rounded-xl`
- Transitions: 300ms (deliberate, luxury feel)
- Buttons: Uppercase with `tracking-wider`
- Focus states: Rose gold ring (`ring-gold-500`)
- Navigation: Gold accents on active/hover

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

**Migrations**: `supabase/migrations/`

### Core Patterns

- **Multi-tenancy**: All tables have `org_id`
- **Soft deletes**: Use `deleted_at` timestamp
- **Audit trail**: `created_at`, `updated_at`, `created_by`, `updated_by`
- **Polymorphic**: Activities, comments use `entity_type` + `entity_id`

---

## Common Tasks

### Adding a List Page (PCF Pattern)

List pages are **configuration-driven** - minimal page code, all behavior in config:

1. Create config in `src/configs/entities/[entity].config.ts`:
   - Define `ListViewConfig<Entity>` with columns, filters, stats, render mode
   - Add `useListQuery` hook calling tRPC procedure
   - Add `useStatsQuery` hook for stats cards (optional)

2. Create page (< 10 lines):
   ```tsx
   'use client'
   import { EntityListView } from '@/components/pcf/list-view/EntityListView'
   import { myEntityListConfig } from '@/configs/entities/my-entity.config'
   export default function MyEntityPage() {
     return <EntityListView config={myEntityListConfig} />
   }
   ```

3. Add tRPC procedures in `src/server/routers/`:
   - `list` procedure with filters, pagination, sorting
   - `stats` procedure for dashboard metrics

4. For sortable columns, map frontend keys to backend fields in config

### Adding a Detail Page with Sections

1. Create page in `src/app/employee/[module]/[entity]/[id]/page.tsx`
2. Add section components in `src/components/[module]/[entity]/sections/`
3. Configure sections in `src/lib/navigation/entity-sections.ts`
4. Add sidebar in `src/components/navigation/[Entity]SectionSidebar.tsx`

### Adding an Inline Panel

1. Create panel in `src/components/[module]/[Entity]InlinePanel.tsx`
2. Use `InlinePanel`, `InlinePanelHeader`, `InlinePanelContent` from `@/components/ui/inline-panel`
3. Add view/edit modes with `isEditing` state
4. Include Save/Cancel/Delete in footer

### Adding a tRPC Procedure

1. Add procedure to appropriate router in `src/server/routers/`
2. Follow existing patterns for input validation (Zod)
3. Use `orgProtectedProcedure` for org-scoped data
4. Filter by `org_id` and check `deleted_at`

### Creating an Entity Creation Wizard

1. **Create Zustand store** in `src/stores/create-[entity]-store.ts`:
   - Use `persist` middleware for localStorage
   - Define `formData` interface matching all form fields
   - Include `currentStep`, `isDirty`, `lastSaved` state
   - Add `setFormData`, `setCurrentStep`, `resetForm` actions

2. **Create wizard page** at `src/app/employee/[module]/[entity]/new/page.tsx`:
   - Use URL step tracking via `?step=N`
   - Show draft recovery banner if `lastSaved` exists
   - Sync URL step with store state

3. **Create step components** in `src/app/employee/[module]/[entity]/new/steps/`:
   - One component per step (e.g., `SetupStep.tsx`, `DetailsStep.tsx`)
   - Each receives `formData`, `setFormData`, `onNext`, `onPrev`, `onSubmit`

4. **Update entity config** to use `href`:
   ```typescript
   primaryAction: {
     label: 'New [Entity]',
     href: '/employee/[module]/[entity]/new',  // NOT onClick
   }
   ```

5. **Export store** from `src/stores/index.ts`

---

## Important Guidelines

### DO

- Use cream background (`bg-cream`) for pages
- Use `hublot-900` (black) for primary actions
- Use `gold-500` (warm gold) for premium/accent actions
- Use sharp corners (`rounded-sm`, `rounded-lg`) not `rounded-xl`
- Use 300ms transitions for luxury feel
- Use inline panels instead of modals where possible
- Create activities for business actions
- Filter data by `org_id` and `isNull(deleted_at)`
- Use tRPC for API calls
- Read files before editing them
- Use **Page/Wizard + Zustand persist** for entity creation (drafts survive refresh)
- Use `href` in primaryAction config for "New X" buttons

### DON'T

- Use `bg-gray-50` (use `bg-cream` instead)
- Use `rounded-xl` or larger for cards/buttons
- Use transitions faster than 250ms
- Skip activity creation for important actions
- Bypass org_id filtering
- Create manual API routes (use tRPC)
- Add features not specified in requirements
- Over-engineer or add unnecessary abstractions
- Use modals for entity details (use inline panels)
- Use dialogs for multi-step entity creation (use Page/Wizard instead)
- Use `onClick` + custom events for "New X" buttons (use `href` instead)

---

## Research & Planning

Before implementing features:

1. Check `thoughts/shared/research/` for prior analysis
2. Check `thoughts/shared/plans/` for existing implementation plans
3. Use `/research_codebase` command for deep analysis
4. Review similar implementations in the codebase

Key research documents:
- `thoughts/shared/research/2025-12-08-guidewire-ui-architecture-current-state.md` - Navigation, panels, sections
- `thoughts/shared/research/2025-12-08-campaign-workspace-system.md` - Campaign patterns

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

### Navigation System
- `src/lib/navigation/top-navigation.ts` - Top nav config
- `src/lib/navigation/entity-journeys.ts` - Journey definitions
- `src/lib/navigation/entity-sections.ts` - Section definitions
- `src/lib/navigation/EntityNavigationContext.tsx` - Navigation state
- `src/components/navigation/TopNavigation.tsx` - Top nav component
- `src/components/navigation/EntityJourneySidebar.tsx` - Journey sidebar
- `src/components/navigation/AccountSectionSidebar.tsx` - Account sections

### Layout System
- `src/components/layouts/SidebarLayout.tsx` - Main layout with sidebar selection
- `src/components/layouts/EntityContextProvider.tsx` - Entity context

### Inline Components
- `src/components/ui/inline-panel.tsx` - Base inline panel
- `src/components/ui/editable-info-card.tsx` - Editable cards
- `src/components/recruiting/accounts/ActivityInlinePanel.tsx` - Activity panel
- `src/components/recruiting/accounts/InlineActivityForm.tsx` - Quick activity form

### Workspace
- `src/app/employee/workspace/desktop/page.tsx` - Desktop page
- `src/components/workspace/MySummary.tsx` - Summary metrics
- `src/components/workspace/MyActivitiesTable.tsx` - Activities table

### Stores (Zustand with Persist)
- `src/stores/job-intake-store.ts` - Job intake wizard (6 steps)
- `src/stores/account-onboarding-store.ts` - Account onboarding (6 steps)
- `src/stores/candidate-intake-store.ts` - Candidate intake (5 steps)
- `src/stores/create-campaign-store.ts` - Campaign creation (5 steps)
- `src/stores/create-job-store.ts` - Quick job creation
- `src/stores/extend-offer-store.ts` - Offer extension (4 steps)
- `src/stores/schedule-interview-store.ts` - Interview scheduling
- `src/stores/submit-to-client-store.ts` - Submission to client

### API Layer
- `src/server/trpc/root.ts` - Router composition
- `src/server/routers/crm.ts` - CRM procedures
- `src/server/routers/activities.ts` - Activity procedures
