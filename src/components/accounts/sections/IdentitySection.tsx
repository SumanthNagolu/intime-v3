'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PhoneInput } from '@/components/ui/phone-input'
import {
  Building2,
  User,
  Globe,
  Linkedin,
  Landmark,
  Tag,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react'
import { SectionWrapper } from '../layouts/SectionHeader'
import { SectionHeader } from '../fields/SectionHeader'
import { UnifiedField } from '../fields/UnifiedField'
import { FieldGrid } from '../layouts/FieldGrid'
import { InfoRow } from '../layouts/CardView'
import {
  INDUSTRIES,
  COMPANY_TYPES,
  PARTNERSHIP_TIERS,
  COMPANY_SEGMENTS,
  ACCOUNT_STATUSES,
  EMPLOYEE_RANGES,
  REVENUE_RANGES,
  OWNERSHIP_TYPES,
  getStatusBadgeVariant,
  getLabel,
} from '@/lib/accounts/constants'
import type { SectionMode, IdentitySectionData } from '@/lib/accounts/types'
import { cn } from '@/lib/utils'

// ============ PROPS ============

interface IdentitySectionProps {
  /** Mode determines rendering style */
  mode: SectionMode
  /** Data to display/edit */
  data: IdentitySectionData
  /** Handler for field changes */
  onChange?: (field: string, value: unknown) => void
  /** Handler for toggling industry selection (create mode) */
  onToggleIndustry?: (industry: string) => void
  /** Handler to enter edit mode (view mode) */
  onEdit?: () => void
  /** Save handler (for edit mode) */
  onSave?: () => Promise<void>
  /** Cancel handler (for edit mode) */
  onCancel?: () => void
  /** Loading state for save operation */
  isSaving?: boolean
  /** Validation errors by field name */
  errors?: Record<string, string>
  /** Additional class name */
  className?: string
}

/**
 * IdentitySection - Unified component for Identity & Classification
 *
 * Handles all three modes:
 * - create: Full form for wizard step (Step 1)
 * - view: Read-only card grid for detail page with in-place editing
 * - edit: Same layout as view but fields are editable
 */
export function IdentitySection({
  mode,
  data,
  onChange,
  onToggleIndustry,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
  errors = {},
  className,
}: IdentitySectionProps) {
  const [isEditing, setIsEditing] = React.useState(mode === 'edit')

  // Reset editing state when mode changes
  React.useEffect(() => {
    setIsEditing(mode === 'edit')
  }, [mode])

  const handleChange = (field: string, value: unknown) => {
    onChange?.(field, value)
  }

  const handleSave = async () => {
    await onSave?.()
    setIsEditing(false)
  }

  const handleCancel = () => {
    onCancel?.()
    setIsEditing(false)
  }

  const handleEdit = () => {
    onEdit?.()
    setIsEditing(true)
  }

  const isPerson = data.accountType === 'person'
  const isEditable = mode === 'create' || isEditing

  // Convert constants to option format for UnifiedField
  const industryOptions = INDUSTRIES.map(i => ({ value: i.value, label: i.label, icon: i.icon }))
  const companyTypeOptions = COMPANY_TYPES.map(t => ({ value: t.value, label: t.label }))
  const tierOptions = PARTNERSHIP_TIERS.map(t => ({ value: t.value, label: t.label }))
  const segmentOptions = COMPANY_SEGMENTS.map(s => ({ value: s.value, label: `${s.icon} ${s.label}` }))
  const statusOptions = ACCOUNT_STATUSES.map(s => ({ value: s.value, label: s.label }))
  const employeeOptions = EMPLOYEE_RANGES.map(e => ({ value: e.value, label: e.label }))
  const revenueOptions = REVENUE_RANGES.map(r => ({ value: r.value, label: r.label }))
  const ownershipOptions = OWNERSHIP_TYPES.map(o => ({ value: o.value, label: o.label }))

  // ============ CREATE MODE ============
  if (mode === 'create') {
    return (
      <div className={cn('space-y-10', className)}>
        {/* Account Type Selection */}
        <SectionWrapper
          icon={Building2}
          title="Account Type"
          subtitle="Select the entity type for this account"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AccountTypeCard
              type="company"
              selected={data.accountType === 'company'}
              onSelect={() => handleChange('accountType', 'company')}
            />
            <AccountTypeCard
              type="person"
              selected={data.accountType === 'person'}
              onSelect={() => handleChange('accountType', 'person')}
            />
          </div>
        </SectionWrapper>

        {/* Company Identity */}
        <SectionWrapper
          icon={Building2}
          title="Company Identity"
          subtitle="Legal entity details"
        >
          <FieldGrid cols={2}>
            <div className="md:col-span-2 space-y-2">
              <Label className="text-charcoal-700 font-medium">
                {isPerson ? 'Full Name' : 'Company Name'} <span className="text-gold-500">*</span>
              </Label>
              <Input
                value={data.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder={isPerson ? 'e.g., John Smith' : 'e.g., Acme Corporation'}
                className="h-12 rounded-xl border-charcoal-200 bg-white"
              />
              {errors.name && (
                <p className="text-xs text-error-600">{errors.name}</p>
              )}
            </div>

            {!isPerson && (
              <>
                <div className="space-y-2">
                  <Label className="text-charcoal-700 font-medium">Legal Name</Label>
                  <Input
                    value={data.legalName}
                    onChange={(e) => handleChange('legalName', e.target.value)}
                    placeholder="e.g., Acme International, LLC"
                    className="h-12 rounded-xl border-charcoal-200 bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-charcoal-700 font-medium">DBA (Doing Business As)</Label>
                  <Input
                    value={data.dba}
                    onChange={(e) => handleChange('dba', e.target.value)}
                    placeholder="e.g., Acme Tech"
                    className="h-12 rounded-xl border-charcoal-200 bg-white"
                  />
                </div>
              </>
            )}
          </FieldGrid>
        </SectionWrapper>

        {/* Classification */}
        <SectionWrapper
          icon={Tag}
          title="Classification"
          subtitle="Business categorization and tier"
        >
          <div className="space-y-6">
            {/* Industries Multi-Select */}
            <div className="space-y-2">
              <Label className="text-charcoal-700 font-medium">
                Industries <span className="text-gold-500">*</span>
              </Label>
              <div className="flex flex-wrap gap-2">
                {INDUSTRIES.map((industry) => {
                  const isSelected = data.industries.includes(industry.value)
                  return (
                    <button
                      key={industry.value}
                      type="button"
                      onClick={() => {
                        if (onToggleIndustry) {
                          onToggleIndustry(industry.value)
                        } else {
                          const newIndustries = isSelected
                            ? data.industries.filter((i) => i !== industry.value)
                            : [...data.industries, industry.value]
                          handleChange('industries', newIndustries)
                        }
                      }}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
                        isSelected
                          ? 'bg-gradient-to-r from-hublot-800 to-hublot-900 text-white shadow-sm'
                          : 'bg-charcoal-100 text-charcoal-700 hover:bg-charcoal-200'
                      )}
                    >
                      <span>{industry.icon}</span>
                      {industry.label}
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 ml-0.5" />}
                    </button>
                  )
                })}
              </div>
              {errors.industries && (
                <p className="text-xs text-error-600">{errors.industries}</p>
              )}
            </div>

            {/* Company Type, Tier, Segment */}
            <FieldGrid cols={3}>
              <div className="space-y-2">
                <Label className="text-charcoal-700 font-medium">Company Type</Label>
                <Select
                  value={data.companyType}
                  onValueChange={(v) => handleChange('companyType', v)}
                >
                  <SelectTrigger className="h-12 rounded-xl border-charcoal-200 bg-white">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPANY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-charcoal-700 font-medium">Partnership Tier</Label>
                <Select
                  value={data.tier}
                  onValueChange={(v) => handleChange('tier', v)}
                >
                  <SelectTrigger className="h-12 rounded-xl border-charcoal-200 bg-white">
                    <SelectValue placeholder="No tier assigned" />
                  </SelectTrigger>
                  <SelectContent>
                    {PARTNERSHIP_TIERS.map((tier) => (
                      <SelectItem key={tier.value} value={tier.value}>
                        {tier.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-charcoal-700 font-medium">Market Segment</Label>
                <Select
                  value={data.segment}
                  onValueChange={(v) => handleChange('segment', v)}
                >
                  <SelectTrigger className="h-12 rounded-xl border-charcoal-200 bg-white">
                    <SelectValue placeholder="No segment assigned" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPANY_SEGMENTS.map((segment) => (
                      <SelectItem key={segment.value} value={segment.value}>
                        {segment.icon} {segment.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </FieldGrid>
          </div>
        </SectionWrapper>

        {/* Registration & Contact */}
        <SectionWrapper
          icon={Landmark}
          title="Registration & Contact"
          subtitle="Tax information and primary contact details"
        >
          <FieldGrid cols={2}>
            <div className="space-y-2">
              <Label className="text-charcoal-700 font-medium">
                {isPerson ? 'SSN' : 'Tax ID (EIN)'}
              </Label>
              <TaxIdInput
                value={data.taxId}
                onChange={(v) => handleChange('taxId', v)}
                isPerson={isPerson}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-charcoal-700 font-medium">Primary Email</Label>
              <Input
                type="email"
                value={data.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="contact@example.com"
                className="h-12 rounded-xl border-charcoal-200 bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-charcoal-700 font-medium">Primary Phone</Label>
              <PhoneInput
                value={data.phone}
                onChange={(v) => handleChange('phone', v)}
              />
            </div>

            {!isPerson && (
              <div className="space-y-2">
                <Label className="text-charcoal-700 font-medium">Founded Year</Label>
                <Input
                  type="number"
                  value={data.foundedYear}
                  onChange={(e) => handleChange('foundedYear', e.target.value)}
                  placeholder="2020"
                  min={1800}
                  max={new Date().getFullYear()}
                  className="h-12 rounded-xl border-charcoal-200 bg-white"
                />
              </div>
            )}
          </FieldGrid>
        </SectionWrapper>

        {/* Digital Presence */}
        <SectionWrapper
          icon={Globe}
          title="Digital Presence"
          subtitle="Website and social media profiles"
        >
          <FieldGrid cols={2}>
            <div className="space-y-2">
              <Label className="text-charcoal-700 font-medium">Company Website</Label>
              <Input
                type="url"
                value={data.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://example.com"
                className="h-12 rounded-xl border-charcoal-200 bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-charcoal-700 font-medium">LinkedIn URL</Label>
              <Input
                type="url"
                value={data.linkedinUrl}
                onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                placeholder="https://linkedin.com/company/..."
                className="h-12 rounded-xl border-charcoal-200 bg-white"
              />
            </div>
          </FieldGrid>
        </SectionWrapper>

        {/* Company Description */}
        <SectionWrapper
          icon={Building2}
          title="Company Description"
          subtitle="Brief description of the company"
        >
          <Textarea
            value={data.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Brief description of the company, what they do, and their key business areas..."
            className="min-h-[120px] rounded-xl border-charcoal-200 bg-white resize-none"
            maxLength={500}
          />
          <p className="text-xs text-charcoal-400 text-right">
            {(data.description || '').length}/500 characters
          </p>
        </SectionWrapper>
      </div>
    )
  }

  // ============ VIEW/EDIT MODE - In-Place Editing ============
  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header with Edit/Save/Cancel */}
      <SectionHeader
        title="Identity & Classification"
        subtitle="Company details, registration, and industry classification"
        mode={isEditing ? 'edit' : 'view'}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancel={handleCancel}
        isSaving={isSaving}
      />

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Identity Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gold-50 rounded-lg">
                <Building2 className="w-4 h-4 text-gold-600" />
              </div>
              <CardTitle className="text-base font-heading">Company Identity</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Company Name"
              value={data.name}
              onChange={(v) => handleChange('name', v)}
              editable={isEditable}
              required
              error={errors?.name}
            />
            <UnifiedField
              label="Legal Name"
              value={data.legalName}
              onChange={(v) => handleChange('legalName', v)}
              editable={isEditable}
            />
            <UnifiedField
              label="DBA / Trade Name"
              value={data.dba}
              onChange={(v) => handleChange('dba', v)}
              editable={isEditable}
            />
            <UnifiedField
              label="Relationship Type"
              type="select"
              options={companyTypeOptions}
              value={data.companyType}
              onChange={(v) => handleChange('companyType', v)}
              editable={isEditable}
            />
          </CardContent>
        </Card>

        {/* Classification Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Tag className="w-4 h-4 text-blue-600" />
              </div>
              <CardTitle className="text-base font-heading">Classification</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Industries"
              type="multiSelect"
              options={industryOptions}
              value={data.industries}
              onChange={(v) => handleChange('industries', v)}
              editable={isEditable}
              required
              error={errors?.industries}
            />
            <UnifiedField
              label="Segment"
              type="select"
              options={segmentOptions}
              value={data.segment}
              onChange={(v) => handleChange('segment', v)}
              editable={isEditable}
            />
            <UnifiedField
              label="Tier"
              type="select"
              options={tierOptions}
              value={data.tier}
              onChange={(v) => handleChange('tier', v)}
              editable={isEditable}
              badge={!isEditable}
            />
            <UnifiedField
              label="Status"
              type="select"
              options={statusOptions}
              value={data.status}
              onChange={(v) => handleChange('status', v)}
              editable={isEditable}
              badge={!isEditable}
              badgeVariant={getStatusBadgeVariant(data.status)}
            />
          </CardContent>
        </Card>

        {/* Corporate Profile Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Landmark className="w-4 h-4 text-purple-600" />
              </div>
              <CardTitle className="text-base font-heading">Corporate Profile</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Ownership Type"
              type="select"
              options={ownershipOptions}
              value={data.ownershipType}
              onChange={(v) => handleChange('ownershipType', v)}
              editable={isEditable}
            />
            <UnifiedField
              label="Founded Year"
              type="number"
              value={data.foundedYear}
              onChange={(v) => handleChange('foundedYear', v)}
              editable={isEditable}
              min={1800}
              max={new Date().getFullYear()}
            />
            <UnifiedField
              label="Employee Range"
              type="select"
              options={employeeOptions}
              value={data.employeeRange}
              onChange={(v) => handleChange('employeeRange', v)}
              editable={isEditable}
            />
            <UnifiedField
              label="Revenue Range"
              type="select"
              options={revenueOptions}
              value={data.revenueRange}
              onChange={(v) => handleChange('revenueRange', v)}
              editable={isEditable}
            />
          </CardContent>
        </Card>

        {/* Digital Presence Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <Globe className="w-4 h-4 text-green-600" />
              </div>
              <CardTitle className="text-base font-heading">Digital Presence</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Website"
              type="url"
              value={data.website}
              onChange={(v) => handleChange('website', v)}
              editable={isEditable}
              placeholder="https://example.com"
            />
            <UnifiedField
              label="LinkedIn"
              type="url"
              value={data.linkedinUrl}
              onChange={(v) => handleChange('linkedinUrl', v)}
              editable={isEditable}
              placeholder="https://linkedin.com/company/..."
            />
            <UnifiedField
              label="Email"
              type="email"
              value={data.email}
              onChange={(v) => handleChange('email', v)}
              editable={isEditable}
              placeholder="contact@example.com"
            />
            <UnifiedField
              label="Phone"
              type="phone"
              value={data.phone}
              onChange={(v) => handleChange('phone', v)}
              editable={isEditable}
            />
          </CardContent>
        </Card>
      </div>

      {/* Description Card */}
      {(data.description || isEditable) && (
        <Card className="shadow-elevation-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-heading">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <UnifiedField
              label=""
              type="textarea"
              value={data.description}
              onChange={(v) => handleChange('description', v)}
              editable={isEditable}
              placeholder="Brief description of the company..."
              maxLength={500}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ============ HELPER COMPONENTS ============

interface AccountTypeCardProps {
  type: 'company' | 'person'
  selected: boolean
  onSelect: () => void
}

function AccountTypeCard({ type, selected, onSelect }: AccountTypeCardProps) {
  const isCompany = type === 'company'

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'relative p-6 rounded-xl border-2 text-left transition-all duration-300 group hover:shadow-elevation-sm',
        selected
          ? 'border-gold-400 bg-gradient-to-br from-gold-50/50 to-white shadow-gold-glow'
          : 'border-charcoal-100 bg-white hover:border-gold-200'
      )}
    >
      {selected && (
        <div className="absolute top-4 right-4">
          <CheckCircle2 className="w-5 h-5 text-gold-500" />
        </div>
      )}
      <div
        className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors',
          selected
            ? 'bg-gradient-to-br from-gold-400 to-gold-500 text-white shadow-gold-glow'
            : 'bg-charcoal-50 text-charcoal-400 group-hover:bg-gold-50 group-hover:text-gold-500'
        )}
      >
        {isCompany ? <Building2 className="w-6 h-6" /> : <User className="w-6 h-6" />}
      </div>
      <h3 className="text-lg font-semibold text-charcoal-900 mb-1">
        {isCompany ? 'Company Account' : 'Person Account'}
      </h3>
      <p className="text-sm text-charcoal-500">
        {isCompany
          ? 'Business entities with multiple contacts and billing'
          : 'Individual consultant or sole proprietor'}
      </p>
    </button>
  )
}

interface TaxIdInputProps {
  value: string
  onChange: (value: string) => void
  isPerson: boolean
}

function TaxIdInput({ value, onChange, isPerson }: TaxIdInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, '')
    let formatted = input

    if (isPerson) {
      // SSN format: XXX-XX-XXXX
      if (input.length <= 3) formatted = input
      else if (input.length <= 5) formatted = `${input.slice(0, 3)}-${input.slice(3)}`
      else formatted = `${input.slice(0, 3)}-${input.slice(3, 5)}-${input.slice(5, 9)}`
    } else {
      // EIN format: XX-XXXXXXX
      if (input.length <= 2) formatted = input
      else formatted = `${input.slice(0, 2)}-${input.slice(2, 9)}`
    }

    onChange(formatted)
  }

  return (
    <Input
      type="text"
      value={value}
      onChange={handleChange}
      placeholder={isPerson ? 'XXX-XX-XXXX' : 'XX-XXXXXXX'}
      className="h-12 rounded-xl border-charcoal-200 bg-white"
    />
  )
}

export default IdentitySection
