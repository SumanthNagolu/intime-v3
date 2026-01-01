"use client"

import { SidebarLayout } from '@/components/layouts/SidebarLayout'
import type { ReactNode } from 'react'

export default function TeamLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarLayout hideSidebar>
      {children}
    </SidebarLayout>
  )
}



