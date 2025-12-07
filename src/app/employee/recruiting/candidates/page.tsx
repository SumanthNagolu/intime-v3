import { Suspense } from 'react'
import { getServerCaller } from '@/server/trpc/server-caller'
import { CandidatesListClient, CandidatesListSkeleton } from '@/components/recruiting/candidates'

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
