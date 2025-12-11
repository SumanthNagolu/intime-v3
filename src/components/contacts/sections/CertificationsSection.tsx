'use client'

import { Award } from 'lucide-react'
import { EmptyState } from '@/components/pcf/shared/EmptyState'
import { useToast } from '@/components/ui/use-toast'

interface CertificationsSectionProps {
  contactId: string
}

export function CertificationsSection({ contactId }: CertificationsSectionProps) {
  const { toast } = useToast()

  // Certifications router will be implemented in a future phase
  // For now, show a placeholder
  const handleAdd = () => {
    toast({
      title: 'Add certification',
      description: 'Certification management functionality coming soon',
    })
  }

  return (
    <div className="p-6">
      <EmptyState
        config={{
          icon: Award,
          title: 'Certifications',
          description: 'Track professional certifications and credentials for this contact.',
          action: {
            label: 'Add Certification',
            onClick: handleAdd,
          },
        }}
        variant="inline"
      />
    </div>
  )
}
