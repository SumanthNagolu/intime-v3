'use client'

import * as React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export interface FilterOption {
  value: string
  label: string
  count: number
  countColor?: 'default' | 'red' | 'green'
  separator?: boolean  // Show separator line before this option
}

export interface FilterDropdownProps {
  options: FilterOption[]
  value: string
  onChange: (value: string) => void
  label?: string
  storageKey?: string  // For session storage persistence
  className?: string
}

export function FilterDropdown({
  options,
  value,
  onChange,
  label = 'Filter',
  storageKey,
  className,
}: FilterDropdownProps) {
  const selected = options.find((o) => o.value === value)

  // Persist to session storage
  React.useEffect(() => {
    if (storageKey && value) {
      sessionStorage.setItem(storageKey, value)
    }
  }, [storageKey, value])

  // Restore from session storage on mount
  React.useEffect(() => {
    if (storageKey) {
      const stored = sessionStorage.getItem(storageKey)
      if (stored && options.some((o) => o.value === stored)) {
        onChange(stored)
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const formatCount = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-sm text-charcoal-500">{label}:</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[240px] bg-white">
          <SelectValue>
            <span className="flex items-center gap-2">
              <span>{selected?.label}</span>
              {selected && (
                <span
                  className={cn(
                    'text-sm',
                    selected.countColor === 'red' && 'text-error-600 font-medium',
                    selected.countColor === 'green' && 'text-success-600 font-medium',
                    !selected.countColor && 'text-charcoal-500'
                  )}
                >
                  ({formatCount(selected.count)})
                </span>
              )}
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option, index) => (
            <React.Fragment key={option.value}>
              {option.separator && index > 0 && (
                <div className="my-1 border-t border-charcoal-200" />
              )}
              <SelectItem value={option.value}>
                <span className="flex items-center justify-between w-full gap-4">
                  <span>{option.label}</span>
                  <span
                    className={cn(
                      'text-sm tabular-nums',
                      option.countColor === 'red' && 'text-error-600 font-medium',
                      option.countColor === 'green' && 'text-success-600 font-medium',
                      !option.countColor && 'text-charcoal-500'
                    )}
                  >
                    ({formatCount(option.count)})
                  </span>
                </span>
              </SelectItem>
            </React.Fragment>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
