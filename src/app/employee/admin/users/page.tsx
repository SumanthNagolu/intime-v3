export const dynamic = 'force-dynamic'

import { getServerCaller } from '@/server/trpc/server-caller'
import { UsersListClient } from '@/components/admin/users/UsersListClient'

interface UsersPageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const params = await searchParams

  // Parse filters from URL
  const filters = {
    search: params.search,
    roleId: params.roleId,
    podId: params.podId,
    status: params.status || 'active',
    page: params.page ? parseInt(params.page, 10) : 1,
  }

  // ONE database call - includes list + filter options + stats
  const caller = await getServerCaller()
  const data = await caller.users.listWithFilterOptions({
    search: filters.search,
    roleId: filters.roleId,
    podId: filters.podId,
    status: filters.status as 'pending' | 'active' | 'suspended' | 'deactivated' | undefined,
    page: filters.page,
    pageSize: 20,
  })

  return <UsersListClient initialData={data} initialFilters={filters} />
}
