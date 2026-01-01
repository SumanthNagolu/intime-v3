'use client'

import { format, formatDistanceToNow } from 'date-fns'
import {
  Check,
  X,
  ArrowRight,
  Clock,
  User,
  History,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/components/pcf/shared/EmptyState'
import type { FullSubmission, StatusHistoryEntry } from '@/types/submission'

// Status styling
const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  sourced: { bg: 'bg-charcoal-100', text: 'text-charcoal-600', label: 'Sourced' },
  screening: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Screening' },
  submission_ready: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Ready' },
  submitted: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Submitted' },
  submitted_to_client: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'To Client' },
  client_review: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Client Review' },
  interview_scheduled: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Interview Scheduled' },
  client_interview: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Interviewing' },
  interviewed: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Interviewed' },
  offer_stage: { bg: 'bg-gold-100', text: 'text-gold-700', label: 'Offer Stage' },
  placed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Placed' },
  rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' },
  withdrawn: { bg: 'bg-charcoal-200', text: 'text-charcoal-600', label: 'Withdrawn' },
}

interface HistorySectionProps {
  submission: FullSubmission
}

export function HistorySection({ submission }: HistorySectionProps) {
  const history = submission.sections?.history?.items || []

  // Sort history by date (most recent first)
  const sortedHistory = [...history].sort((a, b) => {
    const dateA = new Date(a.changed_at || 0).getTime()
    const dateB = new Date(b.changed_at || 0).getTime()
    return dateB - dateA
  })

  if (history.length === 0) {
    return (
      <EmptyState
        config={{
          icon: History,
          title: 'No status history',
          description: 'Status changes will appear here as the submission progresses',
        }}
        variant="inline"
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-white">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-charcoal-100 rounded-lg">
                <History className="w-5 h-5 text-charcoal-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-charcoal-900">{history.length}</p>
                <p className="text-sm text-charcoal-500">Status Changes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-charcoal-900">Current Status</p>
                <Badge
                  className={cn(
                    'mt-1',
                    STATUS_STYLES[submission.status]?.bg || 'bg-charcoal-100',
                    STATUS_STYLES[submission.status]?.text || 'text-charcoal-600'
                  )}
                >
                  {STATUS_STYLES[submission.status]?.label ||
                    submission.status.replace(/_/g, ' ')}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-charcoal-900">Time in Pipeline</p>
                <p className="text-lg font-semibold text-charcoal-700">
                  {submission.created_at
                    ? formatDistanceToNow(new Date(submission.created_at))
                    : '—'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card className="bg-white">
        <CardContent className="py-6">
          <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider mb-4">
            Status Timeline
          </h3>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-charcoal-200" />

            {/* Timeline entries */}
            <div className="space-y-6">
              {sortedHistory.map((entry, index) => {
                const isRejected = entry.to_status === 'rejected'
                const isWithdrawn = entry.to_status === 'withdrawn'
                const isTerminal = isRejected || isWithdrawn
                const isFirst = index === 0

                return (
                  <div key={entry.id} className="relative flex gap-4">
                    {/* Timeline dot */}
                    <div
                      className={cn(
                        'relative z-10 w-10 h-10 rounded-full flex items-center justify-center',
                        isTerminal
                          ? isRejected
                            ? 'bg-red-500 text-white'
                            : 'bg-charcoal-400 text-white'
                          : isFirst
                            ? 'bg-gold-500 text-white'
                            : 'bg-green-500 text-white'
                      )}
                    >
                      {isRejected ? (
                        <X className="w-5 h-5" />
                      ) : isWithdrawn ? (
                        <AlertCircle className="w-5 h-5" />
                      ) : (
                        <Check className="w-5 h-5" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {entry.from_status && (
                          <>
                            <Badge
                              className={cn(
                                STATUS_STYLES[entry.from_status]?.bg || 'bg-charcoal-100',
                                STATUS_STYLES[entry.from_status]?.text || 'text-charcoal-600'
                              )}
                            >
                              {STATUS_STYLES[entry.from_status]?.label ||
                                entry.from_status.replace(/_/g, ' ')}
                            </Badge>
                            <ArrowRight className="w-4 h-4 text-charcoal-400" />
                          </>
                        )}
                        <Badge
                          className={cn(
                            STATUS_STYLES[entry.to_status]?.bg || 'bg-charcoal-100',
                            STATUS_STYLES[entry.to_status]?.text || 'text-charcoal-600'
                          )}
                        >
                          {STATUS_STYLES[entry.to_status]?.label ||
                            entry.to_status.replace(/_/g, ' ')}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3 mt-2 text-sm text-charcoal-500">
                        <span>
                          {entry.changed_at
                            ? format(new Date(entry.changed_at), 'MMM d, yyyy h:mm a')
                            : '—'}
                        </span>
                        {entry.changedBy && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {entry.changedBy.full_name}
                          </span>
                        )}
                      </div>

                      {entry.reason && (
                        <p className="mt-2 text-sm text-charcoal-600 bg-charcoal-50 p-2 rounded">
                          {entry.reason}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
