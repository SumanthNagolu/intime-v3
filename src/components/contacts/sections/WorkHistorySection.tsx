'use client'

import { Briefcase } from 'lucide-react'
import { EmptyState } from '@/components/pcf/shared/EmptyState'
import { useToast } from '@/components/ui/use-toast'

interface WorkHistorySectionProps {
  contactId: string
}

export function WorkHistorySection({ contactId }: WorkHistorySectionProps) {
  const { toast } = useToast()

  const handleAddExperience = () => {
    toast({
      title: 'Add Experience',
      description: 'Work history management functionality coming soon',
    })
  }

  return (
    <div className="p-6">
      <EmptyState
        config={{
          icon: Briefcase,
          title: 'Work History',
          description: 'Track employment history, job titles, and career progression.',
          action: {
            label: 'Add Experience',
            onClick: handleAddExperience,
          },
        }}
        variant="inline"
      />
    </div>
  )
}
