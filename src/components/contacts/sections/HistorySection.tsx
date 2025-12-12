'use client'

import { useState } from 'react'
import { formatDistanceToNow, format } from 'date-fns'
import {
  History,
  ArrowRight,
  User,
  Activity,
  Loader2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/components/pcf/shared/EmptyState'

interface HistorySectionProps {
  contactId: string
}

// Change type styling
const changeTypeConfig: Record<string, { label: string; color: string }> = {
  status_change: { label: 'Status', color: 'bg-blue-100 text-blue-700' },
  stage_change: { label: 'Stage', color: 'bg-purple-100 text-purple-700' },
  owner_change: { label: 'Owner', color: 'bg-amber-100 text-amber-700' },
  assignment_change: { label: 'Assignment', color: 'bg-cyan-100 text-cyan-700' },
  score_change: { label: 'Score', color: 'bg-green-100 text-green-700' },
  priority_change: { label: 'Priority', color: 'bg-red-100 text-red-700' },
  category_change: { label: 'Category', color: 'bg-teal-100 text-teal-700' },
  workflow_step: { label: 'Workflow', color: 'bg-indigo-100 text-indigo-700' },
  custom: { label: 'Change', color: 'bg-charcoal-100 text-charcoal-700' },
}

export function HistorySection({ contactId }: HistorySectionProps) {
  const [showAll, setShowAll] = useState(false)

  // Fetch unified timeline (history + activities)
  const timelineQuery = trpc.history.getEntityTimeline.useQuery({
    entityType: 'contact',
    entityId: contactId,
    limit: showAll ? 100 : 20,
  })

  const timeline = timelineQuery.data || []

  if (timelineQuery.isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-charcoal-400" />
      </div>
    )
  }

  if (timeline.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          config={{
            icon: History,
            title: 'No History Yet',
            description: 'Changes to this contact will be tracked here automatically.',
          }}
          variant="inline"
        />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-charcoal-900 flex items-center gap-2">
          <History className="w-5 h-5" />
          Change History
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => timelineQuery.refetch()}
          disabled={timelineQuery.isFetching}
        >
          <RefreshCw className={cn('w-4 h-4', timelineQuery.isFetching && 'animate-spin')} />
        </Button>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {timeline.map((item) => (
          <Card key={item.id} className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                  item.type === 'history' ? 'bg-blue-100' : 'bg-green-100'
                )}>
                  {item.type === 'history' ? (
                    <ArrowRight className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Activity className="w-4 h-4 text-green-600" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {item.type === 'history' && item.changeType && (
                      <Badge className={cn('text-xs', changeTypeConfig[item.changeType]?.color || 'bg-charcoal-100')}>
                        {changeTypeConfig[item.changeType]?.label || item.changeType}
                      </Badge>
                    )}
                    {item.type === 'activity' && item.activityType && (
                      <Badge variant="outline" className="text-xs capitalize">
                        {item.activityType}
                      </Badge>
                    )}
                    {item.type === 'activity' && item.status && (
                      <Badge
                        className={cn(
                          'text-xs',
                          item.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-charcoal-100 text-charcoal-600'
                        )}
                      >
                        {item.status}
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-charcoal-700 mt-1">
                    {item.event}
                  </p>

                  <div className="flex items-center gap-3 mt-2 text-xs text-charcoal-400">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {item.userId ? 'User' : 'System'}
                    </span>
                    <span>
                      {item.timestamp
                        ? formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })
                        : '—'}
                    </span>
                    {item.timestamp && (
                      <span className="text-charcoal-300">
                        {format(new Date(item.timestamp), 'MMM d, yyyy h:mm a')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Show More/Less */}
      {timeline.length >= 20 && (
        <div className="flex justify-center pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1" />
                Show More
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
