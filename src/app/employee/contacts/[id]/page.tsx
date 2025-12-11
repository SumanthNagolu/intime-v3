'use client'

import { useParams } from 'next/navigation'
import { ContactWorkspace } from '@/components/contacts/ContactWorkspace'

export default function ContactDetailPage() {
  const params = useParams()
  const contactId = params.id as string

  return (
    <ContactWorkspace contactId={contactId} />
  )
}
