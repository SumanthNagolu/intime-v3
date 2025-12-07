'use client'

import { ReactNode } from 'react'
import { useParams } from 'next/navigation'
import { EntityContextProvider, EntityContentSkeleton, EntityContentError } from '@/components/layouts/EntityContextProvider'
import { trpc } from '@/lib/trpc/client'

export default function DealDetailLayout({ children }: { children: ReactNode }) {
  const params = useParams()
  const dealId = params.id as string

  // Fetch deal data for layout context
  const { data: deal, isLoading, error } = trpc.crm.deals.getById.useQuery(
    { id: dealId },
    { enabled: !!dealId }
  )

  // Loading state
  if (isLoading) {
    return <EntityContentSkeleton />
  }

  // Error state
  if (error || !deal) {
    return (
      <EntityContentError
        title="Deal not found"
        message="The deal you're looking for doesn't exist or you don't have access to it."
        backHref="/employee/crm/deals"
        backLabel="Back to Deals"
      />
    )
  }

  // Build subtitle with account/company name and value
  const companyName = deal.account?.name || deal.lead?.company_name
  const valueStr = deal.value ? `$${deal.value.toLocaleString()}` : undefined
  const subtitle = [companyName, valueStr].filter(Boolean).join(' • ')

  return (
    <EntityContextProvider
      entityType="deal"
      entityId={dealId}
      entityName={deal.name}
      entitySubtitle={subtitle || undefined}
      entityStatus={deal.stage}
    >
      {children}
    </EntityContextProvider>
  )
}
