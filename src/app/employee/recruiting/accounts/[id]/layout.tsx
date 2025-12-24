import { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { getServerCaller } from '@/server/trpc/server-caller'
import { EntityContextProvider } from '@/components/layouts/EntityContextProvider'

export const dynamic = 'force-dynamic'

interface AccountLayoutProps {
  children: ReactNode
  params: Promise<{ id: string }>
}

export default async function AccountDetailLayout({ children, params }: AccountLayoutProps) {
  const { id: accountId } = await params
  const caller = await getServerCaller()

  const account = await caller.crm.accounts.getById({ id: accountId }).catch(() => null)

  if (!account) {
    notFound()
  }

  // Build subtitle with industries (show first industry, with count if multiple)
  const industries = account.industries as string[] | null
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
      {children}
    </EntityContextProvider>
  )
}
