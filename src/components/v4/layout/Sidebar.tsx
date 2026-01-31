'use client'

/**
 * Sidebar - Linear-style navigation sidebar
 *
 * A minimal, collapsible sidebar for navigating the application.
 */

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Briefcase,
  Building2,
  ChevronDown,
  ChevronRight,
  Handshake,
  Inbox,
  Search,
  Settings,
  Target,
  User,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCommandPalette } from '../command/CommandPalette'

// ============================================
// Types
// ============================================

interface NavItem {
  id: string
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  count?: number
  shortcut?: string
}

interface SidebarProps {
  className?: string
  onNavigate?: () => void
}

interface NavGroup {
  id: string
  label: string
  items: NavItem[]
  defaultOpen?: boolean
}

// ============================================
// Navigation configuration
// ============================================

const navigationGroups: NavGroup[] = [
  {
    id: 'main',
    label: '',
    defaultOpen: true,
    items: [
      {
        id: 'inbox',
        label: 'Inbox',
        href: '/inbox',
        icon: Inbox,
        count: 12,
        shortcut: 'G I',
      },
    ],
  },
  {
    id: 'recruiting',
    label: 'Recruiting',
    defaultOpen: true,
    items: [
      {
        id: 'jobs',
        label: 'Jobs',
        href: '/jobs',
        icon: Briefcase,
        shortcut: 'G J',
      },
      {
        id: 'candidates',
        label: 'Candidates',
        href: '/candidates',
        icon: User,
        shortcut: 'G C',
      },
      {
        id: 'pipeline',
        label: 'Pipeline',
        href: '/pipeline',
        icon: Users,
      },
    ],
  },
  {
    id: 'sales',
    label: 'Sales',
    defaultOpen: true,
    items: [
      {
        id: 'leads',
        label: 'Leads',
        href: '/leads',
        icon: Target,
        shortcut: 'G L',
      },
      {
        id: 'deals',
        label: 'Deals',
        href: '/deals',
        icon: Handshake,
        shortcut: 'G D',
      },
      {
        id: 'accounts',
        label: 'Accounts',
        href: '/accounts',
        icon: Building2,
        shortcut: 'G A',
      },
    ],
  },
]

// ============================================
// Components
// ============================================

function NavLink({
  item,
  isActive,
  collapsed,
  onNavigate,
}: {
  item: NavItem
  isActive: boolean
  collapsed: boolean
  onNavigate?: () => void
}) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        'linear-nav-item',
        isActive && 'active',
        collapsed && 'justify-center px-0'
      )}
      title={collapsed ? item.label : undefined}
    >
      <item.icon className="icon" />
      {!collapsed && (
        <>
          <span className="flex-1">{item.label}</span>
          {item.count !== undefined && (
            <span className="count">{item.count}</span>
          )}
        </>
      )}
    </Link>
  )
}

function NavGroupComponent({
  group,
  collapsed,
  currentPath,
  onNavigate,
}: {
  group: NavGroup
  collapsed: boolean
  currentPath: string
  onNavigate?: () => void
}) {
  const [isOpen, setIsOpen] = useState(group.defaultOpen ?? true)

  // Don't show group header for main navigation
  const showHeader = group.label && !collapsed

  return (
    <div className="mb-4">
      {showHeader && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 w-full px-2 py-1.5 text-left"
        >
          <ChevronRight
            className={cn(
              'w-3 h-3 text-[var(--linear-text-muted)] transition-transform',
              isOpen && 'rotate-90'
            )}
          />
          <span className="text-[11px] font-medium text-[var(--linear-text-muted)] uppercase tracking-wider">
            {group.label}
          </span>
        </button>
      )}

      {(isOpen || !showHeader) && (
        <div className={cn('space-y-0.5', showHeader && 'mt-1')}>
          {group.items.map((item) => (
            <NavLink
              key={item.id}
              item={item}
              isActive={currentPath.startsWith(item.href)}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================
// Main Component
// ============================================

export function Sidebar({ className, onNavigate }: SidebarProps) {
  const pathname = usePathname()
  const { open: openCommandPalette } = useCommandPalette()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'linear-sidebar flex flex-col h-full transition-all duration-200',
        collapsed ? 'w-14' : 'w-60',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-3 h-14 border-b border-[var(--linear-border-subtle)]">
        {!collapsed && (
          <span className="text-lg font-semibold text-[var(--linear-text-primary)]">
            InTime
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto p-1.5 rounded text-[var(--linear-text-muted)] hover:text-[var(--linear-text-primary)] hover:bg-[var(--linear-surface-hover)] transition-colors"
        >
          <ChevronRight
            className={cn(
              'w-4 h-4 transition-transform',
              collapsed && 'rotate-180'
            )}
          />
        </button>
      </div>

      {/* Search trigger */}
      <div className="p-2">
        <button
          onClick={openCommandPalette}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2 rounded-md',
            'bg-[var(--linear-surface)] border border-[var(--linear-border)]',
            'text-sm text-[var(--linear-text-muted)]',
            'hover:border-[var(--linear-text-muted)] transition-colors',
            collapsed && 'justify-center px-0'
          )}
        >
          <Search className="w-4 h-4" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">Search...</span>
              <kbd className="linear-kbd text-[10px]">⌘K</kbd>
            </>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto linear-scrollbar px-2 py-2">
        {navigationGroups.map((group) => (
          <NavGroupComponent
            key={group.id}
            group={group}
            collapsed={collapsed}
            currentPath={pathname}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-[var(--linear-border-subtle)]">
        <Link
          href="/settings"
          onClick={onNavigate}
          className={cn(
            'linear-nav-item',
            pathname.startsWith('/settings') && 'active',
            collapsed && 'justify-center px-0'
          )}
        >
          <Settings className="icon" />
          {!collapsed && <span>Settings</span>}
        </Link>
      </div>
    </aside>
  )
}

export default Sidebar
