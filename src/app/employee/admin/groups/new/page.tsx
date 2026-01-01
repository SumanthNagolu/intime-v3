export const dynamic = 'force-dynamic'

import { getServerCaller } from '@/server/trpc/server-caller'
import { NewGroupClient } from '@/components/admin/groups/NewGroupClient'

interface NewGroupPageProps {
  searchParams: Promise<{
    parentId?: string
  }>
}

export default async function NewGroupPage({ searchParams }: NewGroupPageProps) {
  const params = await searchParams
  
  const caller = await getServerCaller()
  
  // Fetch groups for parent dropdown and users for management assignment
  const [groupsResult, usersResult] = await Promise.all([
    caller.groups.list({ pageSize: 100 }),
    caller.groups.getAvailableUsers({}),
  ])

  return (
    <NewGroupClient 
      availableParents={groupsResult.items}
      availableUsers={usersResult}
      preselectedParentId={params.parentId}
    />
  )
}


