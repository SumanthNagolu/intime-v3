'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { trpc } from '@/lib/trpc/client'

interface MetricRowProps {
  label: string
  value: number
  target: number
  unit: string
  status: 'good' | 'warning' | 'poor'
}

function MetricRow({ label, value, target, unit, status }: MetricRowProps) {
  const statusStyles = {
    good: 'text-success-600',
    warning: 'text-warning-600',
    poor: 'text-error-600',
  }

  const statusIcons = {
    good: '✅',
    warning: '🟡',
    poor: '❌',
  }

  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-charcoal-900">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-charcoal-900">
          {value}{unit}
        </span>
        <span className="text-xs text-charcoal-500">
          (Target: {unit === '%' ? '' : '<'}{target}{unit})
        </span>
        <span className={cn('text-sm', statusStyles[status])}>
          {statusIcons[status]}
        </span>
      </div>
    </div>
  )
}

interface QualityMetric {
  value: number
  target: number
  unit: string
  status: 'good' | 'warning' | 'poor'
}

interface QualityMetricsData {
  days: number
  timeToSubmit: QualityMetric
  timeToFill: QualityMetric
  submissionQuality: QualityMetric
  interviewToOffer: QualityMetric
  offerAcceptance: QualityMetric
  retention: QualityMetric
  overallScore: number
}

interface QualityMetricsWidgetProps {
  className?: string
  initialData?: QualityMetricsData
}

export function QualityMetricsWidget({ className, initialData }: QualityMetricsWidgetProps) {
  const { data, isLoading } = trpc.dashboard.getQualityMetrics.useQuery({ days: 30 }, {
    initialData,
    enabled: !initialData,
  })

  if (isLoading) {
    return (
      <Card className={cn('bg-white', className)}>
        <CardHeader>
          <Skeleton className="h-6 w-36" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-10" />
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
          <CardTitle className="text-h4">Quality Metrics</CardTitle>
          <span className="text-caption text-charcoal-500">Last {data.days} Days</span>
        </div>
      </CardHeader>
      <CardContent className="divide-y divide-charcoal-100">
        <MetricRow
          label="Time-to-Submit"
          value={data.timeToSubmit.value}
          target={data.timeToSubmit.target}
          unit={data.timeToSubmit.unit}
          status={data.timeToSubmit.status}
        />
        <MetricRow
          label="Time-to-Fill"
          value={data.timeToFill.value}
          target={data.timeToFill.target}
          unit={data.timeToFill.unit}
          status={data.timeToFill.status}
        />
        <MetricRow
          label="Submission Quality"
          value={data.submissionQuality.value}
          target={data.submissionQuality.target}
          unit={data.submissionQuality.unit}
          status={data.submissionQuality.status}
        />
        <MetricRow
          label="Interview-to-Offer"
          value={data.interviewToOffer.value}
          target={data.interviewToOffer.target}
          unit={data.interviewToOffer.unit}
          status={data.interviewToOffer.status}
        />
        <MetricRow
          label="Offer Acceptance"
          value={data.offerAcceptance.value}
          target={data.offerAcceptance.target}
          unit={data.offerAcceptance.unit}
          status={data.offerAcceptance.status}
        />
        <MetricRow
          label="30-Day Retention"
          value={data.retention.value}
          target={data.retention.target}
          unit={data.retention.unit}
          status={data.retention.status}
        />

        {/* Overall Score */}
        <div className="pt-4 mt-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-charcoal-900">Overall Quality Score</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-charcoal-900">{data.overallScore}</span>
              <span className="text-sm text-charcoal-500">/100</span>
              <span className="text-xl">
                {data.overallScore >= 90 ? '🌟' : data.overallScore >= 70 ? '👍' : '📈'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
