'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CampaignWorkspace } from '@/components/workspaces/CampaignWorkspace'
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
import { ConvertToLeadDialog } from '@/components/campaigns/prospects'
import type { CampaignProspect } from '@/types/campaign'
import { useCampaignWorkspace } from '@/components/workspaces/campaign/CampaignWorkspaceProvider'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'

// Custom event handler types
declare global {
  interface WindowEventMap {
    openCampaignDialog: CustomEvent<{
      dialogId: string
      campaignId?: string
      prospectData?: CampaignProspect
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
  const { data, refreshData } = useCampaignWorkspace()
  const campaign = data.campaign

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
  const [convertToLeadOpen, setConvertToLeadOpen] = useState(false)
  const [selectedProspectForConversion, setSelectedProspectForConversion] = useState<CampaignProspect | null>(null)

  const utils = trpc.useUtils()

  // Status mutations
  const updateStatus = trpc.crm.campaigns.updateStatus.useMutation({
    onSuccess: () => {
      toast.success('Campaign status updated')
      refreshData()
      utils.crm.campaigns.list.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update status')
    },
  })

  // Listen for dialog events from sidebar quick actions and section components
  useEffect(() => {
    const handleCampaignDialog = (event: CustomEvent<{
      dialogId: string
      campaignId?: string
      prospectData?: CampaignProspect
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

        // Convert prospect to lead
        case 'convertToLead':
          if (event.detail.prospectData) {
            setSelectedProspectForConversion(event.detail.prospectData)
            setConvertToLeadOpen(true)
          } else {
            toast.error('Prospect data not found')
          }
          break

        // Sequence management (from Sequence section and sidebar)
        case 'addSequenceStep':
          setAddSequenceStepOpen(true)
          break
        case 'editSequence':
          // Navigate to sequence section for editing
          router.push(`/employee/crm/campaigns/${campaignId}?section=sequence`, { scroll: false })
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
          router.push(`/employee/crm/campaigns/${campaignId}?section=analytics`, { scroll: false })
          break

        // Quick navigation from sidebar
        case 'viewFunnel':
          router.push(`/employee/crm/campaigns/${campaignId}?section=funnel`, { scroll: false })
          break
        case 'viewProspects':
          router.push(`/employee/crm/campaigns/${campaignId}?section=prospects`, { scroll: false })
          break
        case 'viewLeads':
          router.push(`/employee/crm/campaigns/${campaignId}?section=leads`, { scroll: false })
          break
      }
    }

    window.addEventListener('openCampaignDialog', handleCampaignDialog)
    return () => window.removeEventListener('openCampaignDialog', handleCampaignDialog)
  }, [campaign, campaignId, router, updateStatus])

  // Refresh data after dialog closes
  const handleDialogChange = (open: boolean, setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    setter(open)
    if (!open) {
      refreshData()
    }
  }

  return (
    <>
      {/* Hublot-inspired Campaign Workspace */}
      <CampaignWorkspace />

      {/* Dialogs */}
      {campaign && (
        <>
          <EditCampaignDialog
            open={editDialogOpen}
            onOpenChange={(open) => handleDialogChange(open, setEditDialogOpen)}
            campaignId={campaignId}
            onSuccess={() => {
              refreshData()
              utils.crm.campaigns.list.invalidate()
            }}
          />

          <CompleteCampaignDialog
            open={completeDialogOpen}
            onOpenChange={(open) => handleDialogChange(open, setCompleteDialogOpen)}
            campaignId={campaignId}
            campaignName={campaign.name}
            onSuccess={() => {
              refreshData()
              utils.crm.campaigns.list.invalidate()
            }}
          />

          <DuplicateCampaignDialog
            open={duplicateDialogOpen}
            onOpenChange={(open) => handleDialogChange(open, setDuplicateDialogOpen)}
            campaignId={campaignId}
            originalName={campaign.name}
            onSuccess={() => {
              utils.crm.campaigns.list.invalidate()
              toast.success('Campaign duplicated successfully')
            }}
          />

          <AddProspectDialog
            open={addProspectOpen}
            onOpenChange={(open) => handleDialogChange(open, setAddProspectOpen)}
            campaignId={campaignId}
            onSuccess={refreshData}
          />

          <ProspectImportDialog
            open={importProspectsOpen}
            onOpenChange={(open) => handleDialogChange(open, setImportProspectsOpen)}
            campaignId={campaignId}
            onSuccess={refreshData}
          />

          <LinkLeadsToCampaignDialog
            open={linkLeadsOpen}
            onOpenChange={(open) => handleDialogChange(open, setLinkLeadsOpen)}
            campaignId={campaignId}
            onSuccess={refreshData}
          />

          <UploadDocumentDialog
            open={uploadDocumentOpen}
            onOpenChange={(open) => handleDialogChange(open, setUploadDocumentOpen)}
            campaignId={campaignId}
          />

          <AddSequenceStepDialog
            open={addSequenceStepOpen}
            onOpenChange={(open) => handleDialogChange(open, setAddSequenceStepOpen)}
            campaignId={campaignId}
            onSuccess={refreshData}
          />

          <EditSequenceStepDialog
            open={editSequenceStepOpen}
            onOpenChange={(open) => {
              setEditSequenceStepOpen(open)
              if (!open) {
                setSelectedStep(null)
                refreshData()
              }
            }}
            campaignId={campaignId}
            step={selectedStep}
            onSuccess={refreshData}
          />

          <LogActivityModal
            open={logActivityOpen}
            onOpenChange={(open) => handleDialogChange(open, setLogActivityOpen)}
            entityType="campaign"
            entityId={campaignId}
            entityName={campaign.name}
          />

          {/* Convert to Lead Dialog */}
          <ConvertToLeadDialog
            open={convertToLeadOpen}
            onOpenChange={(open) => {
              setConvertToLeadOpen(open)
              if (!open) setSelectedProspectForConversion(null)
            }}
            prospect={selectedProspectForConversion}
            onSuccess={() => refreshData()}
          />
        </>
      )}
    </>
  )
}
