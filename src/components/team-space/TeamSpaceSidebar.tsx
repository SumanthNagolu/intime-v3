'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import {
  LayoutGrid,
  ListTodo,
  Rocket,
  Target,
  History,
  TrendingUp,
  BarChart3,
  Settings,
  Plus,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { WorkspaceToggle } from '@/components/navigation/WorkspaceToggle'

interface TeamSpaceSidebarProps {
  teamName: string
  teamMemberCount: number
  activeSprint?: {
    id: string
    name: string
    status: string
  }
  onCreateSprint?: () => void
}

interface SidebarItem {
  id: string
  label: string
  icon: React.ElementType
  href: string
  badge?: number | string
}

const SIDEBAR_SECTIONS: { title?: string; items: SidebarItem[] }[] = [
  {
    items: [
      { id: 'board', label: 'Sprint Board', icon: LayoutGrid, href: '/employee/team' },
      { id: 'backlog', label: 'Backlog', icon: ListTodo, href: '/employee/team/backlog' },
      { id: 'sprints', label: 'Sprints', icon: Rocket, href: '/employee/team/sprints' },
    ],
  },
  {
    title: 'Ceremonies',
    items: [
      { id: 'planning', label: 'Sprint Planning', icon: Target, href: '/employee/team/planning' },
      { id: 'retro', label: 'Retrospectives', icon: History, href: '/employee/team/retro' },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { id: 'velocity', label: 'Velocity', icon: TrendingUp, href: '/employee/team/velocity' },
      { id: 'reports', label: 'Reports', icon: BarChart3, href: '/employee/team/reports' },
    ],
  },
  {
    title: 'Settings',
    items: [
      { id: 'settings', label: 'Team Settings', icon: Settings, href: '/employee/team/settings' },
    ],
  },
]

export function TeamSpaceSidebar({
  teamName,
  teamMemberCount,
  activeSprint,
  onCreateSprint,
}: TeamSpaceSidebarProps) {
  const pathname = usePathname()

  // Determine active section from pathname
  const getActiveSection = () => {
    if (pathname === '/employee/team') return 'board'
    const segment = pathname.split('/').pop()
    return segment || 'board'
  }

  const activeSection = getActiveSection()

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-charcoal-200/60 flex flex-col">
      {/* Workspace Toggle */}
      <WorkspaceToggle />

      {/* Team Header */}
      <div className="px-4 py-4 border-b border-charcoal-200/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-heading font-bold text-charcoal-900 truncate">
              {teamName}
            </h2>
            <p className="text-xs text-charcoal-500">
              {teamMemberCount} member{teamMemberCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Active Sprint Badge */}
        {activeSprint ? (
          <div className="mt-3 px-3 py-2 bg-gold-50 border border-gold-200 rounded-lg">
            <div className="text-[10px] font-semibold text-gold-600 uppercase tracking-wider">
              Active Sprint
            </div>
            <div className="text-sm font-medium text-charcoal-800 truncate mt-0.5">
              {activeSprint.name}
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-3"
            onClick={onCreateSprint}
          >
            <Plus className="w-4 h-4 mr-1" />
            Start Sprint
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        {SIDEBAR_SECTIONS.map((section, sectionIndex) => (
          <div key={sectionIndex} className="px-2">
            {section.title && (
              <div className="px-3 py-2 mt-2 mb-1">
                <span className="text-[10px] font-semibold text-charcoal-400 uppercase tracking-wider">
                  {section.title}
                </span>
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = activeSection === item.id

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                      isActive
                        ? 'bg-charcoal-900 text-white'
                        : 'text-charcoal-600 hover:bg-charcoal-100 hover:text-charcoal-800'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-4 h-4 flex-shrink-0 transition-colors',
                        isActive
                          ? 'text-white'
                          : 'text-charcoal-400 group-hover:text-charcoal-500'
                      )}
                    />
                    <span className="flex-1 text-sm font-medium">{item.label}</span>
                    {item.badge && (
                      <span
                        className={cn(
                          'text-xs tabular-nums px-1.5 py-0.5 rounded',
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-charcoal-100 text-charcoal-500'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}
