'use client'

import Link from 'next/link'
import { Calendar, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { DashboardActionConfig } from './types'

interface DashboardHeaderProps {
  title: string
  description?: string
  breadcrumbs?: Array<{ label: string; href: string }>
  actions?: DashboardActionConfig[]
  dateRangeFilter?: boolean
  dateRange?: string
  onDateRangeChange?: (range: string) => void
  onRefresh?: () => void
  isRefreshing?: boolean
  className?: string
}

export function DashboardHeader({
  title,
  description,
  breadcrumbs,
  actions,
  dateRangeFilter,
  dateRange = '7d',
  onDateRangeChange,
  onRefresh,
  isRefreshing,
  className,
}: DashboardHeaderProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Breadcrumbs removed - sidebar provides navigation context */}

      {/* Title Row */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-charcoal-900 tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-charcoal-500 mt-1">{description}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Date Range Filter */}
          {dateRangeFilter && (
            <Select value={dateRange} onValueChange={onDateRangeChange}>
              <SelectTrigger className="w-[140px]">
                <Calendar className="w-4 h-4 mr-2 text-charcoal-400" />
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="ytd">Year to date</SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* Refresh Button */}
          {onRefresh && (
            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
            </Button>
          )}

          {/* Custom Actions */}
          {actions?.map((action) => {
            const Icon = action.icon
            const button = (
              <Button
                key={action.id}
                variant={action.variant === 'premium' ? 'default' : action.variant || 'default'}
                onClick={action.onClick}
                className={cn(
                  action.variant === 'premium' &&
                    'bg-gradient-to-r from-gold-500 to-gold-600 text-hublot-900 hover:from-gold-600 hover:to-gold-700'
                )}
              >
                {Icon && <Icon className="w-4 h-4 mr-2" />}
                {action.label}
              </Button>
            )

            if (action.href) {
              return (
                <Link key={action.id} href={action.href}>
                  {button}
                </Link>
              )
            }
            return button
          })}
        </div>
      </div>
    </div>
  )
}

