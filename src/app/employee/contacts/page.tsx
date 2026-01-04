'use client'

import { Suspense, useState, useEffect } from 'react'
import { EntityListView } from '@/components/pcf/list-view/EntityListView'
import { EntityListViewSkeleton } from '@/components/pcf/shared'
import { contactsListConfig, type Contact } from '@/configs/entities/contacts.config'
import { CreateContactDialog } from '@/components/contacts/CreateContactDialog'

function ContactsListContent() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  // Listen for openContactDialog custom events
  useEffect(() => {
    const handleOpenDialog = (event: CustomEvent<{ dialogId: string }>) => {
      if (event.detail.dialogId === 'create') {
        setCreateDialogOpen(true)
      }
    }

    window.addEventListener('openContactDialog', handleOpenDialog as EventListener)
    return () => {
      window.removeEventListener('openContactDialog', handleOpenDialog as EventListener)
    }
  }, [])

  return (
    <>
      <EntityListView<Contact> config={contactsListConfig} />
      <CreateContactDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </>
  )
}

export default function ContactsPage() {
  return (
    <Suspense fallback={<EntityListViewSkeleton />}>
      <ContactsListContent />
    </Suspense>
  )
}
