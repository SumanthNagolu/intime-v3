'use client'

import { EntityListView } from '@/components/pcf/list-view/EntityListView'
import { clientsListConfig, Company } from '@/configs/entities/companies.config'
import type { ListViewVariant } from '@/configs/entities/types'

// My Space variant - shows only my accounts
const mySpaceVariant: ListViewVariant = {
  title: 'My Accounts',
  description: 'Accounts assigned to you',
  // In future: presetFilters: { owner: 'me' }
}

export default function MyAccountsPage() {
  return <EntityListView<Company> config={clientsListConfig} variant={mySpaceVariant} />
}
