'use client'

import { BarChart3 } from 'lucide-react'
import { EmptyState } from '@/components/pcf/shared/EmptyState'

interface EngagementSectionProps {
  contactId: string
  contact: {
    id: string
    lead_score?: number | null
    lead_engagement_score?: number | null
    lead_email_opens?: number | null
    lead_email_clicks?: number | null
  }
}

export function EngagementSection({ contactId, contact }: EngagementSectionProps) {
  return (
    <div className="p-6">
      <EmptyState
        config={{
          icon: BarChart3,
          title: 'Engagement',
          description: 'Track email opens, clicks, website visits, and overall engagement metrics.',
        }}
        variant="inline"
      />
    </div>
  )
}
