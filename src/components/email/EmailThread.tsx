'use client'

import { useState, useCallback } from 'react'
import {
  ArrowLeft,
  Star,
  StarOff,
  Archive,
  Trash2,
  MoreHorizontal,
  Reply,
  ReplyAll,
  Forward,
  Paperclip,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  User,
  Clock,
  Link2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'
import { format, formatDistanceToNow } from 'date-fns'

// ============================================
// Types
// ============================================

interface EmailMessage {
  id: string
  thread_id: string
  from_name: string
  from_email: string
  to: Array<{ name: string; email: string }>
  cc?: Array<{ name: string; email: string }>
  bcc?: Array<{ name: string; email: string }>
  subject: string
  body_text: string
  body_html?: string
  attachments: Array<{
    id: string
    filename: string
    mime_type: string
    size: number
  }>
  sent_at: string
  is_read: boolean
}

interface EmailThread {
  id: string
  subject: string
  is_starred: boolean
  is_archived: boolean
  messages: EmailMessage[]
  entity_links: Array<{
    entity_type: string
    entity_id: string
    entity_name: string
  }>
}

interface EmailThreadProps {
  accountId: string
  threadId: string
  onBack: () => void
  onCompose: (mode: 'reply' | 'replyAll' | 'forward', message: EmailMessage) => void
  className?: string
}

// ============================================
// Message Component
// ============================================

function MessageItem({
  message,
  isExpanded,
  onToggle,
  onReply,
  onReplyAll,
  onForward,
}: {
  message: EmailMessage
  isExpanded: boolean
  onToggle: () => void
  onReply: () => void
  onReplyAll: () => void
  onForward: () => void
}) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div className="border-b border-charcoal-100 last:border-b-0">
      {/* Header - Always visible */}
      <div
        className={cn(
          'flex items-start gap-3 px-6 py-4 cursor-pointer hover:bg-charcoal-50 transition-colors',
          isExpanded && 'bg-charcoal-50/50'
        )}
        onClick={onToggle}
      >
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-charcoal-200 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-charcoal-500" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-medium text-charcoal-900 truncate">
                {message.from_name || message.from_email}
              </span>
              {!isExpanded && (
                <span className="text-sm text-charcoal-500 truncate">
                  - {message.body_text.slice(0, 100)}...
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-charcoal-400">
                {format(new Date(message.sent_at), 'MMM d, h:mm a')}
              </span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-charcoal-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-charcoal-400" />
              )}
            </div>
          </div>

          {isExpanded && (
            <>
              {/* To/CC details */}
              <div className="mt-1 text-xs text-charcoal-500">
                <span>To: {message.to.map((t) => t.email).join(', ')}</span>
                {message.cc && message.cc.length > 0 && (
                  <span className="ml-2">
                    Cc: {message.cc.map((c) => c.email).join(', ')}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-6 pb-4">
          {/* Message Body */}
          <div className="pl-13 ml-10">
            {message.body_html ? (
              <div
                className="prose prose-sm max-w-none text-charcoal-700"
                dangerouslySetInnerHTML={{ __html: message.body_html }}
              />
            ) : (
              <div className="text-sm text-charcoal-700 whitespace-pre-wrap">
                {message.body_text}
              </div>
            )}

            {/* Attachments */}
            {message.attachments.length > 0 && (
              <div className="mt-4 pt-4 border-t border-charcoal-100">
                <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-2">
                  Attachments ({message.attachments.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {message.attachments.map((attachment) => (
                    <a
                      key={attachment.id}
                      href={`/api/email/attachments/${attachment.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 bg-charcoal-50 border border-charcoal-200 rounded-lg hover:bg-charcoal-100 transition-colors"
                    >
                      <Paperclip className="w-4 h-4 text-charcoal-400" />
                      <span className="text-sm text-charcoal-700">
                        {attachment.filename}
                      </span>
                      <span className="text-xs text-charcoal-400">
                        ({Math.round(attachment.size / 1024)}KB)
                      </span>
                      <Download className="w-3.5 h-3.5 text-charcoal-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onReply()
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-charcoal-600 hover:bg-charcoal-100 rounded-lg transition-colors"
              >
                <Reply className="w-4 h-4" />
                Reply
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onReplyAll()
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-charcoal-600 hover:bg-charcoal-100 rounded-lg transition-colors"
              >
                <ReplyAll className="w-4 h-4" />
                Reply All
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onForward()
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-charcoal-600 hover:bg-charcoal-100 rounded-lg transition-colors"
              >
                <Forward className="w-4 h-4" />
                Forward
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// Main Component
// ============================================

export function EmailThread({
  accountId,
  threadId,
  onBack,
  onCompose,
  className,
}: EmailThreadProps) {
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set())
  const utils = trpc.useUtils()

  // Fetch thread
  const { data: thread, isLoading } = trpc.email.threads.get.useQuery(
    { accountId, threadId },
    {
      onSuccess: (data) => {
        // Expand the last message by default
        if (data?.messages.length > 0) {
          setExpandedMessages(new Set([data.messages[data.messages.length - 1].id]))
        }
      },
    }
  )

  // Mutations
  const starMutation = trpc.email.threads.toggleStar.useMutation({
    onSuccess: () => utils.email.threads.invalidate(),
  })

  const archiveMutation = trpc.email.threads.archive.useMutation({
    onSuccess: () => {
      utils.email.threads.invalidate()
      onBack()
    },
  })

  const markReadMutation = trpc.email.threads.markRead.useMutation({
    onSuccess: () => utils.email.threads.invalidate(),
  })

  const toggleExpanded = useCallback((messageId: string) => {
    setExpandedMessages((prev) => {
      const next = new Set(prev)
      if (next.has(messageId)) {
        next.delete(messageId)
      } else {
        next.add(messageId)
      }
      return next
    })
  }, [])

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-16', className)}>
        <div className="animate-spin w-6 h-6 border-2 border-charcoal-300 border-t-charcoal-600 rounded-full" />
      </div>
    )
  }

  if (!thread) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-16', className)}>
        <p className="text-charcoal-500">Thread not found</p>
        <button
          onClick={onBack}
          className="mt-4 text-sm text-charcoal-600 hover:text-charcoal-800"
        >
          Go back
        </button>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-charcoal-200">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 text-charcoal-400 hover:text-charcoal-600 hover:bg-charcoal-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-charcoal-900">
              {thread.subject || '(no subject)'}
            </h1>
            <p className="text-sm text-charcoal-500">
              {thread.messages.length} message{thread.messages.length !== 1 && 's'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Entity Links */}
          {thread.entity_links.map((link) => (
            <a
              key={`${link.entity_type}-${link.entity_id}`}
              href={`/employee/${link.entity_type}s/${link.entity_id}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-charcoal-100 text-charcoal-700 rounded hover:bg-charcoal-200 transition-colors"
            >
              <Link2 className="w-3 h-3" />
              {link.entity_name}
              <ExternalLink className="w-3 h-3" />
            </a>
          ))}

          <button
            onClick={() => starMutation.mutate({ accountId, threadId })}
            className={cn(
              'p-2 rounded-lg transition-colors',
              thread.is_starred
                ? 'text-gold-500 hover:text-gold-600 hover:bg-gold-50'
                : 'text-charcoal-400 hover:text-charcoal-600 hover:bg-charcoal-100'
            )}
          >
            {thread.is_starred ? (
              <Star className="w-5 h-5 fill-current" />
            ) : (
              <StarOff className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={() => archiveMutation.mutate({ accountId, threadId })}
            className="p-2 text-charcoal-400 hover:text-charcoal-600 hover:bg-charcoal-100 rounded-lg"
          >
            <Archive className="w-5 h-5" />
          </button>
          <button className="p-2 text-charcoal-400 hover:text-charcoal-600 hover:bg-charcoal-100 rounded-lg">
            <Trash2 className="w-5 h-5" />
          </button>
          <button className="p-2 text-charcoal-400 hover:text-charcoal-600 hover:bg-charcoal-100 rounded-lg">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {thread.messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            isExpanded={expandedMessages.has(message.id)}
            onToggle={() => toggleExpanded(message.id)}
            onReply={() => onCompose('reply', message)}
            onReplyAll={() => onCompose('replyAll', message)}
            onForward={() => onCompose('forward', message)}
          />
        ))}
      </div>

      {/* Quick Reply */}
      <div className="px-6 py-4 border-t border-charcoal-200">
        <button
          onClick={() => {
            const lastMessage = thread.messages[thread.messages.length - 1]
            if (lastMessage) {
              onCompose('reply', lastMessage)
            }
          }}
          className="w-full px-4 py-3 text-left text-sm text-charcoal-500 bg-charcoal-50 border border-charcoal-200 rounded-lg hover:bg-charcoal-100 transition-colors"
        >
          Click to reply...
        </button>
      </div>
    </div>
  )
}

export default EmailThread
