'use client'

import { ActivitiesSection } from '@/components/pcf/sections/ActivitiesSection'

interface ContactActivitiesSectionProps {
  contactId: string
}

export function ContactActivitiesSection({ contactId }: ContactActivitiesSectionProps) {
  return (
    <div className="p-6">
      <ActivitiesSection
        entityType="contact"
        entityId={contactId}
        showStats={true}
        showInlineForm={true}
      />
    </div>
  )
}
