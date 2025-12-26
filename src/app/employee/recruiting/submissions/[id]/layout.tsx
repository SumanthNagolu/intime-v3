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

  // Fetch submission data on server
  let submission = null
  try {
    submission = await caller.ats.submissions.getById({ id: submissionId })
  } catch (error) {
    console.error('[SubmissionDetailLayout] Error:', error)
    // Handle specific error types
    if (error instanceof TRPCError) {
      if (error.code === 'UNAUTHORIZED') {
        redirect(`/login?redirect=/employee/recruiting/submissions/${submissionId}`)
      }
      if (error.code === 'FORBIDDEN') {
        console.error('[SubmissionDetailLayout] FORBIDDEN - no org context')
        redirect(`/login?redirect=/employee/recruiting/submissions/${submissionId}`)
      }
      if (error.code === 'NOT_FOUND') {
        notFound()
      }
      console.error('[SubmissionDetailLayout] tRPC Error:', error.code, error.message)
    }
    notFound()
  }

  if (!submission) {
    notFound()
  }

  // Build title from candidate and job names
  const candidate = submission.candidate as { first_name: string; last_name: string } | null
  const job = submission.job as { title: string; account?: { name: string } } | null
  
  const candidateName = candidate 
    ? `${candidate.first_name} ${candidate.last_name}`.trim()
    : 'Unknown Candidate'
  const jobTitle = job?.title || 'Unknown Job'
  const accountName = job?.account?.name

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
