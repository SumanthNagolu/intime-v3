export const dynamic = 'force-dynamic'

import { getServerCaller } from '@/server/trpc/server-caller'
import { DepartmentDetailClient } from '@/components/hr/departments/DepartmentDetailClient'
import { notFound } from 'next/navigation'

interface DepartmentPageProps {
  params: Promise<{ id: string }>
}

export default async function DepartmentPage({ params }: DepartmentPageProps) {
  const { id } = await params

  try {
    // ONE database call - includes department + employees + positions + activity
    const caller = await getServerCaller()
    const data = await caller.departments.getFullDepartment({ id })
    return <DepartmentDetailClient data={data} />
  } catch {
    notFound()
  }
}
