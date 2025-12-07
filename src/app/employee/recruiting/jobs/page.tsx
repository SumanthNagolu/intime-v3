import { Suspense } from 'react'
import { getServerCaller } from '@/server/trpc/server-caller'
import { JobsListClient, JobsListSkeleton } from '@/components/recruiting/jobs'

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
