import { Suspense } from 'react'
import { getServerCaller } from '@/server/trpc/server-caller'
import { LeadsListClient, LeadsListSkeleton } from '@/components/crm/leads'

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

  // Fetch data in parallel on server
  const [leadsResult, stats] = await Promise.all([
    caller.crm.leads.list({
      search: params.search || undefined,
      status: params.status || 'all',
      source: params.source || undefined,
      limit: 50,
      offset: 0,
      sortBy: 'created_at',
      sortOrder: 'desc',
    }),
    caller.crm.leads.getStats({ period: 'month' }),
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
