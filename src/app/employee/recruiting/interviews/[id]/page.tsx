'use client'

import { useParams } from 'next/navigation'
import { EntityDetailView } from '@/components/pcf/detail-view/EntityDetailView'
import { interviewsDetailConfig, Interview } from '@/configs/entities/interviews.config'

export default function InterviewDetailPage() {
  const params = useParams()
  const interviewId = params.id as string

  return (
    <EntityDetailView<Interview>
      config={interviewsDetailConfig}
      entityId={interviewId}
    />
  )
}



