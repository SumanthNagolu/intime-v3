'use client'

import * as React from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useTeamWorkspace } from './team/TeamWorkspaceProvider'
import { TeamHeader } from './team/TeamHeader'

// Section components - PCF (same components used in wizard and workspace)
import { TeamOverviewSection } from './team/sections/TeamOverviewSection'
import { TeamIdentitySection } from '@/components/teams/sections/TeamIdentitySection'
import { TeamLocationSection } from '@/components/teams/sections/TeamLocationSection'
import { TeamMembersSection } from '@/components/teams/sections/TeamMembersSection'

// Hooks and mappers for per-section state management
import { useTeamIdentitySection } from '@/components/teams/hooks/useTeamIdentitySection'
import {
  mapToIdentityData,
  mapToLocationData,
  mapToMembersData,
} from '@/lib/teams/mappers'
import { trpc } from '@/lib/trpc/client'
import type { TeamLocationSectionData, TeamMembersSectionData } from '@/lib/teams/types'
import { DEFAULT_LOCATION_DATA, DEFAULT_MEMBERS_DATA } from '@/lib/teams/types'

// Icons for placeholder sections
import { Settings, BarChart3, Briefcase, Building2, Activity, FileText, History } from 'lucide-react'
import type { TeamEntityMember, TeamEntityMetrics, TeamEntityActivity, TeamEntityNote, TeamEntityHistory } from '@/types/workspace'

type TeamSection =
  | 'summary'
  | 'details'
  | 'members'
  | 'roles'
  | 'workload'
  | 'performance'
  | 'accounts'
  | 'jobs'
  | 'activities'
  | 'notes'
  | 'history'

export interface TeamWorkspaceProps {
  onAction?: (action: string) => void
}

/**
 * TeamWorkspace - Main workspace component for Team/Group detail view
 *
 * Following the Account workspace reference implementation:
 * - Gets ALL data from context (provided by layout via ONE database call)
 * - Section switching is pure client-side state
 * - URL sync via searchParams for deep linking
 * - Uses PCF sections (same components as wizard) with view/edit mode support
 * - NOTE: Sidebar is provided by SidebarLayout via EntityJourneySidebar
 */
export function TeamWorkspace({ onAction: _onAction }: TeamWorkspaceProps = {}) {
  const { data, refreshData } = useTeamWorkspace()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get section from URL, default to 'summary'
  const currentSection = (searchParams.get('section') || 'summary') as TeamSection

  // Handle section change - update URL for deep linking
  const handleSectionChange = React.useCallback((section: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('section', section)
    router.push(`?${params.toString()}`, { scroll: false })
  }, [router, searchParams])

  return (
    <div className="w-full max-w-none px-8 py-6 space-y-6 animate-fade-in">
      {/* Header */}
      <TeamHeader team={data.team} />

      {/* Section Content - instant switching, no loading */}
      {currentSection === 'summary' && (
        <TeamOverviewSection
          team={data.team}
          members={data.members}
          accounts={[]} // Would come from data.accounts when implemented
          jobs={[]} // Would come from data.jobs when implemented
          activities={data.activities}
          metrics={data.metrics}
          onNavigate={handleSectionChange}
        />
      )}

      {/* Details Section - PCF Identity + Location */}
      {currentSection === 'details' && (
        <div className="space-y-6">
          <IdentitySectionWrapper
            teamId={data.team.id}
            teamData={data.team}
            onSaveComplete={refreshData}
          />
          <LocationSectionWrapper
            teamId={data.team.id}
            teamData={data.team}
            onSaveComplete={refreshData}
          />
        </div>
      )}

      {/* Members Section - PCF Members */}
      {currentSection === 'members' && (
        <MembersSectionWrapper
          teamId={data.team.id}
          teamData={data.team}
          members={data.members}
          onSaveComplete={refreshData}
        />
      )}

      {currentSection === 'roles' && (
        <TeamRolesSectionPlaceholder />
      )}

      {currentSection === 'workload' && (
        <TeamWorkloadSectionPlaceholder members={data.members} metrics={data.metrics} />
      )}

      {currentSection === 'performance' && (
        <TeamPerformanceSectionPlaceholder metrics={data.metrics} />
      )}

      {currentSection === 'accounts' && (
        <TeamAccountsSectionPlaceholder />
      )}

      {currentSection === 'jobs' && (
        <TeamJobsSectionPlaceholder />
      )}

      {currentSection === 'activities' && (
        <TeamActivitiesSectionPlaceholder activities={data.activities} />
      )}

      {currentSection === 'notes' && (
        <TeamNotesSectionPlaceholder notes={data.notes} />
      )}

      {currentSection === 'history' && (
        <TeamHistorySectionPlaceholder history={data.history} />
      )}
    </div>
  )
}

export default TeamWorkspace

// ============ PCF SECTION WRAPPERS ============
// These wrappers use hooks to manage view/edit state for each section

interface SectionWrapperProps {
  teamId: string
  teamData: unknown // Accept any team data shape, mappers handle conversion
  onSaveComplete?: () => void
}

/**
 * IdentitySectionWrapper - Manages view/edit state for Identity section
 */
function IdentitySectionWrapper({ teamId, teamData, onSaveComplete }: SectionWrapperProps) {
  // Map team data to section format
  const initialData = React.useMemo(() => mapToIdentityData(teamData as Record<string, unknown>), [teamData])

  // Use section hook for state management
  const section = useTeamIdentitySection({
    teamId,
    initialData,
    mode: 'view', // Start in view mode for workspace
    onSaveComplete,
  })

  // Fetch parent groups for dropdown
  const { data: parentGroupsData } = trpc.groups.list.useQuery({ pageSize: 100 })
  const parentGroups = parentGroupsData?.items ?? []

  return (
    <TeamIdentitySection
      mode={section.isEditing ? 'edit' : 'view'}
      data={section.data}
      onChange={section.handleChange}
      onEdit={section.handleEdit}
      onSave={section.handleSave}
      onCancel={section.handleCancel}
      isSaving={section.isSaving}
      errors={section.errors}
      parentGroups={parentGroups as Array<{ id: string; name: string; groupType: string }>}
    />
  )
}

/**
 * LocationSectionWrapper - Manages view/edit state for Location section
 */
function LocationSectionWrapper({ teamId, teamData, onSaveComplete }: SectionWrapperProps) {
  const initialData = React.useMemo(() => mapToLocationData(teamData as Record<string, unknown>), [teamData])
  const [localData, setLocalData] = React.useState<TeamLocationSectionData>(() => ({
    ...DEFAULT_LOCATION_DATA,
    ...initialData,
  }))
  const [isEditing, setIsEditing] = React.useState(false)
  const [originalData, setOriginalData] = React.useState<TeamLocationSectionData | null>(null)

  // Sync with parent data changes
  React.useEffect(() => {
    const newData = mapToLocationData(teamData as Record<string, unknown>)
    setLocalData(prev => ({ ...prev, ...newData }))
  }, [teamData])

  const updateMutation = trpc.groups.update.useMutation()

  const handleChange = React.useCallback((field: string, value: unknown) => {
    setLocalData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleEdit = React.useCallback(() => {
    setOriginalData(localData)
    setIsEditing(true)
  }, [localData])

  const handleCancel = React.useCallback(() => {
    if (originalData) {
      setLocalData(originalData)
    }
    setIsEditing(false)
  }, [originalData])

  const handleSave = React.useCallback(async () => {
    await updateMutation.mutateAsync({
      id: teamId,
      addressLine1: localData.addressLine1 || undefined,
      addressLine2: localData.addressLine2 || undefined,
      city: localData.city || undefined,
      state: localData.state || undefined,
      postalCode: localData.postalCode || undefined,
      country: localData.country || undefined,
    })
    setOriginalData(localData)
    setIsEditing(false)
    onSaveComplete?.()
  }, [teamId, localData, updateMutation, onSaveComplete])

  return (
    <TeamLocationSection
      mode={isEditing ? 'edit' : 'view'}
      data={localData}
      onChange={handleChange}
      onEdit={handleEdit}
      onSave={handleSave}
      onCancel={handleCancel}
      isSaving={updateMutation.isPending}
    />
  )
}

/**
 * MembersSectionWrapper - Manages view/edit state for Members section
 */
function MembersSectionWrapper({
  teamId,
  teamData,
  members: rawMembers,
  onSaveComplete,
}: SectionWrapperProps & { members: unknown[] }) {
  const initialData = React.useMemo(() => mapToMembersData(teamData as Record<string, unknown>), [teamData])

  // Merge member data from context with mapped data
  const membersData = React.useMemo(() => {
    const mapped = { ...DEFAULT_MEMBERS_DATA, ...initialData }
    // If rawMembers is provided, map it to section format
    if (rawMembers?.length > 0) {
      mapped.members = (rawMembers as Array<Record<string, unknown>>).map((m) => ({
        id: (m.id as string) || '',
        userId: (m.userId as string) || (m.user_id as string) || '',
        fullName: (m.fullName as string) || (m.user as { fullName?: string })?.fullName || 'Unknown',
        email: (m.email as string) || (m.user as { email?: string })?.email || null,
        avatarUrl: (m.avatarUrl as string) || (m.user as { avatarUrl?: string })?.avatarUrl || null,
        isManager: (m.isManager as boolean) ?? (m.is_manager as boolean) ?? false,
        isActive: (m.isActive as boolean) ?? (m.is_active as boolean) ?? true,
        loadFactor: (m.loadFactor as number) ?? (m.load_factor as number) ?? 100,
        loadPermission: ((m.loadPermission || m.load_permission || 'normal') as 'normal' | 'reduced' | 'exempt'),
        vacationStatus: ((m.vacationStatus || m.vacation_status || 'available') as 'available' | 'vacation' | 'sick' | 'leave'),
        backupUserId: (m.backupUserId as string) || (m.backup_user_id as string) || null,
        joinedAt: (m.joinedAt as string) || (m.joined_at as string) || null,
        leftAt: (m.leftAt as string) || (m.left_at as string) || null,
      }))
    }
    return mapped
  }, [initialData, rawMembers])

  const [localData, setLocalData] = React.useState<TeamMembersSectionData>(membersData)
  const [isEditing, setIsEditing] = React.useState(false)
  const [originalData, setOriginalData] = React.useState<TeamMembersSectionData | null>(null)

  // Sync with parent data changes
  React.useEffect(() => {
    setLocalData(membersData)
  }, [membersData])

  const updateMutation = trpc.groups.update.useMutation()

  const handleChange = React.useCallback((field: string, value: unknown) => {
    setLocalData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleEdit = React.useCallback(() => {
    setOriginalData(localData)
    setIsEditing(true)
  }, [localData])

  const handleCancel = React.useCallback(() => {
    if (originalData) {
      setLocalData(originalData)
    }
    setIsEditing(false)
  }, [originalData])

  const handleSave = React.useCallback(async () => {
    await updateMutation.mutateAsync({
      id: teamId,
      managerId: localData.managerId || undefined,
      supervisorId: localData.supervisorId || undefined,
    })
    setOriginalData(localData)
    setIsEditing(false)
    onSaveComplete?.()
  }, [teamId, localData, updateMutation, onSaveComplete])

  const handleAddMember = React.useCallback(() => {
    // TODO: Open add member dialog
    console.log('Add member clicked')
  }, [])

  const handleEditMember = React.useCallback((memberId: string) => {
    // TODO: Open edit member dialog
    console.log('Edit member clicked:', memberId)
  }, [])

  return (
    <TeamMembersSection
      mode={isEditing ? 'edit' : 'view'}
      data={localData}
      onChange={handleChange}
      onEdit={handleEdit}
      onSave={handleSave}
      onCancel={handleCancel}
      onAddMember={handleAddMember}
      onEditMember={handleEditMember}
      isSaving={updateMutation.isPending}
    />
  )
}

// ============ PLACEHOLDER SECTION COMPONENTS ============
// These will be replaced with full PCF implementations in future phases

interface PlaceholderSectionProps {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

function PlaceholderSection({ title, description, icon: Icon }: PlaceholderSectionProps) {
  return (
    <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm p-8 text-center">
      <div className="w-12 h-12 rounded-lg bg-charcoal-100 flex items-center justify-center mx-auto mb-4">
        <Icon className="h-6 w-6 text-charcoal-500" />
      </div>
      <h3 className="text-lg font-semibold text-charcoal-900 mb-2">{title}</h3>
      <p className="text-sm text-charcoal-500">{description}</p>
    </div>
  )
}

function TeamRolesSectionPlaceholder() {
  return (
    <PlaceholderSection
      title="Roles & Permissions"
      description="Configure team roles and access control settings. This section will be implemented in a future phase."
      icon={Settings}
    />
  )
}

function TeamWorkloadSectionPlaceholder({ members, metrics }: { members: TeamEntityMember[]; metrics: TeamEntityMetrics }) {
  const activeMembers = members.filter(m => m.isActive)
  return (
    <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-charcoal-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-charcoal-600" />
          </div>
          <div>
            <h3 className="font-semibold text-charcoal-900">Workload Distribution</h3>
            <p className="text-xs text-charcoal-500">Average load factor: {metrics.avgLoadFactor}%</p>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {activeMembers.map((member) => (
            <div key={member.id} className="flex items-center gap-4">
              <span className="text-sm text-charcoal-700 w-40 truncate">{member.fullName}</span>
              <div className="flex-1 h-2 bg-charcoal-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    member.loadFactor > 80 ? 'bg-error-500' :
                    member.loadFactor > 60 ? 'bg-amber-500' : 'bg-success-500'
                  }`}
                  style={{ width: `${Math.min(member.loadFactor, 100)}%` }}
                />
              </div>
              <span className="text-sm font-medium text-charcoal-900 w-12 text-right">
                {member.loadFactor}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TeamPerformanceSectionPlaceholder({ metrics }: { metrics: TeamEntityMetrics }) {
  return (
    <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-charcoal-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-charcoal-600" />
          </div>
          <div>
            <h3 className="font-semibold text-charcoal-900">Team Performance</h3>
            <p className="text-xs text-charcoal-500">Month-to-date metrics</p>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-3 gap-6">
          <div className="p-4 bg-charcoal-50 rounded-lg">
            <p className="text-[11px] font-medium text-charcoal-500 uppercase tracking-wider mb-1">Placements MTD</p>
            <p className="text-2xl font-bold text-charcoal-900">{metrics.placementsMTD}</p>
          </div>
          <div className="p-4 bg-charcoal-50 rounded-lg">
            <p className="text-[11px] font-medium text-charcoal-500 uppercase tracking-wider mb-1">Submissions MTD</p>
            <p className="text-2xl font-bold text-charcoal-900">{metrics.submissionsMTD}</p>
          </div>
          <div className="p-4 bg-charcoal-50 rounded-lg">
            <p className="text-[11px] font-medium text-charcoal-500 uppercase tracking-wider mb-1">Activities Completed</p>
            <p className="text-2xl font-bold text-charcoal-900">{metrics.activitiesCompletedMTD}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function TeamAccountsSectionPlaceholder() {
  return (
    <PlaceholderSection
      title="Assigned Accounts"
      description="View accounts assigned to this team. This section will be populated with account data."
      icon={Building2}
    />
  )
}

function TeamJobsSectionPlaceholder() {
  return (
    <PlaceholderSection
      title="Assigned Jobs"
      description="View jobs assigned to this team. This section will be populated with job data."
      icon={Briefcase}
    />
  )
}

function TeamActivitiesSectionPlaceholder({ activities }: { activities: TeamEntityActivity[] }) {
  return (
    <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-charcoal-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
            <Activity className="h-5 w-5 text-charcoal-600" />
          </div>
          <div>
            <h3 className="font-semibold text-charcoal-900">Activities</h3>
            <p className="text-xs text-charcoal-500">{activities.length} activities</p>
          </div>
        </div>
      </div>
      {activities.length > 0 ? (
        <div className="divide-y divide-charcoal-100">
          {activities.slice(0, 10).map((activity) => (
            <div key={activity.id} className="px-6 py-4 hover:bg-charcoal-50 transition-colors">
              <p className="font-medium text-charcoal-900">{activity.subject}</p>
              <p className="text-xs text-charcoal-500 mt-1">{activity.type} - {activity.status}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-6 py-8 text-center">
          <Activity className="h-8 w-8 text-charcoal-300 mx-auto mb-2" />
          <p className="text-sm text-charcoal-500">No activities</p>
        </div>
      )}
    </div>
  )
}

function TeamNotesSectionPlaceholder({ notes }: { notes: TeamEntityNote[] }) {
  return (
    <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-charcoal-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
            <FileText className="h-5 w-5 text-charcoal-600" />
          </div>
          <div>
            <h3 className="font-semibold text-charcoal-900">Notes</h3>
            <p className="text-xs text-charcoal-500">{notes.length} notes</p>
          </div>
        </div>
      </div>
      {notes.length > 0 ? (
        <div className="divide-y divide-charcoal-100">
          {notes.slice(0, 10).map((note) => (
            <div key={note.id} className="px-6 py-4 hover:bg-charcoal-50 transition-colors">
              <p className="font-medium text-charcoal-900">{note.title || 'Untitled'}</p>
              <p className="text-sm text-charcoal-600 mt-1 line-clamp-2">{note.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-6 py-8 text-center">
          <FileText className="h-8 w-8 text-charcoal-300 mx-auto mb-2" />
          <p className="text-sm text-charcoal-500">No notes</p>
        </div>
      )}
    </div>
  )
}

function TeamHistorySectionPlaceholder({ history }: { history: TeamEntityHistory[] }) {
  return (
    <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-charcoal-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
            <History className="h-5 w-5 text-charcoal-600" />
          </div>
          <div>
            <h3 className="font-semibold text-charcoal-900">History</h3>
            <p className="text-xs text-charcoal-500">{history.length} events</p>
          </div>
        </div>
      </div>
      {history.length > 0 ? (
        <div className="divide-y divide-charcoal-100">
          {history.slice(0, 10).map((entry) => (
            <div key={entry.id} className="px-6 py-4 hover:bg-charcoal-50 transition-colors">
              <p className="font-medium text-charcoal-900">{entry.changeType}</p>
              <p className="text-xs text-charcoal-500 mt-1">
                {entry.field && `${entry.field}: `}
                {entry.oldValue && `${entry.oldValue} → `}{entry.newValue}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-6 py-8 text-center">
          <History className="h-8 w-8 text-charcoal-300 mx-auto mb-2" />
          <p className="text-sm text-charcoal-500">No history</p>
        </div>
      )}
    </div>
  )
}

