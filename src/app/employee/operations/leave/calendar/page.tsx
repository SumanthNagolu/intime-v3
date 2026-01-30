'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Users,
  Building2,
  Loader2,
  Filter,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { trpc } from '@/lib/trpc/client'
import { cn } from '@/lib/utils'

const LEAVE_TYPE_COLORS = {
  vacation: 'bg-blue-500',
  sick: 'bg-red-500',
  personal: 'bg-purple-500',
  bereavement: 'bg-charcoal-500',
  jury_duty: 'bg-indigo-500',
  parental: 'bg-pink-500',
  unpaid: 'bg-amber-500',
  holiday: 'bg-green-500',
  other: 'bg-charcoal-400',
}

const LEAVE_TYPE_LABELS = {
  vacation: 'Vacation',
  sick: 'Sick Leave',
  personal: 'Personal',
  bereavement: 'Bereavement',
  jury_duty: 'Jury Duty',
  parental: 'Parental',
  unpaid: 'Unpaid',
  holiday: 'Holiday',
  other: 'Other',
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

interface LeaveEvent {
  id: string
  type: string
  status: string
  start_date: string
  end_date: string
  hours: number
  employee: {
    id: string
    job_title: string
    department: string
    department_id: string
    user: { full_name: string; avatar_url?: string }
  }
}

export default function LeaveCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDepartment, setSelectedDepartment] = useState<string>('')
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Calculate date range for the current view
  const startDate = new Date(year, month, 1)
  const endDate = new Date(year, month + 1, 0)

  // Fetch calendar data
  const { data: calendarData, isLoading } = trpc.leave.calendar.getTeamCalendar.useQuery({
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    departmentId: selectedDepartment || undefined,
  })

  const { data: departments } = trpc.departments.list.useQuery({})

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days: { date: Date; isCurrentMonth: boolean; events: LeaveEvent[] }[] = []

    // Get first day of month and last day of previous month
    const firstDayOfMonth = new Date(year, month, 1)
    const firstDayWeekday = firstDayOfMonth.getDay()
    const lastDayOfMonth = new Date(year, month + 1, 0)

    // Add days from previous month
    for (let i = firstDayWeekday - 1; i >= 0; i--) {
      const date = new Date(year, month, -i)
      days.push({ date, isCurrentMonth: false, events: [] })
    }

    // Add days of current month
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const date = new Date(year, month, i)
      days.push({ date, isCurrentMonth: true, events: [] })
    }

    // Add days from next month to fill the grid
    const remainingDays = 42 - days.length // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i)
      days.push({ date, isCurrentMonth: false, events: [] })
    }

    // Add events to days
    if (calendarData) {
      (calendarData as LeaveEvent[]).forEach(event => {
        const eventStart = new Date(event.start_date)
        const eventEnd = new Date(event.end_date)

        days.forEach(day => {
          const dayDate = day.date
          if (dayDate >= eventStart && dayDate <= eventEnd) {
            day.events.push(event)
          }
        })
      })
    }

    return days
  }, [year, month, calendarData])

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(new Date(year, month + (direction === 'next' ? 1 : -1), 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  // Group events by employee for the list view
  const eventsByEmployee = useMemo(() => {
    if (!calendarData) return []

    const grouped = new Map<string, { employee: LeaveEvent['employee']; events: LeaveEvent[] }>()

    ;(calendarData as LeaveEvent[]).forEach(event => {
      if (!grouped.has(event.employee.id)) {
        grouped.set(event.employee.id, { employee: event.employee, events: [] })
      }
      grouped.get(event.employee.id)!.events.push(event)
    })

    return Array.from(grouped.values())
  }, [calendarData])

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-white border-b border-charcoal-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/employee/operations/leave">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="h-6 w-px bg-charcoal-200" />
              <div>
                <h1 className="text-h4 font-heading font-semibold text-charcoal-900">
                  Team Calendar
                </h1>
                <p className="text-sm text-charcoal-500 mt-0.5">
                  View team time off schedule
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-charcoal-400" />
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Departments</SelectItem>
                    {departments?.items?.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Calendar Controls */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-heading font-semibold text-charcoal-900 min-w-[200px] text-center">
                  {MONTHS[month]} {year}
                </h2>
                <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={goToToday}>
                  Today
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {/* Legend */}
                <div className="flex items-center gap-4 text-xs">
                  {Object.entries(LEAVE_TYPE_LABELS).slice(0, 5).map(([type, label]) => (
                    <div key={type} className="flex items-center gap-1.5">
                      <span className={cn('w-2.5 h-2.5 rounded-full', LEAVE_TYPE_COLORS[type as keyof typeof LEAVE_TYPE_COLORS])} />
                      <span className="text-charcoal-600">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Grid */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
              </div>
            ) : (
              <>
                {/* Day Headers */}
                <div className="grid grid-cols-7 border-b border-charcoal-100">
                  {DAYS_OF_WEEK.map((day) => (
                    <div
                      key={day}
                      className="px-2 py-3 text-center text-xs font-medium text-charcoal-500 uppercase tracking-wider"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7">
                  {calendarDays.map((day, index) => (
                    <div
                      key={index}
                      className={cn(
                        'min-h-[120px] p-2 border-b border-r border-charcoal-100',
                        !day.isCurrentMonth && 'bg-charcoal-50/50',
                        index % 7 === 6 && 'border-r-0',
                        index >= 35 && 'border-b-0'
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={cn(
                            'text-sm font-medium',
                            !day.isCurrentMonth ? 'text-charcoal-400' : 'text-charcoal-900',
                            isToday(day.date) && 'bg-charcoal-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs'
                          )}
                        >
                          {day.date.getDate()}
                        </span>
                        {day.events.length > 0 && (
                          <span className="text-xs text-charcoal-400">{day.events.length}</span>
                        )}
                      </div>

                      {/* Events */}
                      <div className="space-y-1">
                        <TooltipProvider>
                          {day.events.slice(0, 3).map((event, eventIndex) => (
                            <Tooltip key={`${event.id}-${eventIndex}`}>
                              <TooltipTrigger asChild>
                                <Link
                                  href={`/employee/operations/leave/${event.id}`}
                                  className={cn(
                                    'block text-xs px-1.5 py-0.5 rounded truncate text-white cursor-pointer',
                                    LEAVE_TYPE_COLORS[event.type as keyof typeof LEAVE_TYPE_COLORS],
                                    event.status === 'pending' && 'opacity-60'
                                  )}
                                >
                                  {event.employee.user.full_name}
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs">
                                <div className="space-y-1">
                                  <p className="font-medium">{event.employee.user.full_name}</p>
                                  <p className="text-xs text-charcoal-500">
                                    {LEAVE_TYPE_LABELS[event.type as keyof typeof LEAVE_TYPE_LABELS]} • {event.status}
                                  </p>
                                  <p className="text-xs text-charcoal-500">
                                    {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
                                  </p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                          {day.events.length > 3 && (
                            <span className="text-xs text-charcoal-500 px-1.5">
                              +{day.events.length - 3} more
                            </span>
                          )}
                        </TooltipProvider>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Team List View */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-charcoal-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-heading font-semibold">
                  Team Time Off This Month
                </CardTitle>
                <p className="text-sm text-charcoal-500">
                  {eventsByEmployee.length} team member{eventsByEmployee.length !== 1 ? 's' : ''} with scheduled time off
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {eventsByEmployee.length === 0 ? (
              <div className="flex flex-col items-center py-12">
                <div className="w-16 h-16 rounded-full bg-charcoal-100 flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-charcoal-400" />
                </div>
                <h3 className="text-lg font-heading font-semibold text-charcoal-900 mb-2">
                  No Time Off Scheduled
                </h3>
                <p className="text-charcoal-500 text-center">
                  No team members have time off scheduled for {MONTHS[month]} {year}.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {eventsByEmployee.map(({ employee, events }) => (
                  <div
                    key={employee.id}
                    className="flex items-start gap-4 p-4 rounded-lg border border-charcoal-100 hover:bg-charcoal-50 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-charcoal-800 to-charcoal-900 flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {employee.user.full_name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-charcoal-900">{employee.user.full_name}</p>
                          <p className="text-sm text-charcoal-500">{employee.job_title}</p>
                        </div>
                        {employee.department && (
                          <Badge variant="secondary" className="bg-charcoal-100">
                            <Building2 className="h-3 w-3 mr-1" />
                            {employee.department}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {events.map((event) => (
                          <Link
                            key={event.id}
                            href={`/employee/operations/leave/${event.id}`}
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs bg-charcoal-100 hover:bg-charcoal-200 transition-colors"
                          >
                            <span className={cn('w-2 h-2 rounded-full', LEAVE_TYPE_COLORS[event.type as keyof typeof LEAVE_TYPE_COLORS])} />
                            <span className="text-charcoal-700">
                              {LEAVE_TYPE_LABELS[event.type as keyof typeof LEAVE_TYPE_LABELS]}
                            </span>
                            <span className="text-charcoal-500">
                              {new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(event.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                            {event.status === 'pending' && (
                              <Badge className="bg-amber-100 text-amber-700 text-[10px] px-1 py-0">Pending</Badge>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
