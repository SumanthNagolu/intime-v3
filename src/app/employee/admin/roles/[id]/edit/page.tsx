'use client'

import { use } from 'react'
import { RoleFormPage } from '@/components/admin/roles/RoleFormPage'

export default function EditRolePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  return <RoleFormPage mode="edit" roleId={resolvedParams.id} />
}
