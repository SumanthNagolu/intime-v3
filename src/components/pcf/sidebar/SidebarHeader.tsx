'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface SidebarHeaderProps {
  entityName: string
  entitySubtitle?: string
  entityStatus: string
  backHref: string
  backLabel?: string
  statusConfig?: Record<string, { label: string; color: string }>
  className?: string
}

// Default status colors
const defaultStatusColors: Record<string, string> = {
  draft: 'bg-charcoal-100 text-charcoal-700 border-charcoal-200',
  open: 'bg-blue-100 text-blue-700 border-blue-200',
  active: 'bg-green-100 text-green-700 border-green-200',
  paused: 'bg-amber-100 text-amber-700 border-amber-200',
  completed: 'bg-purple-100 text-purple-700 border-purple-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
  closed: 'bg-charcoal-100 text-charcoal-600 border-charcoal-200',
}

export function SidebarHeader({
  entityName,
  entitySubtitle,
  entityStatus,
  backHref,
  backLabel = 'Back',
  statusConfig,
  className,
}: SidebarHeaderProps) {
  // Get status display info
  const statusInfo = statusConfig?.[entityStatus]
  const statusLabel = statusInfo?.label || entityStatus.replace(/_/g, ' ')
  const statusColor = statusInfo?.color || defaultStatusColors[entityStatus] || defaultStatusColors.draft

  return (
    <div className={cn('border-b border-charcoal-100', className)}>
      {/* Back Link */}
      <div className="px-4 pt-4 pb-2">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm text-charcoal-500 hover:text-charcoal-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {backLabel}
        </Link>
      </div>

      {/* Entity Header */}
      <div className="px-4 pb-4">
        <h2 className="font-heading font-semibold text-charcoal-900 truncate text-base">
          {entityName}
        </h2>
        {entitySubtitle && (
          <p className="text-sm text-charcoal-500 truncate mt-0.5">
            {entitySubtitle}
          </p>
        )}
        <div className="mt-2">
          <Badge className={cn('font-medium border capitalize', statusColor)}>
            {statusLabel}
          </Badge>
        </div>
      </div>
    </div>
  )
}

