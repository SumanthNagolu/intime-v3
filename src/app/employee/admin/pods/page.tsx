export const dynamic = 'force-dynamic'

import { getServerCaller } from '@/server/trpc/server-caller'
import { PodsListClient } from '@/components/admin/pods/PodsListClient'

interface PodsPageProps {
  searchParams: Promise<{
    search?: string
    podType?: string
    status?: string
    page?: string
  }>
}

export default async function PodsPage({ searchParams }: PodsPageProps) {
  const params = await searchParams
  const filters = {
    search: params.search,
    podType: params.podType,
    status: params.status || 'active',
    page: params.page ? parseInt(params.page) : 1,
  }

  // ONE database call - includes pods + stats
  const caller = await getServerCaller()
  const data = await caller.pods.listWithStats({
    search: filters.search,
    podType: filters.podType && filters.podType !== 'all' ? filters.podType as 'recruiting' | 'bench_sales' | 'ta' | 'hr' | 'mixed' : undefined,
    status: filters.status && filters.status !== 'all' ? filters.status as 'active' | 'inactive' : undefined,
    page: filters.page,
    pageSize: 20,
  })

  return <PodsListClient initialData={data} initialFilters={filters} />
}
