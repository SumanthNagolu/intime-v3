'use client'

import { use } from 'react'
import { RoleDetailPage } from '@/components/admin/roles/RoleDetailPage'

export default function RoleDetailPageRoute({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  return <RoleDetailPage roleId={resolvedParams.id} />
}
