export const dynamic = 'force-dynamic'

import { ActivityPatternFormPage } from '@/components/admin/activity-patterns/ActivityPatternFormPage'

export default function EditActivityPatternPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return <ActivityPatternFormPage params={params} />
}
