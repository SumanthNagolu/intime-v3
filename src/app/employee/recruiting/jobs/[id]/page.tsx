'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { EntityDetailView } from '@/components/pcf/detail-view/EntityDetailView'
import { jobsDetailConfig, Job } from '@/configs/entities/jobs.config'
import { UpdateStatusDialog, CloseJobWizard } from '@/components/recruiting/jobs'
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

  // Dialog states
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [showCloseWizard, setShowCloseWizard] = useState(false)

  // Queries for dialog data
  const jobQuery = trpc.ats.jobs.getById.useQuery({ id: jobId })
  const historyQuery = trpc.ats.jobs.getStatusHistory.useQuery({ jobId })
  const submissionsQuery = trpc.ats.submissions.list.useQuery({ jobId, limit: 100 })

  const job = jobQuery.data
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
      />

      {/* Update Status Dialog */}
      {job && (
        <UpdateStatusDialog
          open={showStatusDialog}
          onOpenChange={setShowStatusDialog}
          jobId={jobId}
          currentStatus={job.status}
          jobTitle={job.title}
          positionsFilled={(job as any).positions_filled || 0}
          positionsCount={(job as any).positions_count || 1}
          onSuccess={() => {
            jobQuery.refetch()
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
          positionsFilled={(job as any).positions_filled || 0}
          positionsCount={(job as any).positions_count || 1}
          activeSubmissionsCount={submissions.filter(
            (s) => !['placed', 'rejected', 'withdrawn'].includes(s.status)
          ).length}
          onSuccess={() => {
            jobQuery.refetch()
            historyQuery.refetch()
            submissionsQuery.refetch()
          }}
        />
      )}
    </>
  )
}
