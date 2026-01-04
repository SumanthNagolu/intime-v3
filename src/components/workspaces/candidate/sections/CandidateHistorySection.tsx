'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { History, ArrowRight, User } from 'lucide-react'
import type { HistoryEntry } from '@/types/workspace'
import { formatDistanceToNow, format } from 'date-fns'
import { cn } from '@/lib/utils'

interface CandidateHistorySectionProps {
  history: HistoryEntry[]
}

const ACTION_COLORS: Record<string, string> = {
  created: 'bg-success-100 text-success-700',
  updated: 'bg-blue-100 text-blue-700',
  deleted: 'bg-error-100 text-error-700',
  status_changed: 'bg-purple-100 text-purple-700',
}

/**
 * CandidateHistorySection - Audit trail for this candidate
 */
export function CandidateHistorySection({ history }: CandidateHistorySectionProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-charcoal-900">
          History ({history.length})
        </h2>
      </div>

      {/* History List */}
      {history.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-charcoal-100">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-4 p-4"
                >
                  <div className="w-10 h-10 rounded-full bg-charcoal-100 flex items-center justify-center flex-shrink-0">
                    <History className="h-5 w-5 text-charcoal-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={cn('capitalize', ACTION_COLORS[entry.action] || 'bg-charcoal-100 text-charcoal-700')}>
                        {entry.action.replace('_', ' ')}
                      </Badge>
                      {entry.field && (
                        <span className="text-sm font-medium text-charcoal-900 capitalize">
                          {entry.field.replace('_', ' ')}
                        </span>
                      )}
                    </div>

                    {/* Value Change */}
                    {(entry.oldValue || entry.newValue) && (
                      <div className="flex items-center gap-2 mt-2 text-sm">
                        {entry.oldValue && (
                          <span className="px-2 py-1 bg-charcoal-100 rounded text-charcoal-600 line-through">
                            {entry.oldValue}
                          </span>
                        )}
                        {entry.oldValue && entry.newValue && (
                          <ArrowRight className="h-4 w-4 text-charcoal-400" />
                        )}
                        {entry.newValue && (
                          <span className="px-2 py-1 bg-success-100 rounded text-success-700">
                            {entry.newValue}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center gap-4 mt-2 text-xs text-charcoal-500">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {entry.changedBy?.name ?? (entry.isAutomated ? 'System' : 'Unknown')}
                      </span>
                      <span title={format(new Date(entry.changedAt), 'PPpp')}>
                        {formatDistanceToNow(new Date(entry.changedAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <History className="h-12 w-12 text-charcoal-300 mx-auto mb-4" />
            <p className="text-sm text-charcoal-500">No history recorded</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default CandidateHistorySection
