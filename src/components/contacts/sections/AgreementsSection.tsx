'use client'

import { FileText } from 'lucide-react'
import { EmptyState } from '@/components/pcf/shared/EmptyState'
import { useToast } from '@/components/ui/use-toast'

interface AgreementsSectionProps {
  contactId: string
}

export function AgreementsSection({ contactId }: AgreementsSectionProps) {
  const { toast } = useToast()

  const handleAddAgreement = () => {
    toast({
      title: 'Add Agreement',
      description: 'Agreement management functionality coming soon',
    })
  }

  return (
    <div className="p-6">
      <EmptyState
        config={{
          icon: FileText,
          title: 'Agreements',
          description: 'Manage MSAs, NDAs, SOWs, and other legal agreements.',
          action: {
            label: 'Add Agreement',
            onClick: handleAddAgreement,
          },
        }}
        variant="inline"
      />
    </div>
  )
}
