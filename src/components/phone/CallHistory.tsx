'use client'

import { useState, useCallback } from 'react'
import {
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Clock,
  User,
  Building2,
  Briefcase,
  Play,
  MoreHorizontal,
  Search,
  Filter,
  ChevronRight,
  MessageSquare,
  Link2,
  Calendar,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'
import { formatDistanceToNow, format } from 'date-fns'

// ============================================
// Types
// ============================================

interface CallLog {
  id: string
  phone_number: string
  direction: 'inbound' | 'outbound'
  status: 'completed' | 'missed' | 'voicemail' | 'busy' | 'failed' | 'no_answer'
  outcome?: string
  duration_seconds?: number
  started_at: string
  ended_at?: string
  notes?: string
  recording_url?: string
  contact_name?: string
  contact_id?: string
  entity_links: Array<{
    entity_type: string
    entity_id: string
    entity_name: string
  }>
}

interface CallHistoryProps {
  accountId?: string
  entityType?: string
  entityId?: string
  limit?: number
  className?: string
  onCallClick?: (call: CallLog) => void
}

// ============================================
// Call Status Icons
// ============================================

function CallStatusIcon({ call }: { call: CallLog }) {
  if (call.status === 'missed' || call.status === 'no_answer') {
    return <PhoneMissed className="w-4 h-4 text-error-500" />
  }
  if (call.direction === 'inbound') {
    return <PhoneIncoming className="w-4 h-4 text-success-500" />
  }
  return <PhoneOutgoing className="w-4 h-4 text-blue-500" />
}

// ============================================
// Duration Formatter
// ============================================

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (minutes < 60) return `${minutes}m ${remainingSeconds}s`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}h ${remainingMinutes}m`
}

// ============================================
// Outcome Badge
// ============================================

const OUTCOME_COLORS: Record<string, { bg: string; text: string }> = {
  connected: { bg: 'bg-success-50', text: 'text-success-700' },
  left_voicemail: { bg: 'bg-blue-50', text: 'text-blue-700' },
  no_answer: { bg: 'bg-charcoal-100', text: 'text-charcoal-600' },
  busy: { bg: 'bg-amber-50', text: 'text-amber-700' },
  wrong_number: { bg: 'bg-error-50', text: 'text-error-700' },
  scheduled_callback: { bg: 'bg-purple-50', text: 'text-purple-700' },
  interested: { bg: 'bg-success-50', text: 'text-success-700' },
  not_interested: { bg: 'bg-charcoal-100', text: 'text-charcoal-600' },
  follow_up_needed: { bg: 'bg-amber-50', text: 'text-amber-700' },
  deal_closed: { bg: 'bg-gold-50', text: 'text-gold-700' },
}

function OutcomeBadge({ outcome }: { outcome: string }) {
  const colors = OUTCOME_COLORS[outcome] || { bg: 'bg-charcoal-100', text: 'text-charcoal-600' }
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full capitalize',
        colors.bg,
        colors.text
      )}
    >
      {outcome.replace(/_/g, ' ')}
    </span>
  )
}

// ============================================
// Call Item
// ============================================

function CallItem({
  call,
  onClick,
}: {
  call: CallLog
  onClick: () => void
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={cn(
        'group flex items-center gap-4 px-4 py-3 border-b border-charcoal-100 cursor-pointer transition-colors',
        'hover:bg-charcoal-50'
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Status Icon */}
      <div className="w-10 h-10 rounded-full bg-charcoal-100 flex items-center justify-center">
        <CallStatusIcon call={call} />
      </div>

      {/* Contact Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-charcoal-900 truncate">
            {call.contact_name || call.phone_number}
          </span>
          {call.contact_name && (
            <span className="text-xs text-charcoal-400">{call.phone_number}</span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-xs text-charcoal-500 capitalize">
            {call.direction} • {call.status.replace(/_/g, ' ')}
          </span>
          {call.duration_seconds && call.duration_seconds > 0 && (
            <span className="text-xs text-charcoal-400">
              {formatDuration(call.duration_seconds)}
            </span>
          )}
        </div>
        {/* Entity Links */}
        {call.entity_links.length > 0 && (
          <div className="flex items-center gap-2 mt-1">
            {call.entity_links.slice(0, 2).map((link) => (
              <span
                key={`${link.entity_type}-${link.entity_id}`}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] bg-charcoal-100 text-charcoal-600 rounded"
              >
                <Link2 className="w-2.5 h-2.5" />
                {link.entity_name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Outcome & Time */}
      <div className="text-right">
        {call.outcome && <OutcomeBadge outcome={call.outcome} />}
        <p className="text-xs text-charcoal-400 mt-1">
          {formatDistanceToNow(new Date(call.started_at), { addSuffix: true })}
        </p>
      </div>

      {/* Actions */}
      {isHovered && (
        <div className="flex items-center gap-1">
          {call.recording_url && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                // Play recording
              }}
              className="p-2 text-charcoal-400 hover:text-charcoal-600 hover:bg-charcoal-100 rounded-lg"
            >
              <Play className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={(e) => e.stopPropagation()}
            className="p-2 text-charcoal-400 hover:text-charcoal-600 hover:bg-charcoal-100 rounded-lg"
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

export function CallHistory({
  accountId,
  entityType,
  entityId,
  limit = 50,
  className,
  onCallClick,
}: CallHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDirection, setFilterDirection] = useState<'all' | 'inbound' | 'outbound'>('all')
  const [filterOutcome, setFilterOutcome] = useState<string>('all')

  // Fetch calls
  const { data: calls, isLoading } = trpc.phone.calls.list.useQuery(
    {
      accountId,
      entityType,
      entityId,
      direction: filterDirection !== 'all' ? filterDirection : undefined,
      search: searchQuery || undefined,
      limit,
    },
    { enabled: !!accountId || (!!entityType && !!entityId) }
  )

  const handleCallClick = useCallback(
    (call: CallLog) => {
      onCallClick?.(call)
    },
    [onCallClick]
  )

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-16', className)}>
        <div className="animate-spin w-6 h-6 border-2 border-charcoal-300 border-t-charcoal-600 rounded-full" />
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Filters */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-charcoal-200">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search calls..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-charcoal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
          />
        </div>

        <select
          value={filterDirection}
          onChange={(e) => setFilterDirection(e.target.value as typeof filterDirection)}
          className="px-3 py-2 text-sm border border-charcoal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
        >
          <option value="all">All Calls</option>
          <option value="inbound">Inbound</option>
          <option value="outbound">Outbound</option>
        </select>
      </div>

      {/* Call List */}
      <div className="flex-1 overflow-y-auto">
        {!calls || calls.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-charcoal-100 flex items-center justify-center mb-4">
              <Phone className="w-8 h-8 text-charcoal-400" />
            </div>
            <p className="text-charcoal-500">No call history</p>
            <p className="text-sm text-charcoal-400 mt-1">
              Calls will appear here after you make or receive them
            </p>
          </div>
        ) : (
          calls.map((call: CallLog) => (
            <CallItem
              key={call.id}
              call={call}
              onClick={() => handleCallClick(call)}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default CallHistory
