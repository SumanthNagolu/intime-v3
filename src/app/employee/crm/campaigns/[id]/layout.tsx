import { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { getServerCaller } from '@/server/trpc/server-caller'
import { EntityContextProvider } from '@/components/layouts/EntityContextProvider'

export const dynamic = 'force-dynamic'

interface CampaignLayoutProps {
  children: ReactNode
  params: Promise<{ id: string }>
}

export default async function CampaignDetailLayout({ children, params }: CampaignLayoutProps) {
  const { id: campaignId } = await params
  const caller = await getServerCaller()

  // Use optimized query with all counts
  const campaign = await caller.crm.campaigns.getByIdWithCounts({ id: campaignId }).catch(() => null)

  if (!campaign) {
    notFound()
  }

  // Build subtitle with campaign type
  const subtitle = campaign.campaign_type?.replace(/_/g, ' ')

  return (
    <EntityContextProvider
      entityType="campaign"
      entityId={campaignId}
      entityName={campaign.name}
      entitySubtitle={subtitle || undefined}
      entityStatus={campaign.status}
      initialData={campaign}
    >
      {children}
    </EntityContextProvider>
  )
}
