'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Mail,
  Star,
  StarOff,
  Archive,
  Trash2,
  RotateCcw,
  Search,
  Filter,
  ChevronDown,
  Paperclip,
  Clock,
  CheckCircle2,
  Circle,
  MoreHorizontal,
  Inbox,
  Send,
  File,
  AlertCircle,
  RefreshCw,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'
import { formatDistanceToNow } from 'date-fns'

// ============================================
// Types
// ============================================

interface EmailThread {
  id: string
  subject: string
  snippet: string
  from_name: string
  from_email: string
  participants: Array<{ name: string; email: string }>
  message_count: number
  has_attachments: boolean
  is_read: boolean
  is_starred: boolean
  is_archived: boolean
  last_message_at: string
  labels: string[]
  entity_links: Array<{ entity_type: string; entity_id: string; entity_name: string }>
}

interface EmailInboxProps {
  accountId?: string
  folder?: 'inbox' | 'sent' | 'drafts' | 'archived' | 'trash'
  onThreadSelect?: (thread: EmailThread) => void
  selectedThreadId?: string
  className?: string
}

// ============================================
// Folder Configuration
// ============================================

const FOLDERS = [
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'sent', label: 'Sent', icon: Send },
  { id: 'drafts', label: 'Drafts', icon: File },
  { id: 'archived', label: 'Archived', icon: Archive },
  { id: 'trash', label: 'Trash', icon: Trash2 },
] as const

// ============================================
// Thread Item Component
// ============================================

function ThreadItem({
  thread,
  isSelected,
  onSelect,
  onStar,
  onArchive,
}: {
  thread: EmailThread
  isSelected: boolean
  onSelect: () => void
  onStar: () => void
  onArchive: () => void
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={cn(
        'group flex items-start gap-3 px-4 py-3 border-b border-charcoal-100 cursor-pointer transition-colors',
        isSelected ? 'bg-gold-50' : 'hover:bg-charcoal-50',
        !thread.is_read && 'bg-blue-50/30'
      )}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Selection / Star */}
      <div className="flex items-center gap-2 pt-0.5">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onStar()
          }}
          className={cn(
            'p-1 rounded transition-colors',
            thread.is_starred
              ? 'text-gold-500 hover:text-gold-600'
              : 'text-charcoal-300 hover:text-charcoal-500'
          )}
        >
          {thread.is_starred ? (
            <Star className="w-4 h-4 fill-current" />
          ) : (
            <StarOff className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* From & Date */}
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={cn(
                'text-sm truncate',
                !thread.is_read ? 'font-semibold text-charcoal-900' : 'text-charcoal-700'
              )}
            >
              {thread.from_name || thread.from_email}
            </span>
            {thread.message_count > 1 && (
              <span className="text-xs text-charcoal-400 flex-shrink-0">
                ({thread.message_count})
              </span>
            )}
          </div>
          <span className="text-xs text-charcoal-400 flex-shrink-0">
            {formatDistanceToNow(new Date(thread.last_message_at), { addSuffix: true })}
          </span>
        </div>

        {/* Subject */}
        <p
          className={cn(
            'text-sm truncate',
            !thread.is_read ? 'font-medium text-charcoal-900' : 'text-charcoal-700'
          )}
        >
          {thread.subject || '(no subject)'}
        </p>

        {/* Snippet */}
        <p className="text-xs text-charcoal-500 truncate mt-0.5">{thread.snippet}</p>

        {/* Labels & Indicators */}
        <div className="flex items-center gap-2 mt-1.5">
          {thread.has_attachments && (
            <Paperclip className="w-3 h-3 text-charcoal-400" />
          )}
          {thread.entity_links.length > 0 && (
            <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-charcoal-100 text-charcoal-600 rounded">
              {thread.entity_links[0].entity_name}
            </span>
          )}
          {thread.labels.map((label) => (
            <span
              key={label}
              className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-700 rounded"
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Quick Actions (on hover) */}
      {isHovered && (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onArchive()
            }}
            className="p-1.5 text-charcoal-400 hover:text-charcoal-600 hover:bg-charcoal-100 rounded"
          >
            <Archive className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 text-charcoal-400 hover:text-charcoal-600 hover:bg-charcoal-100 rounded"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

// ============================================
// Main Component
// ============================================

export function EmailInbox({
  accountId,
  folder = 'inbox',
  onThreadSelect,
  selectedThreadId,
  className,
}: EmailInboxProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentFolder, setCurrentFolder] = useState(folder)
  const utils = trpc.useUtils()

  // Fetch threads
  const { data: threads, isLoading, refetch } = trpc.email.threads.list.useQuery(
    {
      accountId,
      folder: currentFolder,
      search: searchQuery || undefined,
      limit: 50,
    },
    { enabled: !!accountId }
  )

  // Fetch accounts for selector
  const { data: accounts } = trpc.email.accounts.list.useQuery()

  // Mutations
  const starMutation = trpc.email.threads.toggleStar.useMutation({
    onSuccess: () => utils.email.threads.invalidate(),
  })

  const archiveMutation = trpc.email.threads.archive.useMutation({
    onSuccess: () => utils.email.threads.invalidate(),
  })

  const handleStar = useCallback(
    (threadId: string) => {
      if (accountId) {
        starMutation.mutate({ accountId, threadId })
      }
    },
    [accountId, starMutation]
  )

  const handleArchive = useCallback(
    (threadId: string) => {
      if (accountId) {
        archiveMutation.mutate({ accountId, threadId })
      }
    },
    [accountId, archiveMutation]
  )

  // No account connected state
  if (!accountId && accounts && accounts.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-16', className)}>
        <div className="w-16 h-16 rounded-full bg-charcoal-100 flex items-center justify-center mb-4">
          <Mail className="w-8 h-8 text-charcoal-400" />
        </div>
        <h3 className="text-lg font-semibold text-charcoal-900 mb-2">
          Connect Your Email
        </h3>
        <p className="text-sm text-charcoal-500 text-center max-w-sm mb-4">
          Connect your Gmail or Outlook account to view and send emails directly from InTime.
        </p>
        <button
          onClick={() => router.push('/employee/settings/email')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-charcoal-900 text-white rounded-lg hover:bg-charcoal-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Connect Email Account
        </button>
      </div>
    )
  }

  return (
    <div className={cn('flex h-full', className)}>
      {/* Folder Sidebar */}
      <div className="w-48 border-r border-charcoal-200 p-3 space-y-1">
        {FOLDERS.map((f) => {
          const Icon = f.icon
          const isActive = currentFolder === f.id
          return (
            <button
              key={f.id}
              onClick={() => setCurrentFolder(f.id as typeof currentFolder)}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-charcoal-900 text-white'
                  : 'text-charcoal-600 hover:bg-charcoal-100'
              )}
            >
              <Icon className="w-4 h-4" />
              {f.label}
            </button>
          )
        })}
      </div>

      {/* Thread List */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Search & Actions */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-charcoal-200">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search emails..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-charcoal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
            />
          </div>
          <button
            onClick={() => refetch()}
            className="p-2 text-charcoal-400 hover:text-charcoal-600 hover:bg-charcoal-100 rounded-lg"
          >
            <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
          </button>
          <button className="p-2 text-charcoal-400 hover:text-charcoal-600 hover:bg-charcoal-100 rounded-lg">
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Thread List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-6 h-6 text-charcoal-400 animate-spin mx-auto mb-2" />
              <p className="text-sm text-charcoal-500">Loading emails...</p>
            </div>
          ) : !threads || threads.length === 0 ? (
            <div className="p-8 text-center">
              <Inbox className="w-8 h-8 text-charcoal-300 mx-auto mb-2" />
              <p className="text-sm text-charcoal-500">No emails found</p>
            </div>
          ) : (
            threads.map((thread: EmailThread) => (
              <ThreadItem
                key={thread.id}
                thread={thread}
                isSelected={thread.id === selectedThreadId}
                onSelect={() => onThreadSelect?.(thread)}
                onStar={() => handleStar(thread.id)}
                onArchive={() => handleArchive(thread.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default EmailInbox
