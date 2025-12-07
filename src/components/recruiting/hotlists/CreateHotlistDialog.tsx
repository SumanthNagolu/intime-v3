'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'

interface CreateHotlistDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CreateHotlistDialog({ open, onOpenChange, onSuccess }: CreateHotlistDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    purpose: 'general',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const utils = trpc.useUtils()
  const createMutation = trpc.bench.hotlists.create.useMutation({
    onSuccess: () => {
      toast.success('Hotlist created successfully')
      utils.bench.hotlists.list.invalidate()
      onOpenChange(false)
      resetForm()
      onSuccess?.()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create hotlist')
    }
  })

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      purpose: 'general',
    })
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a name for the hotlist')
      return
    }

    setIsSubmitting(true)
    try {
      await createMutation.mutateAsync({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        purpose: formData.purpose || undefined,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading">Create Hotlist</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Java Developers, AWS Experts"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the purpose of this hotlist..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose</Label>
            <Select
              value={formData.purpose}
              onValueChange={(value) => setFormData({ ...formData, purpose: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="job_match">Job Match</SelectItem>
                <SelectItem value="client_specific">Client Specific</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Hotlist'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
