import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function DealsPipelineSkeleton() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>

        {/* Summary Stats skeleton */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-gradient-to-br from-slate-50 to-slate-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-3 w-20 mb-2" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Pipeline Content skeleton */}
      <div className="flex-1 overflow-hidden p-6 bg-cream">
        <div className="flex gap-4 h-full overflow-x-auto">
          {[1, 2, 3, 4, 5].map((stage) => (
            <div key={stage} className="flex-shrink-0 w-72 flex flex-col">
              {/* Stage Header */}
              <Skeleton className="h-16 w-full rounded-t-lg" />

              {/* Deals List */}
              <div className="flex-1 bg-muted/30 rounded-b-lg p-2 space-y-2 min-h-[400px]">
                {[1, 2, 3].map((deal) => (
                  <Skeleton key={deal} className="h-28 w-full rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
