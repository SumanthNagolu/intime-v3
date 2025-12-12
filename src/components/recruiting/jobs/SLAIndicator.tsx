'use client'

import { Clock, AlertTriangle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SLAIndicatorProps {
  slaDays: number | null | undefined
  createdAt: string | null | undefined
  status?: string
  size?: 'sm' | 'default'
  showLabel?: boolean
  className?: string
}

export function SLAIndicator({
  slaDays,
  createdAt,
  status,
  size = 'default',
  showLabel = true,
  className,
}: SLAIndicatorProps) {
  // Default SLA to 30 days if not set
  const sla = slaDays ?? 30

  // Calculate days open
  const daysOpen = createdAt
    ? Math.floor((new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  const remaining = sla - daysOpen
  const percentUsed = Math.min(100, Math.max(0, (daysOpen / sla) * 100))

  // Determine status based on remaining days
  const getIndicatorConfig = () => {
    // If job is filled/closed, show completed
    if (status === 'filled' || status === 'closed') {
      return {
        label: 'Filled',
        bgColor: 'bg-green-100',
        textColor: 'text-green-700',
        barColor: 'bg-green-500',
        Icon: CheckCircle,
      }
    }

    // Overdue
    if (remaining < 0) {
      return {
        label: `${Math.abs(remaining)}d over`,
        bgColor: 'bg-red-100',
        textColor: 'text-red-700',
        barColor: 'bg-red-500',
        Icon: AlertTriangle,
      }
    }

    // Critical (less than 20% remaining)
    if (percentUsed >= 80) {
      return {
        label: `${remaining}d left`,
        bgColor: 'bg-red-50',
        textColor: 'text-red-600',
        barColor: 'bg-red-500',
        Icon: AlertTriangle,
      }
    }

    // Warning (50-80% used)
    if (percentUsed >= 50) {
      return {
        label: `${remaining}d left`,
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-600',
        barColor: 'bg-amber-500',
        Icon: Clock,
      }
    }

    // On track (less than 50% used)
    return {
      label: `${remaining}d left`,
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      barColor: 'bg-green-500',
      Icon: Clock,
    }
  }

  const config = getIndicatorConfig()
  const Icon = config.Icon

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Progress bar */}
      <div
        className={cn(
          'relative overflow-hidden rounded-full bg-charcoal-100',
          size === 'sm' ? 'h-1.5 w-12' : 'h-2 w-16'
        )}
      >
        <div
          className={cn('absolute left-0 top-0 h-full rounded-full transition-all duration-300', config.barColor)}
          style={{ width: `${Math.min(100, percentUsed)}%` }}
        />
      </div>

      {/* Label */}
      {showLabel && (
        <span
          className={cn(
            'inline-flex items-center gap-1 font-medium',
            config.textColor,
            size === 'sm' ? 'text-xs' : 'text-xs'
          )}
        >
          <Icon className={cn('flex-shrink-0', size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')} />
          {config.label}
        </span>
      )}
    </div>
  )
}
