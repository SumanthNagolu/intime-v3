export const dynamic = 'force-dynamic'

import { getServerCaller } from '@/server/trpc/server-caller'
import { GroupDetailClient } from '@/components/admin/groups/GroupDetailClient'
import { notFound } from 'next/navigation'

interface GroupDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function GroupDetailPage({ params }: GroupDetailPageProps) {
  const { id } = await params
  
  const caller = await getServerCaller()
  
  try {
    // ONE database call - includes all related data
    const group = await caller.groups.getFullGroup({ id })
    
    return <GroupDetailClient group={group} />
  } catch {
    notFound()
  }
}

