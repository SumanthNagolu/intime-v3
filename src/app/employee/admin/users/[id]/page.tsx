export const dynamic = 'force-dynamic'

import { getServerCaller } from '@/server/trpc/server-caller'
import { UserDetailClient } from '@/components/admin/users/UserDetailClient'
import { notFound } from 'next/navigation'

interface UserDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function UserDetailRoute({ params }: UserDetailPageProps) {
  const { id } = await params

  try {
    // ONE database call - includes user + all tab data (activity, login history)
    const caller = await getServerCaller()
    const data = await caller.users.getFullUser({ id })
    return <UserDetailClient data={data} />
  } catch {
    notFound()
  }
}
