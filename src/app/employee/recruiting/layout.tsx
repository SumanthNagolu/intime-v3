"use client"

import { SidebarLayout } from '@/components/layouts/SidebarLayout'
import { CrossPillarLeadProvider } from '@/components/crm/leads'
import { recruiterNavSections } from '@/lib/navigation/recruiterNavConfig'
import type { ReactNode } from 'react'

export default function RecruitingLayout({ children }: { children: ReactNode }) {
  return (
    <CrossPillarLeadProvider>
      <SidebarLayout sections={recruiterNavSections}>
        {children}
      </SidebarLayout>
    </CrossPillarLeadProvider>
  )
}
