import { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { getServerCaller } from '@/server/trpc/server-caller'
import { EntityContextProvider } from '@/components/layouts/EntityContextProvider'

export const dynamic = 'force-dynamic'

interface ContactLayoutProps {
  children: ReactNode
  params: Promise<{ id: string }>
}

export default async function ContactDetailLayout({ children, params }: ContactLayoutProps) {
  const { id: contactId } = await params
  const caller = await getServerCaller()

  // Fetch contact data on server - Using unified contacts router
  const contact = await caller.unifiedContacts.getById({ id: contactId }).catch(() => null)

  if (!contact) {
    notFound()
  }

  const contactName = `${contact.first_name} ${contact.last_name}`
  const accountName = contact.account
    ? (contact.account as { name: string }).name
    : undefined

  return (
    <EntityContextProvider
      entityType="contact"
      entityId={contactId}
      entityName={contactName}
      entitySubtitle={accountName}
      entityStatus={contact.is_primary ? 'primary' : 'active'}
      initialData={contact}
    >
      {children}
    </EntityContextProvider>
  )
}
