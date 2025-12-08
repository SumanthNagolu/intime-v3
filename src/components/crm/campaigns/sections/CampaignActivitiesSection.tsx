'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { trpc } from '@/lib/trpc/client'
import { Phone, Mail, Calendar, FileText, MessageSquare, Linkedin, Loader2, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { InlineCampaignActivityForm } from '../InlineCampaignActivityForm'

interface CampaignActivitiesSectionProps {
  campaignId: string
}

const activityTypeIcons: Record<string, typeof Phone> = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  note: FileText,
  task: FileText,
  linkedin_message: Linkedin,
}

const activityTypeColors: Record<string, string> = {
  call: 'bg-blue-100 text-blue-700',
  email: 'bg-green-100 text-green-700',
  meeting: 'bg-purple-100 text-purple-700',
  note: 'bg-charcoal-100 text-charcoal-700',
  task: 'bg-amber-100 text-amber-700',
  linkedin_message: 'bg-sky-100 text-sky-700',
}

export function CampaignActivitiesSection({ campaignId }: CampaignActivitiesSectionProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null)

  const utils = trpc.useUtils()

  // Fetch activities for this campaign
  const { data: activities, isLoading } = trpc.crm.activities.listByEntity.useQuery({
    entityType: 'campaign',
    entityId: campaignId,
  })

  const handleActivityCreated = () => {
    setShowAddForm(false)
    utils.crm.activities.listByEntity.invalidate({ entityType: 'campaign', entityId: campaignId })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-charcoal-400" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      {/* Add Activity Button / Form */}
      {showAddForm ? (
        <InlineCampaignActivityForm
          campaignId={campaignId}
          onSuccess={handleActivityCreated}
          onCancel={() => setShowAddForm(false)}
        />
      ) : (
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Log Activity
        </Button>
      )}

      {/* Activities Timeline */}
      <div className="space-y-3">
        {activities?.map((activity: {
          id: string
          activity_type: string
          subject?: string
          description?: string
          outcome?: string
          duration_minutes?: number
          created_at: string
          creator?: { id: string; full_name: string; avatar_url?: string }
        }) => {
          const Icon = activityTypeIcons[activity.activity_type] || FileText
          const isSelected = selectedActivityId === activity.id

          return (
            <Card
              key={activity.id}
              className={cn(
                'cursor-pointer transition-all duration-200',
                isSelected && 'ring-2 ring-hublot-500'
              )}
              onClick={() => setSelectedActivityId(isSelected ? null : activity.id)}
            >
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'p-2 rounded-lg',
                    activityTypeColors[activity.activity_type] || 'bg-charcoal-100'
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs capitalize">
                        {activity.activity_type.replace('_', ' ')}
                      </Badge>
                      {activity.outcome && (
                        <Badge
                          variant="secondary"
                          className={cn(
                            'text-xs',
                            activity.outcome === 'positive' && 'bg-green-100 text-green-700',
                            activity.outcome === 'negative' && 'bg-red-100 text-red-700',
                            activity.outcome === 'neutral' && 'bg-charcoal-100 text-charcoal-700'
                          )}
                        >
                          {activity.outcome}
                        </Badge>
                      )}
                      {activity.duration_minutes && (
                        <span className="text-xs text-charcoal-400">
                          {activity.duration_minutes} min
                        </span>
                      )}
                    </div>
                    <h4 className="font-medium mt-1 truncate">{activity.subject || 'No subject'}</h4>
                    {activity.description && (
                      <p className="text-sm text-charcoal-600 mt-1 line-clamp-2">
                        {activity.description}
                      </p>
                    )}
                    <p className="text-xs text-charcoal-400 mt-2">
                      {activity.creator?.full_name} · {format(new Date(activity.created_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {(!activities || activities.length === 0) && (
          <Card>
            <CardContent className="py-8 text-center">
              <MessageSquare className="h-8 w-8 text-charcoal-300 mx-auto mb-2" />
              <p className="text-charcoal-500">No activities yet</p>
              <p className="text-sm text-charcoal-400">Log calls, emails, meetings, and notes to track engagement</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
