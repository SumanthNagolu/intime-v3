'use client'

import { Badge } from '@/components/ui/badge'
import { StatusConfig } from '@/configs/entities/types'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: string
  config: Record<string, StatusConfig>
  size?: 'sm' | 'default' | 'lg'
  showIcon?: boolean
  className?: string
}

export function StatusBadge({
  status,
  config,
  size = 'default',
  showIcon = true,
  className,
}: StatusBadgeProps) {
  const statusInfo = config[status] || {
    label: status,
    color: 'bg-charcoal-100 text-charcoal-700',
  }

  const Icon = statusInfo.icon

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    default: 'text-sm px-2.5 py-0.5',
    lg: 'text-sm px-3 py-1',
  }

  return (
    <Badge
      className={cn(
        'font-medium border gap-1.5',
        statusInfo.color,
        statusInfo.bgColor,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && Icon && <Icon className="w-3 h-3" />}
      {statusInfo.label}
    </Badge>
  )
}
