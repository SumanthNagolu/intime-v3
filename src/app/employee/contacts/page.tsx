'use client'

import { Suspense } from 'react'
import { EntityListView } from '@/components/pcf/list-view/EntityListView'
import { EntityListViewSkeleton } from '@/components/pcf/shared'
import { contactsListConfig, type Contact } from '@/configs/entities/contacts.config'

function ContactsListContent() {
  return <EntityListView<Contact> config={contactsListConfig} />
}

export default function ContactsPage() {
  return (
    <Suspense fallback={<EntityListViewSkeleton />}>
      <ContactsListContent />
    </Suspense>
  )
}
