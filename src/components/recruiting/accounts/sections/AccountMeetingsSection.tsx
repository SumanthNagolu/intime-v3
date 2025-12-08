'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Plus, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { MeetingInlinePanel } from '../MeetingInlinePanel'
import { cn } from '@/lib/utils'

interface AccountMeetingsSectionProps {
  accountId: string
  onScheduleMeeting: () => void
}

/**
 * Meetings Section - Isolated component with self-contained query
 * Uses inline panel for detail view (Guidewire pattern)
 *
 * Trigger: Rendered when section === 'meetings'
 * DB Call: meetingNotes.listByAccount({ accountId })
 */
export function AccountMeetingsSection({ accountId, onScheduleMeeting }: AccountMeetingsSectionProps) {
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null)

  // This query fires when this component is rendered
  const meetingsQuery = trpc.crm.meetingNotes.listByAccount.useQuery({ accountId })
  const meetings = meetingsQuery.data || []

  const handleMeetingClick = (meetingId: string) => {
    setSelectedMeetingId(meetingId)
  }

  const handleClosePanel = () => {
    setSelectedMeetingId(null)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Meetings</CardTitle>
          <CardDescription>Scheduled and completed meetings</CardDescription>
        </div>
        <Button onClick={onScheduleMeeting}>
          <Plus className="w-4 h-4 mr-2" />
          Schedule Meeting
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          {/* Meetings list */}
          <div className={cn(
            'flex-1 transition-all duration-300',
            selectedMeetingId ? 'max-w-[calc(100%-576px)]' : 'max-w-full'
          )}>
            {meetingsQuery.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : meetings.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
                <p className="text-charcoal-500">No meetings scheduled</p>
                <Button className="mt-4" onClick={onScheduleMeeting}>
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Meeting
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {meetings.map((meeting: any) => (
                  <div
                    key={meeting.id}
                    onClick={() => handleMeetingClick(meeting.id)}
                    className={cn(
                      'p-4 border rounded-lg cursor-pointer transition-colors',
                      selectedMeetingId === meeting.id
                        ? 'border-hublot-500 bg-hublot-50'
                        : 'hover:border-hublot-300'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{meeting.title}</p>
                        <p className="text-sm text-charcoal-500 capitalize">
                          {meeting.meeting_type.replace('_', ' ')}
                        </p>
                        {meeting.scheduled_at && (
                          <p className="text-sm text-charcoal-600 mt-1">
                            {format(new Date(meeting.scheduled_at), 'PPP p')}
                          </p>
                        )}
                      </div>
                      <Badge variant={meeting.status === 'completed' ? 'default' : 'secondary'}>
                        {meeting.status}
                      </Badge>
                    </div>
                    {meeting.discussion_notes && (
                      <p className="text-sm text-charcoal-600 mt-3 line-clamp-2">
                        {meeting.discussion_notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Inline detail panel */}
          <MeetingInlinePanel
            meetingId={selectedMeetingId}
            accountId={accountId}
            onClose={handleClosePanel}
          />
        </div>
      </CardContent>
    </Card>
  )
}
