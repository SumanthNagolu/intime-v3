'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, Clock, MapPin, Users, Video, Phone, Building2, 
  Plus, Search, MoreVertical, CheckCircle, XCircle, 
  ArrowRight, X, ChevronLeft, ChevronRight, FileText,
  Smile, Meh, Frown, MessageSquare, ListTodo, User,
  ExternalLink, RefreshCw, Pencil
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { AccountMeeting, MeetingType, MeetingStatus, ClientSatisfaction, MeetingActionItem } from '@/types/workspace'
import { cn } from '@/lib/utils'
import { format, formatDistanceToNow, isPast, isFuture, isToday } from 'date-fns'
import { EditMeetingDialog } from '@/components/recruiting/accounts/EditMeetingDialog'

// Constants
const ITEMS_PER_PAGE = 10

interface AccountMeetingsSectionProps {
  meetings: AccountMeeting[]
  accountId: string
}

type StatusFilter = 'all' | 'upcoming' | 'completed' | 'cancelled'

// Meeting type configuration
const MEETING_TYPE_CONFIG: Record<MeetingType, { label: string; icon: React.ElementType; bg: string; text: string }> = {
  check_in: { label: 'Check-in', icon: MessageSquare, bg: 'bg-blue-50', text: 'text-blue-700' },
  qbr: { label: 'QBR', icon: FileText, bg: 'bg-purple-50', text: 'text-purple-700' },
  kick_off: { label: 'Kick-off', icon: Calendar, bg: 'bg-green-50', text: 'text-green-700' },
  project_review: { label: 'Project Review', icon: ListTodo, bg: 'bg-amber-50', text: 'text-amber-700' },
  escalation_review: { label: 'Escalation Review', icon: MessageSquare, bg: 'bg-red-50', text: 'text-red-700' },
  sales_pitch: { label: 'Sales Pitch', icon: Building2, bg: 'bg-gold-50', text: 'text-gold-700' },
  other: { label: 'Other', icon: Calendar, bg: 'bg-charcoal-100', text: 'text-charcoal-600' },
}

// Status configuration
const STATUS_CONFIG: Record<MeetingStatus, { label: string; bg: string; text: string; dot: string }> = {
  scheduled: { label: 'Scheduled', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  in_progress: { label: 'In Progress', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  completed: { label: 'Completed', bg: 'bg-success-50', text: 'text-success-700', dot: 'bg-success-500' },
  cancelled: { label: 'Cancelled', bg: 'bg-charcoal-100', text: 'text-charcoal-600', dot: 'bg-charcoal-400' },
  rescheduled: { label: 'Rescheduled', bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
}

// Location type icons
const LOCATION_TYPE_ICONS: Record<string, React.ElementType> = {
  video: Video,
  phone: Phone,
  in_person: Building2,
  other: MapPin,
}

// Client satisfaction icons and colors
const SATISFACTION_CONFIG: Record<ClientSatisfaction, { icon: React.ElementType; color: string; label: string }> = {
  very_satisfied: { icon: Smile, color: 'text-green-600', label: 'Very Satisfied' },
  satisfied: { icon: Smile, color: 'text-green-500', label: 'Satisfied' },
  neutral: { icon: Meh, color: 'text-charcoal-500', label: 'Neutral' },
  dissatisfied: { icon: Frown, color: 'text-amber-600', label: 'Dissatisfied' },
  very_dissatisfied: { icon: Frown, color: 'text-red-600', label: 'Very Dissatisfied' },
}

// Format duration in minutes to human readable
function formatDuration(minutes: number | null): string {
  if (!minutes) return '—'
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

/**
 * AccountMeetingsSection - Premium SaaS-level meeting list
 * Features: Search, filters, pagination, calendar-style dates, detail panel
 */
export function AccountMeetingsSection({ meetings, accountId }: AccountMeetingsSectionProps) {
  const [selectedMeeting, setSelectedMeeting] = React.useState<AccountMeeting | null>(null)
  const [editingMeeting, setEditingMeeting] = React.useState<AccountMeeting | null>(null)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('all')
  const [currentPage, setCurrentPage] = React.useState(1)

  // Calculate status counts
  const statusCounts = React.useMemo(() => {
    const now = new Date()
    return {
      all: meetings.length,
      upcoming: meetings.filter(m => m.status === 'scheduled' && isFuture(new Date(m.date))).length,
      completed: meetings.filter(m => m.status === 'completed').length,
      cancelled: meetings.filter(m => m.status === 'cancelled' || m.status === 'rescheduled').length,
    }
  }, [meetings])

  // Filter meetings based on search and status
  const filteredMeetings = React.useMemo(() => {
    let result = meetings
    
    // Status filter
    if (statusFilter === 'upcoming') {
      result = result.filter(m => m.status === 'scheduled' && isFuture(new Date(m.date)))
    } else if (statusFilter === 'completed') {
      result = result.filter(m => m.status === 'completed')
    } else if (statusFilter === 'cancelled') {
      result = result.filter(m => m.status === 'cancelled' || m.status === 'rescheduled')
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(m => 
        m.subject.toLowerCase().includes(q) ||
        m.organizer?.toLowerCase().includes(q) ||
        m.location?.toLowerCase().includes(q) ||
        m.agenda?.toLowerCase().includes(q)
      )
    }
    
    return result
  }, [meetings, searchQuery, statusFilter])

  // Pagination
  const totalPages = Math.ceil(filteredMeetings.length / ITEMS_PER_PAGE)
  const paginatedMeetings = React.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredMeetings.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredMeetings, currentPage])

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter])

  const handleRowClick = (meeting: AccountMeeting) => {
    if (selectedMeeting?.id === meeting.id) {
      setSelectedMeeting(null)
    } else {
      setSelectedMeeting(meeting)
    }
  }

  // Get meeting time status (upcoming, today, past)
  const getMeetingTimeStatus = (dateStr: string) => {
    const date = new Date(dateStr)
    if (isToday(date)) return { label: 'Today', color: 'text-gold-600', bg: 'bg-gold-50' }
    if (isFuture(date)) return { label: 'Upcoming', color: 'text-blue-600', bg: 'bg-blue-50' }
    return { label: 'Past', color: 'text-charcoal-500', bg: '' }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Premium List Card */}
      <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden">
        {/* Header with gradient */}
        <div className="px-5 py-4 border-b border-charcoal-100 bg-gradient-to-r from-charcoal-50/80 via-white to-purple-50/30">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-sm">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Meetings</h3>
                <p className="text-xs text-charcoal-500">
                  {filteredMeetings.length} meeting{filteredMeetings.length !== 1 ? 's' : ''} for this account
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
                <Input
                  placeholder="Search meetings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 w-64 text-sm border-charcoal-200 focus:border-purple-400 focus:ring-purple-400/20"
                />
              </div>
              <Button 
                size="sm"
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-sm font-medium"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('openAccountDialog', { 
                    detail: { dialogId: 'scheduleMeeting', accountId } 
                  }))
                }}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Schedule Meeting
              </Button>
            </div>
          </div>

          {/* Status Filter Pills */}
          {meetings.length > 0 && (
            <div className="flex items-center gap-2 mt-4">
              {[
                { key: 'all', label: 'All', count: statusCounts.all },
                { key: 'upcoming', label: 'Upcoming', count: statusCounts.upcoming },
                { key: 'completed', label: 'Completed', count: statusCounts.completed },
                { key: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled },
              ].filter(f => f.count > 0 || f.key === 'all').map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setStatusFilter(filter.key as StatusFilter)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    statusFilter === filter.key
                      ? "bg-charcoal-900 text-white shadow-sm"
                      : "bg-charcoal-100 text-charcoal-600 hover:bg-charcoal-200"
                  )}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-[60px_1fr_100px_90px_80px_90px_70px] gap-2 px-4 py-2.5 bg-charcoal-50/80 border-b border-charcoal-200/60 text-[10px] font-bold text-charcoal-400 uppercase tracking-[0.1em]">
          <div className="text-center">Date</div>
          <div>Meeting</div>
          <div>Type</div>
          <div className="text-center">Status</div>
          <div className="text-center">Duration</div>
          <div className="text-center">Location</div>
          <div className="text-right">Actions</div>
        </div>

        {/* Table Body */}
        {paginatedMeetings.length > 0 ? (
          <div className="divide-y divide-charcoal-100/40">
            {paginatedMeetings.map((meeting) => {
              const meetingDate = new Date(meeting.date)
              const statusConfig = STATUS_CONFIG[meeting.status] || STATUS_CONFIG.scheduled
              const typeConfig = MEETING_TYPE_CONFIG[meeting.meetingType] || MEETING_TYPE_CONFIG.other
              const TypeIcon = typeConfig.icon
              const LocationIcon = LOCATION_TYPE_ICONS[meeting.locationType || 'other'] || MapPin
              const timeStatus = getMeetingTimeStatus(meeting.date)

              return (
                <div
                  key={meeting.id}
                  onClick={() => handleRowClick(meeting)}
                  className={cn(
                    'group grid grid-cols-[60px_1fr_100px_90px_80px_90px_70px] gap-2 px-4 py-3 cursor-pointer transition-all duration-150 items-center',
                    selectedMeeting?.id === meeting.id 
                      ? 'bg-purple-50/80 border-l-2 border-l-purple-500' 
                      : 'hover:bg-charcoal-50/60 border-l-2 border-l-transparent'
                  )}
                >
                  {/* Calendar Date Card */}
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-12 h-14 rounded-lg border flex flex-col items-center justify-center transition-shadow",
                      timeStatus.bg || 'bg-white',
                      selectedMeeting?.id === meeting.id ? 'shadow-md border-purple-200' : 'border-charcoal-200/60'
                    )}>
                      <span className={cn("text-[10px] font-bold uppercase tracking-wider", timeStatus.color)}>
                        {format(meetingDate, 'MMM')}
                      </span>
                      <span className="text-xl font-black text-charcoal-800 leading-tight">
                        {format(meetingDate, 'd')}
                      </span>
                    </div>
                  </div>

                  {/* Meeting Info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-charcoal-900 truncate">{meeting.subject}</span>
                      {isToday(meetingDate) && meeting.status === 'scheduled' && (
                        <Badge className="bg-gold-100 text-gold-800 text-[9px] px-1.5">TODAY</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-[11px] text-charcoal-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(meetingDate, 'h:mm a')}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {meeting.organizer}
                      </span>
                      {meeting.clientSatisfaction && (
                        <span className="flex items-center gap-1">
                          {(() => {
                            const config = SATISFACTION_CONFIG[meeting.clientSatisfaction]
                            const SatIcon = config.icon
                            return <SatIcon className={cn("h-3 w-3", config.color)} />
                          })()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Type Badge */}
                  <div>
                    <Badge 
                      variant="outline"
                      className={cn(
                        "text-[10px] font-semibold px-2 py-0.5 border-0",
                        typeConfig.bg,
                        typeConfig.text
                      )}
                    >
                      <TypeIcon className="h-3 w-3 mr-1" />
                      {typeConfig.label}
                    </Badge>
                  </div>
                  
                  {/* Status */}
                  <div className="text-center">
                    <Badge 
                      variant="outline"
                      className={cn(
                        "text-[10px] font-semibold px-1.5 py-0 border-0",
                        statusConfig.bg,
                        statusConfig.text
                      )}
                    >
                      <span className={cn("w-1 h-1 rounded-full mr-1", statusConfig.dot)} />
                      {statusConfig.label}
                    </Badge>
                  </div>
                  
                  {/* Duration */}
                  <div className="text-center">
                    <span className="text-sm font-medium text-charcoal-700 tabular-nums">
                      {formatDuration(meeting.durationMinutes)}
                    </span>
                  </div>

                  {/* Location */}
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center gap-1 text-xs text-charcoal-500">
                      <LocationIcon className="h-3.5 w-3.5" />
                      <span className="capitalize">{meeting.locationType?.replace('_', ' ') || 'TBD'}</span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4 text-charcoal-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); /* View meeting */ }}>
                          <ExternalLink className="h-3.5 w-3.5 mr-2 text-charcoal-500" />
                          View Details
                        </DropdownMenuItem>
                        {meeting.status === 'scheduled' && (
                          <>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); /* Reschedule */ }}>
                              <RefreshCw className="h-3.5 w-3.5 mr-2 text-charcoal-500" />
                              Reschedule
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); /* Cancel */ }}>
                              <XCircle className="h-3.5 w-3.5 mr-2 text-charcoal-500" />
                              Cancel Meeting
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-charcoal-100 to-charcoal-50 flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-charcoal-400" />
            </div>
            <p className="text-base font-medium text-charcoal-700">
              {searchQuery || statusFilter !== 'all' ? 'No meetings match your filters' : 'No meetings scheduled'}
            </p>
            <p className="text-sm text-charcoal-500 mt-1">
              {searchQuery || statusFilter !== 'all' ? 'Try different search terms or filters' : 'Schedule your first meeting to get started'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Button 
                size="sm" 
                className="mt-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('openAccountDialog', { 
                    detail: { dialogId: 'scheduleMeeting', accountId } 
                  }))
                }}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Schedule First Meeting
              </Button>
            )}
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-charcoal-100 bg-charcoal-50/30 flex items-center justify-between">
            <p className="text-sm text-charcoal-500">
              Showing <span className="font-medium text-charcoal-700">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> - <span className="font-medium text-charcoal-700">{Math.min(currentPage * ITEMS_PER_PAGE, filteredMeetings.length)}</span> of <span className="font-medium text-charcoal-700">{filteredMeetings.length}</span>
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-charcoal-600 min-w-[100px] text-center">
                Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Premium Detail Panel */}
      {selectedMeeting && (
        <MeetingDetailPanel 
          meeting={selectedMeeting} 
          onClose={() => setSelectedMeeting(null)}
          onEdit={() => {
            setEditingMeeting(selectedMeeting)
          }}
        />
      )}

      {/* Edit Meeting Dialog */}
      {editingMeeting && (
        <EditMeetingDialog
          open={!!editingMeeting}
          onOpenChange={(open) => {
            if (!open) {
              setEditingMeeting(null)
            }
          }}
          meeting={editingMeeting}
          accountId={accountId}
          onSuccess={() => {
            setSelectedMeeting(null)
            setEditingMeeting(null)
          }}
        />
      )}
    </div>
  )
}

// Detail Panel Component - Premium SaaS-grade meeting detail view
function MeetingDetailPanel({ meeting, onClose, onEdit }: { meeting: AccountMeeting; onClose: () => void; onEdit?: () => void }) {
  const meetingDate = new Date(meeting.date)
  const statusConfig = STATUS_CONFIG[meeting.status] || STATUS_CONFIG.scheduled
  const typeConfig = MEETING_TYPE_CONFIG[meeting.meetingType] || MEETING_TYPE_CONFIG.other
  const TypeIcon = typeConfig.icon
  const LocationIcon = LOCATION_TYPE_ICONS[meeting.locationType || 'other'] || MapPin

  return (
    <div 
      className="relative rounded-3xl border border-charcoal-200/30 bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden"
      style={{
        animation: 'slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      {/* Premium gradient header background */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-600 opacity-[0.03]" />
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500" />
      
      {/* Floating action buttons */}
      <div className="absolute top-5 right-6 z-10 flex items-center gap-2">
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02]"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span className="text-xs font-semibold">Edit Meeting</span>
          </button>
        )}
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 backdrop-blur-xl border border-charcoal-200/60 text-charcoal-600 hover:text-charcoal-900 hover:bg-white hover:border-charcoal-300 transition-all duration-300 shadow-sm hover:shadow-md group"
        >
          <span className="text-xs font-medium">Close</span>
          <X className="h-3.5 w-3.5 group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>

      {/* Header */}
      <div className="relative px-8 pt-7 pb-6">
        <div className="flex items-start gap-6">
          {/* Premium Calendar Card */}
          <div className="relative group">
            <div className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-purple-500 to-indigo-600 blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
            <div className="relative w-24 h-28 rounded-2xl bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 flex flex-col items-center justify-center shadow-xl shadow-purple-500/30 ring-4 ring-white text-white overflow-hidden">
              {/* Subtle pattern overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2)_0%,transparent_50%)]" />
              <span className="relative text-[11px] font-bold uppercase tracking-[0.2em] opacity-90">{format(meetingDate, 'MMM')}</span>
              <span className="relative text-4xl font-black leading-tight tracking-tight">{format(meetingDate, 'd')}</span>
              <span className="relative text-[10px] font-semibold opacity-75 tracking-wide">{format(meetingDate, 'yyyy')}</span>
            </div>
          </div>
          
          <div className="flex-1 min-w-0 pt-2">
            <div className="flex items-center gap-3 flex-wrap mb-3">
              <h3 className="text-2xl font-bold text-charcoal-900 tracking-tight">{meeting.subject}</h3>
            </div>
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <Badge 
                variant="outline"
                className={cn(
                  "text-xs font-semibold border-0 shadow-sm px-3 py-1",
                  statusConfig.bg,
                  statusConfig.text
                )}
              >
                <span className={cn("w-2 h-2 rounded-full mr-2", meeting.status === 'in_progress' ? 'animate-pulse' : '', statusConfig.dot)} />
                {statusConfig.label}
              </Badge>
              <Badge 
                variant="outline"
                className={cn(
                  "text-xs font-semibold border-0 px-3 py-1",
                  typeConfig.bg,
                  typeConfig.text
                )}
              >
                <TypeIcon className="h-3.5 w-3.5 mr-1.5" />
                {typeConfig.label}
              </Badge>
            </div>
            <div className="flex items-center gap-5 text-sm text-charcoal-600">
              <span className="flex items-center gap-2 bg-charcoal-50 px-3 py-1.5 rounded-lg">
                <Clock className="h-4 w-4 text-purple-500" />
                <span className="font-medium">{format(meetingDate, 'h:mm a')}</span>
                {meeting.durationMinutes && <span className="text-charcoal-400">· {formatDuration(meeting.durationMinutes)}</span>}
              </span>
              <span className="flex items-center gap-2 bg-charcoal-50 px-3 py-1.5 rounded-lg">
                <LocationIcon className="h-4 w-4 text-blue-500" />
                <span className="font-medium truncate max-w-[200px]">{meeting.location || meeting.locationType?.replace('_', ' ') || 'TBD'}</span>
              </span>
              <span className="flex items-center gap-2 bg-charcoal-50 px-3 py-1.5 rounded-lg">
                <User className="h-4 w-4 text-green-500" />
                <span className="font-medium">{meeting.organizer}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-8 h-px bg-gradient-to-r from-transparent via-charcoal-200/60 to-transparent" />

      {/* Content - Optimized Layout for Text Readability */}
      <div className="px-8 py-7 space-y-6">
        {/* Top Row: Meeting Details + Action Items (compact, side-by-side) */}
        <div className="grid grid-cols-2 gap-6">
          {/* Meeting Details - Compact */}
          <div>
            <SectionHeader icon={Calendar} iconColor="text-purple-500" iconBg="bg-purple-50" title="Meeting Details" />
            <div className="rounded-2xl border border-charcoal-100/60 overflow-hidden shadow-sm bg-white mt-4">
              <DetailRow icon={TypeIcon} iconColor={typeConfig.text} label="Type" value={typeConfig.label} />
              <DetailRow icon={CheckCircle} iconColor={statusConfig.text} label="Status" value={statusConfig.label} />
              <DetailRow icon={Clock} iconColor="text-charcoal-500" label="Duration" value={formatDuration(meeting.durationMinutes)} />
              <DetailRow icon={MapPin} iconColor="text-charcoal-500" label="Location" value={meeting.location || 'Not specified'} isLast />
            </div>

            {/* Client Satisfaction (if completed) */}
            {meeting.clientSatisfaction && (
              <div className="mt-5">
                <SectionHeader icon={Smile} iconColor="text-green-500" iconBg="bg-green-50" title="Client Feedback" />
                <div className="rounded-2xl border border-green-100 p-5 bg-gradient-to-br from-green-50/50 to-white shadow-sm mt-4">
                  {(() => {
                    const config = SATISFACTION_CONFIG[meeting.clientSatisfaction]
                    const SatIcon = config.icon
                    return (
                      <div className="flex items-center gap-4">
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shadow-sm", 
                          meeting.clientSatisfaction.includes('satisfied') ? 'bg-green-100' : 
                          meeting.clientSatisfaction === 'neutral' ? 'bg-charcoal-100' : 'bg-amber-100'
                        )}>
                          <SatIcon className={cn("h-6 w-6", config.color)} />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-charcoal-900">{config.label}</p>
                          {meeting.clientFeedback && (
                            <p className="text-xs text-charcoal-500 mt-1 italic leading-relaxed">"{meeting.clientFeedback}"</p>
                          )}
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>
            )}
          </div>

          {/* Action Items - Compact */}
          <div>
            <SectionHeader icon={ListTodo} iconColor="text-orange-500" iconBg="bg-orange-50" title="Action Items" />
            <div className="rounded-2xl border border-charcoal-100/60 p-5 bg-white min-h-[180px] shadow-sm mt-4">
              {meeting.actionItems && meeting.actionItems.length > 0 ? (
                <ul className="space-y-4">
                  {meeting.actionItems.map((item) => (
                    <li key={item.id} className="flex items-start gap-3 group hover:bg-charcoal-50/50 p-2 -m-2 rounded-xl transition-colors">
                      <div className={cn(
                        "w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200",
                        item.completed 
                          ? "bg-gradient-to-br from-green-400 to-green-500 shadow-sm shadow-green-500/30" 
                          : "border-2 border-charcoal-300 bg-white group-hover:border-charcoal-400"
                      )}>
                        {item.completed && <CheckCircle className="h-3 w-3 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm leading-relaxed",
                          item.completed ? "text-charcoal-400 line-through" : "text-charcoal-800 font-medium"
                        )}>
                          {item.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          {item.assignedTo && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-charcoal-500 bg-charcoal-100 px-2 py-0.5 rounded-full">
                              <User className="h-2.5 w-2.5" />
                              {item.assignedTo}
                            </span>
                          )}
                          {item.dueDate && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-charcoal-500 bg-charcoal-100 px-2 py-0.5 rounded-full">
                              <Clock className="h-2.5 w-2.5" />
                              Due {format(new Date(item.dueDate), 'MMM d')}
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[140px] gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-charcoal-50 flex items-center justify-center">
                    <ListTodo className="h-7 w-7 text-charcoal-300" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-charcoal-500">No action items</p>
                    <p className="text-xs text-charcoal-400 mt-0.5">Click Edit to add tasks</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Full-Width Text Sections */}
        <div className="space-y-5">
          {/* Agenda - Full Width */}
          <div>
            <SectionHeader icon={FileText} iconColor="text-blue-500" iconBg="bg-blue-50" title="Agenda" />
            <div className="rounded-2xl border border-charcoal-100/60 p-5 bg-white shadow-sm mt-4">
              {meeting.agenda ? (
                <p className="text-sm text-charcoal-700 whitespace-pre-wrap leading-relaxed">{meeting.agenda}</p>
              ) : (
                <p className="text-sm text-charcoal-400 italic">No agenda set for this meeting</p>
              )}
            </div>
          </div>

          {/* Key Takeaways - Full Width */}
          {meeting.keyTakeaways && meeting.keyTakeaways.length > 0 && (
            <div>
              <SectionHeader icon={CheckCircle} iconColor="text-green-500" iconBg="bg-green-50" title="Key Takeaways" />
              <div className="rounded-2xl border border-green-100/60 p-5 bg-gradient-to-br from-green-50/30 to-white shadow-sm mt-4">
                <ul className="space-y-2.5">
                  {meeting.keyTakeaways.map((takeaway, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-charcoal-700 group">
                      <span className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0 group-hover:scale-125 transition-transform" />
                      <span className="leading-relaxed">{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Discussion Notes - Full Width */}
          {meeting.discussionNotes && (
            <div>
              <SectionHeader icon={MessageSquare} iconColor="text-amber-500" iconBg="bg-amber-50" title="Discussion Notes" />
              <div className="rounded-2xl border border-charcoal-100/60 p-5 bg-white shadow-sm mt-4">
                <p className="text-sm text-charcoal-700 whitespace-pre-wrap leading-relaxed">{meeting.discussionNotes}</p>
              </div>
            </div>
          )}

          {/* Follow-up Notes - Full Width */}
          {meeting.followUpNotes && (
            <div>
              <SectionHeader icon={ArrowRight} iconColor="text-purple-500" iconBg="bg-purple-50" title="Follow-up Notes" />
              <div className="rounded-2xl border border-purple-100/60 p-5 bg-gradient-to-br from-purple-50/30 to-white shadow-sm mt-4">
                <p className="text-sm text-charcoal-700 whitespace-pre-wrap leading-relaxed">{meeting.followUpNotes}</p>
              </div>
            </div>
          )}

          {/* Next Meeting Scheduled */}
          {meeting.nextMeetingScheduled && (
            <div className="rounded-2xl border border-purple-200/60 p-5 bg-gradient-to-br from-purple-50 to-white shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-purple-600 font-bold uppercase tracking-[0.15em]">Next Meeting</p>
                  <p className="text-sm font-bold text-charcoal-900 mt-0.5">
                    {format(new Date(meeting.nextMeetingScheduled), 'EEEE, MMMM d, yyyy')}
                  </p>
                  <p className="text-xs text-charcoal-500 mt-0.5">
                    {formatDistanceToNow(new Date(meeting.nextMeetingScheduled), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-5 border-t border-charcoal-100/40 flex items-center justify-center gap-1">
          <span className="inline-flex items-center gap-1.5 text-xs text-charcoal-400">
            <Clock className="h-3 w-3" />
            Created {meeting.createdAt ? formatDistanceToNow(new Date(meeting.createdAt), { addSuffix: true }) : 'Unknown'}
            {meeting.createdBy && (
              <>
                <span className="mx-1">·</span>
                <User className="h-3 w-3" />
                {meeting.createdBy.name}
              </>
            )}
          </span>
        </div>
      </div>
      
      {/* CSS for animations */}
      <style jsx>{`
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

// Section Header Component
function SectionHeader({ icon: Icon, iconColor, iconBg, title }: { icon: React.ElementType; iconColor: string; iconBg: string; title: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", iconBg)}>
        <Icon className={cn("h-3.5 w-3.5", iconColor)} />
      </div>
      <h4 className="text-xs font-bold text-charcoal-700 tracking-wide uppercase">{title}</h4>
    </div>
  )
}

// Enhanced detail row component
function DetailRow({ 
  icon: Icon, 
  iconColor = "text-charcoal-400",
  label, 
  value, 
  isLast = false 
}: { 
  icon?: React.ElementType
  iconColor?: string
  label: string
  value: string | null
  isLast?: boolean 
}) {
  return (
    <div className={cn(
      "flex items-center justify-between px-4 py-3.5 bg-white hover:bg-charcoal-50/50 transition-colors",
      !isLast && "border-b border-charcoal-100/40"
    )}>
      <span className="flex items-center gap-2 text-xs font-medium text-charcoal-500">
        {Icon && <Icon className={cn("h-3.5 w-3.5", iconColor)} />}
        {label}
      </span>
      <span className="text-sm font-semibold text-charcoal-900">{value || '—'}</span>
    </div>
  )
}

export default AccountMeetingsSection
