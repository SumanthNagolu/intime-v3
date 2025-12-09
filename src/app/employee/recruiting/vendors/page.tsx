'use client'

import { EntityListView } from '@/components/pcf/list-view/EntityListView'
import { vendorsListConfig, Vendor } from '@/configs/entities/vendors.config'

export default function VendorsPage() {
  return <EntityListView<Vendor> config={vendorsListConfig} />
}
