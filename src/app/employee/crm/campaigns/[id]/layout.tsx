import { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { getFullCampaign } from '@/server/actions/campaigns'
import { EntityContextProvider } from '@/components/layouts/EntityContextProvider'

export const dynamic = 'force-dynamic'

interface CampaignLayoutProps {
  children: ReactNode
  params: Promise<{ id: string }>
}

export default async function CampaignDetailLayout({ children, params }: CampaignLayoutProps) {
  const { id: campaignId } = await params

  // ONE DATABASE CALL PATTERN: Fetch entity with ALL section data pre-loaded
  // Uses server action for optimal performance (single network round-trip)
  const data = await getFullCampaign(campaignId)

  if (!data) {
    notFound()
  }

  const { campaign } = data

  // Build subtitle with campaign type
  const subtitle = campaign.campaignType?.replace(/_/g, ' ')

  return (
    <EntityContextProvider
      entityType="campaign"
      entityId={campaignId}
      entityName={campaign.name}
      entitySubtitle={subtitle || undefined}
      entityStatus={campaign.status}
      initialData={data}
    >
      {children}
    </EntityContextProvider>
  )
}
