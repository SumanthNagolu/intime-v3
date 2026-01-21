'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Building2,
  User,
  Globe,
  Landmark,
  Tag,
  CheckCircle2,
} from 'lucide-react'
import { SectionHeader } from '../fields/SectionHeader'
import { UnifiedField } from '../fields/UnifiedField'
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
  /** Handler for toggling industry selection */
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
 * Guidewire PCH Architecture:
 * - Same card-based layout in all modes (create, view, edit)
 * - Consistent field groupings across wizard and detail view
 * - Mode determines editability, not layout
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

  const handleToggleIndustry = (industry: string) => {
    if (onToggleIndustry) {
      onToggleIndustry(industry)
    } else {
      const isSelected = data.industries.includes(industry)
      const newIndustries = isSelected
        ? data.industries.filter((i) => i !== industry)
        : [...data.industries, industry]
      handleChange('industries', newIndustries)
    }
  }

  // Editable in create mode or when explicitly editing
  const isEditable = mode === 'create' || isEditing
  const isCreateMode = mode === 'create'

  // Convert constants to option format for UnifiedField
  const industryOptions = INDUSTRIES.map(i => ({ value: i.value, label: i.label, icon: i.icon }))
  const companyTypeOptions = COMPANY_TYPES.map(t => ({ value: t.value, label: t.label }))
  const tierOptions = PARTNERSHIP_TIERS.map(t => ({ value: t.value, label: t.label }))
  const segmentOptions = COMPANY_SEGMENTS.map(s => ({ value: s.value, label: `${s.icon} ${s.label}` }))
  const statusOptions = ACCOUNT_STATUSES.map(s => ({ value: s.value, label: s.label }))
  const employeeOptions = EMPLOYEE_RANGES.map(e => ({ value: e.value, label: e.label }))
  const revenueOptions = REVENUE_RANGES.map(r => ({ value: r.value, label: r.label }))
  const ownershipOptions = OWNERSHIP_TYPES.map(o => ({ value: o.value, label: o.label }))

  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header - only show Edit/Save/Cancel in view/edit mode */}
      {!isCreateMode && (
        <SectionHeader
          title="Identity & Classification"
          subtitle="Company details, registration, and industry classification"
          mode={isEditing ? 'edit' : 'view'}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      )}

      {/* Account Type Selection - only in create mode */}
      {isCreateMode && (
        <Card className="shadow-elevation-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gold-50 rounded-lg">
                <Building2 className="w-4 h-4 text-gold-600" />
              </div>
              <CardTitle className="text-base font-heading">Account Type</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      )}

      {/* Cards Grid - Same structure in all modes */}
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
              placeholder="e.g., Acme Corporation"
            />
            <UnifiedField
              label="Legal Name"
              value={data.legalName}
              onChange={(v) => handleChange('legalName', v)}
              editable={isEditable}
              placeholder="e.g., Acme International, LLC"
            />
            <UnifiedField
              label="DBA / Trade Name"
              value={data.dba}
              onChange={(v) => handleChange('dba', v)}
              editable={isEditable}
              placeholder="e.g., Acme Tech"
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
            {/* Industries - custom multi-select with chips */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                Industries {isEditable && <span className="text-gold-500">*</span>}
              </label>
              {isEditable ? (
                <div className="flex flex-wrap gap-2">
                  {INDUSTRIES.map((industry) => {
                    const isSelected = data.industries.includes(industry.value)
                    return (
                      <button
                        key={industry.value}
                        type="button"
                        onClick={() => handleToggleIndustry(industry.value)}
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
              ) : (
                <div className="flex flex-wrap gap-2">
                  {data.industries.length > 0 ? (
                    data.industries.map((ind) => {
                      const industry = INDUSTRIES.find(i => i.value === ind)
                      return (
                        <span
                          key={ind}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm bg-charcoal-100 text-charcoal-700"
                        >
                          {industry?.icon} {industry?.label || ind}
                        </span>
                      )
                    })
                  ) : (
                    <span className="text-charcoal-400 text-sm">Not specified</span>
                  )}
                </div>
              )}
              {errors?.industries && (
                <p className="text-xs text-error-600">{errors.industries}</p>
              )}
            </div>
            <UnifiedField
              label="Segment"
              type="select"
              options={segmentOptions}
              value={data.segment}
              onChange={(v) => handleChange('segment', v)}
              editable={isEditable}
              placeholder="Select segment"
            />
            <UnifiedField
              label="Tier"
              type="select"
              options={tierOptions}
              value={data.tier}
              onChange={(v) => handleChange('tier', v)}
              editable={isEditable}
              badge={!isEditable}
              placeholder="Select tier"
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
              label="Tax ID (EIN)"
              value={data.taxId}
              onChange={(v) => handleChange('taxId', v)}
              editable={isEditable}
              placeholder="XX-XXXXXXX"
            />
            <UnifiedField
              label="Ownership Type"
              type="select"
              options={ownershipOptions}
              value={data.ownershipType}
              onChange={(v) => handleChange('ownershipType', v)}
              editable={isEditable}
              placeholder="Select ownership type"
            />
            <UnifiedField
              label="Founded Year"
              type="number"
              value={data.foundedYear}
              onChange={(v) => handleChange('foundedYear', v)}
              editable={isEditable}
              min={1800}
              max={new Date().getFullYear()}
              placeholder="e.g., 2020"
            />
            <UnifiedField
              label="Employee Range"
              type="select"
              options={employeeOptions}
              value={data.employeeRange}
              onChange={(v) => handleChange('employeeRange', v)}
              editable={isEditable}
              placeholder="Select range"
            />
            <UnifiedField
              label="Revenue Range"
              type="select"
              options={revenueOptions}
              value={data.revenueRange}
              onChange={(v) => handleChange('revenueRange', v)}
              editable={isEditable}
              placeholder="Select range"
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

      {/* Description Card - full width */}
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
            placeholder="Brief description of the company, what they do, and their key business areas..."
            maxLength={500}
          />
        </CardContent>
      </Card>
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

export default IdentitySection
