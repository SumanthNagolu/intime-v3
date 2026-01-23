'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { EntityDetailView } from '@/components/pcf/detail-view/EntityDetailView'
import { prospectsDetailConfig, Prospect } from '@/configs/entities/prospects.config'
import { EditProspectDialog } from '@/components/crm/campaigns/EditProspectDialog'
import { ConvertProspectDialog } from '@/components/crm/campaigns/ConvertProspectDialog'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'

// Event type for dialog handlers (extends the one from campaign page)
type CampaignDialogEvent = CustomEvent<{
  dialogId: string
  campaignId?: string
  prospectId?: string
}>

// Type for EditProspectDialog prospect prop
interface EditProspectDialogData {
  id: string
  first_name?: string
  last_name?: string
  email?: string
  company_name?: string
  title?: string
  linkedin_url?: string
  status: string
  response_type?: string
  response_text?: string
  engagement_score?: number
}

// Type for ConvertProspectDialog prospect prop
interface ConvertProspectDialogData {
  id: string
  first_name?: string
  last_name?: string
  company_name?: string
}

// Helper to transform query result to dialog format
function toEditDialogData(prospect: Prospect): EditProspectDialogData {
  return {
    id: prospect.id,
    first_name: prospect.name?.split(' ')[0],
    last_name: prospect.name?.split(' ').slice(1).join(' '),
    email: prospect.email ?? undefined,
    company_name: prospect.company ?? undefined,
    title: prospect.title ?? undefined,
    linkedin_url: prospect.linkedin_url ?? undefined,
    status: prospect.status,
    response_type: prospect.response_type ?? undefined,
    response_text: undefined, // Not in Prospect type
    engagement_score: prospect.engagement_score ?? undefined,
  }
}

function toConvertDialogData(prospect: Prospect): ConvertProspectDialogData {
  return {
    id: prospect.id,
    first_name: prospect.name?.split(' ')[0],
    last_name: prospect.name?.split(' ').slice(1).join(' '),
    company_name: prospect.company ?? undefined,
  }
}

export default function ProspectDetailPage() {
  const params = useParams()
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
  const updateProspectMutation = trpc.crm.campaigns.updateProspect.useMutation({
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
    const handleCampaignDialog = (event: CampaignDialogEvent) => {
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
          // Update status to opted_out
          updateProspectMutation.mutate({
            prospectId,
            status: 'opted_out',
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
            prospect={toEditDialogData(prospect as Prospect)}
            campaignId={campaignId}
            onSuccess={() => {
              prospectQuery.refetch()
            }}
          />

          <ConvertProspectDialog
            open={convertDialogOpen}
            onOpenChange={setConvertDialogOpen}
            prospect={toConvertDialogData(prospect as Prospect)}
            onSuccess={() => {
              prospectQuery.refetch()
              toast.success('Prospect converted to lead')
            }}
          />
        </>
      )}
    </>
  )
}
