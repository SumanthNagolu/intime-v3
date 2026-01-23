'use client'

import * as React from 'react'
import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ValueDisplay, type ValueDisplayProps, type ValueDisplayType } from './value-display'

// ============================================
// FIELD DISPLAY - Labeled Value Display
// ============================================

export interface FieldDisplayProps extends Omit<ValueDisplayProps, 'className'> {
  /** Field label */
  label: string
  /** Optional icon for the label */
  icon?: LucideIcon
  /** Layout orientation */
  orientation?: 'vertical' | 'horizontal'
  /** Label width for horizontal layout */
  labelWidth?: string
  /** Show as required field */
  required?: boolean
  /** Helper text below the value */
  helperText?: string
  /** Additional className for container */
  className?: string
  /** Additional className for label */
  labelClassName?: string
  /** Additional className for value */
  valueClassName?: string
  /** Compact mode - smaller fonts */
  compact?: boolean
}

export function FieldDisplay({
  label,
  icon: Icon,
  orientation = 'vertical',
  labelWidth = 'w-32',
  required = false,
  helperText,
  className,
  labelClassName,
  valueClassName,
  compact = false,
  ...valueProps
}: FieldDisplayProps) {
  const labelContent = (
    <div
      className={cn(
        'flex items-center gap-1.5',
        orientation === 'horizontal' && labelWidth,
        labelClassName
      )}
    >
      {Icon && (
        <Icon
          className={cn(
            'text-charcoal-400 flex-shrink-0',
            compact ? 'h-3 w-3' : 'h-3.5 w-3.5'
          )}
        />
      )}
      <span
        className={cn(
          'font-medium text-charcoal-500 uppercase tracking-wider',
          compact ? 'text-[10px]' : 'text-[11px]'
        )}
      >
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
    </div>
  )

  const valueContent = (
    <div className={cn('text-charcoal-700', compact ? 'text-sm' : 'text-base', valueClassName)}>
      <ValueDisplay {...valueProps} />
    </div>
  )

  if (orientation === 'horizontal') {
    return (
      <div className={cn('flex items-start gap-4', className)}>
        {labelContent}
        <div className="flex-1 min-w-0">
          {valueContent}
          {helperText && (
            <p className="mt-1 text-xs text-charcoal-400">{helperText}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-1', className)}>
      {labelContent}
      {valueContent}
      {helperText && (
        <p className="text-xs text-charcoal-400">{helperText}</p>
      )}
    </div>
  )
}

// ============================================
// FIELD GROUP - Grid of Fields
// ============================================

export interface FieldGroupProps {
  /** Title for the group */
  title?: string
  /** Icon for the title */
  icon?: LucideIcon
  /** Number of columns */
  columns?: 1 | 2 | 3 | 4
  /** Gap between fields */
  gap?: 'sm' | 'md' | 'lg'
  /** Children (FieldDisplay components) */
  children: React.ReactNode
  /** Additional className */
  className?: string
  /** Compact mode */
  compact?: boolean
}

export function FieldGroup({
  title,
  icon: Icon,
  columns = 2,
  gap = 'md',
  children,
  className,
  compact = false,
}: FieldGroupProps) {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }

  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
  }

  return (
    <div className={cn('space-y-4', className)}>
      {title && (
        <div className="flex items-center gap-2 pb-2 border-b border-charcoal-100">
          {Icon && <Icon className="h-4 w-4 text-charcoal-500" />}
          <h4
            className={cn(
              'font-semibold text-charcoal-800',
              compact ? 'text-sm' : 'text-base'
            )}
          >
            {title}
          </h4>
        </div>
      )}
      <div className={cn('grid', columnClasses[columns], gapClasses[gap])}>
        {children}
      </div>
    </div>
  )
}

// ============================================
// INLINE FIELD - Horizontal label: value
// ============================================

export interface InlineFieldProps {
  label: string
  value: React.ReactNode
  className?: string
}

export function InlineField({ label, value, className }: InlineFieldProps) {
  return (
    <div className={cn('flex items-center justify-between py-2', className)}>
      <span className="text-sm text-charcoal-500">{label}</span>
      <span className="text-sm font-medium text-charcoal-900">{value}</span>
    </div>
  )
}

// ============================================
// STAT FIELD - KPI-style display
// ============================================

export interface StatFieldProps {
  label: string
  value: string | number
  icon?: LucideIcon
  trend?: { value: number; direction: 'up' | 'down' }
  suffix?: string
  className?: string
}

export function StatField({
  label,
  value,
  icon: Icon,
  trend,
  suffix,
  className,
}: StatFieldProps) {
  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="h-3.5 w-3.5 text-charcoal-400" />}
        <span className="text-[11px] font-medium text-charcoal-500 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-charcoal-900 tracking-tight tabular-nums">
          {value}
        </span>
        {suffix && <span className="text-sm text-charcoal-400">{suffix}</span>}
        {trend && (
          <span
            className={cn(
              'text-xs font-medium',
              trend.direction === 'up' ? 'text-success-600' : 'text-error-600'
            )}
          >
            {trend.direction === 'up' ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
    </div>
  )
}

// ============================================
// DETAIL ROW - For detail cards
// ============================================

export interface DetailRowProps {
  label: string
  value: React.ReactNode
  type?: ValueDisplayType
  icon?: LucideIcon
  className?: string
}

export function DetailRow({
  label,
  value,
  type = 'text',
  icon: Icon,
  className,
}: DetailRowProps) {
  return (
    <div
      className={cn(
        'flex items-start justify-between py-3 border-b border-charcoal-100 last:border-0',
        className
      )}
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-charcoal-400" />}
        <span className="text-sm text-charcoal-500">{label}</span>
      </div>
      <div className="text-sm text-charcoal-900 text-right">
        {React.isValidElement(value) ? value : <ValueDisplay value={value} type={type} />}
      </div>
    </div>
  )
}

// ============================================
// INFO CARD - Grouped fields in a card
// ============================================

export interface InfoCardProps {
  title: string
  subtitle?: string
  icon?: LucideIcon
  children: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export function InfoCard({
  title,
  subtitle,
  icon: Icon,
  children,
  actions,
  className,
}: InfoCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-charcoal-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                <Icon className="h-5 w-5 text-charcoal-600" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-charcoal-900">{title}</h3>
              {subtitle && (
                <p className="text-xs text-charcoal-500">{subtitle}</p>
              )}
            </div>
          </div>
          {actions}
        </div>
      </div>
      {/* Content */}
      <div className="p-6">{children}</div>
    </div>
  )
}

// ============================================
// QUICK STAT CARD - For overview sections
// ============================================

export interface QuickStatCardProps {
  label: string
  value: string | number
  icon?: LucideIcon
  trend?: { value: number; direction: 'up' | 'down' }
  onClick?: () => void
  className?: string
}

export function QuickStatCard({
  label,
  value,
  icon: Icon,
  trend,
  onClick,
  className,
}: QuickStatCardProps) {
  const Wrapper = onClick ? 'button' : 'div'

  return (
    <Wrapper
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-xl border border-charcoal-200/60 bg-white p-5',
        'shadow-elevation-sm hover:shadow-elevation-md hover:-translate-y-0.5',
        'transition-all duration-300',
        onClick && 'cursor-pointer',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-[11px] font-medium text-charcoal-400 uppercase tracking-wider">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-charcoal-900 tracking-tight tabular-nums">
              {value}
            </span>
            {trend && (
              <span
                className={cn(
                  'text-xs font-medium',
                  trend.direction === 'up' ? 'text-success-600' : 'text-error-600'
                )}
              >
                {trend.direction === 'up' ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            )}
          </div>
        </div>
        {Icon && (
          <div className="w-11 h-11 rounded-lg bg-charcoal-100 flex items-center justify-center transition-all duration-300 group-hover:bg-charcoal-200">
            <Icon className="h-5 w-5 text-charcoal-500 group-hover:text-charcoal-700 transition-colors" />
          </div>
        )}
      </div>
    </Wrapper>
  )
}
