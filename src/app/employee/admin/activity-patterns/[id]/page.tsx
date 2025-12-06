export const dynamic = 'force-dynamic'

import { ActivityPatternDetailPage } from '@/components/admin/activity-patterns/ActivityPatternDetailPage'

export default function ActivityPatternPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return <ActivityPatternDetailPage params={params} />
}
