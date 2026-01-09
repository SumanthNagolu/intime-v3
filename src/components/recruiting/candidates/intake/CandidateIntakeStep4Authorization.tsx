'use client'

import { Shield, MapPin, DollarSign, Clock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateCandidateStore, VISA_STATUSES, AVAILABILITY_OPTIONS } from '@/stores/create-candidate-store'
import { Section, FieldGroup, ValidationBanner } from './shared'
import { LocationPicker } from '@/components/addresses/LocationPicker'

export function CandidateIntakeStep4Authorization() {
  const { formData, setFormData } = useCreateCandidateStore()

  const handleLocationChange = (value: { city?: string | null; stateProvince?: string | null; countryCode?: string | null }) => {
    const displayParts = [value.city, value.stateProvince].filter(Boolean)
    setFormData({
      location: displayParts.join(', '),
      locationCity: value.city || '',
      locationState: value.stateProvince || '',
      locationCountry: value.countryCode || 'US',
    })
  }

  // Build validation items
  const validationItems: string[] = []
  if (!formData.location) validationItems.push('Select a location')

  return (
    <div className="space-y-8">
      <Section
        icon={Shield}
        title="Work Authorization"
        subtitle="Visa status and availability"
      >
        <FieldGroup cols={2}>
          <div className="space-y-2">
            <Label htmlFor="visaStatus" className="text-charcoal-700 font-medium">
              Visa Status <span className="text-gold-500">*</span>
            </Label>
            <Select
              value={formData.visaStatus}
              onValueChange={(value) => setFormData({ visaStatus: value as typeof formData.visaStatus })}
            >
              <SelectTrigger id="visaStatus" className="h-12 rounded-xl border-charcoal-200 bg-white">
                <SelectValue placeholder="Select visa status" />
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

          <div className="space-y-2">
            <Label htmlFor="availability" className="text-charcoal-700 font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-charcoal-400" />
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
        </FieldGroup>
      </Section>

      <Section
        icon={MapPin}
        title="Location"
        subtitle="Current location and work preferences"
      >
        <LocationPicker
          label="Current Location"
          required
          showCountry
          value={{
            city: formData.locationCity || '',
            stateProvince: formData.locationState || '',
            countryCode: formData.locationCountry || 'US',
          }}
          onChange={handleLocationChange}
        />

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
      </Section>

      <Section
        icon={DollarSign}
        title="Rate Expectations"
        subtitle="Desired compensation (optional)"
      >
        <FieldGroup cols={2}>
          <div className="space-y-2">
            <Label htmlFor="minimumHourlyRate" className="text-charcoal-700 font-medium">
              Minimum Rate ($/hr)
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400">$</span>
              <Input
                id="minimumHourlyRate"
                type="number"
                min={0}
                value={formData.minimumHourlyRate || ''}
                onChange={(e) => setFormData({ minimumHourlyRate: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="85"
                className="h-12 rounded-xl border-charcoal-200 bg-white pl-8"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="desiredHourlyRate" className="text-charcoal-700 font-medium">
              Desired Rate ($/hr)
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400">$</span>
              <Input
                id="desiredHourlyRate"
                type="number"
                min={0}
                value={formData.desiredHourlyRate || ''}
                onChange={(e) => setFormData({ desiredHourlyRate: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="110"
                className="h-12 rounded-xl border-charcoal-200 bg-white pl-8"
              />
            </div>
          </div>
        </FieldGroup>
      </Section>

      {/* Validation Summary */}
      <ValidationBanner items={validationItems} />
    </div>
  )
}
