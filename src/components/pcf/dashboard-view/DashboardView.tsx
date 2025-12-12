'use client'

import { useState, useEffect, useCallback } from 'react'
import { DashboardHeader } from './DashboardHeader'
import { DashboardMetrics } from './DashboardMetrics'
import { DashboardGrid } from './DashboardGrid'
import { DashboardWidget } from './DashboardWidget'
import { DashboardViewSkeleton } from './DashboardViewSkeleton'
import { cn } from '@/lib/utils'
import type { DashboardViewConfig } from './types'

interface DashboardViewProps {
  config: DashboardViewConfig
  initialData?: Record<string, unknown>
  className?: string
}

export function DashboardView({
  config,
  initialData,
  className,
}: DashboardViewProps) {
  const [dateRange, setDateRange] = useState(config.defaultDateRange || '7d')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [widgetData, setWidgetData] = useState<Record<string, unknown>>(initialData || {})

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    // Widgets with useQuery will automatically refetch
    // For server-rendered data, we'd need to trigger a router refresh
    setTimeout(() => setIsRefreshing(false), 1000)
  }, [])

  // Auto-refresh interval
  useEffect(() => {
    if (!config.refreshInterval) return

    const interval = setInterval(() => {
      handleRefresh()
    }, config.refreshInterval)

    return () => clearInterval(interval)
  }, [config.refreshInterval, handleRefresh])

  return (
    <div className={cn('min-h-full bg-cream', className)}>
      <div className="p-6 space-y-6">
        {/* Custom Header Override */}
        {config.renderCustomHeader ? (
          config.renderCustomHeader()
        ) : (
          <DashboardHeader
            title={config.title}
            description={config.description}
            breadcrumbs={config.breadcrumbs}
            actions={config.actions}
            dateRangeFilter={config.dateRangeFilter}
            dateRange={dateRange}
            onDateRangeChange={(range) => setDateRange(range as typeof dateRange)}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />
        )}

        {/* Metrics Row */}
        {config.metrics && config.metrics.length > 0 && (
          <DashboardMetrics
            metrics={config.metrics}
            columns={config.metricsColumns}
          />
        )}

        {/* Custom Content Override */}
        {config.renderCustomContent ? (
          config.renderCustomContent()
        ) : (
          /* Widget Grid */
          config.widgets && config.widgets.length > 0 && (
            <DashboardGrid columns={config.widgetColumns}>
              {config.widgets.map((widget) => {
                // If widget has useQuery, use that
                // Otherwise use initialData
                const data = widgetData[widget.id]

                return (
                  <DashboardWidget
                    key={widget.id}
                    config={widget}
                    data={data}
                    isLoading={isRefreshing}
                  />
                )
              })}
            </DashboardGrid>
          )
        )}
      </div>
    </div>
  )
}

// Re-export sub-components for flexibility
export { DashboardHeader } from './DashboardHeader'
export { DashboardMetrics } from './DashboardMetrics'
export { DashboardGrid, DashboardSection } from './DashboardGrid'
export { DashboardWidget, WidgetWrapper } from './DashboardWidget'

