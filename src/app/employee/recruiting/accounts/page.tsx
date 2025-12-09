'use client'

import { EntityListView } from '@/components/pcf/list-view/EntityListView'
import { accountsListConfig, Account } from '@/configs/entities/accounts.config'

export default function AccountsPage() {
  return <EntityListView<Account> config={accountsListConfig} />
}
