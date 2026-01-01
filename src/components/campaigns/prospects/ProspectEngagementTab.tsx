'use client'

import { format } from 'date-fns'
import { Mail, MousePointerClick, MessageSquare, Send, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CampaignProspect } from '@/types/campaign'

interface ProspectEngagementTabProps {
  prospect: CampaignProspect
}

/**
 * ProspectEngagementTab - Engagement metrics for a campaign prospect
 *
 * Displays:
 * - Engagement score (0-100)
 * - Metrics: emails sent/opened, links clicked, replies received
 * - Engagement timeline: first contacted, opened, clicked, responded
 */
export function ProspectEngagementTab({ prospect }: ProspectEngagementTabProps) {
  const engagementScore = prospect.engagementScore || 0

  // Engagement score color
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600 bg-green-50'
    if (score >= 40) return 'text-amber-600 bg-amber-50'
    return 'text-charcoal-500 bg-charcoal-50'
  }

  const metrics = [
    {
      label: 'Emails Sent',
      value: prospect.emailsSent || 0,
      icon: Send,
      color: 'text-blue-500',
    },
    {
      label: 'Opened',
      value: prospect.emailsOpened || 0,
      icon: Mail,
      color: 'text-indigo-500',
    },
    {
      label: 'Clicked',
      value: prospect.linksClicked || 0,
      icon: MousePointerClick,
      color: 'text-purple-500',
    },
    {
      label: 'Replied',
      value: prospect.repliesReceived || 0,
      icon: MessageSquare,
      color: 'text-green-500',
    },
  ]

  const timeline = [
    {
      label: 'First Contacted',
      date: prospect.firstContactedAt,
      isCompleted: !!prospect.firstContactedAt,
    },
    {
      label: 'Opened',
      date: prospect.openedAt,
      isCompleted: !!prospect.openedAt,
    },
    {
      label: 'Clicked',
      date: prospect.clickedAt,
      isCompleted: !!prospect.clickedAt,
    },
    {
      label: 'Responded',
      date: prospect.respondedAt,
      isCompleted: !!prospect.respondedAt,
    },
  ]

  return (
    <div className="py-4 space-y-6">
      {/* Engagement Score */}
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold',
            getScoreColor(engagementScore)
          )}
        >
          {engagementScore}
        </div>
        <div>
          <p className="text-sm font-medium text-charcoal-900">Engagement Score</p>
          <p className="text-xs text-charcoal-500">
            {engagementScore >= 70 ? 'Highly engaged' :
             engagementScore >= 40 ? 'Moderately engaged' : 'Low engagement'}
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-4 gap-3">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <div
              key={metric.label}
              className="bg-charcoal-50 rounded-lg p-3 text-center"
            >
              <Icon className={cn('w-5 h-5 mx-auto mb-1', metric.color)} />
              <p className="text-lg font-bold text-charcoal-900">{metric.value}</p>
              <p className="text-xs text-charcoal-500">{metric.label}</p>
            </div>
          )
        })}
      </div>

      {/* Engagement Timeline */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-charcoal-700">Engagement Timeline</p>
        <div className="space-y-2">
          {timeline.map((item, index) => (
            <div
              key={item.label}
              className={cn(
                'flex items-center justify-between py-2 px-3 rounded-lg',
                item.isCompleted ? 'bg-green-50' : 'bg-charcoal-50'
              )}
            >
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'w-2 h-2 rounded-full',
                    item.isCompleted ? 'bg-green-500' : 'bg-charcoal-300'
                  )}
                />
                <span
                  className={cn(
                    'text-sm',
                    item.isCompleted ? 'text-charcoal-900' : 'text-charcoal-500'
                  )}
                >
                  {item.label}
                </span>
              </div>
              {item.date && (
                <span className="text-xs text-charcoal-500">
                  {format(new Date(item.date), 'MMM d, h:mm a')}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
