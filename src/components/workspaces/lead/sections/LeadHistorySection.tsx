'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { History, ArrowRight } from 'lucide-react'
import type { HistoryEntry } from '@/types/workspace'
import { format } from 'date-fns'

interface LeadHistorySectionProps {
  history: HistoryEntry[]
}

export function LeadHistorySection({ history }: LeadHistorySectionProps) {
  // Group history by date
  const groupedHistory = React.useMemo(() => {
    const groups: Record<string, HistoryEntry[]> = {}
    history.forEach((entry) => {
      const date = format(new Date(entry.changedAt), 'yyyy-MM-dd')
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(entry)
    })
    return groups
  }, [history])

  const dates = Object.keys(groupedHistory).sort().reverse()

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-charcoal-900">
          History ({history.length})
        </h2>
      </div>

      {history.length > 0 ? (
        <div className="space-y-6">
          {dates.map((date) => {
            const entries = groupedHistory[date]
            const formattedDate = format(new Date(date), 'EEEE, MMMM d, yyyy')

            return (
              <div key={date}>
                <h3 className="text-sm font-medium text-charcoal-700 mb-3">
                  {formattedDate}
                </h3>
                <Card>
                  <CardContent className="p-0">
                    <div className="divide-y divide-charcoal-100">
                      {entries.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-start gap-4 p-4"
                        >
                          <div className="w-8 h-8 rounded-full bg-charcoal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <History className="h-4 w-4 text-charcoal-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium text-charcoal-900">
                                {entry.changedBy?.name ?? (entry.isAutomated ? 'System' : 'Unknown')}
                              </span>
                              <span className="text-charcoal-500">
                                {getActionDescription(entry)}
                              </span>
                            </div>
                            {entry.field && entry.oldValue && entry.newValue && (
                              <div className="flex items-center gap-2 mt-1 text-xs">
                                <span className="px-2 py-0.5 bg-charcoal-100 rounded text-charcoal-600 line-through">
                                  {truncateValue(entry.oldValue)}
                                </span>
                                <ArrowRight className="h-3 w-3 text-charcoal-400" />
                                <span className="px-2 py-0.5 bg-success-100 rounded text-success-700">
                                  {truncateValue(entry.newValue)}
                                </span>
                              </div>
                            )}
                            <p className="text-xs text-charcoal-400 mt-1">
                              {format(new Date(entry.changedAt), 'h:mm a')}
                            </p>
                          </div>
                        </div>
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
            <p className="text-sm text-charcoal-500">No history recorded for this lead</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function getActionDescription(entry: HistoryEntry): string {
  if (entry.action === 'create') {
    return 'created this lead'
  }
  if (entry.action === 'update' && entry.field) {
    return `updated ${entry.field.replace(/_/g, ' ')}`
  }
  if (entry.action === 'delete') {
    return 'deleted this lead'
  }
  if (entry.action === 'qualify') {
    return 'qualified this lead'
  }
  if (entry.action === 'convert') {
    return 'converted this lead to deal'
  }
  return entry.action
}

function truncateValue(value: string, maxLength: number = 50): string {
  if (value.length <= maxLength) return value
  return value.slice(0, maxLength) + '...'
}

export default LeadHistorySection
