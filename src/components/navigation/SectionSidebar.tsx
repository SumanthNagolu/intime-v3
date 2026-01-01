'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Clock, LucideIcon, List, Home, LayoutDashboard, Calendar, Activity, Building2, Briefcase, Send, FileBarChart, GraduationCap, BookOpen, Users, Award, Contact } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEntityNavigationSafe } from '@/lib/navigation/EntityNavigationContext'
import { EntityType, ENTITY_BASE_PATHS } from '@/lib/navigation/entity-navigation.types'
import { formatDistanceToNow } from 'date-fns'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useSidebarUIContextSafe } from '@/lib/contexts/SidebarUIContext'

// Section configuration for different areas of the app
interface SectionConfig {
  id: string
  title: string
  icon: LucideIcon
  entityType?: EntityType
  basePath: string
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
  campaigns: {
    id: 'campaigns',
    title: 'Campaigns',
    icon: List,
    entityType: 'campaign',
    basePath: '/employee/crm/campaigns',
    navLinks: [
      { id: 'all-campaigns', label: 'All Campaigns', icon: List, href: '/employee/crm/campaigns' },
    ],
  },
  contacts: {
    id: 'contacts',
    title: 'Contacts',
    icon: Contact,
    entityType: 'contact',
    basePath: '/employee/contacts',
    navLinks: [
      { id: 'all-contacts', label: 'All Contacts', icon: List, href: '/employee/contacts' },
    ],
  },
  workspace: {
    id: 'workspace',
    title: 'My Work',
    icon: Home,
    basePath: '/employee/workspace',
    navLinks: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/employee/workspace/dashboard' },
      { id: 'today', label: 'Today', icon: Calendar, href: '/employee/workspace/today' },
      { id: 'activities', label: 'My Activities', icon: Activity, href: '/employee/workspace/desktop?tab=activities' },
      { id: 'my-accounts', label: 'My Accounts', icon: Building2, href: '/employee/recruiting/accounts?owner=me' },
      { id: 'my-jobs', label: 'My Jobs', icon: Briefcase, href: '/employee/recruiting/jobs?assigned=me' },
      { id: 'my-submissions', label: 'My Submissions', icon: Send, href: '/employee/recruiting/submissions?owner=me' },
      { id: 'reports', label: 'Reports', icon: FileBarChart, href: '/employee/workspace/reports' },
    ],
  },
  academy: {
    id: 'academy',
    title: 'Academy Admin',
    icon: GraduationCap,
    basePath: '/employee/academy',
    navLinks: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/employee/academy/dashboard' },
      { id: 'courses', label: 'Courses', icon: BookOpen, href: '/employee/academy/courses' },
      { id: 'students', label: 'Students', icon: Users, href: '/employee/academy/students' },
      { id: 'cohorts', label: 'Cohorts', icon: GraduationCap, href: '/employee/academy/cohorts' },
      { id: 'certificates', label: 'Certificates', icon: Award, href: '/employee/academy/certificates' },
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
  
  // Get collapsed state from context
  const sidebarContext = useSidebarUIContextSafe()
  const isCollapsed = sidebarContext?.isCollapsed ?? false

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
      <TooltipProvider delayDuration={100}>
        <div className={cn('flex flex-col flex-1 overflow-hidden', className)}>
          <div className="p-4 border-b border-charcoal-100">
            {!isCollapsed && <h2 className="font-heading font-semibold text-charcoal-900">Navigation</h2>}
          </div>
          <nav className="flex-1 overflow-y-auto p-4">
            {!isCollapsed && <p className="text-sm text-charcoal-500">Select a section from the top navigation.</p>}
          </nav>
        </div>
      </TooltipProvider>
    )
  }

  const SectionIcon = section.icon

  return (
    <TooltipProvider delayDuration={100}>
      <div className={cn('flex flex-col flex-1 overflow-hidden', className)}>
        {/* Section Header - with top padding for toggle button */}
        <div className="pt-12 px-4 pb-4 border-b border-charcoal-100">
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-center">
                  <SectionIcon className="w-5 h-5 text-gold-500" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-charcoal-900 text-white">
                <p>{section.title}</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <div className="flex items-center gap-2">
              <SectionIcon className="w-5 h-5 text-gold-500" />
              <h2 className="font-heading font-semibold text-charcoal-900">{section.title}</h2>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        {section.navLinks && section.navLinks.length > 0 && (
          <nav className="p-4 border-b border-charcoal-100">
            {!isCollapsed && (
              <h3 className="text-xs font-medium text-charcoal-500 uppercase tracking-wide mb-3">
                Navigation
              </h3>
            )}
            <ul className="space-y-1">
              {section.navLinks.map((link) => {
                const LinkIcon = link.icon
                const isActive = pathname === link.href
                
                if (isCollapsed) {
                  return (
                    <li key={link.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            href={link.href}
                            className={cn(
                              'flex items-center justify-center w-10 h-10 mx-auto rounded-lg transition-all duration-200',
                              isActive
                                ? 'bg-gold-50 text-gold-700'
                                : 'text-charcoal-600 hover:bg-charcoal-50'
                            )}
                          >
                            <LinkIcon className="w-4 h-4" />
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-charcoal-900 text-white">
                          <p>{link.label}</p>
                        </TooltipContent>
                      </Tooltip>
                    </li>
                  )
                }
                
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
            {!isCollapsed && (
              <h3 className="text-xs font-medium text-charcoal-500 uppercase tracking-wide mb-3">
                Recent
              </h3>
            )}
            <ul className="space-y-1">
              {recentEntities.slice(0, 10).map((entity) => {
                if (isCollapsed) {
                  // Show initials in collapsed mode
                  const initials = entity.name
                    .split(' ')
                    .map(word => word[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase()
                  
                  return (
                    <li key={entity.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            href={`${ENTITY_BASE_PATHS[section.entityType!]}/${entity.id}`}
                            className="flex items-center justify-center w-10 h-10 mx-auto rounded-lg text-xs font-semibold text-charcoal-700 bg-charcoal-100 hover:bg-charcoal-200 transition-colors"
                          >
                            {initials}
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-charcoal-900 text-white">
                          <div>
                            <p className="font-medium">{entity.name}</p>
                            {entity.subtitle && <p className="text-xs text-charcoal-300">{entity.subtitle}</p>}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </li>
                  )
                }
                
                return (
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
                )
              })}
            </ul>
          </div>
        )}

        {/* No recent entities - show empty state */}
        {section.entityType && recentEntities.length === 0 && !isCollapsed && (
          <div className="flex-1 p-4">
            <h3 className="text-xs font-medium text-charcoal-500 uppercase tracking-wide mb-3">
              Recent
            </h3>
            <p className="text-sm text-charcoal-400 px-3">
              No recently viewed {section.title.toLowerCase()}.
            </p>
          </div>
        )}
      </div>
    </TooltipProvider>
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
  if (pathname.includes('/crm/campaigns')) return 'campaigns'
  if (pathname.includes('/employee/contacts')) return 'contacts'
  if (pathname.includes('/workspace')) return 'workspace'
  if (pathname.includes('/employee/academy')) return 'academy'
  return null
}
