import { ReactNode } from 'react'
import { notFound, redirect } from 'next/navigation'
import { getServerCaller } from '@/server/trpc/server-caller'
import { EntityContextProvider } from '@/components/layouts/EntityContextProvider'
import { TRPCError } from '@trpc/server'

export const dynamic = 'force-dynamic'

interface JobLayoutProps {
  children: ReactNode
  params: Promise<{ id: string }>
}

export default async function JobDetailLayout({ children, params }: JobLayoutProps) {
  const { id: jobId } = await params
  const caller = await getServerCaller()

  // Fetch job data on server
  let job = null
  try {
    job = await caller.ats.jobs.getById({ id: jobId })
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

  const accountName = job.account
    ? (job.account as { name: string }).name
    : undefined

  return (
    <EntityContextProvider
      entityType="job"
      entityId={jobId}
      entityName={job.title}
      entitySubtitle={accountName}
      entityStatus={job.status}
      initialData={job}
    >
      {children}
    </EntityContextProvider>
  )
}
