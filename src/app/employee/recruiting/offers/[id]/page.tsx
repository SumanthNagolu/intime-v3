'use client'

import { useParams } from 'next/navigation'
import { EntityDetailView } from '@/components/pcf/detail-view/EntityDetailView'
import { offersDetailConfig, Offer } from '@/configs/entities/offers.config'
import { useEntityData } from '@/components/layouts/EntityContextProvider'
import type { FullOffer } from '@/types/offer'
import { OfferContextHeader } from '@/components/workspaces/offer'

export default function OfferDetailPage() {
  const params = useParams()
  const offerId = params.id as string

  // ONE database call pattern: Get data from server-side context
  const entityData = useEntityData<FullOffer>()
  const offer = entityData?.data

  return (
    <div className="flex flex-col h-full">
      {/* Context Header Bar - shows candidate, job, account context */}
      {offer && (
        <OfferContextHeader
          offer={offer}
          onQuickAction={(action) => {
            window.dispatchEvent(
              new CustomEvent('openOfferDialog', {
                detail: { dialogId: action, offerId: offer.id },
              })
            )
          }}
        />
      )}

      {/* Main Detail View - passes entity to skip client query */}
      <div className="flex-1 overflow-auto">
        <EntityDetailView<Offer>
          config={offersDetailConfig}
          entityId={offerId}
          entity={offer as Offer | undefined}
        />
      </div>
    </div>
  )
}
