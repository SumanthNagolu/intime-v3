'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, UserPlus, UserCheck, Shield, Gauge, ChevronRight } from 'lucide-react'
import { SectionHeader } from '../fields/SectionHeader'
import { VACATION_STATUSES, LOAD_PERMISSIONS } from '@/lib/teams/constants'
import type { SectionMode, TeamMembersSectionData, TeamMember } from '@/lib/teams/types'
import { cn } from '@/lib/utils'

// ============ PROPS ============

interface TeamMembersSectionProps {
  /** Mode determines rendering style */
  mode: SectionMode
  /** Data to display/edit */
  data: TeamMembersSectionData
  /** Handler for field changes */
  onChange?: (field: string, value: unknown) => void
  /** Handler to add member (opens dialog) */
  onAddMember?: () => void
  /** Handler to remove member */
  onRemoveMember?: (memberId: string) => void
  /** Handler to edit member */
  onEditMember?: (memberId: string) => void
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
  /** Available users for manager/supervisor selection */
  availableUsers?: Array<{ id: string; fullName: string }>
}

/**
 * TeamMembersSection - Unified component for Team Members
 */
export function TeamMembersSection({
  mode,
  data,
  onChange,
  onAddMember,
  onEditMember,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
  errors = {},
  className,
  availableUsers = [],
}: TeamMembersSectionProps) {
  const [isEditing, setIsEditing] = React.useState(mode === 'edit')

  React.useEffect(() => {
    setIsEditing(mode === 'edit')
  }, [mode])

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

  // Group members by role
  const managers = data.members.filter(m => m.isManager && m.isActive)
  const regularMembers = data.members.filter(m => !m.isManager && m.isActive)
  const inactiveMembers = data.members.filter(m => !m.isActive)

  // Get vacation status config
  const getVacationConfig = (status: string) =>
    VACATION_STATUSES.find(v => v.value === status) ?? VACATION_STATUSES[0]

  return (
    <div className={cn('space-y-6', className)}>
      {!isCreateMode && (
        <SectionHeader
          title="Team Members"
          subtitle={`${data.members.filter(m => m.isActive).length} active members`}
          mode={isEditing ? 'edit' : 'view'}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      )}

      <div className="space-y-6">
        {/* Leadership Card */}
        <Card className="shadow-elevation-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-charcoal-100 rounded-lg">
                  <Shield className="w-4 h-4 text-charcoal-600" />
                </div>
                <CardTitle className="text-base font-heading">Leadership</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Manager */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-charcoal-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-charcoal-200 flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-charcoal-600" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-charcoal-500 uppercase tracking-wider">Manager</p>
                  <p className="text-sm font-medium text-charcoal-900">
                    {data.managerName || 'Not assigned'}
                  </p>
                </div>
              </div>
              <Badge className="bg-charcoal-100 text-charcoal-700">Manager</Badge>
            </div>

            {/* Supervisor */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-charcoal-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-charcoal-200 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-charcoal-600" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-charcoal-500 uppercase tracking-wider">Supervisor</p>
                  <p className="text-sm font-medium text-charcoal-900">
                    {data.supervisorName || 'Not assigned'}
                  </p>
                </div>
              </div>
              <Badge className="bg-charcoal-100 text-charcoal-700">Supervisor</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Team Managers */}
        {managers.length > 0 && (
          <Card className="shadow-elevation-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-charcoal-100 rounded-lg">
                    <UserCheck className="w-4 h-4 text-charcoal-600" />
                  </div>
                  <CardTitle className="text-base font-heading">Team Managers</CardTitle>
                  <Badge variant="secondary">{managers.length}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-charcoal-100">
                {managers.map((member) => (
                  <MemberRow
                    key={member.id}
                    member={member}
                    getVacationConfig={getVacationConfig}
                    onEdit={onEditMember}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Regular Members */}
        <Card className="shadow-elevation-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-charcoal-100 rounded-lg">
                  <Users className="w-4 h-4 text-charcoal-600" />
                </div>
                <CardTitle className="text-base font-heading">Team Members</CardTitle>
                <Badge variant="secondary">{regularMembers.length}</Badge>
              </div>
              {isEditable && onAddMember && (
                <Button variant="outline" size="sm" onClick={onAddMember}>
                  <UserPlus className="w-4 h-4 mr-1" />
                  Add Member
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {regularMembers.length > 0 ? (
              <div className="divide-y divide-charcoal-100">
                {regularMembers.map((member) => (
                  <MemberRow
                    key={member.id}
                    member={member}
                    getVacationConfig={getVacationConfig}
                    onEdit={onEditMember}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-10 h-10 text-charcoal-300 mx-auto mb-3" />
                <p className="text-sm text-charcoal-500">No team members yet</p>
                {isEditable && onAddMember && (
                  <Button variant="outline" size="sm" className="mt-3" onClick={onAddMember}>
                    <UserPlus className="w-4 h-4 mr-1" />
                    Add First Member
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Inactive Members */}
        {inactiveMembers.length > 0 && (
          <Card className="shadow-elevation-sm opacity-60">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-heading text-charcoal-500">
                  Inactive Members
                </CardTitle>
                <Badge variant="secondary">{inactiveMembers.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-charcoal-100">
                {inactiveMembers.map((member) => (
                  <MemberRow
                    key={member.id}
                    member={member}
                    getVacationConfig={getVacationConfig}
                    onEdit={onEditMember}
                    inactive
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// Member row component
interface MemberRowProps {
  member: TeamMember
  getVacationConfig: (status: string) => typeof VACATION_STATUSES[number]
  onEdit?: (memberId: string) => void
  inactive?: boolean
}

function MemberRow({ member, getVacationConfig, onEdit, inactive }: MemberRowProps) {
  const vacationConfig = getVacationConfig(member.vacationStatus)

  return (
    <div
      className={cn(
        'flex items-center justify-between py-3 group',
        onEdit && 'cursor-pointer hover:bg-charcoal-50 -mx-3 px-3 rounded-lg transition-colors'
      )}
      onClick={() => onEdit?.(member.id)}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-charcoal-200 flex items-center justify-center flex-shrink-0">
          {member.avatarUrl ? (
            <img
              src={member.avatarUrl}
              alt={member.fullName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <span className="text-sm font-medium text-charcoal-600">
              {member.fullName?.split(' ').map(n => n[0]).join('')}
            </span>
          )}
        </div>
        <div>
          <p className={cn('font-medium', inactive ? 'text-charcoal-500' : 'text-charcoal-900')}>
            {member.fullName}
          </p>
          <p className="text-xs text-charcoal-500">{member.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Vacation Status */}
        <Badge className={cn('text-xs', vacationConfig.color)}>
          {vacationConfig.label}
        </Badge>

        {/* Load Factor */}
        <div className="flex items-center gap-1 text-xs text-charcoal-500">
          <Gauge className="w-3 h-3" />
          {member.loadFactor}%
        </div>

        {onEdit && (
          <ChevronRight className="w-4 h-4 text-charcoal-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
    </div>
  )
}

export default TeamMembersSection
