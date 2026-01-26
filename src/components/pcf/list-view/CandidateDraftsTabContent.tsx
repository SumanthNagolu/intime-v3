'use client'

import { useRouter } from 'next/navigation'
import { FileText, Trash2, Play, Clock, Plus, User } from 'lucide-react'
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
import { trpc } from '@/lib/trpc/client'
import type { WizardState } from '@/hooks/use-entity-draft'

interface DraftItem extends Record<string, unknown> {
  id: string
  first_name?: string | null
  last_name?: string | null
  wizard_state?: WizardState | null
  updated_at?: string
  created_at?: string
}

interface CandidateDraftsTabContentProps {
  items: DraftItem[]
  isLoading: boolean
  filters: Record<string, unknown>
}

/**
 * Custom tab content for candidate drafts that:
 * 1. Renders drafts as cards (not table rows)
 * 2. Clicking a draft resumes the wizard (not opens workspace)
 * 3. Includes delete functionality
 */
export function CandidateDraftsTabContent({
  items,
  isLoading,
}: CandidateDraftsTabContentProps) {
  const router = useRouter()
  const utils = trpc.useUtils()
  const deleteMutation = trpc.ats.candidates.deleteDraft.useMutation({
    onSuccess: () => {
      utils.ats.candidates.listMyDrafts.invalidate()
    },
  })

  const wizardRoute = '/employee/recruiting/candidates/new'

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

  // Empty state
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12 bg-charcoal-50 rounded-lg border border-dashed border-charcoal-200">
        <User className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-charcoal-700 mb-2">No drafts</h3>
        <p className="text-sm text-charcoal-500 mb-4">
          You don&apos;t have any candidates in progress. Start creating a new one!
        </p>
        <Button onClick={() => router.push(wizardRoute)}>
          <Plus className="w-4 h-4 mr-2" />
          Start New Candidate
        </Button>
      </div>
    )
  }

  const handleResume = (draft: DraftItem) => {
    router.push(`${wizardRoute}?resume=${draft.id}`)
  }

  const handleDelete = async (draftId: string) => {
    await deleteMutation.mutateAsync({ id: draftId })
  }

  return (
    <div className="space-y-3">
      {items.map((draft) => {
        const wizardState = draft.wizard_state
        // Prefer wizard_state formData over DB placeholders
        const wsFormData = wizardState?.formData as { firstName?: string; lastName?: string } | undefined
        const firstName = wsFormData?.firstName || draft.first_name
        const lastName = wsFormData?.lastName || draft.last_name
        // Filter out placeholder values like "(Untitled)"
        const cleanFirst = firstName && !firstName.startsWith('(') ? firstName : ''
        const cleanLast = lastName && lastName !== 'Candidate' ? lastName : ''
        const displayName = [cleanFirst, cleanLast].filter(Boolean).join(' ') || 'Untitled'
        const lastSaved = wizardState?.lastSavedAt || draft.updated_at || draft.created_at
        const progress = wizardState
          ? Math.round((wizardState.currentStep / wizardState.totalSteps) * 100)
          : 0

        return (
          <div
            key={draft.id}
            className="flex items-center justify-between p-4 bg-white border border-charcoal-200 rounded-lg hover:border-gold-300 hover:shadow-sm transition-all cursor-pointer"
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
            </div>
          </div>
        )
      })}
    </div>
  )
}
