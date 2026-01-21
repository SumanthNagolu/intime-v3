'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Link2, Globe, Github, Twitter } from 'lucide-react'
import { SectionHeader } from '../fields/SectionHeader'
import { UnifiedField } from '../fields/UnifiedField'
import type { SectionMode, SocialSectionData } from '@/lib/contacts/types'
import { cn } from '@/lib/utils'

// ============ PROPS ============

interface SocialSectionProps {
  /** Mode determines rendering style */
  mode: SectionMode
  /** Data to display/edit */
  data: SocialSectionData
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
 * SocialSection - Social profiles and web presence
 *
 * Handles social media links, portfolio, and personal website.
 */
export function SocialSection({
  mode,
  data,
  onChange,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
  errors = {},
  className,
}: SocialSectionProps) {
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
          title="Social Profiles"
          subtitle="Social media links and web presence"
          mode={isEditing ? 'edit' : 'view'}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Professional Networks Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Link2 className="w-4 h-4 text-blue-600" />
              </div>
              <CardTitle className="text-base font-heading">Professional Networks</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="LinkedIn"
              type="url"
              value={data.linkedinUrl}
              onChange={(v) => handleChange('linkedinUrl', v)}
              editable={isEditable}
              placeholder="https://linkedin.com/in/..."
              error={errors?.linkedinUrl}
            />
            <UnifiedField
              label="Twitter / X"
              type="url"
              value={data.twitterUrl}
              onChange={(v) => handleChange('twitterUrl', v)}
              editable={isEditable}
              placeholder="https://twitter.com/..."
            />
          </CardContent>
        </Card>

        {/* Developer Profiles Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-charcoal-100 rounded-lg">
                <Github className="w-4 h-4 text-charcoal-600" />
              </div>
              <CardTitle className="text-base font-heading">Developer Profiles</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="GitHub"
              type="url"
              value={data.githubUrl}
              onChange={(v) => handleChange('githubUrl', v)}
              editable={isEditable}
              placeholder="https://github.com/..."
            />
            <UnifiedField
              label="Portfolio"
              type="url"
              value={data.portfolioUrl}
              onChange={(v) => handleChange('portfolioUrl', v)}
              editable={isEditable}
              placeholder="https://portfolio.example.com"
            />
          </CardContent>
        </Card>

        {/* Personal Website Card - full width */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <Globe className="w-4 h-4 text-green-600" />
              </div>
              <CardTitle className="text-base font-heading">Personal Website</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <UnifiedField
              label="Website URL"
              type="url"
              value={data.personalWebsite}
              onChange={(v) => handleChange('personalWebsite', v)}
              editable={isEditable}
              placeholder="https://www.example.com"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SocialSection
