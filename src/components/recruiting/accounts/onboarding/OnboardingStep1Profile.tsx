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
import { useAccountOnboardingStore, INDUSTRIES, COMPANY_SIZES } from '@/stores/account-onboarding-store'
import { OPERATING_COUNTRIES, getStatesByCountry, getCountryCode } from '@/components/addresses'

export function OnboardingStep1Profile() {
  const { formData, setFormData } = useAccountOnboardingStore()

  // Get country code - handle both code ('US') and label ('United States') formats
  const countryCode = formData.country?.length === 2
    ? formData.country
    : getCountryCode(formData.country || 'United States')

  // Get state options based on selected country
  const stateOptions = getStatesByCountry(countryCode)

  // Handle country change - reset state when country changes
  const handleCountryChange = (newCountryCode: string) => {
    setFormData({
      country: newCountryCode,
      state: '', // Reset state when country changes
    })
  }

  return (
    <div className="space-y-6">
      {/* Company Identity */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
          Company Identity
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Legal Company Name</Label>
            <Input
              value={formData.legalName}
              onChange={(e) => setFormData({ legalName: e.target.value })}
              placeholder="Full legal name"
            />
          </div>
          <div className="space-y-2">
            <Label>DBA / Trade Name</Label>
            <Input
              value={formData.dbaName}
              onChange={(e) => setFormData({ dbaName: e.target.value })}
              placeholder="If different from legal name"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Industry</Label>
            <Select value={formData.industry} onValueChange={(v) => setFormData({ industry: v })}>
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
          <div className="space-y-2">
            <Label>Company Size</Label>
            <Select
              value={formData.companySize}
              onValueChange={(v) => setFormData({ companySize: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {COMPANY_SIZES.map((size) => (
                  <SelectItem key={size.value} value={size.value}>
                    {size.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Year Founded</Label>
            <Input
              type="number"
              value={formData.yearFounded}
              onChange={(e) => setFormData({ yearFounded: e.target.value })}
              placeholder="2010"
              min={1800}
              max={new Date().getFullYear()}
            />
          </div>
          <div className="space-y-2">
            <Label>Website</Label>
            <Input
              value={formData.website}
              onChange={(e) => setFormData({ website: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label>LinkedIn URL</Label>
            <Input
              value={formData.linkedinUrl}
              onChange={(e) => setFormData({ linkedinUrl: e.target.value })}
              placeholder="https://linkedin.com/company/..."
            />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
          Headquarters Address
        </h3>
        <div className="space-y-2">
          <Label>Street Address</Label>
          <Input
            value={formData.streetAddress}
            onChange={(e) => setFormData({ streetAddress: e.target.value })}
            placeholder="123 Main St, Suite 100"
          />
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>City</Label>
            <Input
              value={formData.city}
              onChange={(e) => setFormData({ city: e.target.value })}
              placeholder="San Francisco"
            />
          </div>
          <div className="space-y-2">
            <Label>State/Province</Label>
            <Select
              value={formData.state}
              onValueChange={(v) => setFormData({ state: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {stateOptions.map((state) => (
                  <SelectItem key={state.value} value={state.value}>
                    {state.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Postal Code</Label>
            <Input
              value={formData.postalCode}
              onChange={(e) => setFormData({ postalCode: e.target.value })}
              placeholder="94102"
            />
          </div>
          <div className="space-y-2">
            <Label>Country</Label>
            <Select
              value={countryCode}
              onValueChange={handleCountryChange}
            >
              <SelectTrigger>
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
      </div>

      {/* Additional Info */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
          Additional Information
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Tax ID (EIN)</Label>
            <Input
              value={formData.taxId}
              onChange={(e) => setFormData({ taxId: e.target.value })}
              placeholder="XX-XXXXXXX"
            />
          </div>
          <div className="space-y-2">
            <Label>Funding Stage</Label>
            <Select
              value={formData.fundingStage}
              onValueChange={(v) => setFormData({ fundingStage: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bootstrapped">Bootstrapped</SelectItem>
                <SelectItem value="seed">Seed</SelectItem>
                <SelectItem value="series_a">Series A</SelectItem>
                <SelectItem value="series_b">Series B</SelectItem>
                <SelectItem value="series_c">Series C+</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private_equity">Private Equity</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Account Classification</Label>
            <Select
              value={formData.accountClassification}
              onValueChange={(v) => setFormData({ accountClassification: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select classification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="strategic">Strategic</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
                <SelectItem value="mid_market">Mid-Market</SelectItem>
                <SelectItem value="smb">SMB</SelectItem>
                <SelectItem value="startup">Startup</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}
