'use client'

import {
  FileText,
  Scale,
} from 'lucide-react'
import { HorizontalTabsLayout, type TabItem } from '@/components/layouts/HorizontalTabsLayout'

const auditTabs: TabItem[] = [
  {
    label: 'Logs',
    href: '/employee/admin/audit',
    icon: FileText,
  },
  {
    label: 'Rules',
    href: '/employee/admin/audit/rules',
    icon: Scale,
  },
]

export default function AuditLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <HorizontalTabsLayout
      title="Audit"
      description="Review system activity and configure audit rules"
      tabs={auditTabs}
    >
      {children}
    </HorizontalTabsLayout>
  )
}




