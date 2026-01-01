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
import { Loader2, Linkedin, MapPin } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { PhoneInput, formatPhoneValue, type PhoneCountryCode } from '@/components/ui/phone-input'
import { PostalCodeInput } from '@/components/ui/postal-code-input'
import { getStatesByCountry, OPERATING_COUNTRIES } from '@/components/addresses'

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

  // Address
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zip, setZip] = useState('')
  const [country, setCountry] = useState('US')
  
  // Get state options based on country
  const stateOptions = getStatesByCountry(country)

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
    // Reset address
    setStreet('')
    setCity('')
    setState('')
    setZip('')
    setCountry('US')
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

    // Prepare address if any field is filled
    const hasAddress = street.trim() || city.trim() || state || zip.trim()
    const addressData = hasAddress ? {
      street: street.trim() || undefined,
      city: city.trim() || undefined,
      state: state || undefined,
      zip: zip.trim() || undefined,
      country: country || 'US',
    } : undefined

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
      address: addressData,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[90vh]">
          {/* Fixed Header */}
          <div className="px-6 pt-6 pb-4 border-b border-charcoal-100">
            <DialogHeader>
              <DialogTitle className="text-xl font-heading">Add Contact</DialogTitle>
              <DialogDescription className="text-sm text-charcoal-500 mt-1.5">
                Add a new contact person for this account.
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6">
            <div className="space-y-6">
              {/* Basic Info Section */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider pb-2 border-b border-charcoal-100">
                  Basic Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium">
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="11111-2"
                      required
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="11111-2"
                      className="h-9"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium">Job Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="11111-2"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-sm font-medium">Department</Label>
                    <Input
                      id="department"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="11111-2"
                      className="h-9"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Details Section */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider pb-2 border-b border-charcoal-100">
                  Contact Details
                </h4>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="11111@2.com"
                    className="h-9"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <PhoneInput
                    label="Office Phone"
                    value={phone}
                    onChange={setPhone}
                    placeholder="(111) 111-1111"
                  />
                  <PhoneInput
                    label="Mobile Phone"
                    value={mobile}
                    onChange={setMobile}
                    placeholder="(111) 111-1111"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl" className="flex items-center gap-1.5 text-sm font-medium">
                    <Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" />
                    LinkedIn Profile
                  </Label>
                  <Input
                    id="linkedinUrl"
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/johnsmith"
                    className="h-9"
                  />
                </div>
              </div>

              {/* Address Section */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider pb-2 border-b border-charcoal-100 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  Address
                </h4>
                <div className="space-y-2">
                  <Label htmlFor="street" className="text-sm font-medium">Street Address</Label>
                  <Input
                    id="street"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="123 Main Street"
                    className="h-9"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-medium">City</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="San Francisco"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-sm font-medium">State/Province</Label>
                    <Select 
                      value={state} 
                      onValueChange={setState}
                    >
                      <SelectTrigger id="state" className="h-9">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {stateOptions.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <PostalCodeInput
                    label="ZIP Code"
                    value={zip}
                    onChange={setZip}
                    countryCode={country}
                    className="[&_input]:h-9"
                  />
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-sm font-medium">Country</Label>
                    <Select 
                      value={country} 
                      onValueChange={(v) => {
                        setCountry(v)
                        setState('') // Reset state when country changes
                        setZip('') // Reset zip when country changes
                      }}
                    >
                      <SelectTrigger id="country" className="h-9">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {OPERATING_COUNTRIES.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Account Role Section */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider pb-2 border-b border-charcoal-100">
                  Account Role
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="decisionAuthority" className="text-sm font-medium">Decision Authority</Label>
                    <Select value={decisionAuthority} onValueChange={setDecisionAuthority}>
                      <SelectTrigger id="decisionAuthority" className="h-9">
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
                    <Label htmlFor="preferredContactMethod" className="text-sm font-medium">Preferred Contact Method</Label>
                    <Select value={preferredContactMethod} onValueChange={setPreferredContactMethod}>
                      <SelectTrigger id="preferredContactMethod" className="h-9">
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
                <div className="flex items-start space-x-2 pt-2">
                  <Checkbox
                    id="isPrimary"
                    checked={isPrimary}
                    onCheckedChange={(checked) => setIsPrimary(checked === true)}
                    className="mt-0.5"
                  />
                  <Label htmlFor="isPrimary" className="text-sm font-normal text-charcoal-600 leading-tight cursor-pointer">
                    Set as primary contact for this account
                  </Label>
                </div>
              </div>

              {/* Notes Section */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider pb-2 border-b border-charcoal-100">
                  Notes
                </h4>
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium">Relationship Notes</Label>
                  <div className="relative">
                    {/* Drag indicator on top */}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 flex gap-0.5 opacity-40 hover:opacity-60 cursor-ns-resize z-10">
                      <div className="w-8 h-1 bg-charcoal-300 rounded-full" />
                    </div>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes about this contact's preferences, communication style, etc."
                      rows={6}
                      className="resize-y text-sm min-h-[120px] pt-3"
                    />
                    {/* Drag indicator on bottom */}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5 opacity-40 hover:opacity-60 cursor-ns-resize">
                      <div className="w-8 h-1 bg-charcoal-300 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="px-6 py-4 border-t border-charcoal-100 bg-charcoal-25">
            <DialogFooter className="gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="min-w-[100px] h-9 uppercase text-xs font-semibold tracking-wider"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createContactMutation.isPending}
                className="min-w-[120px] h-9 uppercase text-xs font-semibold tracking-wider"
              >
                {createContactMutation.isPending && (
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                )}
                Add Contact
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
