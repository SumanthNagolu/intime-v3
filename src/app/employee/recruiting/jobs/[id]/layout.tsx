import { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { getServerCaller } from '@/server/trpc/server-caller'
import { EntityContextProvider } from '@/components/layouts/EntityContextProvider'

export const dynamic = 'force-dynamic'

interface JobLayoutProps {
  children: ReactNode
  params: Promise<{ id: string }>
}

export default async function JobDetailLayout({ children, params }: JobLayoutProps) {
  const { id: jobId } = await params
  const caller = await getServerCaller()

  // Fetch job data on server
  const job = await caller.ats.jobs.getById({ id: jobId }).catch(() => null)

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
