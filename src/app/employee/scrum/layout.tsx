'use client'

import { SidebarLayout } from '@/components/layouts/SidebarLayout'
import { TeamSpaceSidebar } from '@/components/team-space'
import { TeamSpaceProvider } from '@/components/team-space'
import { trpc } from '@/lib/trpc/client'
import type { ReactNode } from 'react'

export default function ScrumLayout({ children }: { children: ReactNode }) {
  // Fetch active sprint for sidebar
  const { data: activeSprint } = trpc.sprints.getActive.useQuery(undefined, {
    refetchOnWindowFocus: false,
  })

  return (
    <SidebarLayout hideSidebar>
      <TeamSpaceProvider>
        <div className="flex h-full">
          <TeamSpaceSidebar
            teamName="My Team"
            teamMemberCount={5}
            activeSprint={activeSprint ? {
              id: activeSprint.id,
              name: activeSprint.name,
              status: activeSprint.status,
            } : undefined}
            basePath="/employee/scrum"
          />
          <div className="flex-1 overflow-auto bg-cream">
            {children}
          </div>
        </div>
      </TeamSpaceProvider>
    </SidebarLayout>
  )
}
