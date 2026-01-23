'use client'

import * as React from 'react'
import { type LucideIcon, Pencil, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { InlinePanel, InlinePanelSection } from '@/components/ui/inline-panel'
import { cn } from '@/lib/utils'

// ============================================
// UNIFIED SECTION - Header Component
// ============================================

export interface SectionHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  onEdit?: () => void
  isEditing?: boolean
  actions?: React.ReactNode
  className?: string
}

export function SectionHeader({
  title,
  description,
  icon: Icon,
  onEdit,
  isEditing,
  actions,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between', className)}>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5 text-charcoal-500" />}
          <h2 className="text-xl font-heading font-semibold text-charcoal-900">
            {title}
          </h2>
        </div>
        {description && (
          <p className="text-sm text-charcoal-500">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        {onEdit && !isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="gap-2"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </Button>
        )}
      </div>
    </div>
  )
}

// ============================================
// UNIFIED SECTION - Info Card Component
// ============================================

export interface InfoCardProps {
  title: string
  icon?: LucideIcon
  iconBg?: string
  iconColor?: string
  children: React.ReactNode
  className?: string
}

export function InfoCard({
  title,
  icon: Icon,
  iconBg = 'bg-charcoal-100',
  iconColor = 'text-charcoal-600',
  children,
  className,
}: InfoCardProps) {
  return (
    <Card
      className={cn(
        'shadow-elevation-sm hover:shadow-elevation-md transition-all duration-300',
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className={cn('p-2 rounded-lg', iconBg)}>
              <Icon className={cn('w-4 h-4', iconColor)} />
            </div>
          )}
          <CardTitle className="text-base font-heading">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  )
}

// ============================================
// UNIFIED SECTION - Info Row Component
// ============================================

import {
  ValueDisplay,
  type ValueDisplayType,
  type ValueDisplayProps,
} from '@/components/ui/value-display'
import { formatSnakeCase, getStatusVariant } from '@/lib/formatters'
import { Badge } from '@/components/ui/badge'

export interface InfoRowProps {
  label: string
  value: unknown
  type?: ValueDisplayType
  /** Show as badge */
  badge?: boolean
  /** Custom badge variant (auto-detected from value if not provided) */
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'outline'
  /** Value display props */
  displayProps?: Partial<ValueDisplayProps>
  className?: string
}

export function InfoRow({
  label,
  value,
  type = 'text',
  badge = false,
  badgeVariant,
  displayProps,
  className,
}: InfoRowProps) {
  // Auto-detect badge variant from status value
  const resolvedVariant =
    badgeVariant ||
    (badge && typeof value === 'string' ? getStatusVariant(value) : 'secondary')

  return (
    <div className={className}>
      <p className="text-[11px] font-medium text-charcoal-500 uppercase tracking-wider">
        {label}
      </p>
      {badge && value ? (
        <Badge variant={resolvedVariant as 'secondary' | 'success' | 'warning' | 'destructive'} className="mt-1.5 font-normal">
          {typeof value === 'string' && value.includes('_')
            ? formatSnakeCase(value)
            : value}
        </Badge>
      ) : (
        <div className="mt-1 text-charcoal-700">
          <ValueDisplay value={value} type={type} {...displayProps} />
        </div>
      )}
    </div>
  )
}

// ============================================
// UNIFIED SECTION - Edit Panel Container
// ============================================

export interface EditPanelProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  width?: 'sm' | 'md' | 'lg' | 'xl'
  onSave: () => void | Promise<void>
  isSaving?: boolean
  saveLabel?: string
  children: React.ReactNode
}

export function EditPanel({
  isOpen,
  onClose,
  title,
  description,
  width = 'lg',
  onSave,
  isSaving = false,
  saveLabel = 'Save Changes',
  children,
}: EditPanelProps) {
  return (
    <InlinePanel
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      width={width}
      actions={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {saveLabel}
          </Button>
        </>
      }
    >
      {children}
    </InlinePanel>
  )
}

// Re-export InlinePanelSection for convenience
export { InlinePanelSection as EditPanelSection } from '@/components/ui/inline-panel'

// ============================================
// UNIFIED SECTION - Main Container
// ============================================

export interface UnifiedSectionProps {
  /** Section title */
  title: string
  /** Section description */
  description?: string
  /** Section icon */
  icon?: LucideIcon
  /** Enable edit functionality */
  editable?: boolean
  /** Edit state controlled externally */
  isEditing?: boolean
  /** Set edit state externally */
  setIsEditing?: (editing: boolean) => void
  /** Custom actions in header */
  headerActions?: React.ReactNode
  /** Main content */
  children: React.ReactNode
  /** Edit panel content (shown in inline panel) */
  editContent?: React.ReactNode
  /** Edit panel config */
  editPanel?: {
    title?: string
    description?: string
    width?: 'sm' | 'md' | 'lg' | 'xl'
    onSave: () => void | Promise<void>
    isSaving?: boolean
    saveLabel?: string
  }
  /** Container className */
  className?: string
}

export function UnifiedSection({
  title,
  description,
  icon,
  editable = true,
  isEditing: controlledIsEditing,
  setIsEditing: controlledSetIsEditing,
  headerActions,
  children,
  editContent,
  editPanel,
  className,
}: UnifiedSectionProps) {
  // Internal edit state if not controlled
  const [internalIsEditing, setInternalIsEditing] = React.useState(false)

  // Use controlled or internal state
  const isEditing =
    controlledIsEditing !== undefined ? controlledIsEditing : internalIsEditing
  const setIsEditing =
    controlledSetIsEditing || setInternalIsEditing

  return (
    <div className={cn('flex gap-0', className)}>
      {/* Main Content */}
      <div
        className={cn(
          'space-y-6 animate-fade-in flex-1 transition-all duration-300',
          isEditing && 'pr-0'
        )}
      >
        <SectionHeader
          title={title}
          description={description}
          icon={icon}
          onEdit={editable ? () => setIsEditing(true) : undefined}
          isEditing={isEditing}
          actions={headerActions}
        />

        {children}
      </div>

      {/* Edit Panel */}
      {editContent && editPanel && (
        <EditPanel
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          title={editPanel.title || `Edit ${title}`}
          description={editPanel.description}
          width={editPanel.width}
          onSave={editPanel.onSave}
          isSaving={editPanel.isSaving}
          saveLabel={editPanel.saveLabel}
        >
          {editContent}
        </EditPanel>
      )}
    </div>
  )
}

// ============================================
// UNIFIED SECTION - Cards Grid
// ============================================

export interface CardsGridProps {
  columns?: 1 | 2 | 3 | 4
  gap?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  className?: string
}

export function CardsGrid({
  columns = 2,
  gap = 'md',
  children,
  className,
}: CardsGridProps) {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 lg:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }

  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
  }

  return (
    <div className={cn('grid', columnClasses[columns], gapClasses[gap], className)}>
      {children}
    </div>
  )
}

// ============================================
// UNIFIED SECTION - Empty State
// ============================================

export interface SectionEmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function SectionEmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: SectionEmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-6',
        'rounded-xl border border-dashed border-charcoal-200 bg-charcoal-50/50',
        className
      )}
    >
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-charcoal-100 flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-charcoal-400" />
        </div>
      )}
      <h3 className="text-lg font-medium text-charcoal-700 text-center">
        {title}
      </h3>
      {description && (
        <p className="mt-1 text-sm text-charcoal-500 text-center max-w-sm">
          {description}
        </p>
      )}
      {action && (
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}
