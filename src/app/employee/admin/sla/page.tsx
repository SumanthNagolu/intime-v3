import { Suspense } from 'react'
import { SlaHubPage } from '@/components/admin/sla/SlaHubPage'

function LoadingState() {
  return (
    <div className="p-6 space-y-6">
      <div className="h-8 w-64 bg-charcoal-100 animate-pulse rounded" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 w-full bg-charcoal-100 animate-pulse rounded" />
        ))}
      </div>
      <div className="h-64 w-full bg-charcoal-100 animate-pulse rounded" />
    </div>
  )
}

export default function SlaPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <SlaHubPage />
    </Suspense>
  )
}
