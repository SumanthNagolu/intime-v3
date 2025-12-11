'use client'

import {
  AlertTriangle,
  KeyRound,
  ClipboardCheck,
  Siren,
} from 'lucide-react'
import { HorizontalTabsLayout, type TabItem } from '@/components/layouts/HorizontalTabsLayout'

const emergencyTabs: TabItem[] = [
  {
    label: 'Overview',
    href: '/employee/admin/emergency',
    icon: AlertTriangle,
  },
  {
    label: 'Break Glass',
    href: '/employee/admin/emergency/break-glass',
    icon: KeyRound,
  },
  {
    label: 'Drills',
    href: '/employee/admin/emergency/drills',
    icon: ClipboardCheck,
  },
  {
    label: 'Incidents',
    href: '/employee/admin/emergency/incidents',
    icon: Siren,
  },
]

export default function EmergencyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <HorizontalTabsLayout
      title="Emergency"
      description="Emergency access controls, drills, and incident management"
      tabs={emergencyTabs}
    >
      {children}
    </HorizontalTabsLayout>
  )
}




