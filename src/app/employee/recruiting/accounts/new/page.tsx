'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import { useToast } from '@/components/ui/use-toast'
import {
  Building2,
  CreditCard,
  Users,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { LocationPicker, OPERATING_COUNTRIES, getStatesByCountry } from '@/components/addresses'
import { PhoneInput, formatPhoneValue, type PhoneCountryCode } from '@/components/ui/phone-input'
import { PostalCodeInput, type PostalCodeCountry } from '@/components/ui/postal-code-input'

// Normalize URL - add https:// if missing protocol
function normalizeUrl(url: string | undefined): string | undefined {
  if (!url || url.trim() === '') return undefined
  const trimmed = url.trim()
  // If it already has a protocol, return as-is
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  // Add https:// prefix
  return `https://${trimmed}`
}

type WizardStep = 1 | 2 | 3

const STEPS = [
  { number: 1, title: 'Company Basics', icon: Building2, description: 'Basic company information' },
  { number: 2, title: 'Billing & Terms', icon: CreditCard, description: 'Payment and contract terms' },
  { number: 3, title: 'Primary Contact', icon: Users, description: 'Main point of contact' },
]

const INDUSTRIES = [
  { value: 'technology', label: 'Technology' },
  { value: 'fintech', label: 'Financial Technology (FinTech)' },
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

export default function NewAccountPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState<WizardStep>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    // Step 1: Company Basics
    name: '',
    industries: [] as string[],
    companyType: 'direct_client' as 'direct_client' | 'implementation_partner' | 'staffing_vendor',
    tier: '' as '' | 'preferred' | 'strategic' | 'exclusive',
    website: '',
    // Phone with country code
    phone: { countryCode: 'US' as PhoneCountryCode, number: '' },
    // Headquarters location (separate fields for dropdowns)
    hqCity: '',
    hqState: '',
    hqCountry: 'US',
    description: '',
    linkedinUrl: '',
    // Step 2: Billing & Terms
    billingEntityName: '',
    billingEmail: '',
    // Billing phone with country code
    billingPhone: { countryCode: 'US' as PhoneCountryCode, number: '' },
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingPostalCode: '',
    billingCountry: 'US',
    billingFrequency: 'monthly' as 'weekly' | 'biweekly' | 'monthly',
    paymentTermsDays: '30',
    poRequired: false,
    // Step 3: Primary Contact
    primaryContactName: '',
    primaryContactEmail: '',
    primaryContactTitle: '',
    // Primary contact phone with country code
    primaryContactPhone: { countryCode: 'US' as PhoneCountryCode, number: '' },
    preferredContactMethod: 'email' as 'email' | 'phone' | 'slack' | 'teams',
    meetingCadence: 'weekly' as 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly',
  })

  const createMutation = trpc.crm.accounts.create.useMutation({
    onSuccess: (data) => {
      toast({ title: 'Account created successfully', description: `${formData.name} has been added.` })
      router.push(`/employee/recruiting/accounts/${data.id}`)
    },
    onError: (error) => {
      toast({ title: 'Error creating account', description: error.message, variant: 'error' })
      setIsSubmitting(false)
    },
  })

  const updateField = (field: keyof typeof formData, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toggleIndustry = (industry: string) => {
    setFormData(prev => ({
      ...prev,
      industries: prev.industries.includes(industry)
        ? prev.industries.filter((i) => i !== industry)
        : [...prev.industries, industry],
    }))
  }

  const validateStep1 = () => {
    if (!formData.name || formData.name.length < 2) {
      toast({ title: 'Company name is required', description: 'Please enter at least 2 characters', variant: 'error' })
      return false
    }
    if (formData.industries.length === 0) {
      toast({ title: 'At least one industry is required', variant: 'error' })
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (formData.billingEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.billingEmail)) {
      toast({ title: 'Invalid billing email', variant: 'error' })
      return false
    }
    return true
  }

  const validateStep3 = () => {
    if (formData.primaryContactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.primaryContactEmail)) {
      toast({ title: 'Invalid contact email', variant: 'error' })
      return false
    }
    if (formData.primaryContactEmail && !formData.primaryContactName) {
      toast({ title: 'Contact name required', description: 'Please provide a name for the contact', variant: 'error' })
      return false
    }
    return true
  }

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return
    if (step === 2 && !validateStep2()) return
    setStep((step + 1) as WizardStep)
  }

  const handleBack = () => {
    setStep((step - 1) as WizardStep)
  }

  const handleSubmit = async () => {
    if (!validateStep3()) return
    setIsSubmitting(true)

    // Combine headquarters location fields into a single string
    const headquartersLocation = [formData.hqCity, formData.hqState, formData.hqCountry !== 'US' ? formData.hqCountry : null]
      .filter(Boolean)
      .join(', ') || undefined

    // Prepare data for API - convert types and handle empty strings
    const apiData = {
      name: formData.name,
      industry: formData.industries[0] || undefined,
      industries: formData.industries.length > 0 ? formData.industries : undefined,
      companyType: formData.companyType,
      tier: formData.tier || undefined,
      website: normalizeUrl(formData.website),
      phone: formatPhoneValue(formData.phone) || undefined,
      headquartersLocation,
      description: formData.description || undefined,
      linkedinUrl: normalizeUrl(formData.linkedinUrl),
      billingEntityName: formData.billingEntityName || undefined,
      billingEmail: formData.billingEmail || undefined,
      billingPhone: formatPhoneValue(formData.billingPhone) || undefined,
      billingAddress: formData.billingAddress || undefined,
      billingCity: formData.billingCity || undefined,
      billingState: formData.billingState || undefined,
      billingPostalCode: formData.billingPostalCode || undefined,
      billingCountry: formData.billingCountry || undefined,
      billingFrequency: formData.billingFrequency,
      paymentTermsDays: parseInt(formData.paymentTermsDays) || 30,
      poRequired: formData.poRequired,
      primaryContactName: formData.primaryContactName || undefined,
      primaryContactEmail: formData.primaryContactEmail || undefined,
      primaryContactTitle: formData.primaryContactTitle || undefined,
      primaryContactPhone: formatPhoneValue(formData.primaryContactPhone) || undefined,
      preferredContactMethod: formData.preferredContactMethod,
      meetingCadence: formData.meetingCadence,
    }

    createMutation.mutate(apiData)
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-sm text-charcoal-500 mb-4">
          <Link href="/employee/workspace/dashboard" className="hover:text-hublot-700 transition-colors">
            My Work
          </Link>
          <span>/</span>
          <Link href="/employee/recruiting/accounts" className="hover:text-hublot-700 transition-colors">
            Accounts
          </Link>
          <span>/</span>
          <span className="text-charcoal-900 font-medium">New Account</span>
        </nav>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/employee/recruiting/accounts">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-heading font-semibold text-charcoal-900">Create New Account</h1>
            <p className="text-charcoal-500">Set up a new client account in the system</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            {/* Connector line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-charcoal-200" />
            <div
              className="absolute top-5 left-0 h-0.5 bg-gold-500 transition-all duration-300"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            />

            {STEPS.map((s) => {
              const isCompleted = step > s.number
              const isActive = step === s.number
              const Icon = s.icon
              return (
                <div key={s.number} className="relative z-10 flex flex-col items-center">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
                      isCompleted && 'bg-gold-500 text-white',
                      isActive && 'bg-hublot-900 text-white',
                      !isCompleted && !isActive && 'bg-white border-2 border-charcoal-200 text-charcoal-400'
                    )}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <div className="mt-2 text-center">
                    <p className={cn(
                      'font-medium text-sm',
                      isActive ? 'text-charcoal-900' : 'text-charcoal-500'
                    )}>
                      {s.title}
                    </p>
                    <p className="text-xs text-charcoal-400 hidden sm:block">{s.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Step {step} of 3: {STEPS[step - 1].title}</CardTitle>
            <CardDescription>{STEPS[step - 1].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Company Basics */}
            {step === 1 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="name">Company Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Acme Corporation"
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Industries *</Label>
                    <p className="text-xs text-charcoal-500 mt-0.5">Select all that apply</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {INDUSTRIES.map((ind) => (
                        <button
                          key={ind.value}
                          type="button"
                          onClick={() => toggleIndustry(ind.value)}
                          className={cn(
                            'px-3 py-1.5 rounded-full text-sm transition-colors',
                            formData.industries.includes(ind.value)
                              ? 'bg-hublot-700 text-white'
                              : 'bg-charcoal-100 text-charcoal-700 hover:bg-charcoal-200'
                          )}
                        >
                          {ind.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="companyType">Company Type</Label>
                    <Select value={formData.companyType} onValueChange={(v) => updateField('companyType', v)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="direct_client">Direct Client</SelectItem>
                        <SelectItem value="implementation_partner">Implementation Partner</SelectItem>
                        <SelectItem value="staffing_vendor">Staffing Vendor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="tier">Partnership Tier</Label>
                    <Select value={formData.tier} onValueChange={(v) => updateField('tier', v)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select tier (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="preferred">Preferred</SelectItem>
                        <SelectItem value="strategic">Strategic</SelectItem>
                        <SelectItem value="exclusive">Exclusive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      placeholder="https://example.com"
                      value={formData.website}
                      onChange={(e) => updateField('website', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <PhoneInput
                      label="Phone"
                      value={formData.phone}
                      onChange={(phone) => setFormData(prev => ({ ...prev, phone }))}
                    />
                  </div>
                  <div className="col-span-2">
                    <LocationPicker
                      label="Headquarters Location"
                      value={{
                        city: formData.hqCity,
                        stateProvince: formData.hqState,
                        countryCode: formData.hqCountry,
                      }}
                      onChange={(data) => {
                        setFormData(prev => ({
                          ...prev,
                          hqCity: data.city || '',
                          hqState: data.stateProvince || '',
                          hqCountry: data.countryCode || 'US',
                        }))
                      }}
                      showCountry
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                    <Input
                      id="linkedinUrl"
                      placeholder="https://linkedin.com/company/..."
                      value={formData.linkedinUrl}
                      onChange={(e) => updateField('linkedinUrl', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="description">Company Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of the company and what they do..."
                      value={formData.description}
                      onChange={(e) => updateField('description', e.target.value)}
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Billing & Terms */}
            {step === 2 && (
              <>
                <p className="text-sm text-charcoal-500 bg-charcoal-50 p-3 rounded-lg">
                  Billing information is optional and can be added later during onboarding.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="billingEntityName">Legal Billing Entity Name</Label>
                    <Input
                      id="billingEntityName"
                      placeholder="Legal name for invoicing"
                      value={formData.billingEntityName}
                      onChange={(e) => updateField('billingEntityName', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="billingEmail">Billing Email</Label>
                    <Input
                      id="billingEmail"
                      type="email"
                      placeholder="billing@company.com"
                      value={formData.billingEmail}
                      onChange={(e) => updateField('billingEmail', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <PhoneInput
                      label="Billing Phone"
                      value={formData.billingPhone}
                      onChange={(billingPhone) => setFormData(prev => ({ ...prev, billingPhone }))}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="billingAddress">Billing Address</Label>
                    <Input
                      id="billingAddress"
                      placeholder="Street address"
                      value={formData.billingAddress}
                      onChange={(e) => updateField('billingAddress', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="billingCity">City</Label>
                    <Input
                      id="billingCity"
                      placeholder="City"
                      value={formData.billingCity}
                      onChange={(e) => updateField('billingCity', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="billingState">State/Province</Label>
                    <Select
                      value={formData.billingState}
                      onValueChange={(v) => updateField('billingState', v)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {getStatesByCountry(formData.billingCountry).map((state) => (
                          <SelectItem key={state.value} value={state.value}>
                            {state.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <PostalCodeInput
                      value={formData.billingPostalCode}
                      onChange={(val) => updateField('billingPostalCode', val)}
                      countryCode={formData.billingCountry as PostalCodeCountry}
                    />
                  </div>
                  <div>
                    <Label htmlFor="billingCountry">Country</Label>
                    <Select
                      value={formData.billingCountry}
                      onValueChange={(v) => {
                        setFormData(prev => ({
                          ...prev,
                          billingCountry: v,
                          billingState: '', // Reset state when country changes
                          billingPostalCode: '', // Reset postal code when country changes (different formats)
                        }))
                      }}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {OPERATING_COUNTRIES.map((country) => (
                          <SelectItem key={country.value} value={country.value}>
                            {country.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-4">Payment Terms</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="billingFrequency">Billing Frequency</Label>
                      <Select value={formData.billingFrequency} onValueChange={(v) => updateField('billingFrequency', v)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Bi-weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="paymentTermsDays">Payment Terms (Days)</Label>
                      <Input
                        id="paymentTermsDays"
                        type="number"
                        value={formData.paymentTermsDays}
                        onChange={(e) => updateField('paymentTermsDays', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex items-end pb-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="poRequired"
                          checked={formData.poRequired}
                          onCheckedChange={(checked) => updateField('poRequired', !!checked)}
                        />
                        <Label htmlFor="poRequired" className="cursor-pointer">PO Required</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Primary Contact */}
            {step === 3 && (
              <>
                <p className="text-sm text-charcoal-500 bg-charcoal-50 p-3 rounded-lg">
                  Adding a primary contact is optional. Additional contacts can be added later.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primaryContactName">Full Name</Label>
                    <Input
                      id="primaryContactName"
                      placeholder="John Smith"
                      value={formData.primaryContactName}
                      onChange={(e) => updateField('primaryContactName', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="primaryContactTitle">Title / Role</Label>
                    <Input
                      id="primaryContactTitle"
                      placeholder="VP of Engineering"
                      value={formData.primaryContactTitle}
                      onChange={(e) => updateField('primaryContactTitle', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="primaryContactEmail">Email</Label>
                    <Input
                      id="primaryContactEmail"
                      type="email"
                      placeholder="john@company.com"
                      value={formData.primaryContactEmail}
                      onChange={(e) => updateField('primaryContactEmail', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <PhoneInput
                      label="Phone"
                      value={formData.primaryContactPhone}
                      onChange={(primaryContactPhone) => setFormData(prev => ({ ...prev, primaryContactPhone }))}
                    />
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-4">Communication Preferences</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="preferredContactMethod">Preferred Contact Method</Label>
                      <Select value={formData.preferredContactMethod} onValueChange={(v) => updateField('preferredContactMethod', v)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="phone">Phone</SelectItem>
                          <SelectItem value="slack">Slack</SelectItem>
                          <SelectItem value="teams">Microsoft Teams</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="meetingCadence">Meeting Cadence</Label>
                      <Select value={formData.meetingCadence} onValueChange={(v) => updateField('meetingCadence', v)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Bi-weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6">
          <div>
            {step > 1 && (
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/employee/recruiting/accounts">Cancel</Link>
            </Button>
            {step < 3 ? (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Create Account
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
