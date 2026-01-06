'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle2 } from 'lucide-react'

// Section wrapper component for consistent styling (matches Account wizard)
export function Section({
  icon: Icon,
  title,
  subtitle,
  children,
  className,
}: {
  icon?: React.ElementType
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('space-y-5', className)}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-100 to-amber-100 flex items-center justify-center shadow-sm">
            <Icon className="w-5 h-5 text-gold-600" />
          </div>
        )}
        <div>
          <h3 className="text-sm font-semibold text-charcoal-800 uppercase tracking-wider">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-charcoal-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  )
}

// Field group for better organization
export function FieldGroup({
  children,
  cols = 2,
}: {
  children: React.ReactNode
  cols?: 1 | 2 | 3 | 4
}) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
  }
  return <div className={cn('grid gap-5', gridCols[cols])}>{children}</div>
}

// Premium select card button
export function SelectCard({
  selected,
  onClick,
  children,
  className,
  disabled = false,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
  className?: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative p-4 rounded-xl border-2 text-left transition-all duration-300 overflow-hidden group',
        selected
          ? 'border-gold-400 bg-gradient-to-br from-gold-50 to-amber-50 shadow-gold-glow'
          : 'border-charcoal-200 bg-white hover:border-charcoal-300 hover:bg-charcoal-50/50 hover:shadow-elevation-xs',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {selected && (
        <div className="absolute top-2 right-2">
          <CheckCircle2 className="w-5 h-5 text-gold-500" />
        </div>
      )}
      {children}
    </button>
  )
}

// Priority card with custom colors
export function PriorityCard({
  selected,
  onClick,
  icon,
  label,
  description,
  colorScheme,
}: {
  selected: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  description: string
  colorScheme: 'red' | 'amber' | 'blue' | 'charcoal' | 'orange'
}) {
  const colorStyles = {
    red: {
      selected: 'border-red-400 bg-gradient-to-br from-red-50 to-rose-50',
      text: 'text-red-600',
      check: 'text-red-500',
    },
    orange: {
      selected: 'border-orange-400 bg-gradient-to-br from-orange-50 to-amber-50',
      text: 'text-orange-600',
      check: 'text-orange-500',
    },
    amber: {
      selected: 'border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50',
      text: 'text-amber-600',
      check: 'text-amber-500',
    },
    blue: {
      selected: 'border-blue-400 bg-gradient-to-br from-blue-50 to-sky-50',
      text: 'text-blue-600',
      check: 'text-blue-500',
    },
    charcoal: {
      selected: 'border-charcoal-300 bg-gradient-to-br from-charcoal-50 to-slate-50',
      text: 'text-charcoal-600',
      check: 'text-charcoal-500',
    },
  }

  const styles = colorStyles[colorScheme]

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative p-4 rounded-xl border-2 text-left transition-all duration-300 overflow-hidden',
        selected
          ? styles.selected
          : 'border-charcoal-200 hover:border-charcoal-300 hover:bg-charcoal-50/50'
      )}
    >
      {selected && (
        <div className="absolute top-2 right-2">
          <CheckCircle2 className={cn('w-5 h-5', styles.check)} />
        </div>
      )}
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className={cn('text-sm font-semibold', selected ? styles.text : 'text-charcoal-800')}>
          {label}
        </span>
      </div>
      <span className="text-xs text-charcoal-500 block">{description}</span>
    </button>
  )
}

// Section divider with label
export function SectionDivider({ label }: { label: string }) {
  return (
    <div className="relative py-2">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-charcoal-100"></div>
      </div>
      <div className="relative flex justify-center">
        <span className="px-4 bg-cream text-xs text-charcoal-400 uppercase tracking-wider">
          {label}
        </span>
      </div>
    </div>
  )
}

// Chip toggle for multi-select options
export function ChipToggle({
  selected,
  onClick,
  children,
  icon,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
  icon?: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 text-sm font-medium transition-all duration-200',
        selected
          ? 'border-gold-400 bg-gold-50 text-gold-700'
          : 'border-charcoal-200 bg-white text-charcoal-700 hover:border-charcoal-300 hover:bg-charcoal-50'
      )}
    >
      {icon}
      {children}
      {selected && <CheckCircle2 className="w-4 h-4 text-gold-500" />}
    </button>
  )
}

// Validation reminder banner
export function ValidationBanner({
  items,
  title = 'Complete these to continue',
}: {
  items: string[]
  title?: string
}) {
  if (items.length === 0) return null

  return (
    <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl animate-fade-in">
      <h4 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
        <span className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center text-xs">!</span>
        {title}
      </h4>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-3 text-sm text-amber-700">
            <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center text-xs font-semibold">
              {index + 1}
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

// Empty state for arrays/lists
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="text-center py-8 px-4 border-2 border-dashed border-charcoal-200 rounded-xl bg-charcoal-50/50">
      <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-charcoal-100 flex items-center justify-center">
        <Icon className="w-6 h-6 text-charcoal-400" />
      </div>
      <h4 className="text-sm font-semibold text-charcoal-700 mb-1">{title}</h4>
      <p className="text-xs text-charcoal-500 mb-3">{description}</p>
      {action}
    </div>
  )
}

// Inline item card (for skills, interview rounds, etc.)
export function InlineItemCard({
  children,
  onEdit,
  onRemove,
}: {
  children: React.ReactNode
  onEdit?: () => void
  onRemove?: () => void
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-white border border-charcoal-200 rounded-xl hover:border-charcoal-300 hover:shadow-sm transition-all group">
      <div className="flex-1">{children}</div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="text-xs text-charcoal-500 hover:text-charcoal-700 px-2 py-1 rounded hover:bg-charcoal-100"
          >
            Edit
          </button>
        )}
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  )
}
