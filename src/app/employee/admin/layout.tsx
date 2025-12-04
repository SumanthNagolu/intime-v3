import { SidebarLayout } from '@/components/layouts/SidebarLayout'
import { adminNavSections } from '@/lib/navigation/adminNavConfig'
import type { ReactNode } from 'react'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarLayout
      sections={adminNavSections}
      title="Admin Portal"
    >
      {children}
    </SidebarLayout>
  )
}
