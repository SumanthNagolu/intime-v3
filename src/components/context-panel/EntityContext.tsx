'use client'

import { memo } from 'react'
import Link from 'next/link'
import {
  Building2,
  Briefcase,
  Calendar,
  ChevronRight,
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  Star,
  User,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

// ============================================
// Types
// ============================================

export interface EntityContextData {
  id: string
  type: string
  name: string
  subtitle?: string
  status?: string
  statusColor?: 'success' | 'warning' | 'error' | 'info' | 'neutral'

  // Contact info
  email?: string
  phone?: string
  location?: string

  // Metadata
  createdAt?: string
  updatedAt?: string

  // Owner/assignee
  owner?: {
    id: string
    name: string
    avatarUrl?: string
  }

  // Quick facts (key-value pairs)
  quickFacts?: Array<{
    label: string
    value: string | number
    icon?: typeof Building2
  }>

  // Related counts
  relatedCounts?: Array<{
    label: string
    count: number
    href?: string
  }>

  // Custom metadata
  metadata?: Record<string, unknown>
}

interface EntityContextProps {
  data: EntityContextData
  isLoading?: boolean
  isPinned?: boolean
  onPin?: () => void
  className?: string
}

// ============================================
// Helper Components
// ============================================

const StatusBadge = memo(function StatusBadge({
  status,
  color = 'neutral',
}: {
  status: string
  color?: EntityContextData['statusColor']
}) {
  const colorClasses = {
    success: 'bg-success-50 text-success-700 border-success-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    error: 'bg-error-50 text-error-700 border-error-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    neutral: 'bg-charcoal-100 text-charcoal-700 border-charcoal-200',
  }

  const dotClasses = {
    success: 'bg-success-500',
    warning: 'bg-amber-500',
    error: 'bg-error-500',
    info: 'bg-blue-500',
    neutral: 'bg-charcoal-400',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded border',
        colorClasses[color]
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', dotClasses[color])} />
      {status}
    </span>
  )
})

const EntityTypeIcon = memo(function EntityTypeIcon({
  type,
  className,
}: {
  type: string
  className?: string
}) {
  const iconProps = { className: cn('w-5 h-5', className) }

  switch (type) {
    case 'account':
      return <Building2 {...iconProps} />
    case 'contact':
    case 'candidate':
      return <User {...iconProps} />
    case 'job':
      return <Briefcase {...iconProps} />
    case 'lead':
    case 'deal':
      return <Star {...iconProps} />
    default:
      return <Building2 {...iconProps} />
  }
})

// ============================================
// Main Component
// ============================================

export const EntityContext = memo(function EntityContext({
  data,
  isLoading = false,
  isPinned = false,
  onPin,
  className,
}: EntityContextProps) {
  const basePath = getEntityBasePath(data.type)

  if (isLoading) {
    return (
      <div className={cn('animate-pulse space-y-4 p-4', className)}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-charcoal-200 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-charcoal-200 rounded w-3/4" />
            <div className="h-3 bg-charcoal-200 rounded w-1/2" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-charcoal-200 rounded" />
          <div className="h-3 bg-charcoal-200 rounded w-5/6" />
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="px-4 pt-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="w-12 h-12 rounded-lg bg-charcoal-100 flex items-center justify-center flex-shrink-0">
            <EntityTypeIcon type={data.type} className="text-charcoal-600" />
          </div>

          {/* Title and subtitle */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-charcoal-900 truncate">
                {data.name}
              </h3>
              {onPin && (
                <button
                  onClick={onPin}
                  className={cn(
                    'p-1 rounded transition-colors',
                    isPinned
                      ? 'text-gold-500 hover:text-gold-600'
                      : 'text-charcoal-300 hover:text-charcoal-500'
                  )}
                  title={isPinned ? 'Unpin' : 'Pin'}
                >
                  <Star className={cn('w-4 h-4', isPinned && 'fill-current')} />
                </button>
              )}
            </div>
            {data.subtitle && (
              <p className="text-sm text-charcoal-500 truncate">{data.subtitle}</p>
            )}
            {data.status && (
              <div className="mt-1.5">
                <StatusBadge status={data.status} color={data.statusColor} />
              </div>
            )}
          </div>
        </div>

        {/* Open in full view */}
        {basePath && (
          <Link
            href={`${basePath}/${data.id}`}
            className={cn(
              'mt-3 inline-flex items-center gap-1.5 text-xs font-medium',
              'text-charcoal-500 hover:text-charcoal-700 transition-colors'
            )}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open full view
          </Link>
        )}
      </div>

      {/* Contact Info */}
      {(data.email || data.phone || data.location) && (
        <div className="px-4 py-3 bg-charcoal-50 border-y border-charcoal-100">
          <div className="space-y-2">
            {data.email && (
              <a
                href={`mailto:${data.email}`}
                className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-charcoal-900 transition-colors"
              >
                <Mail className="w-4 h-4 text-charcoal-400" />
                <span className="truncate">{data.email}</span>
              </a>
            )}
            {data.phone && (
              <a
                href={`tel:${data.phone}`}
                className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-charcoal-900 transition-colors"
              >
                <Phone className="w-4 h-4 text-charcoal-400" />
                <span>{data.phone}</span>
              </a>
            )}
            {data.location && (
              <div className="flex items-center gap-2 text-sm text-charcoal-600">
                <MapPin className="w-4 h-4 text-charcoal-400" />
                <span className="truncate">{data.location}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Owner */}
      {data.owner && (
        <div className="px-4">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-charcoal-50">
            <div className="w-8 h-8 rounded-full bg-charcoal-200 flex items-center justify-center flex-shrink-0">
              {data.owner.avatarUrl ? (
                <img
                  src={data.owner.avatarUrl}
                  alt={data.owner.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <span className="text-xs font-medium text-charcoal-600">
                  {data.owner.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-charcoal-500 uppercase tracking-wider">
                Owner
              </p>
              <p className="text-sm font-medium text-charcoal-900 truncate">
                {data.owner.name}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Facts */}
      {data.quickFacts && data.quickFacts.length > 0 && (
        <div className="px-4">
          <h4 className="text-[10px] font-semibold text-charcoal-500 uppercase tracking-wider mb-2">
            Quick Facts
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {data.quickFacts.map((fact) => {
              const Icon = fact.icon || Building2
              return (
                <div
                  key={fact.label}
                  className="flex items-center gap-2 p-2 rounded-lg bg-charcoal-50"
                >
                  <Icon className="w-4 h-4 text-charcoal-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-charcoal-500 truncate">
                      {fact.label}
                    </p>
                    <p className="text-sm font-medium text-charcoal-900 truncate">
                      {fact.value}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Related Counts */}
      {data.relatedCounts && data.relatedCounts.length > 0 && (
        <div className="px-4 pb-4">
          <h4 className="text-[10px] font-semibold text-charcoal-500 uppercase tracking-wider mb-2">
            Related
          </h4>
          <div className="space-y-1">
            {data.relatedCounts.map((related) => (
              <Link
                key={related.label}
                href={related.href || '#'}
                className={cn(
                  'flex items-center justify-between px-3 py-2 rounded-lg transition-colors',
                  'text-sm text-charcoal-700 hover:bg-charcoal-50',
                  !related.href && 'pointer-events-none'
                )}
              >
                <span>{related.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{related.count}</span>
                  {related.href && (
                    <ChevronRight className="w-4 h-4 text-charcoal-400" />
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Timestamps */}
      {(data.createdAt || data.updatedAt) && (
        <div className="px-4 pb-4 pt-2 border-t border-charcoal-100">
          <div className="space-y-1 text-xs text-charcoal-500">
            {data.createdAt && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  Created {formatDistanceToNow(new Date(data.createdAt), { addSuffix: true })}
                </span>
              </div>
            )}
            {data.updatedAt && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  Updated {formatDistanceToNow(new Date(data.updatedAt), { addSuffix: true })}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
})

// ============================================
// Helper Functions
// ============================================

function getEntityBasePath(entityType: string): string | null {
  const paths: Record<string, string> = {
    job: '/employee/ats/jobs',
    candidate: '/employee/ats/candidates',
    submission: '/employee/ats/submissions',
    interview: '/employee/ats/interviews',
    placement: '/employee/ats/placements',
    account: '/employee/crm/accounts',
    contact: '/employee/crm/contacts',
    deal: '/employee/crm/deals',
    lead: '/employee/crm/leads',
    campaign: '/employee/crm/campaigns',
    activity: '/employee/activities',
  }

  return paths[entityType] ?? null
}

export default EntityContext
