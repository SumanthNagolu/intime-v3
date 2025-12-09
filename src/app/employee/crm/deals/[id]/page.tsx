'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { EntityDetailView } from '@/components/pcf/detail-view/EntityDetailView'
import { dealsDetailConfig, Deal } from '@/configs/entities/deals.config'
import { CloseWonDialog, CloseLostDialog } from '@/components/crm/deals'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

// Stage configuration for move stage dialog
const stageConfig = [
  { key: 'discovery', label: 'Discovery', color: 'bg-slate-500' },
  { key: 'qualification', label: 'Qualification', color: 'bg-blue-500' },
  { key: 'proposal', label: 'Proposal', color: 'bg-amber-500' },
  { key: 'negotiation', label: 'Negotiation', color: 'bg-orange-500' },
  { key: 'verbal_commit', label: 'Verbal Commit', color: 'bg-green-500' },
]

// Custom event handler types
declare global {
  interface WindowEventMap {
    openDealDialog: CustomEvent<{ dialogId: string; dealId?: string }>
  }
}

export default function DealDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const dealId = params.id as string

  // Dialog states
  const [closeWonOpen, setCloseWonOpen] = useState(false)
  const [closeLostOpen, setCloseLostOpen] = useState(false)
  const [moveStageDialogOpen, setMoveStageDialogOpen] = useState(false)
  const [selectedStage, setSelectedStage] = useState<string>('')

  const utils = trpc.useUtils()

  // Query for deal data (needed for dialogs)
  const dealQuery = trpc.crm.deals.getById.useQuery({ id: dealId })
  const deal = dealQuery.data

  // Update stage mutation
  const updateStage = trpc.crm.deals.updateStage.useMutation({
    onSuccess: () => {
      toast({ title: 'Stage updated', description: 'Deal stage has been updated' })
      utils.crm.deals.getById.invalidate({ id: dealId })
      utils.crm.deals.pipeline.invalidate()
      setMoveStageDialogOpen(false)
      setSelectedStage('')
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  const handleMoveStage = () => {
    if (selectedStage) {
      updateStage.mutate({
        id: dealId,
        stage: selectedStage as
          | 'discovery'
          | 'qualification'
          | 'proposal'
          | 'negotiation'
          | 'verbal_commit'
          | 'closed_won'
          | 'closed_lost',
      })
    }
  }

  // Listen for quick action dialog events from the sidebar and PCF components
  useEffect(() => {
    const handleOpenDialog = (event: CustomEvent<{ dialogId: string; dealId?: string }>) => {
      switch (event.detail.dialogId) {
        case 'closeWon':
          setCloseWonOpen(true)
          break
        case 'closeLost':
          setCloseLostOpen(true)
          break
        case 'moveStage':
        case 'advanceStage':
          setMoveStageDialogOpen(true)
          break
        case 'logActivity':
        case 'logDealActivity':
          // Activity logging is handled inline in the Activity section
          break
      }
    }

    window.addEventListener('openDealDialog', handleOpenDialog)
    return () => window.removeEventListener('openDealDialog', handleOpenDialog)
  }, [])

  const handleCloseSuccess = () => {
    dealQuery.refetch()
    utils.crm.deals.list.invalidate()
    router.push('/employee/crm/deals')
  }

  return (
    <>
      <EntityDetailView<Deal>
        config={dealsDetailConfig}
        entityId={dealId}
      />

      {/* Close Won Dialog */}
      {deal && (
        <CloseWonDialog
          open={closeWonOpen}
          onOpenChange={setCloseWonOpen}
          deal={deal as any}
          onSuccess={handleCloseSuccess}
        />
      )}

      {/* Close Lost Dialog */}
      {deal && (
        <CloseLostDialog
          open={closeLostOpen}
          onOpenChange={setCloseLostOpen}
          deal={deal as any}
          onSuccess={handleCloseSuccess}
        />
      )}

      {/* Move Stage Dialog */}
      <Dialog open={moveStageDialogOpen} onOpenChange={setMoveStageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Deal to Stage</DialogTitle>
            <DialogDescription>Select the new stage for this deal</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Select value={selectedStage} onValueChange={setSelectedStage}>
              <SelectTrigger>
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                {stageConfig.map((stage) => (
                  <SelectItem
                    key={stage.key}
                    value={stage.key}
                    disabled={stage.key === deal?.stage}
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn('w-3 h-3 rounded-full', stage.color)} />
                      {stage.label}
                      {stage.key === deal?.stage && ' (current)'}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setMoveStageDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleMoveStage}
              disabled={!selectedStage || updateStage.isPending}
            >
              {updateStage.isPending ? 'Moving...' : 'Move Stage'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
