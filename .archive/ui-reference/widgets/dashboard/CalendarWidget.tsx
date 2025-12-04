'use client';

/**
 * Calendar Widget
 *
 * Displays upcoming calendar events (interviews and scheduled activities)
 * grouped by day.
 */

import React from 'react';
import { Calendar, Video, Phone, Users, Clock, MapPin, ChevronRight, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { SectionWidgetProps } from '../../registry/section-widget-registry';

interface CalendarEvent {
  id: string;
  type: string;
  title: string | null;
  scheduledAt: string | Date | null;
  durationMinutes?: number | null;
  interviewType?: string | null;
  meetingLink?: string | null;
  eventType: 'interview' | 'activity';
  date: string | Date | null;
  priority?: string | null;
}

interface CalendarData {
  events: CalendarEvent[];
  groupedByDay: Record<string, CalendarEvent[]>;
}

const EVENT_ICONS: Record<string, React.ElementType> = {
  interview: Video,
  call: Phone,
  meeting: Users,
  default: Calendar,
};

function formatTime(date: string | Date | null): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function EventItem({ event }: { event: CalendarEvent }) {
  const Icon = EVENT_ICONS[event.eventType === 'interview' ? 'interview' : (event.type || 'default')] || EVENT_ICONS.default;
  const time = formatTime(event.scheduledAt || event.date);

  return (
    <div className={cn(
      "flex items-start gap-3 p-3 rounded-lg transition-all duration-200",
      "hover:bg-charcoal-50 group"
    )}>
      <div className="flex flex-col items-center shrink-0 w-12">
        <span className="text-xs font-bold text-charcoal-500 uppercase">
          {time}
        </span>
        {event.durationMinutes && (
          <span className="text-[10px] text-charcoal-400">
            {event.durationMinutes}m
          </span>
        )}
      </div>
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
        event.eventType === 'interview' ? "bg-forest-100 text-forest-600" : "bg-charcoal-100 text-charcoal-600"
      )}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-charcoal-900 truncate">
          {event.title || 'Untitled event'}
        </p>
        {event.interviewType && (
          <p className="text-xs text-charcoal-500 capitalize">
            {event.interviewType} interview
          </p>
        )}
      </div>
      {event.meetingLink && (
        <a
          href={event.meetingLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="shrink-0 p-2 text-forest-600 hover:text-forest-700 hover:bg-forest-50 rounded-lg transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      )}
    </div>
  );
}

function DayGroup({ day, events }: { day: string; events: CalendarEvent[] }) {
  const isToday = day.toLowerCase().includes('today') ||
    new Date(events[0]?.date || '').toDateString() === new Date().toDateString();

  return (
    <div>
      <div className="flex items-center gap-2 mb-2 px-3">
        <span className={cn(
          "text-xs font-bold uppercase tracking-wider",
          isToday ? "text-forest-600" : "text-charcoal-500"
        )}>
          {day}
        </span>
        {isToday && (
          <span className="text-[10px] font-bold text-forest-600 bg-forest-100 px-2 py-0.5 rounded-full">
            TODAY
          </span>
        )}
        <span className="text-xs text-charcoal-400">
          ({events.length} events)
        </span>
      </div>
      <div className="space-y-1">
        {events.map((event) => (
          <EventItem key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}

export function CalendarWidget({ definition, data, context }: SectionWidgetProps) {
  const calendarData = data as CalendarData | undefined;
  const isLoading = context?.isLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold-100 rounded-lg animate-pulse" />
            <div className="h-6 w-40 bg-stone-200 rounded animate-pulse" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-32 bg-stone-200 rounded animate-pulse" />
                <div className="h-14 w-full bg-stone-100 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const groupedByDay = calendarData?.groupedByDay || {};
  const days = Object.keys(groupedByDay);
  const totalEvents = calendarData?.events?.length || 0;

  return (
    <Card className="border-charcoal-100 shadow-elevation-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-gold rounded-lg flex items-center justify-center shadow-sm">
              <Calendar className="w-5 h-5 text-charcoal-900" />
            </div>
            <div>
              <CardTitle className="text-lg font-heading font-bold text-charcoal-900">
                {(typeof definition.title === 'string' ? definition.title : 'Upcoming') || 'Upcoming'}
              </CardTitle>
              <p className="text-sm text-charcoal-500 mt-0.5">
                {totalEvents} events next 3 days
              </p>
            </div>
          </div>
          <Link
            href="/employee/workspace/calendar"
            className="text-xs font-bold text-forest-600 hover:text-forest-700 uppercase tracking-wider"
          >
            Full Calendar
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {days.length > 0 ? (
          <div className="space-y-6">
            {days.map((day) => (
              <DayGroup
                key={day}
                day={day}
                events={groupedByDay[day]}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-charcoal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-charcoal-400" />
            </div>
            <p className="text-sm font-medium text-charcoal-600">
              No upcoming events
            </p>
            <p className="text-xs text-charcoal-400 mt-1">
              Your calendar is clear for the next 3 days
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CalendarWidget;
