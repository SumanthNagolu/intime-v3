'use client'

import { Briefcase } from 'lucide-react'
import { EmptyState } from '@/components/pcf/shared/EmptyState'

interface DealsSectionProps {
  contactId: string
}

export function DealsSection({ contactId }: DealsSectionProps) {
  const handleCreateDeal = () => {
    window.location.href = `/employee/crm/deals/new?contact=${contactId}`
  }

  return (
    <div className="p-6">
      <EmptyState
        config={{
          icon: Briefcase,
          title: 'Deals',
          description: 'Track sales opportunities and deals associated with this contact.',
          action: {
            label: 'Create Deal',
            onClick: handleCreateDeal,
          },
        }}
        variant="inline"
      />
    </div>
  )
}
