import { getServerCaller } from '@/server/trpc/server-caller'
import { CreateJobClient } from './CreateJobClient'

/**
 * Create Job Page (Server Component)
 *
 * Fetches all reference data needed for the job creation wizard in a single
 * database call, then passes it to the client component.
 *
 * Performance: ONE database call per page load.
 */
export default async function CreateJobPage() {
  // ONE database call - fetches all reference data for job creation
  const caller = await getServerCaller()
  const referenceData = await caller.reference.getJobWizardData()

  return (
    <CreateJobClient
      initialData={{
        accounts: referenceData.accounts ?? [],
      }}
    />
  )
}
