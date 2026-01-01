import { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { getFullContact } from '@/server/actions/contacts'
import { ContactWorkspaceProvider } from '@/components/workspaces/contact/ContactWorkspaceProvider'
import { EntityContextProvider } from '@/components/layouts/EntityContextProvider'

export const dynamic = 'force-dynamic'

interface ContactLayoutProps {
  children: ReactNode
  params: Promise<{ id: string }>
}

/**
 * Contact Detail Layout
 *
 * Key patterns:
 * - ONE DATABASE CALL via getFullContact server action
 * - Data passed to ContactWorkspaceProvider for child components
 * - EntityContextProvider for sidebar navigation integration
 */
export default async function ContactDetailLayout({ children, params }: ContactLayoutProps) {
  const { id: contactId } = await params

  // ONE DATABASE CALL - fetches ALL data for the workspace
  const data = await getFullContact(contactId)

  if (!data) {
    notFound()
  }

  const contactName = data.contact.fullName
  const accountName = data.contact.company?.name

  return (
    <EntityContextProvider
      entityType="contact"
      entityId={contactId}
      entityName={contactName}
      entitySubtitle={accountName}
      entityStatus={data.contact.status}
      initialData={data}
    >
      <ContactWorkspaceProvider initialData={data}>
        {children}
      </ContactWorkspaceProvider>
    </EntityContextProvider>
  )
}
