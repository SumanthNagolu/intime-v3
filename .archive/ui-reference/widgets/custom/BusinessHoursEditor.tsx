'use client';

/**
 * Business Hours Editor Widget
 *
 * Allows configuration of business hours by day of week.
 * Supports enable/disable toggle, time pickers, and timezone selection.
 */

import React, { useState } from 'react';
import { Clock, Check, X, Copy, Globe } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SectionWidgetProps } from '../../registry/section-widget-registry';

interface DayHours {
  enabled: boolean;
  start: string;
  end: string;
}

type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

type BusinessHoursData = Record<DayOfWeek, DayHours>;

const DAYS_OF_WEEK: { id: DayOfWeek; label: string; short: string }[] = [
  { id: 'monday', label: 'Monday', short: 'Mon' },
  { id: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { id: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { id: 'thursday', label: 'Thursday', short: 'Thu' },
  { id: 'friday', label: 'Friday', short: 'Fri' },
  { id: 'saturday', label: 'Saturday', short: 'Sat' },
  { id: 'sunday', label: 'Sunday', short: 'Sun' },
];

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? '00' : '30';
  const time = `${hour.toString().padStart(2, '0')}:${minute}`;
  const ampm = hour < 12 ? 'AM' : 'PM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return { value: time, label: `${displayHour}:${minute} ${ampm}` };
});

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'UTC', label: 'UTC' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
];

const DEFAULT_HOURS: BusinessHoursData = {
  monday: { enabled: true, start: '09:00', end: '17:00' },
  tuesday: { enabled: true, start: '09:00', end: '17:00' },
  wednesday: { enabled: true, start: '09:00', end: '17:00' },
  thursday: { enabled: true, start: '09:00', end: '17:00' },
  friday: { enabled: true, start: '09:00', end: '17:00' },
  saturday: { enabled: false, start: '10:00', end: '14:00' },
  sunday: { enabled: false, start: '10:00', end: '14:00' },
};

function DayRow({
  day,
  hours,
  onChange,
  onCopyToAll,
}: {
  day: { id: DayOfWeek; label: string; short: string };
  hours: DayHours;
  onChange: (updates: Partial<DayHours>) => void;
  onCopyToAll: () => void;
}) {
  return (
    <div className={cn(
      "flex items-center gap-4 p-3 rounded-lg transition-colors",
      hours.enabled ? "bg-white" : "bg-charcoal-50"
    )}>
      {/* Enable toggle */}
      <button
        onClick={() => onChange({ enabled: !hours.enabled })}
        className={cn(
          "w-6 h-6 rounded-md flex items-center justify-center transition-colors shrink-0",
          hours.enabled
            ? "bg-forest-500 text-white"
            : "bg-charcoal-200 text-charcoal-400"
        )}
      >
        {hours.enabled ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
      </button>

      {/* Day label */}
      <span className={cn(
        "w-24 font-medium",
        hours.enabled ? "text-charcoal-900" : "text-charcoal-400"
      )}>
        {day.label}
      </span>

      {/* Time pickers */}
      {hours.enabled ? (
        <div className="flex items-center gap-2 flex-1">
          <select
            value={hours.start}
            onChange={(e) => onChange({ start: e.target.value })}
            className="px-3 py-1.5 text-sm border border-charcoal-200 rounded-lg bg-white focus:ring-2 focus:ring-forest-500 focus:border-transparent"
          >
            {TIME_OPTIONS.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <span className="text-charcoal-400">to</span>
          <select
            value={hours.end}
            onChange={(e) => onChange({ end: e.target.value })}
            className="px-3 py-1.5 text-sm border border-charcoal-200 rounded-lg bg-white focus:ring-2 focus:ring-forest-500 focus:border-transparent"
          >
            {TIME_OPTIONS.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCopyToAll}
            className="h-8 gap-1 text-xs text-charcoal-500 hover:text-charcoal-700"
            title="Copy to all days"
          >
            <Copy className="w-3 h-3" />
            Copy to all
          </Button>
        </div>
      ) : (
        <span className="text-sm text-charcoal-400 italic">Closed</span>
      )}
    </div>
  );
}

export function BusinessHoursEditor({ definition, data, context }: SectionWidgetProps) {
  const isLoading = context?.isLoading;
  const [hours, setHours] = useState<BusinessHoursData>(
    (data as BusinessHoursData | undefined) || DEFAULT_HOURS
  );
  const [timezone, setTimezone] = useState('America/New_York');
  const [hasChanges, setHasChanges] = useState(false);

  const handleDayChange = (day: DayOfWeek, updates: Partial<DayHours>) => {
    setHours(prev => ({
      ...prev,
      [day]: { ...prev[day], ...updates },
    }));
    setHasChanges(true);
  };

  const handleCopyToAll = (sourceDay: DayOfWeek) => {
    const source = hours[sourceDay];
    const newHours = { ...hours };
    DAYS_OF_WEEK.forEach(d => {
      if (d.id !== sourceDay) {
        newHours[d.id] = { ...source };
      }
    });
    setHours(newHours);
    setHasChanges(true);
  };

  const handleSave = () => {
    console.log('Saving hours:', hours, 'timezone:', timezone);
    setHasChanges(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-forest-100 rounded-lg animate-pulse" />
            <div className="h-6 w-40 bg-stone-200 rounded animate-pulse" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="h-12 bg-stone-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const openDays = DAYS_OF_WEEK.filter(d => hours[d.id].enabled).length;

  return (
    <Card className="border-charcoal-100 shadow-elevation-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-forest rounded-lg flex items-center justify-center shadow-sm">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-heading font-bold text-charcoal-900">
                {(typeof definition.title === 'string' ? definition.title : 'Business Hours') || 'Business Hours'}
              </CardTitle>
              <p className="text-sm text-charcoal-500 mt-0.5">
                Open {openDays} days per week
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Timezone selector */}
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-charcoal-100">
          <Globe className="w-4 h-4 text-charcoal-400" />
          <span className="text-sm text-charcoal-600">Timezone:</span>
          <select
            value={timezone}
            onChange={(e) => { setTimezone(e.target.value); setHasChanges(true); }}
            className="px-3 py-1.5 text-sm border border-charcoal-200 rounded-lg bg-white focus:ring-2 focus:ring-forest-500 focus:border-transparent"
          >
            {TIMEZONES.map(tz => (
              <option key={tz.value} value={tz.value}>{tz.label}</option>
            ))}
          </select>
        </div>

        {/* Days list */}
        <div className="space-y-2">
          {DAYS_OF_WEEK.map(day => (
            <DayRow
              key={day.id}
              day={day}
              hours={hours[day.id]}
              onChange={(updates) => handleDayChange(day.id, updates)}
              onCopyToAll={() => handleCopyToAll(day.id)}
            />
          ))}
        </div>

        {/* Quick actions */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-charcoal-100">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newHours = { ...hours };
              DAYS_OF_WEEK.slice(0, 5).forEach(d => { newHours[d.id] = { enabled: true, start: '09:00', end: '17:00' }; });
              DAYS_OF_WEEK.slice(5).forEach(d => { newHours[d.id] = { enabled: false, start: '10:00', end: '14:00' }; });
              setHours(newHours);
              setHasChanges(true);
            }}
          >
            Set Mon-Fri 9-5
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newHours = { ...hours };
              DAYS_OF_WEEK.forEach(d => { newHours[d.id].enabled = true; });
              setHours(newHours);
              setHasChanges(true);
            }}
          >
            Open All Days
          </Button>
        </div>

        {/* Save button */}
        {hasChanges && (
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-charcoal-100">
            <Button variant="outline" onClick={() => { setHours(DEFAULT_HOURS); setHasChanges(false); }}>
              Reset
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Check className="w-4 h-4" />
              Save Hours
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default BusinessHoursEditor;
