'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, ChevronRight, ChevronLeft, Building2, CreditCard, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CreateAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Step = 1 | 2 | 3

const INDUSTRIES = [
  { value: 'technology', label: 'Technology' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance & Banking' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'retail', label: 'Retail' },
  { value: 'professional_services', label: 'Professional Services' },
  { value: 'education', label: 'Education' },
  { value: 'government', label: 'Government' },
  { value: 'energy', label: 'Energy & Utilities' },
  { value: 'telecommunications', label: 'Telecommunications' },
  { value: 'media', label: 'Media & Entertainment' },
  { value: 'other', label: 'Other' },
]

const COMPANY_TYPES = [
  { value: 'direct_client', label: 'Direct Client' },
  { value: 'implementation_partner', label: 'Implementation Partner' },
  { value: 'staffing_vendor', label: 'Staffing Vendor' },
]

const TIERS = [
  { value: 'preferred', label: 'Preferred', description: 'Standard partnership' },
  { value: 'strategic', label: 'Strategic', description: 'Key account with growth potential' },
  { value: 'exclusive', label: 'Exclusive', description: 'Sole vendor relationship' },
]

const BILLING_FREQUENCIES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
]

const MEETING_CADENCES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
]

const CONTACT_METHODS = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'slack', label: 'Slack' },
  { value: 'teams', label: 'Microsoft Teams' },
]

export function CreateAccountDialog({ open, onOpenChange }: CreateAccountDialogProps) {
  const { toast } = useToast()
  const router = useRouter()
  const utils = trpc.useUtils()

  // Multi-step wizard state
  const [step, setStep] = useState<Step>(1)

  // Form state - Step 1: Company Basics
  const [name, setName] = useState('')
  const [industry, setIndustry] = useState('')
  const [companyType, setCompanyType] = useState('direct_client')
  const [tier, setTier] = useState('')
  const [website, setWebsite] = useState('')
  const [phone, setPhone] = useState('')
  const [headquartersLocation, setHeadquartersLocation] = useState('')
  const [description, setDescription] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')

  // Form state - Step 2: Billing & Terms
  const [billingEntityName, setBillingEntityName] = useState('')
  const [billingEmail, setBillingEmail] = useState('')
  const [billingPhone, setBillingPhone] = useState('')
  const [billingAddress, setBillingAddress] = useState('')
  const [billingCity, setBillingCity] = useState('')
  const [billingState, setBillingState] = useState('')
  const [billingPostalCode, setBillingPostalCode] = useState('')
  const [billingCountry, setBillingCountry] = useState('USA')
  const [billingFrequency, setBillingFrequency] = useState('monthly')
  const [paymentTermsDays, setPaymentTermsDays] = useState('30')
  const [poRequired, setPoRequired] = useState(false)

  // Form state - Step 3: Primary Contact
  const [primaryContactName, setPrimaryContactName] = useState('')
  const [primaryContactEmail, setPrimaryContactEmail] = useState('')
  const [primaryContactTitle, setPrimaryContactTitle] = useState('')
  const [primaryContactPhone, setPrimaryContactPhone] = useState('')
  const [preferredContactMethod, setPreferredContactMethod] = useState('email')
  const [meetingCadence, setMeetingCadence] = useState('weekly')

  // Mutation
  const createMutation = trpc.crm.accounts.create.useMutation({
    onSuccess: (data) => {
      utils.crm.accounts.list.invalidate()
      utils.crm.accounts.getMy.invalidate()
      toast({
        title: 'Account created successfully',
        description: `${data.name} has been created and is ready for onboarding`,
      })
      onOpenChange(false)
      resetForm()
      router.push(`/employee/recruiting/accounts/${data.id}`)
    },
    onError: (error) => {
      toast({
        title: 'Error creating account',
        description: error.message,
        variant: 'error',
      })
    },
  })

  const resetForm = () => {
    setStep(1)
    setName('')
    setIndustry('')
    setCompanyType('direct_client')
    setTier('')
    setWebsite('')
    setPhone('')
    setHeadquartersLocation('')
    setDescription('')
    setLinkedinUrl('')
    setBillingEntityName('')
    setBillingEmail('')
    setBillingPhone('')
    setBillingAddress('')
    setBillingCity('')
    setBillingState('')
    setBillingPostalCode('')
    setBillingCountry('USA')
    setBillingFrequency('monthly')
    setPaymentTermsDays('30')
    setPoRequired(false)
    setPrimaryContactName('')
    setPrimaryContactEmail('')
    setPrimaryContactTitle('')
    setPrimaryContactPhone('')
    setPreferredContactMethod('email')
    setMeetingCadence('weekly')
  }

  const validateStep1 = () => {
    if (!name || name.length < 2) {
      toast({ title: 'Validation Error', description: 'Company name is required (min 2 characters)', variant: 'error' })
      return false
    }
    if (!industry) {
      toast({ title: 'Validation Error', description: 'Please select an industry', variant: 'error' })
      return false
    }
    return true
  }

  const validateStep2 = () => {
    // Billing info is optional but validate if email is provided
    if (billingEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billingEmail)) {
      toast({ title: 'Validation Error', description: 'Please enter a valid billing email', variant: 'error' })
      return false
    }
    return true
  }

  const validateStep3 = () => {
    // Primary contact info is optional but validate if provided
    if (primaryContactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(primaryContactEmail)) {
      toast({ title: 'Validation Error', description: 'Please enter a valid contact email', variant: 'error' })
      return false
    }
    // If contact email is provided, name should also be provided
    if (primaryContactEmail && !primaryContactName) {
      toast({ title: 'Validation Error', description: 'Please enter contact name along with email', variant: 'error' })
      return false
    }
    return true
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      setStep(3)
    }
  }

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as Step)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep3()) return

    createMutation.mutate({
      name,
      industry,
      companyType: companyType as 'direct_client' | 'implementation_partner' | 'staffing_vendor',
      status: 'prospect',
      tier: tier ? tier as 'preferred' | 'strategic' | 'exclusive' : undefined,
      website: website || undefined,
      phone: phone || undefined,
      headquartersLocation: headquartersLocation || undefined,
      description: description || undefined,
      linkedinUrl: linkedinUrl || undefined,
      // Billing
      billingEntityName: billingEntityName || undefined,
      billingEmail: billingEmail || undefined,
      billingPhone: billingPhone || undefined,
      billingAddress: billingAddress || undefined,
      billingCity: billingCity || undefined,
      billingState: billingState || undefined,
      billingPostalCode: billingPostalCode || undefined,
      billingCountry: billingCountry || undefined,
      billingFrequency: billingFrequency as 'weekly' | 'biweekly' | 'monthly',
      paymentTermsDays: paymentTermsDays ? parseInt(paymentTermsDays) : undefined,
      poRequired,
      // Communication
      preferredContactMethod: preferredContactMethod as 'email' | 'phone' | 'slack' | 'teams',
      meetingCadence: meetingCadence as 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly',
      // Primary contact
      primaryContactName: primaryContactName || undefined,
      primaryContactEmail: primaryContactEmail || undefined,
      primaryContactTitle: primaryContactTitle || undefined,
      primaryContactPhone: primaryContactPhone || undefined,
    })
  }

  const getStepIcon = (s: number) => {
    switch (s) {
      case 1:
        return <Building2 className="w-4 h-4" />
      case 2:
        return <CreditCard className="w-4 h-4" />
      case 3:
        return <Users className="w-4 h-4" />
      default:
        return null
    }
  }

  const getStepLabel = (s: number) => {
    switch (s) {
      case 1:
        return 'Company Basics'
      case 2:
        return 'Billing & Terms'
      case 3:
        return 'Primary Contact'
      default:
        return ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Account</DialogTitle>
            <DialogDescription>
              Step {step} of 3: {getStepLabel(step)}
            </DialogDescription>
          </DialogHeader>

          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-4 py-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full transition-colors',
                    s === step
                      ? 'bg-hublot-900 text-white'
                      : s < step
                      ? 'bg-gold-500 text-white'
                      : 'bg-charcoal-200 text-charcoal-500'
                  )}
                >
                  {getStepIcon(s)}
                </div>
                {s < 3 && (
                  <div
                    className={cn(
                      'w-16 h-0.5 mx-2',
                      s < step ? 'bg-gold-500' : 'bg-charcoal-200'
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Company Basics */}
          {step === 1 && (
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Acme Corporation"
                  maxLength={200}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="industry">Industry *</Label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((ind) => (
                        <SelectItem key={ind.value} value={ind.value}>
                          {ind.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="companyType">Company Type</Label>
                  <Select value={companyType} onValueChange={setCompanyType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPANY_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="tier">Partnership Tier</Label>
                <Select value={tier} onValueChange={setTier}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tier (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIERS.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        <div>
                          <span className="font-medium">{t.label}</span>
                          <span className="text-charcoal-500 ml-2">- {t.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Headquarters Location</Label>
                  <Input
                    id="location"
                    value={headquartersLocation}
                    onChange={(e) => setHeadquartersLocation(e.target.value)}
                    placeholder="e.g., San Francisco, CA"
                  />
                </div>

                <div>
                  <Label htmlFor="linkedin">LinkedIn URL</Label>
                  <Input
                    id="linkedin"
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/company/..."
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Company Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the company and what they do..."
                  rows={3}
                  maxLength={1000}
                />
                <p className="text-xs text-charcoal-500 mt-1">{description.length}/1000</p>
              </div>
            </div>
          )}

          {/* Step 2: Billing & Terms */}
          {step === 2 && (
            <div className="space-y-4 py-4">
              <p className="text-sm text-charcoal-500 mb-4">
                Billing information can be added later during onboarding if not available now.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="billingEntity">Billing Entity Name</Label>
                  <Input
                    id="billingEntity"
                    value={billingEntityName}
                    onChange={(e) => setBillingEntityName(e.target.value)}
                    placeholder="Legal billing name"
                  />
                </div>

                <div>
                  <Label htmlFor="billingEmail">Billing Email</Label>
                  <Input
                    id="billingEmail"
                    type="email"
                    value={billingEmail}
                    onChange={(e) => setBillingEmail(e.target.value)}
                    placeholder="billing@example.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="billingAddress">Billing Address</Label>
                <Input
                  id="billingAddress"
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  placeholder="Street address"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="billingCity">City</Label>
                  <Input
                    id="billingCity"
                    value={billingCity}
                    onChange={(e) => setBillingCity(e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label htmlFor="billingState">State</Label>
                  <Input
                    id="billingState"
                    value={billingState}
                    onChange={(e) => setBillingState(e.target.value)}
                    placeholder="State"
                  />
                </div>
                <div>
                  <Label htmlFor="billingPostal">Postal Code</Label>
                  <Input
                    id="billingPostal"
                    value={billingPostalCode}
                    onChange={(e) => setBillingPostalCode(e.target.value)}
                    placeholder="12345"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="billingFrequency">Billing Frequency</Label>
                  <Select value={billingFrequency} onValueChange={setBillingFrequency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BILLING_FREQUENCIES.map((freq) => (
                        <SelectItem key={freq.value} value={freq.value}>
                          {freq.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="paymentTerms">Payment Terms (Days)</Label>
                  <Input
                    id="paymentTerms"
                    type="number"
                    min={0}
                    max={120}
                    value={paymentTermsDays}
                    onChange={(e) => setPaymentTermsDays(e.target.value)}
                    placeholder="30"
                  />
                </div>

                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={poRequired}
                      onChange={(e) => setPoRequired(e.target.checked)}
                      className="w-4 h-4 rounded border-charcoal-300"
                    />
                    <span className="text-sm">PO Required</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Primary Contact */}
          {step === 3 && (
            <div className="space-y-4 py-4">
              <p className="text-sm text-charcoal-500 mb-4">
                Add the primary point of contact for this account. Additional contacts can be added later.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactName">Contact Name</Label>
                  <Input
                    id="contactName"
                    value={primaryContactName}
                    onChange={(e) => setPrimaryContactName(e.target.value)}
                    placeholder="Full name"
                  />
                </div>

                <div>
                  <Label htmlFor="contactTitle">Title/Role</Label>
                  <Input
                    id="contactTitle"
                    value={primaryContactTitle}
                    onChange={(e) => setPrimaryContactTitle(e.target.value)}
                    placeholder="e.g., Hiring Manager"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactEmail">Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={primaryContactEmail}
                    onChange={(e) => setPrimaryContactEmail(e.target.value)}
                    placeholder="contact@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="contactPhone">Phone</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    value={primaryContactPhone}
                    onChange={(e) => setPrimaryContactPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="preferredContact">Preferred Contact Method</Label>
                  <Select value={preferredContactMethod} onValueChange={setPreferredContactMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTACT_METHODS.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="meetingCadence">Meeting Cadence</Label>
                  <Select value={meetingCadence} onValueChange={setMeetingCadence}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MEETING_CADENCES.map((cadence) => (
                        <SelectItem key={cadence.value} value={cadence.value}>
                          {cadence.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between">
            <div>
              {step > 1 && (
                <Button type="button" variant="outline" onClick={handleBack}>
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              {step < 3 ? (
                <Button type="button" onClick={handleNext}>
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create Account
                </Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
