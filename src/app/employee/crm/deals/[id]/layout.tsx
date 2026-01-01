import { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { getFullDeal } from '@/server/actions/deals'
import { EntityContextProvider } from '@/components/layouts/EntityContextProvider'
import { DealWorkspaceProvider } from '@/components/workspaces/deal/DealWorkspaceProvider'

export const dynamic = 'force-dynamic'

interface DealLayoutProps {
  children: ReactNode
  params: Promise<{ id: string }>
}

export default async function DealDetailLayout({ children, params }: DealLayoutProps) {
  const { id: dealId } = await params

  // ONE DATABASE CALL: Fetch deal with ALL section data
  const data = await getFullDeal(dealId)

  if (!data) {
    notFound()
  }

  // Build subtitle with account name and value
  const accountName = data.account?.name
  const valueStr = data.deal.value > 0 ? `$${data.deal.value.toLocaleString()}` : undefined
  const subtitle = [accountName, valueStr].filter(Boolean).join(' • ')

  return (
    <EntityContextProvider
      entityType="deal"
      entityId={dealId}
      entityName={data.deal.title}
      entitySubtitle={subtitle || undefined}
      entityStatus={data.deal.stage}
      initialData={data}
    >
      <DealWorkspaceProvider initialData={data}>
        {children}
      </DealWorkspaceProvider>
    </EntityContextProvider>
  )
}
