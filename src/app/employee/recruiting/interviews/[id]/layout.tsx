import { ReactNode } from 'react'
import { notFound, redirect } from 'next/navigation'
import { getServerCaller } from '@/server/trpc/server-caller'
import { EntityContextProvider } from '@/components/layouts/EntityContextProvider'
import { TRPCError } from '@trpc/server'

export const dynamic = 'force-dynamic'

interface InterviewLayoutProps {
  children: ReactNode
  params: Promise<{ id: string }>
}

export default async function InterviewDetailLayout({ children, params }: InterviewLayoutProps) {
  const { id: interviewId } = await params
  const caller = await getServerCaller()

  let interview = null
  try {
    // ONE database call - fetch everything
    interview = await caller.ats.interviews.getFullInterview({ id: interviewId })
  } catch (error) {
    console.error('[InterviewDetailLayout] Error:', error)
    if (error instanceof TRPCError) {
      if (error.code === 'UNAUTHORIZED' || error.code === 'FORBIDDEN') {
        redirect(`/login?redirect=/employee/recruiting/interviews/${interviewId}`)
      }
      if (error.code === 'NOT_FOUND') {
        notFound()
      }
    }
    notFound()
  }

  if (!interview) {
    notFound()
  }

  // Build display names
  const candidate = interview.submission?.candidate
  const job = interview.submission?.job || interview.job
  const account = interview.account

  const candidateName = candidate
    ? `${candidate.first_name} ${candidate.last_name}`.trim()
    : 'Unknown Candidate'
  const interviewType = interview.interview_type?.replace(/_/g, ' ') || 'Interview'
  const jobTitle = job?.title || 'Unknown Job'

  return (
    <EntityContextProvider
      entityType="interview"
      entityId={interviewId}
      entityName={`${candidateName} - ${interviewType}`}
      entitySubtitle={`${jobTitle} @ ${account?.name || 'Unknown Account'}`}
      entityStatus={interview.status}
      initialData={interview}
    >
      {children}
    </EntityContextProvider>
  )
}







