'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { FilterConfig } from '@/configs/entities/types'
import { cn } from '@/lib/utils'

interface ListFiltersProps {
  filters: FilterConfig[]
  values: Record<string, unknown>
  onChange: (key: string, value: unknown) => void
  className?: string
}

export function ListFilters({
  filters,
  values,
  onChange,
  className,
}: ListFiltersProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row gap-4 mb-6', className)}>
      {filters.map((filter) => {
        switch (filter.type) {
          case 'search':
            return (
              <div key={filter.key} className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                <Input
                  placeholder={filter.placeholder || `Search ${filter.label.toLowerCase()}...`}
                  value={(values[filter.key] as string) || ''}
                  onChange={(e) => onChange(filter.key, e.target.value)}
                  className="pl-10"
                />
              </div>
            )

          case 'select':
            return (
              <Select
                key={filter.key}
                value={(values[filter.key] as string) || 'all'}
                onValueChange={(value) => onChange(filter.key, value === 'all' ? '' : value)}
              >
                <SelectTrigger className={cn('w-[180px]', filter.width)}>
                  <SelectValue placeholder={filter.placeholder || filter.label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All {filter.label}</SelectItem>
                  {filter.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )

          case 'toggle':
            return (
              <div key={filter.key} className="flex items-center gap-2">
                <Switch
                  id={filter.key}
                  checked={Boolean(values[filter.key])}
                  onCheckedChange={(checked) => onChange(filter.key, checked)}
                />
                <Label htmlFor={filter.key} className="text-sm text-charcoal-600">
                  {filter.label}
                </Label>
              </div>
            )

          default:
            return null
        }
      })}
    </div>
  )
}
