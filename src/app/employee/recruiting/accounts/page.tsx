import { Suspense } from 'react'
import { getServerCaller } from '@/server/trpc/server-caller'
import { AccountsListClient, AccountsListSkeleton } from '@/components/recruiting/accounts'

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
      limit: 50,
    }),
    caller.crm.accounts.getHealth({}),
  ])

  // Transform health data to match expected type
  const transformedHealth = healthData ? {
    summary: healthData.summary,
    accounts: healthData.accounts.map(a => ({
      id: a.id,
      healthStatus: a.healthStatus as 'healthy' | 'attention' | 'at_risk',
      healthScore: a.healthScore,
    })),
  } : null

  return (
    <AccountsListClient
      initialAccounts={accountsResult.items}
      initialTotal={accountsResult.total}
      initialHealth={transformedHealth}
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
