import { Skeleton } from '@/components/ui/skeleton'

export default function SubmissionDetailLoading() {
  return (
    <div className="flex flex-col min-h-full">
      <div className="px-6 py-4 space-y-4 bg-white">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-96" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="px-6 py-3 bg-charcoal-50/50">
        <div className="flex gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-32" />
          ))}
        </div>
      </div>
      <div className="flex-1 p-6">
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  )
}













