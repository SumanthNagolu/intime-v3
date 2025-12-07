'use client'

import {
  Building2,
  Palette,
  Globe,
  Briefcase,
  ShieldCheck,
  Settings,
  Lock,
  Mail,
  HardDrive,
  Plug,
  Clock,
  Calendar,
  Sliders,
  Phone,
} from 'lucide-react'
import { HorizontalTabsLayout, type TabGroup } from '@/components/layouts/HorizontalTabsLayout'

const settingsTabGroups: TabGroup[] = [
  {
    title: 'Organization',
    items: [
      {
        label: 'General',
        href: '/employee/admin/settings/organization',
        icon: Building2,
      },
      {
        label: 'Branding',
        href: '/employee/admin/settings/branding',
        icon: Palette,
      },
      {
        label: 'Localization',
        href: '/employee/admin/settings/localization',
        icon: Globe,
      },
      {
        label: 'Business Rules',
        href: '/employee/admin/settings/business',
        icon: Briefcase,
      },
      {
        label: 'Compliance',
        href: '/employee/admin/settings/compliance',
        icon: ShieldCheck,
      },
      {
        label: 'Hours',
        href: '/employee/admin/settings/hours',
        icon: Clock,
      },
      {
        label: 'Fiscal Year',
        href: '/employee/admin/settings/fiscal',
        icon: Calendar,
      },
      {
        label: 'Contact',
        href: '/employee/admin/settings/contact',
        icon: Phone,
      },
    ],
  },
  {
    title: 'System',
    items: [
      {
        label: 'General',
        href: '/employee/admin/settings/system',
        icon: Settings,
      },
      {
        label: 'Security',
        href: '/employee/admin/settings/security',
        icon: Lock,
      },
      {
        label: 'Email',
        href: '/employee/admin/settings/email',
        icon: Mail,
      },
      {
        label: 'Files & Storage',
        href: '/employee/admin/settings/files',
        icon: HardDrive,
      },
      {
        label: 'API',
        href: '/employee/admin/settings/api',
        icon: Plug,
      },
      {
        label: 'Defaults',
        href: '/employee/admin/settings/defaults',
        icon: Sliders,
      },
    ],
  },
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <HorizontalTabsLayout
      title="Settings"
      description="Manage organization and system configuration"
      groups={settingsTabGroups}
    >
      {children}
    </HorizontalTabsLayout>
  )
}
