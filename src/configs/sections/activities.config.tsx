import {
  Activity,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  Video,
  MessageSquare,
  Linkedin,
  ClipboardList,
  User,
  AlertCircle,
  Calendar,
} from 'lucide-react'
import type { ColumnConfig, StatusConfig, StatCardConfig } from '@/configs/entities/types'

// ============================================
// TYPES
// ============================================

export interface ActivityItem extends Record<string, unknown> {
  id: string
  subject: string
  description?: string
  activity_type: string
  activityType?: string
  status: string
  priority?: string
  due_date?: string
  dueDate?: string
  completed_at?: string
  completedAt?: string
  created_at: string
  createdAt?: string
  entity_type?: string
  entityType?: string
  entity_id?: string
  entityId?: string
  performed_by?: {
    id: string
    full_name: string
    avatar_url?: string
  } | null
  performedBy?: {
    id: string
    full_name: string
    avatar_url?: string
  } | null
  owner?: {
    id: string
    full_name: string
    avatar_url?: string
  } | null
}

// ============================================
// ACTIVITY TYPE CONFIGURATION
// ============================================

export const ACTIVITY_TYPE_CONFIG: Record<string, {
  icon: typeof Activity
  color: string
  bgColor: string
  label: string
}> = {
  email: {
    icon: Mail,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    label: 'Email',
  },
  call: {
    icon: Phone,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'Call',
  },
  meeting: {
    icon: Video,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    label: 'Meeting',
  },
  note: {
    icon: MessageSquare,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    label: 'Note',
  },
  linkedin_message: {
    icon: Linkedin,
    color: 'text-sky-600',
    bgColor: 'bg-sky-100',
    label: 'LinkedIn',
  },
  task: {
    icon: ClipboardList,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    label: 'Task',
  },
  follow_up: {
    icon: Clock,
    color: 'text-rose-600',
    bgColor: 'bg-rose-100',
    label: 'Follow-up',
  },
}

// ============================================
// ACTIVITY STATUS CONFIGURATION
// ============================================

export const ACTIVITY_STATUS_CONFIG: Record<string, StatusConfig> = {
  scheduled: {
    label: 'Scheduled',
    color: 'bg-blue-100 text-blue-700',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    icon: Calendar,
  },
  open: {
    label: 'Open',
    color: 'bg-amber-100 text-amber-700',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    icon: Clock,
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-purple-100 text-purple-700',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    icon: Activity,
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-100 text-green-700',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    icon: CheckCircle,
  },
  skipped: {
    label: 'Skipped',
    color: 'bg-charcoal-100 text-charcoal-600',
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-600',
    icon: AlertCircle,
  },
  canceled: {
    label: 'Canceled',
    color: 'bg-red-100 text-red-700',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    icon: AlertCircle,
  },
}

// ============================================
// ACTIVITY PRIORITY CONFIGURATION
// ============================================

export const ACTIVITY_PRIORITY_CONFIG: Record<string, StatusConfig> = {
  low: {
    label: 'Low',
    color: 'bg-charcoal-100 text-charcoal-600',
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-600',
  },
  normal: {
    label: 'Normal',
    color: 'bg-blue-100 text-blue-700',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
  },
  high: {
    label: 'High',
    color: 'bg-amber-100 text-amber-700',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
  },
  urgent: {
    label: 'Urgent',
    color: 'bg-red-100 text-red-700',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
  },
}

// ============================================
// STATS CARDS CONFIGURATION (4 cards per plan)
// ============================================

export const ACTIVITIES_STATS_CONFIG: StatCardConfig[] = [
  {
    key: 'total',
    label: 'Total',
    icon: Activity,
  },
  {
    key: 'completedToday',
    label: 'Completed Today',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-700',
  },
  {
    key: 'overdue',
    label: 'Overdue',
    icon: AlertCircle,
    color: 'bg-red-100 text-red-700',
  },
  {
    key: 'byType',
    label: 'By Type',
    icon: ClipboardList,
    // This will show breakdown - rendered differently
  },
]

// ============================================
// COLUMNS CONFIGURATION (10 columns per plan)
// ============================================

export const ACTIVITIES_COLUMNS: ColumnConfig<ActivityItem>[] = [
  {
    key: 'activityType',
    header: 'Type',
    label: 'Type',
    sortable: true,
    width: 'w-[100px]',
    render: (value) => {
      const type = (value as string) || ''
      const config = ACTIVITY_TYPE_CONFIG[type]
      if (!config) return type
      const Icon = config.icon
      return (
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded ${config.bgColor}`}>
            <Icon className={`w-3.5 h-3.5 ${config.color}`} />
          </div>
          <span className="text-xs">{config.label}</span>
        </div>
      )
    },
  },
  {
    key: 'subject',
    header: 'Subject',
    label: 'Subject',
    sortable: true,
    width: 'min-w-[200px]',
  },
  {
    key: 'description',
    header: 'Description',
    label: 'Description',
    width: 'w-[200px]',
    render: (value) => {
      const desc = value as string | undefined
      if (!desc) return <span className="text-charcoal-400">—</span>
      return (
        <span className="text-charcoal-600 text-sm line-clamp-1" title={desc}>
          {desc}
        </span>
      )
    },
  },
  {
    key: 'entityType',
    header: 'Related To',
    label: 'Related To',
    sortable: true,
    width: 'w-[150px]',
    render: (value, item) => {
      const entityType = value as string | undefined
      const entityId = item.entityId || item.entity_id
      if (!entityType || !entityId) return <span className="text-charcoal-400">—</span>
      return (
        <span className="text-charcoal-600 capitalize">
          {entityType.replace('_', ' ')}
        </span>
      )
    },
  },
  {
    key: 'status',
    header: 'Status',
    label: 'Status',
    sortable: true,
    width: 'w-[100px]',
    format: 'status' as const,
  },
  {
    key: 'priority',
    header: 'Priority',
    label: 'Priority',
    sortable: true,
    width: 'w-[80px]',
    render: (value) => {
      const priority = value as string | undefined
      if (!priority) return <span className="text-charcoal-400">—</span>
      const config = ACTIVITY_PRIORITY_CONFIG[priority]
      if (!config) return priority
      return (
        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${config.color}`}>
          {config.label}
        </span>
      )
    },
  },
  {
    key: 'dueDate',
    header: 'Due Date',
    label: 'Due Date',
    sortable: true,
    width: 'w-[100px]',
    format: 'date' as const,
  },
  {
    key: 'completedAt',
    header: 'Completed',
    label: 'Completed',
    sortable: true,
    width: 'w-[100px]',
    format: 'date' as const,
  },
  {
    key: 'performedBy',
    header: 'Owner',
    label: 'Owner',
    sortable: true,
    width: 'w-[130px]',
    render: (value) => {
      const owner = value as ActivityItem['performedBy']
      if (!owner) return <span className="text-charcoal-400">—</span>
      return (
        <div className="flex items-center gap-2">
          {owner.avatar_url ? (
            <img
              src={owner.avatar_url}
              alt={owner.full_name}
              className="w-5 h-5 rounded-full"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-charcoal-200 flex items-center justify-center">
              <User className="w-3 h-3 text-charcoal-500" />
            </div>
          )}
          <span className="text-sm truncate">{owner.full_name}</span>
        </div>
      )
    },
  },
  {
    key: 'createdAt',
    header: 'Created',
    label: 'Created',
    sortable: true,
    width: 'w-[100px]',
    format: 'relative-date' as const,
  },
]

// ============================================
// SORT FIELD MAPPING
// ============================================

export const ACTIVITIES_SORT_FIELD_MAP: Record<string, string> = {
  activityType: 'activity_type',
  subject: 'subject',
  status: 'status',
  priority: 'priority',
  dueDate: 'due_date',
  completedAt: 'completed_at',
  performedBy: 'performed_by',
  createdAt: 'created_at',
  entityType: 'entity_type',
}
