import { ReactNode } from 'react'
import { notFound, redirect } from 'next/navigation'
import { getServerCaller } from '@/server/trpc/server-caller'
import { EntityContextProvider } from '@/components/layouts/EntityContextProvider'
import { TRPCError } from '@trpc/server'

export const dynamic = 'force-dynamic'

interface SubmissionLayoutProps {
  children: ReactNode
  params: Promise<{ id: string }>
}

export default async function SubmissionDetailLayout({ children, params }: SubmissionLayoutProps) {
  const { id: submissionId } = await params
  const caller = await getServerCaller()

  let submission = null
  try {
    // ONE database call - fetch everything
    submission = await caller.ats.submissions.getFullSubmission({ id: submissionId })
  } catch (error) {
    console.error('[SubmissionDetailLayout] Error:', error)
    if (error instanceof TRPCError) {
      if (error.code === 'UNAUTHORIZED') {
        redirect(`/login?redirect=/employee/recruiting/submissions/${submissionId}`)
      }
      if (error.code === 'FORBIDDEN') {
        redirect(`/login?redirect=/employee/recruiting/submissions/${submissionId}`)
      }
      if (error.code === 'NOT_FOUND') {
        notFound()
      }
    }
    notFound()
  }

  if (!submission) {
    notFound()
  }

  // Build display names
  const candidate = submission.candidate
  const job = submission.job
  const account = submission.account

  const candidateName = candidate
    ? `${candidate.first_name} ${candidate.last_name}`.trim()
    : 'Unknown Candidate'
  const jobTitle = job?.title || 'Unknown Job'
  const accountName = account?.name

  return (
    <EntityContextProvider
      entityType="submission"
      entityId={submissionId}
      entityName={`${candidateName} → ${jobTitle}`}
      entitySubtitle={accountName}
      entityStatus={submission.status}
      initialData={submission}
    >
      {children}
    </EntityContextProvider>
  )
}
