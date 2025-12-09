'use client'

import { use } from 'react'
import { EntityDetailView } from '@/components/pcf/detail-view/EntityDetailView'
import { vendorsDetailConfig, Vendor } from '@/configs/entities/vendors.config'

export default function VendorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)

  return (
    <EntityDetailView<Vendor>
      config={vendorsDetailConfig}
      entityId={resolvedParams.id}
    />
  )
}
