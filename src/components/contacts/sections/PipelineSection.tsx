'use client'

import { Layers } from 'lucide-react'
import { EmptyState } from '@/components/pcf/shared/EmptyState'

interface PipelineSectionProps {
  contactId: string
}

export function PipelineSection({ contactId }: PipelineSectionProps) {
  return (
    <div className="p-6">
      <EmptyState
        config={{
          icon: Layers,
          title: 'Pipeline',
          description: 'Track submissions, interviews, and placements for this candidate.',
        }}
        variant="inline"
      />
    </div>
  )
}
