import { SidebarLayout } from '@/components/layouts/SidebarLayout'
import type { ReactNode } from 'react'

/**
 * Operations module layout (merged HR + Finance).
 *
 * Uses SidebarLayout which auto-detects the Operations module from the path
 * and renders the appropriate ModuleSidebar with Operations navigation.
 */
export default function OperationsLayout({ children }: { children: ReactNode }) {
  return <SidebarLayout>{children}</SidebarLayout>
}
