'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  Send,
  Phone,
  User,
  ArrowLeft,
  MoreHorizontal,
  Image,
  Paperclip,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  Link2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'
import { format, formatDistanceToNow, isSameDay } from 'date-fns'

// ============================================
// Types
// ============================================

interface SMSMessage {
  id: string
  direction: 'inbound' | 'outbound'
  body: string
  media_urls?: string[]
  status: 'queued' | 'sending' | 'sent' | 'delivered' | 'read' | 'failed' | 'received'
  sent_at: string
  delivered_at?: string
  read_at?: string
  error_message?: string
}

interface SMSConversation {
  phone_number: string
  contact_name?: string
  contact_id?: string
  last_message_at: string
  unread_count: number
  messages: SMSMessage[]
}

interface SMSConversationProps {
  accountId: string
  phoneNumber: string
  contactName?: string
  onBack?: () => void
  onCall?: (phoneNumber: string) => void
  className?: string
}

// ============================================
// Status Icon
// ============================================

function StatusIcon({ status }: { status: SMSMessage['status'] }) {
  switch (status) {
    case 'queued':
    case 'sending':
      return <Clock className="w-3 h-3 text-charcoal-400" />
    case 'sent':
      return <Check className="w-3 h-3 text-charcoal-400" />
    case 'delivered':
      return <CheckCheck className="w-3 h-3 text-charcoal-400" />
    case 'read':
      return <CheckCheck className="w-3 h-3 text-blue-500" />
    case 'failed':
      return <AlertCircle className="w-3 h-3 text-error-500" />
    default:
      return null
  }
}

// ============================================
// Message Bubble
// ============================================

function MessageBubble({ message }: { message: SMSMessage }) {
  const isOutbound = message.direction === 'outbound'

  return (
    <div
      className={cn(
        'flex gap-2',
        isOutbound ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[70%] px-4 py-2 rounded-2xl',
          isOutbound
            ? 'bg-charcoal-900 text-white rounded-br-sm'
            : 'bg-charcoal-100 text-charcoal-900 rounded-bl-sm'
        )}
      >
        {/* Media */}
        {message.media_urls && message.media_urls.length > 0 && (
          <div className="grid gap-2 mb-2">
            {message.media_urls.map((url, i) => (
              <img
                key={i}
                src={url}
                alt="Media"
                className="max-w-full rounded-lg"
              />
            ))}
          </div>
        )}

        {/* Body */}
        <p className="text-sm whitespace-pre-wrap break-words">{message.body}</p>

        {/* Timestamp & Status */}
        <div
          className={cn(
            'flex items-center gap-1 mt-1',
            isOutbound ? 'justify-end' : 'justify-start'
          )}
        >
          <span
            className={cn(
              'text-[10px]',
              isOutbound ? 'text-white/60' : 'text-charcoal-400'
            )}
          >
            {format(new Date(message.sent_at), 'h:mm a')}
          </span>
          {isOutbound && <StatusIcon status={message.status} />}
        </div>

        {/* Error */}
        {message.status === 'failed' && message.error_message && (
          <p className="text-[10px] text-error-300 mt-1">{message.error_message}</p>
        )}
      </div>
    </div>
  )
}

// ============================================
// Date Divider
// ============================================

function DateDivider({ date }: { date: Date }) {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  let label: string
  if (isSameDay(date, today)) {
    label = 'Today'
  } else if (isSameDay(date, yesterday)) {
    label = 'Yesterday'
  } else {
    label = format(date, 'MMMM d, yyyy')
  }

  return (
    <div className="flex items-center justify-center my-4">
      <span className="px-3 py-1 text-xs text-charcoal-500 bg-charcoal-50 rounded-full">
        {label}
      </span>
    </div>
  )
}

// ============================================
// Main Component
// ============================================

export function SMSConversation({
  accountId,
  phoneNumber,
  contactName,
  onBack,
  onCall,
  className,
}: SMSConversationProps) {
  const [messageText, setMessageText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const utils = trpc.useUtils()

  // Fetch conversation
  const { data: conversation, isLoading } = trpc.phone.sms.conversation.useQuery(
    { accountId, phoneNumber },
    { enabled: !!accountId && !!phoneNumber }
  )

  // Send mutation
  const sendMutation = trpc.phone.sms.send.useMutation({
    onSuccess: () => {
      utils.phone.sms.conversation.invalidate({ accountId, phoneNumber })
      setMessageText('')
    },
  })

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation?.messages])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSend = useCallback(() => {
    if (!messageText.trim()) return

    sendMutation.mutate({
      accountId,
      to: phoneNumber,
      body: messageText.trim(),
    })
  }, [accountId, phoneNumber, messageText, sendMutation])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  // Group messages by date
  const groupedMessages = conversation?.messages.reduce<
    Array<{ date: Date; messages: SMSMessage[] }>
  >((acc, message) => {
    const messageDate = new Date(message.sent_at)
    const lastGroup = acc[acc.length - 1]

    if (lastGroup && isSameDay(lastGroup.date, messageDate)) {
      lastGroup.messages.push(message)
    } else {
      acc.push({ date: messageDate, messages: [message] })
    }

    return acc
  }, [])

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-16', className)}>
        <div className="animate-spin w-6 h-6 border-2 border-charcoal-300 border-t-charcoal-600 rounded-full" />
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col h-full bg-white', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-charcoal-200">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 text-charcoal-400 hover:text-charcoal-600 hover:bg-charcoal-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-10 h-10 rounded-full bg-charcoal-200 flex items-center justify-center">
            <User className="w-5 h-5 text-charcoal-500" />
          </div>
          <div>
            <p className="font-medium text-charcoal-900">
              {contactName || phoneNumber}
            </p>
            {contactName && (
              <p className="text-xs text-charcoal-500">{phoneNumber}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onCall && (
            <button
              onClick={() => onCall(phoneNumber)}
              className="p-2 text-charcoal-400 hover:text-charcoal-600 hover:bg-charcoal-100 rounded-lg"
            >
              <Phone className="w-5 h-5" />
            </button>
          )}
          <button className="p-2 text-charcoal-400 hover:text-charcoal-600 hover:bg-charcoal-100 rounded-lg">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {!groupedMessages || groupedMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-charcoal-500">No messages yet</p>
            <p className="text-sm text-charcoal-400 mt-1">
              Send a message to start the conversation
            </p>
          </div>
        ) : (
          groupedMessages.map((group, groupIndex) => (
            <div key={groupIndex}>
              <DateDivider date={group.date} />
              <div className="space-y-2">
                {group.messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-charcoal-200">
        <div className="flex items-center gap-2">
          <button className="p-2 text-charcoal-400 hover:text-charcoal-600 rounded-lg">
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            ref={inputRef}
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={sendMutation.isPending}
            className="flex-1 px-4 py-2.5 text-sm border border-charcoal-200 rounded-full focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!messageText.trim() || sendMutation.isPending}
            className={cn(
              'p-2.5 rounded-full transition-colors',
              messageText.trim() && !sendMutation.isPending
                ? 'bg-charcoal-900 text-white hover:bg-charcoal-800'
                : 'bg-charcoal-100 text-charcoal-400 cursor-not-allowed'
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default SMSConversation
