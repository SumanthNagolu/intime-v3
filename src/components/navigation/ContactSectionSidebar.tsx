'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Edit,
  Phone,
  Mail,
  Star,
  Calendar,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { LucideIcon } from 'lucide-react'
import { contactSections } from '@/lib/navigation/entity-sections'
import { trpc } from '@/lib/trpc/client'

// Quick action definition
interface QuickAction {
  id: string
  label: string
  icon: LucideIcon
  actionType: 'dialog' | 'navigate'
  href?: string
  dialogId?: string
}

const contactQuickActions: QuickAction[] = [
  { id: 'edit', label: 'Edit Contact', icon: Edit, actionType: 'navigate', href: '/employee/contacts/:id/edit' },
  { id: 'call', label: 'Log Call', icon: Phone, actionType: 'dialog', dialogId: 'logCall' },
  { id: 'email', label: 'Send Email', icon: Mail, actionType: 'dialog', dialogId: 'sendEmail' },
  { id: 'meeting', label: 'Schedule Meeting', icon: Calendar, actionType: 'dialog', dialogId: 'scheduleMeeting' },
  { id: 'makePrimary', label: 'Make Primary', icon: Star, actionType: 'dialog', dialogId: 'makePrimary' },
]

interface ContactSectionSidebarProps {
  contactId: string
  contactName: string
  contactSubtitle?: string // e.g., title and company
  isPrimary?: boolean
  // Section counts
  counts?: {
    accounts?: number
    submissions?: number
    activities?: number
    communications?: number
    meetings?: number
    notes?: number
  }
  onQuickAction?: (action: QuickAction) => void
  className?: string
}

export function ContactSectionSidebar({
  contactId,
  contactName,
  contactSubtitle,
  isPrimary = false,
  counts: externalCounts,
  onQuickAction,
  className,
}: ContactSectionSidebarProps) {
  const searchParams = useSearchParams()
  const currentSection = searchParams.get('section') || 'overview'

  // Fetch counts if not provided externally
  const activitiesQuery = trpc.crm.activities.listByContact.useQuery(
    { contactId },
    { enabled: !externalCounts }
  )

  // Calculate counts from queries or use external counts
  const counts = externalCounts || {
    accounts: 1, // Contact belongs to one account
    submissions: 0, // Would need a submissions by contact query
    activities: (activitiesQuery.data as Array<unknown> | undefined)?.length ?? 0,
    communications: 0, // Would need communications query
    meetings: 0, // Would need meetings by contact query
    notes: 0, // Would need notes by contact query
  }

  // Build section href
  const buildSectionHref = (sectionId: string) => {
    if (sectionId === 'overview') {
      return `/employee/contacts/${contactId}`
    }
    return `/employee/contacts/${contactId}?section=${sectionId}`
  }

  // Get count for a section
  const getSectionCount = (sectionId: string): number | undefined => {
    switch (sectionId) {
      case 'accounts': return counts?.accounts
      case 'submissions': return counts?.submissions
      case 'activities': return counts?.activities
      case 'communications': return counts?.communications
      case 'meetings': return counts?.meetings
      case 'notes': return counts?.notes
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
      {/* Contact Header */}
      <div className="p-4 border-b border-charcoal-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-hublot-100 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-medium text-hublot-700">
              {contactName.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <h2 className="font-heading font-semibold text-charcoal-900 truncate text-base">
                {contactName}
              </h2>
              {isPrimary && (
                <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
              )}
            </div>
            {contactSubtitle && (
              <p className="text-sm text-charcoal-500 truncate mt-0.5">
                {contactSubtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Section Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {contactSections.map((section) => {
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
          {contactQuickActions.map((action) => {
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
                  <Link href={action.href.replace(':id', contactId)}>
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
