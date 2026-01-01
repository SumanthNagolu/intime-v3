import { getServerCaller } from '@/server/trpc/server-caller'
import { UserFormClient } from '@/components/admin/users/UserFormClient'

/**
 * New User Page (Server Component)
 *
 * Fetches all reference data needed for user creation in a single
 * database call, then passes it to the client component.
 *
 * Performance: ONE database call per page load.
 */
export default async function NewUserPage() {
  // ONE database call - fetches all reference data for user creation
  const caller = await getServerCaller()
  const referenceData = await caller.reference.getUserCreateWizardData()

  return (
    <UserFormClient
      mode="create"
      initialData={{
        roles: referenceData.roles ?? [],
        pods: referenceData.pods ?? [],
        groups: referenceData.groups ?? [],
        managers: referenceData.managers ?? [],
      }}
    />
  )
}
