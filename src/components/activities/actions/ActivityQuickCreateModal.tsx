/**
 * Activity Quick Create Modal
 *
 * Fast activity creation with pre-filled pattern defaults.
 */

'use client';

import React, { useState, useMemo } from 'react';
import { format, addDays, addHours, setHours, setMinutes, startOfTomorrow, startOfDay, nextMonday } from 'date-fns';
import { Calendar, User, Clock, AlertCircle, Briefcase } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ActivityPattern } from '@/lib/activities/patterns';
import { getPatternDueDate, getCategoryColor } from '@/lib/activities/patterns';
import type { Priority } from '@/lib/activities/sla';

const PRIORITY_OPTIONS: Array<{ value: Priority; label: string; color: string }> = [
  { value: 'critical', label: 'Critical', color: 'text-red-600' },
  { value: 'urgent', label: 'Urgent', color: 'text-orange-600' },
  { value: 'high', label: 'High', color: 'text-amber-600' },
  { value: 'normal', label: 'Normal', color: 'text-blue-600' },
  { value: 'low', label: 'Low', color: 'text-gray-600' },
];

const DUE_DATE_PRESETS = [
  { label: 'In 1 hour', getValue: () => addHours(new Date(), 1) },
  { label: 'In 4 hours', getValue: () => addHours(new Date(), 4) },
  { label: 'Tomorrow 9 AM', getValue: () => setMinutes(setHours(startOfTomorrow(), 9), 0) },
  { label: 'Next Monday 9 AM', getValue: () => setMinutes(setHours(nextMonday(new Date()), 9), 0) },
];

export interface ActivityQuickCreateModalProps {
  /** Whether modal is open */
  open: boolean;

  /** Open change handler */
  onOpenChange: (open: boolean) => void;

  /** Selected pattern */
  pattern: ActivityPattern;

  /** Pre-fill entity type */
  entityType?: string;

  /** Pre-fill entity ID */
  entityId?: string;

  /** Entity name for display */
  entityName?: string;

  /** Success callback */
  onSuccess?: (activityId: string) => void;
}

export function ActivityQuickCreateModal({
  open,
  onOpenChange,
  pattern,
  entityType,
  entityId,
  entityName,
  onSuccess,
}: ActivityQuickCreateModalProps) {
  // Form state
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>(pattern.defaultPriority);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [assignedTo, setAssignedTo] = useState<string>('me');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate default subject
  const defaultSubject = useMemo(() => {
    if (entityName) {
      return `${pattern.name} - ${entityName}`;
    }
    return pattern.name;
  }, [pattern.name, entityName]);

  // Calculate default due date from pattern
  const defaultDueDate = useMemo(() => {
    return getPatternDueDate(pattern);
  }, [pattern]);

  // Reset form when pattern changes
  React.useEffect(() => {
    setSubject(defaultSubject);
    setDescription('');
    setPriority(pattern.defaultPriority);
    setDueDate(defaultDueDate);
    setAssignedTo('me');
  }, [pattern, defaultSubject, defaultDueDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Call tRPC mutation to create activity
      // const result = await createActivity.mutateAsync({
      //   patternId: pattern.id,
      //   subject: subject || defaultSubject,
      //   description,
      //   priority,
      //   dueAt: dueDate?.toISOString(),
      //   entityType,
      //   entityId,
      //   assignedTo: assignedTo === 'me' ? undefined : assignedTo,
      // });

      // Simulate success
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockActivityId = `act_${Date.now()}`;

      onSuccess?.(mockActivityId);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create activity:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const PatternIcon = pattern.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-lg', getCategoryColor(pattern.category))}>
                <PatternIcon className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle>New {pattern.name}</DialogTitle>
                <DialogDescription>{pattern.description}</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={defaultSubject}
                required
              />
            </div>

            {/* Related Entity */}
            {entityType && entityId && (
              <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {entityType}:
                </span>
                <span className="text-sm font-medium">{entityName || entityId}</span>
              </div>
            )}

            {/* Priority */}
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className={option.color}>{option.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label>Due Date</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {DUE_DATE_PRESETS.map((preset) => (
                  <Button
                    key={preset.label}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setDueDate(preset.getValue())}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="datetime-local"
                  value={dueDate ? format(dueDate, "yyyy-MM-dd'T'HH:mm") : ''}
                  onChange={(e) => setDueDate(e.target.value ? new Date(e.target.value) : null)}
                  className="flex-1"
                />
                {dueDate && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setDueDate(null)}
                  >
                    Clear
                  </Button>
                )}
              </div>
              {dueDate && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Due {format(dueDate, 'PPp')}
                </p>
              )}
            </div>

            {/* Assigned To */}
            <div className="space-y-2">
              <Label>Assigned To</Label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="me">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Myself</span>
                    </div>
                  </SelectItem>
                  {/* TODO: Add team members list */}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add any additional details..."
                rows={3}
              />
            </div>

            {/* Pattern Info */}
            {pattern.checklist.length > 0 && (
              <div className="flex items-start gap-2 px-3 py-2 bg-muted/50 rounded-md text-sm">
                <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-muted-foreground">
                    This activity includes a checklist with {pattern.checklist.length} items
                  </p>
                </div>
              </div>
            )}
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Activity'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ActivityQuickCreateModal;
