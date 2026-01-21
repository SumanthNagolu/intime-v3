'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Users,
  User,
  UserCog,
  Briefcase,
  Target,
  MessageSquare,
} from 'lucide-react'
import { SectionHeader } from '../fields/SectionHeader'
import { UnifiedField } from '../fields/UnifiedField'
import {
  CONTACT_METHODS,
  MEETING_CADENCES,
  SUBMISSION_METHODS,
} from '@/lib/accounts/constants'
import type { SectionMode, TeamSectionData } from '@/lib/accounts/types'
import { cn } from '@/lib/utils'

// ============ PROPS ============

interface TeamSectionProps {
  /** Mode determines rendering style */
  mode: SectionMode
  /** Data to display/edit */
  data: TeamSectionData
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
  /** Available team members for selection */
  teamMembers?: Array<{
    id: string
    full_name: string
    email?: string
    avatar_url?: string
  }>
}

/**
 * TeamSection - Unified component for Team Assignment
 *
 * Handles all three modes:
 * - create: Full form for wizard step (Step 7)
 * - view: Read-only card grid for detail page with in-place editing
 * - edit: Same layout as view but fields are editable
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
  teamMembers = [],
}: TeamSectionProps) {
  const [isEditing, setIsEditing] = React.useState(mode === 'edit')

  // Reset editing state when mode changes
  React.useEffect(() => {
    setIsEditing(mode === 'edit')
  }, [mode])

  const handleChange = (field: string, value: unknown) => {
    onChange?.(field, value)
  }

  const handleTeamChange = (role: string, userId: string) => {
    const member = teamMembers.find((m) => m.id === userId)
    onChange?.('team', {
      ...data.team,
      [`${role}Id`]: userId,
      [`${role}Name`]: member?.full_name || '',
    })
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

  // Convert team members to options format
  const teamMemberOptions = teamMembers.map(m => ({ value: m.id, label: m.full_name }))

  // Convert constants to options
  const contactMethodOptions = CONTACT_METHODS.map(m => ({ value: m.value, label: m.label }))
  const meetingCadenceOptions = MEETING_CADENCES.map(c => ({ value: c.value, label: c.label }))
  const submissionMethodOptions = SUBMISSION_METHODS.map(m => ({ value: m.value, label: m.label }))

  // ============ UNIFIED LAYOUT - Same structure in all modes ============
  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header - only show Edit/Save/Cancel in view/edit mode */}
      {!isCreateMode && (
        <SectionHeader
          title="Team"
          subtitle="Account team assignments and engagement preferences"
          mode={isEditing ? 'edit' : 'view'}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      )}

      {/* Team Members Grid - Same structure in all modes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TeamMemberCard
          icon={User}
          title="Account Owner"
          description="Primary owner responsible for the account"
          name={data.team.ownerName}
          userId={data.team.ownerId}
          teamMembers={teamMembers}
          editable={isEditable}
          onChange={(v) => handleTeamChange('owner', v)}
          required
          error={errors?.['team.ownerId']}
        />
        <TeamMemberCard
          icon={UserCog}
          title="Account Manager"
          description="Day-to-day relationship manager"
          name={data.team.accountManagerName}
          userId={data.team.accountManagerId}
          teamMembers={teamMembers}
          editable={isEditable}
          onChange={(v) => handleTeamChange('accountManager', v)}
        />
        <TeamMemberCard
          icon={Briefcase}
          title="Lead Recruiter"
          description="Primary recruiter for this account"
          name={data.team.recruiterName}
          userId={data.team.recruiterId}
          teamMembers={teamMembers}
          editable={isEditable}
          onChange={(v) => handleTeamChange('recruiter', v)}
        />
        <TeamMemberCard
          icon={Target}
          title="Sales Lead"
          description="Sales representative for expansion"
          name={data.team.salesLeadName}
          userId={data.team.salesLeadId}
          teamMembers={teamMembers}
          editable={isEditable}
          onChange={(v) => handleTeamChange('salesLead', v)}
        />
      </div>

      {/* Engagement Preferences Card */}
      <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <MessageSquare className="w-4 h-4 text-purple-600" />
            </div>
            <CardTitle className="text-base font-heading">Engagement Preferences</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <UnifiedField
              label="Contact Method"
              type="select"
              options={contactMethodOptions}
              value={data.preferredContactMethod}
              onChange={(v) => handleChange('preferredContactMethod', v)}
              editable={isEditable}
            />
            <UnifiedField
              label="Meeting Cadence"
              type="select"
              options={meetingCadenceOptions}
              value={data.meetingCadence}
              onChange={(v) => handleChange('meetingCadence', v)}
              editable={isEditable}
            />
            <UnifiedField
              label="Submission Method"
              type="select"
              options={submissionMethodOptions}
              value={data.submissionMethod}
              onChange={(v) => handleChange('submissionMethod', v)}
              editable={isEditable}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============ HELPER COMPONENTS ============

interface TeamMemberCardProps {
  icon: React.ElementType
  title: string
  description?: string
  name?: string
  userId?: string
  teamMembers: Array<{ id: string; full_name: string; email?: string; avatar_url?: string }>
  editable?: boolean
  onChange?: (value: string) => void
  required?: boolean
  error?: string
}

function TeamMemberCard({
  icon: Icon,
  title,
  description,
  name,
  userId,
  teamMembers,
  editable = false,
  onChange,
  required,
  error,
}: TeamMemberCardProps) {
  const member = userId ? teamMembers.find((m) => m.id === userId) : null

  if (editable && onChange) {
    return (
      <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                member
                  ? 'bg-gradient-to-br from-gold-400 to-gold-500 text-white'
                  : 'bg-charcoal-100 text-charcoal-400'
              )}
            >
              <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                {title}
                {required && <span className="text-gold-500 ml-1">*</span>}
              </p>
              {description && (
                <p className="text-xs text-charcoal-400 mb-2">{description}</p>
              )}
              <Select value={userId || ''} onValueChange={onChange}>
                <SelectTrigger className="h-9 rounded-lg">
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={m.avatar_url} />
                          <AvatarFallback className="text-[10px]">
                            {m.full_name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        {m.full_name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {error && <p className="text-xs text-error-600 mt-1">{error}</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              member
                ? 'bg-gradient-to-br from-gold-400 to-gold-500 text-white'
                : 'bg-charcoal-100 text-charcoal-400'
            )}
          >
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">{title}</p>
            {member ? (
              <div className="flex items-center gap-2 mt-1">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={member.avatar_url} />
                  <AvatarFallback className="text-xs">
                    {member.full_name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-charcoal-900">{member.full_name}</span>
              </div>
            ) : name ? (
              <p className="text-sm font-medium text-charcoal-900 mt-1">{name}</p>
            ) : (
              <p className="text-sm text-charcoal-400 mt-1">Not assigned</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default TeamSection
