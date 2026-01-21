'use client'

import { useRouter } from 'next/navigation'
import { FileText, Trash2, Play, Clock, Plus, Target } from 'lucide-react'
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

interface LeadDraftsTabContentProps {
  items: Record<string, unknown>[]
  isLoading: boolean
  filters: Record<string, unknown>
}

/**
 * Custom tab content for lead drafts that:
 * 1. Renders drafts as cards (not table rows)
 * 2. Clicking a draft opens the lead detail page for editing
 * 3. Includes delete functionality
 */
export function LeadDraftsTabContent({
  items,
  isLoading,
}: LeadDraftsTabContentProps) {
  const router = useRouter()
  const utils = trpc.useUtils()
  const deleteMutation = trpc.unifiedContacts.leads.deleteDraft.useMutation({
    onSuccess: () => {
      utils.unifiedContacts.leads.listMyDrafts.invalidate()
    },
  })

  const wizardRoute = '/employee/crm/leads/new'

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
        <Target className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-charcoal-700 mb-2">No drafts</h3>
        <p className="text-sm text-charcoal-500 mb-4">
          You don&apos;t have any leads in progress. Start creating a new one!
        </p>
        <Button onClick={() => router.push(wizardRoute)}>
          <Plus className="w-4 h-4 mr-2" />
          Start New Lead
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
    const firstName = draft.first_name as string | null | undefined
    const lastName = draft.last_name as string | null | undefined
    const companyName = draft.company_name as string | null | undefined
    const email = draft.email as string | null | undefined

    const name = [firstName, lastName].filter(Boolean).join(' ')
    if (name) return name
    if (companyName) return companyName
    if (email) return email
    return 'Untitled Lead'
  }

  return (
    <div className="space-y-3">
      {items.map((draft) => {
        const displayName = getDisplayName(draft)
        const lastSaved = (draft.updated_at || draft.created_at) as string | undefined
        const score = draft.lead_score as number | null | undefined
        const draftId = draft.id as string
        const companyName = draft.company_name as string | null | undefined
        const firstName = draft.first_name as string | null | undefined

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
                  {companyName && firstName && (
                    <span className="truncate max-w-[200px]">
                      {companyName}
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
              {/* Score badge */}
              {score !== null && score !== undefined && (
                <div className="hidden md:flex items-center gap-2">
                  <span className="text-sm text-charcoal-500">Score:</span>
                  <span className={`text-sm font-semibold ${
                    score >= 70 ? 'text-green-600' : score >= 40 ? 'text-amber-600' : 'text-charcoal-500'
                  }`}>
                    {score}
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
