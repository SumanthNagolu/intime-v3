import { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { getFullLead } from '@/server/actions/leads'
import { EntityContextProvider } from '@/components/layouts/EntityContextProvider'
import { LeadWorkspaceProvider } from '@/components/workspaces/lead/LeadWorkspaceProvider'

export const dynamic = 'force-dynamic'

interface LeadLayoutProps {
  children: ReactNode
  params: Promise<{ id: string }>
}

export default async function LeadDetailLayout({ children, params }: LeadLayoutProps) {
  const { id: leadId } = await params

  // ONE DATABASE CALL: Fetch lead with ALL section data
  const data = await getFullLead(leadId)

  if (!data) {
    notFound()
  }

  // Build display name and subtitle
  const displayName = data.lead.companyName
    ? `${data.lead.fullName} - ${data.lead.companyName}`
    : data.lead.fullName
  const subtitle = [data.lead.title, data.lead.industry].filter(Boolean).join(' | ')

  return (
    <EntityContextProvider
      entityType="lead"
      entityId={leadId}
      entityName={displayName}
      entitySubtitle={subtitle}
      entityStatus={data.lead.status}
      initialData={data}
    >
      <LeadWorkspaceProvider initialData={data}>
        {children}
      </LeadWorkspaceProvider>
    </EntityContextProvider>
  )
}
