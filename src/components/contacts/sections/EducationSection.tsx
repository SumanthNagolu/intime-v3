'use client'

import { GraduationCap } from 'lucide-react'
import { EmptyState } from '@/components/pcf/shared/EmptyState'
import { useToast } from '@/components/ui/use-toast'

interface EducationSectionProps {
  contactId: string
}

export function EducationSection({ contactId }: EducationSectionProps) {
  const { toast } = useToast()

  const handleAddEducation = () => {
    toast({
      title: 'Add Education',
      description: 'Education management functionality coming soon',
    })
  }

  return (
    <div className="p-6">
      <EmptyState
        config={{
          icon: GraduationCap,
          title: 'Education',
          description: 'Track degrees, certifications, and academic achievements.',
          action: {
            label: 'Add Education',
            onClick: handleAddEducation,
          },
        }}
        variant="inline"
      />
    </div>
  )
}
