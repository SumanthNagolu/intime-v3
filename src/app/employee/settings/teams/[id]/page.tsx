'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { TeamWorkspace } from '@/components/workspaces/TeamWorkspace'
import { AddNoteDialog } from '@/components/recruiting/accounts/AddNoteDialog'
import { CreateActivityDialog } from '@/components/activities/CreateActivityDialog'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'
import { useTeamWorkspace } from '@/components/workspaces/team/TeamWorkspaceProvider'

// Custom event handler types
declare global {
  interface WindowEventMap {
    openTeamDialog: CustomEvent<{ dialogId: string; teamId?: string }>
    openEntityDialog: CustomEvent<{ dialogId: string; entityType?: string; entityId?: string }>
  }
}

export default function TeamDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const teamId = params.id as string
  const { refreshData } = useTeamWorkspace()

  // Dialog states
  const [addNoteOpen, setAddNoteOpen] = useState(false)
  const [createActivityOpen, setCreateActivityOpen] = useState(false)

  const utils = trpc.useUtils()

  // Archive mutation (soft delete)
  const archiveMutation = trpc.groups.update.useMutation({
    onSuccess: () => {
      utils.groups.list.invalidate()
      utils.groups.getById.invalidate({ id: teamId })
      refreshData()
      toast({ title: 'Team archived successfully' })
    },
    onError: (error: { message: string }) => {
      toast({ title: 'Error archiving team', description: error.message, variant: 'error' })
    },
  })

  // Listen for dialog events from sidebar quick actions
  useEffect(() => {
    const handleTeamDialog = (event: CustomEvent<{ dialogId: string; teamId?: string }>) => {
      switch (event.detail.dialogId) {
        case 'addNote':
          setAddNoteOpen(true)
          break
        case 'addTeamMember':
          // Navigate to member management or open member dialog
          router.push(`/employee/settings/teams/${teamId}?section=members`)
          break
        case 'removeTeamMember':
          // Navigate to member management
          router.push(`/employee/settings/teams/${teamId}?section=members`)
          break
        case 'reassignWork':
          // Navigate to workload section
          router.push(`/employee/settings/teams/${teamId}?section=workload`)
          break
        case 'archiveTeam':
          // Archive the team
          if (confirm('Are you sure you want to archive this team?')) {
            archiveMutation.mutate({ id: teamId, isActive: false })
          }
          break
      }
    }

    const handleEntityDialog = (event: CustomEvent<{ dialogId: string; entityType?: string; entityId?: string }>) => {
      if (event.detail.entityType === 'team' && event.detail.entityId === teamId) {
        switch (event.detail.dialogId) {
          case 'addNote':
            setAddNoteOpen(true)
            break
          case 'createActivity':
            setCreateActivityOpen(true)
            break
        }
      }
    }

    window.addEventListener('openTeamDialog', handleTeamDialog)
    window.addEventListener('openEntityDialog', handleEntityDialog)

    return () => {
      window.removeEventListener('openTeamDialog', handleTeamDialog)
      window.removeEventListener('openEntityDialog', handleEntityDialog)
    }
  }, [teamId, router, archiveMutation])

  // Refresh data after dialog closes
  const handleDialogChange = (open: boolean, setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    setter(open)
    if (!open) {
      // Refresh data when dialog closes
      refreshData()
    }
  }

  return (
    <>
      {/* Team Workspace */}
      <TeamWorkspace />

      {/* Dialogs */}
      <AddNoteDialog
        open={addNoteOpen}
        onOpenChange={(open) => handleDialogChange(open, setAddNoteOpen)}
        accountId={teamId}
      />
      <CreateActivityDialog
        open={createActivityOpen}
        onOpenChange={(open) => handleDialogChange(open, setCreateActivityOpen)}
        entityType="team"
        entityId={teamId}
      />
    </>
  )
}
