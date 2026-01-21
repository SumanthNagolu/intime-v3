import { ReactNode } from 'react'
import { notFound, redirect } from 'next/navigation'
import { getServerCaller } from '@/server/trpc/server-caller'
import { EntityContextProvider } from '@/components/layouts/EntityContextProvider'
import { JobWorkspaceProvider } from '@/components/workspaces/job/JobWorkspaceProvider'
import { TRPCError } from '@trpc/server'
import type { FullJob } from '@/types/job'

export const dynamic = 'force-dynamic'

interface JobLayoutProps {
  children: ReactNode
  params: Promise<{ id: string }>
}

export default async function JobDetailLayout({ children, params }: JobLayoutProps) {
  const { id: jobId } = await params
  const caller = await getServerCaller()

  // ONE DATABASE CALL: Fetch all job data in parallel
  let job: FullJob | null = null
  try {
    job = await caller.ats.jobs.getFullJob({ id: jobId }) as FullJob
  } catch (error) {
    console.error('[JobDetailLayout] Error:', error)
    // Handle specific error types
    if (error instanceof TRPCError) {
      if (error.code === 'UNAUTHORIZED') {
        // Not logged in - redirect to login
        redirect(`/login?redirect=/employee/recruiting/jobs/${jobId}`)
      }
      if (error.code === 'FORBIDDEN') {
        // No org - redirect to login
        console.error('[JobDetailLayout] FORBIDDEN - no org context')
        redirect(`/login?redirect=/employee/recruiting/jobs/${jobId}`)
      }
      if (error.code === 'NOT_FOUND') {
        notFound()
      }
      // Log other tRPC errors
      console.error('[JobDetailLayout] tRPC Error:', error.code, error.message)
    }
    // For other errors (invalid UUID, etc.), show 404
    notFound()
  }

  if (!job) {
    notFound()
  }

  // Build subtitle from company name
  const companyName = job.company?.name || job.clientCompany?.name

  return (
    <EntityContextProvider
      entityType="job"
      entityId={jobId}
      entityName={job.title}
      entitySubtitle={companyName}
      entityStatus={job.status}
      initialData={job}
    >
      <JobWorkspaceProvider initialData={job}>
        {children}
      </JobWorkspaceProvider>
    </EntityContextProvider>
  )
}
