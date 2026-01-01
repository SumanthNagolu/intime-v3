'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PIPELINE_STAGES, getStageFromStatus } from '@/lib/pipeline/stages'
import type { Submission } from '@/configs/entities/submissions.config'

interface PipelineChartViewProps {
  submissions: Submission[]
}

export function PipelineChartView({ submissions }: PipelineChartViewProps) {
  const chartData = useMemo(() => {
    // Filter out rejected/withdrawn
    const activeSubmissions = submissions.filter(
      (s) => !['rejected', 'withdrawn'].includes(s.status)
    )

    // Count by stage
    const stageCounts = PIPELINE_STAGES.map((stage) => ({
      ...stage,
      count: activeSubmissions.filter((s) => getStageFromStatus(s.status) === stage.id).length,
    }))

    // Find max for scaling
    const maxCount = Math.max(...stageCounts.map((s) => s.count), 1)

    return { stageCounts, maxCount, total: activeSubmissions.length }
  }, [submissions])

  // Calculate conversion rates between stages
  const conversionRates = useMemo(() => {
    const rates: { from: string; to: string; rate: number }[] = []
    for (let i = 0; i < chartData.stageCounts.length - 1; i++) {
      const current = chartData.stageCounts[i]
      const next = chartData.stageCounts[i + 1]
      // Rate is cumulative candidates from this stage onwards vs total
      const currentAndBeyond = chartData.stageCounts
        .slice(i)
        .reduce((sum, s) => sum + s.count, 0)
      const nextAndBeyond = chartData.stageCounts
        .slice(i + 1)
        .reduce((sum, s) => sum + s.count, 0)
      const rate = currentAndBeyond > 0 ? (nextAndBeyond / currentAndBeyond) * 100 : 0
      rates.push({ from: current.label, to: next.label, rate })
    }
    return rates
  }, [chartData])

  return (
    <div className="space-y-6">
      {/* Bar Chart */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Pipeline Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4 h-64 pb-8">
            {chartData.stageCounts.map((stage) => {
              const heightPercent = (stage.count / chartData.maxCount) * 100
              const Icon = stage.icon

              return (
                <div key={stage.id} className="flex-1 flex flex-col items-center gap-2">
                  {/* Bar */}
                  <div className="w-full flex flex-col items-center justify-end h-48">
                    <div
                      className={cn(
                        'w-full rounded-t-lg transition-all duration-500 flex items-start justify-center pt-2',
                        stage.color
                      )}
                      style={{ height: `${Math.max(heightPercent, 8)}%` }}
                    >
                      <span className={cn('text-lg font-bold', stage.textColor)}>
                        {stage.count}
                      </span>
                    </div>
                  </div>
                  {/* Label */}
                  <div className="flex flex-col items-center gap-1">
                    <Icon className={cn('w-5 h-5', stage.textColor)} />
                    <span className="text-xs text-charcoal-600 text-center font-medium">
                      {stage.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Funnel / Conversion Rates */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Stage Conversion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {conversionRates.map((rate, i) => (
              <div
                key={i}
                className="p-4 rounded-lg bg-cream border border-charcoal-100"
              >
                <div className="text-xs text-charcoal-500 mb-1">
                  {rate.from} → {rate.to}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className={cn(
                    'text-2xl font-bold',
                    rate.rate >= 70 ? 'text-success-600' :
                    rate.rate >= 40 ? 'text-warning-600' :
                    'text-error-600'
                  )}>
                    {rate.rate.toFixed(0)}%
                  </span>
                  <span className="text-xs text-charcoal-500">conversion</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-charcoal-900">{chartData.total}</div>
            <div className="text-sm text-charcoal-500">Active in Pipeline</div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-gold-600">
              {chartData.stageCounts.find((s) => s.id === 'placed')?.count || 0}
            </div>
            <div className="text-sm text-charcoal-500">Hired</div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-charcoal-900">
              {chartData.stageCounts.find((s) => s.id === 'interview')?.count || 0}
            </div>
            <div className="text-sm text-charcoal-500">In Interview</div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-amber-600">
              {chartData.stageCounts.find((s) => s.id === 'offer')?.count || 0}
            </div>
            <div className="text-sm text-charcoal-500">Offer Stage</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
