import { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { getServerCaller } from '@/server/trpc/server-caller'
import { EntityContextProvider } from '@/components/layouts/EntityContextProvider'

export const dynamic = 'force-dynamic'

interface LeadLayoutProps {
  children: ReactNode
  params: Promise<{ id: string }>
}

export default async function LeadDetailLayout({ children, params }: LeadLayoutProps) {
  const { id: leadId } = await params
  const caller = await getServerCaller()

  // Use unifiedContacts.leads.getById which queries the contacts table (not the old leads table)
  const lead = await caller.unifiedContacts.leads.getById({ id: leadId }).catch(() => null)

  if (!lead) {
    notFound()
  }

  // Build display name and subtitle - use contact table field names
  const displayName = lead.company_name || `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Unknown'
  const subtitle = lead.industry || lead.lead_source?.replace(/_/g, ' ')

  return (
    <EntityContextProvider
      entityType="lead"
      entityId={leadId}
      entityName={displayName}
      entitySubtitle={subtitle}
      entityStatus={lead.lead_status || 'new'}
      initialData={lead}
    >
      {children}
    </EntityContextProvider>
  )
}
