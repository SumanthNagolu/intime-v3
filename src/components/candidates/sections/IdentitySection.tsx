'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import {
  UserCircle,
  MapPin,
  Briefcase,
  Linkedin,
  FileText,
} from 'lucide-react'
import { SectionHeader } from '@/components/accounts/fields/SectionHeader'
import { UnifiedField } from '@/components/accounts/fields/UnifiedField'
import { OPERATING_COUNTRIES, getStatesByCountry } from '@/components/addresses'
import type { SectionMode, IdentitySectionData } from '@/lib/candidates/types'
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
 * IdentitySection - Unified component for Candidate Identity (Section 1)
 *
 * Guidewire PCH Architecture:
 * - Same card-based layout in all modes (create, view, edit)
 * - Consistent field groupings across wizard and detail view
 * - Mode determines editability, not layout
 *
 * Fields:
 * - Contact info: firstName, lastName, email, phone, mobile
 * - Location: streetAddress, city, state (dropdown), country (dropdown)
 * - Professional: title, headline, summary, currentCompany, yearsExperience
 * - Social: linkedinUrl
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

  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header - only show Edit/Save/Cancel in view/edit mode */}
      {!isCreateMode && (
        <SectionHeader
          title="Identity"
          subtitle="Contact info, headline, and professional summary"
          mode={isEditing ? 'edit' : 'view'}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      )}

      {/* Cards Grid - Same structure in all modes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Information Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <UserCircle className="w-4 h-4 text-blue-600" />
              </div>
              <CardTitle className="text-base font-heading">Contact Information</CardTitle>
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
                placeholder="John"
              />
              <UnifiedField
                label="Last Name"
                value={data.lastName}
                onChange={(v) => handleChange('lastName', v)}
                editable={isEditable}
                required
                error={errors?.lastName}
                placeholder="Doe"
              />
            </div>
            <UnifiedField
              label="Email"
              type="email"
              value={data.email}
              onChange={(v) => handleChange('email', v)}
              editable={isEditable}
              required
              error={errors?.email}
              placeholder="john.doe@example.com"
            />
            <div className="grid grid-cols-2 gap-4">
              <UnifiedField
                label="Phone"
                type="phone"
                value={data.phone}
                onChange={(v) => handleChange('phone', v)}
                editable={isEditable}
                error={errors?.phone}
              />
              <UnifiedField
                label="Mobile"
                type="phone"
                value={data.mobile}
                onChange={(v) => handleChange('mobile', v)}
                editable={isEditable}
                error={errors?.mobile}
              />
            </div>
          </CardContent>
        </Card>

        {/* Location Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <MapPin className="w-4 h-4 text-green-600" />
              </div>
              <CardTitle className="text-base font-heading">Location</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Street Address */}
            <UnifiedField
              label="Street Address"
              value={data.streetAddress}
              onChange={(v) => handleChange('streetAddress', v)}
              editable={isEditable}
              error={errors?.streetAddress}
              placeholder="123 Main Street"
            />
            {/* City */}
            <UnifiedField
              label="City"
              value={data.city}
              onChange={(v) => handleChange('city', v)}
              editable={isEditable}
              error={errors?.city}
              placeholder="San Francisco"
            />
            {/* State Dropdown */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-charcoal-500 uppercase tracking-wider">
                State/Province
              </Label>
              {isEditable ? (
                <Select
                  value={data.state || ''}
                  onValueChange={(v) => handleChange('state', v)}
                >
                  <SelectTrigger className={cn('h-11', errors?.state && 'border-error-400')}>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {getStatesByCountry(data.country || 'US').map((state) => (
                      <SelectItem key={state.value} value={state.value}>
                        {state.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm text-charcoal-700">
                  {getStatesByCountry(data.country || 'US').find(s => s.value === data.state)?.label || data.state || '—'}
                </div>
              )}
              {errors?.state && (
                <p className="text-xs text-error-500">{errors.state}</p>
              )}
            </div>
            {/* Country Dropdown */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-charcoal-500 uppercase tracking-wider">
                Country
              </Label>
              {isEditable ? (
                <Select
                  value={data.country || 'US'}
                  onValueChange={(v) => {
                    handleChange('country', v)
                    // Reset state when country changes
                    handleChange('state', '')
                  }}
                >
                  <SelectTrigger className={cn('h-11', errors?.country && 'border-error-400')}>
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
              ) : (
                <div className="text-sm text-charcoal-700">
                  {OPERATING_COUNTRIES.find(c => c.value === data.country)?.label || data.country || '—'}
                </div>
              )}
              {errors?.country && (
                <p className="text-xs text-error-500">{errors.country}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Professional Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Briefcase className="w-4 h-4 text-purple-600" />
              </div>
              <CardTitle className="text-base font-heading">Professional</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Job Title"
              value={data.title}
              onChange={(v) => handleChange('title', v)}
              editable={isEditable}
              error={errors?.title}
              placeholder="Senior Software Engineer"
            />
            <UnifiedField
              label="Current Company"
              value={data.currentCompany}
              onChange={(v) => handleChange('currentCompany', v)}
              editable={isEditable}
              error={errors?.currentCompany}
              placeholder="Acme Corp"
            />
            <UnifiedField
              label="Years of Experience"
              type="number"
              value={data.yearsExperience}
              onChange={(v) => handleChange('yearsExperience', v)}
              editable={isEditable}
              error={errors?.yearsExperience}
              min={0}
              max={50}
              placeholder="5"
            />
          </CardContent>
        </Card>

        {/* Social & Links Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gold-50 rounded-lg">
                <Linkedin className="w-4 h-4 text-gold-600" />
              </div>
              <CardTitle className="text-base font-heading">Social</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="LinkedIn URL"
              type="url"
              value={data.linkedinUrl}
              onChange={(v) => handleChange('linkedinUrl', v)}
              editable={isEditable}
              error={errors?.linkedinUrl}
              placeholder="https://linkedin.com/in/johndoe"
            />
          </CardContent>
        </Card>
      </div>

      {/* Headline & Summary Card - full width */}
      <Card className="shadow-elevation-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-charcoal-100 rounded-lg">
              <FileText className="w-4 h-4 text-charcoal-600" />
            </div>
            <CardTitle className="text-base font-heading">Professional Profile</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <UnifiedField
            label="Professional Headline"
            value={data.headline}
            onChange={(v) => handleChange('headline', v)}
            editable={isEditable}
            error={errors?.headline}
            placeholder="Full Stack Developer with 8+ years of experience in React & Node.js"
            maxLength={200}
          />
          <UnifiedField
            label="Professional Summary"
            type="textarea"
            value={data.professionalSummary}
            onChange={(v) => handleChange('professionalSummary', v)}
            editable={isEditable}
            error={errors?.professionalSummary}
            placeholder="Experienced software engineer with a passion for building scalable web applications..."
            maxLength={2000}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default IdentitySection
