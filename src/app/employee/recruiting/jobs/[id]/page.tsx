'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { EntityDetailView } from '@/components/pcf/detail-view/EntityDetailView'
import { jobsDetailConfig, Job } from '@/configs/entities/jobs.config'
import { UpdateStatusDialog, CloseJobWizard } from '@/components/recruiting/jobs'
import { useEntityData } from '@/components/layouts/EntityContextProvider'
import { trpc } from '@/lib/trpc/client'

// Custom event handler types
declare global {
  interface WindowEventMap {
    openJobDialog: CustomEvent<{ dialogId: string }>
  }
}

export default function JobDetailPage() {
  const params = useParams()
  const jobId = params.id as string

  // ONE DATABASE CALL pattern: Get entity data from context (fetched by layout)
  const entityData = useEntityData<Job>()
  const job = entityData?.data

  // Dialog states
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [showCloseWizard, setShowCloseWizard] = useState(false)

  // Only fetch additional data when dialogs need it (lazy loading)
  const historyQuery = trpc.ats.jobs.getStatusHistory.useQuery(
    { jobId },
    { enabled: showStatusDialog } // Only fetch when dialog is open
  )
  const submissionsQuery = trpc.ats.submissions.list.useQuery(
    { jobId, limit: 100 },
    { enabled: showCloseWizard } // Only fetch when dialog is open
  )

  const submissions = submissionsQuery.data?.items || []

  // Listen for quick action dialog events from the sidebar
  useEffect(() => {
    const handleOpenDialog = (event: CustomEvent<{ dialogId: string }>) => {
      switch (event.detail.dialogId) {
        case 'updateStatus':
          setShowStatusDialog(true)
          break
        case 'closeJob':
          setShowCloseWizard(true)
          break
      }
    }

    window.addEventListener('openJobDialog', handleOpenDialog)
    return () => window.removeEventListener('openJobDialog', handleOpenDialog)
  }, [])

  return (
    <>
      <EntityDetailView<Job>
        config={jobsDetailConfig}
        entityId={jobId}
        entity={job}  // Pass entity from context to skip client query
      />

      {/* Update Status Dialog */}
      {job && (
        <UpdateStatusDialog
          open={showStatusDialog}
          onOpenChange={setShowStatusDialog}
          jobId={jobId}
          currentStatus={job.status}
          jobTitle={job.title}
          positionsFilled={(job as Job).positions_filled || 0}
          positionsCount={(job as Job).positions_available || 1}
          onSuccess={() => {
            historyQuery.refetch()
          }}
        />
      )}

      {/* Close Job Wizard */}
      {job && (
        <CloseJobWizard
          open={showCloseWizard}
          onOpenChange={setShowCloseWizard}
          jobId={jobId}
          jobTitle={job.title}
          currentStatus={job.status}
          positionsFilled={(job as Job).positions_filled || 0}
          positionsCount={(job as Job).positions_available || 1}
          activeSubmissionsCount={submissions.filter(
            (s) => !['placed', 'rejected', 'withdrawn'].includes(s.status)
          ).length}
          onSuccess={() => {
            historyQuery.refetch()
            submissionsQuery.refetch()
          }}
        />
      )}
    </>
  )
}
