export const dynamic = 'force-dynamic'

import { getServerCaller } from '@/server/trpc/server-caller'
import { PodDetailClient } from '@/components/admin/pods/PodDetailClient'
import { notFound } from 'next/navigation'

interface PodPageProps {
  params: Promise<{ id: string }>
}

export default async function PodPage({ params }: PodPageProps) {
  const { id } = await params

  try {
    // ONE database call - includes pod + metrics + activity
    const caller = await getServerCaller()
    const data = await caller.pods.getFullPod({ id })
    return <PodDetailClient data={data} />
  } catch {
    notFound()
  }
}
