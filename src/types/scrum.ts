/**
 * Scrum/PM System Types
 * Types for the Team Space Scrum/PM functionality
 */

// =============================================================================
// Workspace Types
// =============================================================================

export type WorkspaceType = 'my-space' | 'team-space'

export interface WorkspaceState {
  currentWorkspace: WorkspaceType
  teamId?: string
  teamName?: string
}

// =============================================================================
// Sprint Types
// =============================================================================

export type SprintStatus = 'planning' | 'active' | 'review' | 'completed' | 'cancelled'

export interface Sprint {
  id: string
  orgId: string
  podId: string
  sprintNumber: number
  name: string
  startDate: string
  endDate: string
  goal?: string
  goalAchieved?: boolean
  status: SprintStatus
  plannedPoints: number
  completedPoints: number
  totalItems: number
  completedItems: number
  totalPoints: number // Alias for plannedPoints for convenience
  planningCompletedAt?: string
  reviewCompletedAt?: string
  retroCompletedAt?: string
  createdAt: string
  updatedAt: string
  createdBy?: string
}

export interface SprintWithMetrics extends Sprint {
  velocity: number
  burndownData: SprintBurndownPoint[]
  itemsByStatus: Record<SprintItemStatus, number>
}

// =============================================================================
// Sprint Item Types
// =============================================================================

export type SprintItemType = 'epic' | 'story' | 'task' | 'bug' | 'spike'
export type SprintItemStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done' | 'blocked'
export type SprintItemPriority = 'critical' | 'high' | 'medium' | 'low'

export interface SprintItem {
  id: string
  orgId: string
  sprintId?: string
  itemNumber: string
  title: string
  description?: string
  itemType: SprintItemType
  status: SprintItemStatus
  priority: SprintItemPriority
  storyPoints?: number
  assigneeId?: string
  reporterId?: string
  parentId?: string
  epicId?: string
  linkedEntityType?: 'job' | 'submission' | 'candidate' | 'activity'
  linkedEntityId?: string
  boardColumn: string
  boardOrder: number
  backlogOrder?: number
  labels: string[]
  timeEstimateHours?: number
  timeSpentHours: number
  startedAt?: string
  completedAt?: string
  dueDate?: string
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
}

export interface SprintItemWithRelations extends SprintItem {
  assignee?: {
    id: string
    fullName: string
    avatarUrl?: string
  }
  reporter?: {
    id: string
    fullName: string
    avatarUrl?: string
  }
  parent?: SprintItem
  epic?: SprintItem
  subtasks?: SprintItem[]
  linkedEntity?: {
    type: string
    id: string
    name: string
  }
  comments?: SprintItemComment[]
}

export interface SprintItemComment {
  id: string
  itemId: string
  authorId: string
  content: string
  createdAt: string
  updatedAt?: string
  // Relation to user (populated by backend)
  user: {
    id: string
    fullName: string
    avatarUrl?: string
  }
}

// =============================================================================
// Board Types
// =============================================================================

export interface BoardColumn {
  id: string
  orgId: string
  podId: string
  columnKey: string
  name: string
  description?: string
  color: string
  icon?: string
  position: number
  wipLimit?: number
  mapsToStatus: SprintItemStatus
  isDoneColumn: boolean
  isInitialColumn: boolean
  createdAt: string
  updatedAt: string
}

export interface BoardState {
  columns: BoardColumn[]
  items: Record<string, SprintItemWithRelations[]>
  sprint?: Sprint
}

// =============================================================================
// Retrospective Types
// =============================================================================

export type RetroStatus = 'draft' | 'in_progress' | 'completed'
export type RetroCategory = 'went_well' | 'to_improve'

export interface RetroItem {
  id: string
  text: string
  authorId: string
  authorName: string
  votes: number
  votedBy: string[]
  createdAt: string
}

export interface RetroActionItem {
  id: string
  text: string
  assigneeId?: string
  assigneeName?: string
  completed: boolean
  completedAt?: string
  dueDate?: string
  createdAt: string
}

export interface SprintRetrospective {
  id: string
  orgId: string
  sprintId: string
  wentWell: RetroItem[]
  toImprove: RetroItem[]
  actionItems: RetroActionItem[]
  participants: string[]
  status: RetroStatus
  completedAt?: string
  createdAt: string
  updatedAt: string
}

// =============================================================================
// Burndown Types
// =============================================================================

export interface SprintBurndownPoint {
  id: string
  sprintId: string
  snapshotDate: string
  remainingPoints: number
  completedPoints: number
  addedPoints: number
  remainingItems: number
  completedItems: number
  idealRemainingPoints?: number
}

// =============================================================================
// Velocity Types
// =============================================================================

export interface VelocityDataPoint {
  sprintId: string
  sprintNumber: number
  sprintName: string
  plannedPoints: number
  completedPoints: number
  startDate: string
  endDate: string
}

// =============================================================================
// Team Space Types
// =============================================================================

export interface TeamSpaceData {
  team: {
    id: string
    name: string
    memberCount: number
    manager?: {
      id: string
      name: string
    }
  }
  activeSprint?: SprintWithMetrics
  backlogCount: number
  recentSprints: Sprint[]
  velocity: VelocityDataPoint[]
  members: TeamMember[]
}

export interface TeamMember {
  id: string
  name: string
  email: string
  avatarUrl?: string
  role: 'manager' | 'senior' | 'junior' | 'member'
}

// =============================================================================
// Input Types (for mutations)
// =============================================================================

export interface CreateSprintInput {
  podId: string
  name: string
  startDate: string
  endDate: string
  goal?: string
}

export interface UpdateSprintInput {
  id: string
  name?: string
  startDate?: string
  endDate?: string
  goal?: string
  status?: SprintStatus
}

export interface CreateSprintItemInput {
  sprintId?: string
  title: string
  description?: string
  itemType: SprintItemType
  priority?: SprintItemPriority
  storyPoints?: number
  assigneeId?: string
  epicId?: string
  labels?: string[]
  dueDate?: string
  linkedEntityType?: 'job' | 'submission' | 'candidate' | 'activity'
  linkedEntityId?: string
}

export interface UpdateSprintItemInput {
  id: string
  title?: string
  description?: string
  itemType?: SprintItemType
  status?: SprintItemStatus
  priority?: SprintItemPriority
  storyPoints?: number
  assigneeId?: string
  epicId?: string
  labels?: string[]
  dueDate?: string
  timeSpentHours?: number
}

export interface MoveSprintItemInput {
  itemId: string
  targetColumn: string
  targetOrder: number
}

export interface AddToSprintInput {
  itemIds: string[]
  sprintId: string
}

export interface CreateBoardColumnInput {
  podId: string
  columnKey: string
  name: string
  color?: string
  position: number
  mapsToStatus: SprintItemStatus
  wipLimit?: number
  isDoneColumn?: boolean
  isInitialColumn?: boolean
}

export interface CreateRetroItemInput {
  sprintId: string
  category: 'went_well' | 'to_improve'
  text: string
}

export interface CreateRetroActionItemInput {
  sprintId: string
  text: string
  assigneeId?: string
  dueDate?: string
}

// =============================================================================
// Filter Types
// =============================================================================

export interface SprintItemFilters {
  sprintId?: string
  status?: SprintItemStatus[]
  itemType?: SprintItemType[]
  assigneeId?: string
  priority?: SprintItemPriority[]
  labels?: string[]
  search?: string
  inBacklog?: boolean
}

export interface SprintFilters {
  podId: string
  status?: SprintStatus[]
  limit?: number
}
