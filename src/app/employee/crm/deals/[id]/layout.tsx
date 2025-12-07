import { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { getServerCaller } from '@/server/trpc/server-caller'
import { EntityContextProvider } from '@/components/layouts/EntityContextProvider'

export const dynamic = 'force-dynamic'

interface DealLayoutProps {
  children: ReactNode
  params: Promise<{ id: string }>
}

export default async function DealDetailLayout({ children, params }: DealLayoutProps) {
  const { id: dealId } = await params
  const caller = await getServerCaller()

  const deal = await caller.crm.deals.getById({ id: dealId }).catch(() => null)

  if (!deal) {
    notFound()
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
      initialData={deal}
    >
      {children}
    </EntityContextProvider>
  )
}
