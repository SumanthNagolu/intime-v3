'use client'

import { Suspense } from 'react'
import { EntityListView } from '@/components/pcf/list-view/EntityListView'
import { EntityListViewSkeleton } from '@/components/pcf/shared'
import { invoicesListConfig, type Invoice } from '@/configs/entities/invoices.config'

function InvoicesListContent() {
  return <EntityListView<Invoice> config={invoicesListConfig} />
}

export default function InvoicesPage() {
  return (
    <Suspense fallback={<EntityListViewSkeleton />}>
      <InvoicesListContent />
    </Suspense>
  )
}
