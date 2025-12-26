'use client'

import { useParams } from 'next/navigation'
import { EntityDetailView } from '@/components/pcf/detail-view/EntityDetailView'
import { contactsDetailConfig, type Contact } from '@/configs/entities/contacts.config'

export default function RecruitingContactDetailPage() {
  const params = useParams()
  const contactId = params.id as string

  return (
    <EntityDetailView<Contact>
      config={contactsDetailConfig}
      entityId={contactId}
    />
  )
}
