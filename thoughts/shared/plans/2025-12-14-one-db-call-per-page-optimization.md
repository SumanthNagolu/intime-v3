# ONE Database Call Per Page - Performance Optimization Plan

## Overview

**Objective**: Enforce a strict maximum of ONE database call per screen/page to eliminate waterfall requests and dramatically improve performance.

**Non-Negotiable Rule**: Every page renders with exactly ONE database call. No exceptions.

**Current State** (from research `2025-12-14-database-calls-per-page-audit.md`):
- List pages: 2 calls (list + stats)
- Detail pages: 3-5+ calls (entity + sections + panels)
- Workspace pages: 6-8 calls (multiple child components)
- Total pages affected: **147 pages**

**Target State**:
- Every page: **1 call**
- Server Components fetch data once
- Child components receive data as props
- Client-side queries only for mutations/refetches

## Desired End State

After this implementation:

1. **Every page loads with exactly ONE database call**
2. **Server Components** handle all initial data fetching
3. **No `useQuery` hooks** for initial page data (only for mutations/refetches)
4. **Section components** receive data as props, never fetch independently
5. **Stats are included** in list responses (no separate stats query)
6. **All related data** for detail pages loaded in single consolidated query

### Verification Checklist
- [ ] Network tab shows single API call on page load
- [ ] No waterfall requests visible in Chrome DevTools
- [ ] Time to First Contentful Paint improved by 40%+
- [ ] Lighthouse performance score > 90

## What We're NOT Doing

- NOT changing the database schema
- NOT implementing caching layers (React Query handles this)
- NOT changing the tRPC architecture
- NOT implementing GraphQL
- NOT changing authentication/authorization patterns
- NOT refactoring component structure beyond data flow

## Architecture Strategy

### Best-in-Class Pattern: Server Components + Consolidated Queries

```
┌─────────────────────────────────────────────────────────────────┐
│ CURRENT: Multiple Client-Side Queries (SLOW)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Page.tsx (client)                                              │
│    └─> useQuery(list)         ─┐                                │
│    └─> useQuery(stats)        ─┤─> 2+ round trips to server     │
│                                │                                │
│  EntityDetailView (client)     │                                │
│    └─> useQuery(entity)       ─┤─> DUPLICATE!                   │
│                                │                                │
│  SectionComponent (client)     │                                │
│    └─> useQuery(activities)   ─┤─> N more queries               │
│    └─> useQuery(notes)        ─┘                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ TARGET: Server Component + Single Query (FAST)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Page.tsx (SERVER COMPONENT)                                    │
│    └─> await getPageData()    ─── 1 DB call ───┐               │
│           │                                     │               │
│           ▼                                     │               │
│    <ClientComponent data={data} />              │               │
│                                                 │               │
│  ClientComponent (client)                       │               │
│    └─> props.data (NO useQuery)                 │               │
│                                                 │               │
│  SectionComponent (client)                      │               │
│    └─> props.sectionData (NO useQuery)          │               │
│                                                 ▼               │
│                                        Response with ALL data   │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Data Fetching | Server Components | Zero client-side waterfall, best Next.js 15 pattern |
| Query Consolidation | Single tRPC procedure per page | Maintain type safety, leverage existing patterns |
| Database Access | Supabase client (existing) | No migration needed, use `Promise.all()` for parallel |
| Complex Aggregations | PostgreSQL Views/Functions | Move heavy computation to DB layer |
| State Management | Props drilling + Context | Simple, predictable data flow |

---

## Implementation Approach

### Phase Overview

| Phase | Scope | Pages | Priority |
|-------|-------|-------|----------|
| **Phase 1** | List Pages | 44 | CRITICAL - Most used |
| **Phase 2** | Detail Pages | 39 | CRITICAL - Complex |
| **Phase 3** | Workspace Pages | 6 | HIGH - Dashboard heavy |
| **Phase 4** | Admin Pages | 43 | MEDIUM - Less traffic |
| **Phase 5** | Wizard Pages | 18 | LOW - Mostly client state |

---

## Phase 1: List Pages Consolidation

**Goal**: Every list page loads with ONE call returning `{ items, total, stats }`

### Overview

Transform list pages from 2 queries (list + stats) to 1 consolidated query.

### Changes Required

#### 1. Create Consolidated List Procedures

**Files**: All routers in `src/server/routers/*.ts`

For each entity with separate `list` and `stats` procedures, create consolidated `listWithStats`:

```typescript
// Example: src/server/routers/crm.ts

// BEFORE: Two procedures
list: orgProtectedProcedure
  .input(listInput)
  .query(async ({ ctx, input }) => {
    // Returns { items, total }
  }),

stats: orgProtectedProcedure
  .query(async ({ ctx }) => {
    // Returns { total, active, ... }
  }),

// AFTER: Single consolidated procedure
listWithStats: orgProtectedProcedure
  .input(listInput)
  .query(async ({ ctx, input }) => {
    const adminClient = getAdminClient()
    const { orgId } = ctx

    // Execute list query and stats in parallel
    const [listResult, statsResult] = await Promise.all([
      // List query with pagination
      adminClient
        .from('campaigns')
        .select('*, owner:user_profiles!owner_id(id, full_name, avatar_url)', { count: 'exact' })
        .eq('org_id', orgId)
        .is('deleted_at', null)
        // ... filters
        .range(input.offset, input.offset + input.limit - 1),

      // Stats aggregation (optimized - only fetch what's needed)
      adminClient
        .from('campaigns')
        .select('id, status, leads_generated, prospects_contacted')
        .eq('org_id', orgId)
        .is('deleted_at', null),
    ])

    // Calculate stats from raw data
    const stats = {
      total: listResult.count ?? 0,
      active: statsResult.data?.filter(c => c.status === 'active').length ?? 0,
      leadsGenerated: statsResult.data?.reduce((sum, c) => sum + (c.leads_generated ?? 0), 0) ?? 0,
      conversionRate: calculateConversionRate(statsResult.data),
    }

    return {
      items: transformItems(listResult.data),
      total: listResult.count ?? 0,
      stats,
    }
  }),
```

**Entities requiring consolidated procedures** (21 configs with both list + stats):
- `campaigns`, `accounts`, `candidates`, `companies` (3 variants)
- `consultants`, `contacts`, `deals`, `employees`
- `interviews`, `invoices`, `job-orders`, `jobs`
- `leads`, `payroll`, `placements`, `pods`
- `submissions`, `timesheets`, `vendors`

#### 2. Convert List Pages to Server Components

**Files**: All `src/app/employee/**/page.tsx` list pages (44 files)

**Pattern**:
```tsx
// BEFORE: Client component with useQuery
'use client'
import { EntityListView } from '@/components/pcf/list-view/EntityListView'
import { campaignsListConfig } from '@/configs/entities/campaigns.config'

export default function CampaignsPage() {
  return <EntityListView config={campaignsListConfig} />
}

// AFTER: Server component with data fetching
import { EntityListView } from '@/components/pcf/list-view/EntityListView'
import { campaignsListConfig } from '@/configs/entities/campaigns.config'
import { api } from '@/lib/trpc/server'

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined }
}) {
  // Parse URL params
  const filters = parseFilters(searchParams, campaignsListConfig.filters)

  // ONE database call
  const data = await api.crm.campaigns.listWithStats(filters)

  return (
    <EntityListViewClient
      config={campaignsListConfig}
      initialData={data}
    />
  )
}
```

#### 3. Update EntityListView to Accept Server Data

**File**: `src/components/pcf/list-view/EntityListView.tsx`

```typescript
// BEFORE
interface EntityListViewProps<T> {
  config: ListViewConfig<T>
  initialData?: { items: T[]; total: number }
  // ...
}

// Data fetched client-side
const listQuery = config.useListQuery({...})
const statsQuery = config.useStatsQuery?.()

// AFTER
interface EntityListViewProps<T> {
  config: ListViewConfig<T>
  initialData: {
    items: T[]
    total: number
    stats: Record<string, number>
  }
  // ...
}

// Data passed from server, NO client queries for initial load
// Only use queries for refetch after mutations
const [data, setData] = useState(initialData)

const refetch = async () => {
  const newData = await config.refetchData?.(filterValues)
  setData(newData)
}
```

#### 4. Update Entity Configs

**Files**: All `src/configs/entities/*.config.ts` (25 files)

```typescript
// BEFORE
useListQuery: (filters) => trpc.crm.campaigns.list.useQuery({...}),
useStatsQuery: () => trpc.crm.campaigns.stats.useQuery(),

// AFTER
// Remove useListQuery and useStatsQuery
// Add server-side fetch function
fetchData: async (filters) => {
  return api.crm.campaigns.listWithStats(filters)
},
// Add refetch function for client-side updates
refetchData: async (filters) => {
  return trpc.crm.campaigns.listWithStats.query(filters)
},
```

### Success Criteria

#### Automated Verification:
- [ ] `pnpm tsc` - No type errors
- [ ] `pnpm lint` - No linting errors
- [ ] `pnpm build` - Builds successfully
- [ ] All list pages render without errors

#### Manual Verification:
- [ ] Network tab shows SINGLE API call per list page load
- [ ] Stats cards populate correctly
- [ ] Pagination works
- [ ] Filters work
- [ ] Sorting works
- [ ] Page refresh maintains state

**Implementation Note**: After completing Phase 1 and all automated verification passes, pause for manual testing before proceeding to Phase 2.

---

## Phase 2: Detail Pages Consolidation

**Goal**: Every detail page loads with ONE call returning entity + ALL section data

### Overview

Transform detail pages from 3-5+ queries to 1 consolidated query that includes:
- Main entity with relations
- All section data (activities, notes, documents, etc.)
- Counts for sidebar badges

### Changes Required

#### 1. Create Comprehensive Detail Procedures

**Files**: All routers with `getById` or `getByIdWithCounts` procedures

Extend existing `getByIdWithCounts` pattern to include ALL section data:

```typescript
// Example: src/server/routers/crm.ts

getFullEntity: orgProtectedProcedure
  .input(z.object({ id: z.string().uuid() }))
  .query(async ({ ctx, input }) => {
    const adminClient = getAdminClient()
    const { orgId } = ctx

    // Step 1: Main entity with immediate relations
    const { data: campaign, error } = await adminClient
      .from('campaigns')
      .select(`
        *,
        owner:user_profiles!owner_id(id, full_name, avatar_url, email),
        approved_by_user:user_profiles!approved_by(id, full_name)
      `)
      .eq('id', input.id)
      .eq('org_id', orgId)
      .single()

    if (error || !campaign) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Campaign not found' })
    }

    // Step 2: ALL section data in parallel
    const [
      prospectsResult,
      leadsResult,
      activitiesResult,
      notesResult,
      documentsResult,
      sequenceResult,
      funnelResult,
    ] = await Promise.all([
      // Prospects (limit to first 100 for initial load)
      adminClient
        .from('campaign_enrollments')
        .select('*, contact:contacts!contact_id(id, first_name, last_name, email, company_name)')
        .eq('campaign_id', input.id)
        .order('created_at', { ascending: false })
        .limit(100),

      // Leads linked to campaign
      adminClient
        .from('leads')
        .select('*')
        .eq('campaign_id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .limit(100),

      // Activities for this campaign
      adminClient
        .from('activities')
        .select('*, creator:user_profiles!created_by(id, full_name, avatar_url)')
        .eq('entity_type', 'campaign')
        .eq('entity_id', input.id)
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })
        .limit(50),

      // Notes (activities with type='note')
      adminClient
        .from('activities')
        .select('*, creator:user_profiles!created_by(id, full_name, avatar_url)')
        .eq('entity_type', 'campaign')
        .eq('entity_id', input.id)
        .eq('activity_type', 'note')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })
        .limit(50),

      // Documents
      adminClient
        .from('campaign_documents')
        .select('*, uploader:user_profiles!uploaded_by(id, full_name)')
        .eq('campaign_id', input.id)
        .order('created_at', { ascending: false })
        .limit(50),

      // Sequence steps
      adminClient
        .from('campaign_sequence_steps')
        .select('*')
        .eq('campaign_id', input.id)
        .order('step_order', { ascending: true }),

      // Funnel metrics via RPC
      adminClient.rpc('get_campaign_funnel', { p_campaign_id: input.id }),
    ])

    // Step 3: Return consolidated object with ALL data
    return {
      // Main entity
      ...campaign,

      // Section data
      sections: {
        prospects: {
          items: prospectsResult.data ?? [],
          total: prospectsResult.data?.length ?? 0,
        },
        leads: {
          items: leadsResult.data ?? [],
          total: leadsResult.data?.length ?? 0,
        },
        activities: {
          items: activitiesResult.data ?? [],
          total: activitiesResult.data?.length ?? 0,
        },
        notes: {
          items: notesResult.data ?? [],
          total: notesResult.data?.length ?? 0,
        },
        documents: {
          items: documentsResult.data ?? [],
          total: documentsResult.data?.length ?? 0,
        },
        sequence: {
          steps: sequenceResult.data ?? [],
        },
      },

      // Counts for sidebar badges
      counts: {
        prospects: prospectsResult.data?.length ?? 0,
        leads: leadsResult.data?.length ?? 0,
        activities: activitiesResult.data?.length ?? 0,
        notes: notesResult.data?.length ?? 0,
        documents: documentsResult.data?.length ?? 0,
      },

      // Funnel metrics
      funnel: funnelResult.data?.[0] ?? null,
    }
  }),
```

#### 2. Convert Detail Pages to Server Components

**Files**: All `src/app/employee/**/[id]/page.tsx` detail pages (39 files)

```tsx
// BEFORE: Client component with multiple queries
'use client'

export default function CampaignPage() {
  const params = useParams()
  const campaignId = params.id as string

  // Query 1: Page level
  const campaignQuery = trpc.crm.campaigns.getByIdWithCounts.useQuery({ id: campaignId })

  return (
    <>
      {/* EntityDetailView makes Query 2 via config.useEntityQuery */}
      <EntityDetailView config={campaignsDetailConfig} entityId={campaignId} />
      {/* Dialogs... */}
    </>
  )
}

// AFTER: Server component with single data fetch
import { api } from '@/lib/trpc/server'
import { CampaignDetailClient } from './CampaignDetailClient'

export default async function CampaignPage({
  params,
}: {
  params: { id: string }
}) {
  // ONE database call - includes entity + ALL section data
  const data = await api.crm.campaigns.getFullEntity({ id: params.id })

  return <CampaignDetailClient data={data} />
}
```

#### 3. Create Client Wrapper Components

**Files**: New `src/app/employee/**/[id]/[Entity]DetailClient.tsx` (39 files)

```tsx
// src/app/employee/crm/campaigns/[id]/CampaignDetailClient.tsx
'use client'

import { useState, useEffect } from 'react'
import { EntityDetailView } from '@/components/pcf/detail-view/EntityDetailView'
import { campaignsDetailConfig, Campaign } from '@/configs/entities/campaigns.config'
import { EditCampaignDialog } from '@/components/crm/campaigns/EditCampaignDialog'
// ... other dialog imports

interface CampaignDetailClientProps {
  data: CampaignFullData // Type from getFullEntity return
}

export function CampaignDetailClient({ data }: CampaignDetailClientProps) {
  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  // ... other dialog states

  // Event listeners for dialogs
  useEffect(() => {
    const handleCampaignDialog = (event: CustomEvent) => {
      switch (event.detail.dialogId) {
        case 'edit':
          setEditDialogOpen(true)
          break
        // ... other cases
      }
    }

    window.addEventListener('openCampaignDialog', handleCampaignDialog)
    return () => window.removeEventListener('openCampaignDialog', handleCampaignDialog)
  }, [])

  return (
    <>
      {/* Pass server data to EntityDetailView */}
      <EntityDetailView<Campaign>
        config={campaignsDetailConfig}
        entityId={data.id}
        entity={data}
        sectionData={data.sections}
      />

      {/* Dialogs */}
      <EditCampaignDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        campaignId={data.id}
        // ...
      />
      {/* ... other dialogs */}
    </>
  )
}
```

#### 4. Update EntityDetailView to Accept Server Data

**File**: `src/components/pcf/detail-view/EntityDetailView.tsx`

```typescript
// BEFORE
interface EntityDetailViewProps<T> {
  config: DetailViewConfig<T>
  entityId: string
  entity?: T  // Optional - will query if not provided
  className?: string
}

// Uses config.useEntityQuery if entity not provided
const entityQuery = config.useEntityQuery(entityId)
const entity = serverEntity || entityQuery.data

// AFTER
interface EntityDetailViewProps<T> {
  config: DetailViewConfig<T>
  entityId: string
  entity: T  // REQUIRED - always provided from server
  sectionData: SectionDataMap  // All section data pre-loaded
  className?: string
}

// NO client query - entity always provided
const entity = props.entity
const sectionData = props.sectionData
```

#### 5. Update Section Components to Receive Props

**Files**: All section components in `src/configs/entities/sections/*.sections.tsx` (178+ section components)

```tsx
// BEFORE: Section queries its own data
export function CampaignProspectsSectionPCF({ entityId, entity }: PCFSectionProps) {
  // Independent query - BAD!
  const prospectsQuery = trpc.crm.campaigns.getProspects.useQuery(
    { campaignId: entityId, limit: 100 },
    { enabled: !!entityId }
  )

  const prospects = prospectsQuery.data?.items || []
  // ...
}

// AFTER: Section receives pre-loaded data as props
interface PCFSectionProps {
  entityId: string
  entity?: unknown
  sectionData?: {  // Pre-loaded section data
    items: any[]
    total: number
  }
}

export function CampaignProspectsSectionPCF({ entityId, entity, sectionData }: PCFSectionProps) {
  // NO query - use pre-loaded data
  const prospects = sectionData?.items || []
  const total = sectionData?.total || 0

  // For lazy loading MORE data (pagination), use a mutation or separate action
  const loadMore = async () => {
    // Client-side fetch for additional pages only
  }
  // ...
}
```

### Success Criteria

#### Automated Verification:
- [x] `pnpm tsc` - No type errors (1 pre-existing error in accounts.sections.tsx unrelated to Phase 2)
- [x] `pnpm lint` - No linting errors
- [x] `pnpm build` - Builds successfully
- [x] All detail pages render without errors

#### Manual Verification:
- [ ] Network tab shows SINGLE API call per detail page load
- [ ] All sections display correct data
- [ ] Section counts in sidebar are accurate
- [ ] Navigation between sections works
- [ ] Dialogs open and mutations work
- [ ] Page refresh loads correct data

**Implementation Note**: After completing Phase 2 and all automated verification passes, pause for manual testing before proceeding to Phase 3.

---

## Phase 3: Workspace Pages Consolidation

**Goal**: Workspace pages load with ONE call returning all dashboard data

### Overview

Transform workspace pages from 6-8 queries to 1 consolidated query.

### Changes Required

#### 1. Create Consolidated Workspace Procedure

**File**: `src/server/routers/dashboard.ts`

```typescript
getDesktopData: orgProtectedProcedure
  .input(z.object({
    tab: z.enum(['activities', 'accounts', 'jobs', 'submissions']).optional(),
    activityFilters: z.object({
      filterOverdue: z.boolean().optional(),
      filterDueToday: z.boolean().optional(),
    }).optional(),
  }))
  .query(async ({ ctx, input }) => {
    const adminClient = getAdminClient()
    const { orgId } = ctx
    const userId = ctx.user?.id

    // ALL workspace data in parallel
    const [
      prioritiesResult,
      pipelineResult,
      activitiesResult,
      accountsResult,
      jobsResult,
      submissionsResult,
    ] = await Promise.all([
      // Today's priorities (summary metrics)
      adminClient.rpc('get_todays_priorities', { p_user_id: userId, p_org_id: orgId }),

      // Pipeline health
      adminClient.rpc('get_pipeline_health', { p_user_id: userId, p_org_id: orgId }),

      // My activities
      adminClient
        .from('activities')
        .select('*, creator:user_profiles!created_by(id, full_name, avatar_url)')
        .eq('org_id', orgId)
        .eq('assignee_id', userId)
        .is('deleted_at', null)
        .order('due_date', { ascending: true })
        .limit(50),

      // My accounts
      adminClient
        .from('accounts')
        .select('*, owner:user_profiles!owner_id(id, full_name)')
        .eq('org_id', orgId)
        .eq('owner_id', userId)
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })
        .limit(50),

      // My jobs
      adminClient
        .from('jobs')
        .select('*, account:accounts!account_id(id, name)')
        .eq('org_id', orgId)
        .eq('owner_id', userId)
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })
        .limit(50),

      // My submissions
      adminClient
        .from('submissions')
        .select('*, job:jobs!job_id(id, title), candidate:candidates!candidate_id(id, first_name, last_name)')
        .eq('org_id', orgId)
        .eq('submitted_by', userId)
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })
        .limit(50),
    ])

    return {
      summary: {
        priorities: prioritiesResult.data,
        pipeline: pipelineResult.data,
      },
      tables: {
        activities: activitiesResult.data ?? [],
        accounts: accountsResult.data ?? [],
        jobs: jobsResult.data ?? [],
        submissions: submissionsResult.data ?? [],
      },
    }
  }),
```

#### 2. Convert Workspace Pages to Server Components

**Files**:
- `src/app/employee/workspace/desktop/page.tsx`
- `src/app/employee/workspace/dashboard/page.tsx`
- `src/app/employee/workspace/today/page.tsx`

```tsx
// src/app/employee/workspace/desktop/page.tsx

// BEFORE: Client component with 6+ child component queries
'use client'
export default function DesktopPage() {
  return (
    <div>
      <MySummary />           {/* 2 queries */}
      <MyActivitiesTable />   {/* 1 query */}
      <MyAccountsTable />     {/* 1 query */}
      <MyJobsTable />         {/* 1 query */}
      <MySubmissionsTable />  {/* 1 query */}
    </div>
  )
}

// AFTER: Server component with single data fetch
import { api } from '@/lib/trpc/server'
import { DesktopClient } from './DesktopClient'

export default async function DesktopPage({
  searchParams,
}: {
  searchParams: { tab?: string }
}) {
  // ONE database call
  const data = await api.dashboard.getDesktopData({
    tab: searchParams.tab as any,
  })

  return <DesktopClient data={data} initialTab={searchParams.tab} />
}
```

#### 3. Update Workspace Components to Receive Props

**Files**:
- `src/components/workspace/MySummary.tsx`
- `src/components/workspace/MyActivitiesTable.tsx`
- `src/components/workspace/MyAccountsTable.tsx`
- `src/components/workspace/MyJobsTable.tsx`
- `src/components/workspace/MySubmissionsTable.tsx`

```tsx
// BEFORE: Component with internal query
export function MySummary({ onMetricClick }: MySummaryProps) {
  const prioritiesQuery = trpc.dashboard.getTodaysPriorities.useQuery()
  const pipelineQuery = trpc.dashboard.getPipelineHealth.useQuery()
  // ...
}

// AFTER: Component receives data as props
interface MySummaryProps {
  data: {
    priorities: PrioritiesData
    pipeline: PipelineData
  }
  onMetricClick?: (metric: string) => void
}

export function MySummary({ data, onMetricClick }: MySummaryProps) {
  // NO queries - use passed data
  const { priorities, pipeline } = data
  // ...
}
```

### Success Criteria

#### Automated Verification:
- [ ] `pnpm tsc` - No type errors
- [ ] `pnpm lint` - No linting errors
- [ ] `pnpm build` - Builds successfully

#### Manual Verification:
- [ ] Network tab shows SINGLE API call on workspace page load
- [ ] Summary cards display correct data
- [ ] All tabs (Activities, Accounts, Jobs, Submissions) show correct data
- [ ] Tab switching works without additional queries
- [ ] Refresh button triggers single refetch

**Implementation Note**: After completing Phase 3 and all automated verification passes, pause for manual testing before proceeding to Phase 4.

---

## Phase 4: Admin Pages Consolidation

**Goal**: Admin pages load with ONE call each

### Overview

Apply same patterns to admin pages. Lower priority as they receive less traffic.

### Changes Required

#### 1. Apply List Page Pattern (13 admin list pages)

Same as Phase 1 - create `listWithStats` procedures and convert to server components.

**Admin list pages**:
- users, pods, roles, addresses
- integrations, webhooks, workflows
- email-templates, sla, activity-patterns
- audit, audit/rules

#### 2. Apply Detail Page Pattern (16 admin detail pages)

Same as Phase 2 - create `getFullEntity` procedures and convert to server components.

#### 3. Settings Pages (16 pages)

Settings pages typically load organization config. Create single `getOrgSettings`:

```typescript
getOrgSettings: orgProtectedProcedure
  .query(async ({ ctx }) => {
    const adminClient = getAdminClient()
    const { orgId } = ctx

    const [
      orgResult,
      brandingResult,
      securityResult,
      emailResult,
      // ... all settings categories
    ] = await Promise.all([
      adminClient.from('organizations').select('*').eq('id', orgId).single(),
      adminClient.from('organization_branding').select('*').eq('org_id', orgId).single(),
      adminClient.from('organization_security').select('*').eq('org_id', orgId).single(),
      adminClient.from('organization_email_settings').select('*').eq('org_id', orgId).single(),
      // ...
    ])

    return {
      organization: orgResult.data,
      branding: brandingResult.data,
      security: securityResult.data,
      email: emailResult.data,
      // ...
    }
  }),
```

### Success Criteria

#### Automated Verification:
- [ ] `pnpm tsc` - No type errors
- [ ] `pnpm lint` - No linting errors
- [ ] `pnpm build` - Builds successfully

#### Manual Verification:
- [ ] All admin pages load with single query
- [ ] Settings save correctly
- [ ] Admin operations work

---

## Phase 5: Wizard Pages Optimization

**Goal**: Wizard pages minimize queries (mostly client-side state)

### Overview

Wizard pages primarily use Zustand stores for client-side state. Only optimize initial data loads.

### Changes Required

#### 1. Pre-load Reference Data

For wizards that need reference data (dropdowns, etc.), load once at wizard start:

```typescript
// src/server/routers/reference.ts
getWizardReferenceData: orgProtectedProcedure
  .input(z.object({
    wizardType: z.enum(['job-intake', 'candidate-intake', 'campaign-create', ...])
  }))
  .query(async ({ ctx, input }) => {
    const adminClient = getAdminClient()
    const { orgId } = ctx

    // Load all reference data needed for wizard in parallel
    const [accounts, skills, locations, users] = await Promise.all([
      adminClient.from('accounts').select('id, name').eq('org_id', orgId).is('deleted_at', null),
      adminClient.from('skills').select('id, name').eq('org_id', orgId),
      adminClient.from('locations').select('id, name, city, state').eq('org_id', orgId),
      adminClient.from('user_profiles').select('id, full_name').eq('org_id', orgId),
    ])

    return { accounts, skills, locations, users }
  }),
```

### Success Criteria

#### Automated Verification:
- [ ] `pnpm tsc` - No type errors
- [ ] `pnpm build` - Builds successfully

#### Manual Verification:
- [ ] Wizards load quickly
- [ ] Dropdowns populate correctly
- [ ] Draft persistence works

---

## Database Optimization (Supporting Work)

### PostgreSQL Views for Complex Aggregations

Create views for frequently-used aggregations:

```sql
-- views/v_campaign_stats.sql
CREATE OR REPLACE VIEW v_campaign_stats AS
SELECT
  c.id,
  c.org_id,
  c.status,
  COUNT(ce.id) as prospects_count,
  COUNT(CASE WHEN ce.status = 'contacted' THEN 1 END) as contacted_count,
  COUNT(CASE WHEN ce.status = 'responded' THEN 1 END) as responded_count,
  COUNT(l.id) as leads_count,
  COALESCE(SUM(l.potential_value), 0) as pipeline_value
FROM campaigns c
LEFT JOIN campaign_enrollments ce ON ce.campaign_id = c.id
LEFT JOIN leads l ON l.campaign_id = c.id AND l.deleted_at IS NULL
WHERE c.deleted_at IS NULL
GROUP BY c.id;

-- Index for fast lookups
CREATE INDEX idx_v_campaign_stats_org ON campaigns(org_id) WHERE deleted_at IS NULL;
```

### PostgreSQL Functions for Complex Queries

```sql
-- functions/get_campaign_funnel.sql
CREATE OR REPLACE FUNCTION get_campaign_funnel(p_campaign_id UUID)
RETURNS TABLE (
  audience_size INT,
  contacted INT,
  opened INT,
  clicked INT,
  responded INT,
  leads_generated INT,
  meetings_booked INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.audience_size::INT,
    c.prospects_contacted::INT,
    c.emails_opened::INT,
    c.links_clicked::INT,
    c.prospects_responded::INT,
    c.leads_generated::INT,
    c.meetings_booked::INT
  FROM campaigns c
  WHERE c.id = p_campaign_id;
END;
$$ LANGUAGE plpgsql STABLE;
```

---

## Testing Strategy

### Unit Tests

For each consolidated procedure:
- Test returns all expected fields
- Test with various filter combinations
- Test pagination works
- Test counts are accurate

### Integration Tests

For each page type:
- Test server component renders
- Test data flows correctly to client components
- Test mutations work

### Performance Tests

- Measure time to first contentful paint before/after
- Measure number of database calls per page
- Measure response payload sizes

---

## Migration Notes

### Backwards Compatibility

During migration:
1. Keep old procedures working (deprecated)
2. Add new consolidated procedures alongside
3. Update pages one at a time
4. Remove old procedures after all pages migrated

### Feature Flags

Use feature flags to gradually roll out:

```typescript
// In page component
const useNewDataPattern = await isFeatureEnabled('one-db-call-pattern')

if (useNewDataPattern) {
  const data = await api.crm.campaigns.getFullEntity({ id })
  return <NewComponent data={data} />
} else {
  return <OldComponent />
}
```

---

## References

- Research document: `thoughts/shared/research/2025-12-14-database-calls-per-page-audit.md`
- Entity configs: `src/configs/entities/*.config.ts`
- PCF components: `src/components/pcf/`
- tRPC routers: `src/server/routers/`
- Existing consolidated pattern: `crm.ts:4782-4932` (`getByIdWithCounts`)

---

## Estimated Effort

| Phase | Scope | Files | Estimated Effort |
|-------|-------|-------|------------------|
| Phase 1 | List Pages | ~70 files | 3-4 days |
| Phase 2 | Detail Pages | ~220 files | 5-7 days |
| Phase 3 | Workspace | ~10 files | 1-2 days |
| Phase 4 | Admin | ~60 files | 2-3 days |
| Phase 5 | Wizards | ~20 files | 1 day |
| DB Work | Views/Functions | ~10 files | 1-2 days |
| Testing | All | - | 2-3 days |
| **Total** | | **~390 files** | **15-22 days** |

---

## Success Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| DB calls per list page | 2 | 1 | Network tab |
| DB calls per detail page | 3-5 | 1 | Network tab |
| DB calls per workspace | 6-8 | 1 | Network tab |
| Time to First Contentful Paint | TBD | -40% | Lighthouse |
| Lighthouse Performance Score | TBD | >90 | Lighthouse |
