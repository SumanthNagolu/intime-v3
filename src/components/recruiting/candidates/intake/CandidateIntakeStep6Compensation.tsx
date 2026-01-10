'use client'

import { DollarSign, TrendingUp, MessageSquare, CheckCircle2 } from 'lucide-react'
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
import { useCreateCandidateStore, RATE_TYPES } from '@/stores/create-candidate-store'
import { Section, FieldGroup, ValidationBanner } from './shared'

// Currency options
const CURRENCIES = [
  { value: 'USD', label: 'USD ($)', symbol: '$' },
  { value: 'CAD', label: 'CAD (C$)', symbol: 'C$' },
  { value: 'GBP', label: 'GBP (£)', symbol: '£' },
  { value: 'EUR', label: 'EUR (€)', symbol: '€' },
  { value: 'INR', label: 'INR (₹)', symbol: '₹' },
]

export function CandidateIntakeStep6Compensation() {
  const { formData, setFormData } = useCreateCandidateStore()

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
  if (formData.minimumRate && formData.desiredRate && formData.minimumRate > formData.desiredRate) {
    validationItems.push('Minimum rate should not exceed desired rate')
  }

  return (
    <div className="space-y-8">
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
