'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AccountWorkspace } from '@/components/workspaces/AccountWorkspace'
import { CreateActivityDialog } from '@/components/activities/CreateActivityDialog'
import { AddContactDialog } from '@/components/recruiting/accounts/AddContactDialog'
import { LinkContactToAccountDialog } from '@/components/workspaces/account/LinkContactToAccountDialog'
import { CreateMeetingDialog } from '@/components/recruiting/accounts/CreateMeetingDialog'
import { CreateEscalationDialog } from '@/components/recruiting/accounts/CreateEscalationDialog'
import { AddNoteDialog } from '@/components/recruiting/accounts/AddNoteDialog'
import { AddDocumentDialog } from '@/components/recruiting/accounts/AddDocumentDialog'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'
import { useAccountWorkspace } from '@/components/workspaces/account/AccountWorkspaceProvider'

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
  const { refreshData } = useAccountWorkspace()

  // Dialog states
  const [createActivityOpen, setCreateActivityOpen] = useState(false)
  const [addContactOpen, setAddContactOpen] = useState(false)
  const [linkContactOpen, setLinkContactOpen] = useState(false)
  const [createMeetingOpen, setCreateMeetingOpen] = useState(false)
  const [createEscalationOpen, setCreateEscalationOpen] = useState(false)
  const [addNoteOpen, setAddNoteOpen] = useState(false)
  const [addDocumentOpen, setAddDocumentOpen] = useState(false)

  const utils = trpc.useUtils()

  // Status mutation
  const updateStatusMutation = trpc.crm.accounts.updateStatus.useMutation({
    onSuccess: () => {
      utils.crm.accounts.list.invalidate()
      refreshData()
      toast({ title: 'Status updated successfully' })
    },
    onError: (error) => {
      toast({ title: 'Error updating status', description: error.message, variant: 'error' })
    },
  })

  // Listen for dialog events from sidebar quick actions
  useEffect(() => {
    const handleAccountDialog = (event: CustomEvent<{ dialogId: string; accountId?: string }>) => {
      switch (event.detail.dialogId) {
        case 'createActivity':
          setCreateActivityOpen(true)
          break
        case 'addContact':
          setAddContactOpen(true)
          break
        case 'linkContact':
          setLinkContactOpen(true)
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
        case 'createJob':
          // Navigate to job intake with account pre-selected
          router.push(`/employee/recruiting/jobs/intake?accountId=${accountId}`)
          break
        case 'updateStatus':
          // Handle status update if needed
          break
      }
    }

    const handleEntityDialog = (event: CustomEvent<{ dialogId: string; entityType?: string; entityId?: string }>) => {
      if (event.detail.entityType === 'account' && event.detail.entityId === accountId) {
        switch (event.detail.dialogId) {
          case 'addContact':
            setAddContactOpen(true)
            break
          case 'linkContact':
            setLinkContactOpen(true)
            break
          case 'createActivity':
            setCreateActivityOpen(true)
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
  }, [accountId, router])

  // Refresh data after dialog closes (onOpenChange will be called with false)
  const handleDialogChange = (open: boolean, setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    setter(open)
    if (!open) {
      // Refresh data when dialog closes
      refreshData()
    }
  }

  return (
    <>
      {/* Guidewire-style Account Workspace */}
      <AccountWorkspace />

      {/* Create/Add Dialogs */}
      <CreateActivityDialog
        open={createActivityOpen}
        onOpenChange={(open) => handleDialogChange(open, setCreateActivityOpen)}
        entityType="account"
        entityId={accountId}
      />
      <AddContactDialog
        open={addContactOpen}
        onOpenChange={(open) => handleDialogChange(open, setAddContactOpen)}
        accountId={accountId}
      />
      <LinkContactToAccountDialog
        open={linkContactOpen}
        onOpenChange={(open) => handleDialogChange(open, setLinkContactOpen)}
        accountId={accountId}
      />
      <CreateMeetingDialog
        open={createMeetingOpen}
        onOpenChange={(open) => handleDialogChange(open, setCreateMeetingOpen)}
        accountId={accountId}
      />
      <CreateEscalationDialog
        open={createEscalationOpen}
        onOpenChange={(open) => handleDialogChange(open, setCreateEscalationOpen)}
        accountId={accountId}
      />
      <AddNoteDialog
        open={addNoteOpen}
        onOpenChange={(open) => handleDialogChange(open, setAddNoteOpen)}
        accountId={accountId}
      />
      <AddDocumentDialog
        open={addDocumentOpen}
        onOpenChange={(open) => handleDialogChange(open, setAddDocumentOpen)}
        accountId={accountId}
      />
    </>
  )
}
