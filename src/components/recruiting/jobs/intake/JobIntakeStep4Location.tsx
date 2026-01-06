'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateJobStore, WORK_ARRANGEMENTS, WORK_AUTHORIZATIONS } from '@/stores/create-job-store'
import { Section, FieldGroup, SelectCard, ChipToggle } from './shared'
import { MapPin, Home, Building2, Globe, Briefcase } from 'lucide-react'
import { US_STATES, COUNTRIES } from '@/components/addresses'

export function JobIntakeStep4Location() {
  const { formData, setFormData, toggleArrayItem } = useCreateJobStore()

  // Derive isRemote from workArrangement
  const handleWorkArrangementChange = (value: 'remote' | 'hybrid' | 'onsite') => {
    setFormData({
      workArrangement: value,
      isRemote: value === 'remote',
    })
  }

  return (
    <div className="space-y-10">
      {/* Work Arrangement */}
      <Section icon={Briefcase} title="Work Arrangement" subtitle="How will this role be performed?">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {WORK_ARRANGEMENTS.map((arrangement) => {
            const icons = {
              remote: <Home className="w-8 h-8 text-gold-500" />,
              hybrid: <Building2 className="w-8 h-8 text-gold-500" />,
              onsite: <MapPin className="w-8 h-8 text-gold-500" />,
            }
            return (
              <SelectCard
                key={arrangement.value}
                selected={formData.workArrangement === arrangement.value}
                onClick={() => handleWorkArrangementChange(arrangement.value)}
                className="p-6"
              >
                <div className="text-center space-y-3">
                  <div className="flex justify-center">{icons[arrangement.value]}</div>
                  <div>
                    <p className="font-semibold text-charcoal-900">{arrangement.label}</p>
                    <p className="text-xs text-charcoal-500">{arrangement.description}</p>
                  </div>
                </div>
              </SelectCard>
            )
          })}
        </div>

        {/* Hybrid Days */}
        {formData.workArrangement === 'hybrid' && (
          <div className="space-y-2 max-w-xs animate-fade-in">
            <Label className="text-charcoal-700 font-medium">Days On-Site Per Week</Label>
            <Select
              value={formData.hybridDays.toString()}
              onValueChange={(value) => setFormData({ hybridDays: parseInt(value) })}
            >
              <SelectTrigger className="h-12 rounded-xl border-charcoal-200 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((days) => (
                  <SelectItem key={days} value={days.toString()}>
                    {days} {days === 1 ? 'day' : 'days'} per week
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </Section>

      {/* Location Details - Only show for hybrid/onsite */}
      {formData.workArrangement !== 'remote' && (
        <Section icon={MapPin} title="Work Location" subtitle="Where will this role be based?">
          <div className="space-y-2">
            <Label htmlFor="location" className="text-charcoal-700 font-medium">
              Location Summary
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ location: e.target.value })}
              placeholder="e.g., San Francisco, CA or Downtown Chicago"
              className="h-12 rounded-xl border-charcoal-200 bg-white"
            />
          </div>

          <FieldGroup cols={2}>
            <div className="space-y-2">
              <Label htmlFor="addressLine1" className="text-charcoal-700 font-medium">
                Address Line 1
              </Label>
              <Input
                id="addressLine1"
                value={formData.locationAddressLine1}
                onChange={(e) => setFormData({ locationAddressLine1: e.target.value })}
                placeholder="Street address"
                className="h-12 rounded-xl border-charcoal-200 bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addressLine2" className="text-charcoal-700 font-medium">
                Address Line 2
              </Label>
              <Input
                id="addressLine2"
                value={formData.locationAddressLine2}
                onChange={(e) => setFormData({ locationAddressLine2: e.target.value })}
                placeholder="Suite, floor, etc."
                className="h-12 rounded-xl border-charcoal-200 bg-white"
              />
            </div>
          </FieldGroup>

          <FieldGroup cols={4}>
            <div className="space-y-2">
              <Label htmlFor="city" className="text-charcoal-700 font-medium">City</Label>
              <Input
                id="city"
                value={formData.locationCity}
                onChange={(e) => setFormData({ locationCity: e.target.value })}
                placeholder="City"
                className="h-12 rounded-xl border-charcoal-200 bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state" className="text-charcoal-700 font-medium">State</Label>
              <Select
                value={formData.locationState}
                onValueChange={(value) => setFormData({ locationState: value })}
              >
                <SelectTrigger id="state" className="h-12 rounded-xl border-charcoal-200 bg-white">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map((state) => (
                    <SelectItem key={state.value} value={state.value}>
                      {state.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode" className="text-charcoal-700 font-medium">Postal Code</Label>
              <Input
                id="postalCode"
                value={formData.locationPostalCode}
                onChange={(e) => setFormData({ locationPostalCode: e.target.value })}
                placeholder="ZIP"
                className="h-12 rounded-xl border-charcoal-200 bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country" className="text-charcoal-700 font-medium">Country</Label>
              <Select
                value={formData.locationCountry}
                onValueChange={(value) => setFormData({ locationCountry: value })}
              >
                <SelectTrigger id="country" className="h-12 rounded-xl border-charcoal-200 bg-white">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country.value} value={country.value}>
                      {country.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </FieldGroup>
        </Section>
      )}

      {/* Location Restrictions for Remote */}
      {formData.workArrangement === 'remote' && (
        <Section icon={MapPin} title="Location Restrictions" subtitle="Any geographic requirements for remote work?">
          <div className="space-y-4">
            <p className="text-sm text-charcoal-600">
              Select any location restrictions that apply to this remote position.
            </p>
            <div className="flex flex-wrap gap-2">
              <ChipToggle
                selected={formData.locationRestrictions.includes('us_only')}
                onClick={() => toggleArrayItem('locationRestrictions', 'us_only')}
              >
                US Only
              </ChipToggle>
              <ChipToggle
                selected={formData.locationRestrictions.includes('us_timezones')}
                onClick={() => toggleArrayItem('locationRestrictions', 'us_timezones')}
              >
                US Time Zones
              </ChipToggle>
              <ChipToggle
                selected={formData.locationRestrictions.includes('north_america')}
                onClick={() => toggleArrayItem('locationRestrictions', 'north_america')}
              >
                North America
              </ChipToggle>
              <ChipToggle
                selected={formData.locationRestrictions.includes('americas')}
                onClick={() => toggleArrayItem('locationRestrictions', 'americas')}
              >
                Americas (Any)
              </ChipToggle>
              <ChipToggle
                selected={formData.locationRestrictions.includes('global')}
                onClick={() => toggleArrayItem('locationRestrictions', 'global')}
              >
                Global (No Restrictions)
              </ChipToggle>
            </div>
          </div>
        </Section>
      )}

      {/* Work Authorization */}
      <Section icon={Globe} title="Work Authorization Requirements" subtitle="Acceptable work authorization types">
        <p className="text-sm text-charcoal-600 mb-4">
          Select all work authorization types that are acceptable for this position.
        </p>
        <div className="flex flex-wrap gap-2">
          {WORK_AUTHORIZATIONS.map((auth) => (
            <ChipToggle
              key={auth.value}
              selected={formData.workAuthorizations.includes(auth.value)}
              onClick={() => toggleArrayItem('workAuthorizations', auth.value)}
            >
              {auth.label}
            </ChipToggle>
          ))}
        </div>
        {formData.workAuthorizations.length === 0 && (
          <p className="text-xs text-amber-600 mt-2">
            Consider selecting at least one work authorization type to help filter candidates
          </p>
        )}
      </Section>
    </div>
  )
}
