'use client'

import { useState, useCallback } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  max?: number
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  readonly?: boolean
  label?: string
  showValue?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
}

const gapClasses = {
  sm: 'gap-0.5',
  md: 'gap-1',
  lg: 'gap-1.5',
}

export function StarRating({
  value,
  onChange,
  max = 5,
  size = 'md',
  disabled = false,
  readonly = false,
  label,
  showValue = false,
  className,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null)

  const handleClick = useCallback((rating: number) => {
    if (disabled || readonly) return
    onChange?.(rating)
  }, [disabled, readonly, onChange])

  const handleMouseEnter = useCallback((rating: number) => {
    if (disabled || readonly) return
    setHoverValue(rating)
  }, [disabled, readonly])

  const handleMouseLeave = useCallback(() => {
    setHoverValue(null)
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent, rating: number) => {
    if (disabled || readonly) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onChange?.(rating)
    }
  }, [disabled, readonly, onChange])

  const displayValue = hoverValue ?? value

  return (
    <div className={cn('flex flex-col', className)}>
      {label && (
        <span className="text-sm font-medium text-charcoal-700 mb-1">{label}</span>
      )}
      <div className="flex items-center">
        <div
          className={cn('flex', gapClasses[size])}
          onMouseLeave={handleMouseLeave}
          role="radiogroup"
          aria-label={label || 'Rating'}
        >
          {Array.from({ length: max }, (_, i) => {
            const rating = i + 1
            const isFilled = rating <= displayValue
            const isInteractive = !disabled && !readonly

            return (
              <button
                key={rating}
                type="button"
                onClick={() => handleClick(rating)}
                onMouseEnter={() => handleMouseEnter(rating)}
                onKeyDown={(e) => handleKeyDown(e, rating)}
                disabled={disabled}
                className={cn(
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-1 rounded-sm transition-transform',
                  isInteractive && 'hover:scale-110 cursor-pointer',
                  disabled && 'opacity-50 cursor-not-allowed',
                  readonly && 'cursor-default'
                )}
                role="radio"
                aria-checked={rating === value}
                aria-label={`${rating} star${rating !== 1 ? 's' : ''}`}
                tabIndex={isInteractive ? 0 : -1}
              >
                <Star
                  className={cn(
                    sizeClasses[size],
                    'transition-colors',
                    isFilled
                      ? 'text-gold-500 fill-gold-500'
                      : 'text-charcoal-300',
                    isInteractive && !isFilled && 'hover:text-gold-300'
                  )}
                />
              </button>
            )
          })}
        </div>
        {showValue && (
          <span className="ml-2 text-sm text-charcoal-600 tabular-nums">
            {value}/{max}
          </span>
        )}
      </div>
    </div>
  )
}

// Read-only display variant
interface StarDisplayProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function StarDisplay({
  value,
  max = 5,
  size = 'md',
  className,
}: StarDisplayProps) {
  return (
    <div className={cn('flex items-center', gapClasses[size], className)}>
      {Array.from({ length: max }, (_, i) => {
        const rating = i + 1
        const isFilled = rating <= value
        const isHalfFilled = !isFilled && rating - 0.5 <= value

        return (
          <Star
            key={rating}
            className={cn(
              sizeClasses[size],
              isFilled
                ? 'text-gold-500 fill-gold-500'
                : isHalfFilled
                ? 'text-gold-500 fill-gold-200'
                : 'text-charcoal-300'
            )}
          />
        )
      })}
    </div>
  )
}
