/**
 * Cancel Activity Modal
 *
 * Confirmation modal for cancelling an activity.
 */

'use client';

import React, { useState } from 'react';
import { XCircle, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const CANCELLATION_REASONS = [
  { value: 'duplicate', label: 'Duplicate activity' },
  { value: 'no_longer_needed', label: 'No longer needed' },
  { value: 'created_in_error', label: 'Created in error' },
  { value: 'superseded', label: 'Superseded by another activity' },
  { value: 'other', label: 'Other' },
];

export interface CancelActivityModalProps {
  /** Whether modal is open */
  open: boolean;

  /** Open change handler */
  onOpenChange: (open: boolean) => void;

  /** Activity ID */
  activityId: string;

  /** Activity subject for display */
  subject?: string;

  /** Callback on cancel */
  onCancel: (reason: string, notes?: string) => void;
}

export function CancelActivityModal({
  open,
  onOpenChange,
  activityId,
  subject,
  onCancel,
}: CancelActivityModalProps) {
  const [selectedReason, setSelectedReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when opened
  React.useEffect(() => {
    if (open) {
      setSelectedReason('');
      setNotes('');
    }
  }, [open]);

  const handleCancel = async () => {
    if (!selectedReason) return;

    setIsSubmitting(true);
    try {
      const reason = CANCELLATION_REASONS.find(r => r.value === selectedReason)?.label || selectedReason;
      await onCancel(reason, notes || undefined);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = selectedReason && (selectedReason !== 'other' || notes.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <XCircle className="h-5 w-5" />
            Cancel Activity
          </DialogTitle>
          {subject && (
            <DialogDescription className="text-base font-medium text-foreground">
              {subject}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Warning */}
          <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">
                This action cannot be undone
              </p>
              <p className="text-sm text-red-700 mt-1">
                The activity will be marked as cancelled and removed from the active queue.
              </p>
            </div>
          </div>

          {/* Reason Selection */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for cancellation *</Label>
            <Select value={selectedReason} onValueChange={setSelectedReason}>
              <SelectTrigger id="reason">
                <SelectValue placeholder="Select a reason..." />
              </SelectTrigger>
              <SelectContent>
                {CANCELLATION_REASONS.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">
              Additional notes
              {selectedReason === 'other' && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide any additional context..."
              rows={3}
              required={selectedReason === 'other'}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Keep Activity
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? 'Cancelling...' : 'Cancel Activity'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CancelActivityModal;
