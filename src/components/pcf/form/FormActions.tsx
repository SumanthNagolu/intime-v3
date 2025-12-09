'use client'

import { Loader2, Save, X, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FormActionsProps {
  mode: 'create' | 'edit'
  isSubmitting?: boolean
  isDirty?: boolean
  hasErrors?: boolean
  submitLabel?: string
  cancelLabel?: string
  deleteLabel?: string
  onSubmit: () => void
  onCancel: () => void
  onDelete?: () => void
  showDelete?: boolean
  position?: 'bottom' | 'top' | 'sticky'
}

export function FormActions({
  mode,
  isSubmitting = false,
  isDirty = true,
  hasErrors = false,
  submitLabel,
  cancelLabel = 'Cancel',
  deleteLabel = 'Delete',
  onSubmit,
  onCancel,
  onDelete,
  showDelete = false,
  position = 'bottom',
}: FormActionsProps) {
  const defaultSubmitLabel = mode === 'create' ? 'Create' : 'Save Changes'
  const finalSubmitLabel = submitLabel || defaultSubmitLabel

  const isDisabled = isSubmitting || hasErrors || !isDirty

  return (
    <div
      className={cn(
        'flex items-center justify-between pt-4 border-t border-charcoal-100',
        position === 'sticky' && 'sticky bottom-0 bg-white pb-4 -mx-6 px-6',
        position === 'top' && 'pb-4 border-t-0 border-b'
      )}
    >
      {/* Left Side: Delete (if editing) */}
      <div>
        {showDelete && mode === 'edit' && onDelete && (
          <Button
            type="button"
            variant="ghost"
            onClick={onDelete}
            disabled={isSubmitting}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {deleteLabel}
          </Button>
        )}
      </div>

      {/* Right Side: Cancel + Submit */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          <X className="w-4 h-4 mr-2" />
          {cancelLabel}
        </Button>

        <Button
          type="button"
          onClick={onSubmit}
          disabled={isDisabled}
          className="bg-hublot-900 hover:bg-hublot-800"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {finalSubmitLabel}
        </Button>
      </div>
    </div>
  )
}
