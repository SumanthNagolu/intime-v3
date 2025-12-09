'use client'

import { EntityListView } from '@/components/pcf/list-view/EntityListView'
import { campaignsListConfig, Campaign } from '@/configs/entities/campaigns.config'

export default function CampaignsPage() {
  return <EntityListView<Campaign> config={campaignsListConfig} />
}
