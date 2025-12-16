import { getServerCaller } from '@/server/trpc/server-caller'
import { PodFormClient } from '@/components/admin/pods/PodFormClient'

/**
 * New Pod Page (Server Component)
 *
 * Fetches all reference data needed for pod creation in a single
 * database call, then passes it to the client component.
 *
 * Performance: ONE database call per page load.
 */
export default async function NewPodPage() {
  // ONE database call - fetches all reference data for pod creation
  const caller = await getServerCaller()
  const referenceData = await caller.reference.getPodCreateWizardData()

  return (
    <PodFormClient
      mode="create"
      initialData={{
        regions: referenceData.regions ?? [],
        users: referenceData.users ?? [],
      }}
    />
  )
}
