'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Users, UserCog, Bell, CheckCircle2 } from 'lucide-react'
import { SectionHeader } from '@/components/accounts/fields/SectionHeader'
import { UnifiedField } from '@/components/accounts/fields/UnifiedField'
import type { SectionMode, CampaignTeamSectionData } from '@/lib/campaigns/types'
import { cn } from '@/lib/utils'

// ============ PROPS ============

interface CampaignTeamSectionProps {
  mode: SectionMode
  data: CampaignTeamSectionData
  onChange?: (field: string, value: unknown) => void
  onEdit?: () => void
  onSave?: () => Promise<void>
  onCancel?: () => void
  isSaving?: boolean
  errors?: Record<string, string>
  className?: string
  /** Team members available for selection */
  teamMembers?: Array<{ id: string; name: string; email?: string; role?: string }>
  /** Teams available for selection */
  teams?: Array<{ id: string; name: string }>
}

/**
 * CampaignTeamSection - Team assignment, approval workflow, and notifications
 *
 * Manages campaign ownership, team collaboration, approval requirements,
 * and notification preferences.
 */
export function CampaignTeamSection({
  mode,
  data,
  onChange,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
  errors = {},
  className,
  teamMembers = [],
  teams = [],
}: CampaignTeamSectionProps) {
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

  // Convert team members to select options
  const memberOptions = teamMembers.map((m) => ({
    value: m.id,
    label: m.name + (m.role ? ` (${m.role})` : ''),
  }))

  const teamOptions = teams.map((t) => ({
    value: t.id,
    label: t.name,
  }))

  return (
    <div className={cn('space-y-6', className)}>
      {!isCreateMode && (
        <SectionHeader
          title="Team & Assignment"
          subtitle="Campaign ownership, collaboration, and approval settings"
          mode={isEditing ? 'edit' : 'view'}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ownership Card */}
        <Card className="shadow-elevation-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <UserCog className="w-4 h-4 text-blue-600" />
              </div>
              <CardTitle className="text-base font-heading">Ownership</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Campaign Owner"
              type="select"
              value={data.ownerId}
              onChange={(v) => handleChange('ownerId', v)}
              editable={isEditable}
              options={memberOptions}
              placeholder="Select owner..."
              helpText="Primary person responsible for this campaign"
              error={errors?.ownerId}
            />
            <UnifiedField
              label="Team"
              type="select"
              value={data.teamId}
              onChange={(v) => handleChange('teamId', v)}
              editable={isEditable}
              options={teamOptions}
              placeholder="Select team..."
              helpText="Team that will execute this campaign"
            />
          </CardContent>
        </Card>

        {/* Collaborators Card */}
        <Card className="shadow-elevation-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <CardTitle className="text-base font-heading">Collaborators</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Team Collaborators"
              type="multiSelect"
              value={data.collaboratorIds}
              onChange={(v) => handleChange('collaboratorIds', v)}
              editable={isEditable}
              options={memberOptions}
              placeholder="Add collaborators..."
              helpText="Additional team members with edit access"
            />
            {!isEditable && data.collaboratorIds.length === 0 && (
              <p className="text-sm text-charcoal-400 italic">
                No collaborators assigned
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Approval Workflow Card */}
      <Card className="shadow-elevation-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
            </div>
            <CardTitle className="text-base font-heading">Approval Workflow</CardTitle>
          </div>
          <p className="text-sm text-charcoal-500 mt-1">
            Require approval before launching the campaign
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <UnifiedField
            label="Requires Approval"
            type="switch"
            value={data.requiresApproval}
            onChange={(v) => handleChange('requiresApproval', v)}
            editable={isEditable}
            helpText="Campaign must be approved before it can be launched"
          />
          {data.requiresApproval && (
            <UnifiedField
              label="Approvers"
              type="multiSelect"
              value={data.approverIds}
              onChange={(v) => handleChange('approverIds', v)}
              editable={isEditable}
              options={memberOptions}
              placeholder="Select approvers..."
              helpText="People who can approve this campaign"
              required={data.requiresApproval}
              error={errors?.approverIds}
            />
          )}
          {!isEditable && !data.requiresApproval && (
            <p className="text-sm text-charcoal-400 italic">
              No approval required - campaign can launch immediately
            </p>
          )}
        </CardContent>
      </Card>

      {/* Notifications Card */}
      <Card className="shadow-elevation-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <Bell className="w-4 h-4 text-green-600" />
            </div>
            <CardTitle className="text-base font-heading">Notifications</CardTitle>
          </div>
          <p className="text-sm text-charcoal-500 mt-1">
            When should the team be notified?
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <UnifiedField
              label="Notify on Response"
              type="switch"
              value={data.notifyOnResponse}
              onChange={(v) => handleChange('notifyOnResponse', v)}
              editable={isEditable}
              helpText="Get notified when a prospect replies to the campaign"
            />
            <UnifiedField
              label="Notify on Conversion"
              type="switch"
              value={data.notifyOnConversion}
              onChange={(v) => handleChange('notifyOnConversion', v)}
              editable={isEditable}
              helpText="Get notified when a lead converts (meeting booked, submission made, etc.)"
            />
            <UnifiedField
              label="Notify on Completion"
              type="switch"
              value={data.notifyOnCompletion}
              onChange={(v) => handleChange('notifyOnCompletion', v)}
              editable={isEditable}
              helpText="Get notified when the campaign reaches its end date or targets"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CampaignTeamSection
