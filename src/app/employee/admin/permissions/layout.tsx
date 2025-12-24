'use client'

import {
  Grid3X3,
  GitCompare,
  Settings2,
  FlaskConical,
} from 'lucide-react'
import { HorizontalTabsLayout, type TabItem } from '@/components/layouts/HorizontalTabsLayout'

const permissionsTabs: TabItem[] = [
  {
    label: 'Matrix',
    href: '/employee/admin/permissions',
    icon: Grid3X3,
  },
  {
    label: 'Compare',
    href: '/employee/admin/permissions/compare',
    icon: GitCompare,
  },
  {
    label: 'Overrides',
    href: '/employee/admin/permissions/overrides',
    icon: Settings2,
  },
  {
    label: 'Test',
    href: '/employee/admin/permissions/test',
    icon: FlaskConical,
  },
]

export default function PermissionsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <HorizontalTabsLayout
      title="Permissions"
      description="Configure role-based access controls and permission overrides"
      tabs={permissionsTabs}
    >
      {children}
    </HorizontalTabsLayout>
  )
}







