'use client'

import { format } from 'date-fns'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  Clock,
  Info,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'

interface EntityRateWidgetProps {
  entityType: string
  entityId: string
  contextClientId?: string
  showHistory?: boolean
  className?: string
  onEditRate?: () => void
}

/**
 * EntityRateWidget - Displays rate information for an entity
 *
 * Shows:
 * - Current bill/pay rates
 * - Margin percentage and quality
 * - Rate source (rate card or custom)
 * - Quick link to edit
 */
export function EntityRateWidget({
  entityType,
  entityId,
  contextClientId,
  showHistory = false,
  className,
  onEditRate,
}: EntityRateWidgetProps) {
  // Fetch current rate
  const rateQuery = trpc.rates.entityRates.getCurrentRate.useQuery({
    entityType,
    entityId,
    contextClientId,
  })

  // Fetch rate history if requested
  const historyQuery = trpc.rates.entityRates.listByEntity.useQuery(
    {
      entityType,
      entityId,
      limit: 5,
    },
    { enabled: showHistory }
  )

  const rate = rateQuery.data
  const history = historyQuery.data?.items ?? []
  const isLoading = rateQuery.isLoading

  // Margin quality assessment
  const getMarginQuality = (margin: number | null) => {
    if (margin === null) return { label: 'Unknown', color: 'text-charcoal-500', icon: Minus }
    if (margin >= 20) return { label: 'Excellent', color: 'text-green-600', icon: TrendingUp }
    if (margin >= 15) return { label: 'Good', color: 'text-green-600', icon: TrendingUp }
    if (margin >= 10) return { label: 'Acceptable', color: 'text-amber-600', icon: Minus }
    if (margin >= 5) return { label: 'Low', color: 'text-amber-600', icon: TrendingDown }
    return { label: 'Critical', color: 'text-red-600', icon: AlertTriangle }
  }

  const formatCurrency = (value: number | null) => {
    if (value === null) return '-'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value)
  }

  const formatRateUnit = (unit: string | undefined) => {
    if (!unit) return ''
    return `/${unit.replace('ly', '')}`
  }

  if (isLoading) {
    return (
      <Card className={cn('bg-white', className)}>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-6 w-32" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!rate) {
    return (
      <Card className={cn('bg-white', className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-charcoal-500 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Rate Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <DollarSign className="w-8 h-8 mx-auto text-charcoal-300 mb-2" />
            <p className="text-sm text-charcoal-500 mb-3">No rate defined</p>
            {onEditRate && (
              <Button variant="outline" size="sm" onClick={onEditRate}>
                Set Rate
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  const marginQuality = getMarginQuality(rate.marginPercentage)
  const MarginIcon = marginQuality.icon

  return (
    <Card className={cn('bg-white', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-charcoal-500 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Rate Information
          </CardTitle>
          {rate.source && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs cursor-help',
                      rate.source === 'rate_card'
                        ? 'border-blue-200 text-blue-700'
                        : 'border-amber-200 text-amber-700'
                    )}
                  >
                    {rate.source === 'rate_card' ? 'Rate Card' : 'Custom'}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  {rate.source === 'rate_card'
                    ? 'Rate derived from master rate card'
                    : 'Custom rate for this entity'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Main Rate Display */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-1">
            <p className="text-xs text-charcoal-500 uppercase tracking-wider">Bill Rate</p>
            <p className="text-2xl font-semibold text-charcoal-900">
              {formatCurrency(rate.billRate)}
              <span className="text-sm font-normal text-charcoal-500">
                {formatRateUnit(rate.rateUnit)}
              </span>
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-charcoal-500 uppercase tracking-wider">Pay Rate</p>
            <p className="text-2xl font-semibold text-charcoal-900">
              {formatCurrency(rate.payRate)}
              <span className="text-sm font-normal text-charcoal-500">
                {formatRateUnit(rate.rateUnit)}
              </span>
            </p>
          </div>
        </div>

        {/* Margin Display */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-charcoal-50">
          <div className="flex items-center gap-2">
            <MarginIcon className={cn('w-4 h-4', marginQuality.color)} />
            <span className="text-sm text-charcoal-600">Margin</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn('text-lg font-semibold', marginQuality.color)}>
              {rate.marginPercentage !== null ? `${rate.marginPercentage.toFixed(1)}%` : '-'}
            </span>
            <Badge
              className={cn(
                'text-xs',
                rate.marginPercentage !== null && rate.marginPercentage >= 15
                  ? 'bg-green-100 text-green-700'
                  : rate.marginPercentage !== null && rate.marginPercentage >= 10
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-red-100 text-red-700'
              )}
            >
              {marginQuality.label}
            </Badge>
          </div>
        </div>

        {/* Rate History Preview */}
        {showHistory && history.length > 1 && (
          <div className="mt-4 pt-4 border-t border-charcoal-200">
            <p className="text-xs text-charcoal-500 uppercase tracking-wider mb-2">
              Recent Changes
            </p>
            <div className="space-y-2">
              {history.slice(1, 4).map((historyItem) => (
                <div
                  key={historyItem.id}
                  className="flex items-center justify-between text-xs text-charcoal-500"
                >
                  <span>
                    {format(new Date(historyItem.effectiveDate), 'MMM d, yyyy')}
                  </span>
                  <span className="font-mono">
                    {formatCurrency(historyItem.billRate)} / {formatCurrency(historyItem.payRate)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Edit Button */}
        {onEditRate && (
          <div className="mt-4 pt-4 border-t border-charcoal-200">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={onEditRate}
            >
              Edit Rate
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
