import { DashboardGrid } from '@/components/dashboard/DashboardShell'

export function SystemHealthSkeleton() {
  return (
    <DashboardGrid columns={4}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="h-28 bg-charcoal-100 animate-pulse rounded-xl"
        />
      ))}
    </DashboardGrid>
  )
}
