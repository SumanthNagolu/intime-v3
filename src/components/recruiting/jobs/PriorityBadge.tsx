'use client'

import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

// Priority rank configuration matching jobs.config.ts
const PRIORITY_RANK_CONFIG: Record<number, { label: string; bgColor: string; textColor: string; showIcon?: boolean }> = {
  1: {
    label: 'Critical',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    showIcon: true,
  },
  2: {
    label: 'High',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    showIcon: true,
  },
  3: {
    label: 'Normal',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
  },
  4: {
    label: 'Low',
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-600',
  },
  0: {
    label: 'Unset',
    bgColor: 'bg-charcoal-50',
    textColor: 'text-charcoal-500',
  },
}

interface PriorityBadgeProps {
  rank: number | null | undefined
  size?: 'sm' | 'default'
  className?: string
}

export function PriorityBadge({ rank, size = 'default', className }: PriorityBadgeProps) {
  const priorityRank = rank ?? 0
  const config = PRIORITY_RANK_CONFIG[priorityRank] || PRIORITY_RANK_CONFIG[0]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        config.bgColor,
        config.textColor,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        className
      )}
    >
      {config.showIcon && <AlertCircle className={cn('flex-shrink-0', size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')} />}
      {config.label}
    </span>
  )
}
