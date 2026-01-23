'use client'

import * as React from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Label } from '@/components/ui/label'

// ============================================
// CASCADE SELECT - Two dependent dropdowns
// ============================================

export interface CascadeOption {
  value: string
  label: string
  description?: string
}

export interface CascadeGroup {
  value: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  options: CascadeOption[]
}

export interface CascadeSelectProps {
  /** Label for the group (category) selector */
  groupLabel?: string
  /** Label for the item selector */
  itemLabel?: string
  /** Placeholder for group selector */
  groupPlaceholder?: string
  /** Placeholder for item selector */
  itemPlaceholder?: string
  /** Available groups with their options */
  groups: CascadeGroup[]
  /** Selected group value */
  selectedGroup?: string
  /** Selected item value */
  selectedItem?: string
  /** Handler for group change */
  onGroupChange?: (value: string) => void
  /** Handler for item change */
  onItemChange?: (value: string) => void
  /** Combined handler for when final selection is made */
  onChange?: (group: string, item: string) => void
  /** Disabled state */
  disabled?: boolean
  /** Error message */
  error?: string
  /** Show descriptions in item dropdown */
  showDescriptions?: boolean
  /** Layout direction */
  layout?: 'horizontal' | 'vertical'
  /** Additional className */
  className?: string
}

export function CascadeSelect({
  groupLabel = 'Category',
  itemLabel = 'Type',
  groupPlaceholder = 'Select category...',
  itemPlaceholder = 'Select type...',
  groups,
  selectedGroup,
  selectedItem,
  onGroupChange,
  onItemChange,
  onChange,
  disabled = false,
  error,
  showDescriptions = true,
  layout = 'horizontal',
  className,
}: CascadeSelectProps) {
  const [groupOpen, setGroupOpen] = React.useState(false)
  const [itemOpen, setItemOpen] = React.useState(false)

  // Get current group's options
  const currentGroup = groups.find((g) => g.value === selectedGroup)
  const currentOptions = currentGroup?.options || []
  const currentItem = currentOptions.find((o) => o.value === selectedItem)

  // Get selected group display
  const selectedGroupDisplay = currentGroup ? (
    <span className="flex items-center gap-2">
      {currentGroup.icon && <currentGroup.icon className="w-4 h-4 text-charcoal-500" />}
      {currentGroup.label}
    </span>
  ) : null

  const handleGroupSelect = (value: string) => {
    onGroupChange?.(value)
    // Clear item selection when group changes
    onItemChange?.('')
    setGroupOpen(false)
    // Auto-open item dropdown after selecting group
    setTimeout(() => setItemOpen(true), 100)
  }

  const handleItemSelect = (value: string) => {
    onItemChange?.(value)
    onChange?.(selectedGroup || '', value)
    setItemOpen(false)
  }

  return (
    <div
      className={cn(
        'space-y-3',
        layout === 'horizontal' && 'md:flex md:space-y-0 md:gap-4',
        className
      )}
    >
      {/* Group (Category) Select */}
      <div className={cn('space-y-1.5', layout === 'horizontal' && 'md:flex-1')}>
        <Label className="text-[11px] font-medium text-charcoal-500 uppercase tracking-wider">
          {groupLabel}
        </Label>
        <Popover open={groupOpen} onOpenChange={setGroupOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={groupOpen}
              disabled={disabled}
              className={cn(
                'w-full justify-between h-11 font-normal',
                !selectedGroup && 'text-charcoal-400',
                error && 'border-red-500'
              )}
            >
              {selectedGroupDisplay || groupPlaceholder}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] p-0" align="start">
            <Command>
              <CommandInput placeholder={`Search ${groupLabel.toLowerCase()}...`} />
              <CommandList>
                <CommandEmpty>No {groupLabel.toLowerCase()} found.</CommandEmpty>
                <CommandGroup>
                  {groups.map((group) => (
                    <CommandItem
                      key={group.value}
                      value={group.value}
                      onSelect={handleGroupSelect}
                      className="flex items-center gap-2"
                    >
                      {group.icon && <group.icon className="w-4 h-4 text-charcoal-500" />}
                      <span>{group.label}</span>
                      <Check
                        className={cn(
                          'ml-auto h-4 w-4',
                          selectedGroup === group.value ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Item (Type) Select */}
      <div className={cn('space-y-1.5', layout === 'horizontal' && 'md:flex-1')}>
        <Label className="text-[11px] font-medium text-charcoal-500 uppercase tracking-wider">
          {itemLabel}
        </Label>
        <Popover open={itemOpen} onOpenChange={setItemOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={itemOpen}
              disabled={disabled || !selectedGroup}
              className={cn(
                'w-full justify-between h-11 font-normal',
                !selectedItem && 'text-charcoal-400',
                error && 'border-red-500'
              )}
            >
              {currentItem?.label || itemPlaceholder}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[320px] p-0" align="start">
            <Command>
              <CommandInput placeholder={`Search ${itemLabel.toLowerCase()}...`} />
              <CommandList>
                <CommandEmpty>No {itemLabel.toLowerCase()} found.</CommandEmpty>
                <CommandGroup>
                  {currentOptions.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={handleItemSelect}
                      className="flex flex-col items-start gap-0.5 py-2"
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className="font-medium">{option.label}</span>
                        <Check
                          className={cn(
                            'h-4 w-4',
                            selectedItem === option.value ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                      </div>
                      {showDescriptions && option.description && (
                        <span className="text-xs text-charcoal-500">{option.description}</span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {error && <p className="text-sm text-red-500 col-span-full">{error}</p>}
    </div>
  )
}

// ============================================
// SIMPLE SELECT - Single dropdown with groups
// ============================================

export interface GroupedSelectProps {
  /** Field label */
  label?: string
  /** Placeholder text */
  placeholder?: string
  /** Options grouped by category */
  groups: CascadeGroup[]
  /** Selected value */
  value?: string
  /** Change handler */
  onChange?: (value: string) => void
  /** Disabled state */
  disabled?: boolean
  /** Error message */
  error?: string
  /** Show descriptions */
  showDescriptions?: boolean
  /** Additional className */
  className?: string
}

export function GroupedSelect({
  label,
  placeholder = 'Select...',
  groups,
  value,
  onChange,
  disabled = false,
  error,
  showDescriptions = true,
  className,
}: GroupedSelectProps) {
  const [open, setOpen] = React.useState(false)

  // Find selected option across all groups
  const selectedOption = React.useMemo(() => {
    for (const group of groups) {
      const found = group.options.find((o) => o.value === value)
      if (found) return { ...found, group }
    }
    return null
  }, [groups, value])

  const handleSelect = (newValue: string) => {
    onChange?.(newValue)
    setOpen(false)
  }

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <Label className="text-[11px] font-medium text-charcoal-500 uppercase tracking-wider">
          {label}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              'w-full justify-between h-11 font-normal',
              !value && 'text-charcoal-400',
              error && 'border-red-500'
            )}
          >
            {selectedOption ? (
              <span className="flex items-center gap-2">
                {selectedOption.group.icon && (
                  <selectedOption.group.icon className="w-4 h-4 text-charcoal-500" />
                )}
                {selectedOption.label}
              </span>
            ) : (
              placeholder
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[360px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search..." />
            <CommandList>
              <CommandEmpty>No options found.</CommandEmpty>
              {groups.map((group) => (
                <CommandGroup
                  key={group.value}
                  heading={
                    <span className="flex items-center gap-2">
                      {group.icon && <group.icon className="w-3.5 h-3.5" />}
                      {group.label}
                    </span>
                  }
                >
                  {group.options.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={handleSelect}
                      className="flex flex-col items-start gap-0.5 py-2"
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className="font-medium">{option.label}</span>
                        <Check
                          className={cn(
                            'h-4 w-4',
                            value === option.value ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                      </div>
                      {showDescriptions && option.description && (
                        <span className="text-xs text-charcoal-500 line-clamp-1">
                          {option.description}
                        </span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
