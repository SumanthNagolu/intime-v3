"use client"

import { SidebarLayout } from '@/components/layouts/SidebarLayout'
import { CrossPillarLeadProvider } from '@/components/crm/leads'
import { recruiterNavSections } from '@/lib/navigation/recruiterNavConfig'

export default function CRMLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CrossPillarLeadProvider>
      <SidebarLayout sections={recruiterNavSections}>
        {children}
      </SidebarLayout>
    </CrossPillarLeadProvider>
  )
}
