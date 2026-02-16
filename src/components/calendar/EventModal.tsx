'use client'

import { useState, useCallback } from 'react'
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  AlignLeft,
  Link2,
  Repeat,
  Bell,
  Trash2,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'
import { format, addHours, setHours, setMinutes } from 'date-fns'

// ============================================
// Types
// ============================================

interface CalendarEvent {
  id: string
  title: string
  description?: string
  start_time: string
  end_time: string
  all_day: boolean
  location?: string
  meeting_url?: string
  attendees: Array<{ email: string; name?: string; status: string }>
  event_type: 'meeting' | 'interview' | 'reminder' | 'block' | 'other'
  is_recurring: boolean
  reminder_minutes?: number
}

interface EventModalProps {
  accountId: string
  event?: CalendarEvent | null
  defaultDate?: Date
  onClose: () => void
  onSave?: (event: CalendarEvent) => void
  onDelete?: (eventId: string) => void
}

// ============================================
// Event Type Options
// ============================================

const EVENT_TYPES = [
  { id: 'meeting', label: 'Meeting', icon: Users },
  { id: 'interview', label: 'Interview', icon: Video },
  { id: 'reminder', label: 'Reminder', icon: Bell },
  { id: 'block', label: 'Focus Time', icon: Clock },
  { id: 'other', label: 'Other', icon: Calendar },
] as const

const REMINDER_OPTIONS = [
  { value: 0, label: 'None' },
  { value: 5, label: '5 minutes before' },
  { value: 15, label: '15 minutes before' },
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '1 hour before' },
  { value: 1440, label: '1 day before' },
]

// ============================================
// Main Component
// ============================================

export function EventModal({
  accountId,
  event,
  defaultDate,
  onClose,
  onSave,
  onDelete,
}: EventModalProps) {
  const isEditing = !!event

  // Form state
  const [title, setTitle] = useState(event?.title || '')
  const [description, setDescription] = useState(event?.description || '')
  const [startDate, setStartDate] = useState(
    event?.start_time
      ? format(new Date(event.start_time), "yyyy-MM-dd'T'HH:mm")
      : format(
          setMinutes(setHours(defaultDate || new Date(), new Date().getHours() + 1), 0),
          "yyyy-MM-dd'T'HH:mm"
        )
  )
  const [endDate, setEndDate] = useState(
    event?.end_time
      ? format(new Date(event.end_time), "yyyy-MM-dd'T'HH:mm")
      : format(
          addHours(
            setMinutes(setHours(defaultDate || new Date(), new Date().getHours() + 1), 0),
            1
          ),
          "yyyy-MM-dd'T'HH:mm"
        )
  )
  const [allDay, setAllDay] = useState(event?.all_day || false)
  const [location, setLocation] = useState(event?.location || '')
  const [meetingUrl, setMeetingUrl] = useState(event?.meeting_url || '')
  const [eventType, setEventType] = useState(event?.event_type || 'meeting')
  const [reminderMinutes, setReminderMinutes] = useState(event?.reminder_minutes || 15)
  const [attendees, setAttendees] = useState<string>(
    event?.attendees.map((a) => a.email).join(', ') || ''
  )

  const utils = trpc.useUtils()

  // Mutations
  const createMutation = trpc.calendar.events.create.useMutation({
    onSuccess: (data) => {
      utils.calendar.events.invalidate()
      onSave?.(data as CalendarEvent)
      onClose()
    },
  })

  const updateMutation = trpc.calendar.events.update.useMutation({
    onSuccess: (data) => {
      utils.calendar.events.invalidate()
      onSave?.(data as CalendarEvent)
      onClose()
    },
  })

  const deleteMutation = trpc.calendar.events.delete.useMutation({
    onSuccess: () => {
      utils.calendar.events.invalidate()
      onDelete?.(event!.id)
      onClose()
    },
  })

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()

      const eventData = {
        accountId,
        title,
        description: description || undefined,
        startTime: new Date(startDate).toISOString(),
        endTime: new Date(endDate).toISOString(),
        allDay,
        location: location || undefined,
        meetingUrl: meetingUrl || undefined,
        eventType,
        reminderMinutes: reminderMinutes || undefined,
        attendees: attendees
          .split(',')
          .map((email) => email.trim())
          .filter(Boolean)
          .map((email) => ({ email, status: 'pending' })),
      }

      if (isEditing) {
        updateMutation.mutate({ ...eventData, eventId: event.id })
      } else {
        createMutation.mutate(eventData)
      }
    },
    [
      accountId,
      title,
      description,
      startDate,
      endDate,
      allDay,
      location,
      meetingUrl,
      eventType,
      reminderMinutes,
      attendees,
      isEditing,
      event,
      createMutation,
      updateMutation,
    ]
  )

  const handleDelete = useCallback(() => {
    if (event && confirm('Are you sure you want to delete this event?')) {
      deleteMutation.mutate({ accountId, eventId: event.id })
    }
  }, [accountId, event, deleteMutation])

  const isPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-charcoal-200">
          <h2 className="text-lg font-semibold text-charcoal-900">
            {isEditing ? 'Edit Event' : 'New Event'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-charcoal-400 hover:text-charcoal-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add title"
              required
              className="w-full text-xl font-medium text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none"
            />
          </div>

          {/* Event Type */}
          <div className="flex flex-wrap gap-2">
            {EVENT_TYPES.map((type) => {
              const Icon = type.icon
              const isSelected = eventType === type.id
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setEventType(type.id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border transition-colors',
                    isSelected
                      ? 'bg-charcoal-900 text-white border-charcoal-900'
                      : 'bg-white text-charcoal-600 border-charcoal-200 hover:border-charcoal-300'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {type.label}
                </button>
              )
            })}
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-1">
                Start
              </label>
              <input
                type={allDay ? 'date' : 'datetime-local'}
                value={allDay ? startDate.split('T')[0] : startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border border-charcoal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-1">
                End
              </label>
              <input
                type={allDay ? 'date' : 'datetime-local'}
                value={allDay ? endDate.split('T')[0] : endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border border-charcoal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
              />
            </div>
          </div>

          {/* All Day Toggle */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAllDay(!allDay)}
              className={cn(
                'w-10 h-6 rounded-full transition-colors relative',
                allDay ? 'bg-charcoal-900' : 'bg-charcoal-200'
              )}
            >
              <span
                className={cn(
                  'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                  allDay ? 'left-5' : 'left-1'
                )}
              />
            </button>
            <span className="text-sm text-charcoal-600">All day</span>
          </div>

          {/* Location */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Add location"
              className="w-full pl-10 pr-4 py-2 text-sm border border-charcoal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
            />
          </div>

          {/* Meeting URL */}
          <div className="relative">
            <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
            <input
              type="url"
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              placeholder="Add video conferencing link"
              className="w-full pl-10 pr-4 py-2 text-sm border border-charcoal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
            />
          </div>

          {/* Attendees */}
          <div className="relative">
            <Users className="absolute left-3 top-3 w-4 h-4 text-charcoal-400" />
            <textarea
              value={attendees}
              onChange={(e) => setAttendees(e.target.value)}
              placeholder="Add attendees (comma-separated emails)"
              rows={2}
              className="w-full pl-10 pr-4 py-2 text-sm border border-charcoal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 resize-none"
            />
          </div>

          {/* Description */}
          <div className="relative">
            <AlignLeft className="absolute left-3 top-3 w-4 h-4 text-charcoal-400" />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add description"
              rows={3}
              className="w-full pl-10 pr-4 py-2 text-sm border border-charcoal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 resize-none"
            />
          </div>

          {/* Reminder */}
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-charcoal-400" />
            <select
              value={reminderMinutes}
              onChange={(e) => setReminderMinutes(Number(e.target.value))}
              className="px-3 py-2 text-sm border border-charcoal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
            >
              {REMINDER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-charcoal-200 bg-charcoal-50">
          {isEditing ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-error-600 hover:bg-error-50 rounded-lg disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-charcoal-600 hover:bg-charcoal-100 rounded-lg disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isPending || !title}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-charcoal-900 text-white rounded-lg hover:bg-charcoal-800 disabled:opacity-50"
            >
              {isPending ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {isEditing ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventModal
