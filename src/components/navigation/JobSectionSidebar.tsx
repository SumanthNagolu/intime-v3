'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Edit,
  Users,
  Phone,
  Send,
  XCircle,
  Play,
  Pause,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { LucideIcon } from 'lucide-react'
import { jobSections } from '@/lib/navigation/entity-sections'
import { trpc } from '@/lib/trpc/client'

// Quick action definition
interface QuickAction {
  id: string
  label: string
  icon: LucideIcon
  actionType: 'dialog' | 'navigate'
  href?: string
  dialogId?: string
  showForStatuses?: string[]
  hideForStatuses?: string[]
}

const jobQuickActions: QuickAction[] = [
  { id: 'edit', label: 'Edit Job', icon: Edit, actionType: 'navigate', href: '/employee/recruiting/jobs/:id/edit' },
  { id: 'addCandidate', label: 'Add Candidate', icon: Users, actionType: 'navigate', href: '/employee/recruiting/jobs/:id/add-candidate' },
  { id: 'submitCandidate', label: 'Submit Candidate', icon: Send, actionType: 'dialog', dialogId: 'submitCandidate' },
  { id: 'logActivity', label: 'Log Activity', icon: Phone, actionType: 'dialog', dialogId: 'logActivity' },
  { id: 'updateStatus', label: 'Update Status', icon: Play, actionType: 'dialog', dialogId: 'updateStatus' },
  { id: 'putOnHold', label: 'Put on Hold', icon: Pause, actionType: 'dialog', dialogId: 'putOnHold', hideForStatuses: ['on_hold', 'filled', 'cancelled'] },
  { id: 'closeJob', label: 'Close Job', icon: XCircle, actionType: 'dialog', dialogId: 'closeJob', hideForStatuses: ['filled', 'cancelled'] },
]

interface JobSectionSidebarProps {
  jobId: string
  jobTitle: string
  jobSubtitle?: string // e.g., account name
  jobStatus: string
  // Section counts
  counts?: {
    pipeline?: number
    submissions?: number
    interviews?: number
    offers?: number
    notes?: number
  }
  onQuickAction?: (action: QuickAction) => void
  className?: string
}

export function JobSectionSidebar({
  jobId,
  jobTitle,
  jobSubtitle,
  jobStatus,
  counts: externalCounts,
  onQuickAction,
  className,
}: JobSectionSidebarProps) {
  const searchParams = useSearchParams()
  const currentSection = searchParams.get('section') || 'overview'

  // Fetch counts if not provided externally
  const submissionsQuery = trpc.ats.submissions.list.useQuery(
    { jobId, limit: 100 },
    { enabled: !externalCounts }
  )
  const interviewsQuery = trpc.ats.interviews.list.useQuery(
    { jobId },
    { enabled: !externalCounts }
  )
  const activitiesQuery = trpc.activities.listByEntity.useQuery(
    { entityType: 'job', entityId: jobId, activityTypes: ['note'], limit: 100 },
    { enabled: !externalCounts }
  )

  // Calculate counts from queries or use external counts
  const submissions = submissionsQuery.data?.items || []
  const counts = externalCounts || {
    pipeline: submissions.filter((s: any) => ['screening', 'submitted', 'interview', 'shortlisted'].includes(s.status)).length,
    submissions: submissionsQuery.data?.total,
    interviews: interviewsQuery.data?.total,
    offers: submissions.filter((s: any) => ['offer_pending', 'offer_extended'].includes(s.status)).length,
    notes: activitiesQuery.data?.total,
  }

  // Build section href
  const buildSectionHref = (sectionId: string) => {
    if (sectionId === 'overview') {
      return `/employee/recruiting/jobs/${jobId}?view=sections`
    }
    return `/employee/recruiting/jobs/${jobId}?view=sections&section=${sectionId}`
  }

  // Get count for a section
  const getSectionCount = (sectionId: string): number | undefined => {
    switch (sectionId) {
      case 'pipeline': return counts?.pipeline
      case 'submissions': return counts?.submissions
      case 'interviews': return counts?.interviews
      case 'offers': return counts?.offers
      case 'notes': return counts?.notes
      default: return undefined
    }
  }

  // Filter quick actions based on status
  const visibleQuickActions = jobQuickActions.filter((action) => {
    if (action.showForStatuses && !action.showForStatuses.includes(jobStatus)) {
      return false
    }
    if (action.hideForStatuses && action.hideForStatuses.includes(jobStatus)) {
      return false
    }
    return true
  })

  // Handle quick action click
  const handleQuickAction = (action: QuickAction) => {
    if (onQuickAction) {
      onQuickAction(action)
    }
  }

  return (
    <aside className={cn('w-64 bg-white border-r border-charcoal-100 flex flex-col flex-shrink-0', className)}>
      {/* Job Header */}
      <div className="p-4 border-b border-charcoal-100">
        <h2 className="font-heading font-semibold text-charcoal-900 truncate text-base">
          {jobTitle}
        </h2>
        {jobSubtitle && (
          <p className="text-sm text-charcoal-500 truncate mt-0.5">
            {jobSubtitle}
          </p>
        )}
        <div className="mt-2">
          <JobStatusBadge status={jobStatus} />
        </div>
      </div>

      {/* Section Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {jobSections.map((section) => {
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
          {visibleQuickActions.map((action) => {
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
                  <Link href={action.href.replace(':id', jobId)}>
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

// Job status badge component
function JobStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: 'bg-charcoal-200 text-charcoal-700',
    open: 'bg-blue-100 text-blue-800',
    active: 'bg-green-100 text-green-800',
    on_hold: 'bg-amber-100 text-amber-800',
    filled: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-red-100 text-red-800',
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
