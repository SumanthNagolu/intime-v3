'use client'

import * as React from 'react'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  UserCog, Users, Crown, Briefcase, Phone,
} from 'lucide-react'
import type { AccountData } from '@/types/workspace'
import { useAccountWorkspace } from '../AccountWorkspaceProvider'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'
import {
  UnifiedSection,
  InfoCard,
  InfoRow,
  CardsGrid,
  EditPanelSection,
} from '@/components/pcf/sections/UnifiedSection'
import { UserCard } from '@/components/ui/user-display'
import { formatSnakeCase } from '@/lib/formatters'

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
  const { refreshData } = useAccountWorkspace()
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

  // Get users for select options
  const users: Array<{ id: string; full_name: string | null; email: string }> = usersQuery.data?.items || []

  return (
    <UnifiedSection
      title="Team Assignments"
      description="Account ownership and team member assignments"
      icon={UserCog}
      isEditing={isEditing}
      setIsEditing={setIsEditing}
      editContent={
        <div className="space-y-6">
          <EditPanelSection title="Team Assignments">
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
          </EditPanelSection>

          <EditPanelSection title="Account Settings">
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
          </EditPanelSection>

          <EditPanelSection title="Engagement Preferences">
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
          </EditPanelSection>
        </div>
      }
      editPanel={{
        title: 'Edit Team Settings',
        description: 'Update team assignments and engagement preferences',
        width: 'lg',
        onSave: handleSave,
        isSaving: updateMutation.isPending,
      }}
    >
      {/* Team Members Grid */}
      <CardsGrid columns={2}>
        {/* Account Owner */}
        <UserCard
          user={account.owner ? {
            name: account.owner.full_name,
            avatarUrl: account.owner.avatar_url,
          } : null}
          role="Account Owner"
          description="Primary owner responsible for the account relationship"
          icon={Crown}
          iconBg="bg-charcoal-100"
          iconColor="text-charcoal-600"
          showStatus={false}
        />

        {/* Account Manager */}
        <UserCard
          user={account.account_manager ? {
            name: account.account_manager.full_name,
            avatarUrl: account.account_manager.avatar_url,
          } : null}
          role="Account Manager"
          description="Day-to-day manager handling account operations"
          icon={Briefcase}
          iconBg="bg-charcoal-100"
          iconColor="text-charcoal-600"
          showStatus={false}
        />
      </CardsGrid>

      {/* Additional Team Info */}
      <InfoCard
        title="Team Settings"
        icon={Users}
        iconBg="bg-charcoal-100"
        iconColor="text-charcoal-600"
        className="mt-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <InfoRow
              label="Submission Approval"
              value={account.requires_approval_for_submission ? 'Required' : 'Not Required'}
              badge={true}
              badgeVariant={account.requires_approval_for_submission ? 'warning' : 'secondary'}
            />
            <p className="text-xs text-charcoal-400 mt-1">
              {account.requires_approval_for_submission
                ? 'Submissions require manager approval before sending to client'
                : 'Team members can submit candidates directly'}
            </p>
          </div>
          <div>
            <InfoRow
              label="Strategic Account"
              value={account.is_strategic ? 'Yes' : 'No'}
              badge={true}
              badgeVariant={account.is_strategic ? 'success' : 'secondary'}
            />
            <p className="text-xs text-charcoal-400 mt-1">
              {account.is_strategic
                ? 'This is a strategic/key account with special handling'
                : 'Standard account handling'}
            </p>
          </div>
        </div>
      </InfoCard>

      {/* Contact Preferences */}
      <InfoCard
        title="Engagement Preferences"
        icon={Phone}
        iconBg="bg-charcoal-100"
        iconColor="text-charcoal-600"
        className="mt-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoRow
            label="Preferred Contact Method"
            value={account.preferred_contact_method ? formatSnakeCase(account.preferred_contact_method) : null}
          />
          <InfoRow
            label="Meeting Cadence"
            value={account.meeting_cadence ? formatSnakeCase(account.meeting_cadence) : null}
          />
          <InfoRow
            label="Submission Method"
            value={account.submission_method ? formatSnakeCase(account.submission_method) : null}
          />
        </div>
      </InfoCard>
    </UnifiedSection>
  )
}

export default AccountTeamSection
