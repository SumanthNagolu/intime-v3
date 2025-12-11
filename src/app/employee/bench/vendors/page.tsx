'use client'

import { EntityListView } from '@/components/pcf/list-view/EntityListView'
// Use unified companies config for vendors
import { vendorsListConfig, Company } from '@/configs/entities/companies.config'

export default function VendorsPage() {
  return <EntityListView<Company> config={vendorsListConfig} />
}
