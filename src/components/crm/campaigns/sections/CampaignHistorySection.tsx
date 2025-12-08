'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Mail,
  Linkedin,
  Phone,
  FileText,
  CheckCircle,
  Clock,
  User,
  Target,
  Activity,
  Search,
  Calendar,
  MessageSquare,
  TrendingUp,
  Play,
  Pause,
  Edit,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, formatDistanceToNow } from 'date-fns'

interface CampaignHistorySectionProps {
  campaignId: string
}

interface TimelineEvent {
  id: string
  type: 'activity' | 'sequence_log' | 'system'
  timestamp: string
  title: string
  description?: string
  actor?: {
    id: string
    name: string
    avatar?: string
  }
  icon: React.ReactNode
  iconBg: string
  metadata?: Record<string, any>
}

export function CampaignHistorySection({ campaignId }: CampaignHistorySectionProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [eventFilter, setEventFilter] = useState<string>('all')
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null)

  // Fetch activities for this campaign
  const { data: activitiesData } = trpc.crm.activities.listByEntity.useQuery({
    entityType: 'campaign',
    entityId: campaignId,
    limit: 100,
  })

  // Fetch campaign data
  const { data: campaign } = trpc.crm.campaigns.getById.useQuery({ id: campaignId })

  // Build unified timeline
  const buildTimeline = (): TimelineEvent[] => {
    const events: TimelineEvent[] = []

    // Add activities
    if (activitiesData?.items) {
      activitiesData.items.forEach((activity) => {
        events.push({
          id: activity.id,
          type: 'activity',
          timestamp: activity.created_at,
          title: activity.subject || 'Activity logged',
          description: activity.description,
          actor: activity.creator
            ? {
                id: activity.creator.id,
                name: activity.creator.full_name,
                avatar: activity.creator.avatar_url,
              }
            : undefined,
          icon: getActivityIcon(activity.activity_type),
          iconBg: getActivityColor(activity.activity_type),
          metadata: {
            activityType: activity.activity_type,
            outcome: activity.outcome,
          },
        })
      })
    }

    // Add campaign creation event
    if (campaign) {
      events.push({
        id: `system-created-${campaign.id}`,
        type: 'system',
        timestamp: campaign.created_at,
        title: 'Campaign Created',
        description: `Campaign "${campaign.name}" created with ${campaign.channels?.length || 0} channels`,
        actor: campaign.owner
          ? {
              id: campaign.owner.id,
              name: campaign.owner.full_name,
              avatar: campaign.owner.avatar_url,
            }
          : undefined,
        icon: <Zap className="w-4 h-4" />,
        iconBg: 'bg-blue-500',
      })

      // Add status change events (simulated - in production these would come from audit log)
      if (campaign.status === 'active' || campaign.status === 'completed') {
        events.push({
          id: `system-activated-${campaign.id}`,
          type: 'system',
          timestamp: campaign.start_date || campaign.created_at,
          title: 'Campaign Activated',
          description: 'Campaign status changed to active',
          icon: <Play className="w-4 h-4" />,
          iconBg: 'bg-emerald-500',
        })
      }
    }

    // Sort by timestamp descending (newest first)
    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  const timeline = buildTimeline()

  // Filter timeline
  const filteredTimeline = timeline.filter((event) => {
    if (eventFilter !== 'all' && event.type !== eventFilter) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        event.title.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query)
      )
    }
    return true
  })

  // Group by date
  const groupedTimeline = filteredTimeline.reduce((acc, event) => {
    const date = format(new Date(event.timestamp), 'yyyy-MM-dd')
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(event)
    return acc
  }, {} as Record<string, TimelineEvent[]>)

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-heading font-semibold text-charcoal-900">
          Campaign History
        </h2>
        <p className="text-sm text-charcoal-500 mt-1">
          Complete chronological timeline of all campaign events and activities
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
          <Input
            placeholder="Search timeline..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={eventFilter} onValueChange={setEventFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Events" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            <SelectItem value="activity">Activities</SelectItem>
            <SelectItem value="sequence_log">Sequence Actions</SelectItem>
            <SelectItem value="system">System Events</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Timeline */}
      <Card className="p-6">
        {filteredTimeline.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-charcoal-300 mx-auto mb-3" />
            <p className="text-sm text-charcoal-500">
              {searchQuery || eventFilter !== 'all' ? 'No events match your filters' : 'No events yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedTimeline).map(([date, events]) => (
              <div key={date}>
                {/* Date Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-charcoal-700">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(date), 'MMMM d, yyyy')}
                  </div>
                  <div className="flex-1 h-px bg-charcoal-200"></div>
                </div>

                {/* Events for this date */}
                <div className="space-y-0 relative">
                  {/* Timeline line */}
                  <div className="absolute left-[15px] top-0 bottom-0 w-px bg-charcoal-200"></div>

                  {events.map((event, idx) => (
                    <div key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
                      {/* Icon */}
                      <div className="relative z-10 flex-shrink-0">
                        <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-white', event.iconBg)}>
                          {event.icon}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-start justify-between gap-4 mb-1">
                          <div>
                            <h4 className="text-sm font-medium text-charcoal-900">
                              {event.title}
                            </h4>
                            {event.description && (
                              <p className="text-sm text-charcoal-600 mt-1 line-clamp-2">
                                {event.description}
                              </p>
                            )}
                          </div>
                          <Badge variant="outline" className="flex-shrink-0 text-xs capitalize">
                            {event.type.replace('_', ' ')}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-charcoal-500 mt-2">
                          <span>{format(new Date(event.timestamp), 'h:mm a')}</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}</span>
                          {event.actor && (
                            <>
                              <span>•</span>
                              <div className="flex items-center gap-1.5">
                                <User className="w-3 h-3" />
                                <span>{event.actor.name}</span>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Metadata badges */}
                        {event.metadata && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {event.metadata.activityType && (
                              <Badge variant="secondary" className="text-xs capitalize">
                                {event.metadata.activityType.replace('_', ' ')}
                              </Badge>
                            )}
                            {event.metadata.outcome && (
                              <Badge
                                variant="secondary"
                                className={cn(
                                  'text-xs capitalize',
                                  event.metadata.outcome === 'positive' && 'bg-emerald-100 text-emerald-700',
                                  event.metadata.outcome === 'negative' && 'bg-red-100 text-red-700'
                                )}
                              >
                                {event.metadata.outcome}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Export Button */}
      <div className="mt-4 flex justify-end">
        <Button variant="outline" size="sm">
          <FileText className="w-4 h-4 mr-2" />
          Export Timeline
        </Button>
      </div>
    </div>
  )
}

// Helper functions
function getActivityIcon(activityType: string): React.ReactNode {
  switch (activityType) {
    case 'call':
      return <Phone className="w-4 h-4" />
    case 'email':
      return <Mail className="w-4 h-4" />
    case 'meeting':
      return <Calendar className="w-4 h-4" />
    case 'note':
      return <FileText className="w-4 h-4" />
    case 'linkedin_message':
      return <Linkedin className="w-4 h-4" />
    case 'task':
      return <CheckCircle className="w-4 h-4" />
    default:
      return <Activity className="w-4 h-4" />
  }
}

function getActivityColor(activityType: string): string {
  switch (activityType) {
    case 'call':
      return 'bg-purple-500'
    case 'email':
      return 'bg-blue-500'
    case 'meeting':
      return 'bg-amber-500'
    case 'note':
      return 'bg-charcoal-500'
    case 'linkedin_message':
      return 'bg-blue-600'
    case 'task':
      return 'bg-emerald-500'
    default:
      return 'bg-charcoal-400'
  }
}

