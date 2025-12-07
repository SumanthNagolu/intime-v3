'use client'

import { useState } from 'react'
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
import { Loader2, Copy } from 'lucide-react'
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
          <div className="py-4">
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
