'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  MessageCircle,
  Clock,
  Bell,
  Video,
} from 'lucide-react'
import { SectionHeader } from '../fields/SectionHeader'
import { UnifiedField } from '../fields/UnifiedField'
import {
  CONTACT_METHODS,
  TIMEZONES,
  LANGUAGES,
  MEETING_PLATFORMS,
} from '@/lib/contacts/constants'
import type { SectionMode, CommunicationSectionData } from '@/lib/contacts/types'
import { cn } from '@/lib/utils'

// ============ PROPS ============

interface CommunicationSectionProps {
  /** Mode determines rendering style */
  mode: SectionMode
  /** Data to display/edit */
  data: CommunicationSectionData
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
 * CommunicationSection - Contact preferences and restrictions
 *
 * Handles communication preferences, opt-outs, and meeting settings.
 */
export function CommunicationSection({
  mode,
  data,
  onChange,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
  errors = {},
  className,
}: CommunicationSectionProps) {
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
  const contactMethodOptions = CONTACT_METHODS.map(m => ({ value: m.value, label: m.label }))
  const timezoneOptions = TIMEZONES.map(t => ({ value: t.value, label: t.label }))
  const languageOptions = LANGUAGES.map(l => ({ value: l.value, label: l.label }))
  const meetingPlatformOptions = MEETING_PLATFORMS.map(p => ({ value: p.value, label: p.label }))

  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header - only show Edit/Save/Cancel in view/edit mode */}
      {!isCreateMode && (
        <SectionHeader
          title="Communication Preferences"
          subtitle="Contact preferences and restrictions"
          mode={isEditing ? 'edit' : 'view'}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Preferences Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <MessageCircle className="w-4 h-4 text-blue-600" />
              </div>
              <CardTitle className="text-base font-heading">Contact Preferences</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Preferred Contact Method"
              type="select"
              options={contactMethodOptions}
              value={data.preferredContactMethod}
              onChange={(v) => handleChange('preferredContactMethod', v)}
              editable={isEditable}
              placeholder="Select method"
            />
            <UnifiedField
              label="Best Time to Contact"
              value={data.bestTimeToContact}
              onChange={(v) => handleChange('bestTimeToContact', v)}
              editable={isEditable}
              placeholder="e.g., Morning, After 5pm"
            />
            <UnifiedField
              label="Timezone"
              type="select"
              options={timezoneOptions}
              value={data.timezone}
              onChange={(v) => handleChange('timezone', v)}
              editable={isEditable}
              placeholder="Select timezone"
            />
            <UnifiedField
              label="Language"
              type="select"
              options={languageOptions}
              value={data.language}
              onChange={(v) => handleChange('language', v)}
              editable={isEditable}
              placeholder="Select language"
            />
          </CardContent>
        </Card>

        {/* Communication Restrictions Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Bell className="w-4 h-4 text-amber-600" />
              </div>
              <CardTitle className="text-base font-heading">Communication Opt-Outs</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Do Not Call"
              type="switch"
              value={data.doNotCall}
              onChange={(v) => handleChange('doNotCall', v)}
              editable={isEditable}
              helpText="Block all phone calls"
            />
            <UnifiedField
              label="Do Not Email"
              type="switch"
              value={data.doNotEmail}
              onChange={(v) => handleChange('doNotEmail', v)}
              editable={isEditable}
              helpText="Block all emails"
            />
            <UnifiedField
              label="Do Not Text"
              type="switch"
              value={data.doNotText}
              onChange={(v) => handleChange('doNotText', v)}
              editable={isEditable}
              helpText="Block all SMS/text messages"
            />
          </CardContent>
        </Card>

        {/* Call Time Restrictions Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Clock className="w-4 h-4 text-purple-600" />
              </div>
              <CardTitle className="text-base font-heading">Call Time Restrictions</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Do Not Call Before"
              value={data.doNotCallBefore}
              onChange={(v) => handleChange('doNotCallBefore', v)}
              editable={isEditable}
              placeholder="e.g., 9:00 AM"
            />
            <UnifiedField
              label="Do Not Call After"
              value={data.doNotCallAfter}
              onChange={(v) => handleChange('doNotCallAfter', v)}
              editable={isEditable}
              placeholder="e.g., 6:00 PM"
            />
          </CardContent>
        </Card>

        {/* Meeting Preferences Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <Video className="w-4 h-4 text-green-600" />
              </div>
              <CardTitle className="text-base font-heading">Meeting Preferences</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Preferred Platform"
              type="select"
              options={meetingPlatformOptions}
              value={data.preferredMeetingPlatform}
              onChange={(v) => handleChange('preferredMeetingPlatform', v)}
              editable={isEditable}
              placeholder="Select platform"
            />
            <UnifiedField
              label="Default Meeting Duration"
              type="number"
              value={String(data.meetingDuration)}
              onChange={(v) => handleChange('meetingDuration', parseInt(v as string) || 30)}
              editable={isEditable}
              min={15}
              max={120}
              placeholder="Minutes"
            />
          </CardContent>
        </Card>

        {/* Marketing Preferences Card - full width */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-heading">Marketing Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <UnifiedField
                label="Marketing Emails"
                type="switch"
                value={data.marketingEmailsOptIn}
                onChange={(v) => handleChange('marketingEmailsOptIn', v)}
                editable={isEditable}
                helpText="Receive marketing communications"
              />
              <UnifiedField
                label="Newsletter"
                type="switch"
                value={data.newsletterOptIn}
                onChange={(v) => handleChange('newsletterOptIn', v)}
                editable={isEditable}
                helpText="Receive newsletters"
              />
              <UnifiedField
                label="Product Updates"
                type="switch"
                value={data.productUpdatesOptIn}
                onChange={(v) => handleChange('productUpdatesOptIn', v)}
                editable={isEditable}
                helpText="Receive product updates"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CommunicationSection
