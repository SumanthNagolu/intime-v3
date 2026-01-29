'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import {
  Users, Shield, Building2, MapPin, Settings,
  Workflow, Mail, Zap, FileText, Flag, Key,
  Activity, ChevronDown, ChevronRight, Lock,
  ClipboardList, AlertTriangle, LayoutDashboard,
  Palette, Globe, ShieldCheck, HardDrive, Plug,
  Phone, Calendar, Clock, Briefcase, Cog, Plus
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CollapsibleSectionGroup } from '@/components/navigation/CollapsibleSectionGroup'
import { OrganizationTree } from './OrganizationTree'

interface AdminSidebarProps {
  organization: { id: string; name: string }
  groups: Array<{
    id: string
    name: string
    code: string | null
    groupType: string
    parentGroupId: string | null
    hierarchyLevel: number
    hierarchyPath: string | null
    isActive: boolean
    _count?: { members: number }
  }>
}

// =============================================================================
// SAAS-GRADE ADMIN NAVIGATION STRUCTURE
// Following enterprise patterns: Org Structure → People → Automation → Platform → Compliance
// =============================================================================

// 1. ORGANIZATION - Company structure and settings
const ORGANIZATION_ITEMS = [
  { href: '/employee/admin/settings', label: 'Company Settings', icon: Settings },
  // Groups is rendered separately with expandable tree
  { href: '/employee/admin/regions', label: 'Regions', icon: MapPin },
]

// Settings sub-navigation items (Company configuration)
const SETTINGS_SUB_ITEMS = [
  { href: '/employee/admin/settings', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/employee/admin/settings/organization', label: 'Profile', icon: Building2 },
  { href: '/employee/admin/settings/addresses', label: 'Addresses', icon: MapPin },
  { href: '/employee/admin/settings/contact', label: 'Contact Info', icon: Phone },
  { href: '/employee/admin/settings/branding', label: 'Branding', icon: Palette },
  { href: '/employee/admin/settings/localization', label: 'Regional', icon: Globe },
  { href: '/employee/admin/settings/fiscal', label: 'Fiscal Year', icon: Calendar },
  { href: '/employee/admin/settings/hours', label: 'Business Hours', icon: Clock },
  { href: '/employee/admin/settings/business', label: 'Business Rules', icon: Briefcase },
  { href: '/employee/admin/settings/defaults', label: 'Defaults', icon: FileText },
]

// 2. PEOPLE & ACCESS - User management and permissions
const PEOPLE_ACCESS_ITEMS = [
  { href: '/employee/admin/users', label: 'Users', icon: Users },
  { href: '/employee/admin/roles', label: 'Roles', icon: Shield },
  { href: '/employee/admin/permissions', label: 'Permissions', icon: Lock },
]

// 3. AUTOMATION - Workflows, rules, and templates
const AUTOMATION_ITEMS = [
  { href: '/employee/admin/workflows', label: 'Workflows', icon: Workflow },
  { href: '/employee/admin/activity-patterns', label: 'Activity Patterns', icon: Activity },
  { href: '/employee/admin/email-templates', label: 'Email Templates', icon: Mail },
]

// 4. PLATFORM - Integrations, API, storage, and developer tools
const PLATFORM_ITEMS = [
  { href: '/employee/admin/integrations', label: 'Integrations', icon: Zap },
  { href: '/employee/admin/settings/email', label: 'Email Config', icon: Mail },
  { href: '/employee/admin/settings/api', label: 'API Settings', icon: Plug },
  { href: '/employee/admin/api-tokens', label: 'API Tokens', icon: Key },
  { href: '/employee/admin/settings/files', label: 'File Storage', icon: HardDrive },
  { href: '/employee/admin/settings/system', label: 'System', icon: Cog },
  { href: '/employee/admin/feature-flags', label: 'Feature Flags', icon: Flag },
]

// 5. SECURITY & COMPLIANCE - Access control, audit, emergency
const COMPLIANCE_ITEMS = [
  { href: '/employee/admin/settings/security', label: 'Security', icon: Lock },
  { href: '/employee/admin/settings/compliance', label: 'Compliance', icon: ShieldCheck },
  { href: '/employee/admin/audit', label: 'Audit Logs', icon: ClipboardList },
  { href: '/employee/admin/emergency', label: 'Emergency', icon: AlertTriangle },
]

export function AdminSidebar({ organization, groups }: AdminSidebarProps) {
  const pathname = usePathname()
  const [groupsExpanded, setGroupsExpanded] = useState(true)
  const [settingsExpanded, setSettingsExpanded] = useState(pathname.startsWith('/employee/admin/settings'))
  const isGroupsActive = pathname.startsWith('/employee/admin/groups') || pathname.startsWith('/employee/admin/pods')
  const isSettingsActive = pathname.startsWith('/employee/admin/settings')

  return (
    <div className="flex flex-col h-full">
      {/* ========================================
          1. ORGANIZATION - Company structure
          ======================================== */}
      <CollapsibleSectionGroup id="admin-organization" label="Organization" defaultOpen={true}>
        <nav className="space-y-0.5 py-1">
          {/* Company Settings with expandable sub-items */}
          <div>
            <div className="flex items-center group">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setSettingsExpanded(!settingsExpanded)
                }}
                className="flex items-center justify-center w-8 h-8 text-charcoal-400 hover:text-charcoal-700 hover:bg-charcoal-100 rounded transition-colors cursor-pointer"
              >
                {settingsExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              <Link
                href="/employee/admin/settings"
                className={cn(
                  'flex-1 flex items-center gap-2 px-2 py-2 text-sm rounded-sm transition-colors duration-200',
                  isSettingsActive
                    ? 'bg-gold-50 text-gold-700 font-medium border-l-[3px] border-gold-500 -ml-[3px] pl-[11px]'
                    : 'text-charcoal-600 hover:bg-charcoal-50 hover:text-charcoal-900'
                )}
              >
                <Settings className="h-4 w-4" />
                <span>Company Settings</span>
              </Link>
            </div>

            {/* Settings sub-navigation */}
            {settingsExpanded && (
              <div className="ml-6 border-l border-charcoal-100 pl-2 mt-1 space-y-0.5">
                {SETTINGS_SUB_ITEMS.map((item) => {
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href) && pathname !== '/employee/admin/settings'
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-2 px-2 py-1.5 text-xs rounded-sm transition-colors duration-200',
                        isActive
                          ? 'bg-gold-50 text-gold-700 font-medium'
                          : 'text-charcoal-500 hover:bg-charcoal-50 hover:text-charcoal-700'
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Groups item with expandable organization tree */}
          <div>
            <div className="flex items-center group">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setGroupsExpanded(!groupsExpanded)
                }}
                className="flex items-center justify-center w-8 h-8 text-charcoal-400 hover:text-charcoal-700 hover:bg-charcoal-100 rounded transition-colors cursor-pointer"
              >
                {groupsExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              <Link
                href="/employee/admin/groups"
                className={cn(
                  'flex-1 flex items-center gap-2 px-2 py-2 text-sm rounded-sm transition-colors duration-200',
                  isGroupsActive
                    ? 'bg-gold-50 text-gold-700 font-medium border-l-[3px] border-gold-500 -ml-[3px] pl-[11px]'
                    : 'text-charcoal-600 hover:bg-charcoal-50 hover:text-charcoal-900'
                )}
              >
                <Building2 className="h-4 w-4" />
                <span>Groups</span>
              </Link>
              <Link
                href="/employee/admin/groups/new"
                className="opacity-0 group-hover:opacity-100 flex items-center justify-center w-6 h-6 text-charcoal-400 hover:text-gold-600 hover:bg-gold-50 rounded transition-all"
                title="New Group"
              >
                <Plus className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Organization tree nested under Groups */}
            {groupsExpanded && (
              <div className="ml-6 border-l border-charcoal-100 pl-2 mt-1">
                <OrganizationTree organization={organization} groups={groups} />
              </div>
            )}
          </div>

          {/* Regions */}
          <NavItem
            href="/employee/admin/regions"
            label="Regions"
            icon={MapPin}
            isActive={pathname.startsWith('/employee/admin/regions')}
          />
        </nav>
      </CollapsibleSectionGroup>

      {/* ========================================
          2. PEOPLE & ACCESS - User management
          ======================================== */}
      <CollapsibleSectionGroup id="admin-people-access" label="People & Access" defaultOpen={false}>
        <nav className="space-y-0.5 py-1">
          {PEOPLE_ACCESS_ITEMS.map(item => (
            <NavItem key={item.href} {...item} isActive={pathname.startsWith(item.href)} />
          ))}
        </nav>
      </CollapsibleSectionGroup>

      {/* ========================================
          3. AUTOMATION - Workflows, rules, templates
          ======================================== */}
      <CollapsibleSectionGroup id="admin-automation" label="Automation" defaultOpen={false}>
        <nav className="space-y-0.5 py-1">
          {AUTOMATION_ITEMS.map(item => (
            <NavItem key={item.href} {...item} isActive={pathname.startsWith(item.href)} />
          ))}
        </nav>
      </CollapsibleSectionGroup>

      {/* ========================================
          4. PLATFORM - Integrations, API, dev tools
          ======================================== */}
      <CollapsibleSectionGroup id="admin-platform" label="Platform" defaultOpen={false}>
        <nav className="space-y-0.5 py-1">
          {PLATFORM_ITEMS.map(item => (
            <NavItem key={item.href} {...item} isActive={pathname.startsWith(item.href)} />
          ))}
        </nav>
      </CollapsibleSectionGroup>

      {/* ========================================
          5. SECURITY & COMPLIANCE - Access, audit, emergency
          ======================================== */}
      <CollapsibleSectionGroup id="admin-compliance" label="Security & Compliance" defaultOpen={false}>
        <nav className="space-y-0.5 py-1">
          {COMPLIANCE_ITEMS.map(item => (
            <NavItem key={item.href} {...item} isActive={pathname.startsWith(item.href)} />
          ))}
        </nav>
      </CollapsibleSectionGroup>
    </div>
  )
}

interface NavItemProps {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  isActive: boolean
}

function NavItem({ href, label, icon: Icon, isActive }: NavItemProps) {
  return (
    <div className="pl-8">
      <Link
        href={href}
        className={cn(
          'flex items-center gap-2 px-2 py-2 text-sm rounded-sm transition-colors duration-200',
          isActive
            ? 'bg-gold-50 text-gold-700 font-medium border-l-[3px] border-gold-500 -ml-[3px] pl-[11px]'
            : 'text-charcoal-600 hover:bg-charcoal-50 hover:text-charcoal-900'
        )}
      >
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </Link>
    </div>
  )
}
