'use client'

import * as React from 'react'
import { Phone, MapPin, Mail, Share2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { SettingsSection } from '../SettingsSection'

interface ContactInfo {
  main_phone?: string | null
  fax?: string | null
  general_email?: string | null
  support_email?: string | null
  hr_email?: string | null
  billing_email?: string | null
  linkedin_url?: string | null
  twitter_handle?: string | null
}

interface ContactTabProps {
  organization: {
    email?: string | null
    phone?: string | null
    address_line1?: string | null
    address_line2?: string | null
    city?: string | null
    state?: string | null
    postal_code?: string | null
    country?: string | null
    contact_info?: ContactInfo | null
  } | null | undefined
  onSave: (data: Record<string, unknown>) => void
  isPending: boolean
}

const states = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming'
]

const countries = [
  'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France',
  'India', 'Japan', 'China', 'Brazil', 'Mexico', 'Singapore', 'Netherlands'
]

export function ContactTab({ organization, onSave, isPending }: ContactTabProps) {
  // Address fields
  const [addressLine1, setAddressLine1] = React.useState(organization?.address_line1 || '')
  const [addressLine2, setAddressLine2] = React.useState(organization?.address_line2 || '')
  const [city, setCity] = React.useState(organization?.city || '')
  const [state, setState] = React.useState(organization?.state || '')
  const [postalCode, setPostalCode] = React.useState(organization?.postal_code || '')
  const [country, setCountry] = React.useState(organization?.country || 'United States')

  // Contact info
  const [mainPhone, setMainPhone] = React.useState(organization?.contact_info?.main_phone || organization?.phone || '')
  const [fax, setFax] = React.useState(organization?.contact_info?.fax || '')
  const [generalEmail, setGeneralEmail] = React.useState(organization?.contact_info?.general_email || organization?.email || '')
  const [supportEmail, setSupportEmail] = React.useState(organization?.contact_info?.support_email || '')
  const [hrEmail, setHrEmail] = React.useState(organization?.contact_info?.hr_email || '')
  const [billingEmail, setBillingEmail] = React.useState(organization?.contact_info?.billing_email || '')
  const [linkedinUrl, setLinkedinUrl] = React.useState(organization?.contact_info?.linkedin_url || '')
  const [twitterHandle, setTwitterHandle] = React.useState(organization?.contact_info?.twitter_handle || '')

  React.useEffect(() => {
    if (organization) {
      setAddressLine1(organization.address_line1 || '')
      setAddressLine2(organization.address_line2 || '')
      setCity(organization.city || '')
      setState(organization.state || '')
      setPostalCode(organization.postal_code || '')
      setCountry(organization.country || 'United States')

      const contactInfo = organization.contact_info || {}
      setMainPhone(contactInfo.main_phone || organization.phone || '')
      setFax(contactInfo.fax || '')
      setGeneralEmail(contactInfo.general_email || organization.email || '')
      setSupportEmail(contactInfo.support_email || '')
      setHrEmail(contactInfo.hr_email || '')
      setBillingEmail(contactInfo.billing_email || '')
      setLinkedinUrl(contactInfo.linkedin_url || '')
      setTwitterHandle(contactInfo.twitter_handle || '')
    }
  }, [organization])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      address_line1: addressLine1.trim() || null,
      address_line2: addressLine2.trim() || null,
      city: city.trim() || null,
      state: state || null,
      postal_code: postalCode.trim() || null,
      country: country || null,
      phone: mainPhone.trim() || null,
      email: generalEmail.trim() || null,
      contact_info: {
        main_phone: mainPhone.trim() || null,
        fax: fax.trim() || null,
        general_email: generalEmail.trim() || null,
        support_email: supportEmail.trim() || null,
        hr_email: hrEmail.trim() || null,
        billing_email: billingEmail.trim() || null,
        linkedin_url: linkedinUrl.trim() || null,
        twitter_handle: twitterHandle.trim() || null,
      },
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <SettingsSection
          title="Primary Address"
          description="Your organization's main office address"
          icon={MapPin}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="addressLine1">Street Address</Label>
              <Input
                id="addressLine1"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                placeholder="123 Main Street"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="addressLine2">Suite/Unit</Label>
              <Input
                id="addressLine2"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                placeholder="Suite 400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="New York"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State/Province</Label>
              <Select value={state} onValueChange={setState}>
                <SelectTrigger id="state">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode">ZIP/Postal Code</Label>
              <Input
                id="postalCode"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="10001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger id="country">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Phone Numbers"
          description="Contact phone numbers for your organization"
          icon={Phone}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="mainPhone">Main Phone</Label>
              <Input
                id="mainPhone"
                type="tel"
                value={mainPhone}
                onChange={(e) => setMainPhone(e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fax">Fax</Label>
              <Input
                id="fax"
                type="tel"
                value={fax}
                onChange={(e) => setFax(e.target.value)}
                placeholder="(555) 123-4568"
              />
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Email Addresses"
          description="Department email addresses"
          icon={Mail}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="generalEmail">General Inquiries</Label>
              <Input
                id="generalEmail"
                type="email"
                value={generalEmail}
                onChange={(e) => setGeneralEmail(e.target.value)}
                placeholder="info@company.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supportEmail">Support</Label>
              <Input
                id="supportEmail"
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                placeholder="support@company.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hrEmail">HR / Recruiting</Label>
              <Input
                id="hrEmail"
                type="email"
                value={hrEmail}
                onChange={(e) => setHrEmail(e.target.value)}
                placeholder="hr@company.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingEmail">Billing</Label>
              <Input
                id="billingEmail"
                type="email"
                value={billingEmail}
                onChange={(e) => setBillingEmail(e.target.value)}
                placeholder="billing@company.com"
              />
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Social Media"
          description="Your organization's social media profiles"
          icon={Share2}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
              <Input
                id="linkedinUrl"
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/company/yourcompany"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitterHandle">Twitter/X Handle</Label>
              <Input
                id="twitterHandle"
                value={twitterHandle}
                onChange={(e) => setTwitterHandle(e.target.value)}
                placeholder="@yourcompany"
              />
            </div>
          </div>
        </SettingsSection>

        <div className="flex justify-end">
          <Button id="save-settings-btn" type="submit" loading={isPending} disabled={isPending}>
            Save Contact Info
          </Button>
        </div>
      </div>
    </form>
  )
}
