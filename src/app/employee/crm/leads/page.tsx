'use client'

import { EntityListView } from '@/components/pcf/list-view/EntityListView'
import { leadsListConfig, Lead } from '@/configs/entities/leads.config'

export default function LeadsPage() {
  return <EntityListView<Lead> config={leadsListConfig} />
}
