'use client'

import * as React from 'react'
import { X, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export interface TagInputProps {
  /** Field label */
  label?: string
  /** Placeholder text */
  placeholder?: string
  /** Current tags */
  value: string[]
  /** Change handler */
  onChange: (value: string[]) => void
  /** Disabled state */
  disabled?: boolean
  /** Max number of tags allowed */
  maxTags?: number
  /** Error message */
  error?: string
  /** Helper text */
  helperText?: string
  /** Additional className */
  className?: string
}

export function TagInput({
  label,
  placeholder = 'Type and press Enter to add...',
  value = [],
  onChange,
  disabled = false,
  maxTags,
  error,
  helperText,
  className,
}: TagInputProps) {
  const [inputValue, setInputValue] = React.useState('')
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag()
    } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      // Remove last tag when backspace is pressed with empty input
      removeTag(value[value.length - 1])
    }
  }

  const addTag = () => {
    const trimmed = inputValue.trim()
    if (!trimmed) return
    if (maxTags && value.length >= maxTags) return
    if (value.includes(trimmed)) {
      setInputValue('')
      return
    }

    onChange([...value, trimmed])
    setInputValue('')
  }

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag))
  }

  const handleContainerClick = () => {
    inputRef.current?.focus()
  }

  const canAddMore = !maxTags || value.length < maxTags

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <Label className="text-[11px] font-medium text-charcoal-500 uppercase tracking-wider">
          {label}
        </Label>
      )}

      <div
        onClick={handleContainerClick}
        className={cn(
          'min-h-[44px] w-full rounded-md border bg-white px-3 py-2 text-sm transition-colors cursor-text',
          'focus-within:ring-2 focus-within:ring-gold-500/20 focus-within:border-gold-500',
          disabled && 'cursor-not-allowed opacity-60 bg-charcoal-50',
          error ? 'border-red-500' : 'border-charcoal-200'
        )}
      >
        <div className="flex flex-wrap gap-1.5 items-center">
          {/* Tags */}
          {value.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="font-normal py-0.5 pl-2 pr-1 text-xs gap-1 bg-charcoal-100 hover:bg-charcoal-200 transition-colors"
            >
              {tag}
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeTag(tag)
                  }}
                  className="ml-0.5 rounded-full hover:bg-charcoal-300 p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}

          {/* Input */}
          {canAddMore && !disabled && (
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={addTag}
              placeholder={value.length === 0 ? placeholder : 'Add more...'}
              disabled={disabled}
              className="flex-1 min-w-[120px] bg-transparent outline-none text-sm placeholder:text-charcoal-400"
            />
          )}
        </div>
      </div>

      {/* Helper/Error text */}
      {helperText && !error && (
        <p className="text-xs text-charcoal-500">{helperText}</p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
      {maxTags && (
        <p className="text-xs text-charcoal-400">
          {value.length}/{maxTags} tags
        </p>
      )}
    </div>
  )
}
