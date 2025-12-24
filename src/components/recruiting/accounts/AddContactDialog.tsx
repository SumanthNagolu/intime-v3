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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Linkedin } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { PhoneInput, formatPhoneValue, type PhoneCountryCode } from '@/components/ui/phone-input'

interface AddContactDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  accountId: string
}

interface PhoneValue {
  countryCode: PhoneCountryCode
  number: string
}

const decisionAuthorityOptions = [
  { value: 'decision_maker', label: 'Decision Maker' },
  { value: 'influencer', label: 'Influencer' },
  { value: 'gatekeeper', label: 'Gatekeeper' },
  { value: 'end_user', label: 'End User' },
  { value: 'champion', label: 'Champion' },
]

const preferredContactMethodOptions = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'text', label: 'Text/SMS' },
  { value: 'video_call', label: 'Video Call' },
]

export function AddContactDialog({
  open,
  onOpenChange,
  accountId,
}: AddContactDialogProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()

  // Basic Info
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [title, setTitle] = useState('')
  const [department, setDepartment] = useState('')

  // Contact Details
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState<PhoneValue>({ countryCode: 'US', number: '' })
  const [mobile, setMobile] = useState<PhoneValue>({ countryCode: 'US', number: '' })
  const [linkedinUrl, setLinkedinUrl] = useState('')

  // Account Role
  const [decisionAuthority, setDecisionAuthority] = useState('')
  const [preferredContactMethod, setPreferredContactMethod] = useState('')
  const [isPrimary, setIsPrimary] = useState(false)

  // Notes
  const [notes, setNotes] = useState('')

  const createContactMutation = trpc.crm.contacts.create.useMutation({
    onSuccess: () => {
      toast({
        title: 'Contact added',
        description: 'The contact has been added to this account.',
      })
      utils.crm.contacts.listByAccount.invalidate({ accountId })
      resetForm()
      onOpenChange(false)
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add contact.',
        variant: 'error',
      })
    },
  })

  const resetForm = () => {
    setFirstName('')
    setLastName('')
    setTitle('')
    setDepartment('')
    setEmail('')
    setPhone({ countryCode: 'US', number: '' })
    setMobile({ countryCode: 'US', number: '' })
    setLinkedinUrl('')
    setDecisionAuthority('')
    setPreferredContactMethod('')
    setIsPrimary(false)
    setNotes('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!firstName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'First name is required.',
        variant: 'error',
      })
      return
    }

    // Validate LinkedIn URL if provided
    if (linkedinUrl.trim() && !linkedinUrl.trim().match(/^https?:\/\/(www\.)?linkedin\.com\//)) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid LinkedIn URL (e.g., https://linkedin.com/in/username)',
        variant: 'error',
      })
      return
    }

    // Format phone numbers
    const formattedPhone = formatPhoneValue(phone)
    const formattedMobile = formatPhoneValue(mobile)

    createContactMutation.mutate({
      accountId,
      firstName: firstName.trim(),
      lastName: lastName.trim() || undefined,
      title: title.trim() || undefined,
      department: department.trim() || undefined,
      email: email.trim() || undefined,
      phone: formattedPhone || undefined,
      mobile: formattedMobile || undefined,
      linkedinUrl: linkedinUrl.trim() || undefined,
      decisionAuthority: decisionAuthority as 'decision_maker' | 'influencer' | 'gatekeeper' | 'end_user' | 'champion' | undefined,
      preferredContactMethod: preferredContactMethod as 'email' | 'phone' | 'linkedin' | 'text' | 'video_call' | undefined,
      isPrimary,
      notes: notes.trim() || undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Contact</DialogTitle>
            <DialogDescription>
              Add a new contact person for this account.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Info Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
                Basic Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Smith"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="VP of Engineering"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Engineering"
                  />
                </div>
              </div>
            </div>

            {/* Contact Details Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
                Contact Details
              </h4>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <PhoneInput
                  label="Office Phone"
                  value={phone}
                  onChange={setPhone}
                  placeholder="(555) 123-4567"
                />
                <PhoneInput
                  label="Mobile Phone"
                  value={mobile}
                  onChange={setMobile}
                  placeholder="(555) 987-6543"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedinUrl" className="flex items-center gap-1.5">
                  <Linkedin className="w-4 h-4 text-charcoal-400" />
                  LinkedIn Profile
                </Label>
                <Input
                  id="linkedinUrl"
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/johnsmith"
                />
              </div>
            </div>

            {/* Account Role Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
                Account Role
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="decisionAuthority">Decision Authority</Label>
                  <Select value={decisionAuthority} onValueChange={setDecisionAuthority}>
                    <SelectTrigger id="decisionAuthority">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {decisionAuthorityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferredContactMethod">Preferred Contact Method</Label>
                  <Select value={preferredContactMethod} onValueChange={setPreferredContactMethod}>
                    <SelectTrigger id="preferredContactMethod">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      {preferredContactMethodOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPrimary"
                  checked={isPrimary}
                  onCheckedChange={(checked) => setIsPrimary(checked === true)}
                />
                <Label htmlFor="isPrimary" className="text-sm font-normal">
                  Set as primary contact for this account
                </Label>
              </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
                Notes
              </h4>
              <div className="space-y-2">
                <Label htmlFor="notes">Relationship Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this contact's preferences, communication style, etc."
                  rows={3}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createContactMutation.isPending}>
              {createContactMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Add Contact
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
