import { SidebarLayout } from '@/components/layouts/SidebarLayout'
import type { ReactNode } from 'react'

/**
 * Finance module layout.
 *
 * Uses SidebarLayout which auto-detects the Finance module from the path
 * and renders the appropriate ModuleSidebar with Finance navigation.
 */
export default function FinanceLayout({ children }: { children: ReactNode }) {
  return <SidebarLayout>{children}</SidebarLayout>
}
