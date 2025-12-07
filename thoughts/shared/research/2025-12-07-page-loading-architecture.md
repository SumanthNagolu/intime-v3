---
date: 2025-12-07T11:53:06-0500
researcher: Claude Code
git_commit: e61af168bab02daa1b176f20e120cf9570751f4a
branch: main
repository: SumanthNagolu/intime-v3
topic: "Page Loading Architecture and Performance Characteristics"
tags: [research, codebase, performance, page-loading, tRPC, next.js, data-fetching]
status: complete
last_updated: 2025-12-07
last_updated_by: Claude Code
---

# Research: Page Loading Architecture and Performance Characteristics

**Date**: 2025-12-07T11:53:06-0500
**Researcher**: Claude Code
**Git Commit**: e61af168bab02daa1b176f20e120cf9570751f4a
**Branch**: main
**Repository**: SumanthNagolu/intime-v3

## Research Question

Document how page loading works in the InTime v3 codebase - understand the data fetching patterns, rendering architecture, and all relevant files/line numbers that contribute to page load times.

## Summary

The InTime v3 application uses a **client-first rendering architecture** where:
- All pages are client components (`'use client'`)
- No server-side data fetching occurs
- All data is fetched client-side via tRPC/React Query after the page renders
- No Next.js `loading.tsx` streaming is used
- No dynamic imports or code splitting for components

This architecture means every page load follows this sequence:
1. Server sends JavaScript bundle
2. React hydrates the page
3. Client initiates tRPC queries
4. Loading skeletons shown during fetch
5. Data returns and UI renders

---

## Detailed Findings

### 1. Page Rendering Architecture

#### All Pages Are Client Components

Every page in the employee portal uses the `'use client'` directive at the top. This means:
- Pages cannot fetch data on the server
- Full JavaScript bundle must load before any data fetching begins
- No HTML streaming with Suspense boundaries

**Evidence** - Grep results show 38+ files with `'use client'`:
- `src/app/employee/recruiting/jobs/page.tsx:1`
- `src/app/employee/recruiting/candidates/page.tsx:1`
- `src/app/employee/recruiting/accounts/page.tsx:1`
- `src/app/employee/crm/leads/page.tsx:1`
- `src/app/employee/crm/deals/page.tsx:1`
- All `[id]/layout.tsx` and `[id]/page.tsx` files

#### Only Root Layout is Server Component

**File**: `src/app/layout.tsx:12-33`

The only server component is the root layout which:
- Sets HTML structure and metadata
- Wraps app in TRPCProvider
- Mounts global UI (Toaster, CommandPalette)

```typescript
// src/app/layout.tsx - NO 'use client' directive
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cream antialiased font-body">
        <TRPCProvider>
          {children}
        </TRPCProvider>
      </body>
    </html>
  );
}
```

#### No loading.tsx Files

The codebase does **not use Next.js streaming** via `loading.tsx` files. A glob search for `loading.tsx` returns no results in `src/app/`.

---

### 2. Data Fetching Architecture

#### tRPC + React Query Client-Side Fetching

All data fetching happens client-side using tRPC hooks powered by React Query.

**Provider Configuration**: `src/lib/trpc/Provider.tsx:15-43`

```typescript
const [queryClient] = useState(() => new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,        // 60 seconds
      refetchOnWindowFocus: false,
    },
  },
}))

const [trpcClient] = useState(() =>
  trpc.createClient({
    links: [
      httpBatchLink({
        url: `${getBaseUrl()}/api/trpc`,
        transformer: superjson,
      }),
    ],
  })
)
```

**Key Configuration**:
- `staleTime: 60000` - Data cached for 60 seconds before refetch
- `refetchOnWindowFocus: false` - No auto-refetch on tab focus
- `httpBatchLink` - Batches multiple queries into single request

#### Typical Page Data Fetching Pattern

**Example**: `src/app/employee/recruiting/jobs/page.tsx:49-61`

```typescript
// Fetch jobs
const jobsQuery = trpc.ats.jobs.list.useQuery({
  search: search || undefined,
  status: statusFilter,
  limit: 50,
  offset: 0,
})

// Fetch stats
const statsQuery = trpc.ats.jobs.getStats.useQuery({})

const jobs = jobsQuery.data?.items || []
```

**Pattern characteristics**:
- Multiple parallel queries per page (jobs + stats)
- Queries reactive to state changes (search, filter)
- No prefetching or server-side data

#### Layout-Level Data Fetching

Detail layouts fetch entity data before rendering children.

**Example**: `src/app/employee/recruiting/jobs/[id]/layout.tsx:13-33`

```typescript
const { data: job, isLoading, error } = trpc.ats.jobs.getById.useQuery(
  { id: jobId },
  { enabled: !!jobId }
)

if (isLoading) {
  return <EntityContentSkeleton />
}

if (error || !job) {
  return <EntityContentError ... />
}

return (
  <EntityContextProvider entityType="job" entityId={jobId} ...>
    {children}
  </EntityContextProvider>
)
```

**This creates a waterfall**:
1. Layout renders
2. Layout fetches entity data
3. Loading skeleton shows
4. Data returns
5. Children render
6. Children fetch their own data
7. More loading states
8. Final render

---

### 3. Database Query Patterns

#### All Queries Go Through Supabase PostgREST

Database is Supabase PostgreSQL, NOT using Drizzle ORM despite having templates.

**Admin Client Pattern**: `src/server/routers/crm.ts:8-14`

```typescript
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
```

- Service role client bypasses RLS
- New client created per-request
- No connection pooling at application level (Supabase handles this)

#### Typical Query Structure

**Example**: `src/server/routers/pods.ts:14-77`

```typescript
let query = supabase
  .from('pods')
  .select(`
    *,
    manager:user_profiles!pods_manager_id_fkey(...),
    members:pod_members(...)
  `, { count: 'exact' })
  .eq('org_id', orgId)
  .is('deleted_at', null)

if (search) query = query.ilike('name', `%${search}%`)
if (podType) query = query.eq('pod_type', podType)

const offset = (page - 1) * pageSize
query = query.range(offset, offset + pageSize - 1)
           .order('created_at', { ascending: false })
```

**Characteristics**:
- Eager loading via nested select syntax
- org_id filtering on every query
- Soft delete filtering (`.is('deleted_at', null)`)
- Range-based pagination

#### Multiple Sequential Queries in Routers

**Example**: `src/server/routers/crm.ts:676-699`

```typescript
// Get lead tasks
const { data: tasks } = await adminClient
  .from('lead_tasks')
  .select('*')
  .eq('lead_id', input.id)
  ...

// Get lead activities
const { data: activities } = await adminClient
  .from('crm_activities')
  .select('*, creator:user_profiles!...')
  ...

return {
  ...data,
  tasks: tasks ?? [],
  activities: activities ?? [],
}
```

Multiple sequential queries per procedure, not parallelized.

---

### 4. Navigation and Route Transitions

#### Client-Side Navigation Only

All navigation uses Next.js `useRouter()` for client-side transitions.

**Link usage**: Standard `<Link href="...">` without prefetch configuration, using Next.js defaults.

#### Entity Navigation Context

**File**: `src/lib/navigation/EntityNavigationContext.tsx:30-136`

Tracks recent entities in localStorage and current entity state:
- Recent entities loaded from localStorage on mount
- Current entity state drives sidebar UI
- No prefetching of entity data

#### No Route Prefetching

No evidence of:
- `prefetch` prop on Links
- Manual `router.prefetch()` calls
- Route-level data prefetching

---

### 5. Loading State Implementation

#### Inline Skeleton Loading

Loading states are implemented inline in components, not via streaming.

**Pattern**: `src/app/employee/recruiting/jobs/page.tsx:156-161`

```typescript
{jobsQuery.isLoading ? (
  <div className="space-y-4">
    {[1, 2, 3, 4, 5].map((i) => (
      <Skeleton key={i} className="h-24 w-full" />
    ))}
  </div>
) : jobs.length === 0 ? (
  // Empty state
) : (
  // Data display
)}
```

#### Entity Layout Skeletons

**File**: `src/components/layouts/EntityContextProvider.tsx:59-70`

```typescript
export function EntityContentSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-64 w-full" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    </div>
  )
}
```

Used by all `[id]/layout.tsx` files during entity fetch.

#### Suspense Usage Limited to Admin

Only admin workflow/SLA pages use Suspense boundaries:
- `src/app/employee/admin/sla/page.tsx:20`
- `src/app/employee/admin/workflows/page.tsx:20`

All other pages use conditional rendering with `isLoading` checks.

---

### 6. No Code Splitting

#### No Dynamic Imports Found

A search for `next/dynamic` returns no results. All components are statically imported.

**Impact**:
- Entire JavaScript bundle loads on first page
- No lazy loading of route-specific code
- Widget registry loads all widgets eagerly

**Evidence**: `src/components/metadata/widgets/register-widgets.ts:357`
- All widgets registered at module load time
- No conditional or lazy registration

---

### 7. Context Provider Nesting

#### Deep Provider Chain

Every page renders through multiple context providers:

```
RootLayout (Server Component)
└── TRPCProvider (Client Component)
    └── EmployeeLayout (Client Component)
        └── EntityNavigationProvider (Context)
            └── ModuleLayout (Client Component)
                └── SidebarLayout (Component)
                    └── CrossPillarLeadProvider (Context) [for CRM]
                        └── DetailLayout (Client Component) [for [id] routes]
                            └── EntityContextProvider (Context)
                                └── Page (Client Component)
```

Each provider may trigger renders and effects on mount.

---

## Code References

### Core Data Fetching Files
- `src/lib/trpc/Provider.tsx:15-43` - QueryClient and tRPC client setup
- `src/lib/trpc/client.ts:1-4` - tRPC React client export
- `src/server/trpc/context.ts:11-41` - Request context with org_id
- `src/server/trpc/middleware.ts:4-35` - Auth and org middleware
- `src/server/trpc/root.ts:25-48` - Router composition

### Page Examples
- `src/app/employee/recruiting/jobs/page.tsx` - Jobs list (client component)
- `src/app/employee/recruiting/jobs/[id]/layout.tsx` - Job detail layout (fetches data)
- `src/app/employee/recruiting/jobs/[id]/page.tsx` - Job detail page
- `src/app/employee/recruiting/accounts/page.tsx` - Accounts list
- `src/app/employee/crm/leads/page.tsx` - Leads list

### Loading Components
- `src/components/ui/skeleton.tsx:5-15` - Base skeleton component
- `src/components/layouts/EntityContextProvider.tsx:59-70` - EntityContentSkeleton
- `src/components/layouts/EntityContextProvider.tsx:73-104` - EntityContentError

### Navigation
- `src/lib/navigation/EntityNavigationContext.tsx:30-136` - Navigation state
- `src/components/navigation/TopNavigation.tsx:229-586` - Top nav component
- `src/components/layouts/SidebarLayout.tsx:31-109` - Layout shell

### Database Routers
- `src/server/routers/crm.ts` - CRM operations (accounts, leads, deals)
- `src/server/routers/ats.ts` - ATS operations (jobs, candidates, submissions)
- `src/server/routers/pods.ts:14-77` - Pods with pagination example
- `src/server/routers/dashboard.ts:63-69` - Aggregation queries

---

## Architecture Documentation

### Current Data Flow

```
1. User navigates to page
   ↓
2. Next.js serves JavaScript bundle (no SSR data)
   ↓
3. React hydrates client components
   ↓
4. Layouts render and start fetching
   ↓
5. EntityContentSkeleton shown during layout fetch
   ↓
6. Layout data returns, children render
   ↓
7. Page components start their fetches
   ↓
8. Page skeletons/spinners shown
   ↓
9. Page data returns, final render
```

### Query Caching

- **staleTime**: 60 seconds (data considered fresh)
- **refetchOnWindowFocus**: disabled
- **HTTP Batching**: Multiple queries batched into single request
- **Cache Invalidation**: Manual via `utils.invalidate()` after mutations

### Multi-Tenancy

Every query includes:
1. `orgProtectedProcedure` middleware check (context.ts:19-32)
2. `.eq('org_id', orgId)` filter in query (every router)
3. Insert/update includes `org_id` field

---

## Related Research

- No prior research documents found on page loading

---

## Open Questions

1. What is the actual JavaScript bundle size for initial page load?
2. Are there specific tRPC procedures that are slow (N+1 queries, missing indexes)?
3. What is the network waterfall timing from browser DevTools?
4. Is Supabase connection pooling properly configured?
5. Are there missing database indexes causing slow queries?
