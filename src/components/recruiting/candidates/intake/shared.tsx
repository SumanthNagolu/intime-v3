'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle2 } from 'lucide-react'

// Re-export from jobs intake for consistency
export { Section, FieldGroup, SelectCard, SectionDivider, ChipToggle, ValidationBanner, EmptyState, InlineItemCard } from '@/components/recruiting/jobs/intake/shared'

// Skill badge component
export function SkillBadge({
  skill,
  onRemove,
  removable = true,
}: {
  skill: string
  onRemove?: () => void
  removable?: boolean
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm',
        'bg-gradient-to-r from-gold-50 to-amber-50 border border-gold-200 text-gold-700'
      )}
    >
      {skill}
      {removable && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="w-4 h-4 rounded-full hover:bg-gold-200 flex items-center justify-center transition-colors"
        >
          <span className="text-xs font-bold">&times;</span>
        </button>
      )}
    </span>
  )
}

// Info card for displaying readonly info
export function InfoCard({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: React.ElementType
  label: string
  value: string
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-3 p-4 bg-charcoal-50 rounded-xl border border-charcoal-100', className)}>
      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-charcoal-200">
        <Icon className="w-5 h-5 text-charcoal-500" />
      </div>
      <div>
        <p className="text-xs text-charcoal-500 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-charcoal-800">{value}</p>
      </div>
    </div>
  )
}

// Radio option card (like source type selection)
export function RadioOptionCard({
  selected,
  onClick,
  icon,
  label,
  description,
  disabled = false,
}: {
  selected: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  description: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative w-full p-5 rounded-xl border-2 text-left transition-all duration-300',
        selected
          ? 'border-gold-400 bg-gradient-to-br from-gold-50 to-amber-50 shadow-gold-glow'
          : 'border-charcoal-200 bg-white hover:border-charcoal-300 hover:bg-charcoal-50/50',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center text-2xl',
          selected ? 'bg-gold-100' : 'bg-charcoal-100'
        )}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={cn(
              'font-semibold',
              selected ? 'text-gold-800' : 'text-charcoal-800'
            )}>
              {label}
            </span>
            {disabled && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-charcoal-200 text-charcoal-500">
                Coming soon
              </span>
            )}
          </div>
          <p className="text-sm text-charcoal-500 mt-1">{description}</p>
        </div>
        {selected && (
          <CheckCircle2 className="w-6 h-6 text-gold-500 flex-shrink-0" />
        )}
      </div>
    </button>
  )
}
