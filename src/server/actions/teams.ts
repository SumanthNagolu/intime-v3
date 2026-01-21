'use server'

import { getServerCaller } from '@/server/trpc/server-caller'
import type { FullTeamEntityData, TeamEntityData } from '@/types/workspace'

/**
 * Fetches all team (group) data in ONE database round-trip.
 * This follows the ONE DB CALL pattern for entity workspaces.
 */
export async function getFullTeam(id: string): Promise<FullTeamEntityData | null> {
  try {
    const caller = await getServerCaller()
    const group = await caller.groups.getFullGroup({ id })

    if (!group) return null

    // Transform the raw group data to match FullTeamEntityData type
    return transformGroupToTeam(group)
  } catch (error) {
    console.error('[getFullTeam] Error fetching team:', error)
    return null
  }
}

// Helper to extract first item from array (Supabase relations)
function extractFirst<T>(data: T | T[] | null | undefined): T | null {
  if (!data) return null
  if (Array.isArray(data)) return data[0] || null
  return data
}

/**
 * Transform raw group data to FullTeamEntityData format
 */
function transformGroupToTeam(group: Record<string, unknown>): FullTeamEntityData {
  // Transform members
  const rawMembers = (group.members || []) as Array<{
    id: string
    user_id: string
    is_manager: boolean
    is_active: boolean
    load_factor: number | null
    load_permission: string | null
    vacation_status: string | null
    backup_user_id: string | null
    joined_at: string | null
    left_at: string | null
    user: {
      id: string
      full_name: string | null
      email: string | null
      avatar_url: string | null
      role_id: string | null
    } | null
  }>

  const members = rawMembers
    .filter(m => m.is_active)
    .map(m => {
      const user = extractFirst(m.user as typeof m.user | typeof m.user[])
      return {
        id: m.id,
        userId: m.user_id,
        fullName: user?.full_name || 'Unknown',
        email: user?.email || null,
        avatarUrl: user?.avatar_url || null,
        isManager: m.is_manager,
        isActive: m.is_active,
        loadFactor: m.load_factor ?? 100,
        loadPermission: (m.load_permission as 'normal' | 'reduced' | 'exempt') || 'normal',
        vacationStatus: (m.vacation_status as 'available' | 'vacation' | 'sick' | 'leave') || 'available',
        backupUserId: m.backup_user_id,
        joinedAt: m.joined_at,
        leftAt: m.left_at,
      }
    })

  // Transform supervisor and manager
  const supervisor = extractFirst(group.supervisor as {
    id: string
    full_name: string | null
    email: string | null
    avatar_url: string | null
  } | null)

  const manager = extractFirst(group.manager as {
    id: string
    full_name: string | null
    email: string | null
    avatar_url: string | null
  } | null)

  // Transform parent group
  const parent = group.parent as {
    id: string
    name: string
    group_type: string
  } | null

  // Transform regions
  const rawRegions = (group.regions || []) as Array<{
    id: string
    region_id: string
    is_primary: boolean
    is_active: boolean
    region: { id: string; name: string; code: string | null } | null
  }>

  const regions = rawRegions
    .filter(r => r.is_active)
    .map(r => {
      const region = extractFirst(r.region as typeof r.region | typeof r.region[])
      return {
        id: r.id,
        regionId: r.region_id,
        name: region?.name || 'Unknown',
        code: region?.code || null,
        isPrimary: r.is_primary,
      }
    })

  // Get children count from sections
  const sections = group.sections as {
    children?: { items: unknown[]; total: number }
    activity?: { items: unknown[]; total: number }
  } | undefined

  const childrenCount = sections?.children?.total ?? 0

  // Build the team entity data
  const team: TeamEntityData = {
    id: group.id as string,
    name: group.name as string,
    code: (group.code as string) || null,
    description: (group.description as string) || null,
    groupType: (group.groupType as 'root' | 'division' | 'branch' | 'team' | 'satellite_office' | 'producer') || 'team',
    parentGroupId: (group.parentGroupId as string) || null,
    hierarchyLevel: (group.hierarchyLevel as number) ?? 0,
    hierarchyPath: (group.hierarchyPath as string) || null,
    securityZone: (group.securityZone as string) || 'default',
    supervisorId: (group.supervisorId as string) || null,
    managerId: (group.managerId as string) || null,
    loadFactor: (group.loadFactor as number) ?? 100,
    isActive: (group.isActive as boolean) ?? true,
    // Contact info
    phone: (group.phone as string) || null,
    fax: (group.fax as string) || null,
    email: (group.email as string) || null,
    // Address
    address_line1: (group.address_line1 as string) || null,
    address_line2: (group.address_line2 as string) || null,
    city: (group.city as string) || null,
    state: (group.state as string) || null,
    postal_code: (group.postal_code as string) || null,
    country: (group.country as string) || null,
    // Timestamps
    createdAt: group.createdAt as string,
    updatedAt: (group.updatedAt as string) || null,
    createdBy: null, // Would need additional query to fetch creator info
    // Relationships
    parentGroup: parent ? {
      id: parent.id,
      name: parent.name,
      groupType: parent.group_type as 'root' | 'division' | 'branch' | 'team' | 'satellite_office' | 'producer',
    } : null,
    supervisor: supervisor ? {
      id: supervisor.id,
      fullName: supervisor.full_name || 'Unknown',
      email: supervisor.email || null,
      avatarUrl: supervisor.avatar_url || null,
    } : null,
    manager: manager ? {
      id: manager.id,
      fullName: manager.full_name || 'Unknown',
      email: manager.email || null,
      avatarUrl: manager.avatar_url || null,
    } : null,
  }

  // Calculate metrics
  const activeMembers = members.filter(m => m.isActive)
  const membersOnVacation = activeMembers.filter(m =>
    m.vacationStatus === 'vacation' || m.vacationStatus === 'sick' || m.vacationStatus === 'leave'
  ).length
  const avgLoadFactor = activeMembers.length > 0
    ? Math.round(activeMembers.reduce((sum, m) => sum + m.loadFactor, 0) / activeMembers.length)
    : 100

  // Metrics matching TeamEntityMetrics interface
  const metrics = {
    // Team size
    totalMembers: rawMembers.length,
    activeMembers: activeMembers.length,
    // Work stats (placeholder values - would need additional queries)
    openJobs: 0,
    openActivities: 0,
    activeSubmissions: 0,
    activePlacements: 0,
    // Performance (current month)
    placementsMTD: 0,
    submissionsMTD: 0,
    activitiesCompletedMTD: 0,
    // Workload
    avgLoadFactor,
    membersOnVacation,
  }

  // Return the full team data structure
  return {
    team,
    members,
    regions,
    metrics,
    // Section counts for sidebar badges
    sectionCounts: {
      members: activeMembers.length,
      accounts: 0, // Would need additional query
      jobs: 0, // Would need additional query
      activities: 0, // Would need additional query
      notes: 0, // Would need additional query
    },
    // Tool sections (empty for now - would need additional queries)
    activities: [],
    notes: [],
    history: [],
  }
}
