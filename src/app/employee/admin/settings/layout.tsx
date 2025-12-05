'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SettingsNavItem {
  label: string
  href: string
  icon: React.ElementType
  description?: string
}

interface SettingsNavSection {
  title: string
  items: SettingsNavItem[]
}

const settingsNavSections: SettingsNavSection[] = [
  {
    title: 'Organization',
    items: [
      {
        label: 'General',
        href: '/employee/admin/settings/organization',
        icon: Building2,
        description: 'Organization name, contact info',
      },
      {
        label: 'Branding',
        href: '/employee/admin/settings/branding',
        icon: Palette,
        description: 'Logo, colors, login page',
      },
      {
        label: 'Localization',
        href: '/employee/admin/settings/localization',
        icon: Globe,
        description: 'Timezone, date format, currency',
      },
      {
        label: 'Business Rules',
        href: '/employee/admin/settings/business',
        icon: Briefcase,
        description: 'Approval thresholds, defaults',
      },
      {
        label: 'Compliance',
        href: '/employee/admin/settings/compliance',
        icon: ShieldCheck,
        description: 'Data retention, GDPR',
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
        description: 'Default timezone, formats',
      },
      {
        label: 'Security',
        href: '/employee/admin/settings/security',
        icon: Lock,
        description: 'Password policy, session, 2FA',
      },
      {
        label: 'Email',
        href: '/employee/admin/settings/email',
        icon: Mail,
        description: 'From address, bounce handling',
      },
      {
        label: 'Files & Storage',
        href: '/employee/admin/settings/files',
        icon: HardDrive,
        description: 'File limits, allowed types',
      },
      {
        label: 'API',
        href: '/employee/admin/settings/api',
        icon: Plug,
        description: 'API access, rate limits',
      },
    ],
  },
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-[calc(100vh-80px)]">
      {/* Settings sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-charcoal-100 bg-white hidden md:block">
        <div className="p-4">
          <h2 className="font-heading text-lg font-semibold text-charcoal-900 tracking-wide uppercase">
            Settings
          </h2>
        </div>

        <nav className="px-2 pb-4 space-y-6">
          {settingsNavSections.map((section) => (
            <div key={section.title}>
              <h3 className="px-3 py-2 text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href
                  const Icon = item.icon

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                          isActive
                            ? 'bg-hublot-900 text-white'
                            : 'text-charcoal-600 hover:bg-charcoal-50 hover:text-charcoal-900'
                        )}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.label}</p>
                          {item.description && !isActive && (
                            <p className="text-xs text-charcoal-400 truncate mt-0.5">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 bg-cream">
        {children}
      </main>
    </div>
  )
}
