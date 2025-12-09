'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyStateConfig } from '@/configs/entities/types'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface EmptyStateProps {
  config: EmptyStateConfig
  filters?: Record<string, unknown>
  className?: string
  variant?: 'card' | 'inline'
}

export function EmptyState({
  config,
  filters = {},
  className,
  variant = 'card',
}: EmptyStateProps) {
  const Icon = config.icon
  const hasActiveFilters = Object.values(filters).some(
    (v) => v !== undefined && v !== '' && v !== 'all'
  )

  const description =
    typeof config.description === 'function'
      ? config.description(filters)
      : config.description

  const content = (
    <div className={cn('text-center py-12', className)}>
      <Icon className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
      <h3 className="text-lg font-medium text-charcoal-900 mb-2">
        {config.title}
      </h3>
      <p className="text-charcoal-500 mb-4 max-w-md mx-auto">{description}</p>
      {config.action && !hasActiveFilters && (
        config.action.href ? (
          <Link href={config.action.href}>
            <Button>{config.action.label}</Button>
          </Link>
        ) : (
          <Button onClick={config.action.onClick}>{config.action.label}</Button>
        )
      )}
    </div>
  )

  if (variant === 'card') {
    return (
      <Card className="bg-white">
        <CardContent>{content}</CardContent>
      </Card>
    )
  }

  return content
}
