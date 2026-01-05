'use client'

import { useRouter } from 'next/navigation'
import { FileText, Trash2, Play, Clock, Plus } from 'lucide-react'
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
interface DraftItem extends Record<string, unknown> {
  id: string
  name?: string | null
  wizard_state?: WizardState | null
  updated_at?: string
  created_at?: string
}

interface DraftsTabContentProps {
  items: DraftItem[]
  isLoading: boolean
  filters: Record<string, unknown>
  // These are provided via the parent component
  wizardRoute?: string
  onDelete?: (id: string) => Promise<void>
  displayNameField?: string
  createLabel?: string
}

export function DraftsTabContent({
  items,
  isLoading,
  wizardRoute = '/employee/recruiting/accounts/new',
  onDelete,
  displayNameField = 'name',
  createLabel = 'Start New Account',
}: DraftsTabContentProps) {
  const router = useRouter()

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  // Empty state for drafts tab
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12 bg-charcoal-50 rounded-lg border border-dashed border-charcoal-200">
        <FileText className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-charcoal-700 mb-2">No drafts</h3>
        <p className="text-sm text-charcoal-500 mb-4">
          You don&apos;t have any accounts in progress. Start creating a new one!
        </p>
        <Button onClick={() => router.push(wizardRoute)}>
          <Plus className="w-4 h-4 mr-2" />
          {createLabel}
        </Button>
      </div>
    )
  }

  const handleResume = (draft: DraftItem) => {
    router.push(`${wizardRoute}?resume=${draft.id}`)
  }

  const handleDelete = async (draftId: string) => {
    if (onDelete) {
      await onDelete(draftId)
    }
  }

  const getDisplayName = (draft: DraftItem): string => {
    return String(draft[displayNameField] || 'Untitled')
  }

  return (
    <div className="space-y-3">
      {items.map((draft) => {
        const wizardState = draft.wizard_state
        const displayName = getDisplayName(draft)
        const lastSaved = wizardState?.lastSavedAt || draft.updated_at || draft.created_at
        const progress = wizardState
          ? Math.round((wizardState.currentStep / wizardState.totalSteps) * 100)
          : 0

        return (
          <div
            key={draft.id}
            className="flex items-center justify-between p-4 bg-white border border-charcoal-200 rounded-lg hover:border-charcoal-300 hover:shadow-sm transition-all cursor-pointer"
            onClick={() => handleResume(draft)}
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <Badge className="bg-amber-100 text-amber-800 border-amber-300 shrink-0">
                Draft
              </Badge>
              <div className="flex-1 min-w-0">
                <span className="font-medium text-charcoal-900 truncate block text-base">
                  {displayName}
                </span>
                <div className="flex items-center gap-4 text-sm text-charcoal-500 mt-1">
                  {wizardState && (
                    <span className="font-medium">
                      Step {wizardState.currentStep} of {wizardState.totalSteps}
                    </span>
                  )}
                  {lastSaved && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDistanceToNow(new Date(lastSaved), { addSuffix: true })}
                    </span>
                  )}
                </div>
              </div>
              {/* Progress bar */}
              {wizardState && (
                <div className="hidden md:flex items-center gap-3 w-32">
                  <div className="flex-1 h-2 bg-charcoal-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-sm text-charcoal-500 w-10 text-right">
                    {progress}%
                  </span>
                </div>
              )}
            </div>

            <div
              className="flex items-center gap-2 ml-4"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleResume(draft)}
                className="border-gold-400 hover:bg-gold-50 text-gold-700"
              >
                <Play className="w-3.5 h-3.5 mr-1.5" />
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
                        Are you sure you want to delete &quot;{displayName}&quot;? This action cannot be undone.
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
  )
}
