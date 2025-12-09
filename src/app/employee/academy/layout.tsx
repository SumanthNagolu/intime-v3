'use client'

import { SidebarLayout } from '@/components/layouts/SidebarLayout'
import type { ReactNode } from 'react'

export default function AcademyAdminLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarLayout sectionId="academy">
      {children}
    </SidebarLayout>
  )
}
