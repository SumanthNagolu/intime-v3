/**
 * Activity Calendar View
 *
 * Calendar view of activities with month/week/day modes.
 */

'use client';

import React, { useState, useMemo } from 'react';
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
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { calculateSLAStatus, getSLAColors, type Priority } from '@/lib/activities/sla';
import { getPattern, getCategoryColor } from '@/lib/activities/patterns';
import { getStatusConfig, type ActivityStatus } from '@/lib/activities/transitions';

// ==========================================
// TYPES
// ==========================================

export interface Activity {
  id: string;
  subject: string;
  patternId: string;
  status: ActivityStatus;
  priority: Priority;
  dueAt?: string;
  entityType?: string;
  entityName?: string;
}

export type CalendarView = 'month' | 'week' | 'day';

export interface ActivityCalendarProps {
  /** Activities to display */
  activities: Activity[];

  /** Calendar view mode */
  view?: CalendarView;

  /** Selected date */
  selectedDate?: Date;

  /** Date change handler */
  onDateChange?: (date: Date) => void;

  /** View change handler */
  onViewChange?: (view: CalendarView) => void;

  /** Activity click handler */
  onActivityClick?: (activity: Activity) => void;

  /** Enable drag to reschedule */
  enableDragReschedule?: boolean;

  /** Reschedule handler */
  onReschedule?: (activityId: string, newDate: Date) => void;

  /** Additional className */
  className?: string;
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function getActivitiesForDate(activities: Activity[], date: Date): Activity[] {
  return activities.filter((activity) => {
    if (!activity.dueAt) return false;
    return isSameDay(parseISO(activity.dueAt), date);
  });
}

function getPriorityColor(priority: Priority): string {
  switch (priority) {
    case 'critical':
      return 'bg-red-500';
    case 'urgent':
      return 'bg-orange-500';
    case 'high':
      return 'bg-amber-500';
    case 'normal':
      return 'bg-blue-500';
    case 'low':
      return 'bg-gray-400';
  }
}

// ==========================================
// SUB-COMPONENTS
// ==========================================

function ActivityDot({
  activity,
  onClick,
}: {
  activity: Activity;
  onClick?: () => void;
}) {
  const pattern = getPattern(activity.patternId);
  const slaStatus = calculateSLAStatus(activity.dueAt, activity.priority);
  const slaColors = getSLAColors(slaStatus);

  return (
    <button
      onClick={onClick}
      className={cn(
        'h-2 w-2 rounded-full transition-transform hover:scale-150',
        getPriorityColor(activity.priority)
      )}
      title={activity.subject}
    />
  );
}

function ActivityItem({
  activity,
  onClick,
  compact = false,
}: {
  activity: Activity;
  onClick?: () => void;
  compact?: boolean;
}) {
  const pattern = getPattern(activity.patternId);
  const slaStatus = calculateSLAStatus(activity.dueAt, activity.priority);
  const slaColors = getSLAColors(slaStatus);
  const statusConfig = getStatusConfig(activity.status);
  const PatternIcon = pattern?.icon || CalendarIcon;

  if (compact) {
    return (
      <button
        onClick={onClick}
        className={cn(
          'w-full text-left text-xs p-1 rounded truncate',
          'hover:bg-muted transition-colors',
          pattern ? getCategoryColor(pattern.category) : 'bg-gray-100'
        )}
      >
        {activity.subject}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-2 rounded-lg border transition-colors',
        'hover:border-primary hover:bg-primary/5',
        activity.status === 'completed' && 'opacity-60'
      )}
    >
      <div className="flex items-start gap-2">
        <div className={cn('p-1 rounded', pattern ? getCategoryColor(pattern.category) : 'bg-gray-100')}>
          <PatternIcon className="h-3 w-3" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{activity.subject}</p>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            {activity.dueAt && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {format(parseISO(activity.dueAt), 'h:mm a')}
              </span>
            )}
            <Badge variant="outline" className={cn('text-[9px] px-1', statusConfig.color)}>
              {statusConfig.label}
            </Badge>
          </div>
        </div>
        <span className={cn('h-2 w-2 rounded-full flex-shrink-0', slaColors.dot)} />
      </div>
    </button>
  );
}

function DayCell({
  date,
  activities,
  isCurrentMonth,
  isSelected,
  onClick,
  onActivityClick,
}: {
  date: Date;
  activities: Activity[];
  isCurrentMonth: boolean;
  isSelected: boolean;
  onClick: () => void;
  onActivityClick?: (activity: Activity) => void;
}) {
  const today = isToday(date);
  const hasActivities = activities.length > 0;
  const overdueCount = activities.filter(a =>
    a.status !== 'completed' && a.status !== 'cancelled'
  ).length;

  return (
    <div
      className={cn(
        'min-h-[100px] p-1 border-r border-b cursor-pointer transition-colors',
        'hover:bg-muted/50',
        !isCurrentMonth && 'bg-muted/30 text-muted-foreground',
        isSelected && 'bg-primary/10',
        today && 'bg-amber-50'
      )}
      onClick={onClick}
    >
      {/* Day Number */}
      <div className="flex items-center justify-between mb-1">
        <span className={cn(
          'text-sm font-medium h-6 w-6 flex items-center justify-center rounded-full',
          today && 'bg-primary text-primary-foreground'
        )}>
          {format(date, 'd')}
        </span>
        {overdueCount > 0 && (
          <Badge variant="destructive" className="text-[10px] px-1 h-4">
            {overdueCount}
          </Badge>
        )}
      </div>

      {/* Activities */}
      <div className="space-y-0.5">
        {activities.slice(0, 3).map((activity) => (
          <ActivityItem
            key={activity.id}
            activity={activity}
            onClick={() => onActivityClick?.(activity)}
            compact
          />
        ))}
        {activities.length > 3 && (
          <Popover>
            <PopoverTrigger asChild>
              <button className="text-xs text-muted-foreground hover:text-foreground w-full text-left">
                +{activities.length - 3} more
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-2">
              <div className="space-y-2">
                {activities.map((activity) => (
                  <ActivityItem
                    key={activity.id}
                    activity={activity}
                    onClick={() => onActivityClick?.(activity)}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function ActivityCalendar({
  activities,
  view = 'month',
  selectedDate: initialSelectedDate,
  onDateChange,
  onViewChange,
  onActivityClick,
  enableDragReschedule = false,
  onReschedule,
  className,
}: ActivityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(initialSelectedDate || new Date());
  const [currentView, setCurrentView] = useState(view);
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialSelectedDate || null);

  // Navigation
  const navigate = (direction: 'prev' | 'next') => {
    switch (currentView) {
      case 'month':
        setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(direction === 'prev' ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1));
        break;
      case 'day':
        setCurrentDate(direction === 'prev' ? subDays(currentDate, 1) : addDays(currentDate, 1));
        break;
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
    onDateChange?.(new Date());
  };

  // Get days to display
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);

  // Week view days
  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(currentDate);
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, [currentDate]);

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    onDateChange?.(date);
  };

  const handleViewChange = (newView: CalendarView) => {
    setCurrentView(newView);
    onViewChange?.(newView);
  };

  // Title based on view
  const title = useMemo(() => {
    switch (currentView) {
      case 'month':
        return format(currentDate, 'MMMM yyyy');
      case 'week':
        const weekStart = startOfWeek(currentDate);
        const weekEnd = endOfWeek(currentDate);
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      case 'day':
        return format(currentDate, 'EEEE, MMMM d, yyyy');
    }
  }, [currentDate, currentView]);

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => navigate('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <h2 className="text-lg font-semibold ml-2">{title}</h2>
        </div>

        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          {(['month', 'week', 'day'] as CalendarView[]).map((v) => (
            <Button
              key={v}
              variant={currentView === v ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewChange(v)}
              className="capitalize"
            >
              {v}
            </Button>
          ))}
        </div>
      </div>

      {/* Month View */}
      {currentView === 'month' && (
        <div className="flex-1 overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-t border-l">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="p-2 text-center text-sm font-medium text-muted-foreground border-r border-b bg-muted/50"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 border-l overflow-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
            {calendarDays.map((day) => (
              <DayCell
                key={day.toISOString()}
                date={day}
                activities={getActivitiesForDate(activities, day)}
                isCurrentMonth={isSameMonth(day, currentDate)}
                isSelected={selectedDate ? isSameDay(day, selectedDate) : false}
                onClick={() => handleDayClick(day)}
                onActivityClick={onActivityClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Week View */}
      {currentView === 'week' && (
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-7 border-t border-l h-full">
            {weekDays.map((day) => {
              const dayActivities = getActivitiesForDate(activities, day);
              const today = isToday(day);

              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'flex flex-col border-r p-2',
                    today && 'bg-amber-50'
                  )}
                >
                  <div className="text-center mb-2">
                    <p className="text-xs text-muted-foreground">{format(day, 'EEE')}</p>
                    <p className={cn(
                      'text-lg font-semibold h-8 w-8 mx-auto flex items-center justify-center rounded-full',
                      today && 'bg-primary text-primary-foreground'
                    )}>
                      {format(day, 'd')}
                    </p>
                  </div>
                  <div className="flex-1 space-y-1 overflow-auto">
                    {dayActivities.map((activity) => (
                      <ActivityItem
                        key={activity.id}
                        activity={activity}
                        onClick={() => onActivityClick?.(activity)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Day View */}
      {currentView === 'day' && (
        <div className="flex-1 overflow-auto">
          <Card className="p-4">
            <div className="space-y-2">
              {getActivitiesForDate(activities, currentDate).length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No activities scheduled for this day</p>
                </div>
              ) : (
                getActivitiesForDate(activities, currentDate).map((activity) => (
                  <ActivityItem
                    key={activity.id}
                    activity={activity}
                    onClick={() => onActivityClick?.(activity)}
                  />
                ))
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default ActivityCalendar;
