'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { trpc } from '@/lib/trpc/client'
import Link from 'next/link'

interface AccountRowProps {
  id: string
  name: string
  industry?: string
  healthStatus: 'healthy' | 'attention' | 'at_risk'
  activeJobs: number
  ytdRevenue: number
  npsScore?: number | null
  daysSinceContact: number
}

function AccountRow({ id, name, healthStatus, activeJobs, ytdRevenue, npsScore, daysSinceContact }: AccountRowProps) {
  const healthIcons = {
    healthy: '🟢',
    attention: '🟡',
    at_risk: '🔴',
  }

  const formatRevenue = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`
    }
    return `$${value}`
  }

  return (
    <Link href={`/employee/crm/accounts/${id}`}>
      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-charcoal-50 transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-lg">{healthIcons[healthStatus]}</span>
          <div>
            <p className="text-sm font-medium text-charcoal-900">{name}</p>
            <p className="text-xs text-charcoal-500">
              Last contact: {daysSinceContact === 0 ? 'Today' : `${daysSinceContact} day${daysSinceContact !== 1 ? 's' : ''} ago`}
              {healthStatus === 'at_risk' && ' 🚨 AT RISK'}
              {healthStatus === 'attention' && ' ⚠ Need check-in'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-charcoal-900">
            {activeJobs} job{activeJobs !== 1 ? 's' : ''} • {formatRevenue(ytdRevenue)} YTD
          </p>
          <p className="text-xs text-charcoal-500">
            NPS: {npsScore ?? 'N/A'}
          </p>
        </div>
      </div>
    </Link>
  )
}

export function AccountPortfolioWidget({ className }: { className?: string }) {
  const { data, isLoading } = trpc.crm.accounts.getHealth.useQuery({})

  if (isLoading) {
    return (
      <Card className={cn('bg-white', className)}>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  return (
    <Card className={cn('bg-white', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-h4">Account Portfolio</CardTitle>
          <Link href="/employee/crm/accounts">
            <Button variant="ghost" size="sm">View Accounts</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {data.accounts.slice(0, 5).map(account => (
          <AccountRow
            key={account.id}
            id={account.id}
            name={account.name}
            healthStatus={account.healthStatus}
            activeJobs={account.activeJobs}
            ytdRevenue={account.ytdRevenue}
            npsScore={account.npsScore}
            daysSinceContact={account.daysSinceContact}
          />
        ))}

        {data.accounts.length === 0 && (
          <div className="text-center py-8 text-charcoal-500">
            No accounts assigned yet.
          </div>
        )}

        {/* Summary */}
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-charcoal-100">
          <span className="text-sm text-charcoal-600">
            Total: <strong>{data.summary.total}</strong> accounts
          </span>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-success-600">🟢 {data.summary.healthy}</span>
            <span className="text-warning-600">🟡 {data.summary.needsAttention}</span>
            <span className="text-error-600">🔴 {data.summary.atRisk}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
