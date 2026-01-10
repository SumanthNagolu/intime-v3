'use client'

import { Shield, Clock, MapPin, Calendar, Plane } from 'lucide-react'
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
import { useCreateCandidateStore, VISA_STATUSES, AVAILABILITY_OPTIONS } from '@/stores/create-candidate-store'
import { Section, FieldGroup, ValidationBanner } from './shared'

// Visas that typically require sponsorship
const SPONSORSHIP_VISAS = ['h1b', 'l1', 'opt', 'cpt', 'ead', 'other']

export function CandidateIntakeStep5Authorization() {
  const { formData, setFormData } = useCreateCandidateStore()

  // Auto-set sponsorship requirement based on visa type
  const handleVisaChange = (value: string) => {
    const requiresSponsorship = SPONSORSHIP_VISAS.includes(value)
    setFormData({
      visaStatus: value as typeof formData.visaStatus,
      requiresSponsorship: value === 'other' ? formData.requiresSponsorship : requiresSponsorship,
    })
  }

  // Build validation items
  const validationItems: string[] = []
  if (!formData.visaStatus) validationItems.push('Select work authorization status')
  if (!formData.availability) validationItems.push('Select availability')

  return (
    <div className="space-y-8">
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

      {/* Validation Summary */}
      <ValidationBanner items={validationItems} />
    </div>
  )
}
