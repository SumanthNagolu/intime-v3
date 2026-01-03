'use client'

import { useParams } from 'next/navigation'
import { EntityDetailView } from '@/components/pcf/detail-view/EntityDetailView'
import { interviewsDetailConfig, Interview } from '@/configs/entities/interviews.config'
import { useEntityData } from '@/components/layouts/EntityContextProvider'
import type { FullInterview } from '@/types/interview'
import { InterviewContextHeader } from '@/components/workspaces/interview'

export default function InterviewDetailPage() {
  const params = useParams()
  const interviewId = params.id as string

  // ONE database call pattern: Get data from server-side context
  // Data was fetched in layout.tsx and passed to EntityContextProvider
  const entityData = useEntityData<FullInterview>()
  const interview = entityData?.data

  return (
    <div className="flex flex-col h-full">
      {/* Context Header Bar - shows candidate, job, account context */}
      {interview && (
        <InterviewContextHeader
          interview={interview}
          onQuickAction={(action) => {
            window.dispatchEvent(
              new CustomEvent('openInterviewDialog', {
                detail: { dialogId: action, interviewId: interview.id },
              })
            )
          }}
        />
      )}

      {/* Main Detail View - passes entity to skip client query */}
      <div className="flex-1 overflow-auto">
        <EntityDetailView<Interview>
          config={interviewsDetailConfig}
          entityId={interviewId}
          entity={interview as Interview | undefined}
        />
      </div>
    </div>
  )
}












