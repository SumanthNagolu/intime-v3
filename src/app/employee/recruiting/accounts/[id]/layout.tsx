'use client'

import { ReactNode } from 'react'
import { useParams } from 'next/navigation'
import { EntityContextProvider, EntityContentSkeleton, EntityContentError } from '@/components/layouts/EntityContextProvider'
import { trpc } from '@/lib/trpc/client'

export default function AccountDetailLayout({ children }: { children: ReactNode }) {
  const params = useParams()
  const accountId = params.id as string

  // Fetch account data for layout context
  const { data: account, isLoading, error } = trpc.crm.accounts.getById.useQuery(
    { id: accountId },
    { enabled: !!accountId }
  )

  // Loading state
  if (isLoading) {
    return <EntityContentSkeleton />
  }

  // Error state
  if (error || !account) {
    return (
      <EntityContentError
        title="Account not found"
        message="The account you're looking for doesn't exist or you don't have access to it."
        backHref="/employee/recruiting/accounts"
        backLabel="Back to Accounts"
      />
    )
  }

  // Build subtitle with industry
  const subtitle = account.industry ? account.industry.replace(/_/g, ' ') : undefined

  return (
    <EntityContextProvider
      entityType="account"
      entityId={accountId}
      entityName={account.name}
      entitySubtitle={subtitle}
      entityStatus={account.status}
    >
      {children}
    </EntityContextProvider>
  )
}
