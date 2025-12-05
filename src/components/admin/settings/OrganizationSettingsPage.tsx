'use client'

import * as React from 'react'
import { Building2, Globe, Phone, Mail, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { trpc } from '@/lib/trpc/client'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface SettingsSectionProps {
  title: string
  description?: string
  icon?: React.ElementType
  children: React.ReactNode
  className?: string
}

function SettingsSection({
  title,
  description,
  icon: Icon,
  children,
  className,
}: SettingsSectionProps) {
  return (
    <div className={cn('bg-white rounded-lg border border-charcoal-100 shadow-elevation-xs', className)}>
      <div className="px-6 py-4 border-b border-charcoal-100">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2 bg-charcoal-50 rounded-lg">
              <Icon className="h-5 w-5 text-charcoal-600" />
            </div>
          )}
          <div>
            <h3 className="font-heading text-lg font-semibold text-charcoal-900 tracking-wide">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-charcoal-500 mt-0.5">{description}</p>
            )}
          </div>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

const industries = [
  'Staffing & Recruiting',
  'Technology',
  'Healthcare',
  'Finance',
  'Manufacturing',
  'Retail',
  'Education',
  'Government',
  'Non-Profit',
  'Other',
]

const companySizes = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '501-1000 employees',
  '1000+ employees',
]

export function OrganizationSettingsPage() {
  const utils = trpc.useUtils()

  // Fetch organization data
  const { data: organization, isLoading } = trpc.settings.getOrganization.useQuery()

  // Form state
  const [name, setName] = React.useState('')
  const [legalName, setLegalName] = React.useState('')
  const [industry, setIndustry] = React.useState('')
  const [companySize, setCompanySize] = React.useState('')
  const [website, setWebsite] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [addressLine1, setAddressLine1] = React.useState('')
  const [addressLine2, setAddressLine2] = React.useState('')
  const [city, setCity] = React.useState('')
  const [state, setState] = React.useState('')
  const [postalCode, setPostalCode] = React.useState('')
  const [country, setCountry] = React.useState('')

  // Update form when data loads
  React.useEffect(() => {
    if (organization) {
      setName(organization.name || '')
      setLegalName(organization.legal_name || '')
      setIndustry(organization.industry || '')
      setCompanySize(organization.company_size || '')
      setWebsite(organization.website || '')
      setEmail(organization.email || '')
      setPhone(organization.phone || '')
      setAddressLine1(organization.address_line1 || '')
      setAddressLine2(organization.address_line2 || '')
      setCity(organization.city || '')
      setState(organization.state || '')
      setPostalCode(organization.postal_code || '')
      setCountry(organization.country || 'US')
    }
  }, [organization])

  // Update mutation
  const updateOrganization = trpc.settings.updateOrganization.useMutation({
    onSuccess: () => {
      toast.success('Organization settings saved successfully')
      utils.settings.getOrganization.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save settings')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Organization name is required')
      return
    }

    updateOrganization.mutate({
      name: name.trim(),
      legal_name: legalName.trim() || null,
      industry: industry || null,
      company_size: companySize || null,
      website: website.trim() || null,
      email: email.trim() || null,
      phone: phone.trim() || null,
      address_line1: addressLine1.trim() || null,
      address_line2: addressLine2.trim() || null,
      city: city.trim() || null,
      state: state.trim() || null,
      postal_code: postalCode.trim() || null,
      country: country.trim() || null,
    })
  }

  if (isLoading) {
    return (
      <DashboardShell
        title="Organization Settings"
        description="Manage your organization profile and contact information"
      >
        <div className="animate-pulse space-y-6">
          <div className="h-48 bg-charcoal-100 rounded-lg" />
          <div className="h-48 bg-charcoal-100 rounded-lg" />
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell
      title="Organization Settings"
      description="Manage your organization profile and contact information"
      actions={
        <Button
          onClick={handleSubmit}
          loading={updateOrganization.isPending}
          disabled={updateOrganization.isPending}
        >
          Save Changes
        </Button>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* General Information */}
        <SettingsSection
          title="General Information"
          description="Basic information about your organization"
          icon={Building2}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter organization name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="legalName">Legal Name</Label>
              <Input
                id="legalName"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                placeholder="Legal entity name (if different)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger id="industry">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((ind) => (
                    <SelectItem key={ind} value={ind}>
                      {ind}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companySize">Company Size</Label>
              <Select value={companySize} onValueChange={setCompanySize}>
                <SelectTrigger id="companySize">
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>
                <SelectContent>
                  {companySizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://www.example.com"
                leftIcon={<Globe className="h-4 w-4" />}
              />
            </div>
          </div>
        </SettingsSection>

        {/* Contact Information */}
        <SettingsSection
          title="Contact Information"
          description="How people can reach your organization"
          icon={Phone}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="email">Contact Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@example.com"
                leftIcon={<Mail className="h-4 w-4" />}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                leftIcon={<Phone className="h-4 w-4" />}
              />
            </div>
          </div>
        </SettingsSection>

        {/* Address */}
        <SettingsSection
          title="Address"
          description="Physical location of your organization"
          icon={MapPin}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="addressLine1">Address Line 1</Label>
              <Input
                id="addressLine1"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                placeholder="123 Main Street"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="addressLine2">Address Line 2</Label>
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
              <Label htmlFor="state">State / Province</Label>
              <Input
                id="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="NY"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="10001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="United States"
              />
            </div>
          </div>
        </SettingsSection>

        {/* Mobile submit button */}
        <div className="md:hidden">
          <Button
            type="submit"
            className="w-full"
            loading={updateOrganization.isPending}
            disabled={updateOrganization.isPending}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </DashboardShell>
  )
}
