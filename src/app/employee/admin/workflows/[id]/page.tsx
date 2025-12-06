import { Suspense } from 'react'
import { WorkflowDetailPage } from '@/components/admin/workflows/WorkflowDetailPage'

function LoadingState() {
  return (
    <div className="p-6 space-y-6">
      <div className="h-8 w-64 bg-charcoal-100 animate-pulse rounded" />
      <div className="h-48 w-full bg-charcoal-100 animate-pulse rounded" />
      <div className="h-64 w-full bg-charcoal-100 animate-pulse rounded" />
    </div>
  )
}

export default async function WorkflowDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <Suspense fallback={<LoadingState />}>
      <WorkflowDetailPage workflowId={id} />
    </Suspense>
  )
}
