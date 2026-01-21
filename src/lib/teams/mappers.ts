/**
 * Team Data Mappers
 *
 * Functions to map API response data to section-specific data types.
 * Used by both wizard and workspace to transform team/group data for sections.
 */

import type {
  TeamIdentitySectionData,
  TeamLocationSectionData,
  TeamMembersSectionData,
  TeamSettingsSectionData,
  TeamMember,
  TeamRegion,
  GroupType,
  LoadPermission,
  VacationStatus,
} from './types'
import { DEFAULT_PHONE } from './types'
import type { PhoneInputValue } from '@/components/ui/phone-input'

/**
 * Parse phone value from string or object format
 */
function parsePhone(phone: unknown): PhoneInputValue {
  if (!phone) return { ...DEFAULT_PHONE }

  // If already an object with the right shape
  if (typeof phone === 'object' && phone !== null) {
    const p = phone as Record<string, unknown>
    return {
      countryCode: ((p.countryCode as string) || 'US') as PhoneInputValue['countryCode'],
      number: (p.number as string) || '',
    }
  }

  // If it's a string, assume US country code
  if (typeof phone === 'string') {
    return {
      countryCode: 'US',
      number: phone.replace(/^\+1\s?/, ''), // Remove +1 prefix if present
    }
  }

  return { ...DEFAULT_PHONE }
}

/**
 * Map team/group data to TeamIdentitySectionData
 */
export function mapToIdentityData(team: Record<string, unknown>): TeamIdentitySectionData {
  // Handle both camelCase and snake_case field names
  const groupType = (team.groupType || team.group_type || 'team') as GroupType
  const parentGroupId = (team.parentGroupId || team.parent_group_id || '') as string
  const parentGroup = team.parentGroup || team.parent_group

  return {
    name: (team.name as string) || '',
    code: (team.code as string) || '',
    description: (team.description as string) || '',
    groupType,
    isActive: team.isActive !== undefined ? (team.isActive as boolean) : (team.is_active as boolean) ?? true,
    parentGroupId,
    parentGroupName: parentGroup ? (parentGroup as { name: string }).name : undefined,
    securityZone: (team.securityZone || team.security_zone || 'default') as string,
    email: (team.email as string) || '',
    phone: parsePhone(team.phone),
    fax: (team.fax as string) || '',
    loadFactor: (team.loadFactor ?? team.load_factor ?? 100) as number,
  }
}

/**
 * Map team/group data to TeamLocationSectionData
 */
export function mapToLocationData(team: Record<string, unknown>): TeamLocationSectionData {
  // Handle regions array
  const rawRegions = (team.regions || []) as Array<{
    id: string
    region_id?: string
    regionId?: string
    is_primary?: boolean
    isPrimary?: boolean
    region?: { id: string; name: string; code: string | null }
    name?: string
    code?: string
  }>

  const regions: TeamRegion[] = rawRegions.map(r => ({
    id: r.id,
    regionId: r.regionId || r.region_id || r.id,
    name: r.region?.name || r.name || 'Unknown',
    code: r.region?.code || r.code || null,
    isPrimary: r.isPrimary ?? r.is_primary ?? false,
  }))

  return {
    addressLine1: (team.address_line1 || team.addressLine1 || '') as string,
    addressLine2: (team.address_line2 || team.addressLine2 || '') as string,
    city: (team.city as string) || '',
    state: (team.state as string) || '',
    postalCode: (team.postal_code || team.postalCode || '') as string,
    country: (team.country as string) || 'US',
    regions,
  }
}

/**
 * Map team/group data to TeamMembersSectionData
 */
export function mapToMembersData(team: Record<string, unknown>): TeamMembersSectionData {
  // Handle members array
  const rawMembers = (team.members || []) as Array<{
    id: string
    user_id?: string
    userId?: string
    is_manager?: boolean
    isManager?: boolean
    is_active?: boolean
    isActive?: boolean
    load_factor?: number
    loadFactor?: number
    load_permission?: string
    loadPermission?: string
    vacation_status?: string
    vacationStatus?: string
    backup_user_id?: string
    backupUserId?: string
    joined_at?: string
    joinedAt?: string
    left_at?: string
    leftAt?: string
    user?: {
      id: string
      full_name?: string
      fullName?: string
      email?: string
      avatar_url?: string
      avatarUrl?: string
    }
    fullName?: string
    email?: string
    avatarUrl?: string
  }>

  const members: TeamMember[] = rawMembers.map(m => {
    const user = m.user
    return {
      id: m.id,
      userId: m.userId || m.user_id || '',
      fullName: user?.fullName || user?.full_name || m.fullName || 'Unknown',
      email: user?.email || m.email || null,
      avatarUrl: user?.avatarUrl || user?.avatar_url || m.avatarUrl || null,
      isManager: m.isManager ?? m.is_manager ?? false,
      isActive: m.isActive ?? m.is_active ?? true,
      loadFactor: m.loadFactor ?? m.load_factor ?? 100,
      loadPermission: (m.loadPermission || m.load_permission || 'normal') as LoadPermission,
      vacationStatus: (m.vacationStatus || m.vacation_status || 'available') as VacationStatus,
      backupUserId: m.backupUserId || m.backup_user_id || null,
      joinedAt: m.joinedAt || m.joined_at || null,
      leftAt: m.leftAt || m.left_at || null,
    }
  })

  // Get manager and supervisor
  const manager = team.manager as { id: string; fullName?: string; full_name?: string } | undefined
  const supervisor = team.supervisor as { id: string; fullName?: string; full_name?: string } | undefined

  return {
    members,
    managerId: (team.managerId || team.manager_id || manager?.id || '') as string,
    managerName: manager?.fullName || manager?.full_name,
    supervisorId: (team.supervisorId || team.supervisor_id || supervisor?.id || '') as string,
    supervisorName: supervisor?.fullName || supervisor?.full_name,
  }
}

/**
 * Map team/group data to TeamSettingsSectionData
 */
export function mapToSettingsData(team: Record<string, unknown>): TeamSettingsSectionData {
  // Settings might be stored as a JSON field or individual fields
  const settings = team.settings as Record<string, unknown> | undefined

  return {
    requiresApprovalForSubmission:
      (settings?.requiresApprovalForSubmission ??
        team.requires_approval_for_submission ??
        team.requiresApprovalForSubmission ??
        false) as boolean,
    autoAssignNewJobs:
      (settings?.autoAssignNewJobs ?? team.auto_assign_new_jobs ?? team.autoAssignNewJobs ?? false) as boolean,
    defaultLoadPermission:
      ((settings?.defaultLoadPermission ??
        team.default_load_permission ??
        team.defaultLoadPermission ??
        'normal') as LoadPermission),
    allowSelfService:
      (settings?.allowSelfService ?? team.allow_self_service ?? team.allowSelfService ?? true) as boolean,
    notifyOnNewAssignment:
      (settings?.notifyOnNewAssignment ?? team.notify_on_new_assignment ?? team.notifyOnNewAssignment ?? true) as boolean,
    notifyOnCapacityChange:
      (settings?.notifyOnCapacityChange ?? team.notify_on_capacity_change ?? team.notifyOnCapacityChange ?? true) as boolean,
  }
}

/**
 * Map identity section data back to API format
 */
export function mapIdentityToApi(data: TeamIdentitySectionData): Record<string, unknown> {
  return {
    name: data.name || undefined,
    code: data.code || undefined,
    description: data.description || undefined,
    group_type: data.groupType,
    is_active: data.isActive,
    parent_group_id: data.parentGroupId || undefined,
    security_zone: data.securityZone || undefined,
    email: data.email || undefined,
    phone: data.phone.number ? data.phone : undefined,
    fax: data.fax || undefined,
    load_factor: data.loadFactor,
  }
}

/**
 * Map location section data back to API format
 */
export function mapLocationToApi(data: TeamLocationSectionData): Record<string, unknown> {
  return {
    address_line1: data.addressLine1 || undefined,
    address_line2: data.addressLine2 || undefined,
    city: data.city || undefined,
    state: data.state || undefined,
    postal_code: data.postalCode || undefined,
    country: data.country || undefined,
    // Regions are handled separately via junction table mutations
  }
}

/**
 * Map members section data back to API format
 */
export function mapMembersToApi(data: TeamMembersSectionData): Record<string, unknown> {
  return {
    manager_id: data.managerId || undefined,
    supervisor_id: data.supervisorId || undefined,
    // Individual member updates are handled via separate mutations
  }
}

/**
 * Map settings section data back to API format
 */
export function mapSettingsToApi(data: TeamSettingsSectionData): Record<string, unknown> {
  return {
    requires_approval_for_submission: data.requiresApprovalForSubmission,
    auto_assign_new_jobs: data.autoAssignNewJobs,
    default_load_permission: data.defaultLoadPermission,
    allow_self_service: data.allowSelfService,
    notify_on_new_assignment: data.notifyOnNewAssignment,
    notify_on_capacity_change: data.notifyOnCapacityChange,
  }
}
