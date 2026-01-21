'use client'

import * as React from 'react'
import { History, ArrowRight, User, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { FullJob, StatusHistoryItem } from '@/types/job'
import { format, formatDistanceToNow } from 'date-fns'

interface JobHistorySectionProps {
  job: FullJob
}

const STATUS_CONFIG: Record<string, { bg: string; text: string }> = {
  draft: { bg: 'bg-charcoal-100', text: 'text-charcoal-600' },
  open: { bg: 'bg-blue-50', text: 'text-blue-700' },
  active: { bg: 'bg-success-50', text: 'text-success-700' },
  on_hold: { bg: 'bg-amber-50', text: 'text-amber-700' },
  filled: { bg: 'bg-purple-50', text: 'text-purple-700' },
  cancelled: { bg: 'bg-error-50', text: 'text-error-700' },
  closed: { bg: 'bg-charcoal-100', text: 'text-charcoal-600' },
}

/**
 * JobHistorySection - Status change history for the job
 */
export function JobHistorySection({ job }: JobHistorySectionProps) {
  const history = job.sections?.history?.items || []

  // Sort by date descending
  const sortedHistory = React.useMemo(() => {
    return [...history].sort((a, b) =>
      new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime()
    )
  }, [history])

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-charcoal-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
              <History className="h-5 w-5 text-charcoal-600" />
            </div>
            <div>
              <h3 className="font-semibold text-charcoal-900">Status History</h3>
              <p className="text-xs text-charcoal-500">{history.length} status changes</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {history.length === 0 ? (
            <div className="py-12 text-center">
              <History className="h-12 w-12 text-charcoal-300 mx-auto mb-3" />
              <p className="text-sm text-charcoal-500">No status changes recorded</p>
            </div>
          ) : (
            <div className="space-y-4 relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-2 bottom-2 w-px bg-charcoal-200" />

              {sortedHistory.map((item, index) => {
                const fromConfig = item.from_status ? STATUS_CONFIG[item.from_status] : null
                const toConfig = STATUS_CONFIG[item.to_status] || STATUS_CONFIG.draft

                return (
                  <div key={item.id} className="flex gap-4 relative">
                    <div className="w-8 h-8 rounded-full bg-charcoal-100 border-2 border-white flex items-center justify-center z-10">
                      <RefreshCw className="h-4 w-4 text-charcoal-500" />
                    </div>
                    <div className="flex-1 min-w-0 pb-4">
                      <div className="rounded-lg border border-charcoal-200/60 bg-white p-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm text-charcoal-600">Status changed</span>
                          {item.from_status && fromConfig && (
                            <>
                              <span className="text-sm text-charcoal-400">from</span>
                              <Badge className={cn('capitalize text-xs', fromConfig.bg, fromConfig.text)}>
                                {item.from_status.replace(/_/g, ' ')}
                              </Badge>
                            </>
                          )}
                          <span className="text-sm text-charcoal-400">to</span>
                          <Badge className={cn('capitalize text-xs', toConfig.bg, toConfig.text)}>
                            {item.to_status.replace(/_/g, ' ')}
                          </Badge>
                        </div>

                        {item.reason && (
                          <p className="text-sm text-charcoal-600 mt-2">
                            <span className="font-medium">Reason:</span> {item.reason}
                          </p>
                        )}

                        <div className="flex items-center gap-2 mt-3 text-xs text-charcoal-500">
                          {item.changedBy && (
                            <>
                              <User className="h-3 w-3" />
                              <span>{item.changedBy.full_name}</span>
                              <span>·</span>
                            </>
                          )}
                          <span>{format(new Date(item.changed_at), 'MMM d, yyyy h:mm a')}</span>
                          <span className="text-charcoal-400">
                            ({formatDistanceToNow(new Date(item.changed_at), { addSuffix: true })})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default JobHistorySection
