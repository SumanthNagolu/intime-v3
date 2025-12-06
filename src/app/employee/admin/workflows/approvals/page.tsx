import { Suspense } from 'react'
import { ApprovalsQueuePage } from '@/components/admin/workflows/ApprovalsQueuePage'

function LoadingState() {
  return (
    <div className="p-6 space-y-6">
      <div className="h-8 w-64 bg-charcoal-100 animate-pulse rounded" />
      <div className="h-12 w-full bg-charcoal-100 animate-pulse rounded" />
      <div className="h-64 w-full bg-charcoal-100 animate-pulse rounded" />
    </div>
  )
}

export default function WorkflowApprovalsPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ApprovalsQueuePage />
    </Suspense>
  )
}
