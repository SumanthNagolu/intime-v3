import { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { EntityContextProvider } from '@/components/layouts/EntityContextProvider'
import { AccountWorkspaceProvider } from '@/components/workspaces/account/AccountWorkspaceProvider'
import { getFullAccount } from '@/server/actions/accounts'

export const dynamic = 'force-dynamic'

interface AccountLayoutProps {
  children: ReactNode
  params: Promise<{ id: string }>
}

export default async function AccountDetailLayout({ children, params }: AccountLayoutProps) {
  const { id: accountId } = await params

  // ONE DATABASE CALL: Fetch all account data in parallel
  const data = await getFullAccount(accountId)

  if (!data) {
    notFound()
  }

  const { account } = data

  // Build subtitle with industries (show first industry, with count if multiple)
  const industries = account.industries
  let subtitle: string | undefined
  if (industries && industries.length > 0) {
    const firstIndustry = industries[0].replace(/_/g, ' ')
    subtitle = industries.length > 1
      ? `${firstIndustry} +${industries.length - 1} more`
      : firstIndustry
  } else if (account.industry) {
    subtitle = account.industry.replace(/_/g, ' ')
  }

  return (
    <EntityContextProvider
      entityType="account"
      entityId={accountId}
      entityName={account.name}
      entitySubtitle={subtitle}
      entityStatus={account.status}
      initialData={account}
    >
      <AccountWorkspaceProvider initialData={data}>
        {children}
      </AccountWorkspaceProvider>
    </EntityContextProvider>
  )
}
