'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DealWorkspace } from '@/components/workspaces/deal/DealWorkspace'
import { useDealWorkspace } from '@/components/workspaces/deal/DealWorkspaceProvider'
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

// Type for deal dialog props - matches CloseWonDialogProps and CloseLostDialogProps
interface DealDialogData {
  id: string
  name: string
  value?: number
  account?: { id: string; name: string } | null
  lead?: { company_name?: string } | null
  competitors?: string[] | null
}

export default function DealDetailPage() {
  const router = useRouter()
  const { toast } = useToast()

  // ONE DATABASE CALL PATTERN: Get deal data from workspace context (provided by layout)
  // NO client-side query needed - data comes from server via DealWorkspaceProvider
  const { data, refreshData } = useDealWorkspace()
  const deal = data.deal

  // Dialog states
  const [closeWonOpen, setCloseWonOpen] = useState(false)
  const [closeLostOpen, setCloseLostOpen] = useState(false)
  const [moveStageDialogOpen, setMoveStageDialogOpen] = useState(false)
  const [selectedStage, setSelectedStage] = useState<string>('')

  const utils = trpc.useUtils()

  // Update stage mutation
  const updateStage = trpc.crm.deals.updateStage.useMutation({
    onSuccess: () => {
      toast({ title: 'Stage updated', description: 'Deal stage has been updated' })
      // Refresh server data via router.refresh (handled by refreshData)
      refreshData()
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
        id: deal.id,
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
    refreshData()
    utils.crm.deals.list.invalidate()
    router.push('/employee/crm/deals')
  }

  // Build deal object for dialogs (transform from workspace data structure)
  const dealForDialogs: DealDialogData = {
    id: deal.id,
    name: deal.title,
    value: deal.value,
    account: data.account ? {
      id: data.account.id,
      name: data.account.name,
    } : null,
    lead: data.lead ? {
      company_name: data.lead.fullName,
    } : null,
    competitors: null, // Add if available in deal data
  }

  return (
    <>
      {/* Main workspace component - uses context data, NO client queries */}
      <DealWorkspace
        onMoveStage={() => setMoveStageDialogOpen(true)}
        onCloseWon={() => setCloseWonOpen(true)}
        onCloseLost={() => setCloseLostOpen(true)}
      />

      {/* Close Won Dialog */}
      <CloseWonDialog
        open={closeWonOpen}
        onOpenChange={setCloseWonOpen}
        deal={dealForDialogs}
        onSuccess={handleCloseSuccess}
      />

      {/* Close Lost Dialog */}
      <CloseLostDialog
        open={closeLostOpen}
        onOpenChange={setCloseLostOpen}
        deal={dealForDialogs}
        onSuccess={handleCloseSuccess}
      />

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
                    disabled={stage.key === deal.stage}
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn('w-3 h-3 rounded-full', stage.color)} />
                      {stage.label}
                      {stage.key === deal.stage && ' (current)'}
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
