export const dynamic = 'force-dynamic'

import { getServerCaller } from '@/server/trpc/server-caller'
import { EditGroupClient } from '@/components/admin/groups/EditGroupClient'
import { notFound } from 'next/navigation'

interface EditGroupPageProps {
  params: Promise<{ id: string }>
}

export default async function EditGroupPage({ params }: EditGroupPageProps) {
  const { id } = await params
  
  const caller = await getServerCaller()
  
  try {
    // Fetch group, available parents, and users in parallel
    const [group, groupsResult, usersResult] = await Promise.all([
      caller.groups.getById({ id }),
      caller.groups.list({ pageSize: 100 }),
      caller.groups.getAvailableUsers({}),
    ])
    
    return (
      <EditGroupClient 
        group={group}
        availableParents={groupsResult.items}
        availableUsers={usersResult}
      />
    )
  } catch {
    notFound()
  }
}




