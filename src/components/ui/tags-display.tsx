'use client'

import * as React from 'react'
import { X, Plus, Tag, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { formatSnakeCase } from '@/lib/formatters'

// ============================================
// TAGS DISPLAY COMPONENT
// ============================================

export interface TagsDisplayProps {
  /** Array of tags to display */
  value: string[] | null | undefined
  /** Maximum items to show before truncation */
  maxItems?: number
  /** Show count of remaining items */
  showRemainingCount?: boolean
  /** Badge variant */
  variant?: 'default' | 'secondary' | 'outline'
  /** Badge size */
  size?: 'sm' | 'md'
  /** Click handler for individual tag */
  onTagClick?: (tag: string) => void
  /** Click handler for "+N more" */
  onShowAll?: () => void
  /** Format snake_case to Title Case */
  formatTags?: boolean
  /** Empty state text */
  emptyText?: string
  /** Additional className */
  className?: string
}

export function TagsDisplay({
  value,
  maxItems = 3,
  showRemainingCount = true,
  variant = 'secondary',
  size = 'sm',
  onTagClick,
  onShowAll,
  formatTags = true,
  emptyText = 'None',
  className,
}: TagsDisplayProps) {
  if (!value || value.length === 0) {
    return <span className={cn('text-charcoal-400 text-sm', className)}>{emptyText}</span>
  }

  const displayTags = value.slice(0, maxItems)
  const remaining = value.length - maxItems

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  }

  const formatTag = (tag: string) => {
    if (!formatTags) return tag
    return tag.includes('_') ? formatSnakeCase(tag) : tag
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {displayTags.map((tag, index) => (
        <Badge
          key={index}
          variant={variant}
          className={cn(
            sizeClasses[size],
            'font-normal',
            onTagClick && 'cursor-pointer hover:opacity-80 transition-opacity'
          )}
          onClick={onTagClick ? () => onTagClick(tag) : undefined}
        >
          {formatTag(tag)}
        </Badge>
      ))}

      {showRemainingCount && remaining > 0 && (
        <Badge
          variant="outline"
          className={cn(
            sizeClasses[size],
            'font-normal text-charcoal-500',
            onShowAll && 'cursor-pointer hover:bg-charcoal-50 transition-colors'
          )}
          onClick={onShowAll}
        >
          +{remaining}
        </Badge>
      )}
    </div>
  )
}

// ============================================
// TAGS INPUT COMPONENT
// ============================================

export interface TagsInputProps {
  /** Current tags */
  value: string[]
  /** Change handler */
  onChange: (value: string[]) => void
  /** Field label */
  label?: string
  /** Placeholder text */
  placeholder?: string
  /** Maximum number of tags */
  maxTags?: number
  /** Predefined suggestions */
  suggestions?: string[]
  /** Allow custom tags (not in suggestions) */
  allowCustom?: boolean
  /** Disabled state */
  disabled?: boolean
  /** Error message */
  error?: string
  /** Helper text */
  helperText?: string
  /** Required field */
  required?: boolean
  /** Additional className */
  className?: string
}

export function TagsInput({
  value,
  onChange,
  label,
  placeholder = 'Add tag...',
  maxTags,
  suggestions = [],
  allowCustom = true,
  disabled = false,
  error,
  helperText,
  required = false,
  className,
}: TagsInputProps) {
  const [inputValue, setInputValue] = React.useState('')
  const [isOpen, setIsOpen] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const filteredSuggestions = React.useMemo(() => {
    if (!inputValue.trim()) return suggestions.filter((s) => !value.includes(s))
    return suggestions
      .filter((s) => !value.includes(s))
      .filter((s) => s.toLowerCase().includes(inputValue.toLowerCase()))
  }, [inputValue, suggestions, value])

  const canAddMore = !maxTags || value.length < maxTags

  const addTag = (tag: string) => {
    const trimmed = tag.trim()
    if (!trimmed || value.includes(trimmed) || !canAddMore) return

    // If not allowing custom tags, check if it's in suggestions
    if (!allowCustom && !suggestions.includes(trimmed)) return

    onChange([...value, trimmed])
    setInputValue('')
    setIsOpen(false)
  }

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((t) => t !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (allowCustom && inputValue.trim()) {
        addTag(inputValue)
      } else if (filteredSuggestions.length > 0) {
        addTag(filteredSuggestions[0])
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1])
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }

  const hasError = !!error

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="flex items-center gap-1.5 text-sm font-medium text-charcoal-700">
          <Tag className="w-4 h-4 text-charcoal-400" />
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <Popover open={isOpen && (filteredSuggestions.length > 0 || !allowCustom)} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div
            className={cn(
              'min-h-[44px] w-full rounded-sm border bg-white px-3 py-2',
              'flex flex-wrap items-center gap-1.5',
              'focus-within:ring-2 focus-within:ring-gold-500/20 focus-within:border-gold-500',
              'transition-all duration-300',
              hasError && 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500/20',
              disabled && 'opacity-50 cursor-not-allowed bg-charcoal-50'
            )}
            onClick={() => inputRef.current?.focus()}
          >
            {value.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="font-normal gap-1 pr-1"
              >
                {tag.includes('_') ? formatSnakeCase(tag) : tag}
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeTag(tag)
                    }}
                    className="ml-1 text-charcoal-400 hover:text-charcoal-600 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}

            {canAddMore && (
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value)
                  setIsOpen(true)
                }}
                onFocus={() => setIsOpen(true)}
                onKeyDown={handleKeyDown}
                placeholder={value.length === 0 ? placeholder : ''}
                disabled={disabled}
                className={cn(
                  'flex-1 min-w-[100px] outline-none bg-transparent text-sm',
                  'placeholder:text-charcoal-400'
                )}
              />
            )}
          </div>
        </PopoverTrigger>

        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
          sideOffset={4}
        >
          <div className="max-h-[200px] overflow-auto py-1">
            {filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => addTag(suggestion)}
                  className={cn(
                    'w-full px-3 py-2 text-left text-sm',
                    'hover:bg-charcoal-50 transition-colors',
                    'flex items-center justify-between'
                  )}
                >
                  <span>{suggestion.includes('_') ? formatSnakeCase(suggestion) : suggestion}</span>
                  {value.includes(suggestion) && (
                    <Check className="h-4 w-4 text-success-600" />
                  )}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-charcoal-500">
                {allowCustom ? 'Press Enter to add custom tag' : 'No matching suggestions'}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {maxTags && (
        <p className="text-xs text-charcoal-400">
          {value.length}/{maxTags} tags
        </p>
      )}

      {helperText && !error && (
        <p className="text-sm text-charcoal-500">{helperText}</p>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}

// ============================================
// SKILL TAGS WITH PROFICIENCY
// ============================================

export interface SkillTag {
  name: string
  proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  yearsOfExperience?: number
}

export interface SkillTagsDisplayProps {
  skills: SkillTag[] | string[]
  maxItems?: number
  showProficiency?: boolean
  className?: string
}

const proficiencyColors = {
  beginner: 'bg-charcoal-100 text-charcoal-600',
  intermediate: 'bg-blue-100 text-blue-700',
  advanced: 'bg-purple-100 text-purple-700',
  expert: 'bg-gold-100 text-gold-700',
}

export function SkillTagsDisplay({
  skills,
  maxItems = 5,
  showProficiency = true,
  className,
}: SkillTagsDisplayProps) {
  if (!skills || skills.length === 0) {
    return <span className={cn('text-charcoal-400 text-sm', className)}>No skills</span>
  }

  // Normalize to SkillTag[]
  const normalizedSkills: SkillTag[] = skills.map((s) =>
    typeof s === 'string' ? { name: s } : s
  )

  const displaySkills = normalizedSkills.slice(0, maxItems)
  const remaining = normalizedSkills.length - maxItems

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {displaySkills.map((skill, index) => (
        <Badge
          key={index}
          variant="secondary"
          className={cn(
            'font-normal text-xs',
            showProficiency && skill.proficiency && proficiencyColors[skill.proficiency]
          )}
        >
          {skill.name}
          {skill.yearsOfExperience && (
            <span className="ml-1 text-charcoal-400">
              ({skill.yearsOfExperience}y)
            </span>
          )}
        </Badge>
      ))}

      {remaining > 0 && (
        <Badge variant="outline" className="font-normal text-xs text-charcoal-500">
          +{remaining}
        </Badge>
      )}
    </div>
  )
}
