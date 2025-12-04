---
date: 2025-12-03T20:51:51-05:00
researcher: Claude
git_commit: df2bd238ff7c74319acc6a746b018cd24a7bb243
branch: main
repository: intime-v3
topic: "UI Architecture Reference for Clean Rebuild (Excluding Marketing)"
tags: [research, ui-architecture, screens, forms, portals, metadata-driven]
status: complete
last_updated: 2025-12-03
last_updated_by: Claude
---

# Research: UI Architecture Reference for Clean Rebuild

**Date**: 2025-12-03T20:51:51-05:00
**Researcher**: Claude
**Git Commit**: df2bd238ff7c74319acc6a746b018cd24a7bb243
**Branch**: main
**Repository**: intime-v3

## Research Question

Understanding the current UI system architecture, portal setup, and relevant files for a clean rebuild approach: building forms from specs, then user flows, then screens. Documenting what exists and how it can be referenced during rebuilding.

## Summary

The InTime v3 codebase implements a **Guidewire-inspired metadata-driven UI framework** with:
- **Screen definitions** as TypeScript objects in `src/screens/`
- **Renderers** that interpret metadata and produce UI in `src/lib/metadata/renderers/`
- **Widget registries** mapping component names to React implementations
- **Role-based layouts** providing navigation context
- **Three portals**: Employee (role-based), Client, Talent
- **Comprehensive specs** in `docs/specs/` with 282 database specs, 113 workflow specs

---

## 1. Files to Move to Temporary Reference Folder

### 1.1 Screen Definitions (src/screens/)

These files contain the metadata-driven screen specifications:

| Directory | Files | Purpose |
|-----------|-------|---------|
| `src/screens/recruiting/` | 15 files | Recruiter screens (dashboard, jobs, candidates, submissions, etc.) |
| `src/screens/bench-sales/` | 18 files | Bench sales screens (consultants, hotlists, job orders, etc.) |
| `src/screens/crm/` | 8 files | CRM screens (accounts, leads, deals, campaigns) |
| `src/screens/ta/` | 5 files | Talent acquisition screens |
| `src/screens/admin/` | 12 files | Admin screens |
| `src/screens/hr/` | 4 files | HR screens |
| `src/screens/operations/` | 2 files | Operations screens |
| `src/screens/portals/` | 3 dirs | Client, Talent, Academy portal screens |
| `src/screens/index.ts` | 1 file | Central screen registry |

**Key files with line references:**
- `src/screens/index.ts:80-125` - Combined screen registry with `loadScreen()` function
- `src/screens/recruiting/index.ts:56-109` - Lazy-loading pattern for screens
- `src/screens/recruiting/recruiter-dashboard.screen.ts:19-25` - Dashboard screen example
- `src/screens/recruiting/candidate-detail.screen.ts:16-23` - Detail screen example
- `src/screens/crm/account-list.screen.ts:140-198` - List screen with metrics example

### 1.2 Metadata Renderers (src/lib/metadata/renderers/)

These interpret screen metadata and render UI:

| File | Lines | Purpose |
|------|-------|---------|
| `ScreenRenderer.tsx` | 598 lines | Top-level orchestrator, form state, context |
| `LayoutRenderer.tsx` | 480 lines | Layout type implementations (single-column, tabs, sidebar-main, wizard) |
| `SectionRenderer.tsx` | 720 lines | Section type implementations (info-card, form, table, timeline, custom) |
| `WidgetRenderer.tsx` | 280 lines | Individual field/widget rendering |
| `ListRenderer.tsx` | 950 lines | Specialized list screen renderer with data fetching |
| `index.ts` | 26 lines | Renderer exports |

**Key implementation references:**
- `ScreenRenderer.tsx:423-449` - RenderContext creation
- `LayoutRenderer.tsx:177-264` - Sidebar-main layout implementation
- `SectionRenderer.tsx:608-640` - Widget data key mapping
- `ListRenderer.tsx:137-259` - tRPC data fetching by entity type

### 1.3 Widget Registries (src/lib/metadata/registry/)

| File | Lines | Purpose |
|------|-------|---------|
| `widget-registry.ts` | 175 lines | Field/widget component registry |
| `section-widget-registry.ts` | 75 lines | Dashboard/custom widget registry |

**Key references:**
- `widget-registry.ts:102-146` - Field type to widget mapping
- `widget-registry.ts:165-171` - `getWidgetForField()` function

### 1.4 Widgets (src/lib/metadata/widgets/)

| Directory | Files | Purpose |
|-----------|-------|---------|
| `display/` | ~20 files | Read-only display widgets |
| `input/` | ~30 files | Editable input widgets |
| `dashboard/` | ~20 files | Dashboard section widgets |
| `bench/` | 4 files | Bench-specific widgets |
| `custom/` | ~13 files | Custom specialized widgets |
| `register-widgets.ts` | 360 lines | Auto-registration entry point |

**Key references:**
- `register-widgets.ts:75-341` - Main widget registration
- `dashboard/index.ts:41-91` - Dashboard widget registration

### 1.5 Type Definitions (src/lib/metadata/types/)

| File | Lines | Purpose |
|------|-------|---------|
| `screen.types.ts` | 550 lines | ScreenDefinition, LayoutDefinition, SectionDefinition |
| `widget.types.ts` | 250 lines | FieldDefinition, WidgetDefinition, 88 field types |
| `data.types.ts` | 200 lines | DynamicValue, DataSource, Visibility types |
| `index.ts` | 50 lines | Type exports |

**Key type references:**
- `screen.types.ts:16-22` - ScreenType enum
- `screen.types.ts:30-95` - ScreenDefinition interface
- `screen.types.ts:118-126` - LayoutType enum
- `screen.types.ts:176-191` - SectionType enum
- `widget.types.ts:14-88` - 88 field types

### 1.6 Layout Components (src/components/layouts/)

| File | Lines | Purpose |
|------|-------|---------|
| `AppShell.tsx` | 150 lines | Main app shell with header/sidebar |
| `AdminLayout.tsx` | 231 lines | Admin navigation + access control |
| `RecruitingLayout.tsx` | 1206 lines | Recruiting navigation + modals |
| `BenchLayout.tsx` | 158 lines | Bench sales navigation |
| `HRLayout.tsx` | 166 lines | HR navigation |
| `TALayout.tsx` | 148 lines | Talent acquisition navigation |
| `AcademyLayout.tsx` | 138 lines | Academy navigation |
| `CEOLayout.tsx` | 144 lines | Executive navigation |
| `ImmigrationLayout.tsx` | 138 lines | Immigration navigation |
| `QuickActions.tsx` | 165 lines | Context-aware quick actions |
| `PortalLayout.tsx` | 97 lines | Portal landing page layout |
| `WorkspaceLayout.tsx` | 40 lines | Workspace wrapper |
| `AuthLayout.tsx` | 80 lines | Auth flow layout |
| `index.ts` | 73 lines | Layout exports |

**Key references:**
- `AppShell.tsx:69-93` - Portal type detection from pathname
- `RecruitingLayout.tsx:51-83` - Navigation section definitions
- `RecruitingLayout.tsx:619-1203` - Multi-step submission modal

### 1.7 Navigation Configuration (src/lib/navigation/)

| File | Lines | Purpose |
|------|-------|---------|
| `navConfig.ts` | 1346 lines | Role-based navigation definitions |
| `types.ts` | 120 lines | Navigation type definitions |
| `layoutTokens.ts` | 65 lines | Design token values |
| `breadcrumbs.ts` | ~50 lines | Breadcrumb utilities |
| `index.ts` | 20 lines | Navigation exports |

**Key references:**
- `navConfig.ts:63-164` - Recruiter navigation
- `navConfig.ts:167-249` - Bench sales navigation
- `navConfig.ts:667-782` - Admin navigation
- `navConfig.ts:1208-1234` - Client portal navigation
- `navConfig.ts:1239-1265` - Talent portal navigation
- `navConfig.ts:1297-1329` - `getNavigation()` function

### 1.8 Form Components (src/components/forms/)

| File | Lines | Purpose |
|------|-------|---------|
| `FormField.tsx` | 898 lines | 20+ field types with formatting |
| `FormSection.tsx` | 209 lines | Collapsible sections with status |
| `FormStepper.tsx` | 331 lines | Multi-step wizard |
| `validation.ts` | 719 lines | Common validators and schemas |
| `transformers.ts` | 486 lines | Data transformation pipeline |
| `defaults.ts` | 312 lines | Form default values |
| `hooks.ts` | 521 lines | Form hooks (draft, dirty, progress) |
| `domain/LeadForm.tsx` | 453 lines | Lead form with BANT |
| `domain/JobForm.tsx` | 362 lines | Job creation form |

**Key references:**
- `FormField.tsx:26-49` - Supported field types
- `FormField.tsx:85-112` - Auto-formatting logic
- `validation.ts:112-158` - Job form schema
- `transformers.ts:357-382` - Generic form transformer
- `hooks.ts:67-145` - Auto-save draft hook

### 1.9 Validation Schemas (src/lib/validations/)

| File | Lines | Purpose |
|------|-------|---------|
| `crm.ts` | 283 lines | Accounts, Contacts, Leads, Deals schemas |
| `ats.ts` | 1041 lines | Jobs, Submissions, Interviews, Offers, Placements |
| `shared.ts` | 157 lines | Notifications, Tasks, Comments |
| `bench.ts` | 100 lines | Bench metadata, external jobs |
| `account.ts` | ~50 lines | Account-specific schemas |

**Key references:**
- `crm.ts:191-202` - Lead schema with refinement
- `ats.ts:385-407` - Country-aware postal code validation

### 1.10 Page Components (src/app/)

**Employee Portal Pages** (`src/app/employee/`):
| Path | Key Files |
|------|-----------|
| `recruiting/` | dashboard, jobs, talent, submissions, interviews, placements, accounts, contacts, leads, deals |
| `bench/` | dashboard, talent, consultants, hotlists, job-orders, vendors, placements, marketing, commission, immigration |
| `ta/` | dashboard, activities, leads, deals, campaigns, internal-jobs, training |
| `hr/` | dashboard, people, pods, org, payroll, time, performance, onboarding, benefits, compliance |
| `admin/` | dashboard, users, roles, pods, permissions, settings, integrations, workflows, audit |
| `manager/` | dashboard, team, sprint, 1on1, activities, escalations, approvals |
| `ceo/`, `cfo/`, `coo/` | Executive dashboards |

**Client Portal Pages** (`src/app/client/`):
- dashboard, jobs, submissions, interviews, placements, pipeline, candidate, reports, settings

**Talent Portal Pages** (`src/app/talent/`):
- dashboard, profile, jobs, applications, interviews, offers, saved, settings

### 1.11 Component Renderers (src/components/)

| Directory | Files | Purpose |
|-----------|-------|---------|
| `recruiting/` | DashboardRenderer, CandidatesListRenderer, JobsListRenderer, Modals |
| `bench/` | BenchDashboardRenderer, BenchActivitiesRenderer, MarketingProfilesRenderer |
| `crm/` | AccountsListRenderer, DealPipelineRenderer, LeadsListRenderer |
| `admin/` | AdminUsersListRenderer |

---

## 2. Portal Structure

### 2.1 Employee Portal (`/employee/`)

**Entry**: `src/app/employee/portal/page.tsx:20-48`
- Role detection from user profile
- Routes to role-specific dashboard via workspace router

**Workspace Router**: `src/app/employee/workspace/page.tsx:20-98`
- Maps roles to dashboard paths
- Redirects based on primary role

**Role Dashboards**:
| Role | Path | Layout |
|------|------|--------|
| Recruiter | `/employee/recruiting/dashboard` | RecruitingLayout |
| Bench Sales | `/employee/bench/dashboard` | BenchLayout |
| TA Specialist | `/employee/ta/dashboard` | TALayout |
| HR Manager | `/employee/hr/dashboard` | HRLayout |
| Manager | `/employee/manager/dashboard` | ManagerLayout |
| Admin | `/employee/admin/dashboard` | AdminLayout |
| CEO/CFO/COO | `/employee/{role}/dashboard` | CEOLayout |

### 2.2 Client Portal (`/client/`)

**Entry**: `src/app/client/portal/page.tsx:11` - Redirects to `/client/dashboard`

**Pages**: dashboard, jobs (list + detail), submissions, interviews, placements, pipeline, candidate detail, reports, settings

**Pattern**: All use `AppLayout` + `ScreenRenderer`

### 2.3 Talent Portal (`/talent/`)

**Entry**: `src/app/talent/portal/page.tsx:11` - Redirects to `/talent/dashboard`

**Pages**: dashboard, profile, jobs (search + apply), applications, interviews, offers, saved, settings

**Pattern**: All use `AppLayout` + `ScreenRenderer`

---

## 3. Specs Directory Structure

### 3.1 Location
`docs/specs/`

### 3.2 Organization

| Directory | Contents | Files |
|-----------|----------|-------|
| `00-INDEX.md` | Main navigation | 1 |
| `01-GLOSSARY.md` | Terms and definitions | 1 |
| `10-DATABASE/` | 282 table specifications | 282 |
| `20-USER-ROLES/` | 113 workflow specifications | 113 |
| `30-SCREENS/` | Screen map + placeholders | 2 + dirs |
| `40-FORMS/` | Placeholder | .gitkeep |
| `50-COMPONENTS/` | Placeholder | .gitkeep |
| `PROMPTS/` | 27 implementation prompts | 27 |

### 3.3 Key Spec References

**Database specs** (`10-DATABASE/`):
- `01-CORE/` - 12 core tables (orgs, users, RBAC)
- `02-CRM/` - 26 CRM tables
- `03-RECRUITING/` - 46 ATS tables
- `04-BENCH-SALES/` - 23 bench tables
- `05-ACADEMY/` - 65 academy tables
- `06-ACTIVITIES/` - 33 activity tables
- `07-HR/` - 37 HR tables

**User role specs** (`20-USER-ROLES/`):
- `01-recruiter/` - 26 workflow specs
- `02-bench-sales/` - 18 workflow specs
- `03-ta/` - 8 workflow specs
- `10-admin/` - 11 workflow specs
- `11-client-portal/` - 8 workflow specs
- `12-candidate-portal/` - 5 workflow specs

**Screen specs** (`30-SCREENS/`):
- `00-SCREEN-MAP.md` - Complete screen registry
- `01-LAYOUT-SHELL.md` - App shell specification

---

## 4. System Flow Summary

### 4.1 Screen Definition → Rendering Pipeline

```
1. Screen Definition (.screen.ts file)
   ↓
2. Screen Registry (src/screens/index.ts)
   ↓
3. Next.js Page imports definition
   ↓
4. ScreenRenderer receives definition + context
   ↓
5. LayoutRenderer interprets layout.type
   ↓
6. SectionRenderer renders each section
   ↓
7. WidgetRenderer or Custom Widget
   ↓
8. React Component renders DOM
```

### 4.2 Form Submission Flow

```
1. FormField components with validation
   ↓
2. React Hook Form + Zod schema
   ↓
3. transformFormToPayload() sanitization
   ↓
4. trpc.{router}.{procedure}.useMutation()
   ↓
5. tRPC router handles request
   ↓
6. Database operation via Drizzle
```

---

## 5. Suggested Temporary Folder Structure

For reference during rebuild:

```
.archive/ui-reference/
├── screens/              # Copy of src/screens/
├── renderers/            # Copy of src/lib/metadata/renderers/
├── widgets/              # Copy of src/lib/metadata/widgets/
├── types/                # Copy of src/lib/metadata/types/
├── registry/             # Copy of src/lib/metadata/registry/
├── layouts/              # Copy of src/components/layouts/
├── forms/                # Copy of src/components/forms/
├── navigation/           # Copy of src/lib/navigation/
├── validations/          # Copy of src/lib/validations/
└── component-renderers/  # Copy of specific renderer components
```

---

## 6. Key Patterns for New Implementation

### 6.1 Screen Definition Pattern

```typescript
// src/screens/{module}/{screen-name}.screen.ts
export const myScreen: ScreenDefinition = {
  id: 'my-screen',
  type: 'list' | 'detail' | 'dashboard' | 'wizard',
  entityType: 'entity_name',
  title: 'Screen Title',

  dataSource: {
    type: 'query',
    procedure: 'router.procedure',
  },

  layout: {
    type: 'single-column' | 'sidebar-main' | 'tabs',
    sections: [/* section definitions */],
  },

  actions: [/* action definitions */],
  navigation: { breadcrumbs: [/* */] },
};
```

### 6.2 Page Integration Pattern

```typescript
// src/app/employee/{module}/{page}/page.tsx
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { myScreen } from '@/screens/{module}';

export default function MyPage() {
  return (
    <AppLayout>
      <ModuleLayout>
        <Suspense fallback={<Skeleton />}>
          <ScreenRenderer definition={myScreen} />
        </Suspense>
      </ModuleLayout>
    </AppLayout>
  );
}
```

### 6.3 Form-First Development Pattern

```
1. Define Zod schema in src/lib/validations/
2. Create form component with FormField components
3. Connect to tRPC mutation
4. Create screen definition referencing form
5. Create page using ScreenRenderer
```

---

## Code References

### Screen System
- `src/screens/index.ts:80-125` - Screen registry and loadScreen
- `src/lib/metadata/types/screen.types.ts:30-95` - ScreenDefinition interface
- `src/lib/metadata/renderers/ScreenRenderer.tsx:397-598` - Main render logic

### Portal Structure
- `src/app/employee/workspace/page.tsx:20-63` - Role to dashboard mapping
- `src/components/layouts/AppShell.tsx:69-93` - Portal detection
- `src/lib/navigation/navConfig.ts:1297-1329` - getNavigation function

### Forms
- `src/components/forms/FormField.tsx:26-49` - Field type definitions
- `src/lib/validations/ats.ts:47-97` - Job schema example
- `src/components/forms/transformers.ts:357-382` - Data transformation

### Widgets
- `src/lib/metadata/registry/widget-registry.ts:102-146` - Field to widget mapping
- `src/lib/metadata/widgets/register-widgets.ts:75-341` - Widget registration

---

## Open Questions

1. Which Marketing pages are being preserved and should be excluded from cleanup?
2. What is the priority order for rebuilding screens by module?
3. Are there any existing forms that should be preserved as reference implementations?
4. Should the widget registry system be preserved or rebuilt?
