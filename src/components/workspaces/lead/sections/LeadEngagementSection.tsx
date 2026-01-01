'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Mail, Phone, Calendar, MessageSquare, Linkedin,
  CheckCircle2, Clock
} from 'lucide-react'
import type { LeadEngagement } from '@/types/lead'
import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns'

interface LeadEngagementSectionProps {
  engagement: LeadEngagement[]
  leadId: string
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  email: Mail,
  call: Phone,
  meeting: Calendar,
  note: MessageSquare,
  linkedin: Linkedin,
  linkedin_message: Linkedin,
  task: CheckCircle2,
  follow_up: Clock,
}

const TYPE_COLORS: Record<string, string> = {
  email: 'bg-blue-100 text-blue-600',
  call: 'bg-green-100 text-green-600',
  meeting: 'bg-purple-100 text-purple-600',
  note: 'bg-charcoal-100 text-charcoal-600',
  linkedin: 'bg-blue-100 text-blue-600',
  linkedin_message: 'bg-blue-100 text-blue-600',
  task: 'bg-amber-100 text-amber-600',
  follow_up: 'bg-orange-100 text-orange-600',
}

export function LeadEngagementSection({ engagement }: LeadEngagementSectionProps) {
  // Group activities by date
  const groupedEngagement = React.useMemo(() => {
    const groups: Record<string, LeadEngagement[]> = {}

    engagement.forEach((item) => {
      const date = parseISO(item.createdAt)
      let key: string

      if (isToday(date)) {
        key = 'Today'
      } else if (isYesterday(date)) {
        key = 'Yesterday'
      } else {
        key = format(date, 'MMMM d, yyyy')
      }

      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(item)
    })

    return groups
  }, [engagement])

  if (engagement.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Clock className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
          <h3 className="text-lg font-medium text-charcoal-600 mb-2">No Engagement Yet</h3>
          <p className="text-charcoal-500">
            Start logging activities to track your engagement with this lead.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-heading">
          Engagement Timeline ({engagement.length} interactions)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-charcoal-200" />

          {/* Timeline items */}
          <div className="space-y-8">
            {Object.entries(groupedEngagement).map(([date, items]) => (
              <div key={date}>
                <h3 className="text-sm font-medium text-charcoal-500 mb-4 ml-10">{date}</h3>
                <div className="space-y-4">
                  {items.map((item) => {
                    const Icon = TYPE_ICONS[item.type] || MessageSquare
                    const colorClass = TYPE_COLORS[item.type] || 'bg-charcoal-100 text-charcoal-600'

                    return (
                      <div key={item.id} className="flex gap-4">
                        {/* Icon */}
                        <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${colorClass}`}>
                          <Icon className="w-4 h-4" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-charcoal-900">{item.subject}</p>
                              {item.description && (
                                <p className="text-sm text-charcoal-600 mt-1">{item.description}</p>
                              )}
                              {item.outcome && (
                                <p className="text-sm text-charcoal-500 mt-1">
                                  Outcome: {item.outcome}
                                </p>
                              )}
                            </div>
                            <time className="text-xs text-charcoal-400 whitespace-nowrap ml-4">
                              {format(parseISO(item.createdAt), 'h:mm a')}
                            </time>
                          </div>
                          <p className="text-xs text-charcoal-400 mt-1">
                            by {item.createdBy}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
