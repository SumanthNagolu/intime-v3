# Page Performance Optimization - Sub-500ms Load Times

## Overview

Transform InTime v3 from a client-first rendering architecture to a server-first architecture with streaming, achieving sub-500ms page load times for all pages. This involves implementing server-side tRPC calling, converting pages to React Server Components, eliminating data fetching waterfalls, adding code splitting, and implementing streaming with `loading.tsx` files.

## Current State Analysis

### Architecture Problems Identified

| Problem | Impact | Evidence |
|---------|--------|----------|
| All pages are client components | Full JS bundle must load before any data fetching | 38+ files with `'use client'` at top |
| No server-side data fetching | Data only fetched after React hydration completes | `src/lib/trpc/Provider.tsx` - client-only setup |
| Layout waterfall pattern | Sequential fetches: layout → skeleton → children → more fetches | `src/app/employee/recruiting/jobs/[id]/layout.tsx:13-33` |
| No streaming/loading.tsx | No instant loading feedback during navigation | Zero `loading.tsx` files in `src/app/employee/` |
| No code splitting | Entire widget registry loads eagerly | No `next/dynamic` usage found |
| Unused server infrastructure | `createCallerFactory` exported but never used | `src/server/trpc/init.ts:23` |

### Current Data Flow (Slow)

```
1. User navigates to page
2. Server sends JavaScript bundle (no data)
3. Browser downloads and parses JS (~500ms+)
4. React hydrates client components
5. Layout mounts → starts tRPC query
6. Skeleton shown while layout fetches (~200-500ms)
7. Layout data returns → children render
8. Page components start their tRPC queries
9. More skeletons shown (~200-500ms)
10. Page data returns → final render

Total: 1-3+ seconds before meaningful content
```

### Target Data Flow (Fast)

```
1. User navigates to page
2. Server fetches data via tRPC caller (~50-100ms)
3. Server streams HTML with loading.tsx instantly
4. Browser receives HTML with data embedded
5. React hydrates with data already present
6. Interactive immediately

Total: <500ms to meaningful content
```

## Desired End State

After implementation:

1. **All list pages** render with data on first paint (no client-side loading spinners)
2. **All detail pages** receive entity data from server (no layout waterfalls)
3. **Loading states** appear instantly via streaming (loading.tsx files)
4. **Heavy components** load on-demand via code splitting
5. **Navigation** feels instant with prefetching
6. **E2E tests** verify <500ms load times

### Verification Criteria

```bash
# Performance test passes
pnpm test:e2e:perf

# All pages load in <500ms (measured in E2E tests)
# No client-side loading spinners on initial page load
# Lighthouse Performance score >90
```

## What We're NOT Doing

- Changing the database layer (Supabase stays)
- Modifying tRPC router logic (only how we call them)
- Redesigning UI components
- Adding Redis/external caching (React Query cache is sufficient)
- Changing authentication flow

## Implementation Approach

**Strategy**: Server-first rendering with streaming

1. Create server-side tRPC caller infrastructure
2. Convert pages from client to server components
3. Pass server-fetched data as props to client components
4. Add loading.tsx for streaming
5. Add code splitting for heavy components
6. Add E2E performance tests
7. Iterate until all tests pass

---

## Phase 1: Infrastructure Setup

### Overview

Set up the foundational infrastructure for server-side tRPC calling and establish baseline performance metrics.

### Changes Required

#### 1.1 Create Server-Side tRPC Caller

**File**: `src/server/trpc/server-caller.ts` (NEW)

```typescript
import 'server-only'
import { cache } from 'react'
import { createCallerFactory } from './init'
import { appRouter } from './root'
import { createContext } from './context'

// Create the caller factory once
const createCaller = createCallerFactory(appRouter)

/**
 * Get a server-side tRPC caller with the current request context.
 * Uses React cache() to deduplicate calls within a single request.
 */
export const getServerCaller = cache(async () => {
  const ctx = await createContext()
  return createCaller(ctx)
})

/**
 * Type-safe server caller for use in RSC pages and layouts.
 * Example: const caller = await getServerCaller()
 *          const jobs = await caller.ats.jobs.list({ limit: 50 })
 */
export type ServerCaller = Awaited<ReturnType<typeof getServerCaller>>
```

#### 1.2 Add server-only Package

**File**: `package.json` (ADD dependency)

```bash
pnpm add server-only
```

#### 1.3 Create Performance Test Utilities

**File**: `e2e/utils/performance.ts` (NEW)

```typescript
import { Page, expect } from '@playwright/test'

export interface PerformanceMetrics {
  navigationStart: number
  domContentLoaded: number
  loadComplete: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  timeToInteractive: number
}

/**
 * Measure page load performance metrics
 */
export async function measurePageLoad(page: Page, url: string): Promise<PerformanceMetrics> {
  // Navigate and wait for network idle
  const startTime = Date.now()
  await page.goto(url, { waitUntil: 'networkidle' })

  // Get performance timing from browser
  const metrics = await page.evaluate(() => {
    const perf = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const paint = performance.getEntriesByType('paint')
    const fcp = paint.find(p => p.name === 'first-contentful-paint')

    return {
      navigationStart: perf.startTime,
      domContentLoaded: perf.domContentLoadedEventEnd,
      loadComplete: perf.loadEventEnd,
      firstContentfulPaint: fcp?.startTime ?? 0,
      largestContentfulPaint: 0, // Will be filled by LCP observer
      timeToInteractive: perf.domInteractive,
    }
  })

  return metrics
}

/**
 * Assert page loads within target time
 */
export async function assertFastPageLoad(
  page: Page,
  url: string,
  maxLoadTimeMs: number = 500
): Promise<void> {
  const startTime = Date.now()

  // Navigate to page
  await page.goto(url, { waitUntil: 'domcontentloaded' })

  // Wait for main content to be visible (not skeleton)
  await page.waitForSelector('[data-testid="page-content"]', {
    state: 'visible',
    timeout: maxLoadTimeMs + 1000
  })

  const loadTime = Date.now() - startTime

  // Assert load time is under threshold
  expect(loadTime, `Page ${url} took ${loadTime}ms to load (max: ${maxLoadTimeMs}ms)`).toBeLessThan(maxLoadTimeMs)
}

/**
 * Assert no client-side loading spinners appear on initial load
 */
export async function assertNoLoadingSpinner(page: Page): Promise<void> {
  // Check that skeleton/spinner elements are NOT visible
  const skeletonVisible = await page.locator('[data-testid="loading-skeleton"]').isVisible().catch(() => false)
  const spinnerVisible = await page.locator('.animate-spin').first().isVisible().catch(() => false)

  expect(skeletonVisible, 'Loading skeleton should not be visible on server-rendered page').toBe(false)
  expect(spinnerVisible, 'Loading spinner should not be visible on server-rendered page').toBe(false)
}
```

#### 1.4 Create Base Performance Test

**File**: `e2e/performance/page-load.spec.ts` (NEW)

```typescript
import { test, expect } from '@playwright/test'
import { assertFastPageLoad, assertNoLoadingSpinner, measurePageLoad } from '../utils/performance'

test.describe('Page Load Performance', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth/login')
    await page.fill('[name="email"]', process.env.TEST_USER_EMAIL!)
    await page.fill('[name="password"]', process.env.TEST_USER_PASSWORD!)
    await page.click('button[type="submit"]')
    await page.waitForURL('/employee/**')
  })

  test.describe('List Pages', () => {
    const listPages = [
      { name: 'Jobs', url: '/employee/recruiting/jobs' },
      { name: 'Candidates', url: '/employee/recruiting/candidates' },
      { name: 'Accounts', url: '/employee/recruiting/accounts' },
      { name: 'Leads', url: '/employee/crm/leads' },
      { name: 'Deals', url: '/employee/crm/deals' },
      { name: 'Placements', url: '/employee/recruiting/placements' },
      { name: 'Hotlists', url: '/employee/recruiting/hotlists' },
      { name: 'Vendors', url: '/employee/recruiting/vendors' },
      { name: 'Talent', url: '/employee/recruiting/talent' },
    ]

    for (const { name, url } of listPages) {
      test(`${name} list page loads in <500ms`, async ({ page }) => {
        await assertFastPageLoad(page, url, 500)
      })

      test(`${name} list page has no loading spinner`, async ({ page }) => {
        await page.goto(url, { waitUntil: 'domcontentloaded' })
        await assertNoLoadingSpinner(page)
      })
    }
  })

  test.describe('Detail Pages', () => {
    test('Job detail page loads in <500ms', async ({ page }) => {
      // First get a job ID
      await page.goto('/employee/recruiting/jobs')
      const firstJobLink = page.locator('[data-testid="job-card"]').first()
      await firstJobLink.click()

      // Measure the detail page load
      const url = page.url()
      await assertFastPageLoad(page, url, 500)
    })

    test('Candidate detail page loads in <500ms', async ({ page }) => {
      await page.goto('/employee/recruiting/candidates')
      const firstCandidateLink = page.locator('[data-testid="candidate-row"]').first()
      await firstCandidateLink.click()

      const url = page.url()
      await assertFastPageLoad(page, url, 500)
    })
  })

  test.describe('Dashboard Pages', () => {
    test('Workspace dashboard loads in <500ms', async ({ page }) => {
      await assertFastPageLoad(page, '/employee/workspace/dashboard', 500)
    })

    test('Admin dashboard loads in <500ms', async ({ page }) => {
      await assertFastPageLoad(page, '/employee/admin/dashboard', 500)
    })
  })

  test.describe('Performance Metrics', () => {
    test('Jobs page performance metrics', async ({ page }) => {
      const metrics = await measurePageLoad(page, '/employee/recruiting/jobs')

      console.log('Performance Metrics:', {
        domContentLoaded: `${metrics.domContentLoaded}ms`,
        firstContentfulPaint: `${metrics.firstContentfulPaint}ms`,
        loadComplete: `${metrics.loadComplete}ms`,
      })

      expect(metrics.firstContentfulPaint).toBeLessThan(500)
      expect(metrics.domContentLoaded).toBeLessThan(800)
    })
  })
})
```

#### 1.5 Update Playwright Config for Performance Tests

**File**: `playwright.config.ts` (MODIFY)

Add performance test project:

```typescript
// Add to projects array
{
  name: 'performance',
  testDir: './e2e/performance',
  use: {
    ...devices['Desktop Chrome'],
    // Disable cache to measure real performance
    bypassCSP: true,
  },
  // Run performance tests serially to avoid interference
  fullyParallel: false,
},
```

#### 1.6 Add Test Data IDs to Components

**File**: `src/components/ui/skeleton.tsx` (MODIFY)

```typescript
// Add data-testid to skeleton for testing
const Skeleton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-testid="loading-skeleton"
      className={cn('animate-pulse rounded-md bg-charcoal-100', className)}
      {...props}
    />
  )
)
```

### Success Criteria

#### Automated Verification:
- [ ] `pnpm build` completes without errors
- [ ] `pnpm lint` passes
- [ ] Server caller can be imported: `import { getServerCaller } from '@/server/trpc/server-caller'`
- [ ] Performance test file runs: `pnpm exec playwright test e2e/performance --project=performance`

#### Manual Verification:
- [ ] Verify server-caller.ts is properly isolated with 'server-only'
- [ ] Baseline performance metrics recorded for comparison

**Implementation Note**: After completing this phase, run the performance tests to establish baseline metrics. These will initially fail (expected) - they serve as our target.

---

## Phase 2: List Page Conversions - Recruiting Module

### Overview

Convert the high-traffic recruiting list pages from client components to server components with server-side data fetching.

### Changes Required

#### 2.1 Jobs List Page - Server Component

**File**: `src/app/employee/recruiting/jobs/page.tsx` (REWRITE)

```typescript
import { Suspense } from 'react'
import { getServerCaller } from '@/server/trpc/server-caller'
import { JobsListClient } from '@/components/recruiting/jobs/JobsListClient'
import { JobsListSkeleton } from '@/components/recruiting/jobs/JobsListSkeleton'

export const dynamic = 'force-dynamic'

interface JobsPageProps {
  searchParams: Promise<{
    search?: string
    status?: string
  }>
}

async function JobsListServer({ searchParams }: { searchParams: JobsPageProps['searchParams'] }) {
  const params = await searchParams
  const caller = await getServerCaller()

  // Fetch data in parallel on server
  const [jobsResult, stats] = await Promise.all([
    caller.ats.jobs.list({
      search: params.search || undefined,
      status: (params.status as 'all' | 'draft' | 'open' | 'active' | 'on_hold' | 'filled' | 'cancelled') || 'all',
      limit: 50,
      offset: 0,
    }),
    caller.ats.jobs.getStats({}),
  ])

  return (
    <JobsListClient
      initialJobs={jobsResult.items}
      initialTotal={jobsResult.total}
      initialStats={stats}
      initialSearch={params.search || ''}
      initialStatus={params.status || 'all'}
    />
  )
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  return (
    <Suspense fallback={<JobsListSkeleton />}>
      <JobsListServer searchParams={searchParams} />
    </Suspense>
  )
}
```

#### 2.2 Jobs List Client Component

**File**: `src/components/recruiting/jobs/JobsListClient.tsx` (NEW)

```typescript
'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CreateJobDialog } from '@/components/recruiting/jobs'
import {
  Plus,
  Search,
  Briefcase,
  MapPin,
  DollarSign,
  Users,
  Building2,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

type JobStatus = 'draft' | 'open' | 'active' | 'on_hold' | 'filled' | 'cancelled' | 'all'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-charcoal-200 text-charcoal-700' },
  open: { label: 'Open', color: 'bg-blue-100 text-blue-800' },
  active: { label: 'Active', color: 'bg-green-100 text-green-800' },
  on_hold: { label: 'On Hold', color: 'bg-amber-100 text-amber-800' },
  filled: { label: 'Filled', color: 'bg-purple-100 text-purple-800' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
}

interface Job {
  id: string
  title: string
  status: string
  location: string | null
  billingRate: number | null
  submissionCount: number
  createdAt: string
  jobType: string | null
  account: { name: string } | null
}

interface JobsListClientProps {
  initialJobs: Job[]
  initialTotal: number
  initialStats: {
    total: number
    active: number
    onHold: number
    filled: number
    urgentJobs: number
  } | null
  initialSearch: string
  initialStatus: string
}

export function JobsListClient({
  initialJobs,
  initialTotal,
  initialStats,
  initialSearch,
  initialStatus,
}: JobsListClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [search, setSearch] = useState(initialSearch)
  const [statusFilter, setStatusFilter] = useState<JobStatus>(initialStatus as JobStatus)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Use server data as initial, allow client refetch for mutations
  const jobsQuery = trpc.ats.jobs.list.useQuery(
    {
      search: search || undefined,
      status: statusFilter,
      limit: 50,
      offset: 0,
    },
    {
      initialData: { items: initialJobs, total: initialTotal },
      // Only refetch when filters change from initial
      enabled: search !== initialSearch || statusFilter !== initialStatus,
    }
  )

  const statsQuery = trpc.ats.jobs.getStats.useQuery(
    {},
    {
      initialData: initialStats,
      staleTime: 60 * 1000,
    }
  )

  const jobs = jobsQuery.data?.items || initialJobs
  const stats = statsQuery.data || initialStats

  const handleJobClick = (jobId: string) => {
    router.push(`/employee/recruiting/jobs/${jobId}`)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    // Update URL for server-side filtering on refresh
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set('search', value)
      } else {
        params.delete('search')
      }
      router.replace(`?${params.toString()}`)
    })
  }

  const handleStatusChange = (value: JobStatus) => {
    setStatusFilter(value)
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value !== 'all') {
        params.set('status', value)
      } else {
        params.delete('status')
      }
      router.replace(`?${params.toString()}`)
    })
  }

  return (
    <div className="min-h-screen bg-cream" data-testid="page-content">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-charcoal-900">Jobs</h1>
            <p className="text-charcoal-500 mt-1">
              Manage your job requisitions and pipelines
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Job
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-white">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-charcoal-900">
                {stats?.total ?? '-'}
              </div>
              <p className="text-sm text-charcoal-500">Total Jobs</p>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                {stats?.active ?? '-'}
              </div>
              <p className="text-sm text-charcoal-500">Active</p>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-amber-600">
                {stats?.onHold ?? '-'}
              </div>
              <p className="text-sm text-charcoal-500">On Hold</p>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-600">
                {stats?.filled ?? '-'}
              </div>
              <p className="text-sm text-charcoal-500">Filled</p>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">
                {stats?.urgentJobs ?? '-'}
              </div>
              <p className="text-sm text-charcoal-500">Urgent</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
            <Input
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
              <SelectItem value="filled">Filled</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <Card className="bg-white">
            <CardContent className="py-12 text-center">
              <Briefcase className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
              <h3 className="text-lg font-medium text-charcoal-900 mb-2">No jobs found</h3>
              <p className="text-charcoal-500 mb-4">
                {search || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first job to get started'}
              </p>
              {!search && statusFilter === 'all' && (
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Job
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => {
              const statusConfig = STATUS_CONFIG[job.status] || STATUS_CONFIG.draft

              return (
                <Card
                  key={job.id}
                  className="bg-white cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleJobClick(job.id)}
                  data-testid="job-card"
                >
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-charcoal-900 truncate">
                            {job.title}
                          </h3>
                          <Badge className={cn('text-xs', statusConfig.color)}>
                            {statusConfig.label}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-charcoal-500">
                          {job.account && (
                            <span className="flex items-center gap-1">
                              <Building2 className="w-4 h-4" />
                              {job.account.name}
                            </span>
                          )}
                          {job.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {job.location}
                            </span>
                          )}
                          {job.billingRate && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              ${job.billingRate}/hr
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {job.submissionCount} candidates
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>

                      <div className="ml-4 text-right">
                        <div className="text-sm font-medium text-charcoal-700">
                          {job.jobType?.replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Results count */}
        <p className="text-sm text-charcoal-500 mt-4">
          Showing {jobs.length} of {jobsQuery.data?.total ?? initialTotal} jobs
        </p>
      </div>

      {/* Create Job Dialog */}
      <CreateJobDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </div>
  )
}
```

#### 2.3 Jobs List Skeleton

**File**: `src/components/recruiting/jobs/JobsListSkeleton.tsx` (NEW)

```typescript
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function JobsListSkeleton() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="container mx-auto px-6 py-8">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Skeleton className="h-9 w-32 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-10 w-28" />
        </div>

        {/* Stats Cards skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="bg-white">
              <CardContent className="pt-6">
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters skeleton */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-[180px]" />
        </div>

        {/* Jobs list skeleton */}
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}
```

#### 2.4 Jobs Loading State

**File**: `src/app/employee/recruiting/jobs/loading.tsx` (NEW)

```typescript
import { JobsListSkeleton } from '@/components/recruiting/jobs/JobsListSkeleton'

export default function JobsLoading() {
  return <JobsListSkeleton />
}
```

#### 2.5 Update Jobs Component Exports

**File**: `src/components/recruiting/jobs/index.ts` (MODIFY)

Add exports:

```typescript
export { JobsListClient } from './JobsListClient'
export { JobsListSkeleton } from './JobsListSkeleton'
```

#### 2.6 Candidates List Page - Server Component

**File**: `src/app/employee/recruiting/candidates/page.tsx` (REWRITE)

```typescript
import { Suspense } from 'react'
import { getServerCaller } from '@/server/trpc/server-caller'
import { CandidatesListClient } from '@/components/recruiting/candidates/CandidatesListClient'
import { CandidatesListSkeleton } from '@/components/recruiting/candidates/CandidatesListSkeleton'

export const dynamic = 'force-dynamic'

interface CandidatesPageProps {
  searchParams: Promise<{
    search?: string
    status?: string
    source?: string
  }>
}

async function CandidatesListServer({ searchParams }: { searchParams: CandidatesPageProps['searchParams'] }) {
  const params = await searchParams
  const caller = await getServerCaller()

  // Fetch data in parallel on server
  const [candidatesResult, sourcingStats, savedSearches] = await Promise.all([
    caller.ats.candidates.advancedSearch({
      query: params.search || undefined,
      status: params.status ? [params.status] : undefined,
      source: params.source ? [params.source] : undefined,
      limit: 50,
      offset: 0,
    }),
    caller.ats.candidates.getSourcingStats(),
    caller.ats.candidates.getSavedSearches(),
  ])

  return (
    <CandidatesListClient
      initialCandidates={candidatesResult.items}
      initialTotal={candidatesResult.total}
      initialStats={sourcingStats}
      initialSavedSearches={savedSearches}
      initialSearch={params.search || ''}
      initialStatus={params.status || ''}
      initialSource={params.source || ''}
    />
  )
}

export default async function CandidatesPage({ searchParams }: CandidatesPageProps) {
  return (
    <Suspense fallback={<CandidatesListSkeleton />}>
      <CandidatesListServer searchParams={searchParams} />
    </Suspense>
  )
}
```

#### 2.7 Candidates Loading State

**File**: `src/app/employee/recruiting/candidates/loading.tsx` (NEW)

```typescript
import { CandidatesListSkeleton } from '@/components/recruiting/candidates/CandidatesListSkeleton'

export default function CandidatesLoading() {
  return <CandidatesListSkeleton />
}
```

#### 2.8 Accounts List Page - Server Component

**File**: `src/app/employee/recruiting/accounts/page.tsx` (REWRITE)

```typescript
import { Suspense } from 'react'
import { getServerCaller } from '@/server/trpc/server-caller'
import { AccountsListClient } from '@/components/recruiting/accounts/AccountsListClient'
import { AccountsListSkeleton } from '@/components/recruiting/accounts/AccountsListSkeleton'

export const dynamic = 'force-dynamic'

interface AccountsPageProps {
  searchParams: Promise<{
    search?: string
    industry?: string
    health?: string
  }>
}

async function AccountsListServer({ searchParams }: { searchParams: AccountsPageProps['searchParams'] }) {
  const params = await searchParams
  const caller = await getServerCaller()

  // Fetch data in parallel on server
  const [accountsResult, healthData] = await Promise.all([
    caller.crm.accounts.list({
      search: params.search || undefined,
      industry: params.industry || undefined,
      limit: 50,
      offset: 0,
    }),
    caller.crm.accounts.getHealth(),
  ])

  return (
    <AccountsListClient
      initialAccounts={accountsResult.items}
      initialTotal={accountsResult.total}
      initialHealth={healthData}
      initialSearch={params.search || ''}
      initialIndustry={params.industry || ''}
    />
  )
}

export default async function AccountsPage({ searchParams }: AccountsPageProps) {
  return (
    <Suspense fallback={<AccountsListSkeleton />}>
      <AccountsListServer searchParams={searchParams} />
    </Suspense>
  )
}
```

#### 2.9 Accounts Loading State

**File**: `src/app/employee/recruiting/accounts/loading.tsx` (NEW)

```typescript
import { AccountsListSkeleton } from '@/components/recruiting/accounts/AccountsListSkeleton'

export default function AccountsLoading() {
  return <AccountsListSkeleton />
}
```

### Success Criteria

#### Automated Verification:
- [ ] `pnpm build` completes without errors
- [ ] `pnpm lint` passes
- [ ] `pnpm exec playwright test e2e/performance --grep "Jobs list"` passes
- [ ] `pnpm exec playwright test e2e/performance --grep "Candidates list"` passes
- [ ] `pnpm exec playwright test e2e/performance --grep "Accounts list"` passes

#### Manual Verification:
- [ ] Jobs page loads with data visible immediately (no spinner)
- [ ] Candidates page loads with data visible immediately
- [ ] Accounts page loads with data visible immediately
- [ ] Filters work correctly and update URL
- [ ] Browser back/forward works with filter state
- [ ] Create dialogs still function correctly

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation that pages load without spinners before proceeding to Phase 3.

---

## Phase 3: List Page Conversions - CRM Module

### Overview

Convert CRM list pages (leads, deals) to server components with server-side data fetching.

### Changes Required

#### 3.1 Leads List Page - Server Component

**File**: `src/app/employee/crm/leads/page.tsx` (REWRITE)

```typescript
import { Suspense } from 'react'
import { getServerCaller } from '@/server/trpc/server-caller'
import { LeadsListClient } from '@/components/crm/leads/LeadsListClient'
import { LeadsListSkeleton } from '@/components/crm/leads/LeadsListSkeleton'

export const dynamic = 'force-dynamic'

interface LeadsPageProps {
  searchParams: Promise<{
    search?: string
    status?: string
    source?: string
  }>
}

async function LeadsListServer({ searchParams }: { searchParams: LeadsPageProps['searchParams'] }) {
  const params = await searchParams
  const caller = await getServerCaller()

  const [leadsResult, stats] = await Promise.all([
    caller.crm.leads.list({
      search: params.search || undefined,
      status: params.status || undefined,
      source: params.source || undefined,
      limit: 50,
      offset: 0,
    }),
    caller.crm.leads.getStats(),
  ])

  return (
    <LeadsListClient
      initialLeads={leadsResult.items}
      initialTotal={leadsResult.total}
      initialStats={stats}
      initialSearch={params.search || ''}
      initialStatus={params.status || ''}
      initialSource={params.source || ''}
    />
  )
}

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  return (
    <Suspense fallback={<LeadsListSkeleton />}>
      <LeadsListServer searchParams={searchParams} />
    </Suspense>
  )
}
```

#### 3.2 Leads Loading State

**File**: `src/app/employee/crm/leads/loading.tsx` (NEW)

```typescript
import { LeadsListSkeleton } from '@/components/crm/leads/LeadsListSkeleton'

export default function LeadsLoading() {
  return <LeadsListSkeleton />
}
```

#### 3.3 Deals Pipeline Page - Server Component

**File**: `src/app/employee/crm/deals/page.tsx` (REWRITE)

```typescript
import { Suspense } from 'react'
import { getServerCaller } from '@/server/trpc/server-caller'
import { DealsPipelineClient } from '@/components/crm/deals/DealsPipelineClient'
import { DealsPipelineSkeleton } from '@/components/crm/deals/DealsPipelineSkeleton'

export const dynamic = 'force-dynamic'

async function DealsPipelineServer() {
  const caller = await getServerCaller()

  const pipelineData = await caller.crm.deals.pipeline({})

  return <DealsPipelineClient initialPipeline={pipelineData} />
}

export default async function DealsPage() {
  return (
    <Suspense fallback={<DealsPipelineSkeleton />}>
      <DealsPipelineServer />
    </Suspense>
  )
}
```

#### 3.4 Deals Loading State

**File**: `src/app/employee/crm/deals/loading.tsx` (NEW)

```typescript
import { DealsPipelineSkeleton } from '@/components/crm/deals/DealsPipelineSkeleton'

export default function DealsLoading() {
  return <DealsPipelineSkeleton />
}
```

### Success Criteria

#### Automated Verification:
- [ ] `pnpm build` completes without errors
- [ ] `pnpm lint` passes
- [ ] `pnpm exec playwright test e2e/performance --grep "Leads"` passes
- [ ] `pnpm exec playwright test e2e/performance --grep "Deals"` passes

#### Manual Verification:
- [ ] Leads page loads with data visible immediately
- [ ] Deals pipeline loads with stages visible immediately
- [ ] Drag-and-drop still works on deals pipeline
- [ ] Lead conversion flow still works

**Implementation Note**: After completing this phase, pause for manual verification of CRM pages.

---

## Phase 4: Detail Page Optimization

### Overview

Eliminate the layout waterfall pattern by converting entity detail layouts to server components that fetch data and pass it to children.

### Changes Required

#### 4.1 Job Detail Layout - Server Component

**File**: `src/app/employee/recruiting/jobs/[id]/layout.tsx` (REWRITE)

```typescript
import { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { getServerCaller } from '@/server/trpc/server-caller'
import { EntityContextProvider } from '@/components/layouts/EntityContextProvider'

export const dynamic = 'force-dynamic'

interface JobLayoutProps {
  children: ReactNode
  params: Promise<{ id: string }>
}

export default async function JobDetailLayout({ children, params }: JobLayoutProps) {
  const { id: jobId } = await params
  const caller = await getServerCaller()

  // Fetch job data on server
  const job = await caller.ats.jobs.getById({ id: jobId }).catch(() => null)

  if (!job) {
    notFound()
  }

  const accountName = job.account
    ? (job.account as { name: string }).name
    : undefined

  return (
    <EntityContextProvider
      entityType="job"
      entityId={jobId}
      entityName={job.title}
      entitySubtitle={accountName}
      entityStatus={job.status}
      initialData={job}
    >
      {children}
    </EntityContextProvider>
  )
}
```

#### 4.2 Job Detail Loading State

**File**: `src/app/employee/recruiting/jobs/[id]/loading.tsx` (NEW)

```typescript
import { EntityContentSkeleton } from '@/components/layouts/EntityContextProvider'

export default function JobDetailLoading() {
  return <EntityContentSkeleton />
}
```

#### 4.3 Candidate Detail Layout - Server Component

**File**: `src/app/employee/recruiting/candidates/[id]/layout.tsx` (REWRITE)

```typescript
import { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { getServerCaller } from '@/server/trpc/server-caller'
import { EntityContextProvider } from '@/components/layouts/EntityContextProvider'

export const dynamic = 'force-dynamic'

interface CandidateLayoutProps {
  children: ReactNode
  params: Promise<{ id: string }>
}

export default async function CandidateDetailLayout({ children, params }: CandidateLayoutProps) {
  const { id: candidateId } = await params
  const caller = await getServerCaller()

  const candidate = await caller.ats.candidates.getById({ id: candidateId }).catch(() => null)

  if (!candidate) {
    notFound()
  }

  return (
    <EntityContextProvider
      entityType="candidate"
      entityId={candidateId}
      entityName={`${candidate.firstName} ${candidate.lastName}`}
      entitySubtitle={candidate.currentTitle || undefined}
      entityStatus={candidate.status}
      initialData={candidate}
    >
      {children}
    </EntityContextProvider>
  )
}
```

#### 4.4 Candidate Detail Loading State

**File**: `src/app/employee/recruiting/candidates/[id]/loading.tsx` (NEW)

```typescript
import { EntityContentSkeleton } from '@/components/layouts/EntityContextProvider'

export default function CandidateDetailLoading() {
  return <EntityContentSkeleton />
}
```

#### 4.5 Account Detail Layout - Server Component

**File**: `src/app/employee/recruiting/accounts/[id]/layout.tsx` (REWRITE)

```typescript
import { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { getServerCaller } from '@/server/trpc/server-caller'
import { EntityContextProvider } from '@/components/layouts/EntityContextProvider'

export const dynamic = 'force-dynamic'

interface AccountLayoutProps {
  children: ReactNode
  params: Promise<{ id: string }>
}

export default async function AccountDetailLayout({ children, params }: AccountLayoutProps) {
  const { id: accountId } = await params
  const caller = await getServerCaller()

  const account = await caller.crm.accounts.getById({ id: accountId }).catch(() => null)

  if (!account) {
    notFound()
  }

  return (
    <EntityContextProvider
      entityType="account"
      entityId={accountId}
      entityName={account.name}
      entitySubtitle={account.industry || undefined}
      entityStatus={account.status}
      initialData={account}
    >
      {children}
    </EntityContextProvider>
  )
}
```

#### 4.6 Account Detail Loading State

**File**: `src/app/employee/recruiting/accounts/[id]/loading.tsx` (NEW)

```typescript
import { EntityContentSkeleton } from '@/components/layouts/EntityContextProvider'

export default function AccountDetailLoading() {
  return <EntityContentSkeleton />
}
```

#### 4.7 Lead Detail Layout - Server Component

**File**: `src/app/employee/crm/leads/[id]/layout.tsx` (REWRITE)

```typescript
import { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { getServerCaller } from '@/server/trpc/server-caller'
import { EntityContextProvider } from '@/components/layouts/EntityContextProvider'

export const dynamic = 'force-dynamic'

interface LeadLayoutProps {
  children: ReactNode
  params: Promise<{ id: string }>
}

export default async function LeadDetailLayout({ children, params }: LeadLayoutProps) {
  const { id: leadId } = await params
  const caller = await getServerCaller()

  const lead = await caller.crm.leads.getById({ id: leadId }).catch(() => null)

  if (!lead) {
    notFound()
  }

  return (
    <EntityContextProvider
      entityType="lead"
      entityId={leadId}
      entityName={lead.companyName || `${lead.firstName} ${lead.lastName}`}
      entitySubtitle={lead.title || undefined}
      entityStatus={lead.status}
      initialData={lead}
    >
      {children}
    </EntityContextProvider>
  )
}
```

#### 4.8 Lead Detail Loading State

**File**: `src/app/employee/crm/leads/[id]/loading.tsx` (NEW)

```typescript
import { EntityContentSkeleton } from '@/components/layouts/EntityContextProvider'

export default function LeadDetailLoading() {
  return <EntityContentSkeleton />
}
```

#### 4.9 Deal Detail Layout - Server Component

**File**: `src/app/employee/crm/deals/[id]/layout.tsx` (REWRITE)

```typescript
import { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { getServerCaller } from '@/server/trpc/server-caller'
import { EntityContextProvider } from '@/components/layouts/EntityContextProvider'

export const dynamic = 'force-dynamic'

interface DealLayoutProps {
  children: ReactNode
  params: Promise<{ id: string }>
}

export default async function DealDetailLayout({ children, params }: DealLayoutProps) {
  const { id: dealId } = await params
  const caller = await getServerCaller()

  const deal = await caller.crm.deals.getById({ id: dealId }).catch(() => null)

  if (!deal) {
    notFound()
  }

  return (
    <EntityContextProvider
      entityType="deal"
      entityId={dealId}
      entityName={deal.title}
      entitySubtitle={deal.account?.name || undefined}
      entityStatus={deal.stage}
      initialData={deal}
    >
      {children}
    </EntityContextProvider>
  )
}
```

#### 4.10 Deal Detail Loading State

**File**: `src/app/employee/crm/deals/[id]/loading.tsx` (NEW)

```typescript
import { EntityContentSkeleton } from '@/components/layouts/EntityContextProvider'

export default function DealDetailLoading() {
  return <EntityContentSkeleton />
}
```

#### 4.11 Update EntityContextProvider for Server Data

**File**: `src/components/layouts/EntityContextProvider.tsx` (MODIFY)

Add `initialData` prop support:

```typescript
// Add to EntityContextProvider props interface
interface EntityContextProviderProps {
  entityType: string
  entityId: string
  entityName: string
  entitySubtitle?: string
  entityStatus?: string
  initialData?: unknown // Server-fetched data to pass through context
  children: ReactNode
}

// Update context to include initialData
interface EntityContextValue {
  entityType: string
  entityId: string
  entityName: string
  entitySubtitle?: string
  entityStatus?: string
  initialData?: unknown
}
```

### Success Criteria

#### Automated Verification:
- [ ] `pnpm build` completes without errors
- [ ] `pnpm lint` passes
- [ ] `pnpm exec playwright test e2e/performance --grep "detail"` passes
- [ ] 404 pages show correctly for invalid IDs

#### Manual Verification:
- [ ] Job detail page loads with data immediately (no skeleton flash)
- [ ] Candidate detail page loads with data immediately
- [ ] Account detail page loads with data immediately
- [ ] Lead detail page loads with data immediately
- [ ] Deal detail page loads with data immediately
- [ ] Navigation context (breadcrumbs, entity name) shows immediately

**Implementation Note**: After completing this phase, verify that detail pages no longer show the waterfall loading pattern.

---

## Phase 5: Remaining List Pages

### Overview

Convert remaining list pages (placements, hotlists, vendors, talent, etc.) to server components.

### Changes Required

#### 5.1 Placements List Page

**File**: `src/app/employee/recruiting/placements/page.tsx` (REWRITE)

Similar pattern to jobs - server component with Suspense and server-side data fetching.

#### 5.2 Placements Loading State

**File**: `src/app/employee/recruiting/placements/loading.tsx` (NEW)

#### 5.3 Hotlists List Page

**File**: `src/app/employee/recruiting/hotlists/page.tsx` (REWRITE)

#### 5.4 Hotlists Loading State

**File**: `src/app/employee/recruiting/hotlists/loading.tsx` (NEW)

#### 5.5 Vendors List Page

**File**: `src/app/employee/recruiting/vendors/page.tsx` (REWRITE)

#### 5.6 Vendors Loading State

**File**: `src/app/employee/recruiting/vendors/loading.tsx` (NEW)

#### 5.7 Talent List Page

**File**: `src/app/employee/recruiting/talent/page.tsx` (REWRITE)

#### 5.8 Talent Loading State

**File**: `src/app/employee/recruiting/talent/loading.tsx` (NEW)

#### 5.9 Job Orders List Page

**File**: `src/app/employee/recruiting/job-orders/page.tsx` (REWRITE)

#### 5.10 Job Orders Loading State

**File**: `src/app/employee/recruiting/job-orders/loading.tsx` (NEW)

### Success Criteria

#### Automated Verification:
- [ ] `pnpm build` completes without errors
- [ ] `pnpm exec playwright test e2e/performance` - all list page tests pass

#### Manual Verification:
- [ ] All remaining list pages load with data immediately

---

## Phase 6: Dashboard Pages

### Overview

Optimize dashboard pages with server-side data fetching.

### Changes Required

#### 6.1 Workspace Dashboard

**File**: `src/app/employee/workspace/dashboard/page.tsx` (REWRITE)

```typescript
import { Suspense } from 'react'
import { getServerCaller } from '@/server/trpc/server-caller'
import { RecruiterDashboardClient } from '@/components/dashboard/RecruiterDashboardClient'
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton'

export const dynamic = 'force-dynamic'

async function DashboardServer() {
  const caller = await getServerCaller()

  // Fetch all dashboard data in parallel
  const [metrics, activities, upcomingTasks] = await Promise.all([
    caller.dashboard.getRecruiterMetrics({ period: 'mtd' }),
    caller.activities.getRecent({ limit: 10 }),
    caller.dashboard.getUpcomingTasks({ limit: 5 }),
  ])

  return (
    <RecruiterDashboardClient
      initialMetrics={metrics}
      initialActivities={activities}
      initialTasks={upcomingTasks}
    />
  )
}

export default async function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardServer />
    </Suspense>
  )
}
```

#### 6.2 Dashboard Loading State

**File**: `src/app/employee/workspace/dashboard/loading.tsx` (NEW)

#### 6.3 Admin Dashboard

**File**: `src/app/employee/admin/dashboard/page.tsx` (REWRITE)

Similar pattern with admin-specific metrics.

#### 6.4 Admin Dashboard Loading State

**File**: `src/app/employee/admin/dashboard/loading.tsx` (NEW)

### Success Criteria

#### Automated Verification:
- [ ] `pnpm build` completes without errors
- [ ] `pnpm exec playwright test e2e/performance --grep "dashboard"` passes

#### Manual Verification:
- [ ] Dashboard metrics visible on initial load
- [ ] Activity feed visible on initial load
- [ ] No loading spinners on dashboard

---

## Phase 7: Code Splitting

### Overview

Add dynamic imports for heavy components to reduce initial bundle size.

### Changes Required

#### 7.1 Dynamic Import for Create Dialogs

**File**: `src/components/recruiting/jobs/JobsListClient.tsx` (MODIFY)

```typescript
import dynamic from 'next/dynamic'

// Lazy load the create dialog - not needed on initial render
const CreateJobDialog = dynamic(
  () => import('./CreateJobDialog').then(mod => ({ default: mod.CreateJobDialog })),
  { ssr: false }
)
```

#### 7.2 Dynamic Import for Rich Text Editors

**File**: `src/components/ui/rich-text-editor.tsx` (MODIFY - if exists)

```typescript
import dynamic from 'next/dynamic'

export const RichTextEditor = dynamic(
  () => import('./RichTextEditorImpl'),
  {
    ssr: false,
    loading: () => <Skeleton className="h-32 w-full" />
  }
)
```

#### 7.3 Dynamic Import for Charts

Any chart components should be dynamically imported.

#### 7.4 Dynamic Import for Large Form Components

Complex forms with many fields should be dynamically imported.

### Success Criteria

#### Automated Verification:
- [ ] `pnpm build` completes without errors
- [ ] Bundle size reduced (check `.next/analyze` if configured)

#### Manual Verification:
- [ ] Dialogs still open correctly
- [ ] No visible delay when opening dialogs
- [ ] Charts render correctly when scrolled into view

---

## Phase 8: Navigation Prefetching

### Overview

Add route prefetching for faster perceived navigation.

### Changes Required

#### 8.1 Prefetch on Hover for List Items

**File**: `src/components/recruiting/jobs/JobsListClient.tsx` (MODIFY)

```typescript
import Link from 'next/link'

// Replace onClick navigation with Link + prefetch
<Link
  href={`/employee/recruiting/jobs/${job.id}`}
  prefetch={true}
>
  <Card className="bg-white cursor-pointer hover:shadow-md transition-shadow">
    ...
  </Card>
</Link>
```

#### 8.2 Prefetch Sidebar Navigation Links

**File**: `src/components/navigation/Sidebar.tsx` (MODIFY if needed)

Ensure all navigation links use `<Link prefetch={true}>`.

### Success Criteria

#### Automated Verification:
- [ ] `pnpm build` completes without errors

#### Manual Verification:
- [ ] Hovering over items triggers prefetch (check Network tab)
- [ ] Navigation between pages feels instant

---

## Phase 9: Final Verification & Polish

### Overview

Run comprehensive performance tests, fix any remaining issues, and document results.

### Changes Required

#### 9.1 Run Full Performance Test Suite

```bash
pnpm exec playwright test e2e/performance --project=performance
```

#### 9.2 Fix Any Failing Tests

Address any pages that don't meet the <500ms threshold.

#### 9.3 Add Performance Monitoring

**File**: `src/lib/performance/monitor.ts` (NEW - optional)

```typescript
// Optional: Add real user monitoring
export function reportWebVitals(metric: {
  id: string
  name: string
  value: number
}) {
  // Send to analytics
  console.log(`[Performance] ${metric.name}: ${metric.value}ms`)
}
```

#### 9.4 Update Documentation

Add performance optimization notes to CLAUDE.md.

### Success Criteria

#### Automated Verification:
- [ ] ALL E2E performance tests pass
- [ ] `pnpm build` completes without errors
- [ ] `pnpm lint` passes
- [ ] No TypeScript errors

#### Manual Verification:
- [ ] All list pages load in <500ms
- [ ] All detail pages load in <500ms
- [ ] All dashboard pages load in <500ms
- [ ] No visible loading spinners on initial page load
- [ ] Browser back/forward works correctly
- [ ] All existing functionality still works

---

## Testing Strategy

### Unit Tests

- Server caller returns correct data types
- Context providers accept initialData
- Client components handle both initial and fetched data

### Integration Tests

- tRPC procedures work with server caller
- Data flows correctly from server to client
- Error boundaries catch and display errors

### E2E Performance Tests

Located in `e2e/performance/`:

1. **page-load.spec.ts** - Tests all pages load in <500ms
2. **no-spinner.spec.ts** - Verifies no loading spinners on initial load
3. **navigation.spec.ts** - Tests navigation feels instant
4. **metrics.spec.ts** - Measures and logs Core Web Vitals

### Manual Testing Steps

1. Clear browser cache and hard refresh each page
2. Use DevTools Network tab to verify no waterfall
3. Use DevTools Performance tab to measure FCP/LCP
4. Test on throttled connection (3G) to verify streaming works
5. Test navigation between pages
6. Verify all CRUD operations still work

---

## Performance Considerations

### Server-Side Fetch Benefits

- Data included in initial HTML response
- No client-side loading spinners needed
- Better SEO (data visible to crawlers)
- Reduced Time to First Byte with streaming

### Streaming Benefits

- Instant loading feedback via loading.tsx
- Progressive rendering as data arrives
- Better perceived performance

### Code Splitting Benefits

- Smaller initial bundle
- Faster Time to Interactive
- On-demand loading of heavy components

### Prefetching Benefits

- Navigation feels instant
- Data ready before user clicks
- Better user experience

---

## Migration Notes

### Breaking Changes

- Pages now require `searchParams` to be a Promise (Next.js 15 pattern)
- Layout components now async server components
- EntityContextProvider requires `initialData` prop

### Backward Compatibility

- Client components still use tRPC hooks for mutations
- React Query cache still works for client-side refetching
- Existing UI components unchanged

### Rollback Plan

If issues arise, individual pages can be reverted to client components by:
1. Adding `'use client'` back to page
2. Removing server data fetching
3. Re-enabling client-side queries

---

## References

- Research document: `thoughts/shared/research/2025-12-07-page-loading-architecture.md`
- tRPC server caller setup: `src/server/trpc/init.ts:23`
- Existing Suspense pattern: `src/app/employee/admin/workflows/page.tsx`
- EntityContextProvider: `src/components/layouts/EntityContextProvider.tsx`
