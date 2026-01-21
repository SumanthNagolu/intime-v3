'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Calendar, Clock, MapPin, Users, Video, Phone,
  CheckCircle2, XCircle, AlertTriangle, Plus,
  ArrowRight, ExternalLink, Building2,
} from 'lucide-react'
import type { LeadMeeting } from '@/types/lead'
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns'
import { cn } from '@/lib/utils'

interface LeadMeetingsSectionProps {
  meetings: LeadMeeting[]
  leadId: string
  onScheduleMeeting?: () => void
}

/**
 * LeadMeetingsSection - Scheduled and past meetings
 * Displays upcoming meetings, meeting history, and allows scheduling new meetings
 */
export function LeadMeetingsSection({
  meetings,
  leadId,
  onScheduleMeeting,
}: LeadMeetingsSectionProps) {
  // Separate upcoming and past meetings
  const upcomingMeetings = meetings
    .filter(m => !isPast(new Date(m.scheduledAt)) && m.status !== 'cancelled')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())

  const pastMeetings = meetings
    .filter(m => isPast(new Date(m.scheduledAt)) || m.status === 'cancelled')
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())

  // Animation delay helper
  const getDelay = (index: number) => ({ animationDelay: `${index * 75}ms` })

  return (
    <div className="space-y-6">
      {/* Header with Schedule Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-charcoal-900">Meetings</h2>
          <p className="text-sm text-charcoal-500">
            {meetings.length} meeting{meetings.length !== 1 ? 's' : ''} total
          </p>
        </div>
        {onScheduleMeeting && (
          <Button onClick={onScheduleMeeting} className="bg-charcoal-900 hover:bg-charcoal-800">
            <Plus className="h-4 w-4 mr-1" />
            Schedule Meeting
          </Button>
        )}
      </div>

      {/* Upcoming Meetings */}
      <div
        className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-fade-in"
        style={getDelay(0)}
      >
        <div className="px-6 py-4 border-b border-charcoal-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Upcoming Meetings</h3>
                <p className="text-xs text-charcoal-500">Scheduled meetings with this lead</p>
              </div>
            </div>
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              {upcomingMeetings.length} upcoming
            </Badge>
          </div>
        </div>
        <div className="divide-y divide-charcoal-100">
          {upcomingMeetings.length > 0 ? (
            upcomingMeetings.map((meeting, idx) => (
              <MeetingRow key={meeting.id} meeting={meeting} index={idx} isUpcoming />
            ))
          ) : (
            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-full bg-charcoal-100 flex items-center justify-center mx-auto mb-3">
                <Calendar className="h-7 w-7 text-charcoal-400" />
              </div>
              <p className="text-sm text-charcoal-500">No upcoming meetings</p>
              <p className="text-xs text-charcoal-400 mt-0.5">Schedule a meeting to follow up with this lead</p>
              {onScheduleMeeting && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={onScheduleMeeting}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Schedule Meeting
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Past Meetings */}
      <div
        className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up"
        style={getDelay(1)}
      >
        <div className="px-6 py-4 border-b border-charcoal-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-charcoal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Meeting History</h3>
                <p className="text-xs text-charcoal-500">Past meetings and outcomes</p>
              </div>
            </div>
            <Badge variant="outline" className="text-charcoal-600">
              {pastMeetings.length} past
            </Badge>
          </div>
        </div>
        <div className="divide-y divide-charcoal-100">
          {pastMeetings.length > 0 ? (
            pastMeetings.map((meeting, idx) => (
              <MeetingRow key={meeting.id} meeting={meeting} index={idx} isUpcoming={false} />
            ))
          ) : (
            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-full bg-charcoal-100 flex items-center justify-center mx-auto mb-3">
                <Clock className="h-7 w-7 text-charcoal-400" />
              </div>
              <p className="text-sm text-charcoal-500">No meeting history</p>
              <p className="text-xs text-charcoal-400 mt-0.5">Past meetings will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Meeting Statistics */}
      {meetings.length > 0 && (
        <div
          className="rounded-xl border border-charcoal-200/60 bg-charcoal-50 shadow-elevation-sm overflow-hidden animate-slide-up"
          style={getDelay(2)}
        >
          <div className="px-6 py-4 border-b border-charcoal-200/60">
            <h3 className="font-semibold text-charcoal-900 text-sm">Meeting Statistics</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-4 gap-4">
              <StatCard
                label="Total"
                value={meetings.length}
                icon={Calendar}
              />
              <StatCard
                label="Completed"
                value={meetings.filter(m => m.status === 'completed').length}
                icon={CheckCircle2}
                color="success"
              />
              <StatCard
                label="No-shows"
                value={meetings.filter(m => m.status === 'no_show').length}
                icon={AlertTriangle}
                color="warning"
              />
              <StatCard
                label="Cancelled"
                value={meetings.filter(m => m.status === 'cancelled').length}
                icon={XCircle}
                color="error"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function MeetingRow({
  meeting,
  index,
  isUpcoming,
}: {
  meeting: LeadMeeting
  index: number
  isUpcoming: boolean
}) {
  const meetingDate = new Date(meeting.scheduledAt)
  const isMeetingToday = isToday(meetingDate)
  const isMeetingTomorrow = isTomorrow(meetingDate)

  const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    scheduled: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      icon: <Calendar className="h-3.5 w-3.5" />,
    },
    completed: {
      bg: 'bg-success-50',
      text: 'text-success-700',
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    },
    cancelled: {
      bg: 'bg-charcoal-100',
      text: 'text-charcoal-600',
      icon: <XCircle className="h-3.5 w-3.5" />,
    },
    no_show: {
      bg: 'bg-error-50',
      text: 'text-error-700',
      icon: <AlertTriangle className="h-3.5 w-3.5" />,
    },
  }
  const config = statusConfig[meeting.status] || statusConfig.scheduled

  const typeIcon = getMeetingTypeIcon(meeting.type)

  return (
    <div
      className={cn(
        "flex items-center gap-4 px-6 py-4 transition-colors group cursor-pointer",
        isUpcoming && isMeetingToday ? "bg-blue-50/50 hover:bg-blue-50" :
        isUpcoming && isMeetingTomorrow ? "bg-amber-50/30 hover:bg-amber-50/50" :
        "hover:bg-charcoal-50/50"
      )}
      style={{ animationDelay: `${(index + 1) * 50}ms` }}
    >
      {/* Meeting Type Icon */}
      <div className={cn(
        "w-10 h-10 rounded-lg flex items-center justify-center",
        isUpcoming ? "bg-blue-100" : "bg-charcoal-100"
      )}>
        {typeIcon}
      </div>

      {/* Meeting Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-charcoal-900 truncate">{meeting.subject}</p>
        <div className="flex items-center gap-3 mt-1">
          <Badge className={cn("text-xs", config.bg, config.text)}>
            {config.icon}
            <span className="ml-1 capitalize">{meeting.status.replace(/_/g, ' ')}</span>
          </Badge>
          <span className="text-xs text-charcoal-500 capitalize">{meeting.type}</span>
          {meeting.attendees.length > 0 && (
            <span className="text-xs text-charcoal-500 flex items-center gap-1">
              <Users className="h-3 w-3" />
              {meeting.attendees.length}
            </span>
          )}
        </div>
      </div>

      {/* Date/Time */}
      <div className="text-right shrink-0">
        <p className="text-sm font-medium text-charcoal-900">
          {isMeetingToday ? 'Today' : isMeetingTomorrow ? 'Tomorrow' : format(meetingDate, 'MMM d')}
        </p>
        <p className="text-xs text-charcoal-500">
          {format(meetingDate, 'h:mm a')}
          {meeting.duration && ` · ${meeting.duration}m`}
        </p>
      </div>

      {/* Location */}
      {meeting.location && (
        <div className="shrink-0">
          <LocationBadge location={meeting.location} />
        </div>
      )}

      <ArrowRight className="h-4 w-4 text-charcoal-300 group-hover:text-charcoal-500 group-hover:translate-x-0.5 transition-all shrink-0" />
    </div>
  )
}

function LocationBadge({ location }: { location: string }) {
  const isVirtual = location.toLowerCase().includes('zoom') ||
    location.toLowerCase().includes('meet') ||
    location.toLowerCase().includes('teams') ||
    location.toLowerCase().includes('http')

  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs",
        isVirtual ? "text-blue-600 border-blue-200" : "text-charcoal-600"
      )}
    >
      {isVirtual ? <Video className="h-3 w-3 mr-1" /> : <MapPin className="h-3 w-3 mr-1" />}
      {isVirtual ? 'Virtual' : 'In-person'}
    </Badge>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  color?: 'success' | 'warning' | 'error'
}) {
  const colorConfig = {
    success: 'text-success-600 bg-success-100',
    warning: 'text-amber-600 bg-amber-100',
    error: 'text-error-600 bg-error-100',
    default: 'text-charcoal-600 bg-charcoal-100',
  }
  const iconColor = color ? colorConfig[color] : colorConfig.default

  return (
    <div className="text-center p-4 rounded-lg bg-white border border-charcoal-200/60">
      <div className={cn("w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center", iconColor.split(' ')[1])}>
        <Icon className={cn("h-5 w-5", iconColor.split(' ')[0])} />
      </div>
      <p className="text-2xl font-bold text-charcoal-900">{value}</p>
      <p className="text-xs text-charcoal-500">{label}</p>
    </div>
  )
}

function getMeetingTypeIcon(type: string): React.ReactNode {
  const typeIcons: Record<string, React.ReactNode> = {
    discovery: <Phone className="h-5 w-5 text-blue-500" />,
    demo: <Video className="h-5 w-5 text-purple-500" />,
    follow_up: <Calendar className="h-5 w-5 text-amber-500" />,
    negotiation: <Building2 className="h-5 w-5 text-green-500" />,
    closing: <CheckCircle2 className="h-5 w-5 text-success-500" />,
  }
  return typeIcons[type.toLowerCase()] || <Calendar className="h-5 w-5 text-charcoal-500" />
}

export default LeadMeetingsSection
