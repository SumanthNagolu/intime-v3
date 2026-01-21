"use client"

import { usePathname } from 'next/navigation'
import { SidebarLayout } from '@/components/layouts/SidebarLayout'
import { CrossPillarLeadProvider } from '@/components/crm/leads'
import { recruiterNavSections } from '@/lib/navigation/recruiterNavConfig'
import type { ReactNode } from 'react'

export default function CRMLayout({
  children,
}: {
  children: ReactNode
}) {
  const pathname = usePathname()

  // Detect if we are in a wizard/creation flow that provides its own layout
  // We check for /new at the end, which indicates a creation wizard
  const isWizardPage = pathname?.endsWith('/new')

  return (
    <CrossPillarLeadProvider>
      {isWizardPage ? (
        // For wizard pages, we skip the parent SidebarLayout because the page
        // provides its own specialized layout (e.g. WizardLayout)
        children
      ) : (
        // For standard pages, we provide the standard navigation sidebar
        <SidebarLayout sections={recruiterNavSections}>
          {children}
        </SidebarLayout>
      )}
    </CrossPillarLeadProvider>
  )
}
