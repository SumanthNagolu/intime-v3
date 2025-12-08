'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Phone, Mail, Calendar, Clock, Loader2, FileText } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ActivityInlinePanel } from '../ActivityInlinePanel'
import { InlineActivityForm } from '../InlineActivityForm'
import { cn } from '@/lib/utils'

interface AccountActivitiesSectionProps {
  accountId: string
  onLogActivity?: () => void // Made optional since inline form is primary now
}

/**
 * Activities Section - Isolated component with self-contained query
 * Uses inline panel for detail view (Guidewire pattern)
 *
 * Trigger: Rendered when section === 'activities'
 * DB Call: activities.listByAccount({ accountId })
 */
export function AccountActivitiesSection({ accountId, onLogActivity: _onLogActivity }: AccountActivitiesSectionProps) {
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null)

  // This query fires when this component is rendered
  const activitiesQuery = trpc.crm.activities.listByAccount.useQuery({ accountId })
  const activities = activitiesQuery.data || []

  const handleActivityClick = (activityId: string) => {
    setSelectedActivityId(activityId)
  }

  const handleClosePanel = () => {
    setSelectedActivityId(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Log</CardTitle>
        <CardDescription>Track all interactions with this account</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          {/* Activity list */}
          <div className={cn(
            'flex-1 transition-all duration-300',
            selectedActivityId ? 'max-w-[calc(100%-496px)]' : 'max-w-full'
          )}>
            {/* Inline Activity Form - Guidewire pattern */}
            <div className="mb-4">
              <InlineActivityForm accountId={accountId} />
            </div>

            {activitiesQuery.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
                <p className="text-charcoal-500">No activities logged yet</p>
                <p className="text-sm text-charcoal-400 mt-2">Use the form above to log your first activity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity: any) => (
                  <div
                    key={activity.id}
                    onClick={() => handleActivityClick(activity.id)}
                    className={cn(
                      'flex gap-4 p-4 border rounded-lg cursor-pointer transition-colors',
                      selectedActivityId === activity.id
                        ? 'border-hublot-500 bg-hublot-50'
                        : 'hover:border-hublot-300'
                    )}
                  >
                    <div className="w-10 h-10 rounded-full bg-charcoal-100 flex items-center justify-center flex-shrink-0">
                      {activity.activity_type === 'call' && <Phone className="w-4 h-4" />}
                      {activity.activity_type === 'email' && <Mail className="w-4 h-4" />}
                      {activity.activity_type === 'meeting' && <Calendar className="w-4 h-4" />}
                      {activity.activity_type === 'note' && <FileText className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium capitalize">{activity.activity_type}</p>
                        <span className="text-sm text-charcoal-500">
                          {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      {activity.subject && <p className="font-medium mt-1 truncate">{activity.subject}</p>}
                      {activity.description && (
                        <p className="text-sm text-charcoal-600 mt-1 line-clamp-2">{activity.description}</p>
                      )}
                      {activity.outcome && (
                        <Badge variant="outline" className="mt-2 capitalize">{activity.outcome}</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Inline detail panel */}
          <ActivityInlinePanel
            activityId={selectedActivityId}
            accountId={accountId}
            onClose={handleClosePanel}
          />
        </div>
      </CardContent>
    </Card>
  )
}
