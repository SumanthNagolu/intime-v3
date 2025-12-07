'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Clock, Plus, LucideIcon, List, Home, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEntityNavigationSafe } from '@/lib/navigation/EntityNavigationContext'
import { EntityType, ENTITY_BASE_PATHS } from '@/lib/navigation/entity-navigation.types'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'

// Section configuration for different areas of the app
interface SectionConfig {
  id: string
  title: string
  icon: LucideIcon
  entityType?: EntityType
  basePath: string
  quickActions?: Array<{
    id: string
    label: string
    icon: LucideIcon
    href?: string
    variant?: 'default' | 'outline'
  }>
  navLinks?: Array<{
    id: string
    label: string
    icon: LucideIcon
    href: string
  }>
}

// Section configurations for different areas
export const sectionConfigs: Record<string, SectionConfig> = {
  jobs: {
    id: 'jobs',
    title: 'Jobs',
    icon: List,
    entityType: 'job',
    basePath: '/employee/recruiting/jobs',
    quickActions: [
      { id: 'new-job', label: 'New Job', icon: Plus, href: '/employee/recruiting/jobs/new' },
    ],
    navLinks: [
      { id: 'all-jobs', label: 'All Jobs', icon: List, href: '/employee/recruiting/jobs' },
    ],
  },
  candidates: {
    id: 'candidates',
    title: 'Candidates',
    icon: List,
    entityType: 'candidate',
    basePath: '/employee/recruiting/candidates',
    quickActions: [
      { id: 'new-candidate', label: 'Add Candidate', icon: Plus, href: '/employee/recruiting/candidates/new' },
    ],
    navLinks: [
      { id: 'all-candidates', label: 'All Candidates', icon: List, href: '/employee/recruiting/candidates' },
      { id: 'hotlists', label: 'Hotlists', icon: List, href: '/employee/recruiting/hotlists' },
    ],
  },
  accounts: {
    id: 'accounts',
    title: 'Accounts',
    icon: List,
    entityType: 'account',
    basePath: '/employee/recruiting/accounts',
    quickActions: [
      { id: 'new-account', label: 'New Account', icon: Plus, href: '/employee/recruiting/accounts/new' },
    ],
    navLinks: [
      { id: 'all-accounts', label: 'All Accounts', icon: List, href: '/employee/recruiting/accounts' },
    ],
  },
  leads: {
    id: 'leads',
    title: 'Leads',
    icon: List,
    entityType: 'lead',
    basePath: '/employee/crm/leads',
    quickActions: [
      { id: 'new-lead', label: 'New Lead', icon: Plus, href: '/employee/crm/leads/new' },
    ],
    navLinks: [
      { id: 'all-leads', label: 'All Leads', icon: List, href: '/employee/crm/leads' },
    ],
  },
  deals: {
    id: 'deals',
    title: 'Deals',
    icon: List,
    entityType: 'deal',
    basePath: '/employee/crm/deals',
    quickActions: [
      { id: 'new-deal', label: 'New Deal', icon: Plus, href: '/employee/crm/deals/new' },
    ],
    navLinks: [
      { id: 'all-deals', label: 'All Deals', icon: List, href: '/employee/crm/deals' },
    ],
  },
  placements: {
    id: 'placements',
    title: 'Placements',
    icon: List,
    entityType: 'placement',
    basePath: '/employee/recruiting/placements',
    navLinks: [
      { id: 'all-placements', label: 'All Placements', icon: List, href: '/employee/recruiting/placements' },
    ],
  },
  workspace: {
    id: 'workspace',
    title: 'My Work',
    icon: Home,
    basePath: '/employee/workspace',
    navLinks: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/employee/workspace/dashboard' },
      { id: 'today', label: 'Today', icon: List, href: '/employee/workspace/today' },
      { id: 'reports', label: 'Reports', icon: List, href: '/employee/workspace/reports' },
    ],
  },
}

interface SectionSidebarProps {
  sectionId?: string
  className?: string
}

export function SectionSidebar({ sectionId, className }: SectionSidebarProps) {
  const pathname = usePathname()
  const entityNav = useEntityNavigationSafe()

  // Auto-detect section from pathname if not provided
  const detectedSectionId = sectionId || detectSectionFromPath(pathname)
  const section = detectedSectionId ? sectionConfigs[detectedSectionId] : null

  // Get recent entities for this section's entity type
  const recentEntities = section?.entityType && entityNav
    ? entityNav.recentEntities[section.entityType] || []
    : []

  if (!section) {
    // Fallback: generic sidebar for unknown sections
    return (
      <aside className={cn('w-64 bg-white border-r border-charcoal-100 flex flex-col flex-shrink-0', className)}>
        <div className="p-4 border-b border-charcoal-100">
          <h2 className="font-heading font-semibold text-charcoal-900">Navigation</h2>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          <p className="text-sm text-charcoal-500">Select a section from the top navigation.</p>
        </nav>
      </aside>
    )
  }

  const SectionIcon = section.icon

  return (
    <aside className={cn('w-64 bg-white border-r border-charcoal-100 flex flex-col flex-shrink-0', className)}>
      {/* Section Header */}
      <div className="p-4 border-b border-charcoal-100">
        <div className="flex items-center gap-2">
          <SectionIcon className="w-5 h-5 text-gold-500" />
          <h2 className="font-heading font-semibold text-charcoal-900">{section.title}</h2>
        </div>
      </div>

      {/* Navigation Links */}
      {section.navLinks && section.navLinks.length > 0 && (
        <nav className="p-4 border-b border-charcoal-100">
          <h3 className="text-xs font-medium text-charcoal-500 uppercase tracking-wide mb-3">
            Navigation
          </h3>
          <ul className="space-y-1">
            {section.navLinks.map((link) => {
              const LinkIcon = link.icon
              const isActive = pathname === link.href
              return (
                <li key={link.id}>
                  <Link
                    href={link.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm',
                      isActive
                        ? 'bg-gold-50 text-gold-700 font-medium'
                        : 'text-charcoal-600 hover:bg-charcoal-50'
                    )}
                  >
                    <LinkIcon className="w-4 h-4" />
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      )}

      {/* Recent Entities */}
      {section.entityType && recentEntities.length > 0 && (
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-xs font-medium text-charcoal-500 uppercase tracking-wide mb-3">
            Recent
          </h3>
          <ul className="space-y-1">
            {recentEntities.slice(0, 5).map((entity) => (
              <li key={entity.id}>
                <Link
                  href={`${ENTITY_BASE_PATHS[section.entityType!]}/${entity.id}`}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-charcoal-700 hover:bg-charcoal-50 transition-colors"
                >
                  <Clock className="w-4 h-4 text-charcoal-400" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{entity.name}</p>
                    {entity.subtitle && (
                      <p className="text-xs text-charcoal-500 truncate">{entity.subtitle}</p>
                    )}
                  </div>
                  <span className="text-xs text-charcoal-400 flex-shrink-0">
                    {formatDistanceToNow(new Date(entity.viewedAt), { addSuffix: false })}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* No recent entities - show empty state */}
      {section.entityType && recentEntities.length === 0 && (
        <div className="flex-1 p-4">
          <h3 className="text-xs font-medium text-charcoal-500 uppercase tracking-wide mb-3">
            Recent
          </h3>
          <p className="text-sm text-charcoal-400 px-3">
            No recently viewed {section.title.toLowerCase()}.
          </p>
        </div>
      )}

      {/* Quick Actions */}
      {section.quickActions && section.quickActions.length > 0 && (
        <div className="p-4 border-t border-charcoal-100">
          <h3 className="text-xs font-medium text-charcoal-500 uppercase tracking-wide mb-3">
            Quick Actions
          </h3>
          <div className="space-y-2">
            {section.quickActions.map((action) => {
              const ActionIcon = action.icon
              return (
                <Button
                  key={action.id}
                  variant={action.variant || 'outline'}
                  size="sm"
                  className="w-full justify-start gap-2"
                  asChild
                >
                  <Link href={action.href || '#'}>
                    <ActionIcon className="w-4 h-4" />
                    {action.label}
                  </Link>
                </Button>
              )
            })}
          </div>
        </div>
      )}
    </aside>
  )
}

// Helper to detect section from current path
function detectSectionFromPath(pathname: string): string | null {
  if (pathname.includes('/recruiting/jobs')) return 'jobs'
  if (pathname.includes('/recruiting/candidates')) return 'candidates'
  if (pathname.includes('/recruiting/accounts')) return 'accounts'
  if (pathname.includes('/recruiting/placements')) return 'placements'
  if (pathname.includes('/crm/leads')) return 'leads'
  if (pathname.includes('/crm/deals')) return 'deals'
  if (pathname.includes('/workspace')) return 'workspace'
  return null
}
