'use client'

import { EntityListView } from '@/components/pcf/list-view/EntityListView'
import { offersListConfig, Offer } from '@/configs/entities/offers.config'

export default function OffersPage() {
  return <EntityListView<Offer> config={offersListConfig} />
}
