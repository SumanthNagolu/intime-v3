'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  UserCog,
  Clock,
  MessageSquare,
  Globe,
  StickyNote,
} from 'lucide-react'
import { SectionHeader } from '@/components/accounts/fields/SectionHeader'
import { UnifiedField } from '@/components/accounts/fields/UnifiedField'
import {
  PREFERRED_CONTACT_METHODS,
  BEST_TIMES_TO_CONTACT,
  TIMEZONES,
} from '@/lib/leads/constants'
import type { SectionMode, TeamSectionData } from '@/lib/leads/types'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'

// ============ PROPS ============

interface TeamSectionProps {
  mode: SectionMode
  data: TeamSectionData
  onChange?: (field: string, value: unknown) => void
  onEdit?: () => void
  onSave?: () => Promise<void>
  onCancel?: () => void
  isSaving?: boolean
  errors?: Record<string, string>
  className?: string
}

/**
 * TeamSection - Lead Owner and Assignment
 */
export function TeamSection({
  mode,
  data,
  onChange,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
  errors = {},
  className,
}: TeamSectionProps) {
  const [isEditing, setIsEditing] = React.useState(mode === 'edit')

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

  const isEditable = mode === 'create' || isEditing
  const isCreateMode = mode === 'create'

  // Fetch team members for owner selection
  const { data: usersData } = trpc.users.list.useQuery(
    { pageSize: 100 },
    { enabled: isEditable }
  )

  const userOptions = React.useMemo(() => {
    if (!usersData?.items) return []
    return usersData.items.map((u: { id: string; full_name?: string; email?: string }) => ({
      value: u.id,
      label: u.full_name || u.email || u.id,
    }))
  }, [usersData])

  const contactMethodOptions = PREFERRED_CONTACT_METHODS.map(c => ({ value: c.value, label: `${c.icon} ${c.label}` }))
  const bestTimeOptions = BEST_TIMES_TO_CONTACT.map(t => ({ value: t.value, label: t.label }))
  const timezoneOptions = TIMEZONES.map(t => ({ value: t.value, label: t.label }))

  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header */}
      {!isCreateMode && (
        <SectionHeader
          title="Team Assignment"
          subtitle="Lead owner and contact preferences"
          mode={isEditing ? 'edit' : 'view'}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Owner Assignment Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-charcoal-100 rounded-lg">
                <UserCog className="w-4 h-4 text-charcoal-600" />
              </div>
              <CardTitle className="text-base font-heading">Lead Owner</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Assigned To"
              value={data.ownerId}
              onChange={(v) => {
                handleChange('ownerId', v)
                // Update owner name from the selected option
                const user = userOptions.find((u: { value: string }) => u.value === v)
                if (user) {
                  handleChange('ownerName', user.label)
                }
              }}
              editable={isEditable}
              type="select"
              options={userOptions}
              required
              error={errors?.ownerId}
              placeholder="Select owner"
            />
            {!isEditable && data.assignedAt && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                  Assigned Date
                </p>
                <p className="text-sm text-charcoal-700">
                  {new Date(data.assignedAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Preferences Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-charcoal-100 rounded-lg">
                <MessageSquare className="w-4 h-4 text-charcoal-600" />
              </div>
              <CardTitle className="text-base font-heading">Contact Preferences</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Preferred Contact Method"
              value={data.preferredContactMethod}
              onChange={(v) => handleChange('preferredContactMethod', v)}
              editable={isEditable}
              type="select"
              options={contactMethodOptions}
            />
            <UnifiedField
              label="Best Time to Contact"
              value={data.bestTimeToContact}
              onChange={(v) => handleChange('bestTimeToContact', v)}
              editable={isEditable}
              type="select"
              options={bestTimeOptions}
              placeholder="Select time"
            />
            <UnifiedField
              label="Timezone"
              value={data.timezone}
              onChange={(v) => handleChange('timezone', v)}
              editable={isEditable}
              type="select"
              options={timezoneOptions}
              placeholder="Select timezone"
            />
          </CardContent>
        </Card>

        {/* Internal Notes Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-charcoal-100 rounded-lg">
                <StickyNote className="w-4 h-4 text-charcoal-600" />
              </div>
              <CardTitle className="text-base font-heading">Internal Notes</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <UnifiedField
              label="Notes"
              value={data.internalNotes}
              onChange={(v) => handleChange('internalNotes', v)}
              editable={isEditable}
              type="textarea"
              placeholder="Internal notes about this lead (not visible to the lead)..."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default TeamSection
