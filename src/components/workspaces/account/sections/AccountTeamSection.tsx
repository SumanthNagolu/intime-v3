'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { InlinePanel, InlinePanelSection } from '@/components/ui/inline-panel'
import {
  UserCog, Users, Crown, Briefcase, Phone,
  Pencil, User, Loader2
} from 'lucide-react'
import type { AccountData } from '@/types/workspace'
import { useAccountWorkspace } from '../AccountWorkspaceProvider'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

// Constants
const CONTACT_METHODS = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'teams', label: 'Microsoft Teams' },
  { value: 'slack', label: 'Slack' },
  { value: 'in_person', label: 'In Person' },
]

const MEETING_CADENCES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'as_needed', label: 'As Needed' },
]

const SUBMISSION_METHODS = [
  { value: 'email', label: 'Email' },
  { value: 'ats', label: 'Client ATS/VMS' },
  { value: 'portal', label: 'Client Portal' },
  { value: 'direct', label: 'Direct to Hiring Manager' },
]

interface AccountTeamSectionProps {
  account: AccountData
}

/**
 * AccountTeamSection - Team Assignments
 * Displays account ownership and team assignments
 * Matches wizard Step 7: Team
 */
export function AccountTeamSection({ account }: AccountTeamSectionProps) {
  const { refreshData, data } = useAccountWorkspace()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = React.useState(false)

  // Form state
  const [formData, setFormData] = React.useState({
    ownerId: account.owner?.id || '',
    accountManagerId: account.account_manager?.id || '',
    isStrategic: account.is_strategic || false,
    requiresApprovalForSubmission: account.requires_approval_for_submission || false,
    preferredContactMethod: account.preferred_contact_method || '',
    meetingCadence: account.meeting_cadence || '',
    submissionMethod: account.submission_method || '',
  })

  // Reset form when account changes or panel opens
  React.useEffect(() => {
    if (isEditing) {
      setFormData({
        ownerId: account.owner?.id || '',
        accountManagerId: account.account_manager?.id || '',
        isStrategic: account.is_strategic || false,
        requiresApprovalForSubmission: account.requires_approval_for_submission || false,
        preferredContactMethod: account.preferred_contact_method || '',
        meetingCadence: account.meeting_cadence || '',
        submissionMethod: account.submission_method || '',
      })
    }
  }, [account, isEditing])

  // Fetch users for team assignment dropdowns
  const usersQuery = trpc.users.list.useQuery({}, { enabled: isEditing })

  // Update mutation
  const updateMutation = trpc.crm.accounts.update.useMutation({
    onSuccess: () => {
      toast({ title: 'Team settings updated successfully' })
      refreshData()
      setIsEditing(false)
    },
    onError: (error) => {
      toast({ title: 'Error updating team settings', description: error.message, variant: 'error' })
    },
  })

  // Handle form submission
  const handleSave = async () => {
    await updateMutation.mutateAsync({
      id: account.id,
      preferredContactMethod: (formData.preferredContactMethod as 'email' | 'phone' | 'slack' | 'teams') || undefined,
      meetingCadence: (formData.meetingCadence as 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly') || undefined,
    })
  }

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  // Get users for select options
  const users: Array<{ id: string; full_name: string | null; email: string }> = usersQuery.data?.items || []

  return (
    <div className="flex gap-0">
      {/* Main Content */}
      <div className={cn("space-y-6 animate-fade-in flex-1 transition-all", isEditing && "pr-0")}>
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-heading font-semibold text-charcoal-900">Team Assignments</h2>
            <p className="text-sm text-charcoal-500 mt-1">Account ownership and team member assignments</p>
          </div>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="gap-2"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </Button>
          )}
        </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Owner */}
        <TeamMemberCard
          role="Account Owner"
          roleIcon={Crown}
          roleColor="gold"
          member={account.owner}
          description="Primary owner responsible for the account relationship"
        />

        {/* Account Manager */}
        <TeamMemberCard
          role="Account Manager"
          roleIcon={Briefcase}
          roleColor="blue"
          member={account.account_manager}
          description="Day-to-day manager handling account operations"
        />
      </div>

      {/* Additional Team Info */}
      <Card className="shadow-elevation-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-charcoal-100 rounded-lg">
              <Users className="w-4 h-4 text-charcoal-600" />
            </div>
            <CardTitle className="text-base font-heading">Team Settings</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Submission Approval</p>
              <Badge
                variant={account.requires_approval_for_submission ? 'warning' : 'secondary'}
                className="mt-2"
              >
                {account.requires_approval_for_submission ? 'Required' : 'Not Required'}
              </Badge>
              <p className="text-xs text-charcoal-400 mt-1">
                {account.requires_approval_for_submission
                  ? 'Submissions require manager approval before sending to client'
                  : 'Team members can submit candidates directly'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Strategic Account</p>
              <Badge
                variant={account.is_strategic ? 'success' : 'secondary'}
                className="mt-2"
              >
                {account.is_strategic ? 'Yes' : 'No'}
              </Badge>
              <p className="text-xs text-charcoal-400 mt-1">
                {account.is_strategic
                  ? 'This is a strategic/key account with special handling'
                  : 'Standard account handling'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Preferences */}
      <Card className="shadow-elevation-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Phone className="w-4 h-4 text-purple-600" />
            </div>
            <CardTitle className="text-base font-heading">Engagement Preferences</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Preferred Contact Method</p>
              <p className={cn("text-sm mt-1", account.preferred_contact_method ? "text-charcoal-900" : "text-charcoal-400")}>
                {formatContactMethod(account.preferred_contact_method) || 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Meeting Cadence</p>
              <p className={cn("text-sm mt-1", account.meeting_cadence ? "text-charcoal-900" : "text-charcoal-400")}>
                {formatMeetingCadence(account.meeting_cadence) || 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Submission Method</p>
              <p className={cn("text-sm mt-1", account.submission_method ? "text-charcoal-900" : "text-charcoal-400")}>
                {formatSubmissionMethod(account.submission_method) || 'Not specified'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>

      {/* Edit Panel */}
      <InlinePanel
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title="Edit Team Settings"
        description="Update team assignments and engagement preferences"
        width="lg"
        actions={
          <>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          <InlinePanelSection title="Team Assignments">
            <div className="space-y-4">
              <div>
                <Label htmlFor="owner">Account Owner</Label>
                <Select
                  value={formData.ownerId}
                  onValueChange={(v) => setFormData({ ...formData, ownerId: v })}
                >
                  <SelectTrigger id="owner">
                    <SelectValue placeholder="Select account owner" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-charcoal-500 mt-1">Primary owner responsible for the relationship</p>
              </div>
              <div>
                <Label htmlFor="manager">Account Manager</Label>
                <Select
                  value={formData.accountManagerId}
                  onValueChange={(v) => setFormData({ ...formData, accountManagerId: v })}
                >
                  <SelectTrigger id="manager">
                    <SelectValue placeholder="Select account manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-charcoal-500 mt-1">Day-to-day manager handling operations</p>
              </div>
            </div>
          </InlinePanelSection>

          <InlinePanelSection title="Account Settings">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="strategic">Strategic Account</Label>
                  <p className="text-xs text-charcoal-500">Mark as key/strategic account with special handling</p>
                </div>
                <Switch
                  id="strategic"
                  checked={formData.isStrategic}
                  onCheckedChange={(checked) => setFormData({ ...formData, isStrategic: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="approval">Requires Submission Approval</Label>
                  <p className="text-xs text-charcoal-500">Manager approval before candidate submission</p>
                </div>
                <Switch
                  id="approval"
                  checked={formData.requiresApprovalForSubmission}
                  onCheckedChange={(checked) => setFormData({ ...formData, requiresApprovalForSubmission: checked })}
                />
              </div>
            </div>
          </InlinePanelSection>

          <InlinePanelSection title="Engagement Preferences">
            <div className="space-y-4">
              <div>
                <Label htmlFor="contactMethod">Preferred Contact Method</Label>
                <Select
                  value={formData.preferredContactMethod}
                  onValueChange={(v) => setFormData({ ...formData, preferredContactMethod: v })}
                >
                  <SelectTrigger id="contactMethod">
                    <SelectValue placeholder="Select contact method" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTACT_METHODS.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="cadence">Meeting Cadence</Label>
                <Select
                  value={formData.meetingCadence}
                  onValueChange={(v) => setFormData({ ...formData, meetingCadence: v })}
                >
                  <SelectTrigger id="cadence">
                    <SelectValue placeholder="Select meeting cadence" />
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
              <div>
                <Label htmlFor="submissionMethod">Submission Method</Label>
                <Select
                  value={formData.submissionMethod}
                  onValueChange={(v) => setFormData({ ...formData, submissionMethod: v })}
                >
                  <SelectTrigger id="submissionMethod">
                    <SelectValue placeholder="Select submission method" />
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
            </div>
          </InlinePanelSection>
        </div>
      </InlinePanel>
    </div>
  )
}

// Team Member Card Component
interface TeamMemberCardProps {
  role: string
  roleIcon: React.ElementType
  roleColor: 'gold' | 'blue' | 'green' | 'purple'
  member: {
    id: string
    full_name: string
    avatar_url: string | null
  } | null
  description: string
}

function TeamMemberCard({ role, roleIcon: RoleIcon, roleColor, member, description }: TeamMemberCardProps) {
  const colorClasses = {
    gold: 'bg-gold-50 text-gold-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          {member ? (
            <Avatar className="w-14 h-14 ring-2 ring-white shadow-md">
              <AvatarImage src={member.avatar_url || undefined} alt={member.full_name} />
              <AvatarFallback className="bg-gold-100 text-gold-700 font-medium">
                {getInitials(member.full_name)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="w-14 h-14 rounded-full bg-charcoal-100 flex items-center justify-center">
              <User className="w-6 h-6 text-charcoal-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className={cn("p-1.5 rounded-md", colorClasses[roleColor])}>
                <RoleIcon className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">{role}</span>
            </div>
            {member ? (
              <p className="font-medium text-charcoal-900 truncate">{member.full_name}</p>
            ) : (
              <p className="text-charcoal-400 italic">Not assigned</p>
            )}
            <p className="text-xs text-charcoal-500 mt-1">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Formatting helpers
function formatContactMethod(method: string | null): string | null {
  if (!method) return null
  const map: Record<string, string> = {
    'email': 'Email',
    'phone': 'Phone',
    'teams': 'Microsoft Teams',
    'slack': 'Slack',
    'in_person': 'In Person',
  }
  return map[method] || method.replace(/_/g, ' ')
}

function formatMeetingCadence(cadence: string | null): string | null {
  if (!cadence) return null
  const map: Record<string, string> = {
    'weekly': 'Weekly',
    'biweekly': 'Bi-weekly',
    'monthly': 'Monthly',
    'quarterly': 'Quarterly',
    'as_needed': 'As Needed',
  }
  return map[cadence] || cadence.replace(/_/g, ' ')
}

function formatSubmissionMethod(method: string | null): string | null {
  if (!method) return null
  const map: Record<string, string> = {
    'email': 'Email',
    'ats': 'Client ATS/VMS',
    'portal': 'Client Portal',
    'direct': 'Direct to Hiring Manager',
  }
  return map[method] || method.replace(/_/g, ' ')
}

export default AccountTeamSection
