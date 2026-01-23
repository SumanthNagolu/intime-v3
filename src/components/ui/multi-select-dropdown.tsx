'use client'

import * as React from 'react'
import { Check, ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Label } from '@/components/ui/label'

// ============================================
// MULTI-SELECT DROPDOWN
// Compact dropdown for selecting multiple items
// ============================================

export interface MultiSelectOption {
  value: string
  label: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  group?: string
}

export interface MultiSelectDropdownProps {
  /** Field label */
  label?: string
  /** Placeholder when nothing selected */
  placeholder?: string
  /** Available options */
  options: MultiSelectOption[]
  /** Selected values */
  value: string[]
  /** Change handler */
  onChange: (value: string[]) => void
  /** Disabled state */
  disabled?: boolean
  /** Max items to show in collapsed view */
  maxDisplay?: number
  /** Allow "select all" action */
  showSelectAll?: boolean
  /** Allow "clear all" action */
  showClearAll?: boolean
  /** Error message */
  error?: string
  /** Helper text */
  helperText?: string
  /** Layout: vertical (label above) or horizontal (label on left) */
  layout?: 'vertical' | 'horizontal'
  /** Additional className */
  className?: string
}

export function MultiSelectDropdown({
  label,
  placeholder = 'Select items...',
  options,
  value,
  onChange,
  disabled = false,
  maxDisplay = 3,
  showSelectAll = true,
  showClearAll = true,
  error,
  helperText,
  layout = 'vertical',
  className,
}: MultiSelectDropdownProps) {
  const [open, setOpen] = React.useState(false)

  // Get selected options for display
  const selectedOptions = options.filter((opt) => value.includes(opt.value))

  // Group options if they have groups
  const hasGroups = options.some((opt) => opt.group)
  const groupedOptions = React.useMemo(() => {
    if (!hasGroups) return null
    return options.reduce<Record<string, MultiSelectOption[]>>((acc, opt) => {
      const group = opt.group || 'Other'
      if (!acc[group]) acc[group] = []
      acc[group].push(opt)
      return acc
    }, {})
  }, [options, hasGroups])

  const handleSelect = (optionValue: string) => {
    const isSelected = value.includes(optionValue)
    if (isSelected) {
      onChange(value.filter((v) => v !== optionValue))
    } else {
      onChange([...value, optionValue])
    }
  }

  const handleSelectAll = () => {
    onChange(options.map((o) => o.value))
  }

  const handleClearAll = () => {
    onChange([])
  }

  const handleRemove = (optionValue: string) => {
    onChange(value.filter((v) => v !== optionValue))
  }

  // Render display content
  const renderDisplay = () => {
    if (selectedOptions.length === 0) {
      return <span className="text-charcoal-400">{placeholder}</span>
    }

    if (selectedOptions.length <= maxDisplay) {
      return (
        <div className="flex flex-wrap gap-1">
          {selectedOptions.map((opt) => (
            <Badge
              key={opt.value}
              variant="secondary"
              className="font-normal py-0.5 px-2 text-xs"
            >
              {opt.label}
            </Badge>
          ))}
        </div>
      )
    }

    return (
      <span className="text-charcoal-700">
        {selectedOptions.length} selected
      </span>
    )
  }

  const content = (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              'justify-between h-11 font-normal min-w-[200px]',
              layout === 'horizontal' ? 'flex-1' : 'w-full',
              error && 'border-red-500'
            )}
          >
            {renderDisplay()}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search..." />
            <CommandList>
              <CommandEmpty>No options found.</CommandEmpty>

              {/* Select All / Clear All */}
              {(showSelectAll || showClearAll) && (
                <>
                  <CommandGroup>
                    <div className="flex gap-2 px-2 py-1.5">
                      {showSelectAll && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleSelectAll}
                          className="h-7 text-xs"
                        >
                          Select All
                        </Button>
                      )}
                      {showClearAll && value.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleClearAll}
                          className="h-7 text-xs text-charcoal-500"
                        >
                          Clear All
                        </Button>
                      )}
                    </div>
                  </CommandGroup>
                  <CommandSeparator />
                </>
              )}

              {/* Options */}
              {hasGroups && groupedOptions ? (
                Object.entries(groupedOptions).map(([group, groupOptions]) => (
                  <CommandGroup key={group} heading={group}>
                    {groupOptions.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={() => handleSelect(option.value)}
                      >
                        <div
                          className={cn(
                            'mr-2 flex h-4 w-4 items-center justify-center rounded border border-charcoal-300',
                            value.includes(option.value)
                              ? 'bg-hublot-900 border-hublot-900 text-white'
                              : 'opacity-50'
                          )}
                        >
                          <Check className="h-3 w-3" />
                        </div>
                        <span>{option.label}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))
              ) : (
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => handleSelect(option.value)}
                    >
                      <div
                        className={cn(
                          'mr-2 flex h-4 w-4 items-center justify-center rounded border border-charcoal-300',
                          value.includes(option.value)
                            ? 'bg-hublot-900 border-hublot-900 text-white'
                            : 'opacity-50'
                        )}
                      >
                        <Check className="h-3 w-3" />
                      </div>
                      {option.icon && <option.icon className="mr-2 h-4 w-4" />}
                      <span>{option.label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected items pills (for easy removal) */}
      {selectedOptions.length > 0 && selectedOptions.length <= 10 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selectedOptions.map((opt) => (
            <Badge
              key={opt.value}
              variant="outline"
              className="font-normal py-0.5 pl-2 pr-1 text-xs gap-1 hover:bg-charcoal-100"
            >
              {opt.label}
              <button
                type="button"
                onClick={() => handleRemove(opt.value)}
                className="ml-0.5 rounded-full hover:bg-charcoal-200 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {helperText && !error && (
        <p className="text-xs text-charcoal-500 mt-1">{helperText}</p>
      )}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </>
  )

  if (layout === 'horizontal') {
    return (
      <div className={cn('flex items-start gap-4', className)}>
        {label && (
          <Label className="text-sm font-medium text-charcoal-700 w-32 pt-2.5 shrink-0">
            {label}
          </Label>
        )}
        <div className="flex-1">{content}</div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <Label className="text-[11px] font-medium text-charcoal-500 uppercase tracking-wider">
          {label}
        </Label>
      )}
      {content}
    </div>
  )
}

// ============================================
// SIMPLE CHECKBOX LIST
// For small number of options (2-5 items)
// ============================================

export interface CheckboxListProps {
  label?: string
  options: MultiSelectOption[]
  value: string[]
  onChange: (value: string[]) => void
  disabled?: boolean
  layout?: 'vertical' | 'horizontal'
  columns?: 1 | 2 | 3 | 4
  className?: string
}

export function CheckboxList({
  label,
  options,
  value,
  onChange,
  disabled = false,
  layout = 'vertical',
  columns = 1,
  className,
}: CheckboxListProps) {
  const handleToggle = (optionValue: string) => {
    const isSelected = value.includes(optionValue)
    if (isSelected) {
      onChange(value.filter((v) => v !== optionValue))
    } else {
      onChange([...value, optionValue])
    }
  }

  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  }

  const content = (
    <div className={cn('grid gap-2', columnClasses[columns])}>
      {options.map((option) => {
        const isSelected = value.includes(option.value)
        return (
          <label
            key={option.value}
            className={cn(
              'flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all duration-200',
              isSelected
                ? 'border-hublot-900 bg-charcoal-50'
                : 'border-charcoal-200 hover:border-charcoal-300',
              disabled && 'cursor-not-allowed opacity-60'
            )}
          >
            <div
              className={cn(
                'flex h-4 w-4 items-center justify-center rounded border transition-colors',
                isSelected
                  ? 'bg-hublot-900 border-hublot-900 text-white'
                  : 'border-charcoal-300'
              )}
            >
              {isSelected && <Check className="h-3 w-3" />}
            </div>
            <span className="text-sm text-charcoal-700">{option.label}</span>
          </label>
        )
      })}
    </div>
  )

  if (layout === 'horizontal') {
    return (
      <div className={cn('flex items-start gap-4', className)}>
        {label && (
          <Label className="text-sm font-medium text-charcoal-700 w-32 pt-2 shrink-0">
            {label}
          </Label>
        )}
        <div className="flex-1">{content}</div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <Label className="text-[11px] font-medium text-charcoal-500 uppercase tracking-wider">
          {label}
        </Label>
      )}
      {content}
    </div>
  )
}
