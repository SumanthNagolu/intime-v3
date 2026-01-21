'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  User,
  Building2,
  Mail,
  Globe,
  Tag,
  CheckCircle2,
} from 'lucide-react'
import { SectionHeader } from '../fields/SectionHeader'
import { UnifiedField } from '../fields/UnifiedField'
import {
  CONTACT_CATEGORIES,
  CONTACT_TYPES,
  CONTACT_STATUSES,
  PRONOUN_OPTIONS,
  getContactStatusBadgeVariant,
} from '@/lib/contacts/constants'
import type { SectionMode, BasicInfoSectionData, ContactCategory } from '@/lib/contacts/types'
import { cn } from '@/lib/utils'

// ============ PROPS ============

interface BasicInfoSectionProps {
  /** Mode determines rendering style */
  mode: SectionMode
  /** Data to display/edit */
  data: BasicInfoSectionData
  /** Handler for field changes */
  onChange?: (field: string, value: unknown) => void
  /** Handler for toggling type selection */
  onToggleType?: (type: string) => void
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
 * BasicInfoSection - Unified component for Basic Identity & Contact Info
 *
 * Supports both Person and Company contact categories.
 * Used in both wizard (create) and workspace (view/edit) modes.
 */
export function BasicInfoSection({
  mode,
  data,
  onChange,
  onToggleType,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
  errors = {},
  className,
}: BasicInfoSectionProps) {
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

  const handleToggleType = (type: string) => {
    if (onToggleType) {
      onToggleType(type)
    } else {
      const isSelected = data.types.includes(type)
      const newTypes = isSelected
        ? data.types.filter((t) => t !== type)
        : [...data.types, type]
      handleChange('types', newTypes)
    }
  }

  // Editable in create mode or when explicitly editing
  const isEditable = mode === 'create' || isEditing
  const isCreateMode = mode === 'create'
  const isPerson = data.category === 'person'

  // Convert constants to option format
  const statusOptions = CONTACT_STATUSES.map(s => ({ value: s.value, label: s.label }))
  const pronounOptions = PRONOUN_OPTIONS.map(p => ({ value: p.value, label: p.label }))

  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header - only show Edit/Save/Cancel in view/edit mode */}
      {!isCreateMode && (
        <SectionHeader
          title="Basic Information"
          subtitle="Contact identity and classification"
          mode={isEditing ? 'edit' : 'view'}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      )}

      {/* Category Selection - only in create mode */}
      {isCreateMode && (
        <Card className="shadow-elevation-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gold-50 rounded-lg">
                <Tag className="w-4 h-4 text-gold-600" />
              </div>
              <CardTitle className="text-base font-heading">Contact Category</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CategoryCard
                category="person"
                selected={data.category === 'person'}
                onSelect={() => handleChange('category', 'person')}
              />
              <CategoryCard
                category="company"
                selected={data.category === 'company'}
                onSelect={() => handleChange('category', 'company')}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cards Grid - Same structure in all modes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Identity Card - different fields based on category */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gold-50 rounded-lg">
                {isPerson ? (
                  <User className="w-4 h-4 text-gold-600" />
                ) : (
                  <Building2 className="w-4 h-4 text-gold-600" />
                )}
              </div>
              <CardTitle className="text-base font-heading">
                {isPerson ? 'Person Identity' : 'Company Identity'}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isPerson ? (
              <>
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
                    placeholder="Smith"
                  />
                </div>
                <UnifiedField
                  label="Middle Name"
                  value={data.middleName}
                  onChange={(v) => handleChange('middleName', v)}
                  editable={isEditable}
                  placeholder="Michael"
                />
                <UnifiedField
                  label="Preferred Name"
                  value={data.preferredName}
                  onChange={(v) => handleChange('preferredName', v)}
                  editable={isEditable}
                  placeholder="e.g., Johnny"
                />
                <div className="grid grid-cols-2 gap-4">
                  <UnifiedField
                    label="Suffix"
                    value={data.suffix}
                    onChange={(v) => handleChange('suffix', v)}
                    editable={isEditable}
                    placeholder="Jr., Sr., III"
                  />
                  <UnifiedField
                    label="Pronouns"
                    type="select"
                    options={pronounOptions}
                    value={data.pronouns}
                    onChange={(v) => handleChange('pronouns', v)}
                    editable={isEditable}
                    placeholder="Select pronouns"
                  />
                </div>
              </>
            ) : (
              <>
                <UnifiedField
                  label="Company Name"
                  value={data.companyName}
                  onChange={(v) => handleChange('companyName', v)}
                  editable={isEditable}
                  required
                  error={errors?.companyName}
                  placeholder="e.g., Acme Corporation"
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Contact Methods Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Mail className="w-4 h-4 text-blue-600" />
              </div>
              <CardTitle className="text-base font-heading">Contact Methods</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Primary Email"
              type="email"
              value={data.email}
              onChange={(v) => handleChange('email', v)}
              editable={isEditable}
              required
              error={errors?.email}
              placeholder="john.smith@example.com"
            />
            <UnifiedField
              label="Secondary Email"
              type="email"
              value={data.emailSecondary}
              onChange={(v) => handleChange('emailSecondary', v)}
              editable={isEditable}
              placeholder="personal@email.com"
            />
            <UnifiedField
              label="Phone"
              type="phone"
              value={data.phone}
              onChange={(v) => handleChange('phone', v)}
              editable={isEditable}
            />
            {isPerson && (
              <UnifiedField
                label="Mobile"
                type="phone"
                value={data.mobile}
                onChange={(v) => handleChange('mobile', v)}
                editable={isEditable}
              />
            )}
          </CardContent>
        </Card>

        {/* Classification Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Tag className="w-4 h-4 text-purple-600" />
              </div>
              <CardTitle className="text-base font-heading">Classification</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Contact Types - multi-select chips */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                Contact Types {isEditable && <span className="text-gold-500">*</span>}
              </label>
              {isEditable ? (
                <div className="flex flex-wrap gap-2">
                  {CONTACT_TYPES.map((type) => {
                    const isSelected = data.types.includes(type.value)
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => handleToggleType(type.value)}
                        className={cn(
                          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
                          isSelected
                            ? 'bg-gradient-to-r from-hublot-800 to-hublot-900 text-white shadow-sm'
                            : 'bg-charcoal-100 text-charcoal-700 hover:bg-charcoal-200'
                        )}
                      >
                        <span>{type.icon}</span>
                        {type.label}
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 ml-0.5" />}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {data.types.length > 0 ? (
                    data.types.map((t) => {
                      const type = CONTACT_TYPES.find(ct => ct.value === t)
                      return (
                        <span
                          key={t}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm bg-charcoal-100 text-charcoal-700"
                        >
                          {type?.icon} {type?.label || t}
                        </span>
                      )
                    })
                  ) : (
                    <span className="text-charcoal-400 text-sm">Not specified</span>
                  )}
                </div>
              )}
              {errors?.types && (
                <p className="text-xs text-error-600">{errors.types}</p>
              )}
            </div>
            <UnifiedField
              label="Status"
              type="select"
              options={statusOptions}
              value={data.status}
              onChange={(v) => handleChange('status', v)}
              editable={isEditable}
              badge={!isEditable}
              badgeVariant={getContactStatusBadgeVariant(data.status)}
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
              label="LinkedIn URL"
              type="url"
              value={data.linkedinUrl}
              onChange={(v) => handleChange('linkedinUrl', v)}
              editable={isEditable}
              placeholder="https://linkedin.com/in/..."
            />
            <UnifiedField
              label="Photo URL"
              type="url"
              value={data.photoUrl}
              onChange={(v) => handleChange('photoUrl', v)}
              editable={isEditable}
              placeholder="https://..."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ============ HELPER COMPONENTS ============

interface CategoryCardProps {
  category: ContactCategory
  selected: boolean
  onSelect: () => void
}

function CategoryCard({ category, selected, onSelect }: CategoryCardProps) {
  const isPerson = category === 'person'
  const config = CONTACT_CATEGORIES.find(c => c.value === category)

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
        {isPerson ? <User className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
      </div>
      <h3 className="text-lg font-semibold text-charcoal-900 mb-1">
        {isPerson ? 'Person Contact' : 'Company Contact'}
      </h3>
      <p className="text-sm text-charcoal-500">
        {config?.description || (isPerson ? 'Individual contact' : 'Organization or business')}
      </p>
    </button>
  )
}

export default BasicInfoSection
