'use client'

import { GitBranch } from 'lucide-react'
import { EmptyState } from '@/components/pcf/shared/EmptyState'
import { useToast } from '@/components/ui/use-toast'

interface SubsidiariesSectionProps {
  contactId: string
  contact: {
    id: string
    company_name?: string | null
    parent_company_id?: string | null
    parent_company?: {
      id: string
      company_name?: string | null
    } | null
  }
}

export function SubsidiariesSection({ contactId, contact }: SubsidiariesSectionProps) {
  const { toast } = useToast()

  const handleLinkCompany = () => {
    toast({
      title: 'Link Company',
      description: 'Corporate hierarchy management coming soon',
    })
  }

  return (
    <div className="p-6">
      <EmptyState
        config={{
          icon: GitBranch,
          title: 'Corporate Structure',
          description: 'Link parent and subsidiary companies to show corporate relationships.',
          action: {
            label: 'Link Company',
            onClick: handleLinkCompany,
          },
        }}
        variant="inline"
      />
    </div>
  )
}
