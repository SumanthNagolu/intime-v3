import { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { EntityContextProvider } from '@/components/layouts/EntityContextProvider'
import { TeamWorkspaceProvider } from '@/components/workspaces/team/TeamWorkspaceProvider'
import { getFullTeam } from '@/server/actions/teams'

export const dynamic = 'force-dynamic'

interface TeamLayoutProps {
  children: ReactNode
  params: Promise<{ id: string }>
}

export default async function TeamDetailLayout({ children, params }: TeamLayoutProps) {
  const { id: teamId } = await params

  // ONE DATABASE CALL: Fetch all team data in parallel
  const data = await getFullTeam(teamId)

  if (!data) {
    notFound()
  }

  const { team } = data

  // Build subtitle with group type
  const subtitle = team.groupType
    ? team.groupType.replace(/_/g, ' ')
    : undefined

  return (
    <EntityContextProvider
      entityType="team"
      entityId={teamId}
      entityName={team.name}
      entitySubtitle={subtitle}
      entityStatus={team.isActive ? 'active' : 'inactive'}
      initialData={team}
    >
      <TeamWorkspaceProvider initialData={data}>
        {children}
      </TeamWorkspaceProvider>
    </EntityContextProvider>
  )
}
