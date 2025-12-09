'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { EntityDetailView } from '@/components/pcf/detail-view/EntityDetailView'
import { contactsDetailConfig, Contact } from '@/configs/entities/contacts.config'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'

// Custom event handler types
declare global {
  interface WindowEventMap {
    openContactDialog: CustomEvent<{ dialogId: string; contactId?: string }>
  }
}

export default function ContactDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const contactId = params.id as string

  const utils = trpc.useUtils()

  // Query for contact data (can be used for future dialogs)
  const contactQuery = trpc.crm.contacts.getById.useQuery({ id: contactId })
  const contact = contactQuery.data

  // Update status mutation (for mark primary, mark DNC, etc.)
  const updateStatusMutation = trpc.crm.contacts.update.useMutation({
    onSuccess: (_, variables) => {
      const action = (variables as any).status === 'do_not_contact' 
        ? 'marked as Do Not Contact' 
        : 'updated'
      toast({ title: `Contact ${action}` })
      utils.crm.contacts.getById.invalidate({ id: contactId })
      utils.crm.contacts.list.invalidate()
    },
    onError: (error) => {
      toast({ title: 'Failed to update contact', description: error.message, variant: 'error' })
    },
  })

  // Listen for quick action dialog events from the sidebar and PCF components
  useEffect(() => {
    const handleOpenDialog = (event: CustomEvent<{ dialogId: string; contactId?: string }>) => {
      switch (event.detail.dialogId) {
        case 'edit':
          router.push(`/employee/contacts/${contactId}/edit`)
          break
        case 'markPrimary':
          if (contact) {
            updateStatusMutation.mutate({
              id: contactId,
              isPrimary: true,
            } as any)
          }
          break
        case 'markDNC':
          if (contact) {
            updateStatusMutation.mutate({
              id: contactId,
              status: 'do_not_contact',
            } as any)
          }
          break
        case 'logActivity':
          // Activity logging is handled inline in the Activities section
          break
      }
    }

    window.addEventListener('openContactDialog', handleOpenDialog)
    return () => window.removeEventListener('openContactDialog', handleOpenDialog)
  }, [contactId, contact, router, updateStatusMutation])

  return (
    <EntityDetailView<Contact>
      config={contactsDetailConfig}
      entityId={contactId}
    />
  )
}
