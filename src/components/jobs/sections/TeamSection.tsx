'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Users,
  UserCog,
  Star,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import { SectionHeader } from '@/components/accounts/fields/SectionHeader'
import { trpc } from '@/lib/trpc/client'
import type { SectionMode, TeamSectionData } from '@/lib/jobs/types'
import { cn } from '@/lib/utils'

// ============ TYPES ============

interface TeamMember {
  id: string
  full_name?: string | null
  email?: string | null
}

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
}

/**
 * TeamSection - Unified component for Job Team Assignment
 *
 * Covers job owner, recruiters, priority ranking, and SLA
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

  // Fetch team members for selection
  const teamQuery = trpc.users.list.useQuery(
    { pageSize: 100 },
    { enabled: isEditable }
  )
  const teamMembers: TeamMember[] = (teamQuery.data?.items || []) as TeamMember[]

  // Priority rank options
  const priorityRanks = [
    { value: 0, label: 'Not Prioritized', color: 'charcoal' },
    { value: 1, label: '#1 Priority', color: 'gold' },
    { value: 2, label: '#2 Priority', color: 'charcoal' },
    { value: 3, label: '#3 Priority', color: 'charcoal' },
    { value: 4, label: '#4 Priority', color: 'charcoal' },
  ]

  // SLA options in days
  const slaOptions = [7, 14, 21, 30, 45, 60, 90]

  // Get owner name from team members if not provided
  const ownerName = data.ownerName || teamMembers.find((m) => m.id === data.ownerId)?.full_name

  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header - only show Edit/Save/Cancel in view/edit mode */}
      {!isCreateMode && (
        <SectionHeader
          title="Team & Assignment"
          subtitle="Job ownership and recruiter assignments"
          mode={isEditing ? 'edit' : 'view'}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Owner Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gold-50 rounded-lg">
                <UserCog className="w-4 h-4 text-gold-600" />
              </div>
              <div>
                <CardTitle className="text-base font-heading">Job Owner</CardTitle>
                <p className="text-xs text-charcoal-500">Primary person responsible for this job</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isEditable ? (
              <Select
                value={data.ownerId}
                onValueChange={(value) => {
                  handleChange('ownerId', value)
                  const member = teamMembers.find((m) => m.id === value)
                  handleChange('ownerName', member?.full_name || '')
                }}
              >
                <SelectTrigger className="h-12 rounded-xl border-charcoal-200 bg-white">
                  <SelectValue placeholder="Select job owner" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gold-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-gold-700">
                            {member.full_name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">{member.full_name}</span>
                          {member.email && (
                            <span className="text-charcoal-500 ml-2 text-sm">{member.email}</span>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-gold-50/50 rounded-xl border border-gold-100">
                <div className="w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center">
                  <span className="text-lg font-semibold text-gold-700">
                    {ownerName?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-charcoal-900">
                    {ownerName || 'Not assigned'}
                  </p>
                  <p className="text-sm text-charcoal-500">Job Owner</p>
                </div>
              </div>
            )}
            {errors?.ownerId && <p className="text-xs text-error-600 mt-2">{errors.ownerId}</p>}
          </CardContent>
        </Card>

        {/* Recruiters Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-base font-heading">Assigned Recruiters</CardTitle>
                <p className="text-xs text-charcoal-500">Team members working on this job</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isEditable ? (
              <div className="space-y-3">
                <p className="text-sm text-charcoal-500">
                  Select team members to assign to this job
                </p>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {teamMembers.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => {
                        const current = data.recruiterIds
                        if (current.includes(member.id)) {
                          handleChange(
                            'recruiterIds',
                            current.filter((id) => id !== member.id)
                          )
                        } else {
                          handleChange('recruiterIds', [...current, member.id])
                        }
                      }}
                      className={cn(
                        'p-2 rounded-lg border text-left transition-all duration-200 flex items-center gap-2',
                        data.recruiterIds.includes(member.id)
                          ? 'border-blue-400 bg-blue-50'
                          : 'border-charcoal-100 bg-white hover:border-blue-200'
                      )}
                    >
                      <div className="w-6 h-6 rounded-full bg-charcoal-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-charcoal-600">
                          {member.full_name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <span className="text-sm truncate">{member.full_name}</span>
                      {data.recruiterIds.includes(member.id) && (
                        <CheckCircle2 className="w-4 h-4 text-blue-500 ml-auto flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {data.recruiterIds.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {data.recruiterIds.map((recruiterId) => {
                      const recruiter = teamMembers.find((m) => m.id === recruiterId)
                      const name =
                        data.recruiterNames?.[data.recruiterIds.indexOf(recruiterId)] ||
                        recruiter?.full_name ||
                        'Unknown'
                      return (
                        <Badge
                          key={recruiterId}
                          variant="secondary"
                          className="py-1.5 pl-1.5 pr-3 flex items-center gap-2"
                        >
                          <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-[10px] font-medium text-blue-700">
                              {name.charAt(0)}
                            </span>
                          </div>
                          {name}
                        </Badge>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-charcoal-400">No recruiters assigned</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Priority Rank Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Star className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-base font-heading">Priority Rank</CardTitle>
                <p className="text-xs text-charcoal-500">How this job ranks against others</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isEditable ? (
              <div className="grid grid-cols-5 gap-2">
                {priorityRanks.map((rank) => (
                  <button
                    key={rank.value}
                    type="button"
                    onClick={() => handleChange('priorityRank', rank.value)}
                    className={cn(
                      'p-3 rounded-xl border-2 text-center transition-all duration-200',
                      data.priorityRank === rank.value
                        ? rank.value === 1
                          ? 'border-gold-400 bg-gradient-to-br from-gold-50 to-white shadow-gold-glow'
                          : 'border-charcoal-400 bg-charcoal-50'
                        : 'border-charcoal-100 bg-white hover:border-charcoal-200'
                    )}
                  >
                    <div className="flex flex-col items-center gap-1">
                      {rank.value === 0 ? (
                        <span className="text-lg text-charcoal-400">-</span>
                      ) : (
                        <span
                          className={cn(
                            'text-lg font-bold',
                            rank.value === 1 ? 'text-gold-600' : 'text-charcoal-700'
                          )}
                        >
                          #{rank.value}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {data.priorityRank === 0 ? (
                  <Badge variant="outline" className="py-1.5 px-3">
                    Not Prioritized
                  </Badge>
                ) : (
                  <Badge
                    variant={data.priorityRank === 1 ? 'default' : 'secondary'}
                    className={cn(
                      'py-1.5 px-3 text-base',
                      data.priorityRank === 1 && 'bg-gold-500'
                    )}
                  >
                    <Star
                      className={cn(
                        'w-4 h-4 mr-1',
                        data.priorityRank === 1 && 'fill-current'
                      )}
                    />
                    #{data.priorityRank} Priority
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* SLA Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <Clock className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-base font-heading">SLA Timeline</CardTitle>
                <p className="text-xs text-charcoal-500">Target days to fill this position</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isEditable ? (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {slaOptions.map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => handleChange('slaDays', days)}
                      className={cn(
                        'px-4 py-2 rounded-lg border transition-all duration-200',
                        data.slaDays === days
                          ? 'border-green-400 bg-green-50 text-green-700 font-medium'
                          : 'border-charcoal-100 bg-white hover:border-green-200 text-charcoal-600'
                      )}
                    >
                      {days} days
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-charcoal-500">Custom:</Label>
                  <input
                    type="number"
                    value={data.slaDays}
                    onChange={(e) => handleChange('slaDays', parseInt(e.target.value) || 30)}
                    className="w-20 h-9 px-3 rounded-lg border border-charcoal-200 text-sm"
                    min={1}
                    max={365}
                  />
                  <span className="text-sm text-charcoal-500">days</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                <Clock className="w-6 h-6 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-700">{data.slaDays}</p>
                  <p className="text-sm text-green-600">days to fill</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default TeamSection
