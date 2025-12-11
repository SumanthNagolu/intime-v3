'use client'

import { Users } from 'lucide-react'
import { EmptyState } from '@/components/pcf/shared/EmptyState'

interface CompanyContactsSectionProps {
  contactId: string // This is the company contact ID
}

export function CompanyContactsSection({ contactId }: CompanyContactsSectionProps) {
  // The listByCompany procedure will be added in a future phase
  // For now, show a placeholder that indicates the feature is available

  const handleAddContact = () => {
    window.location.href = `/employee/contacts/new?company=${contactId}`
  }

  return (
    <div className="p-6">
      <EmptyState
        config={{
          icon: Users,
          title: 'Company Contacts',
          description: 'View and manage people who work at this company.',
          action: {
            label: 'Add Contact',
            onClick: handleAddContact,
          },
        }}
        variant="inline"
      />
    </div>
  )
}
