"use client"

import { usePathname } from 'next/navigation'
import { SidebarLayout } from '@/components/layouts/SidebarLayout'
import { CrossPillarLeadProvider } from '@/components/crm/leads'
import { recruiterNavSections } from '@/lib/navigation/recruiterNavConfig'
import type { ReactNode } from 'react'

export default function RecruitingLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  
  // Detect if we are in a wizard/creation flow that provides its own layout
  // We check for /new at the end, or specific wizard routes
  const isWizardPage = pathname?.endsWith('/new') || 
                       pathname?.includes('/onboarding/') ||
                       pathname?.includes('/intake/')

  return (
    <CrossPillarLeadProvider>
      {isWizardPage ? (
        // For wizard pages, we skip the parent SidebarLayout because the page
        // provides its own specialized SidebarLayout (e.g. WizardWithSidebar)
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
