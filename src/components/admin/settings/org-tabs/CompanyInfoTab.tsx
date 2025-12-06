'use client'

import * as React from 'react'
import { Building2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { SettingsSection } from '../SettingsSection'

interface CompanyInfoTabProps {
  organization: {
    name?: string
    legal_name?: string | null
    industry?: string | null
    company_size?: string | null
    founded_year?: number | null
    website?: string | null
  } | null | undefined
  onSave: (data: Record<string, unknown>) => void
  isPending: boolean
}

const industries = [
  'IT Staffing & Consulting',
  'Healthcare Staffing',
  'Finance & Accounting',
  'Manufacturing & Industrial',
  'Engineering',
  'Administrative & Clerical',
  'General Staffing',
  'Executive Search',
  'Other',
]

const companySizes = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '501-1000', label: '501-1000 employees' },
  { value: '1000+', label: '1000+ employees' },
]

export function CompanyInfoTab({ organization, onSave, isPending }: CompanyInfoTabProps) {
  const [name, setName] = React.useState(organization?.name || '')
  const [legalName, setLegalName] = React.useState(organization?.legal_name || '')
  const [industry, setIndustry] = React.useState(organization?.industry || '')
  const [companySize, setCompanySize] = React.useState(organization?.company_size || '')
  const [foundedYear, setFoundedYear] = React.useState(organization?.founded_year?.toString() || '')
  const [website, setWebsite] = React.useState(organization?.website || '')

  React.useEffect(() => {
    if (organization) {
      setName(organization.name || '')
      setLegalName(organization.legal_name || '')
      setIndustry(organization.industry || '')
      setCompanySize(organization.company_size || '')
      setFoundedYear(organization.founded_year?.toString() || '')
      setWebsite(organization.website || '')
    }
  }, [organization])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      name: name.trim(),
      legal_name: legalName.trim() || null,
      industry: industry || null,
      company_size: companySize || null,
      founded_year: foundedYear ? parseInt(foundedYear) : null,
      website: website.trim() || null,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <SettingsSection
        title="Company Information"
        description="Basic information about your organization"
        icon={Building2}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Company Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter company name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="legalName">Legal Name</Label>
            <Input
              id="legalName"
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
              placeholder="Legal entity name"
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
                  <SelectItem key={ind} value={ind}>{ind}</SelectItem>
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
                {companySizes.map((size) => (
                  <SelectItem key={size.value} value={size.value}>{size.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="foundedYear">Founded Year</Label>
            <Input
              id="foundedYear"
              type="number"
              min="1800"
              max={new Date().getFullYear()}
              value={foundedYear}
              onChange={(e) => setFoundedYear(e.target.value)}
              placeholder="e.g., 2015"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button id="save-settings-btn" type="submit" loading={isPending} disabled={isPending}>
            Save Company Info
          </Button>
        </div>
      </SettingsSection>
    </form>
  )
}
