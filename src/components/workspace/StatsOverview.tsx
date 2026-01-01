'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Clock, Send, Briefcase, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MyWorkspaceStats } from '@/types/workspace'

interface StatsOverviewProps {
  stats: MyWorkspaceStats | null
  isLoading?: boolean
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number
  subValue?: { count: number; label: string; variant?: 'warning' | 'success' | 'info' }
  isLoading?: boolean
}

function StatCard({ icon, label, value, subValue, isLoading }: StatCardProps) {
  return (
    <Card className="bg-white shadow-elevation-sm hover:shadow-elevation-md transition-all duration-300">
      <CardContent className="p-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-12" />
          </div>
        ) : (
          <>
            <div className="w-8 h-8 rounded flex items-center justify-center mb-2 bg-charcoal-100 text-charcoal-600">
              {icon}
            </div>
            <p className="text-sm text-charcoal-500 font-medium uppercase tracking-wide">
              {label}
            </p>
            <p className="text-3xl font-bold text-charcoal-900">{value}</p>
            {subValue && subValue.count > 0 && (
              <p
                className={cn(
                  'text-sm mt-1 flex items-center gap-1',
                  subValue.variant === 'warning' && 'text-error-600',
                  subValue.variant === 'success' && 'text-success-600',
                  subValue.variant === 'info' && 'text-charcoal-500'
                )}
              >
                {subValue.variant === 'warning' && '⚠️'}
                {subValue.variant === 'success' && '✓'}
                {subValue.variant === 'info' && '◐'}
                <span>{subValue.count} {subValue.label}</span>
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export function StatsOverview({ stats, isLoading = false }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        icon={<Clock className="w-4 h-4" />}
        label="Activities"
        value={stats?.activities.total ?? 0}
        subValue={
          stats?.activities.overdue
            ? { count: stats.activities.overdue, label: 'overdue', variant: 'warning' }
            : undefined
        }
        isLoading={isLoading}
      />
      <StatCard
        icon={<Send className="w-4 h-4" />}
        label="Submissions"
        value={stats?.submissions.total ?? 0}
        subValue={
          stats?.submissions.pending
            ? { count: stats.submissions.pending, label: 'pending', variant: 'info' }
            : undefined
        }
        isLoading={isLoading}
      />
      <StatCard
        icon={<Briefcase className="w-4 h-4" />}
        label="Active Jobs"
        value={stats?.jobs.active ?? 0}
        isLoading={isLoading}
      />
      <StatCard
        icon={<Users className="w-4 h-4" />}
        label="Placements"
        value={stats?.placements.total ?? 0}
        subValue={
          stats?.placements.active
            ? { count: stats.placements.active, label: 'active', variant: 'success' }
            : undefined
        }
        isLoading={isLoading}
      />
    </div>
  )
}
