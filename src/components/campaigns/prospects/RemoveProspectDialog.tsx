'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'
import { Loader2, UserMinus, AlertTriangle } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { CampaignProspect } from '@/types/campaign'

interface RemoveProspectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  prospect: CampaignProspect | null
  onSuccess?: () => void
}

export function RemoveProspectDialog({
  open,
  onOpenChange,
  prospect,
  onSuccess,
}: RemoveProspectDialogProps) {
  const [reason, setReason] = useState('')

  const utils = trpc.useUtils()

  const unenrollMutation = trpc.crm.campaigns.unenrollProspect.useMutation({
    onSuccess: () => {
      toast.success('Prospect removed from campaign')
      utils.crm.campaigns.getProspects.invalidate()
      utils.crm.campaigns.getFullEntity.invalidate()
      onSuccess?.()
      handleClose()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to remove prospect')
    },
  })

  const handleClose = () => {
    setReason('')
    onOpenChange(false)
  }

  const handleConfirm = () => {
    if (!prospect) return

    unenrollMutation.mutate({
      prospectId: prospect.id,
      reason: reason.trim() || undefined,
    })
  }

  const fullName = prospect
    ? [prospect.firstName, prospect.lastName].filter(Boolean).join(' ') || 'this prospect'
    : 'this prospect'

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <UserMinus className="w-5 h-5" />
            Remove Prospect
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">This action cannot be undone.</p>
                <p className="mt-1">
                  <strong>{fullName}</strong> will be removed from this campaign and will no longer receive
                  any outreach from this sequence.
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4">
          <Label htmlFor="reason" className="text-charcoal-700">
            Reason for removal (optional)
          </Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Wrong contact, duplicate, no longer relevant..."
            className="mt-2"
            rows={2}
          />
        </div>

        <AlertDialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={unenrollMutation.isPending}
          >
            {unenrollMutation.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Remove Prospect
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
