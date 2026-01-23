'use client'

import { useState, useEffect } from 'react'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'
import { Loader2, User } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { CampaignProspect } from '@/types/campaign'

interface EditProspectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  prospect: CampaignProspect | null
  onSuccess?: () => void
}

export function EditProspectDialog({
  open,
  onOpenChange,
  prospect,
  onSuccess,
}: EditProspectDialogProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    title: '',
    linkedinUrl: '',
  })

  const utils = trpc.useUtils()

  // Initialize form with prospect data
  useEffect(() => {
    if (prospect) {
      setFormData({
        firstName: prospect.firstName || '',
        lastName: prospect.lastName || '',
        email: prospect.email || '',
        phone: prospect.phone || '',
        companyName: prospect.companyName || '',
        title: prospect.title || '',
        linkedinUrl: '', // Would need to be added to CampaignProspect type if needed
      })
    }
  }, [prospect])

  const updateMutation = trpc.crm.campaigns.updateProspect.useMutation({
    onSuccess: () => {
      toast.success('Prospect updated successfully')
      utils.crm.campaigns.getProspects.invalidate()
      utils.crm.campaigns.getFullEntity.invalidate()
      onSuccess?.()
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update prospect')
    },
  })

  const handleSubmit = () => {
    if (!prospect) return

    if (!formData.email.trim()) {
      toast.error('Email is required')
      return
    }

    updateMutation.mutate({
      prospectId: prospect.id,
      firstName: formData.firstName.trim() || undefined,
      lastName: formData.lastName.trim() || undefined,
      email: formData.email.trim(),
      phone: formData.phone.trim() || undefined,
      companyName: formData.companyName.trim() || undefined,
      title: formData.title.trim() || undefined,
      linkedinUrl: formData.linkedinUrl.trim() || undefined,
    })
  }

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-charcoal-500" />
            Edit Prospect
          </DialogTitle>
          <DialogDescription>
            Update contact information for this prospect
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Name Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="John"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder="Doe"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="john@example.com"
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          {/* Company */}
          <div className="space-y-2">
            <Label htmlFor="companyName">Company</Label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              placeholder="Acme Inc."
            />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Job Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="VP of Engineering"
            />
          </div>

          {/* LinkedIn */}
          <div className="space-y-2">
            <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
            <Input
              id="linkedinUrl"
              type="url"
              value={formData.linkedinUrl}
              onChange={(e) => handleChange('linkedinUrl', e.target.value)}
              placeholder="https://linkedin.com/in/johndoe"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={updateMutation.isPending || !formData.email.trim()}
          >
            {updateMutation.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
