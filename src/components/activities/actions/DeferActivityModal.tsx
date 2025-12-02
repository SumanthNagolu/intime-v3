/**
 * Defer Activity Modal
 *
 * Modal for deferring/snoozing an activity to a later time.
 */

'use client';

import React, { useState } from 'react';
import { format, addHours, addDays, setHours, setMinutes, startOfTomorrow, nextMonday } from 'date-fns';
import { Clock, Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const SNOOZE_PRESETS = [
  { label: '1 hour', getValue: () => addHours(new Date(), 1), icon: '⏰' },
  { label: '4 hours', getValue: () => addHours(new Date(), 4), icon: '🕓' },
  { label: 'Tomorrow 9 AM', getValue: () => setMinutes(setHours(startOfTomorrow(), 9), 0), icon: '🌅' },
  { label: 'Next Monday 9 AM', getValue: () => setMinutes(setHours(nextMonday(new Date()), 9), 0), icon: '📅' },
];

export interface DeferActivityModalProps {
  /** Whether modal is open */
  open: boolean;

  /** Open change handler */
  onOpenChange: (open: boolean) => void;

  /** Activity ID */
  activityId: string;

  /** Activity subject for display */
  subject?: string;

  /** Current due date */
  currentDueDate?: Date;

  /** Callback on defer */
  onDefer: (deferredUntil: Date, reason?: string) => void;
}

export function DeferActivityModal({
  open,
  onOpenChange,
  activityId,
  subject,
  currentDueDate,
  onDefer,
}: DeferActivityModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [customDate, setCustomDate] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when opened
  React.useEffect(() => {
    if (open) {
      setSelectedDate(null);
      setCustomDate('');
      setReason('');
    }
  }, [open]);

  const handlePresetClick = (preset: typeof SNOOZE_PRESETS[0]) => {
    const date = preset.getValue();
    setSelectedDate(date);
    setCustomDate(format(date, "yyyy-MM-dd'T'HH:mm"));
  };

  const handleCustomDateChange = (value: string) => {
    setCustomDate(value);
    if (value) {
      setSelectedDate(new Date(value));
    } else {
      setSelectedDate(null);
    }
  };

  const handleDefer = async () => {
    if (!selectedDate) return;

    setIsSubmitting(true);
    try {
      await onDefer(selectedDate, reason || undefined);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if deferring for more than 1 day (requires reason)
  const isDeferringLong = selectedDate &&
    (selectedDate.getTime() - Date.now()) > 24 * 60 * 60 * 1000;

  const canDefer = selectedDate && (!isDeferringLong || reason.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-600" />
            Defer Activity
          </DialogTitle>
          {subject && (
            <DialogDescription className="text-base font-medium text-foreground">
              {subject}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current due date info */}
          {currentDueDate && (
            <div className="text-sm text-muted-foreground">
              Currently due: {format(currentDueDate, 'PPp')}
            </div>
          )}

          {/* Quick snooze presets */}
          <div className="space-y-2">
            <Label>Snooze for</Label>
            <div className="grid grid-cols-2 gap-2">
              {SNOOZE_PRESETS.map((preset) => (
                <Button
                  key={preset.label}
                  type="button"
                  variant={selectedDate && format(selectedDate, "yyyy-MM-dd'T'HH:mm") === format(preset.getValue(), "yyyy-MM-dd'T'HH:mm")
                    ? 'default'
                    : 'outline'
                  }
                  className="justify-start"
                  onClick={() => handlePresetClick(preset)}
                >
                  <span className="mr-2">{preset.icon}</span>
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom date/time */}
          <div className="space-y-2">
            <Label htmlFor="customDate">Or choose a specific time</Label>
            <Input
              id="customDate"
              type="datetime-local"
              value={customDate}
              onChange={(e) => handleCustomDateChange(e.target.value)}
              min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
            />
          </div>

          {/* New due date display */}
          {selectedDate && (
            <div className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <Calendar className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-purple-800">
                  New due date
                </p>
                <p className="text-sm text-purple-700">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')} at {format(selectedDate, 'h:mm a')}
                </p>
              </div>
            </div>
          )}

          {/* Reason (required for long deferrals) */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              Reason
              {isDeferringLong && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why is this being deferred?"
              rows={2}
              required={isDeferringLong ? true : undefined}
            />
            {isDeferringLong && !reason.trim() && (
              <p className="text-xs text-muted-foreground">
                Reason is required when deferring for more than 24 hours
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDefer}
            disabled={!canDefer || isSubmitting}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isSubmitting ? 'Deferring...' : 'Defer Activity'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeferActivityModal;
