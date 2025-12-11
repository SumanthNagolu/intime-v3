'use client'

import { EntityListView } from '@/components/pcf/list-view/EntityListView'
// Use unified companies config for accounts (clients + prospects)
import { clientsListConfig, Company } from '@/configs/entities/companies.config'

export default function AccountsPage() {
  return <EntityListView<Company> config={clientsListConfig} />
}
