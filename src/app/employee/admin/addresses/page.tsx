'use client'

import { EntityListView } from '@/components/pcf/list-view/EntityListView'
import { addressesListConfig, Address } from '@/configs/entities/addresses.config'

export default function AddressesPage() {
  return <EntityListView<Address> config={addressesListConfig} />
}
