import {
  StickyNote,
  User,
  Pin,
  FileText,
  MessageSquare,
  AlertCircle,
  Bell,
  Phone,
  Users,
  Target,
  Lightbulb,
  AlertTriangle,
  Lock,
} from 'lucide-react'
import type { ColumnConfig, StatusConfig } from '@/configs/entities/types'

// ============================================
// TYPES
// ============================================

export interface NoteItem extends Record<string, unknown> {
  id: string
  content: string
  subject?: string
  title?: string
  note_type?: string
  noteType?: string
  is_pinned?: boolean
  isPinned?: boolean
  entity_type?: string
  entityType?: string
  entity_id?: string
  entityId?: string
  created_at: string
  createdAt?: string
  updated_at?: string
  updatedAt?: string
  created_by?: string
  createdBy?: string
  creator?: {
    id: string
    full_name: string
    avatar_url?: string
  } | null
  author?: {
    id: string
    full_name: string
    avatar_url?: string
  } | null
}

// ============================================
// NOTE TYPE CONFIGURATION
// Complete enum from database: general, meeting, call, strategy, warning,
// opportunity, competitive_intel, internal, important, reminder
// ============================================

export const NOTE_TYPE_CONFIG: Record<string, StatusConfig> = {
  general: {
    label: 'General',
    color: 'bg-charcoal-100 text-charcoal-700',
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-700',
    icon: FileText,
  },
  internal: {
    label: 'Internal',
    color: 'bg-blue-100 text-blue-700',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    icon: Lock,
  },
  important: {
    label: 'Important',
    color: 'bg-amber-100 text-amber-700',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    icon: AlertTriangle,
  },
  reminder: {
    label: 'Reminder',
    color: 'bg-purple-100 text-purple-700',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    icon: Bell,
  },
  meeting: {
    label: 'Meeting',
    color: 'bg-indigo-100 text-indigo-700',
    bgColor: 'bg-indigo-100',
    textColor: 'text-indigo-700',
    icon: Users,
  },
  call: {
    label: 'Call',
    color: 'bg-teal-100 text-teal-700',
    bgColor: 'bg-teal-100',
    textColor: 'text-teal-700',
    icon: Phone,
  },
  strategy: {
    label: 'Strategy',
    color: 'bg-orange-100 text-orange-700',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
    icon: Target,
  },
  warning: {
    label: 'Warning',
    color: 'bg-red-100 text-red-700',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    icon: AlertCircle,
  },
  opportunity: {
    label: 'Opportunity',
    color: 'bg-green-100 text-green-700',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    icon: Lightbulb,
  },
  competitive_intel: {
    label: 'Competitive Intel',
    color: 'bg-pink-100 text-pink-700',
    bgColor: 'bg-pink-100',
    textColor: 'text-pink-700',
    icon: MessageSquare,
  },
}

// ============================================
// COLUMNS CONFIGURATION (6 columns per plan)
// ============================================

export const NOTES_COLUMNS: ColumnConfig<NoteItem>[] = [
  {
    key: 'subject',
    header: 'Subject',
    label: 'Subject',
    sortable: true,
    width: 'min-w-[200px]',
    render: (value, item) => {
      const subject = (value as string | undefined) || item.title
      const isPinned = item.is_pinned || item.isPinned
      return (
        <div className="flex items-center gap-2">
          {isPinned && (
            <Pin className="w-3.5 h-3.5 text-gold-500 flex-shrink-0" />
          )}
          <span className="font-medium text-charcoal-900 line-clamp-1">
            {subject || 'Untitled Note'}
          </span>
        </div>
      )
    },
  },
  {
    key: 'content',
    header: 'Preview',
    label: 'Preview',
    width: 'w-[300px]',
    render: (value) => {
      const content = value as string | undefined
      if (!content) return <span className="text-charcoal-400">—</span>
      // Truncate to first 100 characters
      const preview = content.length > 100 ? `${content.slice(0, 100)}...` : content
      return (
        <span className="text-charcoal-600 text-sm line-clamp-2" title={content}>
          {preview}
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
    key: 'creator',
    header: 'Author',
    label: 'Author',
    sortable: true,
    width: 'w-[130px]',
    render: (value, item) => {
      const author = (value as NoteItem['creator']) || item.author
      if (!author) return <span className="text-charcoal-400">—</span>
      return (
        <div className="flex items-center gap-2">
          {author.avatar_url ? (
            <img
              src={author.avatar_url}
              alt={author.full_name}
              className="w-5 h-5 rounded-full"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-charcoal-200 flex items-center justify-center">
              <User className="w-3 h-3 text-charcoal-500" />
            </div>
          )}
          <span className="text-sm truncate">{author.full_name}</span>
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
  {
    key: 'updatedAt',
    header: 'Updated',
    label: 'Updated',
    sortable: true,
    width: 'w-[100px]',
    format: 'relative-date' as const,
  },
]

// ============================================
// SORT FIELD MAPPING
// ============================================

export const NOTES_SORT_FIELD_MAP: Record<string, string> = {
  subject: 'subject',
  entityType: 'entity_type',
  creator: 'created_by',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
}

// ============================================
// EMPTY STATE CONFIG
// ============================================

export const NOTES_EMPTY_STATE = {
  icon: StickyNote,
  title: 'No notes yet',
  description: 'Add notes to capture important information',
}
