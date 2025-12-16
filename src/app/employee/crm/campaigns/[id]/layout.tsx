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

  // ONE DATABASE CALL PATTERN: Fetch entity with ALL section data pre-loaded
  // This eliminates redundant client-side queries from EntityDetailView, Sidebar, and Page
  const campaign = await caller.crm.campaigns.getFullEntity({ id: campaignId }).catch(() => null)

  if (!campaign) {
    notFound()
  }

  // Build subtitle with campaign type
  const subtitle = campaign.campaignType?.replace(/_/g, ' ')

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
