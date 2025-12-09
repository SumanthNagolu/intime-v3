'use client'

import { useParams } from 'next/navigation'
import { EntityDetailView } from '@/components/pcf/detail-view/EntityDetailView'
import { submissionsDetailConfig, Submission } from '@/configs/entities/submissions.config'

export default function SubmissionDetailPage() {
  const params = useParams()
  const submissionId = params.id as string

  return (
    <EntityDetailView<Submission>
      config={submissionsDetailConfig}
      entityId={submissionId}
    />
  )
}
