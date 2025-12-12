'use client'

import { EntityListView } from '@/components/pcf/list-view/EntityListView'
import { invoicesListConfig, Invoice } from '@/configs/entities/invoices.config'

export default function InvoicesPage() {
  return <EntityListView<Invoice> config={invoicesListConfig} />
}
