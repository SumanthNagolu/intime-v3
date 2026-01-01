'use client'

import { useParams } from 'next/navigation'
import { SubmissionWorkspace } from '@/components/workspaces/submission/SubmissionWorkspace'

export default function SubmissionDetailPage() {
  const params = useParams()
  const submissionId = params.id as string

  return <SubmissionWorkspace submissionId={submissionId} />
}
