'use client'

import { useState, useEffect } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, User } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'

interface ProspectData {
  id: string
  first_name?: string
  last_name?: string
  email?: string
  company_name?: string
  title?: string
  linkedin_url?: string
  status: string
  response_type?: string
  response_text?: string
  engagement_score?: number
}

interface EditProspectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaignId: string
  prospect: ProspectData | null
  onSuccess?: () => void
}

const statusOptions = [
  { value: 'enrolled', label: 'Enrolled' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'engaged', label: 'Engaged' },
  { value: 'responded', label: 'Responded' },
  { value: 'unsubscribed', label: 'Unsubscribed' },
  { value: 'bounced', label: 'Bounced' },
]

const responseTypeOptions = [
  { value: '', label: 'No Response' },
  { value: 'positive', label: 'Positive' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'negative', label: 'Negative' },
]

export function EditProspectDialog({
  open,
  onOpenChange,
  campaignId,
  prospect,
  onSuccess,
}: EditProspectDialogProps) {
  // Form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [title, setTitle] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [status, setStatus] = useState('enrolled')
  const [responseType, setResponseType] = useState('')
  const [responseText, setResponseText] = useState('')
  const [engagementScore, setEngagementScore] = useState(0)

  // Reset form when dialog opens or prospect changes
  useEffect(() => {
    if (open && prospect) {
      setFirstName(prospect.first_name || '')
      setLastName(prospect.last_name || '')
      setEmail(prospect.email || '')
      setCompanyName(prospect.company_name || '')
      setTitle(prospect.title || '')
      setLinkedinUrl(prospect.linkedin_url || '')
      setStatus(prospect.status || 'enrolled')
      setResponseType(prospect.response_type || '')
      setResponseText(prospect.response_text || '')
      setEngagementScore(prospect.engagement_score || 0)
    }
  }, [open, prospect])

  const utils = trpc.useUtils()

  const updateProspect = trpc.crm.campaigns.updateProspect.useMutation({
    onSuccess: () => {
      toast.success('Prospect updated successfully')
      utils.crm.campaigns.getProspects.invalidate({ campaignId })
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update prospect')
    },
  })

  const handleSubmit = async () => {
    if (!prospect) return

    await updateProspect.mutateAsync({
      prospectId: prospect.id,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      email: email || undefined,
      companyName: companyName || undefined,
      title: title || undefined,
      linkedinUrl: linkedinUrl || undefined,
      status: status as 'enrolled' | 'contacted' | 'engaged' | 'responded' | 'converted' | 'unsubscribed' | 'bounced',
      responseType: responseType as 'positive' | 'neutral' | 'negative' | undefined,
      responseText: responseText || undefined,
      engagementScore,
    })
  }

  if (!prospect) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-charcoal-600" />
            Edit Prospect
          </DialogTitle>
          <DialogDescription>
            Update prospect information and engagement details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-charcoal-700">Contact Information</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-xs">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-xs">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="linkedinUrl" className="text-xs">LinkedIn URL</Label>
              <Input
                id="linkedinUrl"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/..."
              />
            </div>
          </div>

          {/* Company Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-charcoal-700">Company Information</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="companyName" className="text-xs">Company</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Company name"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Job title"
                />
              </div>
            </div>
          </div>

          {/* Engagement */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-charcoal-700">Engagement</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="status" className="text-xs">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="engagementScore" className="text-xs">Engagement Score</Label>
                <Input
                  id="engagementScore"
                  type="number"
                  min={0}
                  max={100}
                  value={engagementScore}
                  onChange={(e) => setEngagementScore(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="responseType" className="text-xs">Response Type</Label>
              <Select value={responseType || 'none'} onValueChange={(val) => setResponseType(val === 'none' ? '' : val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select response type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Response</SelectItem>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {responseType && (
              <div className="space-y-1.5">
                <Label htmlFor="responseText" className="text-xs">Response Notes</Label>
                <Textarea
                  id="responseText"
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Notes about the response..."
                  rows={3}
                  className="resize-none"
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={updateProspect.isPending}>
            {updateProspect.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}








