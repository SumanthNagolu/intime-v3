'use client'

import { useParams } from 'next/navigation'
import { CampaignDetailPage } from '@/components/crm/campaigns/CampaignDetailPage'

export default function CampaignPage() {
  const params = useParams()
  const campaignId = params.id as string

  return <CampaignDetailPage campaignId={campaignId} />
}
