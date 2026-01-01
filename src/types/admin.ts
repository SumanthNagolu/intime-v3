/**
 * Admin Module Types
 *
 * Type definitions for admin screens including Users, Roles, and Groups
 * following the Guidewire PolicyCenter-inspired patterns.
 */

// ============================================
// USER TYPES
// ============================================

export interface UserRole {
  id: string
  name: string
  display_name: string
  code: string
  category: string
  color_code?: string
  description?: string
}

export interface UserManager {
  id: string
  full_name: string
  email: string
  avatar_url?: string
}

export interface UserPod {
  id: string
  name: string
  pod_type: string
  status: string
}

export interface UserPodMembership {
  id: string
  pod_id: string
  role: string
  is_active: boolean
  joined_at?: string
  pod: UserPod
}

export interface UserAttribute {
  id: string
  key: string
  value: string
}

export interface UserRegion {
  id: string
  name: string
  code: string
  type?: string
  parent_name?: string
}

export interface UserAuthority {
  approval_limit: number | null
  can_approve_expenses: boolean
  financial_limits?: {
    expense_approval: number
    po_approval: number
    contract_signing: number
  }
  operational_limits?: {
    max_direct_reports: number
    max_contractors: number
    hiring_authority: boolean
    termination_authority: boolean
  }
}

export interface RoleAssignment {
  id: string
  role_id: string
  role?: UserRole
  assigned_at?: string
  expires_at?: string
  assigned_by?: string
  assigned_by_user?: {
    id: string
    full_name: string
  }
}

export interface RegionAssignment {
  id: string
  region_id: string
  region?: UserRegion
  is_primary?: boolean
}

export interface AuthorityLimit {
  id: string
  type: string
  value: number
  is_monetary: boolean
  scope?: string
  expires_at?: string
}

export interface OfficeLocation {
  id: string
  name: string
  address: string
  is_primary: boolean
}

export interface UserProfile {
  avatar_url?: string | null
  bio?: string | null
  timezone?: string
  locale?: string
}

export interface UserPreferences {
  email_notifications: boolean
  push_notifications: boolean
  sms_notifications: boolean
  dark_mode: boolean
  compact_view: boolean
}

export interface PendingApproval {
  id: string
  type: string
  description: string
  amount: number
  created_at: string
}

export interface UserAccess {
  security_zones: string[]
  access_levels: string[]
}

export interface AuditLogEntry {
  id: string
  action: string
  table_name: string
  record_id: string
  created_at: string
  old_values?: Record<string, unknown>
  new_values?: Record<string, unknown>
}

export interface LoginHistoryEntry {
  id: string
  success: boolean
  ip_address?: string
  user_agent?: string
  failure_reason?: string
  created_at: string
}

/**
 * Full user data for detail pages - includes all tab data
 */
export interface FullUserData {
  id: string
  email: string
  full_name: string
  first_name: string | null
  last_name: string | null
  phone?: string
  avatar_url?: string
  status: 'pending' | 'active' | 'suspended' | 'deactivated'
  is_active: boolean
  is_locked?: boolean
  is_external?: boolean
  user_type?: string | null
  role_id?: string
  role?: UserRole | null
  manager_id?: string
  manager?: UserManager | null
  start_date?: string
  last_login_at?: string
  two_factor_enabled: boolean
  password_changed_at?: string
  created_at: string
  updated_at: string
  // Profile tab fields
  title?: string
  department?: string
  profile?: UserProfile
  preferences?: UserPreferences
  // Relations
  pod_memberships?: UserPodMembership[]
  organization?: { id: string; name: string } | null
  // Region tab fields
  primary_region?: UserRegion | null
  office_locations?: OfficeLocation[]
  // Tabs data
  attributes?: UserAttribute[]
  access?: UserAccess
  regions?: UserRegion[]
  authority?: UserAuthority
  // Sections data (from getFullUser)
  sections?: {
    activity: {
      items: AuditLogEntry[]
      total: number
    }
    loginHistory: {
      items: LoginHistoryEntry[]
      total: number
    }
    roleAssignments?: {
      items: RoleAssignment[]
      total: number
    }
    regionAssignments?: {
      items: RegionAssignment[]
      total: number
    }
    authorityLimits?: {
      items: AuthorityLimit[]
      total: number
    }
    pendingApprovals?: {
      items: PendingApproval[]
      total: number
    }
  }
}

/**
 * User search filters - 8 fields per Guidewire spec
 */
export interface UserSearchFilters {
  username?: string // email
  firstName?: string
  lastName?: string
  groupName?: string // pod name
  unassigned?: boolean // users without pod
  userType?: string
  roleId?: string
  organizationId?: string
  page?: number
  pageSize?: number
}

/**
 * User list item - minimal data for list view
 */
export interface UserListItem {
  id: string
  full_name: string
  email: string
  phone?: string
  avatar_url?: string
  status: string
  is_active: boolean
  role_id?: string
  role?: UserRole
  pod_memberships?: UserPodMembership[]
  last_login_at?: string
  created_at: string
}

// ============================================
// ROLE TYPES
// ============================================

export interface RolePermission {
  id: string
  code: string
  name: string
  description?: string
  module: string
  resource: string
  action: string
}

export interface RoleUser {
  id: string
  full_name: string
  email: string
  avatar_url?: string
  status: string
}

/**
 * Full role data for detail pages - includes all tab data
 */
export interface FullRoleData {
  id: string
  code: string
  name: string
  display_name: string
  description?: string
  category: string
  hierarchy_level: number
  color_code?: string
  is_active: boolean
  is_system_role: boolean
  created_at: string
  updated_at: string
  // Tabs data
  permissions: RolePermission[]
  users: RoleUser[]
}

// ============================================
// GROUP (POD) TYPES
// ============================================

export interface GroupManager {
  id: string
  full_name: string
  email: string
  avatar_url?: string
}

export interface GroupMember {
  id: string
  user_id: string
  role: string
  is_active: boolean
  joined_at?: string
  user: {
    id: string
    full_name: string
    email: string
    avatar_url?: string
  }
}

export interface GroupQueue {
  id: string
  name: string
  type: string
  item_count: number
}

export interface GroupProducerCode {
  id: string
  code: string
  description?: string
  is_active: boolean
}

export interface GroupRegion {
  id: string
  name: string
  code: string
}

/**
 * Full group/pod data for detail pages - includes all tab data
 */
export interface FullGroupData {
  id: string
  name: string
  description?: string
  pod_type: string
  status: string
  formed_date?: string
  dissolved_date?: string
  region_id?: string
  manager_id?: string
  created_at: string
  updated_at: string
  // Relations
  manager?: GroupManager | null
  region?: GroupRegion | null
  // Tabs data
  members: GroupMember[]
  queues: GroupQueue[]
  producerCodes: GroupProducerCode[]
  regions: GroupRegion[]
  // Sections data
  sections?: {
    metrics: {
      sprintMetrics: unknown
      openJobs: number
      submissionsMtd: number
      placementsMtd: number
      revenueMtd: number
    }
    activity: {
      items: AuditLogEntry[]
      total: number
    }
  }
}

// ============================================
// FILTER OPTIONS
// ============================================

export interface AdminFilterOptions {
  roles: Array<{
    id: string
    code: string
    name: string
    display_name: string
    category: string
  }>
  pods: Array<{
    id: string
    name: string
    pod_type: string
    status: string
  }>
  userTypes?: Array<{
    value: string
    label: string
  }>
}

// ============================================
// STATS
// ============================================

export interface UserStats {
  total: number
  active: number
  pending: number
  suspended: number
  deactivated: number
}

export interface GroupStats {
  total: number
  active: number
  avgSize: number
  totalMembers: number
}

// ============================================
// GUIDEWIRE-STYLE GROUPS (Organizational Hierarchy)
// ============================================

export type GroupType = 'root' | 'division' | 'branch' | 'team' | 'satellite_office' | 'producer'

export interface OrgGroupMember {
  id: string
  user_id: string
  is_manager: boolean
  is_active: boolean
  load_factor: number
  load_permission: string
  vacation_status: string
  backup_user_id?: string | null
  joined_at: string
  left_at?: string | null
  user: {
    id: string
    full_name: string
    email: string
    avatar_url?: string
    role_id?: string
  }
}

export interface OrgGroupRegion {
  id: string
  region_id: string
  is_primary: boolean
  is_active: boolean
  region: {
    id: string
    name: string
    code: string
  }
}

export interface OrgGroupChild {
  id: string
  name: string
  group_type: string
  is_active: boolean
  group_members?: Array<{ count: number }>
}

/**
 * Full organizational group data for detail pages (Guidewire-style)
 */
export interface FullOrgGroupData {
  id: string
  name: string
  code: string | null
  description: string | null
  groupType: string
  parentGroupId: string | null
  hierarchyLevel: number
  hierarchyPath: string | null
  securityZone: string | null
  supervisorId: string | null
  managerId: string | null
  loadFactor: number
  isActive: boolean
  
  // Contact Info
  phone: string | null
  fax: string | null
  email: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  state: string | null
  postal_code: string | null
  country: string | null
  
  // Timestamps
  createdAt: string
  updatedAt: string
  
  // Relations
  supervisor?: {
    id: string
    full_name: string
    email: string
    avatar_url?: string
  } | null
  manager?: {
    id: string
    full_name: string
    email: string
    avatar_url?: string
  } | null
  parent?: {
    id: string
    name: string
    group_type: string
  } | null
  created_by_user?: {
    id: string
    full_name: string
  } | null
  
  // Tabs data
  members: OrgGroupMember[]
  regions: OrgGroupRegion[]
  
  // Sections data
  sections?: {
    children: {
      items: OrgGroupChild[]
      total: number
    }
    activity: {
      items: AuditLogEntry[]
      total: number
    }
  }
}
