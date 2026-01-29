'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  Clock,
  LucideIcon,
  List,
  Home,
  LayoutDashboard,
  Calendar,
  Activity,
  Building2,
  Briefcase,
  Send,
  FileBarChart,
  GraduationCap,
  BookOpen,
  Users,
  Award,
  Contact,
  Plus,
  User,
  Star,
  Filter,
  Inbox,
  TrendingUp,
  Target,
  Flame,
  UserCheck,
  FileText,
  FilePen,
  CalendarClock,
  Pause,
  CheckCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEntityNavigationSafe } from '@/lib/navigation/EntityNavigationContext'
import { EntityType, ENTITY_BASE_PATHS } from '@/lib/navigation/entity-navigation.types'
import { formatDistanceToNow, isToday, isYesterday, subDays, isAfter } from 'date-fns'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useSidebarUIContextSafe } from '@/lib/contexts/SidebarUIContext'
import { Button } from '@/components/ui/button'
import { WorkspaceToggle } from './WorkspaceToggle'

// Enhanced section configuration with views and quick actions
interface ViewConfig {
  id: string
  label: string
  icon: LucideIcon
  href: string
  badge?: number | 'new'
}

interface SectionConfig {
  id: string
  title: string
  icon: LucideIcon
  entityType?: EntityType
  basePath: string
  createPath?: string
  createLabel?: string
  views: ViewConfig[]
  // Legacy navLinks for non-entity sections
  navLinks?: Array<{
    id: string
    label: string
    icon: LucideIcon
    href: string
  }>
}

// Enhanced section configurations with smart views
export const sectionConfigs: Record<string, SectionConfig> = {
  jobs: {
    id: 'jobs',
    title: 'Jobs',
    icon: Briefcase,
    entityType: 'job',
    basePath: '/employee/recruiting/jobs',
    createPath: '/employee/recruiting/jobs/new',
    createLabel: 'New Job',
    views: [
      { id: 'all', label: 'All Jobs', icon: List, href: '/employee/recruiting/jobs' },
      { id: 'my-jobs', label: 'My Jobs', icon: User, href: '/employee/recruiting/jobs?assigned=me' },
      { id: 'open', label: 'Open', icon: Inbox, href: '/employee/recruiting/jobs?status=open' },
      { id: 'urgent', label: 'Urgent', icon: Flame, href: '/employee/recruiting/jobs?priority=urgent' },
    ],
  },
  candidates: {
    id: 'candidates',
    title: 'Candidates',
    icon: Users,
    entityType: 'candidate',
    basePath: '/employee/recruiting/candidates',
    createPath: '/employee/recruiting/candidates/new',
    createLabel: 'New Candidate',
    views: [
      { id: 'all', label: 'All Candidates', icon: List, href: '/employee/recruiting/candidates' },
      { id: 'my-candidates', label: 'My Candidates', icon: User, href: '/employee/recruiting/candidates?owner=me' },
      { id: 'drafts', label: 'Drafts', icon: FileText, href: '/employee/recruiting/candidates?tab=drafts' },
      { id: 'available', label: 'Available', icon: UserCheck, href: '/employee/recruiting/candidates?status=available' },
      { id: 'hotlists', label: 'Hotlists', icon: Flame, href: '/employee/recruiting/hotlists' },
    ],
  },
  accounts: {
    id: 'accounts',
    title: 'Accounts',
    icon: Building2,
    entityType: 'account',
    basePath: '/employee/recruiting/accounts',
    createPath: '/employee/recruiting/accounts/new',
    createLabel: 'New Account',
    views: [
      { id: 'all', label: 'All Accounts', icon: List, href: '/employee/recruiting/accounts' },
      { id: 'my-accounts', label: 'My Accounts', icon: User, href: '/employee/recruiting/accounts?owner=me' },
      { id: 'team-accounts', label: 'My Team Accounts', icon: Users, href: '/employee/recruiting/accounts?team=me' },
    ],
  },
  leads: {
    id: 'leads',
    title: 'Leads',
    icon: TrendingUp,
    entityType: 'lead',
    basePath: '/employee/crm/leads',
    createPath: '/employee/crm/leads/new',
    createLabel: 'New Lead',
    views: [
      { id: 'all', label: 'All Leads', icon: List, href: '/employee/crm/leads' },
      { id: 'my-leads', label: 'My Leads', icon: User, href: '/employee/crm/leads?owner=me' },
      { id: 'new', label: 'New', icon: Inbox, href: '/employee/crm/leads?status=new' },
      { id: 'hot', label: 'Hot Leads', icon: Flame, href: '/employee/crm/leads?temperature=hot' },
    ],
  },
  deals: {
    id: 'deals',
    title: 'Deals',
    icon: FileText,
    entityType: 'deal',
    basePath: '/employee/crm/deals',
    createPath: '/employee/crm/deals/new',
    createLabel: 'New Deal',
    views: [
      { id: 'all', label: 'All Deals', icon: List, href: '/employee/crm/deals' },
      { id: 'my-deals', label: 'My Deals', icon: User, href: '/employee/crm/deals?owner=me' },
      { id: 'open', label: 'Open', icon: Inbox, href: '/employee/crm/deals?status=open' },
      { id: 'won', label: 'Won', icon: Star, href: '/employee/crm/deals?status=won' },
    ],
  },
  placements: {
    id: 'placements',
    title: 'Placements',
    icon: UserCheck,
    entityType: 'placement',
    basePath: '/employee/recruiting/placements',
    createPath: '/employee/recruiting/placements/new',
    createLabel: 'New Placement',
    views: [
      { id: 'all', label: 'All Placements', icon: List, href: '/employee/recruiting/placements' },
      { id: 'my-placements', label: 'My Placements', icon: User, href: '/employee/recruiting/placements?owner=me' },
      { id: 'active', label: 'Active', icon: Activity, href: '/employee/recruiting/placements?status=active' },
    ],
  },
  campaigns: {
    id: 'campaigns',
    title: 'Campaigns',
    icon: Send,
    entityType: 'campaign',
    basePath: '/employee/crm/campaigns',
    createPath: '/employee/crm/campaigns/new',
    createLabel: 'New Campaign',
    views: [
      { id: 'all', label: 'All Campaigns', icon: List, href: '/employee/crm/campaigns' },
      { id: 'my-campaigns', label: 'My Campaigns', icon: User, href: '/employee/crm/campaigns?owner=me' },
      { id: 'drafts', label: 'Drafts', icon: FilePen, href: '/employee/crm/campaigns?status=draft' },
      { id: 'scheduled', label: 'Scheduled', icon: CalendarClock, href: '/employee/crm/campaigns?status=scheduled' },
      { id: 'active', label: 'Active', icon: Activity, href: '/employee/crm/campaigns?status=active' },
      { id: 'paused', label: 'Paused', icon: Pause, href: '/employee/crm/campaigns?status=paused' },
      { id: 'completed', label: 'Completed', icon: CheckCircle, href: '/employee/crm/campaigns?status=completed' },
    ],
  },
  contacts: {
    id: 'contacts',
    title: 'Contacts',
    icon: Contact,
    entityType: 'contact',
    basePath: '/employee/contacts',
    createPath: '/employee/contacts/new',
    createLabel: 'New Contact',
    views: [
      { id: 'all', label: 'All Contacts', icon: List, href: '/employee/contacts' },
      { id: 'my-contacts', label: 'My Contacts', icon: User, href: '/employee/contacts?owner=me' },
      { id: 'favorites', label: 'Favorites', icon: Star, href: '/employee/contacts?favorite=true' },
    ],
  },
  workspace: {
    id: 'workspace',
    title: 'My Workspace',
    icon: Home,
    basePath: '/employee/workspace',
    views: [],
    navLinks: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/employee/workspace' },
      { id: 'today', label: 'Today', icon: Clock, href: '/employee/workspace/today' },
      { id: 'activities', label: 'My Activities', icon: Activity, href: '/employee/workspace/activities' },
      { id: 'accounts', label: 'My Accounts', icon: Building2, href: '/employee/workspace/accounts' },
      { id: 'jobs', label: 'My Jobs', icon: Briefcase, href: '/employee/workspace/jobs' },
      { id: 'submissions', label: 'My Submissions', icon: Send, href: '/employee/workspace/submissions' },
      { id: 'reports', label: 'Reports', icon: FileBarChart, href: '/employee/workspace/reports' },
    ],
  },
  team: {
    id: 'team',
    title: 'Team Workspace',
    icon: Users,
    basePath: '/employee/team',
    views: [],
    navLinks: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/employee/team' },
      { id: 'today', label: 'Today', icon: Clock, href: '/employee/team/today' },
      { id: 'activities', label: 'Activities', icon: Activity, href: '/employee/team/activities' },
      { id: 'accounts', label: 'Accounts', icon: Building2, href: '/employee/team/accounts' },
      { id: 'jobs', label: 'Jobs', icon: Briefcase, href: '/employee/team/jobs' },
      { id: 'submissions', label: 'Submissions', icon: Send, href: '/employee/team/submissions' },
      { id: 'reports', label: 'Reports', icon: FileBarChart, href: '/employee/team/reports' },
    ],
  },
  academy: {
    id: 'academy',
    title: 'Academy Admin',
    icon: GraduationCap,
    basePath: '/employee/academy',
    views: [],
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
  const searchParams = useSearchParams()
  const router = useRouter()
  const entityNav = useEntityNavigationSafe()

  // Build current URL with search params for active state comparison
  const currentUrl = searchParams.toString()
    ? `${pathname}?${searchParams.toString()}`
    : pathname

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

  // Group recent entities by time
  const groupedRecent = groupRecentByTime(recentEntities)

  if (!section) {
    return (
      <TooltipProvider delayDuration={100}>
        <div className={cn('flex flex-col flex-1 overflow-hidden', className)}>
          <div className="p-4">
            {!isCollapsed && (
              <p className="text-sm text-charcoal-500">Select a section from the navigation.</p>
            )}
          </div>
        </div>
      </TooltipProvider>
    )
  }

  const SectionIcon = section.icon
  const hasViews = section.views && section.views.length > 0
  const hasNavLinks = section.navLinks && section.navLinks.length > 0

  return (
    <TooltipProvider delayDuration={100}>
      <div className={cn('flex flex-col flex-1 overflow-hidden', className)}>

        {/* Workspace Toggle - Show at top for workspace-related sections */}
        {!isCollapsed && (detectedSectionId === 'workspace' || detectedSectionId === 'team' || detectedSectionId === 'jobs' || detectedSectionId === 'candidates' || detectedSectionId === 'accounts' || detectedSectionId === 'placements' || detectedSectionId === 'leads' || detectedSectionId === 'deals' || detectedSectionId === 'campaigns' || detectedSectionId === 'contacts') && (
          <WorkspaceToggle />
        )}

        {/* Quick Create Button - Most prominent action */}
        {section.createPath && (
          <div className={cn('p-3', isCollapsed ? 'px-2' : 'px-3')}>
            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => router.push(section.createPath!)}
                    size="icon"
                    className="w-10 h-10 mx-auto bg-charcoal-900 hover:bg-gold-600 text-white rounded-lg shadow-sm"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-charcoal-900 text-white">
                  <p>{section.createLabel}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button
                onClick={() => router.push(section.createPath!)}
                className="w-full h-10 bg-charcoal-900 hover:bg-gold-600 text-white rounded-lg shadow-sm font-medium text-sm gap-2"
              >
                <Plus className="w-4 h-4" />
                {section.createLabel}
              </Button>
            )}
          </div>
        )}

        {/* Views Section - Smart filtered views */}
        {hasViews && (
          <nav className={cn('py-2', isCollapsed ? 'px-2' : 'px-3')}>
            {!isCollapsed && (
              <h3 className="text-[10px] font-semibold text-charcoal-400 uppercase tracking-wider mb-2 px-2">
                Views
              </h3>
            )}
            <ul className="space-y-0.5">
              {section.views.map((view) => {
                const ViewIcon = view.icon
                // Compare full URL (with search params) for active state
                const isActive = currentUrl === view.href ||
                  (pathname === section.basePath && !searchParams.toString() && view.id === 'all')

                if (isCollapsed) {
                  return (
                    <li key={view.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            href={view.href}
                            className={cn(
                              'flex items-center justify-center w-10 h-10 mx-auto rounded-lg transition-all duration-200',
                              isActive
                                ? 'bg-gold-100 text-gold-700'
                                : 'text-charcoal-600 hover:bg-charcoal-50'
                            )}
                          >
                            <ViewIcon className="w-4 h-4" />
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-charcoal-900 text-white">
                          <p>{view.label}</p>
                        </TooltipContent>
                      </Tooltip>
                    </li>
                  )
                }

                return (
                  <li key={view.id}>
                    <Link
                      href={view.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm group',
                        isActive
                          ? 'bg-gold-100 text-gold-800 font-medium'
                          : 'text-charcoal-600 hover:bg-charcoal-50 hover:text-charcoal-900'
                      )}
                    >
                      <ViewIcon className={cn(
                        'w-4 h-4 flex-shrink-0',
                        isActive ? 'text-gold-600' : 'text-charcoal-400 group-hover:text-charcoal-600'
                      )} />
                      <span className="flex-1">{view.label}</span>
                      {view.badge && (
                        <span className={cn(
                          'text-xs px-1.5 py-0.5 rounded-full',
                          view.badge === 'new'
                            ? 'bg-gold-100 text-gold-700'
                            : 'bg-charcoal-100 text-charcoal-600'
                        )}>
                          {view.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        )}

        {/* Legacy Navigation Links (for non-entity sections like workspace/academy) */}
        {hasNavLinks && (
          <nav className={cn('py-2', isCollapsed ? 'px-2' : 'px-3')}>
            <ul className="space-y-0.5">
              {section.navLinks!.map((link) => {
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
                                ? 'bg-gold-100 text-gold-700'
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
                        'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm group',
                        isActive
                          ? 'bg-gold-100 text-gold-800 font-medium'
                          : 'text-charcoal-600 hover:bg-charcoal-50 hover:text-charcoal-900'
                      )}
                    >
                      <LinkIcon className={cn(
                        'w-4 h-4 flex-shrink-0',
                        isActive ? 'text-gold-600' : 'text-charcoal-400 group-hover:text-charcoal-600'
                      )} />
                      {link.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        )}

        {/* Divider */}
        {(hasViews || hasNavLinks) && recentEntities.length > 0 && (
          <div className="mx-3 border-t border-charcoal-100" />
        )}

        {/* Recent Entities - Grouped by time */}
        {section.entityType && recentEntities.length > 0 && (
          <div className="flex-1 py-2">
            {!isCollapsed && (
              <h3 className="text-[10px] font-semibold text-charcoal-400 uppercase tracking-wider mb-2 px-5">
                Recent
              </h3>
            )}

            {/* Today */}
            {groupedRecent.today.length > 0 && (
              <RecentGroup
                label="Today"
                entities={groupedRecent.today}
                entityType={section.entityType}
                isCollapsed={isCollapsed}
              />
            )}

            {/* Yesterday */}
            {groupedRecent.yesterday.length > 0 && (
              <RecentGroup
                label="Yesterday"
                entities={groupedRecent.yesterday}
                entityType={section.entityType}
                isCollapsed={isCollapsed}
              />
            )}

            {/* Earlier */}
            {groupedRecent.earlier.length > 0 && (
              <RecentGroup
                label="Earlier"
                entities={groupedRecent.earlier}
                entityType={section.entityType}
                isCollapsed={isCollapsed}
                showTime
              />
            )}
          </div>
        )}

        {/* Empty state for recent */}
        {section.entityType && recentEntities.length === 0 && !isCollapsed && (
          <div className="flex-1 px-5 py-4">
            <h3 className="text-[10px] font-semibold text-charcoal-400 uppercase tracking-wider mb-3">
              Recent
            </h3>
            <p className="text-sm text-charcoal-400">
              No recently viewed {section.title.toLowerCase()}.
            </p>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}

// Component for grouped recent entities
interface RecentGroupProps {
  label: string
  entities: Array<{
    id: string
    name: string
    subtitle?: string
    viewedAt: Date
  }>
  entityType: EntityType
  isCollapsed: boolean
  showTime?: boolean
}

function RecentGroup({ label, entities, entityType, isCollapsed, showTime }: RecentGroupProps) {
  if (isCollapsed) {
    return (
      <ul className="space-y-1 px-2">
        {entities.slice(0, 5).map((entity) => {
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
                    href={`${ENTITY_BASE_PATHS[entityType]}/${entity.id}`}
                    className="flex items-center justify-center w-10 h-10 mx-auto rounded-lg text-xs font-semibold text-charcoal-600 bg-charcoal-50 hover:bg-charcoal-100 transition-colors"
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
        })}
      </ul>
    )
  }

  return (
    <div className="mb-1">
      <h4 className="text-[10px] font-medium text-charcoal-400 uppercase tracking-wide px-5 py-1">
        {label}
      </h4>
      <ul className="px-3">
        {entities.slice(0, 5).map((entity) => (
          <li key={entity.id}>
            <Link
              href={`${ENTITY_BASE_PATHS[entityType]}/${entity.id}`}
              className="flex items-center gap-3 px-2 py-1.5 rounded-md text-sm text-charcoal-700 hover:bg-charcoal-50 transition-colors group"
            >
              <div className="w-6 h-6 rounded bg-charcoal-100 flex items-center justify-center flex-shrink-0 group-hover:bg-charcoal-200 transition-colors">
                <span className="text-[10px] font-semibold text-charcoal-500">
                  {entity.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-charcoal-800 text-[13px]">{entity.name}</p>
                {entity.subtitle && (
                  <p className="text-xs text-charcoal-400 truncate">{entity.subtitle}</p>
                )}
              </div>
              {showTime && (
                <span className="text-[10px] text-charcoal-400 flex-shrink-0">
                  {formatDistanceToNow(entity.viewedAt, { addSuffix: false })}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Group recent entities by time period
function groupRecentByTime(entities: Array<{ id: string; name: string; subtitle?: string; viewedAt: Date }>) {
  const today: typeof entities = []
  const yesterday: typeof entities = []
  const earlier: typeof entities = []

  const now = new Date()
  const sevenDaysAgo = subDays(now, 7)

  for (const entity of entities.slice(0, 15)) {
    const viewedDate = entity.viewedAt

    if (isToday(viewedDate)) {
      today.push(entity)
    } else if (isYesterday(viewedDate)) {
      yesterday.push(entity)
    } else if (isAfter(viewedDate, sevenDaysAgo)) {
      earlier.push(entity)
    }
  }

  return { today, yesterday, earlier }
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
  if (pathname.includes('/employee/team')) return 'team'
  if (pathname.includes('/workspace')) return 'workspace'
  if (pathname.includes('/employee/academy')) return 'academy'
  return null
}
