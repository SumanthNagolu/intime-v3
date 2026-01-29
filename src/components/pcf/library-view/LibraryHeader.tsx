'use client'

import Link from 'next/link'
import { Search, Grid, List, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { LibraryFilterConfig } from './types'

interface LibraryHeaderProps {
  title: string
  description?: string
  breadcrumbs?: Array<{ label: string; href: string }>
  
  // Search
  search?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  
  // Filters
  filters?: LibraryFilterConfig[]
  filterValues?: Record<string, unknown>
  onFilterChange?: (filterId: string, value: unknown) => void
  
  // Display mode
  displayMode?: 'grid' | 'list'
  onDisplayModeChange?: (mode: 'grid' | 'list') => void
  
  // Create action
  createAction?: {
    label: string
    icon?: React.ComponentType<{ className?: string }>
    onClick?: () => void
    href?: string
  }
  
  className?: string
}

export function LibraryHeader({
  title,
  description,
  breadcrumbs,
  search,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters,
  filterValues,
  onFilterChange,
  displayMode = 'grid',
  onDisplayModeChange,
  createAction,
  className,
}: LibraryHeaderProps) {
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

        {/* Create Action */}
        {createAction && (
          createAction.href ? (
            <Link href={createAction.href}>
              <Button className="gap-2">
                {createAction.icon ? (
                  <createAction.icon className="w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {createAction.label}
              </Button>
            </Link>
          ) : (
            <Button onClick={createAction.onClick} className="gap-2">
              {createAction.icon ? (
                <createAction.icon className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {createAction.label}
            </Button>
          )
        )}
      </div>

      {/* Filters Row */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-charcoal-400" />
          <Input
            placeholder={searchPlaceholder}
            value={search || ''}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Dynamic Filters */}
        {filters?.map((filter) => (
          <Select
            key={filter.id}
            value={(filterValues?.[filter.id] as string) || ''}
            onValueChange={(value) => onFilterChange?.(filter.id, value)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              {filter.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Display Mode Toggle */}
        {onDisplayModeChange && (
          <div className="flex items-center border border-charcoal-200 rounded-lg p-0.5">
            <Button
              variant={displayMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => onDisplayModeChange('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={displayMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => onDisplayModeChange('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

