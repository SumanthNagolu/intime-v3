'use client'

import { FolderOpen } from 'lucide-react'
import { EmptyState } from '@/components/pcf/shared/EmptyState'
import { useToast } from '@/components/ui/use-toast'

interface ContactDocumentsSectionProps {
  contactId: string
}

export function ContactDocumentsSection({ contactId }: ContactDocumentsSectionProps) {
  const { toast } = useToast()

  // Documents functionality will be implemented with a dedicated documents router
  // For now, show a placeholder that indicates the feature is available
  const handleUpload = () => {
    toast({
      title: 'Document upload',
      description: 'Document upload functionality coming soon',
    })
  }

  return (
    <div className="p-6">
      <EmptyState
        config={{
          icon: FolderOpen,
          title: 'Documents',
          description: 'Upload and manage documents for this contact. Supports resumes, contracts, certifications, and more.',
          action: {
            label: 'Upload Document',
            onClick: handleUpload,
          },
        }}
        variant="inline"
      />
    </div>
  )
}
