'use client'

import { use } from 'react'
import { VendorDetailPage } from '@/components/recruiting/vendors/VendorDetailPage'

export default function VendorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  return <VendorDetailPage vendorId={resolvedParams.id} />
}
