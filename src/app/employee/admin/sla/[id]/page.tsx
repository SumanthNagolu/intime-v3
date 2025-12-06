import { Suspense } from 'react'
import { SlaDetailPage } from '@/components/admin/sla/SlaDetailPage'

function LoadingState() {
  return (
    <div className="p-6 space-y-6">
      <div className="h-8 w-64 bg-charcoal-100 animate-pulse rounded" />
      <div className="grid grid-cols-2 gap-6">
        <div className="h-48 w-full bg-charcoal-100 animate-pulse rounded" />
        <div className="h-48 w-full bg-charcoal-100 animate-pulse rounded" />
      </div>
      <div className="h-64 w-full bg-charcoal-100 animate-pulse rounded" />
    </div>
  )
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function SlaRulePage({ params }: PageProps) {
  const { id } = await params
  return (
    <Suspense fallback={<LoadingState />}>
      <SlaDetailPage ruleId={id} />
    </Suspense>
  )
}
