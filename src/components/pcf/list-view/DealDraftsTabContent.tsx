'use client'

import { useRouter } from 'next/navigation'
import { Trash2, Play, Clock, Plus, Briefcase } from 'lucide-react'
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

interface DealDraftsTabContentProps {
  items: Record<string, unknown>[]
  isLoading: boolean
  filters: Record<string, unknown>
}

/**
 * Custom tab content for deal drafts that:
 * 1. Renders drafts as cards (not table rows)
 * 2. Clicking a draft opens the deal wizard for editing
 * 3. Includes delete functionality
 */
export function DealDraftsTabContent({
  items,
  isLoading,
}: DealDraftsTabContentProps) {
  const router = useRouter()
  const utils = trpc.useUtils()
  const deleteMutation = trpc.crm.deals.deleteDraft.useMutation({
    onSuccess: () => {
      utils.crm.deals.listMyDrafts.invalidate()
    },
  })

  const wizardRoute = '/employee/crm/deals/new'

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
        <Briefcase className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-charcoal-700 mb-2">No drafts</h3>
        <p className="text-sm text-charcoal-500 mb-4">
          You don&apos;t have any deals in progress. Start creating a new one!
        </p>
        <Button onClick={() => router.push(wizardRoute)}>
          <Plus className="w-4 h-4 mr-2" />
          Start New Deal
        </Button>
      </div>
    )
  }

  const handleResume = (draft: Record<string, unknown>) => {
    // Navigate to wizard with draft ID to resume
    router.push(`${wizardRoute}?id=${draft.id}&step=1`)
  }

  const handleDelete = async (draftId: string) => {
    await deleteMutation.mutateAsync({ id: draftId })
  }

  const getDisplayName = (draft: Record<string, unknown>) => {
    const name = draft.name as string | null | undefined
    const title = draft.title as string | null | undefined

    if (name && name !== 'New Deal') return name
    if (title && title !== 'New Deal') return title
    return 'Untitled Deal'
  }

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return null
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="space-y-3">
      {items.map((draft) => {
        const displayName = getDisplayName(draft)
        const lastSaved = (draft.updated_at || draft.created_at) as string | undefined
        const value = draft.value as number | null | undefined
        const draftId = draft.id as string

        return (
          <div
            key={draftId}
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
                  {value !== null && value !== undefined && value > 0 && (
                    <span className="font-medium text-charcoal-700">
                      {formatCurrency(value)}
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
                      onClick={() => handleDelete(draftId)}
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
