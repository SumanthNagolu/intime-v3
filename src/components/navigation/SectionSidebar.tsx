'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Plus, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEntityNavigationSafe } from '@/lib/navigation/EntityNavigationContext'
import { EntityType, ENTITY_BASE_PATHS } from '@/lib/navigation/entity-navigation.types'
import { listViewSidebarConfigs, sectionConfigs } from '@/lib/navigation/list-view-configs'
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

// Re-export for backwards compatibility
export { listViewSidebarConfigs, sectionConfigs }

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
  const config = detectedSectionId ? listViewSidebarConfigs[detectedSectionId] : null

  // Collapsible status section state (persisted to sessionStorage)
  const [isStatusOpen, setIsStatusOpen] = useState(true)

  useEffect(() => {
    if (config?.statusSection) {
      const stored = sessionStorage.getItem(`sidebar-status-${config.id}`)
      if (stored !== null) {
        setIsStatusOpen(stored === 'true')
      } else {
        setIsStatusOpen(config.statusSection.defaultOpen ?? true)
      }
    }
  }, [config?.id, config?.statusSection])

  const handleStatusToggle = (open: boolean) => {
    setIsStatusOpen(open)
    if (config) {
      sessionStorage.setItem(`sidebar-status-${config.id}`, String(open))
    }
  }

  // Get recent entities for this section's entity type
  const recentEntities = config?.entityType && entityNav
    ? entityNav.recentEntities[config.entityType] || []
    : []

  // Group recent entities by time
  const groupedRecent = groupRecentByTime(recentEntities)

  if (!config) {
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

  const hasViews = config.views && config.views.length > 0
  const hasNavLinks = config.navLinks && config.navLinks.length > 0
  const hasStatusSection = config.statusSection && config.statusSection.items.length > 0

  return (
    <TooltipProvider delayDuration={100}>
      <div className={cn('flex flex-col flex-1 overflow-hidden', className)}>

        {/* 1. Workspace Toggle */}
        {!isCollapsed && config.showWorkspaceToggle && (
          <WorkspaceToggle />
        )}

        {/* 2. Quick Create Button */}
        {config.createPath && (
          <div className={cn('p-3', isCollapsed ? 'px-2' : 'px-3')}>
            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => router.push(config.createPath!)}
                    size="icon"
                    className="w-10 h-10 mx-auto bg-charcoal-900 hover:bg-gold-600 text-white rounded-lg shadow-sm"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-charcoal-900 text-white">
                  <p>{config.createLabel}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button
                onClick={() => router.push(config.createPath!)}
                className="w-full h-10 bg-charcoal-900 hover:bg-gold-600 text-white rounded-lg shadow-sm font-medium text-sm gap-2"
              >
                <Plus className="w-4 h-4" />
                {config.createLabel}
              </Button>
            )}
          </div>
        )}

        {/* 3. VIEWS Section (always visible, max 3 items) */}
        {hasViews && (
          <nav className={cn('py-2', isCollapsed ? 'px-2' : 'px-3')}>
            {!isCollapsed && (
              <h3 className="text-[10px] font-semibold text-charcoal-400 uppercase tracking-wider mb-2 px-2">
                Views
              </h3>
            )}
            <ul className="space-y-0.5">
              {config.views.map((view) => {
                const ViewIcon = view.icon
                const isActive = currentUrl === view.href ||
                  (pathname === config.basePath && !searchParams.toString() && view.id === 'all')

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

        {/* 4. STATUS/STAGE Section (collapsible) */}
        {hasStatusSection && !isCollapsed && (
          <Collapsible open={isStatusOpen} onOpenChange={handleStatusToggle}>
            <CollapsibleTrigger className="flex items-center gap-2 w-full px-5 py-2 text-left transition-all duration-200 hover:bg-charcoal-50/50">
              <ChevronRight className={cn(
                'w-3 h-3 text-charcoal-400 transition-transform duration-200',
                isStatusOpen && 'rotate-90'
              )} />
              <span className="text-[10px] font-semibold text-charcoal-400 uppercase tracking-wider">
                {config.statusSection!.label}
              </span>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ul className="px-3 pb-2 space-y-0.5">
                {config.statusSection!.items.map((item) => {
                  const ItemIcon = item.icon
                  const isActive = currentUrl === item.href

                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm group',
                          isActive
                            ? 'bg-gold-100 text-gold-800 font-medium'
                            : 'text-charcoal-600 hover:bg-charcoal-50 hover:text-charcoal-900'
                        )}
                      >
                        <ItemIcon className={cn(
                          'w-4 h-4 flex-shrink-0',
                          isActive ? 'text-gold-600' : 'text-charcoal-400 group-hover:text-charcoal-600'
                        )} />
                        <span className="flex-1">{item.label}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="text-xs px-1.5 py-0.5 rounded-full bg-charcoal-100 text-charcoal-600">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Collapsed status icons */}
        {hasStatusSection && isCollapsed && (
          <nav className="py-2 px-2">
            <ul className="space-y-0.5">
              {config.statusSection!.items.slice(0, 3).map((item) => {
                const ItemIcon = item.icon
                const isActive = currentUrl === item.href

                return (
                  <li key={item.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            'flex items-center justify-center w-10 h-10 mx-auto rounded-lg transition-all duration-200',
                            isActive
                              ? 'bg-gold-100 text-gold-700'
                              : 'text-charcoal-600 hover:bg-charcoal-50'
                          )}
                        >
                          <ItemIcon className="w-4 h-4" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="bg-charcoal-900 text-white">
                        <p>{item.label}</p>
                      </TooltipContent>
                    </Tooltip>
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
              {config.navLinks!.map((link) => {
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

        {/* 5. Divider */}
        {(hasViews || hasNavLinks || hasStatusSection) && recentEntities.length > 0 && (
          <div className="mx-3 border-t border-charcoal-100" />
        )}

        {/* 6. RECENT Section (grouped by time) */}
        {config.entityType && recentEntities.length > 0 && (
          <div className="flex-1 py-2 overflow-y-auto">
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
                entityType={config.entityType}
                isCollapsed={isCollapsed}
              />
            )}

            {/* Yesterday */}
            {groupedRecent.yesterday.length > 0 && (
              <RecentGroup
                label="Yesterday"
                entities={groupedRecent.yesterday}
                entityType={config.entityType}
                isCollapsed={isCollapsed}
              />
            )}

            {/* Earlier */}
            {groupedRecent.earlier.length > 0 && (
              <RecentGroup
                label="Earlier"
                entities={groupedRecent.earlier}
                entityType={config.entityType}
                isCollapsed={isCollapsed}
                showTime
              />
            )}
          </div>
        )}

        {/* Empty state for recent */}
        {config.entityType && recentEntities.length === 0 && !isCollapsed && (
          <div className="flex-1 px-5 py-4">
            <h3 className="text-[10px] font-semibold text-charcoal-400 uppercase tracking-wider mb-3">
              Recent
            </h3>
            <p className="text-sm text-charcoal-400">
              No recently viewed {config.title.toLowerCase()}.
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
