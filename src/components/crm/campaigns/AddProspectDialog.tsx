'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  UserPlus,
  Loader2,
  Mail,
  Linkedin,
  Phone,
} from 'lucide-react'
import { toast } from 'sonner'

interface AddProspectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaignId: string
  onSuccess?: () => void
}

interface ProspectFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  linkedinUrl: string
  companyName: string
  companyIndustry: string
  companySize: string
  title: string
  location: string
  channel: 'email' | 'linkedin' | 'phone'
}

const initialFormData: ProspectFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  linkedinUrl: '',
  companyName: '',
  companyIndustry: '',
  companySize: '',
  title: '',
  location: '',
  channel: 'email',
}

const channelOptions = [
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { value: 'phone', label: 'Phone', icon: Phone },
] as const

export function AddProspectDialog({
  open,
  onOpenChange,
  campaignId,
  onSuccess,
}: AddProspectDialogProps) {
  const [formData, setFormData] = useState<ProspectFormData>(initialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const utils = trpc.useUtils()

  const addProspects = trpc.crm.campaigns.addProspects.useMutation({
    onSuccess: (result) => {
      if (result.added > 0) {
        toast.success('Prospect added successfully')
        utils.crm.campaigns.getProspects.invalidate({ campaignId })
        onSuccess?.()
        handleClose()
      } else {
        toast.error('Prospect already exists in this campaign')
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add prospect')
    },
  })

  const handleClose = () => {
    setFormData(initialFormData)
    setErrors({})
    onOpenChange(false)
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    addProspects.mutate({
      campaignId,
      channel: formData.channel,
      prospects: [{
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        email: formData.email,
        phone: formData.phone || undefined,
        linkedinUrl: formData.linkedinUrl || undefined,
        companyName: formData.companyName || undefined,
        companyIndustry: formData.companyIndustry || undefined,
        companySize: formData.companySize || undefined,
        title: formData.title || undefined,
        location: formData.location || undefined,
      }],
    })
  }

  const updateField = (field: keyof ProspectFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-hublot-600" />
            Add Prospect
          </DialogTitle>
          <DialogDescription>
            Add a single prospect to this campaign
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => updateField('firstName', e.target.value)}
                placeholder="John"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => updateField('lastName', e.target.value)}
                placeholder="Doe"
              />
            </div>
          </div>

          {/* Email - Required */}
          <div className="space-y-1.5">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="john@company.com"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Company & Title */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="companyName">Company</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => updateField('companyName', e.target.value)}
                placeholder="Acme Corp"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="VP Engineering"
              />
            </div>
          </div>

          {/* Phone & LinkedIn */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
              <Input
                id="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={(e) => updateField('linkedinUrl', e.target.value)}
                placeholder="linkedin.com/in/johndoe"
              />
            </div>
          </div>

          {/* Location & Industry */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => updateField('location', e.target.value)}
                placeholder="San Francisco, CA"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="companyIndustry">Industry</Label>
              <Input
                id="companyIndustry"
                value={formData.companyIndustry}
                onChange={(e) => updateField('companyIndustry', e.target.value)}
                placeholder="Technology"
              />
            </div>
          </div>

          {/* Channel Selection */}
          <div className="space-y-1.5">
            <Label>Primary Channel</Label>
            <Select
              value={formData.channel}
              onValueChange={(value: 'email' | 'linkedin' | 'phone') => 
                updateField('channel', value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {channelOptions.map(({ value, label, icon: Icon }) => (
                  <SelectItem key={value} value={value}>
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={addProspects.isPending} className="gap-2">
              {addProspects.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Add Prospect
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

