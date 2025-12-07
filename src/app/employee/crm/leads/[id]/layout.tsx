'use client'

import { ReactNode } from 'react'
import { useParams } from 'next/navigation'
import { EntityContextProvider, EntityContentSkeleton, EntityContentError } from '@/components/layouts/EntityContextProvider'
import { trpc } from '@/lib/trpc/client'

export default function LeadDetailLayout({ children }: { children: ReactNode }) {
  const params = useParams()
  const leadId = params.id as string

  // Fetch lead data for layout context
  const { data: lead, isLoading, error } = trpc.crm.leads.getById.useQuery(
    { id: leadId },
    { enabled: !!leadId }
  )

  // Loading state
  if (isLoading) {
    return <EntityContentSkeleton />
  }

  // Error state
  if (error || !lead) {
    return (
      <EntityContentError
        title="Lead not found"
        message="The lead you're looking for doesn't exist or you don't have access to it."
        backHref="/employee/crm/leads"
        backLabel="Back to Leads"
      />
    )
  }

  // Build display name and subtitle
  const displayName = lead.company_name || `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Unknown'
  const subtitle = lead.industry || lead.source?.replace(/_/g, ' ')

  return (
    <EntityContextProvider
      entityType="lead"
      entityId={leadId}
      entityName={displayName}
      entitySubtitle={subtitle}
      entityStatus={lead.status}
    >
      {children}
    </EntityContextProvider>
  )
}
