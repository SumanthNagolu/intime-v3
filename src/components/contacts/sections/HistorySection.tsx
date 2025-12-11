'use client'

import { History } from 'lucide-react'
import { EmptyState } from '@/components/pcf/shared/EmptyState'

interface HistorySectionProps {
  contactId: string
}

export function HistorySection({ contactId }: HistorySectionProps) {
  return (
    <div className="p-6">
      <EmptyState
        config={{
          icon: History,
          title: 'Change History',
          description: 'View all changes made to this contact record over time.',
        }}
        variant="inline"
      />
    </div>
  )
}
