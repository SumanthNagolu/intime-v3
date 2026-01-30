import { SidebarLayout } from '@/components/layouts/SidebarLayout'
import type { ReactNode } from 'react'

/**
 * HR module layout.
 *
 * Uses SidebarLayout which auto-detects the HR module from the path
 * and renders the appropriate ModuleSidebar with HR navigation.
 */
export default function HRLayout({ children }: { children: ReactNode }) {
  return <SidebarLayout>{children}</SidebarLayout>
}
