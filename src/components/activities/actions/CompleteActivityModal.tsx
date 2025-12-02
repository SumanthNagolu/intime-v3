/**
 * Complete Activity Modal
 *
 * Modal for completing an activity with outcome selection.
 */

'use client';

import React, { useState, useMemo } from 'react';
import { CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getPattern, getPatternOutcomes, getPatternChecklist } from '@/lib/activities/patterns';
import type { PatternOutcome, ChecklistItem } from '@/lib/activities/patterns';

export interface CompleteActivityModalProps {
  /** Whether modal is open */
  open: boolean;

  /** Open change handler */
  onOpenChange: (open: boolean) => void;

  /** Activity ID */
  activityId: string;

  /** Pattern ID for outcomes */
  patternId?: string;

  /** Activity subject for display */
  subject?: string;

  /** Existing checklist state */
  checklistState?: Record<string, boolean>;

  /** Callback on completion */
  onComplete: (outcome: string | undefined, notes: string, createFollowUp?: boolean) => void;
}

export function CompleteActivityModal({
  open,
  onOpenChange,
  activityId,
  patternId,
  subject,
  checklistState = {},
  onComplete,
}: CompleteActivityModalProps) {
  const [selectedOutcome, setSelectedOutcome] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [createFollowUp, setCreateFollowUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get pattern outcomes
  const outcomes = useMemo(() => {
    if (!patternId) return [];
    return getPatternOutcomes(patternId);
  }, [patternId]);

  // Get checklist items
  const checklist = useMemo(() => {
    if (!patternId) return [];
    return getPatternChecklist(patternId);
  }, [patternId]);

  // Check for incomplete required items
  const incompleteRequired = useMemo(() => {
    return checklist.filter(item => item.required && !checklistState[item.id]);
  }, [checklist, checklistState]);

  // Selected outcome details
  const selectedOutcomeDetails = useMemo(() => {
    return outcomes.find(o => o.id === selectedOutcome);
  }, [outcomes, selectedOutcome]);

  // Reset form when opened
  React.useEffect(() => {
    if (open) {
      setSelectedOutcome('');
      setNotes('');
      setCreateFollowUp(false);
    }
  }, [open]);

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await onComplete(selectedOutcome || undefined, notes, createFollowUp);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canComplete = incompleteRequired.length === 0 &&
    (outcomes.length === 0 || selectedOutcome);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Complete Activity
          </DialogTitle>
          {subject && (
            <DialogDescription className="text-base font-medium text-foreground">
              {subject}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Incomplete Required Items Warning */}
          {incompleteRequired.length > 0 && (
            <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Required checklist items incomplete
                </p>
                <ul className="mt-1 text-sm text-amber-700 list-disc list-inside">
                  {incompleteRequired.map(item => (
                    <li key={item.id}>{item.label}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Outcome Selection */}
          {outcomes.length > 0 && (
            <div className="space-y-3">
              <Label>Outcome *</Label>
              <RadioGroup
                value={selectedOutcome}
                onValueChange={setSelectedOutcome}
                className="grid gap-2"
              >
                {outcomes.map((outcome) => (
                  <label
                    key={outcome.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border cursor-pointer',
                      'transition-colors hover:bg-muted/50',
                      selectedOutcome === outcome.id && 'border-primary bg-primary/5'
                    )}
                  >
                    <RadioGroupItem value={outcome.id} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'font-medium',
                          outcome.color === 'green' && 'text-green-700',
                          outcome.color === 'red' && 'text-red-700',
                          outcome.color === 'orange' && 'text-orange-700',
                          outcome.color === 'blue' && 'text-blue-700',
                          outcome.color === 'gray' && 'text-gray-700'
                        )}>
                          {outcome.label}
                        </span>
                        {outcome.nextActivity && (
                          <Badge variant="outline" className="text-xs">
                            <ArrowRight className="h-3 w-3 mr-1" />
                            Creates follow-up
                          </Badge>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Completion Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">
              Completion Notes
              {selectedOutcomeDetails?.requiresNotes && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about the outcome..."
              rows={3}
              required={selectedOutcomeDetails?.requiresNotes}
            />
          </div>

          {/* Create Follow-up Option */}
          {selectedOutcomeDetails?.nextActivity && (
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Checkbox
                id="createFollowUp"
                checked={createFollowUp}
                onCheckedChange={(checked) => setCreateFollowUp(checked as boolean)}
              />
              <Label htmlFor="createFollowUp" className="cursor-pointer">
                Create follow-up activity: <span className="font-medium">{selectedOutcomeDetails.nextActivity}</span>
              </Label>
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
          <Button
            onClick={handleComplete}
            disabled={!canComplete || isSubmitting}
          >
            {isSubmitting ? 'Completing...' : 'Complete Activity'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CompleteActivityModal;
