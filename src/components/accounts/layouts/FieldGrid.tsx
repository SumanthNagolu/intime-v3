'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface FieldGridProps {
  /** Number of columns */
  cols?: 1 | 2 | 3 | 4
  /** Gap size */
  gap?: 'sm' | 'md' | 'lg'
  /** Additional class name */
  className?: string
  /** Child content */
  children: React.ReactNode
}

const gridColsMap = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-4',
}

const gapMap = {
  sm: 'gap-4',
  md: 'gap-5',
  lg: 'gap-6',
}

/**
 * FieldGrid - Responsive grid layout for form fields
 *
 * Provides consistent spacing and responsive breakpoints.
 * Used in both wizard steps and edit panels.
 */
export function FieldGrid({
  cols = 2,
  gap = 'md',
  className,
  children,
}: FieldGridProps) {
  return (
    <div className={cn('grid', gridColsMap[cols], gapMap[gap], className)}>
      {children}
    </div>
  )
}

interface FieldGroupProps {
  /** Number of columns */
  cols?: 1 | 2 | 3 | 4
  /** Additional class name */
  className?: string
  /** Child content */
  children: React.ReactNode
}

/**
 * FieldGroup - Alias for FieldGrid with wizard-style defaults
 *
 * Maintains backward compatibility with existing wizard step components.
 */
export function FieldGroup({ cols = 2, className, children }: FieldGroupProps) {
  return (
    <FieldGrid cols={cols} gap="md" className={className}>
      {children}
    </FieldGrid>
  )
}

interface FieldColProps {
  /** Span full width (2 columns) */
  span?: 1 | 2
  /** Additional class name */
  className?: string
  /** Child content */
  children: React.ReactNode
}

/**
 * FieldCol - Column wrapper for fields in a grid
 *
 * Use span={2} to make a field take full width in a 2-column grid.
 */
export function FieldCol({ span = 1, className, children }: FieldColProps) {
  return (
    <div className={cn(span === 2 && 'md:col-span-2', className)}>
      {children}
    </div>
  )
}

export default FieldGrid
