export const dynamic = 'force-dynamic'

import { getServerCaller } from '@/server/trpc/server-caller'
import { GroupsListClient } from '@/components/admin/groups/GroupsListClient'

interface GroupsPageProps {
  searchParams: Promise<{
    search?: string
    groupType?: string
    status?: string
    page?: string
  }>
}

export default async function GroupsPage({ searchParams }: GroupsPageProps) {
  const params = await searchParams
  const filters = {
    search: params.search,
    groupType: params.groupType,
    status: params.status || 'active',
    page: params.page ? parseInt(params.page) : 1,
  }

  // ONE database call - get groups with full hierarchy
  const caller = await getServerCaller()
  const data = await caller.groups.list({
    search: filters.search,
    groupType: filters.groupType && filters.groupType !== 'all' 
      ? filters.groupType as 'root' | 'division' | 'branch' | 'team' | 'satellite_office' | 'producer' 
      : undefined,
    isActive: filters.status === 'active' ? true : filters.status === 'inactive' ? false : undefined,
    page: filters.page,
    pageSize: 20,
  })

  return <GroupsListClient initialData={data} initialFilters={filters} />
}


