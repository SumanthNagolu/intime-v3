'use client'

import { ListChecks } from 'lucide-react'
import { EmptyState } from '@/components/pcf/shared/EmptyState'
import { useToast } from '@/components/ui/use-toast'

interface QualificationSectionProps {
  contactId: string
  contact: {
    id: string
    lead_bant_budget?: number | null
    lead_bant_authority?: number | null
    lead_bant_need?: number | null
    lead_bant_timeline?: number | null
    lead_bant_total_score?: number | null
  }
  onUpdate?: () => void
}

export function QualificationSection({ contactId, contact }: QualificationSectionProps) {
  const { toast } = useToast()

  const handleStartQualification = () => {
    toast({
      title: 'BANT Qualification',
      description: 'BANT qualification scoring functionality coming soon',
    })
  }

  return (
    <div className="p-6">
      <EmptyState
        config={{
          icon: ListChecks,
          title: 'Lead Qualification',
          description: 'Use BANT scoring to qualify this lead based on Budget, Authority, Need, and Timeline.',
          action: {
            label: 'Start Qualification',
            onClick: handleStartQualification,
          },
        }}
        variant="inline"
      />
    </div>
  )
}
