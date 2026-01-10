'use client'

import {
  Shield,
  Clock,
  MapPin,
  Calendar,
  Plane,
  DollarSign,
  TrendingUp,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useCreateCandidateStore,
  VISA_STATUSES,
  AVAILABILITY_OPTIONS,
  RATE_TYPES,
} from '@/stores/create-candidate-store'
import { Section, FieldGroup, ValidationBanner, SectionDivider } from './shared'

// Visas that typically require sponsorship
const SPONSORSHIP_VISAS = ['h1b', 'l1', 'opt', 'cpt', 'ead', 'other']

// Currency options
const CURRENCIES = [
  { value: 'USD', label: 'USD ($)', symbol: '$' },
  { value: 'CAD', label: 'CAD (C$)', symbol: 'C$' },
  { value: 'GBP', label: 'GBP (£)', symbol: '£' },
  { value: 'EUR', label: 'EUR (€)', symbol: '€' },
  { value: 'INR', label: 'INR (₹)', symbol: '₹' },
]

export function CandidateIntakeStep5EmploymentTerms() {
  const { formData, setFormData } = useCreateCandidateStore()

  // Auto-set sponsorship requirement based on visa type
  const handleVisaChange = (value: string) => {
    const requiresSponsorship = SPONSORSHIP_VISAS.includes(value)
    setFormData({
      visaStatus: value as typeof formData.visaStatus,
      requiresSponsorship: value === 'other' ? formData.requiresSponsorship : requiresSponsorship,
    })
  }

  const currencySymbol = CURRENCIES.find(c => c.value === formData.currency)?.symbol || '$'

  // Get rate label based on type
  const getRateLabel = () => {
    switch (formData.rateType) {
      case 'annual': return '/year'
      case 'per_diem': return '/day'
      default: return '/hour'
    }
  }

  // Build validation items
  const validationItems: string[] = []
  if (!formData.visaStatus) validationItems.push('Select work authorization status')
  if (!formData.availability) validationItems.push('Select availability')
  if (formData.minimumRate && formData.desiredRate && formData.minimumRate > formData.desiredRate) {
    validationItems.push('Minimum rate should not exceed desired rate')
  }

  return (
    <div className="space-y-8">
      {/* Work Authorization Section */}
      <Section
        icon={Shield}
        title="Work Authorization"
        subtitle="Visa status and work eligibility"
      >
        <FieldGroup cols={2}>
          <div className="space-y-2">
            <Label htmlFor="visaStatus" className="text-charcoal-700 font-medium">
              Visa / Authorization Status <span className="text-gold-500">*</span>
            </Label>
            <Select
              value={formData.visaStatus}
              onValueChange={handleVisaChange}
            >
              <SelectTrigger id="visaStatus" className="h-12 rounded-xl border-charcoal-200 bg-white">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {VISA_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Show expiry date for visa types that have expiration */}
          {['h1b', 'l1', 'tn', 'opt', 'cpt', 'ead'].includes(formData.visaStatus) && (
            <div className="space-y-2">
              <Label htmlFor="visaExpiryDate" className="text-charcoal-700 font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4 text-charcoal-400" />
                Visa Expiry Date
              </Label>
              <Input
                id="visaExpiryDate"
                type="date"
                value={formData.visaExpiryDate || ''}
                onChange={(e) => setFormData({ visaExpiryDate: e.target.value })}
                className="h-12 rounded-xl border-charcoal-200 bg-white"
              />
            </div>
          )}
        </FieldGroup>

        {/* Sponsorship indicator */}
        {SPONSORSHIP_VISAS.includes(formData.visaStatus) && (
          <div className="flex items-start space-x-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
            <Checkbox
              id="requiresSponsorship"
              checked={formData.requiresSponsorship}
              onCheckedChange={(checked) => setFormData({ requiresSponsorship: checked === true })}
              className="mt-1"
            />
            <div>
              <Label htmlFor="requiresSponsorship" className="text-sm font-medium text-amber-800 cursor-pointer">
                Requires Visa Sponsorship
              </Label>
              <p className="text-xs text-amber-700 mt-0.5">
                Candidate will need employer sponsorship for work authorization
              </p>
            </div>
          </div>
        )}
      </Section>

      {/* Availability Section */}
      <Section
        icon={Clock}
        title="Availability"
        subtitle="When can the candidate start?"
      >
        <FieldGroup cols={2}>
          <div className="space-y-2">
            <Label htmlFor="availability" className="text-charcoal-700 font-medium">
              Availability <span className="text-gold-500">*</span>
            </Label>
            <Select
              value={formData.availability}
              onValueChange={(value) => setFormData({ availability: value as typeof formData.availability })}
            >
              <SelectTrigger id="availability" className="h-12 rounded-xl border-charcoal-200 bg-white">
                <SelectValue placeholder="Select availability" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABILITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="availableFrom" className="text-charcoal-700 font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-charcoal-400" />
              Available From (specific date)
            </Label>
            <Input
              id="availableFrom"
              type="date"
              value={formData.availableFrom || ''}
              onChange={(e) => setFormData({ availableFrom: e.target.value })}
              className="h-12 rounded-xl border-charcoal-200 bg-white"
            />
          </div>
        </FieldGroup>

        <FieldGroup cols={2}>
          <div className="space-y-2">
            <Label htmlFor="noticePeriodDays" className="text-charcoal-700 font-medium">
              Notice Period (days)
            </Label>
            <Input
              id="noticePeriodDays"
              type="number"
              min={0}
              max={180}
              value={formData.noticePeriodDays || ''}
              onChange={(e) => setFormData({ noticePeriodDays: e.target.value ? parseInt(e.target.value) : undefined })}
              placeholder="e.g., 14"
              className="h-12 rounded-xl border-charcoal-200 bg-white"
            />
          </div>
        </FieldGroup>
      </Section>

      {/* Work Preferences Section */}
      <Section
        icon={Plane}
        title="Work Preferences"
        subtitle="Remote and relocation preferences"
      >
        <FieldGroup cols={2}>
          <div className="flex items-start space-x-3 p-4 bg-charcoal-50 rounded-xl border border-charcoal-100">
            <Checkbox
              id="isRemoteOk"
              checked={formData.isRemoteOk}
              onCheckedChange={(checked) => setFormData({ isRemoteOk: checked === true })}
              className="mt-1"
            />
            <div>
              <Label htmlFor="isRemoteOk" className="text-sm font-medium text-charcoal-800 cursor-pointer">
                Open to Remote Work
              </Label>
              <p className="text-xs text-charcoal-500 mt-0.5">Candidate is willing to work remotely</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-charcoal-50 rounded-xl border border-charcoal-100">
            <Checkbox
              id="willingToRelocate"
              checked={formData.willingToRelocate}
              onCheckedChange={(checked) => setFormData({ willingToRelocate: checked === true })}
              className="mt-1"
            />
            <div>
              <Label htmlFor="willingToRelocate" className="text-sm font-medium text-charcoal-800 cursor-pointer">
                Willing to Relocate
              </Label>
              <p className="text-xs text-charcoal-500 mt-0.5">Open to relocation for the right opportunity</p>
            </div>
          </div>
        </FieldGroup>

        {formData.willingToRelocate && (
          <div className="space-y-2 animate-fade-in">
            <Label htmlFor="relocationPreferences" className="text-charcoal-700 font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4 text-charcoal-400" />
              Relocation Preferences
            </Label>
            <Textarea
              id="relocationPreferences"
              value={formData.relocationPreferences || ''}
              onChange={(e) => setFormData({ relocationPreferences: e.target.value })}
              placeholder="Preferred locations, any restrictions, relocation assistance requirements..."
              className="min-h-[80px] rounded-xl border-charcoal-200 bg-white resize-none"
              maxLength={500}
            />
          </div>
        )}
      </Section>

      <SectionDivider label="Compensation" />

      {/* Rate Type Section */}
      <Section
        icon={DollarSign}
        title="Rate Type"
        subtitle="How does this candidate prefer to be compensated?"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {RATE_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData({ rateType: type.value as typeof formData.rateType })}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  formData.rateType === type.value
                    ? 'border-gold-400 bg-gradient-to-br from-gold-50 to-amber-50'
                    : 'border-charcoal-200 bg-white hover:border-charcoal-300'
                }`}
              >
                <span className={`font-medium ${
                  formData.rateType === type.value ? 'text-gold-700' : 'text-charcoal-700'
                }`}>
                  {type.label}
                </span>
                {formData.rateType === type.value && (
                  <CheckCircle2 className="w-5 h-5 text-gold-500 mx-auto mt-2" />
                )}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Rate Expectations Section */}
      <Section
        icon={TrendingUp}
        title="Rate Expectations"
        subtitle="What are the candidate's compensation expectations?"
      >
        <FieldGroup cols={3}>
          <div className="space-y-2">
            <Label htmlFor="currency" className="text-charcoal-700 font-medium">
              Currency
            </Label>
            <Select
              value={formData.currency}
              onValueChange={(value) => setFormData({ currency: value as 'USD' | 'CAD' | 'EUR' | 'GBP' | 'INR' })}
            >
              <SelectTrigger id="currency" className="h-12 rounded-xl border-charcoal-200 bg-white">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((currency) => (
                  <SelectItem key={currency.value} value={currency.value}>
                    {currency.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="minimumRate" className="text-charcoal-700 font-medium">
              Minimum Rate
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400">
                {currencySymbol}
              </span>
              <Input
                id="minimumRate"
                type="number"
                min={0}
                value={formData.minimumRate || ''}
                onChange={(e) => setFormData({ minimumRate: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder={formData.rateType === 'annual' ? '120,000' : '85'}
                className="h-12 rounded-xl border-charcoal-200 bg-white pl-8"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-charcoal-400">
                {getRateLabel()}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="desiredRate" className="text-charcoal-700 font-medium">
              Desired Rate
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400">
                {currencySymbol}
              </span>
              <Input
                id="desiredRate"
                type="number"
                min={0}
                value={formData.desiredRate || ''}
                onChange={(e) => setFormData({ desiredRate: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder={formData.rateType === 'annual' ? '150,000' : '110'}
                className="h-12 rounded-xl border-charcoal-200 bg-white pl-8"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-charcoal-400">
                {getRateLabel()}
              </span>
            </div>
          </div>
        </FieldGroup>

        {/* Rate Range Display */}
        {(formData.minimumRate || formData.desiredRate) && (
          <div className="p-4 bg-charcoal-50 rounded-xl border border-charcoal-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-charcoal-600">Rate Range:</span>
              <span className="font-semibold text-charcoal-800">
                {formData.minimumRate ? `${currencySymbol}${formData.minimumRate.toLocaleString()}` : 'Open'}
                {' - '}
                {formData.desiredRate ? `${currencySymbol}${formData.desiredRate.toLocaleString()}` : 'Open'}
                {getRateLabel()}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-xl border border-green-200">
          <Checkbox
            id="isNegotiable"
            checked={formData.isNegotiable}
            onCheckedChange={(checked) => setFormData({ isNegotiable: checked === true })}
            className="mt-1"
          />
          <div>
            <Label htmlFor="isNegotiable" className="text-sm font-medium text-green-800 cursor-pointer">
              Rate is Negotiable
            </Label>
            <p className="text-xs text-green-700 mt-0.5">
              Candidate is open to negotiating compensation based on the opportunity
            </p>
          </div>
        </div>
      </Section>

      {/* Compensation Notes Section */}
      <Section
        icon={MessageSquare}
        title="Compensation Notes"
        subtitle="Any additional compensation details (optional)"
      >
        <div className="space-y-2">
          <Textarea
            id="compensationNotes"
            value={formData.compensationNotes || ''}
            onChange={(e) => setFormData({ compensationNotes: e.target.value })}
            placeholder="e.g., Prefers benefits over higher salary, needs signing bonus, current compensation details..."
            className="min-h-[100px] rounded-xl border-charcoal-200 bg-white resize-none"
            maxLength={1000}
          />
          <p className="text-xs text-charcoal-500">{formData.compensationNotes?.length || 0}/1000 characters</p>
        </div>
      </Section>

      {/* Validation Summary */}
      <ValidationBanner items={validationItems} />
    </div>
  )
}
