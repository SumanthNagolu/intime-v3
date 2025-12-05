export const dynamic = 'force-dynamic'

import { UserFormPage } from '@/components/admin/users/UserFormPage'

interface EditUserPageProps {
  params: Promise<{ id: string }>
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const { id } = await params
  return <UserFormPage mode="edit" userId={id} />
}
