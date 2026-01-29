import { redirect } from 'next/navigation'
import { getTeamWorkspace } from '@/server/actions/team-workspace'
import { TeamWorkspaceClient } from './TeamWorkspaceClient'

export const dynamic = 'force-dynamic'

/**
 * Team Workspace Page
 * Shows the same sections as My Space (Dashboard, Activities, Submissions, Jobs, etc.)
 * but with team-wide data and "Assigned To" columns with filtering options.
 */
export default async function TeamWorkspacePage() {
  const data = await getTeamWorkspace()

  if (!data) {
    redirect('/login')
  }

  return <TeamWorkspaceClient data={data} />
}
