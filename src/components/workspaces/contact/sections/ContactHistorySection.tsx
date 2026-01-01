'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { History, Circle, ArrowRight } from 'lucide-react'
import type { HistoryEntry } from '@/types/workspace'
import { formatDistanceToNow, format } from 'date-fns'

interface ContactHistorySectionProps {
  history: HistoryEntry[]
}

const ACTION_STYLES: Record<string, string> = {
  create: 'bg-success-100 text-success-700',
  update: 'bg-blue-100 text-blue-700',
  delete: 'bg-error-100 text-error-700',
  restore: 'bg-amber-100 text-amber-700',
}

/**
 * ContactHistorySection - Shows audit trail/changelog
 */
export function ContactHistorySection({ history }: ContactHistorySectionProps) {
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

  const sortedDates = Object.keys(groupedHistory).sort((a, b) => b.localeCompare(a))

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Change History ({history.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="py-8 text-center text-charcoal-500">
              <History className="h-8 w-8 mx-auto mb-2 text-charcoal-300" />
              <p>No history available</p>
              <p className="text-sm mt-1">Changes to this contact will be tracked here.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedDates.map((date) => (
                <div key={date}>
                  <h4 className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-3">
                    {format(new Date(date), 'MMMM d, yyyy')}
                  </h4>
                  <div className="space-y-3">
                    {groupedHistory[date].map((entry) => (
                      <HistoryRow key={entry.id} entry={entry} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function HistoryRow({ entry }: { entry: HistoryEntry }) {
  const actionStyle = ACTION_STYLES[entry.action] || 'bg-charcoal-100 text-charcoal-600'

  const renderChange = () => {
    if (!entry.field) {
      return <span className="capitalize">{entry.action} contact</span>
    }

    const fieldLabel = entry.field.replace(/_/g, ' ')

    if (entry.action === 'create') {
      return (
        <>
          Set <span className="font-medium">{fieldLabel}</span> to{' '}
          <span className="font-medium text-charcoal-900">{entry.newValue || 'empty'}</span>
        </>
      )
    }

    return (
      <span className="flex items-center gap-1 flex-wrap">
        Changed <span className="font-medium">{fieldLabel}</span>
        {entry.oldValue && (
          <>
            {' from '}
            <span className="font-medium text-charcoal-900">{entry.oldValue}</span>
          </>
        )}
        <ArrowRight className="h-3 w-3 text-charcoal-400" />
        <span className="font-medium text-charcoal-900">{entry.newValue || 'empty'}</span>
      </span>
    )
  }

  return (
    <div className="flex items-start gap-3 text-sm">
      <div className="w-1.5 h-1.5 rounded-full bg-charcoal-300 mt-2 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-charcoal-700">{renderChange()}</div>
        <div className="text-xs text-charcoal-500 mt-0.5">
          {entry.changedBy} \u2022{' '}
          {formatDistanceToNow(new Date(entry.changedAt), { addSuffix: true })}
        </div>
      </div>
      <span className={`text-xs px-2 py-0.5 rounded capitalize ${actionStyle}`}>
        {entry.action}
      </span>
    </div>
  )
}

export default ContactHistorySection
