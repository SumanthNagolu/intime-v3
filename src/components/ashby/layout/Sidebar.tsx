'use client'

/**
 * Ashby-style Sidebar
 *
 * Features:
 * - For You section (personalized)
 * - Recent items
 * - Starred items
 * - Collapsible navigation groups
 * - Module sections (Recruiting, CRM, HR)
 */

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Briefcase,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Handshake,
  Home,
  Inbox,
  LayoutGrid,
  Search,
  Settings,
  Star,
  Target,
  User,
  Users,
  FileText,
  Calendar,
  BarChart3,
  Folder,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================
// Types
// ============================================

interface NavItem {
  id: string
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  count?: number
}

interface NavGroup {
  id: string
  label: string
  items: NavItem[]
  defaultOpen?: boolean
}

// ============================================
// Navigation Configuration
// ============================================

const mainNavItems: NavItem[] = [
  { id: 'home', label: 'Home', href: '/a', icon: Home },
  { id: 'inbox', label: 'Inbox', href: '/a/inbox', icon: Inbox, count: 5 },
]

const recentItems: NavItem[] = [
  { id: 'recent-1', label: 'Senior React Developer', href: '/a/jobs/1', icon: Briefcase },
  { id: 'recent-2', label: 'Acme Corp', href: '/a/accounts/1', icon: Building2 },
  { id: 'recent-3', label: 'John Smith', href: '/a/candidates/1', icon: User },
]

const navigationGroups: NavGroup[] = [
  {
    id: 'recruiting',
    label: 'Recruiting',
    defaultOpen: true,
    items: [
      { id: 'jobs', label: 'Jobs', href: '/a/jobs', icon: Briefcase },
      { id: 'candidates', label: 'Candidates', href: '/a/candidates', icon: User },
      { id: 'pipeline', label: 'Pipeline', href: '/a/pipeline', icon: LayoutGrid },
      { id: 'interviews', label: 'Interviews', href: '/a/interviews', icon: Calendar },
    ],
  },
  {
    id: 'crm',
    label: 'CRM',
    defaultOpen: true,
    items: [
      { id: 'accounts', label: 'Accounts', href: '/a/accounts', icon: Building2 },
      { id: 'leads', label: 'Leads', href: '/a/leads', icon: Target },
      { id: 'deals', label: 'Deals', href: '/a/deals', icon: Handshake },
      { id: 'contacts', label: 'Contacts', href: '/a/contacts', icon: Users },
    ],
  },
  {
    id: 'hr',
    label: 'HR',
    defaultOpen: false,
    items: [
      { id: 'employees', label: 'Employees', href: '/a/employees', icon: Users },
      { id: 'directory', label: 'Directory', href: '/a/directory', icon: Folder },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    defaultOpen: false,
    items: [
      { id: 'analytics', label: 'Analytics', href: '/a/analytics', icon: BarChart3 },
      { id: 'reports', label: 'Reports', href: '/a/reports', icon: FileText },
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
}: {
  item: NavItem
  isActive: boolean
  collapsed: boolean
}) {
  return (
    <Link
      href={item.href}
      className={cn(
        'ashby-nav-item',
        isActive && 'active',
        collapsed && 'justify-center'
      )}
      title={collapsed ? item.label : undefined}
    >
      <item.icon className="icon" />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.count !== undefined && item.count > 0 && (
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
}: {
  group: NavGroup
  collapsed: boolean
  currentPath: string
}) {
  const [isOpen, setIsOpen] = useState(group.defaultOpen ?? true)

  if (collapsed) {
    // In collapsed mode, just show icons
    return (
      <div className="mb-2">
        {group.items.map((item) => (
          <NavLink
            key={item.id}
            item={item}
            isActive={currentPath.startsWith(item.href)}
            collapsed={collapsed}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="ashby-nav-section">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 w-full px-3 py-2 text-left hover:bg-[var(--ashby-bg-hover)] rounded-md transition-colors"
      >
        <ChevronDown
          className={cn(
            'w-4 h-4 text-[var(--ashby-text-muted)] transition-transform',
            !isOpen && '-rotate-90'
          )}
        />
        <span className="ashby-nav-section-title" style={{ padding: 0 }}>
          {group.label}
        </span>
      </button>

      {isOpen && (
        <div className="mt-1 space-y-0.5">
          {group.items.map((item) => (
            <NavLink
              key={item.id}
              item={item}
              isActive={currentPath.startsWith(item.href)}
              collapsed={collapsed}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function RecentSection({
  collapsed,
  currentPath,
}: {
  collapsed: boolean
  currentPath: string
}) {
  const [isOpen, setIsOpen] = useState(true)

  if (collapsed) return null

  return (
    <div className="ashby-nav-section">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 w-full px-3 py-2 text-left hover:bg-[var(--ashby-bg-hover)] rounded-md transition-colors"
      >
        <ChevronDown
          className={cn(
            'w-4 h-4 text-[var(--ashby-text-muted)] transition-transform',
            !isOpen && '-rotate-90'
          )}
        />
        <Clock className="w-4 h-4 text-[var(--ashby-text-muted)]" />
        <span className="text-xs font-medium text-[var(--ashby-text-muted)] uppercase tracking-wide">
          Recent
        </span>
      </button>

      {isOpen && (
        <div className="mt-1 space-y-0.5">
          {recentItems.map((item) => (
            <NavLink
              key={item.id}
              item={item}
              isActive={currentPath === item.href}
              collapsed={collapsed}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================
// Main Sidebar Component
// ============================================

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'ashby-sidebar',
        collapsed && 'collapsed',
        className
      )}
    >
      {/* Header */}
      <div className="ashby-sidebar-header">
        {!collapsed && (
          <div className="ashby-sidebar-logo">
            <div className="w-7 h-7 rounded-lg bg-[var(--ashby-accent)] flex items-center justify-center text-white font-bold text-sm">
              I
            </div>
            <span>InTime</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-[var(--ashby-bg-hover)] transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-[var(--ashby-text-muted)]" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-[var(--ashby-text-muted)]" />
          )}
        </button>
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="p-2">
          <button
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--ashby-text-muted)] bg-[var(--ashby-bg-secondary)] border border-[var(--ashby-border)] rounded-md hover:border-[var(--ashby-border-strong)] transition-colors"
          >
            <Search className="w-4 h-4" />
            <span className="flex-1 text-left">Search...</span>
            <kbd className="px-1.5 py-0.5 text-xs bg-[var(--ashby-bg)] border border-[var(--ashby-border)] rounded">
              ⌘K
            </kbd>
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="ashby-sidebar-nav">
        {/* Main items */}
        <div className="mb-4 space-y-0.5">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.id}
              item={item}
              isActive={pathname === item.href}
              collapsed={collapsed}
            />
          ))}
        </div>

        {/* Recent */}
        <RecentSection collapsed={collapsed} currentPath={pathname} />

        {/* Nav groups */}
        {navigationGroups.map((group) => (
          <NavGroupComponent
            key={group.id}
            group={group}
            collapsed={collapsed}
            currentPath={pathname}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-[var(--ashby-border-subtle)]">
        <NavLink
          item={{ id: 'settings', label: 'Settings', href: '/a/settings', icon: Settings }}
          isActive={pathname.startsWith('/a/settings')}
          collapsed={collapsed}
        />
      </div>
    </aside>
  )
}

export default Sidebar
