'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { EntityDetailView } from '@/components/pcf/detail-view/EntityDetailView'
import { prospectsDetailConfig, Prospect } from '@/configs/entities/prospects.config'
import { EditProspectDialog } from '@/components/crm/campaigns/EditProspectDialog'
import { ConvertProspectDialog } from '@/components/crm/campaigns/ConvertProspectDialog'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'

// Custom event handler types
declare global {
  interface WindowEventMap {
    openCampaignDialog: CustomEvent<{
      dialogId: string
      campaignId?: string
      prospectId?: string
    }>
  }
}

export default function ProspectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const campaignId = params.id as string
  const prospectId = params.prospectId as string

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [convertDialogOpen, setConvertDialogOpen] = useState(false)

  const utils = trpc.useUtils()

  // Query for prospect data
  const prospectQuery = trpc.crm.campaigns.getProspectById.useQuery({
    campaignId,
    prospectId,
  })
  const prospect = prospectQuery.data

  // Update status mutation
  const updateProspectMutation = trpc.crm.campaigns.updateProspectStatus.useMutation({
    onSuccess: () => {
      toast.success('Prospect updated')
      prospectQuery.refetch()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update prospect')
    },
  })

  // Listen for dialog events from sidebar quick actions and PCF components
  useEffect(() => {
    const handleCampaignDialog = (
      event: CustomEvent<{ dialogId: string; campaignId?: string; prospectId?: string }>
    ) => {
      // Check if this event is for this prospect
      if (event.detail.prospectId && event.detail.prospectId !== prospectId) return

      switch (event.detail.dialogId) {
        case 'editProspect':
          setEditDialogOpen(true)
          break
        case 'convertProspect':
          setConvertDialogOpen(true)
          break
        case 'logProspectActivity':
          // Handle activity logging
          break
        case 'scheduleMeeting':
          // Handle meeting scheduling
          break
        case 'unsubscribeProspect':
          // Update status to unsubscribed
          updateProspectMutation.mutate({
            campaignId,
            prospectId,
            status: 'unsubscribed',
          })
          break
      }
    }

    window.addEventListener('openCampaignDialog', handleCampaignDialog)
    return () => window.removeEventListener('openCampaignDialog', handleCampaignDialog)
  }, [campaignId, prospectId, updateProspectMutation])

  // Override the useEntityQuery in the config for this specific context
  const modifiedConfig = {
    ...prospectsDetailConfig,
    useEntityQuery: () => prospectQuery,
    breadcrumbs: [
      { label: 'CRM', href: '/employee/crm' },
      { label: 'Campaigns', href: '/employee/crm/campaigns' },
      { label: prospect?.campaign?.name || 'Campaign', href: `/employee/crm/campaigns/${campaignId}` },
      { label: 'Prospects', href: `/employee/crm/campaigns/${campaignId}?section=prospects` },
    ],
  }

  return (
    <>
      <EntityDetailView<Prospect>
        config={modifiedConfig}
        entityId={prospectId}
      />

      {/* Dialogs */}
      {prospect && (
        <>
          <EditProspectDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            prospect={prospect as any}
            campaignId={campaignId}
            onSuccess={() => {
              prospectQuery.refetch()
            }}
          />

          <ConvertProspectDialog
            open={convertDialogOpen}
            onOpenChange={setConvertDialogOpen}
            prospect={prospect as any}
            campaignId={campaignId}
            onSuccess={(leadId) => {
              prospectQuery.refetch()
              router.push(`/employee/crm/leads/${leadId}`)
            }}
          />
        </>
      )}
    </>
  )
}

