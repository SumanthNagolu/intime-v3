import { Suspense } from 'react'
import { WorkflowBuilderPage } from '@/components/admin/workflows/WorkflowBuilderPage'

function LoadingState() {
  return (
    <div className="p-6 space-y-6">
      <div className="h-8 w-64 bg-charcoal-100 animate-pulse rounded" />
      <div className="h-96 w-full bg-charcoal-100 animate-pulse rounded" />
    </div>
  )
}

export default function NewWorkflowPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <WorkflowBuilderPage />
    </Suspense>
  )
}
