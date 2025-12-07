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

  // Build subtitle with industry
  const subtitle = account.industry ? account.industry.replace(/_/g, ' ') : undefined

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
