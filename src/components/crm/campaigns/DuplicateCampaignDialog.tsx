'use client'

import { useState, useEffect } from 'react'
import { trpc } from '@/lib/trpc/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, Copy, Clock, FileStack } from 'lucide-react'
import { toast } from 'sonner'

interface DuplicateCampaignDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaignId: string
  originalName: string
  onSuccess?: () => void
}

export function DuplicateCampaignDialog({
  open,
  onOpenChange,
  campaignId,
  originalName,
  onSuccess,
}: DuplicateCampaignDialogProps) {
  const [newName, setNewName] = useState(`${originalName} (Copy)`)
  const [includeSchedule, setIncludeSchedule] = useState(true)
  const [includeSequenceTemplates, setIncludeSequenceTemplates] = useState(true)

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setNewName(`${originalName} (Copy)`)
      setIncludeSchedule(true)
      setIncludeSequenceTemplates(true)
    }
  }, [open, originalName])

  const duplicateCampaign = trpc.crm.campaigns.duplicate.useMutation({
    onSuccess: () => {
      toast.success('Campaign duplicated successfully')
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to duplicate campaign')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newName.trim().length < 3) {
      toast.error('Campaign name must be at least 3 characters')
      return
    }
    duplicateCampaign.mutate({
      id: campaignId,
      newName: newName.trim(),
      includeSchedule,
      includeSequenceTemplates,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="w-5 h-5" />
            Duplicate Campaign
          </DialogTitle>
          <DialogDescription>
            Create a copy of &quot;{originalName}&quot; with a new name. The duplicate will be created as a draft.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="newName">New Campaign Name</Label>
              <Input
                id="newName"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter campaign name"
                className="mt-2"
                autoFocus
              />
            </div>

            <div className="border-t border-charcoal-100 pt-4">
              <Label className="text-sm font-medium text-charcoal-700 mb-3 block">Include in Copy</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="includeSchedule"
                    checked={includeSchedule}
                    onCheckedChange={(checked) => setIncludeSchedule(checked === true)}
                  />
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-charcoal-400" />
                    <Label htmlFor="includeSchedule" className="text-sm font-normal cursor-pointer">
                      Schedule settings (send window, days, timezone)
                    </Label>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="includeSequenceTemplates"
                    checked={includeSequenceTemplates}
                    onCheckedChange={(checked) => setIncludeSequenceTemplates(checked === true)}
                  />
                  <div className="flex items-center gap-2">
                    <FileStack className="w-4 h-4 text-charcoal-400" />
                    <Label htmlFor="includeSequenceTemplates" className="text-sm font-normal cursor-pointer">
                      Sequence templates
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={duplicateCampaign.isPending}>
              {duplicateCampaign.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Duplicate
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
