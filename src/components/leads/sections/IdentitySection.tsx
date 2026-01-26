'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  User,
  Building2,
  Mail,
  Phone,
  Briefcase,
  Globe,
  Linkedin,
  MapPin,
  Users,
} from 'lucide-react'
import { SectionHeader } from '@/components/accounts/fields/SectionHeader'
import { UnifiedField } from '@/components/accounts/fields/UnifiedField'
import {
  LEAD_STATUSES,
  INDUSTRIES,
  COMPANY_SIZES,
  getStatusBadgeVariant,
} from '@/lib/leads/constants'
import { US_STATES, COUNTRIES } from '@/lib/jobs/constants'
import type { SectionMode, IdentitySectionData } from '@/lib/leads/types'
import { cn } from '@/lib/utils'

// ============ PROPS ============

interface IdentitySectionProps {
  /** Mode determines rendering style */
  mode: SectionMode
  /** Data to display/edit */
  data: IdentitySectionData
  /** Handler for field changes */
  onChange?: (field: string, value: unknown) => void
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
 * IdentitySection - Unified component for Lead Identity (Contact + Company Info)
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

  // Editable in create mode or when explicitly editing
  const isEditable = mode === 'create' || isEditing
  const isCreateMode = mode === 'create'

  // Convert constants to option format
  const statusOptions = LEAD_STATUSES.map(s => ({ value: s.value, label: s.label }))
  const industryOptions = INDUSTRIES.map(i => ({ value: i.value, label: `${i.icon} ${i.label}` }))
  const companySizeOptions = COMPANY_SIZES.map(s => ({ value: s.value, label: s.label }))
  const stateOptions = US_STATES.map(s => ({ value: s.value, label: s.label }))
  const countryOptions = COUNTRIES.map(c => ({ value: c.value, label: c.label }))

  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header - only show Edit/Save/Cancel in view/edit mode */}
      {!isCreateMode && (
        <SectionHeader
          title="Contact Information"
          subtitle="Lead contact details and company information"
          mode={isEditing ? 'edit' : 'view'}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      )}

      {/* Cards Grid - Same structure in all modes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Details Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-charcoal-100 rounded-lg">
                <User className="w-4 h-4 text-charcoal-600" />
              </div>
              <CardTitle className="text-base font-heading">Contact Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <UnifiedField
                label="First Name"
                value={data.firstName}
                onChange={(v) => handleChange('firstName', v)}
                editable={isEditable}
                required
                error={errors?.firstName}
                placeholder="e.g., John"
              />
              <UnifiedField
                label="Last Name"
                value={data.lastName}
                onChange={(v) => handleChange('lastName', v)}
                editable={isEditable}
                required
                error={errors?.lastName}
                placeholder="e.g., Smith"
              />
            </div>
            <UnifiedField
              label="Email"
              value={data.email}
              onChange={(v) => handleChange('email', v)}
              editable={isEditable}
              type="email"
              required
              error={errors?.email}
              placeholder="john.smith@company.com"
            />
            {/* Phone fields - full width for better display */}
            <UnifiedField
              label="Phone"
              value={data.phone}
              onChange={(v) => handleChange('phone', v)}
              editable={isEditable}
              type="phone"
              placeholder="(555) 123-4567"
            />
            <UnifiedField
              label="Mobile"
              value={data.mobile}
              onChange={(v) => handleChange('mobile', v)}
              editable={isEditable}
              type="phone"
              placeholder="(555) 123-4567"
            />
          </CardContent>
        </Card>

        {/* Professional Info Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-charcoal-100 rounded-lg">
                <Briefcase className="w-4 h-4 text-charcoal-600" />
              </div>
              <CardTitle className="text-base font-heading">Professional Info</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Job Title"
              value={data.title}
              onChange={(v) => handleChange('title', v)}
              editable={isEditable}
              placeholder="e.g., VP of Engineering"
            />
            <UnifiedField
              label="Department"
              value={data.department}
              onChange={(v) => handleChange('department', v)}
              editable={isEditable}
              placeholder="e.g., Engineering"
            />
            <UnifiedField
              label="LinkedIn"
              value={data.linkedinUrl}
              onChange={(v) => handleChange('linkedinUrl', v)}
              editable={isEditable}
              type="url"
              placeholder="https://linkedin.com/in/username"
            />
          </CardContent>
        </Card>

        {/* Company Info Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-charcoal-100 rounded-lg">
                <Building2 className="w-4 h-4 text-charcoal-600" />
              </div>
              <CardTitle className="text-base font-heading">Company Info</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Company Name"
              value={data.companyName}
              onChange={(v) => handleChange('companyName', v)}
              editable={isEditable}
              placeholder="e.g., Acme Corporation"
            />
            <UnifiedField
              label="Website"
              value={data.companyWebsite}
              onChange={(v) => handleChange('companyWebsite', v)}
              editable={isEditable}
              type="url"
              placeholder="https://example.com"
            />
            <UnifiedField
              label="Industry"
              value={data.industry}
              onChange={(v) => handleChange('industry', v)}
              editable={isEditable}
              type="select"
              options={industryOptions}
              placeholder="Select industry"
            />
            <UnifiedField
              label="Company Size"
              value={data.companySize}
              onChange={(v) => handleChange('companySize', v)}
              editable={isEditable}
              type="select"
              options={companySizeOptions}
              placeholder="Select size"
            />
            <div className="grid grid-cols-3 gap-4">
              <UnifiedField
                label="City"
                value={data.companyCity}
                onChange={(v) => handleChange('companyCity', v)}
                editable={isEditable}
                placeholder="e.g., San Francisco"
              />
              <UnifiedField
                label="State"
                value={data.companyState}
                onChange={(v) => handleChange('companyState', v)}
                editable={isEditable}
                type="select"
                options={stateOptions}
                placeholder="Select state"
              />
              <UnifiedField
                label="Country"
                value={data.companyCountry}
                onChange={(v) => handleChange('companyCountry', v)}
                editable={isEditable}
                type="select"
                options={countryOptions}
              />
            </div>
          </CardContent>
        </Card>

        {/* Lead Status Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-charcoal-100 rounded-lg">
                <Users className="w-4 h-4 text-charcoal-600" />
              </div>
              <CardTitle className="text-base font-heading">Lead Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Status"
              value={data.status}
              onChange={(v) => handleChange('status', v)}
              editable={isEditable}
              type="select"
              options={statusOptions}
              badge
              badgeVariant={getStatusBadgeVariant(data.status) as any}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default IdentitySection
