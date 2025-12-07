'use client'

import { useState, useEffect } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UpdateStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  jobId: string
  currentStatus: string
  jobTitle: string
  positionsFilled: number
  positionsCount: number
  onSuccess?: () => void
}

type JobStatus = 'draft' | 'open' | 'active' | 'on_hold' | 'filled' | 'cancelled'

const STATUS_CONFIG: Record<JobStatus, { label: string; color: string; description: string }> = {
  draft: { label: 'Draft', color: 'bg-charcoal-200 text-charcoal-700', description: 'Not yet published' },
  open: { label: 'Open', color: 'bg-blue-100 text-blue-800', description: 'Ready for sourcing' },
  active: { label: 'Active', color: 'bg-green-100 text-green-800', description: 'Actively recruiting' },
  on_hold: { label: 'On Hold', color: 'bg-amber-100 text-amber-800', description: 'Temporarily paused' },
  filled: { label: 'Filled', color: 'bg-purple-100 text-purple-800', description: 'All positions filled' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', description: 'No longer needed' },
}

// Valid status transitions
const VALID_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  draft: ['open', 'cancelled'],
  open: ['active', 'on_hold', 'cancelled', 'filled'],
  active: ['on_hold', 'filled', 'cancelled'],
  on_hold: ['open', 'active', 'cancelled'],
  filled: ['open'],
  cancelled: ['open'],
}

export function UpdateStatusDialog({
  open,
  onOpenChange,
  jobId,
  currentStatus,
  jobTitle,
  positionsFilled,
  positionsCount,
  onSuccess,
}: UpdateStatusDialogProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()

  const [newStatus, setNewStatus] = useState<JobStatus | ''>('')
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [expectedReactivationDate, setExpectedReactivationDate] = useState('')

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setNewStatus('')
      setReason('')
      setNotes('')
      setExpectedReactivationDate('')
    }
  }, [open])

  const updateStatusMutation = trpc.ats.jobs.updateStatus.useMutation({
    onSuccess: (data) => {
      utils.ats.jobs.getById.invalidate({ id: jobId })
      utils.ats.jobs.list.invalidate()
      utils.ats.jobs.getStatusHistory.invalidate({ jobId })
      toast({
        title: 'Status updated',
        description: `Job status changed from ${data.previousStatus} to ${data.newStatus}`,
      })
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast({
        title: 'Error updating status',
        description: error.message,
        variant: 'error',
      })
    },
  })

  const availableTransitions = VALID_TRANSITIONS[currentStatus as JobStatus] || []

  const requiresReason = newStatus === 'on_hold' || newStatus === 'cancelled'
  const isFilledDisabled = newStatus === 'filled' && positionsFilled < positionsCount

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStatus) return

    updateStatusMutation.mutate({
      jobId,
      newStatus: newStatus as JobStatus,
      reason: reason || undefined,
      notes: notes || undefined,
      expectedReactivationDate: expectedReactivationDate || undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Update Job Status</DialogTitle>
            <DialogDescription>{jobTitle}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Current Status */}
            <div>
              <Label className="text-charcoal-500">Current Status</Label>
              <div className="mt-1">
                <span className={cn('inline-flex px-3 py-1 rounded-full text-sm font-medium', STATUS_CONFIG[currentStatus as JobStatus]?.color)}>
                  {STATUS_CONFIG[currentStatus as JobStatus]?.label || currentStatus}
                </span>
              </div>
            </div>

            {/* New Status Selection */}
            <div>
              <Label>Change To</Label>
              {availableTransitions.length === 0 ? (
                <p className="text-sm text-charcoal-500 mt-2">No status transitions available from current status.</p>
              ) : (
                <RadioGroup value={newStatus} onValueChange={(v) => setNewStatus(v as JobStatus)} className="mt-2 space-y-2">
                  {availableTransitions.map((status) => {
                    const config = STATUS_CONFIG[status]
                    const isFilled = status === 'filled'
                    const disabled = isFilled && positionsFilled < positionsCount

                    return (
                      <div
                        key={status}
                        className={cn(
                          'flex items-center space-x-3 p-3 rounded-lg border transition-colors',
                          newStatus === status ? 'border-hublot-900 bg-hublot-50' : 'border-charcoal-200',
                          disabled && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        <RadioGroupItem value={status} id={status} disabled={disabled} />
                        <div className="flex-1">
                          <label
                            htmlFor={status}
                            className={cn('block font-medium cursor-pointer', disabled && 'cursor-not-allowed')}
                          >
                            <span className={cn('inline-flex px-2 py-0.5 rounded text-xs font-medium', config.color)}>
                              {config.label}
                            </span>
                          </label>
                          <p className="text-xs text-charcoal-500 mt-0.5">{config.description}</p>
                          {isFilled && disabled && (
                            <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              {positionsFilled}/{positionsCount} positions filled
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </RadioGroup>
              )}
            </div>

            {/* Reason (required for on_hold and cancelled) */}
            {requiresReason && (
              <div>
                <Label htmlFor="reason">
                  Reason *
                  <span className="text-charcoal-500 text-xs ml-1">(required)</span>
                </Label>
                <Input
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={newStatus === 'on_hold' ? 'e.g., Budget review pending' : 'e.g., Client cancelled requisition'}
                  required
                  maxLength={500}
                />
              </div>
            )}

            {/* Expected Reactivation Date (for on_hold) */}
            {newStatus === 'on_hold' && (
              <div>
                <Label htmlFor="reactivationDate">Expected Reactivation Date</Label>
                <Input
                  id="reactivationDate"
                  type="date"
                  value={expectedReactivationDate}
                  onChange={(e) => setExpectedReactivationDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            )}

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional context or notes..."
                rows={2}
                maxLength={2000}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!newStatus || updateStatusMutation.isPending || (requiresReason && !reason) || isFilledDisabled}
            >
              {updateStatusMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Update Status
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
