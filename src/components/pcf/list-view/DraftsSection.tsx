'use client'

import { useRouter } from 'next/navigation'
import { FileText, Trash2, Play, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import type { WizardState } from '@/hooks/use-entity-draft'

// Draft item must have these fields
interface DraftItem {
  id: string
  wizard_state?: WizardState | null
  updated_at?: string
  created_at?: string
}

interface DraftsSectionProps<T extends DraftItem> {
  drafts: T[]
  isLoading: boolean
  wizardRoute: string
  getDisplayName: (draft: T) => string
  onDelete?: (id: string) => Promise<void>
  className?: string
}

export function DraftsSection<T extends DraftItem>({
  drafts,
  isLoading,
  wizardRoute,
  getDisplayName,
  onDelete,
  className,
}: DraftsSectionProps<T>) {
  const router = useRouter()

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('mb-6', className)}>
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-medium text-charcoal-700">Your Drafts</span>
        </div>
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  // Don't render if no drafts
  if (!drafts || drafts.length === 0) {
    return null
  }

  const handleResume = (draft: T) => {
    // Navigate to wizard with resume param
    router.push(`${wizardRoute}?resume=${draft.id}`)
  }

  const handleDelete = async (draftId: string) => {
    if (onDelete) {
      await onDelete(draftId)
    }
  }

  return (
    <div className={cn('mb-6', className)}>
      <div className="flex items-center gap-2 mb-3">
        <FileText className="w-4 h-4 text-amber-600" />
        <span className="text-sm font-medium text-charcoal-700">
          Your Drafts ({drafts.length})
        </span>
      </div>

      <div className="space-y-2">
        {drafts.map((draft) => {
          const wizardState = draft.wizard_state
          const displayName = getDisplayName(draft) || 'Untitled'
          const lastSaved = wizardState?.lastSavedAt || draft.updated_at || draft.created_at
          const progress = wizardState
            ? Math.round((wizardState.currentStep / wizardState.totalSteps) * 100)
            : 0

          return (
            <div
              key={draft.id}
              className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100/70 transition-colors cursor-pointer"
              onClick={() => handleResume(draft)}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Badge className="bg-amber-100 text-amber-800 border-amber-300 shrink-0">
                  Draft
                </Badge>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-charcoal-900 truncate block">
                    {displayName}
                  </span>
                  <div className="flex items-center gap-3 text-xs text-charcoal-500 mt-0.5">
                    {wizardState && (
                      <span>
                        Step {wizardState.currentStep} of {wizardState.totalSteps}
                      </span>
                    )}
                    {lastSaved && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(lastSaved), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                </div>
                {/* Progress bar */}
                {wizardState && (
                  <div className="hidden sm:flex items-center gap-2 w-24">
                    <div className="flex-1 h-1.5 bg-amber-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-charcoal-500 w-8">
                      {progress}%
                    </span>
                  </div>
                )}
              </div>

              <div
                className="flex items-center gap-2 ml-3"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleResume(draft)}
                  className="border-amber-300 hover:bg-amber-100 text-amber-800"
                >
                  <Play className="w-3.5 h-3.5 mr-1" />
                  Resume
                </Button>
                {onDelete && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-charcoal-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Draft?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{displayName}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(draft.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
