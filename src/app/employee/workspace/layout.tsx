"use client"

import { SidebarLayout } from '@/components/layouts/SidebarLayout'
import { CrossPillarLeadProvider } from '@/components/crm/leads'
import { mySpaceNavSections } from '@/lib/navigation/workspaceNavConfig'
import type { ReactNode } from 'react'

/**
 * My Workspace Layout
 * Uses unified workspace navigation sections that match Team workspace
 * The only difference is the data filter (my data vs team data)
 */
export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <CrossPillarLeadProvider>
      <SidebarLayout sections={mySpaceNavSections}>
        {children}
      </SidebarLayout>
    </CrossPillarLeadProvider>
  )
}
