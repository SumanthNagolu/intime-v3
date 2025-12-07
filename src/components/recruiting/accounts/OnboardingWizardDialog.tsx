'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
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
import { Loader2, ChevronRight, ChevronLeft, Building2, FileText, CreditCard, Users, Briefcase, Calendar, Check, Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface Contact {
  id: string
  first_name: string
  last_name?: string
  email?: string
  title?: string
  is_primary?: boolean
}

interface OnboardingWizardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  accountId: string
  accountName?: string
  existingContacts?: Contact[]
}

type Step = 1 | 2 | 3 | 4 | 5 | 6

const STEPS = [
  { number: 1, title: 'Company Profile', icon: Building2 },
  { number: 2, title: 'Contract Setup', icon: FileText },
  { number: 3, title: 'Billing Setup', icon: CreditCard },
  { number: 4, title: 'Key Contacts', icon: Users },
  { number: 5, title: 'Job Categories', icon: Briefcase },
  { number: 6, title: 'Kickoff Call', icon: Calendar },
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

const COMPANY_SIZES = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '501-1000', label: '501-1000 employees' },
  { value: '1001-5000', label: '1001-5000 employees' },
  { value: '5001+', label: '5001+ employees' },
]

const PAYMENT_TERMS = [
  { value: 'net_15', label: 'Net 15' },
  { value: 'net_30', label: 'Net 30 (Standard)' },
  { value: 'net_45', label: 'Net 45' },
  { value: 'net_60', label: 'Net 60' },
  { value: 'due_on_receipt', label: 'Due on Receipt' },
]

const BILLING_FREQUENCIES = [
  { value: 'weekly', label: 'Weekly (Every Friday)' },
  { value: 'biweekly', label: 'Bi-weekly (Every other Friday)' },
  { value: 'monthly', label: 'Monthly (1st of month)' },
]

const JOB_CATEGORIES = [
  { group: 'Engineering', items: [
    { value: 'backend_engineer', label: 'Backend Engineer' },
    { value: 'frontend_engineer', label: 'Frontend Engineer' },
    { value: 'fullstack_engineer', label: 'Full Stack Engineer' },
    { value: 'mobile_engineer', label: 'Mobile Engineer (iOS/Android)' },
    { value: 'devops_sre', label: 'DevOps / SRE' },
    { value: 'qa_engineer', label: 'QA Engineer' },
    { value: 'data_engineer', label: 'Data Engineer' },
    { value: 'ml_ai_engineer', label: 'ML / AI Engineer' },
  ]},
  { group: 'Leadership', items: [
    { value: 'engineering_manager', label: 'Engineering Manager' },
    { value: 'tech_lead', label: 'Tech Lead / Staff Engineer' },
    { value: 'director_engineering', label: 'Director of Engineering' },
    { value: 'vp_engineering', label: 'VP Engineering' },
  ]},
  { group: 'Product & Design', items: [
    { value: 'product_manager', label: 'Product Manager' },
    { value: 'ux_designer', label: 'UX Designer' },
    { value: 'product_designer', label: 'Product Designer' },
  ]},
]

const CONTACT_ROLES = [
  { value: 'primary', label: 'Primary Contact' },
  { value: 'hiring_manager', label: 'Hiring Manager' },
  { value: 'executive_sponsor', label: 'Executive Sponsor' },
  { value: 'technical_lead', label: 'Technical Lead' },
  { value: 'billing', label: 'Billing Contact' },
  { value: 'hr', label: 'HR Contact' },
  { value: 'timesheet_approver', label: 'Timesheet Approver' },
]

export function OnboardingWizardDialog({
  open,
  onOpenChange,
  accountId,
  accountName,
  existingContacts = [],
}: OnboardingWizardDialogProps) {
  const { toast } = useToast()
  const router = useRouter()
  const utils = trpc.useUtils()

  const [step, setStep] = useState<Step>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Step 1: Company Profile
  const [legalName, setLegalName] = useState('')
  const [dbaName, setDbaName] = useState('')
  const [industry, setIndustry] = useState('')
  const [companySize, setCompanySize] = useState('')
  const [yearFounded, setYearFounded] = useState('')
  const [website, setWebsite] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [streetAddress, setStreetAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [country, setCountry] = useState('United States')
  const [taxId, setTaxId] = useState('')
  const [fundingStage, setFundingStage] = useState('')
  const [accountClassification, setAccountClassification] = useState('')

  // Step 2: Contract Setup
  const [contractType, setContractType] = useState('msa')
  const [contractSignedDate, setContractSignedDate] = useState('')
  const [contractStartDate, setContractStartDate] = useState('')
  const [contractEndDate, setContractEndDate] = useState('')
  const [isEvergreen, setIsEvergreen] = useState(false)
  const [useCustomRateCard, setUseCustomRateCard] = useState(false)
  const [conversionFeePercent, setConversionFeePercent] = useState('20')
  const [guaranteePeriodDays, setGuaranteePeriodDays] = useState('30')
  const [noticePeriodWeeks, setNoticePeriodWeeks] = useState('2')
  const [contractNotes, setContractNotes] = useState('')

  // Step 3: Billing Setup
  const [billingEntityName, setBillingEntityName] = useState('')
  const [paymentTerms, setPaymentTerms] = useState('net_30')
  const [billingFrequency, setBillingFrequency] = useState('biweekly')
  const [billingCurrency, setBillingCurrency] = useState('USD')
  const [useSameAddress, setUseSameAddress] = useState(true)
  const [billingAddress, setBillingAddress] = useState('')
  const [billingContactName, setBillingContactName] = useState('')
  const [billingContactTitle, setBillingContactTitle] = useState('')
  const [billingContactEmail, setBillingContactEmail] = useState('')
  const [billingContactPhone, setBillingContactPhone] = useState('')
  const [invoiceDelivery, setInvoiceDelivery] = useState('email')
  const [invoiceCc, setInvoiceCc] = useState('')
  const [poRequired, setPoRequired] = useState(false)
  const [poNumber, setPoNumber] = useState('')
  const [timesheetApprover, setTimesheetApprover] = useState('')
  const [approvalMethod, setApprovalMethod] = useState('email')

  // Step 4: Key Contacts
  const [additionalContacts, setAdditionalContacts] = useState<Array<{
    firstName: string
    lastName: string
    email: string
    phone: string
    title: string
    roles: string[]
  }>>([])
  const [preferredChannel, setPreferredChannel] = useState('email')
  const [meetingCadence, setMeetingCadence] = useState('weekly')

  // Step 5: Job Categories
  const [selectedJobCategories, setSelectedJobCategories] = useState<string[]>([])
  const [techStack, setTechStack] = useState('')
  const [niceToHaveSkills, setNiceToHaveSkills] = useState('')
  const [workAuthorizations, setWorkAuthorizations] = useState<string[]>(['us_citizen', 'green_card'])
  const [experienceLevels, setExperienceLevels] = useState<string[]>(['mid', 'senior'])
  const [locationPreferences, setLocationPreferences] = useState<string[]>(['remote_us'])
  const [interviewRounds, setInterviewRounds] = useState('4')
  const [interviewProcessNotes, setInterviewProcessNotes] = useState('')
  const [avgDecisionDays, setAvgDecisionDays] = useState('3-5')

  // Step 6: Kickoff Call
  const [scheduleKickoff, setScheduleKickoff] = useState(true)
  const [kickoffAttendees, setKickoffAttendees] = useState('')
  const [kickoffDuration, setKickoffDuration] = useState('45')
  const [kickoffMeetingType, setKickoffMeetingType] = useState('video')
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true)
  const [includeCompanyDeck, setIncludeCompanyDeck] = useState(true)
  const [sharePortalAccess, setSharePortalAccess] = useState(true)
  const [internalNotes, setInternalNotes] = useState('')

  const completeOnboardingMutation = trpc.crm.accounts.completeOnboarding.useMutation({
    onSuccess: () => {
      toast({
        title: 'Onboarding Complete!',
        description: `${accountName} is now active and ready for job requisitions.`,
      })
      utils.crm.accounts.getById.invalidate({ id: accountId })
      utils.crm.accounts.list.invalidate()
      onOpenChange(false)
      router.refresh()
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to complete onboarding.',
        variant: 'error',
      })
      setIsSubmitting(false)
    },
  })

  const handleNext = () => {
    if (step < 6) {
      setStep((step + 1) as Step)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as Step)
    }
  }

  const handleComplete = async () => {
    setIsSubmitting(true)

    completeOnboardingMutation.mutate({
      accountId,
      // Company Profile
      legalName: legalName || undefined,
      dbaName: dbaName || undefined,
      industry: industry || undefined,
      companySize: companySize || undefined,
      yearFounded: yearFounded ? parseInt(yearFounded) : undefined,
      website: website || undefined,
      linkedinUrl: linkedinUrl || undefined,
      streetAddress: streetAddress || undefined,
      city: city || undefined,
      state: state || undefined,
      postalCode: postalCode || undefined,
      country: country || undefined,
      taxId: taxId || undefined,
      fundingStage: fundingStage || undefined,
      accountClassification: accountClassification || undefined,
      // Contract Setup
      contractType: contractType || undefined,
      contractSignedDate: contractSignedDate || undefined,
      contractStartDate: contractStartDate || undefined,
      contractEndDate: contractEndDate || undefined,
      isEvergreen,
      conversionFeePercent: conversionFeePercent ? parseFloat(conversionFeePercent) : undefined,
      guaranteePeriodDays: guaranteePeriodDays ? parseInt(guaranteePeriodDays) : undefined,
      noticePeriodWeeks: noticePeriodWeeks ? parseInt(noticePeriodWeeks) : undefined,
      contractNotes: contractNotes || undefined,
      // Billing
      billingEntityName: billingEntityName || undefined,
      paymentTerms: paymentTerms || undefined,
      billingFrequency: billingFrequency || undefined,
      billingCurrency: billingCurrency || undefined,
      billingAddress: useSameAddress ? undefined : billingAddress,
      billingContactName: billingContactName || undefined,
      billingContactTitle: billingContactTitle || undefined,
      billingContactEmail: billingContactEmail || undefined,
      billingContactPhone: billingContactPhone || undefined,
      poRequired,
      poNumber: poNumber || undefined,
      timesheetApprover: timesheetApprover || undefined,
      // Job Categories
      hotJobCategories: selectedJobCategories,
      techStack: techStack || undefined,
      niceToHaveSkills: niceToHaveSkills || undefined,
      workAuthorizations,
      experienceLevels,
      locationPreferences,
      interviewRounds: interviewRounds ? parseInt(interviewRounds) : undefined,
      interviewProcessNotes: interviewProcessNotes || undefined,
      avgDecisionDays: avgDecisionDays || undefined,
      // Communication
      preferredContactMethod: preferredChannel || undefined,
      meetingCadence: meetingCadence || undefined,
      // Internal
      internalNotes: internalNotes || undefined,
      // Kickoff
      scheduleKickoff,
      kickoffDuration: scheduleKickoff ? parseInt(kickoffDuration) : undefined,
      sendWelcomeEmail,
    })
  }

  const toggleJobCategory = (category: string) => {
    if (selectedJobCategories.includes(category)) {
      setSelectedJobCategories(selectedJobCategories.filter(c => c !== category))
    } else {
      setSelectedJobCategories([...selectedJobCategories, category])
    }
  }

  const toggleWorkAuth = (auth: string) => {
    if (workAuthorizations.includes(auth)) {
      setWorkAuthorizations(workAuthorizations.filter(a => a !== auth))
    } else {
      setWorkAuthorizations([...workAuthorizations, auth])
    }
  }

  const toggleExpLevel = (level: string) => {
    if (experienceLevels.includes(level)) {
      setExperienceLevels(experienceLevels.filter(l => l !== level))
    } else {
      setExperienceLevels([...experienceLevels, level])
    }
  }

  const toggleLocation = (loc: string) => {
    if (locationPreferences.includes(loc)) {
      setLocationPreferences(locationPreferences.filter(l => l !== loc))
    } else {
      setLocationPreferences([...locationPreferences, loc])
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="legalName">Legal Company Name</Label>
                <Input
                  id="legalName"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  placeholder={accountName}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dbaName">DBA / Trade Name</Label>
                <Input
                  id="dbaName"
                  value={dbaName}
                  onChange={(e) => setDbaName(e.target.value)}
                  placeholder="If different from legal name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger id="industry">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((ind) => (
                      <SelectItem key={ind.value} value={ind.value}>{ind.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="companySize">Company Size</Label>
                <Select value={companySize} onValueChange={setCompanySize}>
                  <SelectTrigger id="companySize">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPANY_SIZES.map((size) => (
                      <SelectItem key={size.value} value={size.value}>{size.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearFounded">Year Founded</Label>
                <Input
                  id="yearFounded"
                  type="number"
                  value={yearFounded}
                  onChange={(e) => setYearFounded(e.target.value)}
                  placeholder="2019"
                />
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium mb-3">Headquarters Address</h4>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="streetAddress">Street Address</Label>
                  <Input
                    id="streetAddress"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="123 Main St, Suite 100"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Zip</Label>
                    <Input
                      id="postalCode"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium mb-3">Business Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID / EIN</Label>
                  <Input
                    id="taxId"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    placeholder="XX-XXXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fundingStage">Funding Stage</Label>
                  <Select value={fundingStage} onValueChange={setFundingStage}>
                    <SelectTrigger id="fundingStage">
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="seed">Seed</SelectItem>
                      <SelectItem value="series_a">Series A</SelectItem>
                      <SelectItem value="series_b">Series B</SelectItem>
                      <SelectItem value="series_c">Series C+</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private (Bootstrapped)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Contract Type</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'msa', label: 'Master Service Agreement (MSA)' },
                  { value: 'sow', label: 'Statement of Work (SOW)' },
                  { value: 'po', label: 'Purchase Order (PO) Based' },
                  { value: 'other', label: 'Other' },
                ].map((type) => (
                  <label
                    key={type.value}
                    className={cn(
                      'flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors',
                      contractType === type.value
                        ? 'border-hublot-700 bg-hublot-50'
                        : 'border-charcoal-200 hover:border-charcoal-300'
                    )}
                  >
                    <input
                      type="radio"
                      name="contractType"
                      value={type.value}
                      checked={contractType === type.value}
                      onChange={(e) => setContractType(e.target.value)}
                      className="sr-only"
                    />
                    <span className="text-sm">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contractSignedDate">Contract Signed Date</Label>
                <Input
                  id="contractSignedDate"
                  type="date"
                  value={contractSignedDate}
                  onChange={(e) => setContractSignedDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contractStartDate">Contract Start Date</Label>
                <Input
                  id="contractStartDate"
                  type="date"
                  value={contractStartDate}
                  onChange={(e) => setContractStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contractEndDate">Contract End Date</Label>
                <Input
                  id="contractEndDate"
                  type="date"
                  value={contractEndDate}
                  onChange={(e) => setContractEndDate(e.target.value)}
                  disabled={isEvergreen}
                />
              </div>
            </div>

            <label className="flex items-center gap-2">
              <Checkbox
                checked={isEvergreen}
                onCheckedChange={(checked) => setIsEvergreen(checked === true)}
              />
              <span className="text-sm">Evergreen / Auto-renew</span>
            </label>

            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium mb-3">Special Terms</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="conversionFee">Conversion Fee (%)</Label>
                  <Input
                    id="conversionFee"
                    type="number"
                    value={conversionFeePercent}
                    onChange={(e) => setConversionFeePercent(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guaranteePeriod">Guarantee Period (days)</Label>
                  <Input
                    id="guaranteePeriod"
                    type="number"
                    value={guaranteePeriodDays}
                    onChange={(e) => setGuaranteePeriodDays(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="noticePeriod">Notice Period (weeks)</Label>
                  <Input
                    id="noticePeriod"
                    type="number"
                    value={noticePeriodWeeks}
                    onChange={(e) => setNoticePeriodWeeks(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <Label htmlFor="contractNotes">Notes on Special Terms</Label>
                <Textarea
                  id="contractNotes"
                  value={contractNotes}
                  onChange={(e) => setContractNotes(e.target.value)}
                  placeholder="Any special terms or exceptions..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentTerms">Payment Terms</Label>
                <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                  <SelectTrigger id="paymentTerms">
                    <SelectValue placeholder="Select terms" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_TERMS.map((term) => (
                      <SelectItem key={term.value} value={term.value}>{term.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="billingFrequency">Billing Frequency</Label>
                <Select value={billingFrequency} onValueChange={setBillingFrequency}>
                  <SelectTrigger id="billingFrequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {BILLING_FREQUENCIES.map((freq) => (
                      <SelectItem key={freq.value} value={freq.value}>{freq.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium mb-3">Billing Contact</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="billingContactName">Contact Name</Label>
                  <Input
                    id="billingContactName"
                    value={billingContactName}
                    onChange={(e) => setBillingContactName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingContactTitle">Title</Label>
                  <Input
                    id="billingContactTitle"
                    value={billingContactTitle}
                    onChange={(e) => setBillingContactTitle(e.target.value)}
                    placeholder="Finance Manager"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div className="space-y-2">
                  <Label htmlFor="billingContactEmail">Email</Label>
                  <Input
                    id="billingContactEmail"
                    type="email"
                    value={billingContactEmail}
                    onChange={(e) => setBillingContactEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingContactPhone">Phone</Label>
                  <Input
                    id="billingContactPhone"
                    value={billingContactPhone}
                    onChange={(e) => setBillingContactPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium mb-3">Invoicing Preferences</h4>
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={poRequired}
                    onCheckedChange={(checked) => setPoRequired(checked === true)}
                  />
                  <span className="text-sm">PO Number Required for Invoices</span>
                </label>
                {poRequired && (
                  <div className="space-y-2 ml-6">
                    <Label htmlFor="poNumber">Current PO Number</Label>
                    <Input
                      id="poNumber"
                      value={poNumber}
                      onChange={(e) => setPoNumber(e.target.value)}
                      placeholder="PO-2026-001"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <p className="text-sm text-charcoal-600">
              Review existing contacts and add any additional key stakeholders.
            </p>

            {existingContacts.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Existing Contacts</h4>
                <div className="space-y-2">
                  {existingContacts.map((contact: any) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between p-3 bg-charcoal-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{contact.first_name} {contact.last_name}</p>
                        <p className="text-sm text-charcoal-500">{contact.title || contact.email}</p>
                      </div>
                      {contact.is_primary && (
                        <span className="text-xs bg-hublot-100 text-hublot-700 px-2 py-1 rounded">
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium mb-3">Communication Preferences</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Primary Communication Channel</Label>
                  <Select value={preferredChannel} onValueChange={setPreferredChannel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="slack">Slack / Teams</SelectItem>
                      <SelectItem value="mixed">Mix (depends on urgency)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Preferred Meeting Cadence</Label>
                  <Select value={meetingCadence} onValueChange={setMeetingCadence}>
                    <SelectTrigger>
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
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <p className="text-sm text-charcoal-600">
              Select the role categories this client typically hires to help prioritize candidates.
            </p>

            <div className="space-y-4 max-h-64 overflow-y-auto border rounded-lg p-3">
              {JOB_CATEGORIES.map((group) => (
                <div key={group.group}>
                  <h5 className="font-medium text-sm text-charcoal-700 mb-2">{group.group}</h5>
                  <div className="grid grid-cols-2 gap-2">
                    {group.items.map((item) => (
                      <label
                        key={item.value}
                        className={cn(
                          'flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors',
                          selectedJobCategories.includes(item.value)
                            ? 'bg-hublot-50 border-hublot-700'
                            : 'border-charcoal-200 hover:border-charcoal-300'
                        )}
                      >
                        <Checkbox
                          checked={selectedJobCategories.includes(item.value)}
                          onCheckedChange={() => toggleJobCategory(item.value)}
                        />
                        <span className="text-sm">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium mb-3">Technical Stack Preferences</h4>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="techStack">Primary Languages/Frameworks</Label>
                  <Input
                    id="techStack"
                    value={techStack}
                    onChange={(e) => setTechStack(e.target.value)}
                    placeholder="TypeScript, React, Node.js, PostgreSQL, AWS"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="niceToHave">Nice-to-Have Skills</Label>
                  <Input
                    id="niceToHave"
                    value={niceToHaveSkills}
                    onChange={(e) => setNiceToHaveSkills(e.target.value)}
                    placeholder="Kubernetes, GraphQL, Redis"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium mb-3">Candidate Preferences</h4>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm">Work Authorization</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {[
                      { value: 'us_citizen', label: 'US Citizen' },
                      { value: 'green_card', label: 'Green Card' },
                      { value: 'h1b_transfer', label: 'H1B (Transfer)' },
                      { value: 'opt_cpt', label: 'OPT / CPT' },
                      { value: 'tn_visa', label: 'TN Visa' },
                    ].map((auth) => (
                      <label
                        key={auth.value}
                        className={cn(
                          'flex items-center gap-2 p-2 rounded border cursor-pointer text-sm transition-colors',
                          workAuthorizations.includes(auth.value)
                            ? 'bg-hublot-50 border-hublot-700'
                            : 'border-charcoal-200'
                        )}
                      >
                        <Checkbox
                          checked={workAuthorizations.includes(auth.value)}
                          onCheckedChange={() => toggleWorkAuth(auth.value)}
                        />
                        {auth.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm">Experience Level</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {[
                      { value: 'junior', label: 'Junior (0-2 yrs)' },
                      { value: 'mid', label: 'Mid (3-5 yrs)' },
                      { value: 'senior', label: 'Senior (5-8 yrs)' },
                      { value: 'staff', label: 'Staff+ (8+ yrs)' },
                    ].map((level) => (
                      <label
                        key={level.value}
                        className={cn(
                          'flex items-center gap-2 p-2 rounded border cursor-pointer text-sm transition-colors',
                          experienceLevels.includes(level.value)
                            ? 'bg-hublot-50 border-hublot-700'
                            : 'border-charcoal-200'
                        )}
                      >
                        <Checkbox
                          checked={experienceLevels.includes(level.value)}
                          onCheckedChange={() => toggleExpLevel(level.value)}
                        />
                        {level.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <Checkbox
                checked={scheduleKickoff}
                onCheckedChange={(checked) => setScheduleKickoff(checked === true)}
              />
              <span className="font-medium">Schedule kickoff call</span>
            </label>

            {scheduleKickoff && (
              <div className="ml-6 space-y-4 border-l-2 border-charcoal-200 pl-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="kickoffDuration">Meeting Duration (minutes)</Label>
                    <Select value={kickoffDuration} onValueChange={setKickoffDuration}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Meeting Type</Label>
                    <Select value={kickoffMeetingType} onValueChange={setKickoffMeetingType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">Video Call</SelectItem>
                        <SelectItem value="phone">Phone Call</SelectItem>
                        <SelectItem value="in_person">In-Person</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium mb-3">Welcome Package</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={sendWelcomeEmail}
                    onCheckedChange={(checked) => setSendWelcomeEmail(checked === true)}
                  />
                  <span className="text-sm">Send welcome email with meeting request</span>
                </label>
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={includeCompanyDeck}
                    onCheckedChange={(checked) => setIncludeCompanyDeck(checked === true)}
                  />
                  <span className="text-sm">Include company overview deck</span>
                </label>
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={sharePortalAccess}
                    onCheckedChange={(checked) => setSharePortalAccess(checked === true)}
                  />
                  <span className="text-sm">Share client portal access</span>
                </label>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium mb-3">Onboarding Summary</h4>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-green-700">
                  <Check className="w-4 h-4" />
                  <span className="text-sm">Company Profile: {legalName || accountName || 'Configured'}</span>
                </div>
                <div className="flex items-center gap-2 text-green-700">
                  <Check className="w-4 h-4" />
                  <span className="text-sm">Contract Setup: {contractType.toUpperCase()} configured</span>
                </div>
                <div className="flex items-center gap-2 text-green-700">
                  <Check className="w-4 h-4" />
                  <span className="text-sm">Billing: {paymentTerms.replace('_', ' ')}, {billingFrequency} invoicing</span>
                </div>
                <div className="flex items-center gap-2 text-green-700">
                  <Check className="w-4 h-4" />
                  <span className="text-sm">Contacts: {existingContacts.length} contacts configured</span>
                </div>
                <div className="flex items-center gap-2 text-green-700">
                  <Check className="w-4 h-4" />
                  <span className="text-sm">Job Categories: {selectedJobCategories.length} hot categories defined</span>
                </div>
                {scheduleKickoff && (
                  <div className="flex items-center gap-2 text-green-700">
                    <Check className="w-4 h-4" />
                    <span className="text-sm">Kickoff Call: Will be scheduled</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="internalNotes">Notes for Internal Team</Label>
              <Textarea
                id="internalNotes"
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Key information for the team about this account..."
                rows={3}
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Account Onboarding Wizard</DialogTitle>
          <DialogDescription>
            Step {step} of 6: {STEPS[step - 1].title}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((s, idx) => (
            <div
              key={s.number}
              className={cn(
                'flex items-center',
                idx < STEPS.length - 1 && 'flex-1'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                  step >= s.number
                    ? 'bg-hublot-700 text-white'
                    : 'bg-charcoal-200 text-charcoal-500'
                )}
              >
                {step > s.number ? <Check className="w-4 h-4" /> : s.number}
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-1 mx-2',
                    step > s.number ? 'bg-hublot-700' : 'bg-charcoal-200'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        <div className="py-4">
          {renderStep()}
        </div>

        <DialogFooter>
          <div className="flex justify-between w-full">
            <div>
              {step > 1 && (
                <Button type="button" variant="outline" onClick={handleBack}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              {step < 6 ? (
                <Button onClick={handleNext}>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleComplete} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Complete Onboarding
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
