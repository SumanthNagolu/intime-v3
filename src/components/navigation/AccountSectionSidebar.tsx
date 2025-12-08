'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Building2,
  Users,
  Briefcase,
  Award,
  FileText,
  Clock,
  MessageSquare,
  Calendar,
  AlertTriangle,
  Edit,
  Phone,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { LucideIcon } from 'lucide-react'

// Section configuration for account sidebar
export interface AccountSection {
  id: string
  label: string
  icon: LucideIcon
  showCount?: boolean
  alertOnCount?: boolean // Show alert styling when count > 0
}

export const accountSections: AccountSection[] = [
  { id: 'overview', label: 'Account Overview', icon: Building2 },
  { id: 'contacts', label: 'Contacts', icon: Users, showCount: true },
  { id: 'jobs', label: 'Jobs', icon: Briefcase, showCount: true },
  { id: 'placements', label: 'Placements', icon: Award, showCount: true },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'activities', label: 'Activities', icon: Clock },
  { id: 'notes', label: 'Notes', icon: MessageSquare, showCount: true },
  { id: 'meetings', label: 'Meetings', icon: Calendar, showCount: true },
  { id: 'escalations', label: 'Escalations', icon: AlertTriangle, showCount: true, alertOnCount: true },
]

// Quick action definition
interface QuickAction {
  id: string
  label: string
  icon: LucideIcon
  actionType: 'dialog' | 'navigate'
  href?: string
  dialogId?: string
}

const accountQuickActions: QuickAction[] = [
  { id: 'edit', label: 'Edit Account', icon: Edit, actionType: 'navigate', href: '/employee/recruiting/accounts/:id/edit' },
  { id: 'contact', label: 'Add Contact', icon: Users, actionType: 'dialog', dialogId: 'addContact' },
  { id: 'job', label: 'New Job', icon: Briefcase, actionType: 'navigate', href: '/employee/recruiting/jobs/intake?accountId=:id' },
  { id: 'activity', label: 'Log Activity', icon: Phone, actionType: 'dialog', dialogId: 'logActivity' },
]

interface AccountSectionSidebarProps {
  accountId: string
  accountName: string
  accountSubtitle?: string // e.g., industry
  accountStatus: string
  // Section counts
  counts?: {
    contacts?: number
    jobs?: number
    placements?: number
    notes?: number
    meetings?: number
    escalations?: number
  }
  onQuickAction?: (action: QuickAction) => void
  className?: string
}

export function AccountSectionSidebar({
  accountId,
  accountName,
  accountSubtitle,
  accountStatus,
  counts = {},
  onQuickAction,
  className,
}: AccountSectionSidebarProps) {
  const searchParams = useSearchParams()
  const currentSection = searchParams.get('section') || 'overview'

  // Build section href
  const buildSectionHref = (sectionId: string) => {
    if (sectionId === 'overview') {
      return `/employee/recruiting/accounts/${accountId}`
    }
    return `/employee/recruiting/accounts/${accountId}?section=${sectionId}`
  }

  // Get count for a section
  const getSectionCount = (sectionId: string): number | undefined => {
    switch (sectionId) {
      case 'contacts': return counts.contacts
      case 'jobs': return counts.jobs
      case 'placements': return counts.placements
      case 'notes': return counts.notes
      case 'meetings': return counts.meetings
      case 'escalations': return counts.escalations
      default: return undefined
    }
  }

  // Handle quick action click
  const handleQuickAction = (action: QuickAction) => {
    if (onQuickAction) {
      onQuickAction(action)
    }
  }

  return (
    <aside className={cn('w-64 bg-white border-r border-charcoal-100 flex flex-col flex-shrink-0', className)}>
      {/* Account Header */}
      <div className="p-4 border-b border-charcoal-100">
        <h2 className="font-heading font-semibold text-charcoal-900 truncate text-base">
          {accountName}
        </h2>
        {accountSubtitle && (
          <p className="text-sm text-charcoal-500 truncate mt-0.5 capitalize">
            {accountSubtitle.replace(/_/g, ' ')}
          </p>
        )}
        <div className="mt-2">
          <StatusBadge status={accountStatus} />
        </div>
      </div>

      {/* Section Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {accountSections.map((section) => {
            const Icon = section.icon
            const isActive = currentSection === section.id
            const count = getSectionCount(section.id)
            const hasAlertCount = section.alertOnCount && count !== undefined && count > 0

            return (
              <li key={section.id}>
                <Link
                  href={buildSectionHref(section.id)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                    isActive && 'bg-hublot-50 text-hublot-700 font-medium',
                    !isActive && 'text-charcoal-600 hover:bg-charcoal-50',
                    hasAlertCount && !isActive && 'text-red-600'
                  )}
                >
                  <Icon className={cn(
                    'w-5 h-5 flex-shrink-0',
                    isActive && 'text-hublot-600',
                    hasAlertCount && !isActive && 'text-red-500'
                  )} />
                  <span className="flex-1 text-sm truncate">
                    {section.label}
                  </span>
                  {section.showCount && count !== undefined && (
                    <span className={cn(
                      'text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center',
                      isActive && 'bg-hublot-100 text-hublot-700',
                      !isActive && hasAlertCount && 'bg-red-100 text-red-700',
                      !isActive && !hasAlertCount && 'bg-charcoal-100 text-charcoal-600'
                    )}>
                      {count}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Quick Actions */}
      <div className="p-4 border-t border-charcoal-100">
        <h3 className="text-xs font-medium text-charcoal-500 uppercase tracking-wide mb-3">
          Quick Actions
        </h3>
        <div className="space-y-2">
          {accountQuickActions.map((action) => {
            const ActionIcon = action.icon

            // Handle navigation actions with links
            if (action.actionType === 'navigate' && action.href) {
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2"
                  asChild
                >
                  <Link href={action.href.replace(':id', accountId)}>
                    <ActionIcon className="w-4 h-4" />
                    {action.label}
                  </Link>
                </Button>
              )
            }

            // Handle dialog actions with buttons
            return (
              <Button
                key={action.id}
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => handleQuickAction(action)}
              >
                <ActionIcon className="w-4 h-4" />
                {action.label}
              </Button>
            )
          })}
        </div>
      </div>
    </aside>
  )
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    prospect: 'bg-amber-100 text-amber-700',
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-charcoal-100 text-charcoal-600',
    churned: 'bg-red-100 text-red-700',
    default: 'bg-charcoal-100 text-charcoal-700',
  }

  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize',
      colors[status] || colors.default
    )}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}

