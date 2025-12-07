import { CampaignDetailPage } from '@/components/crm/campaigns'

interface Props {
  params: Promise<{ id: string }>
}

export default async function CampaignPage({ params }: Props) {
  const { id } = await params
  return <CampaignDetailPage campaignId={id} />
}
