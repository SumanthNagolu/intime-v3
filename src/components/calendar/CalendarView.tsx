'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Video,
  MoreHorizontal,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  parseISO,
  differenceInMinutes,
  startOfDay,
} from 'date-fns'

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
  entity_links: Array<{ entity_type: string; entity_id: string; entity_name: string }>
}

interface CalendarViewProps {
  accountId?: string
  view?: 'month' | 'week' | 'day'
  onEventClick?: (event: CalendarEvent) => void
  onCreateEvent?: (date: Date) => void
  className?: string
}

// ============================================
// Event Colors
// ============================================

const EVENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  meeting: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  interview: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  reminder: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  block: { bg: 'bg-charcoal-100', text: 'text-charcoal-600', border: 'border-charcoal-200' },
  other: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
}

// ============================================
// Mini Event Component (for month view)
// ============================================

function MiniEvent({
  event,
  onClick,
}: {
  event: CalendarEvent
  onClick: () => void
}) {
  const colors = EVENT_COLORS[event.event_type] || EVENT_COLORS.other
  const startTime = format(parseISO(event.start_time), 'h:mm a')

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={cn(
        'w-full text-left px-1.5 py-0.5 rounded text-xs truncate border transition-colors',
        colors.bg,
        colors.text,
        colors.border,
        'hover:opacity-80'
      )}
    >
      {!event.all_day && <span className="font-medium">{startTime}</span>}{' '}
      {event.title}
    </button>
  )
}

// ============================================
// Full Event Component (for week/day view)
// ============================================

function FullEvent({
  event,
  style,
  onClick,
}: {
  event: CalendarEvent
  style?: React.CSSProperties
  onClick: () => void
}) {
  const colors = EVENT_COLORS[event.event_type] || EVENT_COLORS.other
  const startTime = format(parseISO(event.start_time), 'h:mm a')
  const endTime = format(parseISO(event.end_time), 'h:mm a')

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      style={style}
      className={cn(
        'absolute left-1 right-1 px-2 py-1 rounded border text-left overflow-hidden transition-colors',
        colors.bg,
        colors.text,
        colors.border,
        'hover:opacity-80'
      )}
    >
      <p className="text-xs font-medium truncate">{event.title}</p>
      <p className="text-[10px] opacity-75">
        {startTime} - {endTime}
      </p>
      {event.location && (
        <p className="text-[10px] opacity-75 truncate flex items-center gap-1">
          <MapPin className="w-2.5 h-2.5" />
          {event.location}
        </p>
      )}
    </button>
  )
}

// ============================================
// Month View
// ============================================

function MonthView({
  currentDate,
  events,
  onEventClick,
  onCreateEvent,
}: {
  currentDate: Date
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
  onCreateEvent: (date: Date) => void
}) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  const weeks: Date[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  const eventsByDay = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {}
    events.forEach((event) => {
      const dayKey = format(parseISO(event.start_time), 'yyyy-MM-dd')
      if (!map[dayKey]) map[dayKey] = []
      map[dayKey].push(event)
    })
    return map
  }, [events])

  return (
    <div className="flex-1 flex flex-col">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-charcoal-200">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="px-2 py-2 text-xs font-medium text-charcoal-500 uppercase tracking-wider text-center"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 grid grid-rows-6">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 border-b border-charcoal-100 last:border-b-0">
            {week.map((day) => {
              const dayKey = format(day, 'yyyy-MM-dd')
              const dayEvents = eventsByDay[dayKey] || []
              const isCurrentMonth = isSameMonth(day, currentDate)
              const isCurrentDay = isToday(day)

              return (
                <div
                  key={dayKey}
                  onClick={() => onCreateEvent(day)}
                  className={cn(
                    'min-h-[100px] p-1 border-r border-charcoal-100 last:border-r-0 cursor-pointer hover:bg-charcoal-50 transition-colors',
                    !isCurrentMonth && 'bg-charcoal-50/50'
                  )}
                >
                  <div className="flex items-center justify-center mb-1">
                    <span
                      className={cn(
                        'w-7 h-7 flex items-center justify-center rounded-full text-sm',
                        isCurrentDay
                          ? 'bg-charcoal-900 text-white font-medium'
                          : isCurrentMonth
                          ? 'text-charcoal-900'
                          : 'text-charcoal-400'
                      )}
                    >
                      {format(day, 'd')}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map((event) => (
                      <MiniEvent
                        key={event.id}
                        event={event}
                        onClick={() => onEventClick(event)}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <p className="text-[10px] text-charcoal-500 text-center">
                        +{dayEvents.length - 3} more
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================
// Week View
// ============================================

function WeekView({
  currentDate,
  events,
  onEventClick,
  onCreateEvent,
}: {
  currentDate: Date
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
  onCreateEvent: (date: Date) => void
}) {
  const weekStart = startOfWeek(currentDate)
  const days = eachDayOfInterval({
    start: weekStart,
    end: addDays(weekStart, 6),
  })

  const hours = Array.from({ length: 24 }, (_, i) => i)

  const getEventPosition = (event: CalendarEvent) => {
    const start = parseISO(event.start_time)
    const end = parseISO(event.end_time)
    const dayStart = startOfDay(start)
    const topMinutes = differenceInMinutes(start, dayStart)
    const duration = differenceInMinutes(end, start)

    return {
      top: (topMinutes / 60) * 60, // 60px per hour
      height: Math.max((duration / 60) * 60, 20), // Min 20px height
    }
  }

  const eventsByDay = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {}
    events.forEach((event) => {
      const dayKey = format(parseISO(event.start_time), 'yyyy-MM-dd')
      if (!map[dayKey]) map[dayKey] = []
      map[dayKey].push(event)
    })
    return map
  }, [events])

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Day headers */}
      <div className="flex border-b border-charcoal-200">
        <div className="w-16 flex-shrink-0" />
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className="flex-1 px-2 py-2 text-center border-l border-charcoal-100"
          >
            <p className="text-xs font-medium text-charcoal-500 uppercase">
              {format(day, 'EEE')}
            </p>
            <p
              className={cn(
                'text-lg font-semibold',
                isToday(day) ? 'text-gold-600' : 'text-charcoal-900'
              )}
            >
              {format(day, 'd')}
            </p>
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex">
          {/* Time labels */}
          <div className="w-16 flex-shrink-0">
            {hours.map((hour) => (
              <div key={hour} className="h-[60px] pr-2 text-right">
                <span className="text-xs text-charcoal-400">
                  {format(new Date().setHours(hour, 0), 'h a')}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day) => {
            const dayKey = format(day, 'yyyy-MM-dd')
            const dayEvents = eventsByDay[dayKey] || []

            return (
              <div
                key={dayKey}
                className="flex-1 relative border-l border-charcoal-100"
                onClick={() => onCreateEvent(day)}
              >
                {/* Hour lines */}
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="h-[60px] border-b border-charcoal-100"
                  />
                ))}

                {/* Events */}
                {dayEvents.filter(e => !e.all_day).map((event) => {
                  const position = getEventPosition(event)
                  return (
                    <FullEvent
                      key={event.id}
                      event={event}
                      style={{
                        top: position.top,
                        height: position.height,
                      }}
                      onClick={() => onEventClick(event)}
                    />
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ============================================
// Day View
// ============================================

function DayView({
  currentDate,
  events,
  onEventClick,
  onCreateEvent,
}: {
  currentDate: Date
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
  onCreateEvent: (date: Date) => void
}) {
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const dayKey = format(currentDate, 'yyyy-MM-dd')

  const dayEvents = useMemo(() => {
    return events.filter((event) => {
      const eventDay = format(parseISO(event.start_time), 'yyyy-MM-dd')
      return eventDay === dayKey
    })
  }, [events, dayKey])

  const getEventPosition = (event: CalendarEvent) => {
    const start = parseISO(event.start_time)
    const end = parseISO(event.end_time)
    const dayStart = startOfDay(start)
    const topMinutes = differenceInMinutes(start, dayStart)
    const duration = differenceInMinutes(end, start)

    return {
      top: (topMinutes / 60) * 60,
      height: Math.max((duration / 60) * 60, 30),
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Day header */}
      <div className="px-4 py-3 border-b border-charcoal-200">
        <p className="text-xs font-medium text-charcoal-500 uppercase">
          {format(currentDate, 'EEEE')}
        </p>
        <p className="text-2xl font-bold text-charcoal-900">
          {format(currentDate, 'MMMM d, yyyy')}
        </p>
      </div>

      {/* All-day events */}
      {dayEvents.filter((e) => e.all_day).length > 0 && (
        <div className="px-4 py-2 border-b border-charcoal-200 bg-charcoal-50">
          <p className="text-xs font-medium text-charcoal-500 mb-1">All Day</p>
          <div className="space-y-1">
            {dayEvents.filter((e) => e.all_day).map((event) => (
              <MiniEvent
                key={event.id}
                event={event}
                onClick={() => onEventClick(event)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Time grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex">
          {/* Time labels */}
          <div className="w-20 flex-shrink-0">
            {hours.map((hour) => (
              <div key={hour} className="h-[60px] pr-3 text-right">
                <span className="text-xs text-charcoal-400">
                  {format(new Date().setHours(hour, 0), 'h:mm a')}
                </span>
              </div>
            ))}
          </div>

          {/* Event column */}
          <div
            className="flex-1 relative border-l border-charcoal-200"
            onClick={() => onCreateEvent(currentDate)}
          >
            {/* Hour lines */}
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-[60px] border-b border-charcoal-100 hover:bg-charcoal-50 transition-colors"
              />
            ))}

            {/* Events */}
            {dayEvents.filter((e) => !e.all_day).map((event) => {
              const position = getEventPosition(event)
              return (
                <FullEvent
                  key={event.id}
                  event={event}
                  style={{
                    top: position.top,
                    height: position.height,
                    left: 4,
                    right: 4,
                  }}
                  onClick={() => onEventClick(event)}
                />
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// Main Component
// ============================================

export function CalendarView({
  accountId,
  view: initialView = 'month',
  onEventClick,
  onCreateEvent,
  className,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState(initialView)

  // Calculate date range based on view
  const dateRange = useMemo(() => {
    if (view === 'month') {
      const monthStart = startOfMonth(currentDate)
      return {
        start: startOfWeek(monthStart),
        end: endOfWeek(endOfMonth(currentDate)),
      }
    } else if (view === 'week') {
      return {
        start: startOfWeek(currentDate),
        end: endOfWeek(currentDate),
      }
    } else {
      return {
        start: startOfDay(currentDate),
        end: addDays(startOfDay(currentDate), 1),
      }
    }
  }, [currentDate, view])

  // Fetch events
  const { data: events = [], isLoading } = trpc.calendar.events.list.useQuery(
    {
      accountId,
      startDate: dateRange.start.toISOString(),
      endDate: dateRange.end.toISOString(),
    },
    { enabled: !!accountId }
  )

  // Navigation handlers
  const goToToday = useCallback(() => setCurrentDate(new Date()), [])

  const goPrevious = useCallback(() => {
    if (view === 'month') {
      setCurrentDate((d) => subMonths(d, 1))
    } else if (view === 'week') {
      setCurrentDate((d) => subWeeks(d, 1))
    } else {
      setCurrentDate((d) => subDays(d, 1))
    }
  }, [view])

  const goNext = useCallback(() => {
    if (view === 'month') {
      setCurrentDate((d) => addMonths(d, 1))
    } else if (view === 'week') {
      setCurrentDate((d) => addWeeks(d, 1))
    } else {
      setCurrentDate((d) => addDays(d, 1))
    }
  }, [view])

  const handleEventClick = useCallback(
    (event: CalendarEvent) => {
      onEventClick?.(event)
    },
    [onEventClick]
  )

  const handleCreateEvent = useCallback(
    (date: Date) => {
      onCreateEvent?.(date)
    },
    [onCreateEvent]
  )

  // Get title based on view
  const title = useMemo(() => {
    if (view === 'month') {
      return format(currentDate, 'MMMM yyyy')
    } else if (view === 'week') {
      const weekStart = startOfWeek(currentDate)
      const weekEnd = endOfWeek(currentDate)
      return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`
    } else {
      return format(currentDate, 'MMMM d, yyyy')
    }
  }, [currentDate, view])

  return (
    <div className={cn('flex flex-col h-full bg-white', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-charcoal-200">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-charcoal-900">{title}</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={goPrevious}
              className="p-2 text-charcoal-400 hover:text-charcoal-600 hover:bg-charcoal-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goNext}
              className="p-2 text-charcoal-400 hover:text-charcoal-600 hover:bg-charcoal-100 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm font-medium text-charcoal-600 hover:bg-charcoal-100 rounded-lg"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* View switcher */}
          <div className="flex items-center bg-charcoal-100 rounded-lg p-1">
            {(['month', 'week', 'day'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  'px-3 py-1 text-sm font-medium rounded-md capitalize transition-colors',
                  view === v
                    ? 'bg-white text-charcoal-900 shadow-sm'
                    : 'text-charcoal-600 hover:text-charcoal-800'
                )}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Create event button */}
          {onCreateEvent && (
            <button
              onClick={() => onCreateEvent(currentDate)}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-charcoal-900 text-white rounded-lg hover:bg-charcoal-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Event</span>
            </button>
          )}
        </div>
      </div>

      {/* Calendar View */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-6 h-6 border-2 border-charcoal-300 border-t-charcoal-600 rounded-full" />
        </div>
      ) : view === 'month' ? (
        <MonthView
          currentDate={currentDate}
          events={events as CalendarEvent[]}
          onEventClick={handleEventClick}
          onCreateEvent={handleCreateEvent}
        />
      ) : view === 'week' ? (
        <WeekView
          currentDate={currentDate}
          events={events as CalendarEvent[]}
          onEventClick={handleEventClick}
          onCreateEvent={handleCreateEvent}
        />
      ) : (
        <DayView
          currentDate={currentDate}
          events={events as CalendarEvent[]}
          onEventClick={handleEventClick}
          onCreateEvent={handleCreateEvent}
        />
      )}
    </div>
  )
}

export default CalendarView
