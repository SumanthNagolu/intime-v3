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
import { LogActivityModal } from '@/components/recruiter-workspace/LogActivityModal'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'

// Custom event handler types
declare global {
  interface WindowEventMap {
    openCampaignDialog: CustomEvent<{ dialogId: string; campaignId?: string }>
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
  const [logActivityOpen, setLogActivityOpen] = useState(false)

  const utils = trpc.useUtils()

  // Query for campaign data
  const campaignQuery = trpc.crm.campaigns.getByIdWithCounts.useQuery({ id: campaignId })
  const campaign = campaignQuery.data

  // Status mutations
  const updateStatus = trpc.crm.campaigns.updateStatus.useMutation({
    onSuccess: () => {
      toast.success('Campaign status updated')
      utils.crm.campaigns.getByIdWithCounts.invalidate({ id: campaignId })
      utils.crm.campaigns.list.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update status')
    },
  })

  // Listen for dialog events from sidebar quick actions and PCF components
  useEffect(() => {
    const handleCampaignDialog = (event: CustomEvent<{ dialogId: string; campaignId?: string }>) => {
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
        case 'editSequence':
        case 'viewSequenceStep':
        case 'editSequenceStep':
          toast.info('Sequence editor coming soon')
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

  return (
    <>
      <EntityDetailView<Campaign>
        config={campaignsDetailConfig}
        entityId={campaignId}
      />

      {/* Dialogs */}
      {campaign && (
        <>
          <EditCampaignDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            campaignId={campaignId}
            onSuccess={() => {
              campaignQuery.refetch()
              utils.crm.campaigns.list.invalidate()
            }}
          />

          <CompleteCampaignDialog
            open={completeDialogOpen}
            onOpenChange={setCompleteDialogOpen}
            campaignId={campaignId}
            campaignName={campaign.name}
            onSuccess={() => {
              campaignQuery.refetch()
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
            onSuccess={() => {
              campaignQuery.refetch()
            }}
          />

          <ProspectImportDialog
            open={importProspectsOpen}
            onOpenChange={setImportProspectsOpen}
            campaignId={campaignId}
            onSuccess={() => {
              campaignQuery.refetch()
            }}
          />

          <LinkLeadsToCampaignDialog
            open={linkLeadsOpen}
            onOpenChange={setLinkLeadsOpen}
            campaignId={campaignId}
            onSuccess={() => {
              campaignQuery.refetch()
            }}
          />

          <UploadDocumentDialog
            open={uploadDocumentOpen}
            onOpenChange={setUploadDocumentOpen}
            campaignId={campaignId}
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
