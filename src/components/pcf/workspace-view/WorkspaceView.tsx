'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { WorkspaceSummary } from './WorkspaceSummary'
import { WorkspaceTabs } from './WorkspaceTabs'
import { WorkspaceTable } from './WorkspaceTable'
import { WorkspaceViewSkeleton } from './WorkspaceViewSkeleton'
import { cn } from '@/lib/utils'
import type { WorkspaceViewConfig } from './types'

interface WorkspaceViewProps {
  config: WorkspaceViewConfig
  userName?: string
  className?: string
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function WorkspaceView({
  config,
  userName,
  className,
}: WorkspaceViewProps) {
  const [activeTab, setActiveTab] = useState(config.defaultTab || config.tabs[0]?.id)

  const activeTabConfig = useMemo(
    () => config.tabs.find((tab) => tab.id === activeTab),
    [config.tabs, activeTab]
  )

  // Get data for active tab
  const { data, isLoading, error } = activeTabConfig?.useQuery() ?? {
    data: undefined,
    isLoading: false,
    error: null,
  }

  // Normalize data to array
  const items = useMemo(() => {
    if (!data) return []
    if (Array.isArray(data)) return data
    if ('items' in data) return data.items
    return []
  }, [data])

  return (
    <div className={cn('min-h-full bg-cream', className)}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            {config.showGreeting && userName ? (
              <>
                <h1 className="text-2xl font-heading font-semibold text-charcoal-900 tracking-tight">
                  {getGreeting()}, {userName}
                </h1>
                <p className="text-sm text-charcoal-500 mt-1">
                  {format(new Date(), 'EEEE, MMMM d, yyyy')}
                </p>
              </>
            ) : config.title ? (
              <>
                <h1 className="text-2xl font-heading font-semibold text-charcoal-900 tracking-tight">
                  {config.title}
                </h1>
                {config.description && (
                  <p className="text-sm text-charcoal-500 mt-1">{config.description}</p>
                )}
              </>
            ) : null}
          </div>

          {/* Quick Actions */}
          {config.quickActions && config.quickActions.length > 0 && (
            <div className="flex items-center gap-2">
              {config.quickActions.map((action) => {
                const Icon = action.icon
                const button = (
                  <Button
                    key={action.id}
                    variant={action.variant === 'premium' ? 'default' : action.variant || 'outline'}
                    onClick={action.onClick}
                    className={cn(
                      action.variant === 'premium' &&
                        'bg-gradient-to-r from-gold-500 to-gold-600 text-hublot-900 hover:from-gold-600 hover:to-gold-700'
                    )}
                  >
                    {Icon && <Icon className="w-4 h-4 mr-2" />}
                    {action.label}
                  </Button>
                )

                if (action.href) {
                  return (
                    <Link key={action.id} href={action.href}>
                      {button}
                    </Link>
                  )
                }
                return button
              })}
            </div>
          )}
        </div>

        {/* Summary Metrics */}
        {config.summary && config.summary.length > 0 && (
          <WorkspaceSummary
            summary={config.summary}
            columns={config.summaryColumns}
          />
        )}

        {/* Tabs */}
        <WorkspaceTabs
          tabs={config.tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Table Content */}
        {activeTabConfig && (
          <WorkspaceTable
            data={items as Record<string, unknown>[]}
            columns={activeTabConfig.columns}
            rowActions={activeTabConfig.rowActions}
            onRowClick={activeTabConfig.onRowClick}
            getRowHref={activeTabConfig.getRowHref}
            emptyState={activeTabConfig.emptyState}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  )
}

// Re-export sub-components for flexibility
export { WorkspaceSummary } from './WorkspaceSummary'
export { WorkspaceTabs } from './WorkspaceTabs'
export { WorkspaceTable } from './WorkspaceTable'

