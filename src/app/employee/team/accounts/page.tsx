'use client'

import { EntityListView } from '@/components/pcf/list-view/EntityListView'
import { clientsListConfig, Company } from '@/configs/entities/companies.config'
import type { ListViewVariant } from '@/configs/entities/types'

// Team variant - shows all team accounts with Assigned To column
const teamVariant: ListViewVariant = {
  title: 'Team Accounts',
  description: 'All accounts assigned to team members',
  // In future: presetFilters: { scope: 'team' }
}

export default function TeamAccountsPage() {
  return <EntityListView<Company> config={clientsListConfig} variant={teamVariant} />
}
