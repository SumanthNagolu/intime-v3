'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
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
  Mail,
  Phone,
  Calendar,
  MessageSquare,
} from 'lucide-react'
import { SectionWrapper } from '../layouts/SectionHeader'
import { SectionHeader } from '../fields/SectionHeader'
import { UnifiedField } from '../fields/UnifiedField'
import { FieldGrid } from '../layouts/FieldGrid'
import {
  CONTACT_METHODS,
  MEETING_CADENCES,
  SUBMISSION_METHODS,
  getLabel,
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

  // Convert team members to options format
  const teamMemberOptions = teamMembers.map(m => ({ value: m.id, label: m.full_name }))

  // Convert constants to options
  const contactMethodOptions = CONTACT_METHODS.map(m => ({ value: m.value, label: m.label }))
  const meetingCadenceOptions = MEETING_CADENCES.map(c => ({ value: c.value, label: c.label }))
  const submissionMethodOptions = SUBMISSION_METHODS.map(m => ({ value: m.value, label: m.label }))

  // ============ CREATE MODE ============
  if (mode === 'create') {
    return (
      <div className={cn('space-y-10', className)}>
        {/* Account Team */}
        <SectionWrapper
          icon={Users}
          title="Account Team"
          subtitle="Assign team members to this account"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TeamRoleCard
              icon={User}
              title="Account Owner"
              description="Primary owner responsible for the account"
              required
              value={data.team.ownerId}
              onChange={(v) => handleTeamChange('owner', v)}
              teamMembers={teamMembers}
              error={errors['team.ownerId']}
            />

            <TeamRoleCard
              icon={UserCog}
              title="Account Manager"
              description="Day-to-day relationship manager"
              value={data.team.accountManagerId}
              onChange={(v) => handleTeamChange('accountManager', v)}
              teamMembers={teamMembers}
            />

            <TeamRoleCard
              icon={Briefcase}
              title="Lead Recruiter"
              description="Primary recruiter for this account"
              value={data.team.recruiterId}
              onChange={(v) => handleTeamChange('recruiter', v)}
              teamMembers={teamMembers}
            />

            <TeamRoleCard
              icon={Target}
              title="Sales Lead"
              description="Sales representative for expansion"
              value={data.team.salesLeadId}
              onChange={(v) => handleTeamChange('salesLead', v)}
              teamMembers={teamMembers}
            />
          </div>
        </SectionWrapper>

        {/* Engagement Preferences */}
        <SectionWrapper
          icon={MessageSquare}
          title="Engagement Preferences"
          subtitle="Communication and meeting preferences"
        >
          <FieldGrid cols={3}>
            <div className="space-y-2">
              <Label className="text-charcoal-700 font-medium">Preferred Contact Method</Label>
              <Select
                value={data.preferredContactMethod}
                onValueChange={(v) => handleChange('preferredContactMethod', v)}
              >
                <SelectTrigger className="h-12 rounded-xl border-charcoal-200 bg-white">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {CONTACT_METHODS.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.icon} {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-charcoal-700 font-medium">Meeting Cadence</Label>
              <Select
                value={data.meetingCadence}
                onValueChange={(v) => handleChange('meetingCadence', v)}
              >
                <SelectTrigger className="h-12 rounded-xl border-charcoal-200 bg-white">
                  <SelectValue placeholder="Select cadence" />
                </SelectTrigger>
                <SelectContent>
                  {MEETING_CADENCES.map((cadence) => (
                    <SelectItem key={cadence.value} value={cadence.value}>
                      {cadence.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-charcoal-700 font-medium">Submission Method</Label>
              <Select
                value={data.submissionMethod}
                onValueChange={(v) => handleChange('submissionMethod', v)}
              >
                <SelectTrigger className="h-12 rounded-xl border-charcoal-200 bg-white">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {SUBMISSION_METHODS.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </FieldGrid>
        </SectionWrapper>
      </div>
    )
  }

  // ============ VIEW/EDIT MODE - In-Place Editing ============
  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header with Edit/Save/Cancel */}
      <SectionHeader
        title="Team"
        subtitle="Account team assignments and engagement preferences"
        mode={isEditing ? 'edit' : 'view'}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancel={handleCancel}
        isSaving={isSaving}
      />

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TeamMemberCard
          icon={User}
          title="Account Owner"
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
          name={data.team.accountManagerName}
          userId={data.team.accountManagerId}
          teamMembers={teamMembers}
          editable={isEditable}
          onChange={(v) => handleTeamChange('accountManager', v)}
        />
        <TeamMemberCard
          icon={Briefcase}
          title="Lead Recruiter"
          name={data.team.recruiterName}
          userId={data.team.recruiterId}
          teamMembers={teamMembers}
          editable={isEditable}
          onChange={(v) => handleTeamChange('recruiter', v)}
        />
        <TeamMemberCard
          icon={Target}
          title="Sales Lead"
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

interface TeamRoleCardProps {
  icon: React.ElementType
  title: string
  description: string
  required?: boolean
  value?: string
  onChange: (value: string) => void
  teamMembers: Array<{ id: string; full_name: string; email?: string; avatar_url?: string }>
  error?: string
}

function TeamRoleCard({
  icon: Icon,
  title,
  description,
  required,
  value,
  onChange,
  teamMembers,
  error,
}: TeamRoleCardProps) {
  const selectedMember = value ? teamMembers.find((m) => m.id === value) : null

  return (
    <div
      className={cn(
        'p-5 rounded-xl border-2 transition-all duration-300',
        value
          ? 'border-gold-400 bg-gradient-to-br from-gold-50/50 to-white'
          : 'border-charcoal-200 bg-white'
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center',
            value
              ? 'bg-gradient-to-br from-gold-400 to-gold-500 text-white'
              : 'bg-charcoal-100 text-charcoal-400'
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-charcoal-800">
            {title}
            {required && <span className="text-gold-500 ml-1">*</span>}
          </h4>
          <p className="text-xs text-charcoal-500 mb-3">{description}</p>

          <Select value={value || ''} onValueChange={onChange}>
            <SelectTrigger className="h-10 rounded-lg border-charcoal-200 bg-white">
              <SelectValue placeholder="Select team member" />
            </SelectTrigger>
            <SelectContent>
              {teamMembers.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={member.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {member.full_name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    {member.full_name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {error && <p className="text-xs text-error-600 mt-1">{error}</p>}
        </div>
      </div>
    </div>
  )
}

interface TeamMemberCardProps {
  icon: React.ElementType
  title: string
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
              <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-1">
                {title}
                {required && <span className="text-gold-500 ml-1">*</span>}
              </p>
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
