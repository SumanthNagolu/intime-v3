'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { History, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react'
import type { HistoryEntry } from '@/types/workspace'
import type { DealStageHistoryEntry } from '@/types/deal'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface DealHistorySectionProps {
  history: HistoryEntry[]
  stageHistory?: DealStageHistoryEntry[]
}

const STAGE_COLORS: Record<string, string> = {
  discovery: 'bg-slate-100 text-slate-700',
  qualification: 'bg-blue-100 text-blue-700',
  proposal: 'bg-amber-100 text-amber-700',
  negotiation: 'bg-orange-100 text-orange-700',
  verbal_commit: 'bg-green-100 text-green-700',
  closed_won: 'bg-success-100 text-success-700',
  closed_lost: 'bg-error-100 text-error-700',
}

export function DealHistorySection({ history, stageHistory = [] }: DealHistorySectionProps) {
  // Combine and sort history entries
  const combinedHistory = React.useMemo(() => {
    // Convert stage history to history entry format
    const stageEntries: HistoryEntry[] = stageHistory.map((entry, index) => ({
      id: `stage-${entry.id}`,
      changeType: 'stage_change',
      action: 'stage_change',
      field: 'stage',
      oldValue: index > 0 ? stageHistory[index - 1]?.stage || null : null,
      newValue: entry.stage,
      oldValueLabel: null,
      newValueLabel: null,
      reason: null,
      comment: null,
      isAutomated: false,
      timeInPreviousState: null,
      metadata: null,
      changedAt: entry.enteredAt,
      changedBy: entry.changedBy ? { id: '', name: entry.changedBy, avatarUrl: null } : null,
    }))

    // Combine and sort by date descending
    const all = [...history, ...stageEntries]
    return all.sort(
      (a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
    )
  }, [history, stageHistory])

  // Group history by date
  const groupedHistory = React.useMemo(() => {
    const groups: Record<string, HistoryEntry[]> = {}
    combinedHistory.forEach((entry) => {
      const date = format(new Date(entry.changedAt), 'yyyy-MM-dd')
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(entry)
    })
    return groups
  }, [combinedHistory])

  const dates = Object.keys(groupedHistory).sort().reverse()

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-charcoal-900">
          History ({combinedHistory.length})
        </h2>
      </div>

      {combinedHistory.length > 0 ? (
        <div className="space-y-6">
          {dates.map((date) => {
            const entries = groupedHistory[date]
            const formattedDate = format(new Date(date), 'EEEE, MMMM d, yyyy')

            return (
              <div key={date}>
                <h3 className="text-sm font-medium text-charcoal-700 mb-3">{formattedDate}</h3>
                <Card>
                  <CardContent className="p-0">
                    <div className="divide-y divide-charcoal-100">
                      {entries.map((entry) => (
                        <HistoryRow key={entry.id} entry={entry} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <History className="h-12 w-12 text-charcoal-300 mx-auto mb-4" />
            <p className="text-sm text-charcoal-500">No history recorded for this deal</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function HistoryRow({ entry }: { entry: HistoryEntry }) {
  const isStageChange = entry.action === 'stage_change'

  return (
    <div className="flex items-start gap-4 p-4">
      <div className="w-8 h-8 rounded-full bg-charcoal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        {isStageChange ? (
          entry.newValue === 'closed_won' ? (
            <TrendingUp className="h-4 w-4 text-success-500" />
          ) : entry.newValue === 'closed_lost' ? (
            <TrendingDown className="h-4 w-4 text-error-500" />
          ) : (
            <ArrowRight className="h-4 w-4 text-charcoal-500" />
          )
        ) : (
          <History className="h-4 w-4 text-charcoal-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-charcoal-900">{entry.changedBy?.name ?? (entry.isAutomated ? 'System' : 'Unknown')}</span>
          <span className="text-charcoal-500">{getActionDescription(entry)}</span>
        </div>
        {isStageChange && entry.oldValue && entry.newValue ? (
          <div className="flex items-center gap-2 mt-2">
            <Badge className={cn('capitalize', STAGE_COLORS[entry.oldValue] || 'bg-charcoal-100')}>
              {formatStageName(entry.oldValue)}
            </Badge>
            <ArrowRight className="h-4 w-4 text-charcoal-400" />
            <Badge className={cn('capitalize', STAGE_COLORS[entry.newValue] || 'bg-charcoal-100')}>
              {formatStageName(entry.newValue)}
            </Badge>
          </div>
        ) : entry.field && entry.oldValue && entry.newValue ? (
          <div className="flex items-center gap-2 mt-1 text-xs">
            <span className="px-2 py-0.5 bg-charcoal-100 rounded text-charcoal-600 line-through">
              {truncateValue(entry.oldValue)}
            </span>
            <ArrowRight className="h-3 w-3 text-charcoal-400" />
            <span className="px-2 py-0.5 bg-success-100 rounded text-success-700">
              {truncateValue(entry.newValue)}
            </span>
          </div>
        ) : null}
        <p className="text-xs text-charcoal-400 mt-1">
          {format(new Date(entry.changedAt), 'h:mm a')}
        </p>
      </div>
    </div>
  )
}

function getActionDescription(entry: HistoryEntry): string {
  if (entry.action === 'create') {
    return 'created this deal'
  }
  if (entry.action === 'stage_change') {
    return 'moved deal to a new stage'
  }
  if (entry.action === 'update' && entry.field) {
    return `updated ${entry.field.replace(/_/g, ' ')}`
  }
  if (entry.action === 'delete') {
    return 'deleted this deal'
  }
  if (entry.action === 'close_won') {
    return 'closed this deal as Won'
  }
  if (entry.action === 'close_lost') {
    return 'closed this deal as Lost'
  }
  return entry.action
}

function formatStageName(stage: string): string {
  return stage
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function truncateValue(value: string, maxLength: number = 50): string {
  if (value.length <= maxLength) return value
  return value.slice(0, maxLength) + '...'
}

export default DealHistorySection
