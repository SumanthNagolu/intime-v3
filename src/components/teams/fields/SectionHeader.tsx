'use client'

import { Button } from '@/components/ui/button'
import { Pencil, Loader2, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SectionMode } from '@/lib/teams/types'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  mode: SectionMode
  onEdit?: () => void
  onSave?: () => void
  onCancel?: () => void
  isSaving?: boolean
  className?: string
}

/**
 * SectionHeader - Header component for unified sections with edit/save/cancel actions
 *
 * Used in workspace sections for in-place editing.
 */
export function SectionHeader({
  title,
  subtitle,
  mode,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div>
        <h2 className="text-xl font-heading font-semibold text-charcoal-900">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-charcoal-500 mt-1">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {mode === 'view' && onEdit && (
          <Button variant="outline" size="sm" onClick={onEdit} className="gap-2">
            <Pencil className="w-4 h-4" />
            Edit
          </Button>
        )}

        {mode === 'edit' && (
          <>
            <Button variant="outline" size="sm" onClick={onCancel} disabled={isSaving}>
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
            <Button size="sm" onClick={onSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-1" />
              )}
              Save
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

export default SectionHeader
