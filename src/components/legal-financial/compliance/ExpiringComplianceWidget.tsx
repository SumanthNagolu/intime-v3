'use client'

import { AlertTriangle, Calendar, ChevronRight, Clock, XCircle } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'

interface ExpiringComplianceWidgetProps {
  daysAhead?: number
  limit?: number
  className?: string
  onViewAll?: () => void
}

/**
 * ExpiringComplianceWidget - Dashboard widget showing expiring compliance items
 *
 * Features:
 * - Shows items expiring within specified days
 * - Color-coded by urgency (expired, critical, warning)
 * - Quick navigation to compliance details
 */
export function ExpiringComplianceWidget({
  daysAhead = 30,
  limit = 10,
  className,
  onViewAll,
}: ExpiringComplianceWidgetProps) {
  const expiringQuery = trpc.compliance.getExpiring.useQuery({
    daysAhead,
    limit,
  })

  const items = expiringQuery.data ?? []

  const getUrgencyConfig = (expiryDate: string): {
    label: string
    color: string
    iconColor: string
    urgency: 'expired' | 'critical' | 'warning' | 'upcoming'
  } => {
    const daysUntil = differenceInDays(new Date(expiryDate), new Date())

    if (daysUntil < 0) {
      return {
        label: 'Expired',
        color: 'bg-red-100 text-red-700 border-red-200',
        iconColor: 'text-red-600',
        urgency: 'expired' as const,
      }
    }
    if (daysUntil <= 7) {
      return {
        label: `${daysUntil}d`,
        color: 'bg-red-100 text-red-700 border-red-200',
        iconColor: 'text-red-600',
        urgency: 'critical' as const,
      }
    }
    if (daysUntil <= 14) {
      return {
        label: `${daysUntil}d`,
        color: 'bg-amber-100 text-amber-700 border-amber-200',
        iconColor: 'text-amber-600',
        urgency: 'warning' as const,
      }
    }
    return {
      label: `${daysUntil}d`,
      color: 'bg-amber-100 text-amber-700 border-amber-200',
      iconColor: 'text-amber-600',
      urgency: 'upcoming' as const,
    }
  }

  type ExpiringItem = typeof items[number]

  // Group items by urgency
  const grouped = items.reduce(
    (acc: Record<string, ExpiringItem[]>, item: ExpiringItem) => {
      if (!item.expiryDate) return acc
      const config = getUrgencyConfig(item.expiryDate)
      if (!acc[config.urgency]) {
        acc[config.urgency] = []
      }
      acc[config.urgency].push(item)
      return acc
    },
    {} as Record<string, ExpiringItem[]>
  )

  const expiredCount = grouped.expired?.length ?? 0
  const criticalCount = grouped.critical?.length ?? 0
  const warningCount = grouped.warning?.length ?? 0

  return (
    <Card className={cn('bg-white', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          Expiring Compliance
        </CardTitle>
        {onViewAll && (
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            View All
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {/* Summary Badges */}
        {(expiredCount > 0 || criticalCount > 0 || warningCount > 0) && (
          <div className="flex gap-2 mb-4">
            {expiredCount > 0 && (
              <Badge className="bg-red-100 text-red-700 border-red-200">
                <XCircle className="w-3 h-3 mr-1" />
                {expiredCount} Expired
              </Badge>
            )}
            {criticalCount > 0 && (
              <Badge className="bg-red-100 text-red-700 border-red-200">
                <Clock className="w-3 h-3 mr-1" />
                {criticalCount} Critical
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {warningCount} Warning
              </Badge>
            )}
          </div>
        )}

        {/* Items List */}
        {items.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-charcoal-900">All Clear</p>
            <p className="text-sm text-charcoal-500 mt-1">
              No compliance items expiring in the next {daysAhead} days
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.slice(0, limit).map((item: ExpiringItem) => {
              const urgencyConfig = item.expiryDate
                ? getUrgencyConfig(item.expiryDate)
                : null

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-charcoal-50 rounded-lg hover:bg-charcoal-100 transition-colors cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-charcoal-900 truncate">
                      {item.complianceName || item.complianceType || 'Compliance Item'}
                    </p>
                    <p className="text-xs text-charcoal-500 mt-0.5">
                      {item.entityType} • Expires{' '}
                      {item.expiryDate && format(new Date(item.expiryDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                  {urgencyConfig && (
                    <Badge className={urgencyConfig.color}>
                      {urgencyConfig.label}
                    </Badge>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
