'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { EntityDetailView } from '@/components/pcf/detail-view/EntityDetailView'
import { campaignsDetailConfig, Campaign } from '@/configs/entities/campaigns.config'
import { EditCampaignDialog } from '@/components/crm/campaigns/EditCampaignDialog'
import { CompleteCampaignDialog } from '@/components/crm/campaigns/CompleteCampaignDialog'
import { DuplicateCampaignDialog } from '@/components/crm/campaigns/DuplicateCampaignDialog'
import { AddProspectDialog } from '@/components/crm/campaigns/AddProspectDialog'
import { ProspectImportDialog } from '@/components/crm/campaigns/ProspectImportDialog'
import { LinkLeadsToCampaignDialog } from '@/components/crm/campaigns/LinkLeadsToCampaignDialog'
import { UploadDocumentDialog } from '@/components/crm/campaigns/UploadDocumentDialog'
import { AddSequenceStepDialog } from '@/components/crm/campaigns/AddSequenceStepDialog'
import { EditSequenceStepDialog } from '@/components/crm/campaigns/EditSequenceStepDialog'
import { LogActivityModal } from '@/components/recruiter-workspace/LogActivityModal'
import { useEntityData } from '@/components/layouts/EntityContextProvider'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'

// Custom event handler types
declare global {
  interface WindowEventMap {
    openCampaignDialog: CustomEvent<{
      dialogId: string
      campaignId?: string
      stepData?: {
        id: string
        channel: string
        stepNumber: number
        dayOffset?: number
        subject?: string
        templateName?: string
      }
    }>
  }
}

export default function CampaignPage() {
  const params = useParams()
  const router = useRouter()
  const campaignId = params.id as string

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false)
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false)
  const [addProspectOpen, setAddProspectOpen] = useState(false)
  const [importProspectsOpen, setImportProspectsOpen] = useState(false)
  const [linkLeadsOpen, setLinkLeadsOpen] = useState(false)
  const [uploadDocumentOpen, setUploadDocumentOpen] = useState(false)
  const [addSequenceStepOpen, setAddSequenceStepOpen] = useState(false)
  const [editSequenceStepOpen, setEditSequenceStepOpen] = useState(false)
  const [selectedStep, setSelectedStep] = useState<{
    id: string
    channel: string
    stepNumber: number
    dayOffset?: number
    subject?: string
    templateName?: string
  } | null>(null)
  const [logActivityOpen, setLogActivityOpen] = useState(false)

  const utils = trpc.useUtils()

  // ONE DATABASE CALL PATTERN: Get campaign data from server-side context
  // No client-side query needed - data already fetched in layout.tsx via getFullEntity
  const entityData = useEntityData<Campaign>()
  const campaign = entityData?.data

  // Status mutations
  const updateStatus = trpc.crm.campaigns.updateStatus.useMutation({
    onSuccess: () => {
      toast.success('Campaign status updated')
      // Invalidate the full entity query to refresh data
      utils.crm.campaigns.getFullEntity.invalidate({ id: campaignId })
      utils.crm.campaigns.list.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update status')
    },
  })

  // Listen for dialog events from sidebar quick actions and PCF components
  useEffect(() => {
    const handleCampaignDialog = (event: CustomEvent<{
      dialogId: string
      campaignId?: string
      stepData?: {
        id: string
        channel: string
        stepNumber: number
        dayOffset?: number
        subject?: string
        templateName?: string
      }
    }>) => {
      switch (event.detail.dialogId) {
        // Campaign management dialogs
        case 'edit':
          setEditDialogOpen(true)
          break
        case 'complete':
          setCompleteDialogOpen(true)
          break
        case 'duplicate':
          setDuplicateDialogOpen(true)
          break

        // Prospect management
        case 'addProspect':
          setAddProspectOpen(true)
          break
        case 'importProspects':
          setImportProspectsOpen(true)
          break

        // Lead management
        case 'linkLeads':
          setLinkLeadsOpen(true)
          break

        // Document management
        case 'uploadDocument':
          setUploadDocumentOpen(true)
          break

        // Activity logging
        case 'logActivity':
          setLogActivityOpen(true)
          break

        // Sequence management (from Sequence section and sidebar)
        case 'addSequenceStep':
          setAddSequenceStepOpen(true)
          break
        case 'editSequence':
          // Navigate to sequence section for editing
          window.history.pushState({}, '', `/employee/crm/campaigns/${campaignId}?mode=sections&section=sequence`)
          window.dispatchEvent(new PopStateEvent('popstate'))
          break
        case 'viewSequenceStep':
        case 'editSequenceStep':
          // Open edit dialog with step data
          if (event.detail.stepData) {
            setSelectedStep(event.detail.stepData)
            setEditSequenceStepOpen(true)
          } else {
            toast.error('Step data not found')
          }
          break
        case 'toggleSequence':
          // Toggle sequence running state
          if (campaign) {
            const newStatus = campaign.status === 'active' ? 'paused' : 'active'
            updateStatus.mutate({ id: campaignId, status: newStatus })
          }
          break

        // Status changes
        case 'start':
          if (campaign) {
            updateStatus.mutate({ id: campaignId, status: 'active' })
          }
          break
        case 'pause':
          if (campaign) {
            updateStatus.mutate({ id: campaignId, status: 'paused' })
          }
          break
        case 'resume':
          if (campaign) {
            updateStatus.mutate({ id: campaignId, status: 'active' })
          }
          break

        // Reports and analytics
        case 'exportReport':
          toast.info('Export report feature coming soon')
          break
        case 'viewAnalytics':
          // Navigate to analytics section
          window.history.pushState({}, '', `/employee/crm/campaigns/${campaignId}?mode=sections&section=analytics`)
          window.dispatchEvent(new PopStateEvent('popstate'))
          break

        // Quick navigation from sidebar
        case 'viewFunnel':
          window.history.pushState({}, '', `/employee/crm/campaigns/${campaignId}?mode=sections&section=funnel`)
          window.dispatchEvent(new PopStateEvent('popstate'))
          break
        case 'viewProspects':
          window.history.pushState({}, '', `/employee/crm/campaigns/${campaignId}?mode=sections&section=prospects`)
          window.dispatchEvent(new PopStateEvent('popstate'))
          break
        case 'viewLeads':
          window.history.pushState({}, '', `/employee/crm/campaigns/${campaignId}?mode=sections&section=leads`)
          window.dispatchEvent(new PopStateEvent('popstate'))
          break
      }
    }

    window.addEventListener('openCampaignDialog', handleCampaignDialog)
    return () => window.removeEventListener('openCampaignDialog', handleCampaignDialog)
  }, [campaign, campaignId, updateStatus])

  // Helper to invalidate and refresh data after mutations
  const invalidateCampaign = () => {
    utils.crm.campaigns.getFullEntity.invalidate({ id: campaignId })
  }

  return (
    <>
      {/* ONE DATABASE CALL PATTERN: Pass server-fetched entity to avoid client query */}
      <EntityDetailView<Campaign>
        config={campaignsDetailConfig}
        entityId={campaignId}
        entity={campaign}
      />

      {/* Dialogs */}
      {campaign && (
        <>
          <EditCampaignDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            campaignId={campaignId}
            onSuccess={() => {
              invalidateCampaign()
              utils.crm.campaigns.list.invalidate()
            }}
          />

          <CompleteCampaignDialog
            open={completeDialogOpen}
            onOpenChange={setCompleteDialogOpen}
            campaignId={campaignId}
            campaignName={campaign.name}
            onSuccess={() => {
              invalidateCampaign()
              utils.crm.campaigns.list.invalidate()
            }}
          />

          <DuplicateCampaignDialog
            open={duplicateDialogOpen}
            onOpenChange={setDuplicateDialogOpen}
            campaignId={campaignId}
            originalName={campaign.name}
            onSuccess={() => {
              utils.crm.campaigns.list.invalidate()
              toast.success('Campaign duplicated successfully')
            }}
          />

          <AddProspectDialog
            open={addProspectOpen}
            onOpenChange={setAddProspectOpen}
            campaignId={campaignId}
            onSuccess={invalidateCampaign}
          />

          <ProspectImportDialog
            open={importProspectsOpen}
            onOpenChange={setImportProspectsOpen}
            campaignId={campaignId}
            onSuccess={invalidateCampaign}
          />

          <LinkLeadsToCampaignDialog
            open={linkLeadsOpen}
            onOpenChange={setLinkLeadsOpen}
            campaignId={campaignId}
            onSuccess={invalidateCampaign}
          />

          <UploadDocumentDialog
            open={uploadDocumentOpen}
            onOpenChange={setUploadDocumentOpen}
            campaignId={campaignId}
          />

          <AddSequenceStepDialog
            open={addSequenceStepOpen}
            onOpenChange={setAddSequenceStepOpen}
            campaignId={campaignId}
            onSuccess={() => {
              invalidateCampaign()
            }}
          />

          <EditSequenceStepDialog
            open={editSequenceStepOpen}
            onOpenChange={(open) => {
              setEditSequenceStepOpen(open)
              if (!open) setSelectedStep(null)
            }}
            campaignId={campaignId}
            step={selectedStep}
            onSuccess={() => {
              invalidateCampaign()
            }}
          />

          <LogActivityModal
            open={logActivityOpen}
            onOpenChange={setLogActivityOpen}
            entityType="campaign"
            entityId={campaignId}
            entityName={campaign.name}
          />
        </>
      )}
    </>
  )
}
