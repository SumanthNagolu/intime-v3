'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Plus,
  Trash2,
  Users,
  User,
  Mail,
  Briefcase,
  Crown,
  Eye,
  ClipboardList,
  UserCheck,
  Info,
  GripVertical,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { InterviewParticipant, ParticipantRole } from '@/stores/schedule-interview-store'
import { PARTICIPANT_ROLES } from '@/stores/schedule-interview-store'

// Role icons mapping
const ROLE_ICONS: Record<ParticipantRole, React.ComponentType<{ className?: string }>> = {
  lead_interviewer: Crown,
  interviewer: User,
  hiring_manager: Briefcase,
  shadow: Eye,
  observer: Eye,
  note_taker: ClipboardList,
}

// Role colors for badges
const ROLE_COLORS: Record<ParticipantRole, string> = {
  lead_interviewer: 'bg-gold-100 text-gold-800 border-gold-300',
  interviewer: 'bg-blue-100 text-blue-800 border-blue-300',
  hiring_manager: 'bg-purple-100 text-purple-800 border-purple-300',
  shadow: 'bg-gray-100 text-gray-800 border-gray-300',
  observer: 'bg-gray-100 text-gray-800 border-gray-300',
  note_taker: 'bg-emerald-100 text-emerald-800 border-emerald-300',
}

interface ParticipantSelectorProps {
  participants: InterviewParticipant[]
  onAdd: (participant?: Partial<InterviewParticipant>) => void
  onRemove: (index: number) => void
  onUpdate: (index: number, participant: Partial<InterviewParticipant>) => void
  isPanel?: boolean
  maxParticipants?: number
  showScorecardInfo?: boolean
  className?: string
}

export function ParticipantSelector({
  participants,
  onAdd,
  onRemove,
  onUpdate,
  isPanel = false,
  maxParticipants = 10,
  showScorecardInfo = true,
  className,
}: ParticipantSelectorProps) {
  const hasLeadInterviewer = participants.some(p => p.role === 'lead_interviewer')
  const requiredCount = participants.filter(p => p.isRequired).length
  const validParticipants = participants.filter(p => p.name && p.email)

  const handleAddParticipant = () => {
    // Default new participant to lead_interviewer if none exists, otherwise interviewer
    const defaultRole: ParticipantRole = hasLeadInterviewer ? 'interviewer' : 'lead_interviewer'
    onAdd({
      role: defaultRole,
      isRequired: true,
    })
  }

  const getRoleDescription = (role: ParticipantRole): string => {
    const roleConfig = PARTICIPANT_ROLES.find(r => r.value === role)
    return roleConfig?.description || ''
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-charcoal-600" />
          <Label className="text-base font-medium">
            Interview Participants
            {isPanel && (
              <Badge variant="outline" className="ml-2 text-xs bg-gold-50 text-gold-700 border-gold-300">
                Panel Interview
              </Badge>
            )}
          </Label>
        </div>
        <div className="flex items-center gap-2 text-sm text-charcoal-500">
          <span>{validParticipants.length} participant{validParticipants.length !== 1 ? 's' : ''}</span>
          {requiredCount > 0 && (
            <span className="text-xs">({requiredCount} required)</span>
          )}
        </div>
      </div>

      {/* Info banner for scorecards */}
      {showScorecardInfo && participants.length > 1 && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-800">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <span className="font-medium">Panel Interview Mode:</span>{' '}
            Each participant can submit their own scorecard. The lead interviewer is responsible for the final hiring decision.
          </div>
        </div>
      )}

      {/* Lead Interviewer Warning */}
      {!hasLeadInterviewer && participants.length > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
          <Crown className="w-4 h-4" />
          <span>No lead interviewer assigned. Consider designating one participant as the lead.</span>
        </div>
      )}

      {/* Participants List */}
      <div className="space-y-3">
        {participants.map((participant, index) => {
          const RoleIcon = ROLE_ICONS[participant.role] || User
          const roleColor = ROLE_COLORS[participant.role] || 'bg-gray-100 text-gray-800'
          const hasError = !participant.name || !participant.email

          return (
            <Card
              key={participant.id || index}
              className={cn(
                'transition-all duration-200',
                hasError && 'border-amber-300 bg-amber-50/50',
                participant.role === 'lead_interviewer' && 'border-gold-300 shadow-sm'
              )}
            >
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  {/* Drag Handle (visual only for now) */}
                  <div className="flex items-center h-9 text-charcoal-300 cursor-grab">
                    <GripVertical className="w-4 h-4" />
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 space-y-3">
                    {/* Top Row: Name, Email, Title */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-charcoal-500 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          Name *
                        </Label>
                        <Input
                          placeholder="John Smith"
                          value={participant.name}
                          onChange={(e) => onUpdate(index, { name: e.target.value })}
                          className={cn(
                            'h-9',
                            !participant.name && 'border-amber-300'
                          )}
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs text-charcoal-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          Email *
                        </Label>
                        <Input
                          type="email"
                          placeholder="john@company.com"
                          value={participant.email}
                          onChange={(e) => onUpdate(index, { email: e.target.value })}
                          className={cn(
                            'h-9',
                            !participant.email && 'border-amber-300'
                          )}
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs text-charcoal-500 flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          Title
                        </Label>
                        <Input
                          placeholder="Engineering Manager"
                          value={participant.title || ''}
                          onChange={(e) => onUpdate(index, { title: e.target.value })}
                          className="h-9"
                        />
                      </div>
                    </div>

                    {/* Bottom Row: Role, Required, Remove */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {/* Role Selector */}
                        <div className="space-y-1">
                          <Label className="text-xs text-charcoal-500">Role</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div>
                                  <Select
                                    value={participant.role}
                                    onValueChange={(value: ParticipantRole) => onUpdate(index, { role: value })}
                                  >
                                    <SelectTrigger className="w-[180px] h-9">
                                      <SelectValue>
                                        <div className="flex items-center gap-2">
                                          <RoleIcon className="w-4 h-4" />
                                          <span>{PARTICIPANT_ROLES.find(r => r.value === participant.role)?.label}</span>
                                        </div>
                                      </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                      {PARTICIPANT_ROLES.map((role) => {
                                        const Icon = ROLE_ICONS[role.value]
                                        return (
                                          <SelectItem key={role.value} value={role.value}>
                                            <div className="flex items-center gap-2">
                                              <Icon className="w-4 h-4" />
                                              <span>{role.label}</span>
                                            </div>
                                          </SelectItem>
                                        )
                                      })}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="bottom" className="max-w-xs">
                                <p>{getRoleDescription(participant.role)}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>

                        {/* Required Checkbox */}
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`required-${index}`}
                            checked={participant.isRequired}
                            onCheckedChange={(checked) => onUpdate(index, { isRequired: !!checked })}
                          />
                          <Label
                            htmlFor={`required-${index}`}
                            className="text-sm text-charcoal-600 cursor-pointer"
                          >
                            Required
                          </Label>
                        </div>
                      </div>

                      {/* Role Badge and Remove Button */}
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn('text-xs', roleColor)}
                        >
                          {participant.isRequired ? 'Required' : 'Optional'}
                        </Badge>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => onRemove(index)}
                          className="h-8 w-8 text-charcoal-400 hover:text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Add Participant Button */}
      {participants.length < maxParticipants && (
        <Button
          type="button"
          variant="outline"
          onClick={handleAddParticipant}
          className="w-full border-dashed border-2 hover:border-solid hover:border-charcoal-400"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Participant
        </Button>
      )}

      {/* Summary Footer */}
      {participants.length > 0 && (
        <div className="flex items-center justify-between pt-2 border-t text-sm text-charcoal-500">
          <div className="flex items-center gap-4">
            {PARTICIPANT_ROLES.slice(0, 4).map((role) => {
              const count = participants.filter(p => p.role === role.value).length
              if (count === 0) return null
              const Icon = ROLE_ICONS[role.value]
              return (
                <div key={role.value} className="flex items-center gap-1">
                  <Icon className="w-3 h-3" />
                  <span>{count} {role.label}{count > 1 ? 's' : ''}</span>
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-1">
            <UserCheck className="w-4 h-4 text-green-600" />
            <span>{validParticipants.length}/{maxParticipants} valid</span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {participants.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <Users className="w-10 h-10 mx-auto mb-3 text-charcoal-300" />
            <p className="text-charcoal-600 font-medium">No participants added</p>
            <p className="text-sm text-charcoal-500 mb-4">
              Add interviewers, hiring managers, or observers
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddParticipant}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Participant
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Compact variant for inline use
interface ParticipantSelectorCompactProps {
  participants: InterviewParticipant[]
  onAdd: (participant?: Partial<InterviewParticipant>) => void
  onRemove: (index: number) => void
  onUpdate: (index: number, participant: Partial<InterviewParticipant>) => void
  maxParticipants?: number
  className?: string
}

export function ParticipantSelectorCompact({
  participants,
  onAdd,
  onRemove,
  onUpdate,
  maxParticipants = 10,
  className,
}: ParticipantSelectorCompactProps) {
  const hasLeadInterviewer = participants.some(p => p.role === 'lead_interviewer')

  const handleAddParticipant = () => {
    const defaultRole: ParticipantRole = hasLeadInterviewer ? 'interviewer' : 'lead_interviewer'
    onAdd({ role: defaultRole, isRequired: true })
  }

  return (
    <div className={cn('space-y-3', className)}>
      <Label className="flex items-center gap-2">
        <Users className="w-4 h-4" />
        Participants ({participants.length})
      </Label>

      {participants.map((participant, index) => (
        <div key={participant.id || index} className="grid grid-cols-4 gap-2 items-center">
          <Input
            placeholder="Name"
            value={participant.name}
            onChange={(e) => onUpdate(index, { name: e.target.value })}
            className="h-9"
          />
          <Input
            type="email"
            placeholder="Email"
            value={participant.email}
            onChange={(e) => onUpdate(index, { email: e.target.value })}
            className="h-9"
          />
          <Select
            value={participant.role}
            onValueChange={(value: ParticipantRole) => onUpdate(index, { role: value })}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              {PARTICIPANT_ROLES.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1">
            <Checkbox
              checked={participant.isRequired}
              onCheckedChange={(checked) => onUpdate(index, { isRequired: !!checked })}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onRemove(index)}
              className="h-8 w-8"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}

      {participants.length < maxParticipants && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddParticipant}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Participant
        </Button>
      )}
    </div>
  )
}

// Display-only variant for viewing participants
interface ParticipantListDisplayProps {
  participants: InterviewParticipant[]
  showRoles?: boolean
  showRequired?: boolean
  className?: string
}

export function ParticipantListDisplay({
  participants,
  showRoles = true,
  showRequired = false,
  className,
}: ParticipantListDisplayProps) {
  if (participants.length === 0) {
    return (
      <div className={cn('text-sm text-charcoal-500', className)}>
        No participants assigned
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      {participants.map((participant, index) => {
        const RoleIcon = ROLE_ICONS[participant.role] || User
        const roleLabel = PARTICIPANT_ROLES.find(r => r.value === participant.role)?.label

        return (
          <div
            key={participant.id || index}
            className="flex items-center justify-between py-2 px-3 rounded-lg bg-charcoal-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-charcoal-200 flex items-center justify-center">
                <RoleIcon className="w-4 h-4 text-charcoal-600" />
              </div>
              <div>
                <div className="font-medium text-sm text-charcoal-900">
                  {participant.name}
                </div>
                <div className="text-xs text-charcoal-500">
                  {participant.email}
                  {participant.title && ` • ${participant.title}`}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {showRoles && (
                <Badge variant="outline" className={cn('text-xs', ROLE_COLORS[participant.role])}>
                  {roleLabel}
                </Badge>
              )}
              {showRequired && participant.isRequired && (
                <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-300">
                  Required
                </Badge>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
