'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MultiSelectDropdown, type MultiSelectOption } from '@/components/ui/multi-select-dropdown'
import { Users, UserCog, Bell, CheckCircle2 } from 'lucide-react'
import { SectionHeader } from '@/components/accounts/fields/SectionHeader'
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
  const memberOptions: MultiSelectOption[] = teamMembers.map((m) => ({
    value: m.id,
    label: m.name + (m.role ? ` (${m.role})` : ''),
  }))

  const teamSelectOptions = teams.map((t) => ({
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
            {/* Campaign Owner */}
            <div className="flex items-start gap-4">
              <Label className="text-sm font-medium text-charcoal-700 w-28 pt-2.5 shrink-0">
                Owner
              </Label>
              <div className="flex-1">
                {isEditable ? (
                  <Select
                    value={data.ownerId || ''}
                    onValueChange={(v) => handleChange('ownerId', v)}
                  >
                    <SelectTrigger className={cn('h-10', errors?.ownerId && 'border-red-500')}>
                      <SelectValue placeholder="Select owner..." />
                    </SelectTrigger>
                    <SelectContent>
                      {memberOptions.map((m) => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-charcoal-900 py-2">
                    {memberOptions.find(m => m.value === data.ownerId)?.label || '—'}
                  </p>
                )}
                {errors?.ownerId && <p className="text-xs text-red-500 mt-1">{errors.ownerId}</p>}
                <p className="text-xs text-charcoal-500 mt-1">Primary responsible person</p>
              </div>
            </div>

            {/* Team */}
            <div className="flex items-start gap-4">
              <Label className="text-sm font-medium text-charcoal-700 w-28 pt-2.5 shrink-0">
                Team
              </Label>
              <div className="flex-1">
                {isEditable ? (
                  <Select
                    value={data.teamId || ''}
                    onValueChange={(v) => handleChange('teamId', v)}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select team..." />
                    </SelectTrigger>
                    <SelectContent>
                      {teamSelectOptions.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-charcoal-900 py-2">
                    {teamSelectOptions.find(t => t.value === data.teamId)?.label || '—'}
                  </p>
                )}
                <p className="text-xs text-charcoal-500 mt-1">Executing team</p>
              </div>
            </div>
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
            <div className="flex items-start gap-4">
              <Label className="text-sm font-medium text-charcoal-700 w-28 pt-2.5 shrink-0">
                Members
              </Label>
              <div className="flex-1">
                {isEditable ? (
                  <MultiSelectDropdown
                    placeholder="Add collaborators..."
                    options={memberOptions}
                    value={data.collaboratorIds}
                    onChange={(v) => handleChange('collaboratorIds', v)}
                    maxDisplay={2}
                  />
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {data.collaboratorIds.length > 0 ? (
                      data.collaboratorIds.map((id) => {
                        const member = memberOptions.find(m => m.value === id)
                        return <Badge key={id} variant="outline">{member?.label || id}</Badge>
                      })
                    ) : (
                      <span className="text-sm text-charcoal-400">No collaborators</span>
                    )}
                  </div>
                )}
                <p className="text-xs text-charcoal-500 mt-1">Additional team members with edit access</p>
              </div>
            </div>
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
          <p className="text-xs text-charcoal-500 mt-1">
            Require approval before launching the campaign
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Requires Approval Toggle */}
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium text-charcoal-700">
                Requires Approval
              </Label>
              <p className="text-xs text-charcoal-500">
                Campaign must be approved before launch
              </p>
            </div>
            <Switch
              checked={data.requiresApproval}
              onCheckedChange={(v) => handleChange('requiresApproval', v)}
              disabled={!isEditable}
            />
          </div>

          {/* Approvers */}
          {data.requiresApproval && (
            <div className="flex items-start gap-4">
              <Label className="text-sm font-medium text-charcoal-700 w-28 pt-2.5 shrink-0">
                Approvers <span className="text-red-500">*</span>
              </Label>
              <div className="flex-1">
                {isEditable ? (
                  <MultiSelectDropdown
                    placeholder="Select approvers..."
                    options={memberOptions}
                    value={data.approverIds}
                    onChange={(v) => handleChange('approverIds', v)}
                    maxDisplay={3}
                    error={errors?.approverIds}
                  />
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {data.approverIds.length > 0 ? (
                      data.approverIds.map((id) => {
                        const member = memberOptions.find(m => m.value === id)
                        return <Badge key={id} variant="outline">{member?.label || id}</Badge>
                      })
                    ) : (
                      <span className="text-sm text-charcoal-400">No approvers selected</span>
                    )}
                  </div>
                )}
              </div>
            </div>
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
          <p className="text-xs text-charcoal-500 mt-1">
            When should the team be notified?
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Notify on Response */}
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-charcoal-700">
                  On Response
                </Label>
                <p className="text-xs text-charcoal-500">
                  When prospect replies
                </p>
              </div>
              <Switch
                checked={data.notifyOnResponse}
                onCheckedChange={(v) => handleChange('notifyOnResponse', v)}
                disabled={!isEditable}
              />
            </div>

            {/* Notify on Conversion */}
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-charcoal-700">
                  On Conversion
                </Label>
                <p className="text-xs text-charcoal-500">
                  When lead converts
                </p>
              </div>
              <Switch
                checked={data.notifyOnConversion}
                onCheckedChange={(v) => handleChange('notifyOnConversion', v)}
                disabled={!isEditable}
              />
            </div>

            {/* Notify on Completion */}
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-charcoal-700">
                  On Completion
                </Label>
                <p className="text-xs text-charcoal-500">
                  When campaign ends
                </p>
              </div>
              <Switch
                checked={data.notifyOnCompletion}
                onCheckedChange={(v) => handleChange('notifyOnCompletion', v)}
                disabled={!isEditable}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CampaignTeamSection
