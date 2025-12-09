'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { EntityDetailView } from '@/components/pcf/detail-view/EntityDetailView'
import { accountsDetailConfig, Account } from '@/configs/entities/accounts.config'
import { LogActivityDialog } from '@/components/recruiting/accounts/LogActivityDialog'
import { AddContactDialog } from '@/components/recruiting/accounts/AddContactDialog'
import { CreateMeetingDialog } from '@/components/recruiting/accounts/CreateMeetingDialog'
import { CreateEscalationDialog } from '@/components/recruiting/accounts/CreateEscalationDialog'
import { AddNoteDialog } from '@/components/recruiting/accounts/AddNoteDialog'
import { AddDocumentDialog } from '@/components/recruiting/accounts/AddDocumentDialog'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'

// Custom event handler types
declare global {
  interface WindowEventMap {
    openAccountDialog: CustomEvent<{ dialogId: string; accountId?: string }>
    openEntityDialog: CustomEvent<{ dialogId: string; entityType?: string; entityId?: string }>
  }
}

export default function AccountDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const accountId = params.id as string

  // Dialog states
  const [logActivityOpen, setLogActivityOpen] = useState(false)
  const [addContactOpen, setAddContactOpen] = useState(false)
  const [createMeetingOpen, setCreateMeetingOpen] = useState(false)
  const [createEscalationOpen, setCreateEscalationOpen] = useState(false)
  const [addNoteOpen, setAddNoteOpen] = useState(false)
  const [addDocumentOpen, setAddDocumentOpen] = useState(false)

  const utils = trpc.useUtils()

  // Query for account data (needed for status updates)
  const accountQuery = trpc.crm.accounts.getById.useQuery({ id: accountId })

  // Status mutation
  const updateStatusMutation = trpc.crm.accounts.updateStatus.useMutation({
    onSuccess: () => {
      utils.crm.accounts.getById.invalidate({ id: accountId })
      utils.crm.accounts.list.invalidate()
      toast({ title: 'Status updated successfully' })
    },
    onError: (error) => {
      toast({ title: 'Error updating status', description: error.message, variant: 'error' })
    },
  })

  // Listen for dialog events from sidebar quick actions and PCF components
  useEffect(() => {
    const handleAccountDialog = (event: CustomEvent<{ dialogId: string; accountId?: string }>) => {
      switch (event.detail.dialogId) {
        case 'logActivity':
          setLogActivityOpen(true)
          break
        case 'addContact':
          setAddContactOpen(true)
          break
        case 'createMeeting':
        case 'scheduleMeeting':
          setCreateMeetingOpen(true)
          break
        case 'createEscalation':
          setCreateEscalationOpen(true)
          break
        case 'addNote':
          setAddNoteOpen(true)
          break
        case 'addDocument':
          setAddDocumentOpen(true)
          break
        case 'updateStatus':
          // Handle status update if needed
          break
      }
    }

    const handleEntityDialog = (event: CustomEvent<{ dialogId: string; entityType?: string; entityId?: string }>) => {
      // Handle generic entity dialog events
      if (event.detail.entityType === 'account' && event.detail.entityId === accountId) {
        switch (event.detail.dialogId) {
          case 'addContact':
            setAddContactOpen(true)
            break
          case 'logActivity':
            setLogActivityOpen(true)
            break
        }
      }
    }

    window.addEventListener('openAccountDialog', handleAccountDialog)
    window.addEventListener('openEntityDialog', handleEntityDialog)

    return () => {
      window.removeEventListener('openAccountDialog', handleAccountDialog)
      window.removeEventListener('openEntityDialog', handleEntityDialog)
    }
  }, [accountId])

  return (
    <>
      <EntityDetailView<Account>
        config={accountsDetailConfig}
        entityId={accountId}
      />

      {/* Create/Add Dialogs */}
      <LogActivityDialog
        open={logActivityOpen}
        onOpenChange={setLogActivityOpen}
        accountId={accountId}
      />
      <AddContactDialog
        open={addContactOpen}
        onOpenChange={setAddContactOpen}
        accountId={accountId}
      />
      <CreateMeetingDialog
        open={createMeetingOpen}
        onOpenChange={setCreateMeetingOpen}
        accountId={accountId}
      />
      <CreateEscalationDialog
        open={createEscalationOpen}
        onOpenChange={setCreateEscalationOpen}
        accountId={accountId}
      />
      <AddNoteDialog
        open={addNoteOpen}
        onOpenChange={setAddNoteOpen}
        accountId={accountId}
      />
      <AddDocumentDialog
        open={addDocumentOpen}
        onOpenChange={setAddDocumentOpen}
        accountId={accountId}
      />
    </>
  )
}
