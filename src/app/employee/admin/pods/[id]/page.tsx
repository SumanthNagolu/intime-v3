export const dynamic = 'force-dynamic'

import { PodDetailPage } from '@/components/admin/pods/PodDetailPage'

interface PodPageProps {
  params: Promise<{ id: string }>
}

export default async function PodPage({ params }: PodPageProps) {
  const { id } = await params
  return <PodDetailPage podId={id} />
}
