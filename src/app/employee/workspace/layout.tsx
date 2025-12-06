"use client"

import { SidebarLayout } from '@/components/layouts/SidebarLayout'
import { recruiterNavSections } from '@/lib/navigation/recruiterNavConfig'
import type { ReactNode } from 'react'

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarLayout
      sections={recruiterNavSections}
    >
      {children}
    </SidebarLayout>
  )
}
