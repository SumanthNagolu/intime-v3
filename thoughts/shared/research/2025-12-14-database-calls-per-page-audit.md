---
date: 2025-12-14T09:49:30-05:00
researcher: Claude
git_commit: 365d5c4
branch: main
repository: intime-v3
topic: "Database Calls Per Page/Screen Audit"
tags: [research, performance, database, tRPC, data-fetching]
status: complete
last_updated: 2025-12-14
last_updated_by: Claude
---

# Research: Database Calls Per Page/Screen Audit

**Date**: 2025-12-14T09:49:30-05:00
**Researcher**: Claude
**Git Commit**: 365d5c4
**Branch**: main
**Repository**: intime-v3

## Research Question

Document the current state of database calls per page/screen to prepare for performance optimization. The goal is to identify where multiple database calls occur per page, enabling consolidation to a maximum of one database call per screen.

## Summary

The codebase uses a **config-driven architecture** where `EntityListView` and `EntityDetailView` components receive configuration objects that define data fetching hooks. However, **multiple database calls occur on most pages** due to:

1. **Separate stats queries** - List pages call `useListQuery` + `useStatsQuery` (2 calls)
2. **Duplicate entity queries** - Detail pages often query at both page level AND EntityDetailView (2 calls)
3. **Section component queries** - Each rendered section makes its own independent query (N calls)
4. **Inline panel queries** - Conditional queries when panels open (additional calls)
5. **Workspace components** - Multiple child components each with own query (6+ calls)

## Detailed Findings

### Current Page Count

**Total Pages**: 172 pages across all portals
- Employee Portal: 141 pages
- Training Portal: 7 pages
- Marketing/Public: 18 pages (server components, no client queries)
- Auth: 1 page

### Database Call Patterns by Page Type

#### Pattern 1: List Pages (39 pages)

**Current calls: 2 per page**

| Hook | Purpose | tRPC Procedure Example |
|------|---------|------------------------|
| `useListQuery` | Paginated entity list | `trpc.crm.campaigns.list.useQuery()` |
| `useStatsQuery` | Stats cards data | `trpc.crm.campaigns.stats.useQuery()` |

**Files affected**:
- `src/components/pcf/list-view/EntityListView.tsx:94-102`
- All 24 entity configs in `src/configs/entities/*.config.ts`

**Example** (`EntityListView.tsx:94-102`):
```typescript
const listQuery = config.useListQuery({
  ...filterValues,
  limit: effectivePageSize,
  offset: (currentPage - 1) * effectivePageSize,
  sortBy,
  sortOrder,
})

const statsQuery = config.useStatsQuery?.()  // Second query
```

**Configs with BOTH useListQuery and useStatsQuery** (21 configs):
- accounts.config.ts, campaigns.config.ts, candidates.config.ts, companies.config.tsx (3 variants)
- consultants.config.ts, contacts.config.ts, deals.config.ts, employees.config.ts
- interviews.config.ts, invoices.config.ts, job-orders.config.ts, jobs.config.tsx
- leads.config.ts, payroll.config.ts, placements.config.ts, pods.config.ts
- submissions.config.ts, timesheets.config.ts, vendors.config.ts

**Configs with useListQuery but NO useStatsQuery** (4 configs):
- hotlists.config.ts, offers.config.ts, prospects.config.ts, sequences.config.ts

---

#### Pattern 2: Detail Pages with Config (36+ pages)

**Current calls: 3+ per page**

| Layer | Hook | Purpose |
|-------|------|---------|
| Page level | Direct tRPC query | Page state for event handlers |
| EntityDetailView | `config.useEntityQuery()` | Entity data for rendering |
| Active section | Section-specific query | Related data (activities, notes, etc.) |

**Example** (`src/app/employee/crm/campaigns/[id]/page.tsx:43`):
```typescript
// Query 1: Page level
const campaignQuery = trpc.crm.campaigns.getByIdWithCounts.useQuery({ id: campaignId })

// ... renders EntityDetailView which makes Query 2:
// config.useEntityQuery(entityId) -> same data!

// When sections render, Query 3+:
// Section components make their own queries
```

**Duplicate query issue**:
- Page queries for entity (for event handlers/mutations)
- EntityDetailView ALSO queries via `config.useEntityQuery()`
- Same data fetched twice

---

#### Pattern 3: Detail Page Sections (178 section components)

**Current calls: 1 per visible section (additive)**

Each section component makes its own independent query when rendered:

| Section Type | Example Query | Files |
|--------------|---------------|-------|
| Activities | `trpc.crm.activities.listByAccount.useQuery()` | `AccountActivitiesSection.tsx:29` |
| Submissions | `trpc.ats.submissions.list.useQuery()` | `JobSubmissionsSection.tsx:36` |
| Notes | `trpc.notes.listByEntity.useQuery()` | Various `NotesSection.tsx` |
| Documents | `trpc.documents.listByEntity.useQuery()` | Various `DocumentsSection.tsx` |
| Interviews | `trpc.ats.interviews.list.useQuery()` | `JobInterviewsSection.tsx` |

**Job detail page sections** (7 sections):
- JobSubmissionsSection, JobNotesSection, JobDocumentsSection
- JobRequirementsSection, JobActivitiesSection, JobInterviewsSection, JobOffersSection

**Account detail page sections** (multiple):
- AccountActivitiesSection, AccountContactsSection, AccountJobsSection
- AccountDealsSection, AccountNotesSection, AccountDocumentsSection

---

#### Pattern 4: Workspace Pages (4 pages)

**Current calls: 6+ per page**

| Component | Queries | Query Targets |
|-----------|---------|---------------|
| MySummary | 2 | `getTodaysPriorities`, `getPipelineHealth` |
| MyActivitiesTable | 1 | `getMyActivities` |
| MyAccountsTable | 1 | `getMyAccounts` |
| MyJobsTable | 1 | `getMyJobs` |
| MySubmissionsTable | 1 | `getMySubmissions` |

**File**: `src/app/employee/workspace/desktop/page.tsx`
- No direct queries at page level
- All queries in child components (6+ total)

**MySummary component** (`src/components/workspace/MySummary.tsx:92-97`):
```typescript
const prioritiesQuery = trpc.dashboard.getTodaysPriorities.useQuery({ limit: 50 })
const pipelineQuery = trpc.dashboard.getPipelineHealth.useQuery()
```

---

#### Pattern 5: Inline Panels (conditional)

**Current calls: 1 per open panel**

| Component | Query Pattern | File |
|-----------|---------------|------|
| ActivityInlinePanel | `enabled: !!activityId` | `ActivityInlinePanel.tsx:83-86` |
| ContactInlinePanel | `enabled: !!contactId` | `ContactInlinePanel.tsx` |
| SubmissionInlinePanel | `enabled: !!submissionId` | `SubmissionInlinePanel.tsx` |

**Pattern** (`ActivityInlinePanel.tsx:83-86`):
```typescript
const activityQuery = trpc.crm.activities.getById.useQuery(
  { id: activityId! },
  { enabled: !!activityId }  // Only fetch when panel opens
)
```

---

#### Pattern 6: Dashboard Widgets (3 widgets)

**Current calls: 1 per widget**

| Widget | Query | File |
|--------|-------|------|
| InvoicesWidget | `trpc.dashboard.getInvoicesStats.useQuery()` | `InvoicesWidget.tsx:13` |
| PayrollWidget | `trpc.dashboard.getPayrollStats.useQuery()` | `PayrollWidget.tsx` |
| TimesheetsWidget | `trpc.dashboard.getTimesheetsStats.useQuery()` | `TimesheetsWidget.tsx` |

---

### Database Call Count Summary

| Page Type | Minimum Calls | Maximum Calls | Example |
|-----------|---------------|---------------|---------|
| **List Page** | 2 | 2 | Campaigns list |
| **Detail Page** | 3 | 5+ | Campaign detail with sections |
| **Workspace Desktop** | 6 | 8+ | Desktop with all tables |
| **Workspace Today** | 4 | 6+ | Today's tasks |
| **Admin Settings** | 0-1 | 1 | Server components |
| **Wizard Pages** | 1-2 | 3 | Job intake wizard |

---

## Architecture Overview

### Data Fetching Layers

```
┌─────────────────────────────────────────────────────────────────┐
│ LAYER 1: Page Component                                         │
│   └─> May query entity for page-level state/handlers            │
├─────────────────────────────────────────────────────────────────┤
│ LAYER 2: EntityListView / EntityDetailView                      │
│   └─> Queries via config.useListQuery / config.useEntityQuery   │
│   └─> Stats via config.useStatsQuery (list only)                │
├─────────────────────────────────────────────────────────────────┤
│ LAYER 3: Section Components (detail pages only)                 │
│   └─> Each section queries its own related data                 │
│   └─> Activities, Notes, Documents, etc.                        │
├─────────────────────────────────────────────────────────────────┤
│ LAYER 4: Inline Panels (conditional)                            │
│   └─> Query only when panel opens (enabled: !!id)               │
└─────────────────────────────────────────────────────────────────┘
```

### tRPC Router Structure

41 routers with 500+ procedures organized by domain:

| Router | Procedures | Primary Entities |
|--------|------------|------------------|
| `crm` | 100+ | accounts, leads, deals, campaigns, contacts |
| `ats` | 100+ | jobs, submissions, interviews, offers, placements, candidates |
| `bench` | 20+ | consultants, vendors, job_orders |
| `hr` | 40+ | employees, pods, benefits, time_off |
| `activities` | 7 | polymorphic activities |
| `dashboard` | 10+ | aggregated metrics |
| `workflows` | 18 | workflow management |
| `contracts` | 25+ | contract management |

---

## Code References

### Core Components
- `src/components/pcf/list-view/EntityListView.tsx:94-102` - List queries
- `src/components/pcf/detail-view/EntityDetailView.tsx:38-40` - Detail query
- `src/components/workspace/MySummary.tsx:92-97` - Multiple dashboard queries

### Config Files (data hook definitions)
- `src/configs/entities/campaigns.config.ts:404-461` - useListQuery + useStatsQuery
- `src/configs/entities/accounts.config.ts:423-483` - useListQuery + useStatsQuery
- `src/configs/entities/jobs.config.tsx:552-618` - useListQuery + useStatsQuery
- `src/configs/entities/leads.config.ts:423-496` - useListQuery + useStatsQuery

### Section Components (independent queries)
- `src/components/recruiting/accounts/sections/AccountActivitiesSection.tsx:29`
- `src/components/recruiting/jobs/sections/JobSubmissionsSection.tsx:36`

### Pages with Multiple Queries
- `src/app/employee/crm/campaigns/[id]/page.tsx:43` - Page + EntityDetailView queries
- `src/app/employee/workspace/desktop/page.tsx` - 6+ queries via children
- `src/app/employee/workspace/today/page.tsx` - 4 queries for task management

### Type Definitions
- `src/configs/entities/types.ts:245-254` - useListQuery signature
- `src/configs/entities/types.ts:250-253` - useStatsQuery signature
- `src/configs/entities/types.ts:365-369` - useEntityQuery signature

---

## Key Issues for Consolidation

### Issue 1: Separate Stats Queries (21 configs)

**Current**: 2 separate calls
```typescript
useListQuery: (filters) => trpc.crm.campaigns.list.useQuery({...})
useStatsQuery: () => trpc.crm.campaigns.stats.useQuery()
```

**Opportunity**: Merge into single call returning `{ items, total, stats }`

### Issue 2: Duplicate Entity Queries (36+ pages)

**Current**: Page AND EntityDetailView both query entity
```typescript
// Page level
const entityQuery = trpc.entity.getById.useQuery({ id })

// EntityDetailView also calls
config.useEntityQuery(id) // Same data!
```

**Opportunity**: Pass server data or lift query to single location

### Issue 3: Section Component Queries (178 components)

**Current**: Each section queries independently
```typescript
// ActivitiesSection
trpc.activities.listByEntity.useQuery({ entityType, entityId })

// NotesSection
trpc.notes.listByEntity.useQuery({ entityType, entityId })

// DocumentsSection
trpc.documents.listByEntity.useQuery({ entityType, entityId })
```

**Opportunity**: Load all section data in parent entity query

### Issue 4: Workspace Multi-Query (6+ calls)

**Current**: Each child component queries independently
```typescript
<MySummary />        // 2 queries
<MyActivitiesTable /> // 1 query
<MyAccountsTable />   // 1 query
<MyJobsTable />       // 1 query
<MySubmissionsTable /> // 1 query
```

**Opportunity**: Single aggregated dashboard query

---

## Files Requiring Changes

### Config Files (25 files)
All `src/configs/entities/*.config.ts` files that define `useListQuery` + `useStatsQuery`

### PCF Components (2 files)
- `src/components/pcf/list-view/EntityListView.tsx`
- `src/components/pcf/detail-view/EntityDetailView.tsx`

### Section Components (178 files)
All `src/components/*/sections/*Section.tsx` files

### Workspace Components (5 files)
- `src/components/workspace/MySummary.tsx`
- `src/components/workspace/MyActivitiesTable.tsx`
- `src/components/workspace/MyAccountsTable.tsx`
- `src/components/workspace/MyJobsTable.tsx`
- `src/components/workspace/MySubmissionsTable.tsx`

### tRPC Routers (41 files)
All `src/server/routers/*.ts` files need consolidated procedures

---

## Related Research

- None found in thoughts/shared/research/ related to this specific topic

## Open Questions

1. **Server-side rendering strategy**: Should entity data be fetched server-side and passed to client components?
2. **Section lazy loading**: Should sections remain lazy-loaded (better initial load) or pre-fetched (single query)?
3. **Caching strategy**: How should React Query cache be configured for consolidated queries?
4. **Migration order**: Which pages should be consolidated first (highest traffic)?
