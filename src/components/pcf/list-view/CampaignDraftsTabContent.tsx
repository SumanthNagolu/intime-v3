'use client'

import { useRouter } from 'next/navigation'
import { Megaphone, Trash2, Play, Clock, Plus, FileText } from 'lucide-react'
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
import { CAMPAIGN_TYPE_CONFIG } from '@/configs/entities/campaigns.config'

interface CampaignDraftItem extends Record<string, unknown> {
  id: string
  name?: string | null
  campaignType?: string | null
  goal?: string | null
  channels?: string[]
  createdAt?: string
  updatedAt?: string
}

interface CampaignDraftsTabContentProps {
  items: CampaignDraftItem[]
  isLoading: boolean
  filters: Record<string, unknown>
}

/**
 * Custom tab content for campaign drafts that:
 * 1. Renders drafts as cards (not table rows)
 * 2. Clicking a draft opens the campaign workspace
 * 3. Includes delete functionality
 */
export function CampaignDraftsTabContent({
  items,
  isLoading,
}: CampaignDraftsTabContentProps) {
  const router = useRouter()
  const utils = trpc.useUtils()

  // Use dedicated deleteDraft mutation for soft-delete
  const deleteMutation = trpc.crm.campaigns.deleteDraft.useMutation({
    onSuccess: () => {
      utils.crm.campaigns.listWithStats.invalidate()
      utils.crm.campaigns.listMyDrafts.invalidate()
    },
  })

  const wizardRoute = '/employee/crm/campaigns/new'
  const baseRoute = '/employee/crm/campaigns'

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
        <FileText className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-charcoal-700 mb-2">No draft campaigns</h3>
        <p className="text-sm text-charcoal-500 mb-4">
          You don&apos;t have any campaigns in draft. Start creating a new one!
        </p>
        <Button onClick={() => router.push(wizardRoute)}>
          <Plus className="w-4 h-4 mr-2" />
          New Campaign
        </Button>
      </div>
    )
  }

  const handleOpen = (draft: CampaignDraftItem) => {
    router.push(`${baseRoute}/${draft.id}`)
  }

  const handleDelete = async (draftId: string) => {
    await deleteMutation.mutateAsync({ id: draftId })
  }

  return (
    <div className="space-y-3">
      {items.map((draft) => {
        const displayName = String(draft.name || 'Untitled Campaign')
        const lastUpdated = draft.updatedAt || draft.createdAt
        const campaignType = draft.campaignType
        const typeConfig = campaignType ? CAMPAIGN_TYPE_CONFIG[campaignType] : null

        return (
          <div
            key={draft.id}
            className="flex items-center justify-between p-4 bg-white border border-charcoal-200 rounded-lg hover:border-gold-300 hover:shadow-sm transition-all cursor-pointer"
            onClick={() => handleOpen(draft)}
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center shrink-0">
                <Megaphone className="w-5 h-5 text-charcoal-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-charcoal-900 truncate text-base">
                    {displayName}
                  </span>
                  <Badge className="bg-amber-100 text-amber-800 border-amber-300 shrink-0">
                    Draft
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-charcoal-500">
                  {typeConfig && (
                    <span>{typeConfig.label}</span>
                  )}
                  {draft.channels && draft.channels.length > 0 && (
                    <span>{draft.channels.length} channel{draft.channels.length > 1 ? 's' : ''}</span>
                  )}
                  {lastUpdated && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDistanceToNow(new Date(lastUpdated), { addSuffix: true })}
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
                onClick={() => handleOpen(draft)}
                className="border-gold-400 hover:bg-gold-50 text-gold-700"
              >
                <Play className="w-3.5 h-3.5 mr-1.5" />
                Edit
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
