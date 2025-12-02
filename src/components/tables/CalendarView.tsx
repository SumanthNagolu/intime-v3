'use client';

/**
 * CalendarView Component
 *
 * Calendar view for interviews, tasks, and activities.
 */

import * as React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  List,
  LayoutGrid,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// ==========================================
// TYPES
// ==========================================

export type CalendarViewMode = 'month' | 'week' | 'day' | 'agenda';

export interface CalendarEvent<T = unknown> {
  id: string;
  title: string;
  start: Date;
  end?: Date;
  allDay?: boolean;
  color?: string;
  data: T;
}

export interface CalendarViewProps<T> {
  /** Events to display */
  events: CalendarEvent<T>[];

  /** Current date */
  date?: Date;

  /** View mode */
  view?: CalendarViewMode;

  /** On date change */
  onDateChange?: (date: Date) => void;

  /** On view change */
  onViewChange?: (view: CalendarViewMode) => void;

  /** On event click */
  onEventClick?: (event: CalendarEvent<T>) => void;

  /** On date click (for creating new events) */
  onDateClick?: (date: Date) => void;

  /** Render custom event */
  renderEvent?: (event: CalendarEvent<T>) => React.ReactNode;

  /** Loading state */
  loading?: boolean;

  /** Additional class name */
  className?: string;
}

// ==========================================
// CONSTANTS
// ==========================================

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// ==========================================
// MAIN COMPONENT
// ==========================================

export function CalendarView<T>({
  events,
  date: propDate,
  view: propView = 'month',
  onDateChange,
  onViewChange,
  onEventClick,
  onDateClick,
  renderEvent,
  loading = false,
  className,
}: CalendarViewProps<T>) {
  const [currentDate, setCurrentDate] = React.useState(propDate ?? new Date());
  const [currentView, setCurrentView] = React.useState<CalendarViewMode>(propView);

  React.useEffect(() => {
    if (propDate) setCurrentDate(propDate);
  }, [propDate]);

  React.useEffect(() => {
    if (propView) setCurrentView(propView);
  }, [propView]);

  const handleDateChange = (newDate: Date) => {
    setCurrentDate(newDate);
    onDateChange?.(newDate);
  };

  const handleViewChange = (newView: CalendarViewMode) => {
    setCurrentView(newView);
    onViewChange?.(newView);
  };

  const goToPrev = () => {
    const newDate = new Date(currentDate);
    if (currentView === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (currentView === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    handleDateChange(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (currentView === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (currentView === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    handleDateChange(newDate);
  };

  const goToToday = () => {
    handleDateChange(new Date());
  };

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={goToPrev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={goToNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <h2 className="text-lg font-semibold">
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant={currentView === 'month' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => handleViewChange('month')}
          >
            <LayoutGrid className="h-4 w-4 mr-1" />
            Month
          </Button>
          <Button
            variant={currentView === 'week' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => handleViewChange('week')}
          >
            <CalendarIcon className="h-4 w-4 mr-1" />
            Week
          </Button>
          <Button
            variant={currentView === 'agenda' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => handleViewChange('agenda')}
          >
            <List className="h-4 w-4 mr-1" />
            Agenda
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {currentView === 'month' && (
          <MonthView
            date={currentDate}
            events={events}
            onEventClick={onEventClick}
            onDateClick={onDateClick}
            renderEvent={renderEvent}
          />
        )}
        {currentView === 'week' && (
          <WeekView
            date={currentDate}
            events={events}
            onEventClick={onEventClick}
            onDateClick={onDateClick}
            renderEvent={renderEvent}
          />
        )}
        {currentView === 'agenda' && (
          <AgendaView
            date={currentDate}
            events={events}
            onEventClick={onEventClick}
            renderEvent={renderEvent}
          />
        )}
      </div>
    </div>
  );
}

// ==========================================
// MONTH VIEW
// ==========================================

interface MonthViewProps<T> {
  date: Date;
  events: CalendarEvent<T>[];
  onEventClick?: (event: CalendarEvent<T>) => void;
  onDateClick?: (date: Date) => void;
  renderEvent?: (event: CalendarEvent<T>) => React.ReactNode;
}

function MonthView<T>({
  date,
  events,
  onEventClick,
  onDateClick,
  renderEvent,
}: MonthViewProps<T>) {
  const calendar = React.useMemo(() => getMonthCalendar(date), [date]);

  const getEventsForDate = (day: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.start);
      return (
        eventDate.getFullYear() === day.getFullYear() &&
        eventDate.getMonth() === day.getMonth() &&
        eventDate.getDate() === day.getDate()
      );
    });
  };

  const today = new Date();

  return (
    <div className="grid grid-cols-7">
      {/* Header */}
      {DAYS.map((day) => (
        <div
          key={day}
          className="p-2 text-center text-sm font-medium text-muted-foreground border-b"
        >
          {day}
        </div>
      ))}

      {/* Days */}
      {calendar.map((week, weekIndex) =>
        week.map((day, dayIndex) => {
          const dayEvents = getEventsForDate(day);
          const isToday =
            day.getFullYear() === today.getFullYear() &&
            day.getMonth() === today.getMonth() &&
            day.getDate() === today.getDate();
          const isCurrentMonth = day.getMonth() === date.getMonth();

          return (
            <div
              key={`${weekIndex}-${dayIndex}`}
              className={cn(
                'min-h-[100px] p-1 border-b border-r cursor-pointer hover:bg-muted/50',
                !isCurrentMonth && 'bg-muted/20 text-muted-foreground'
              )}
              onClick={() => onDateClick?.(day)}
            >
              <div
                className={cn(
                  'text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full',
                  isToday && 'bg-primary text-primary-foreground'
                )}
              >
                {day.getDate()}
              </div>

              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                  >
                    {renderEvent ? (
                      renderEvent(event)
                    ) : (
                      <DefaultEventBadge event={event} />
                    )}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-muted-foreground pl-1">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// ==========================================
// WEEK VIEW
// ==========================================

function WeekView<T>({
  date,
  events,
  onEventClick,
  onDateClick,
  renderEvent,
}: MonthViewProps<T>) {
  const week = React.useMemo(() => getWeekDays(date), [date]);

  const getEventsForDate = (day: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.start);
      return (
        eventDate.getFullYear() === day.getFullYear() &&
        eventDate.getMonth() === day.getMonth() &&
        eventDate.getDate() === day.getDate()
      );
    });
  };

  const today = new Date();

  return (
    <div className="grid grid-cols-7">
      {/* Header */}
      {week.map((day, index) => {
        const isToday =
          day.getFullYear() === today.getFullYear() &&
          day.getMonth() === today.getMonth() &&
          day.getDate() === today.getDate();

        return (
          <div
            key={index}
            className="p-2 text-center border-b"
          >
            <div className="text-sm text-muted-foreground">{DAYS[day.getDay()]}</div>
            <div
              className={cn(
                'text-lg font-semibold w-10 h-10 mx-auto flex items-center justify-center rounded-full',
                isToday && 'bg-primary text-primary-foreground'
              )}
            >
              {day.getDate()}
            </div>
          </div>
        );
      })}

      {/* Day columns */}
      {week.map((day, index) => {
        const dayEvents = getEventsForDate(day);

        return (
          <div
            key={index}
            className="min-h-[400px] p-2 border-r hover:bg-muted/50 cursor-pointer"
            onClick={() => onDateClick?.(day)}
          >
            <div className="space-y-2">
              {dayEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick?.(event);
                  }}
                >
                  {renderEvent ? (
                    renderEvent(event)
                  ) : (
                    <DefaultEventCard event={event} />
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ==========================================
// AGENDA VIEW
// ==========================================

function AgendaView<T>({
  date,
  events,
  onEventClick,
  renderEvent,
}: Omit<MonthViewProps<T>, 'onDateClick'>) {
  // Get events for the next 30 days
  const upcomingEvents = React.useMemo(() => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 30);

    return events
      .filter((event) => {
        const eventDate = new Date(event.start);
        return eventDate >= start && eventDate <= end;
      })
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  }, [date, events]);

  // Group by date
  const grouped = React.useMemo(() => {
    const groups: Map<string, CalendarEvent<T>[]> = new Map();

    upcomingEvents.forEach((event) => {
      const dateKey = new Date(event.start).toDateString();
      if (!groups.has(dateKey)) {
        groups.set(dateKey, []);
      }
      groups.get(dateKey)!.push(event);
    });

    return Array.from(groups.entries());
  }, [upcomingEvents]);

  if (grouped.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No upcoming events
      </div>
    );
  }

  return (
    <div className="divide-y">
      {grouped.map(([dateKey, dayEvents]) => {
        const eventDate = new Date(dateKey);

        return (
          <div key={dateKey} className="p-4">
            <h3 className="font-medium mb-3">
              {eventDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </h3>

            <div className="space-y-2 pl-4">
              {dayEvents.map((event) => (
                <div
                  key={event.id}
                  className="cursor-pointer"
                  onClick={() => onEventClick?.(event)}
                >
                  {renderEvent ? (
                    renderEvent(event)
                  ) : (
                    <DefaultEventCard event={event} showTime />
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ==========================================
// DEFAULT EVENT RENDERERS
// ==========================================

interface DefaultEventBadgeProps<T> {
  event: CalendarEvent<T>;
}

function DefaultEventBadge<T>({ event }: DefaultEventBadgeProps<T>) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'text-xs px-1.5 py-0.5 rounded truncate cursor-pointer',
              event.color ?? 'bg-primary/10 text-primary'
            )}
          >
            {event.title}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{event.title}</p>
          <p className="text-xs">
            {new Date(event.start).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            })}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface DefaultEventCardProps<T> {
  event: CalendarEvent<T>;
  showTime?: boolean;
}

function DefaultEventCard<T>({ event, showTime }: DefaultEventCardProps<T>) {
  return (
    <div
      className={cn(
        'p-2 rounded-md border',
        event.color ?? 'bg-primary/5 border-primary/20'
      )}
    >
      <div className="font-medium text-sm">{event.title}</div>
      {showTime && (
        <div className="text-xs text-muted-foreground">
          {new Date(event.start).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
          })}
          {event.end && (
            <>
              {' - '}
              {new Date(event.end).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ==========================================
// HELPERS
// ==========================================

function getMonthCalendar(date: Date): Date[][] {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const calendar: Date[][] = [];
  let week: Date[] = [];

  // Add days from previous month
  const startDayOfWeek = firstDay.getDay();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = new Date(year, month, -i);
    week.push(day);
  }

  // Add days of current month
  for (let day = 1; day <= lastDay.getDate(); day++) {
    week.push(new Date(year, month, day));
    if (week.length === 7) {
      calendar.push(week);
      week = [];
    }
  }

  // Add days from next month
  if (week.length > 0) {
    const remaining = 7 - week.length;
    for (let i = 1; i <= remaining; i++) {
      week.push(new Date(year, month + 1, i));
    }
    calendar.push(week);
  }

  return calendar;
}

function getWeekDays(date: Date): Date[] {
  const day = date.getDay();
  const diff = date.getDate() - day;

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(date);
    d.setDate(diff + i);
    return d;
  });
}

export default CalendarView;
