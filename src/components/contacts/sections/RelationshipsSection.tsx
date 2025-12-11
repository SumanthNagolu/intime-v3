'use client'

import { Users } from 'lucide-react'
import { EmptyState } from '@/components/pcf/shared/EmptyState'
import { useToast } from '@/components/ui/use-toast'

interface RelationshipsSectionProps {
  contactId: string
  contactCategory: 'person' | 'company'
}

export function RelationshipsSection({ contactId, contactCategory }: RelationshipsSectionProps) {
  const { toast } = useToast()

  const handleAddRelationship = () => {
    toast({
      title: 'Add Relationship',
      description: 'Relationship management functionality coming soon',
    })
  }

  return (
    <div className="p-6">
      <EmptyState
        config={{
          icon: Users,
          title: 'Relationships',
          description: contactCategory === 'person'
            ? 'Link this person to companies they work with.'
            : 'Link this company to people and other companies.',
          action: {
            label: 'Add Relationship',
            onClick: handleAddRelationship,
          },
        }}
        variant="inline"
      />
    </div>
  )
}
