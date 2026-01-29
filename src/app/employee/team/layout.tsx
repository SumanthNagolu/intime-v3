'use client'

import { SidebarLayout } from '@/components/layouts/SidebarLayout'
import { CrossPillarLeadProvider } from '@/components/crm/leads'
import { teamNavSections } from '@/lib/navigation/workspaceNavConfig'
import type { ReactNode } from 'react'

/**
 * Team Workspace Layout
 * Shows the same sections as My Space but with team-wide data:
 * - Tables include "Assigned To" column
 * - Data includes all team members
 * - Filter options to narrow by team member
 */
export default function TeamLayout({ children }: { children: ReactNode }) {
  return (
    <CrossPillarLeadProvider>
      <SidebarLayout sections={teamNavSections}>
        {children}
      </SidebarLayout>
    </CrossPillarLeadProvider>
  )
}
