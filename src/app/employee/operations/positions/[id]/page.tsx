export const dynamic = 'force-dynamic'

import { getServerCaller } from '@/server/trpc/server-caller'
import { PositionDetailClient } from '@/components/hr/positions/PositionDetailClient'
import { notFound } from 'next/navigation'

interface PositionPageProps {
  params: Promise<{ id: string }>
}

export default async function PositionPage({ params }: PositionPageProps) {
  const { id } = await params

  try {
    // ONE database call - includes position + employees + activity
    const caller = await getServerCaller()
    const data = await caller.positions.getFullPosition({ id })
    return <PositionDetailClient data={data} />
  } catch {
    notFound()
  }
}
