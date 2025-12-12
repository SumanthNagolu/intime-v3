'use client'

import { useState } from 'react'
import {
  CheckCircle,
  XCircle,
  MessageSquare,
  AlertTriangle,
  Clock,
  User,
  DollarSign,
  TrendingUp,
  Loader2,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'
import { format } from 'date-fns'

type ApprovalAction = 'approve' | 'reject' | 'request_changes'

interface RateApprovalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  approvalId: string
  entityType: string
  entityName?: string
  billRate: number
  payRate: number
  marginPercentage: number
  effectiveDate: Date
  requestedBy?: string
  requestedAt?: Date
  onApprovalComplete?: () => void
}

/**
 * RateApprovalDialog - Rate approval workflow dialog
 *
 * Features:
 * - Approve, reject, or request changes on rate proposals
 * - Comment field for approval notes
 * - Visual summary of rate being approved
 * - Margin quality indicator
 */
export function RateApprovalDialog({
  open,
  onOpenChange,
  approvalId,
  entityType,
  entityName,
  billRate,
  payRate,
  marginPercentage,
  effectiveDate,
  requestedBy,
  requestedAt,
  onApprovalComplete,
}: RateApprovalDialogProps) {
  const [action, setAction] = useState<ApprovalAction>('approve')
  const [comments, setComments] = useState('')
  const utils = trpc.useUtils()

  const approveMutation = trpc.rates.approvals.approve.useMutation({
    onSuccess: () => {
      utils.rates.approvals.list.invalidate()
      onOpenChange(false)
      setAction('approve')
      setComments('')
      onApprovalComplete?.()
    },
  })

  const rejectMutation = trpc.rates.approvals.reject.useMutation({
    onSuccess: () => {
      utils.rates.approvals.list.invalidate()
      onOpenChange(false)
      setAction('approve')
      setComments('')
      onApprovalComplete?.()
    },
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value)
  }

  const getMarginQuality = (margin: number) => {
    if (margin >= 20) return { label: 'Excellent', color: 'bg-green-100 text-green-700' }
    if (margin >= 15) return { label: 'Good', color: 'bg-green-100 text-green-700' }
    if (margin >= 10) return { label: 'Acceptable', color: 'bg-amber-100 text-amber-700' }
    if (margin >= 5) return { label: 'Low', color: 'bg-amber-100 text-amber-700' }
    return { label: 'Critical', color: 'bg-red-100 text-red-700' }
  }

  const marginQuality = getMarginQuality(marginPercentage)

  const handleSubmit = () => {
    if (action === 'approve') {
      approveMutation.mutate({
        id: approvalId,
        reason: comments || undefined,
      })
    } else {
      // Both 'reject' and 'request_changes' use the reject mutation
      rejectMutation.mutate({
        id: approvalId,
        reason: comments || 'Rejected',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-gold-500" />
            Rate Approval Request
          </DialogTitle>
          <DialogDescription>
            Review and process the rate approval request for {entityName || entityType}
          </DialogDescription>
        </DialogHeader>

        {/* Rate Summary */}
        <div className="bg-charcoal-50 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-charcoal-500">Entity</span>
            <span className="font-medium text-charcoal-900">
              {entityName || entityType}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-xs text-charcoal-500 mb-1">Bill Rate</p>
              <p className="text-lg font-bold text-charcoal-900">
                {formatCurrency(billRate)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-charcoal-500 mb-1">Pay Rate</p>
              <p className="text-lg font-bold text-charcoal-900">
                {formatCurrency(payRate)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-charcoal-500 mb-1">Margin</p>
              <p className="text-lg font-bold text-charcoal-900">
                {marginPercentage.toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-charcoal-200">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-charcoal-400" />
              <span className="text-sm text-charcoal-600">Margin Quality</span>
            </div>
            <Badge className={marginQuality.color}>{marginQuality.label}</Badge>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-charcoal-400" />
              <span className="text-charcoal-500">Effective Date</span>
            </div>
            <span className="font-medium text-charcoal-900">
              {format(effectiveDate, 'MMM d, yyyy')}
            </span>
          </div>

          {requestedBy && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-charcoal-400" />
                <span className="text-charcoal-500">Requested By</span>
              </div>
              <span className="font-medium text-charcoal-900">{requestedBy}</span>
            </div>
          )}

          {requestedAt && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-charcoal-500">Requested At</span>
              <span className="text-charcoal-700">
                {format(requestedAt, 'MMM d, yyyy h:mm a')}
              </span>
            </div>
          )}
        </div>

        {/* Margin Warning */}
        {marginPercentage < 10 && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-800">Low Margin Warning</p>
              <p className="text-amber-700">
                This rate has a margin below 10%. Consider requesting changes or reviewing the rate structure.
              </p>
            </div>
          </div>
        )}

        {/* Action Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Decision</Label>
          <RadioGroup
            value={action}
            onValueChange={(value) => setAction(value as ApprovalAction)}
            className="space-y-2"
          >
            <div
              className={cn(
                'flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all duration-200',
                action === 'approve'
                  ? 'border-green-500 bg-green-50'
                  : 'border-charcoal-200 hover:border-charcoal-300'
              )}
              onClick={() => setAction('approve')}
            >
              <RadioGroupItem value="approve" id="approve" />
              <CheckCircle className={cn(
                'w-5 h-5',
                action === 'approve' ? 'text-green-600' : 'text-charcoal-400'
              )} />
              <div className="flex-1">
                <Label htmlFor="approve" className="cursor-pointer font-medium">
                  Approve
                </Label>
                <p className="text-xs text-charcoal-500">
                  Accept this rate and make it active
                </p>
              </div>
            </div>

            <div
              className={cn(
                'flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all duration-200',
                action === 'request_changes'
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-charcoal-200 hover:border-charcoal-300'
              )}
              onClick={() => setAction('request_changes')}
            >
              <RadioGroupItem value="request_changes" id="request_changes" />
              <MessageSquare className={cn(
                'w-5 h-5',
                action === 'request_changes' ? 'text-amber-600' : 'text-charcoal-400'
              )} />
              <div className="flex-1">
                <Label htmlFor="request_changes" className="cursor-pointer font-medium">
                  Request Changes
                </Label>
                <p className="text-xs text-charcoal-500">
                  Ask for modifications before approval
                </p>
              </div>
            </div>

            <div
              className={cn(
                'flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all duration-200',
                action === 'reject'
                  ? 'border-red-500 bg-red-50'
                  : 'border-charcoal-200 hover:border-charcoal-300'
              )}
              onClick={() => setAction('reject')}
            >
              <RadioGroupItem value="reject" id="reject" />
              <XCircle className={cn(
                'w-5 h-5',
                action === 'reject' ? 'text-red-600' : 'text-charcoal-400'
              )} />
              <div className="flex-1">
                <Label htmlFor="reject" className="cursor-pointer font-medium">
                  Reject
                </Label>
                <p className="text-xs text-charcoal-500">
                  Decline this rate proposal
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Comments */}
        <div className="space-y-2">
          <Label htmlFor="comments" className="text-sm font-medium">
            Comments {action !== 'approve' && <span className="text-red-500">*</span>}
          </Label>
          <Textarea
            id="comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder={
              action === 'approve'
                ? 'Optional approval notes...'
                : action === 'request_changes'
                  ? 'Describe the changes needed...'
                  : 'Provide reason for rejection...'
            }
            rows={3}
            className="resize-none"
          />
          {action !== 'approve' && !comments && (
            <p className="text-xs text-amber-600">
              Comments are required when requesting changes or rejecting
            </p>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={approveMutation.isPending || rejectMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              approveMutation.isPending ||
              rejectMutation.isPending ||
              (action !== 'approve' && !comments.trim())
            }
            className={cn(
              action === 'approve' && 'bg-green-600 hover:bg-green-700',
              action === 'request_changes' && 'bg-amber-600 hover:bg-amber-700',
              action === 'reject' && 'bg-red-600 hover:bg-red-700'
            )}
          >
            {(approveMutation.isPending || rejectMutation.isPending) && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            {action === 'approve' && 'Approve Rate'}
            {action === 'request_changes' && 'Request Changes'}
            {action === 'reject' && 'Reject Rate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
