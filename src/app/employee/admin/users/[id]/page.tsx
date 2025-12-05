export const dynamic = 'force-dynamic'

import { UserDetailPage } from '@/components/admin/users/UserDetailPage'

interface UserDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function UserDetailRoute({ params }: UserDetailPageProps) {
  const { id } = await params
  return <UserDetailPage userId={id} />
}
