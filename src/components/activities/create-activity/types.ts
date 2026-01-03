/**
 * Types for the Create Activity dialog - single-page form
 */

export type CreationPath = 'pattern' | 'manual'

export type ActivityPriority = 'low' | 'normal' | 'high' | 'urgent'

export type ActivityStatus = 'scheduled' | 'open' | 'in_progress'

export interface ChecklistItem {
  id: string
  text: string
  required?: boolean
}

export interface SelectedPattern {
  id: string
  code: string
  name: string
  description: string | null
  icon: string | null
  color: string | null
  targetDays: number | null
  escalationDays: number | null
  priority: string | null
  hasChecklist: boolean
  checklistCount: number
  isSystem: boolean
  category: string | null
  instructions?: string | null
  checklist?: ChecklistItem[] | null
}

export interface CreateActivityFormState {
  // Path selection
  path: CreationPath

  // Pattern (if path === 'pattern')
  selectedPattern: SelectedPattern | null

  // Form fields
  subject: string
  description: string
  category: string
  priority: ActivityPriority
  status: ActivityStatus
  dueDate: Date | null
  escalationDate: Date | null
  assignedTo: string | null
  queueId: string | null
  contactId: string | null
}

export const INITIAL_FORM_STATE: CreateActivityFormState = {
  path: 'manual',
  selectedPattern: null,
  subject: '',
  description: '',
  category: '',
  priority: 'normal',
  status: 'open',
  dueDate: null,
  escalationDate: null,
  assignedTo: null,
  queueId: null,
  contactId: null,
}

// Category options for the dropdown
export const CATEGORY_OPTIONS = [
  { value: 'communication', label: 'Communication' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'administrative', label: 'Administrative' },
  { value: 'research', label: 'Research' },
  { value: 'sales', label: 'Sales' },
  { value: 'recruiting', label: 'Recruiting' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'workflow', label: 'Workflow' },
  { value: 'other', label: 'Other' },
] as const

// Priority options for the dropdown
export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
] as const

// Status options for the dropdown
export const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
] as const
