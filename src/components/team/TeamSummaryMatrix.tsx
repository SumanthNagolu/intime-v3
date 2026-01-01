'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Inbox, User } from 'lucide-react'
import type {
  TeamWorkspaceData,
  TeamMemberMetrics,
  TeamSection,
} from '@/types/workspace'

interface TeamSummaryMatrixProps {
  data: TeamWorkspaceData
  onCellClick?: (section: TeamSection, memberId?: string, filter?: string) => void
}

interface CellProps {
  value: number
  variant?: 'default' | 'warning' | 'muted'
  onClick?: () => void
}

/**
 * Clickable cell component for the matrix
 */
function MatrixCell({ value, variant = 'default', onClick }: CellProps) {
  const isClickable = value > 0 && !!onClick

  return (
    <td
      className={cn(
        'px-3 py-3 text-center transition-all duration-200',
        isClickable && 'cursor-pointer hover:bg-gold-50',
        variant === 'warning' && value > 0 && 'text-error-600 font-semibold bg-error-50/30',
        variant === 'muted' && 'text-charcoal-400',
        value === 0 && 'text-charcoal-300'
      )}
      onClick={isClickable ? onClick : undefined}
    >
      {value > 0 ? value : '-'}
    </td>
  )
}

/**
 * Queue row component
 */
function QueueRow({
  data,
  onCellClick,
}: {
  data: TeamWorkspaceData
  onCellClick?: TeamSummaryMatrixProps['onCellClick']
}) {
  const activityCount = data.queue.filter((q) => q.type === 'activity').length
  const submissionCount = data.queue.filter((q) => q.type === 'submission').length
  const jobCount = data.queue.filter((q) => q.type === 'job').length

  return (
    <tr className="bg-warning-50/50 hover:bg-warning-50/80 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-warning-100 flex items-center justify-center">
            <Inbox className="w-4 h-4 text-warning-600" />
          </div>
          <div>
            <span className="font-medium text-charcoal-900">In Queue</span>
            <span className="text-xs text-charcoal-500 ml-2">(Unassigned)</span>
          </div>
        </div>
      </td>
      <MatrixCell
        value={activityCount}
        onClick={activityCount > 0 ? () => onCellClick?.('queue', undefined, 'activities') : undefined}
      />
      <MatrixCell value={0} variant="muted" />
      <MatrixCell value={0} variant="muted" />
      <MatrixCell
        value={submissionCount}
        onClick={submissionCount > 0 ? () => onCellClick?.('queue', undefined, 'submissions') : undefined}
      />
      <MatrixCell value={0} variant="muted" />
      <MatrixCell
        value={jobCount}
        onClick={jobCount > 0 ? () => onCellClick?.('queue', undefined, 'jobs') : undefined}
      />
      <MatrixCell value={0} variant="muted" />
    </tr>
  )
}

/**
 * Member row component
 */
function MemberRow({
  metrics,
  member,
  onCellClick,
}: {
  metrics: TeamMemberMetrics
  member: { id: string; name: string; avatarUrl: string | null; role: string }
  onCellClick?: TeamSummaryMatrixProps['onCellClick']
}) {
  const initials = metrics.memberName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const roleLabel =
    member.role === 'manager'
      ? 'Manager'
      : member.role === 'senior'
      ? 'Senior'
      : 'Team Member'

  return (
    <tr className="hover:bg-charcoal-50/50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {member.avatarUrl ? (
            <img
              src={member.avatarUrl}
              alt={metrics.memberName}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-charcoal-100 flex items-center justify-center text-xs font-medium text-charcoal-600">
              {initials}
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-medium text-charcoal-900">{metrics.memberName}</span>
            <span className="text-xs text-charcoal-500">{roleLabel}</span>
          </div>
        </div>
      </td>
      <MatrixCell
        value={metrics.activities.open}
        onClick={
          metrics.activities.open > 0
            ? () => onCellClick?.('activities', metrics.memberId, 'open')
            : undefined
        }
      />
      <MatrixCell
        value={metrics.activities.priority}
        onClick={
          metrics.activities.priority > 0
            ? () => onCellClick?.('activities', metrics.memberId, 'priority')
            : undefined
        }
      />
      <MatrixCell
        value={metrics.activities.overdue}
        variant="warning"
        onClick={
          metrics.activities.overdue > 0
            ? () => onCellClick?.('activities', metrics.memberId, 'overdue')
            : undefined
        }
      />
      <MatrixCell
        value={metrics.submissions.open}
        onClick={
          metrics.submissions.open > 0
            ? () => onCellClick?.('submissions', metrics.memberId, 'open')
            : undefined
        }
      />
      <MatrixCell
        value={metrics.submissions.priority}
        onClick={
          metrics.submissions.priority > 0
            ? () => onCellClick?.('submissions', metrics.memberId, 'priority')
            : undefined
        }
      />
      <MatrixCell
        value={metrics.jobs.open}
        onClick={
          metrics.jobs.open > 0
            ? () => onCellClick?.('jobs', metrics.memberId, 'open')
            : undefined
        }
      />
      <MatrixCell
        value={metrics.jobs.priority}
        onClick={
          metrics.jobs.priority > 0
            ? () => onCellClick?.('jobs', metrics.memberId, 'priority')
            : undefined
        }
      />
    </tr>
  )
}

/**
 * Totals row component
 */
function TotalsRow({
  data,
  onCellClick,
}: {
  data: TeamWorkspaceData
  onCellClick?: TeamSummaryMatrixProps['onCellClick']
}) {
  // Calculate totals across all members
  const totals = data.memberMetrics.reduce(
    (acc, m) => ({
      activities: {
        open: acc.activities.open + m.activities.open,
        priority: acc.activities.priority + m.activities.priority,
        overdue: acc.activities.overdue + m.activities.overdue,
      },
      submissions: {
        open: acc.submissions.open + m.submissions.open,
        priority: acc.submissions.priority + m.submissions.priority,
      },
      jobs: {
        open: acc.jobs.open + m.jobs.open,
        priority: acc.jobs.priority + m.jobs.priority,
      },
    }),
    {
      activities: { open: 0, priority: 0, overdue: 0 },
      submissions: { open: 0, priority: 0 },
      jobs: { open: 0, priority: 0 },
    }
  )

  return (
    <tr className="bg-charcoal-50 font-semibold border-t-2 border-charcoal-200">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-charcoal-200 flex items-center justify-center">
            <User className="w-4 h-4 text-charcoal-600" />
          </div>
          <span className="text-charcoal-900">Team Total</span>
        </div>
      </td>
      <MatrixCell
        value={totals.activities.open}
        onClick={totals.activities.open > 0 ? () => onCellClick?.('activities') : undefined}
      />
      <MatrixCell
        value={totals.activities.priority}
        onClick={
          totals.activities.priority > 0
            ? () => onCellClick?.('activities', undefined, 'priority')
            : undefined
        }
      />
      <MatrixCell
        value={totals.activities.overdue}
        variant="warning"
        onClick={
          totals.activities.overdue > 0
            ? () => onCellClick?.('activities', undefined, 'overdue')
            : undefined
        }
      />
      <MatrixCell
        value={totals.submissions.open}
        onClick={totals.submissions.open > 0 ? () => onCellClick?.('submissions') : undefined}
      />
      <MatrixCell
        value={totals.submissions.priority}
        onClick={
          totals.submissions.priority > 0
            ? () => onCellClick?.('submissions', undefined, 'priority')
            : undefined
        }
      />
      <MatrixCell
        value={totals.jobs.open}
        onClick={totals.jobs.open > 0 ? () => onCellClick?.('jobs') : undefined}
      />
      <MatrixCell
        value={totals.jobs.priority}
        onClick={
          totals.jobs.priority > 0
            ? () => onCellClick?.('jobs', undefined, 'priority')
            : undefined
        }
      />
    </tr>
  )
}

/**
 * Team Summary Matrix
 *
 * Displays a matrix view of work items per team member with clickable cells
 * that navigate to filtered views.
 *
 * Structure:
 * - Queue row at top (unassigned items)
 * - Member rows with metrics
 * - Totals row at bottom
 *
 * Columns:
 * - Member name
 * - Activities: Open | Priority | Overdue
 * - Submissions: Open | Priority
 * - Jobs: Open | Priority
 */
export function TeamSummaryMatrix({ data, onCellClick }: TeamSummaryMatrixProps) {
  // Build member lookup for avatar/role info
  const memberLookup = new Map(data.members.map((m) => [m.id, m]))

  return (
    <Card className="bg-white shadow-elevation-sm overflow-hidden">
      <CardHeader className="border-b border-charcoal-100">
        <CardTitle className="text-lg font-heading">Team Summary Matrix</CardTitle>
        <p className="text-sm text-charcoal-500 mt-1">
          Click on any cell to view details. Red cells indicate overdue items.
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-charcoal-50/80">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-charcoal-700 min-w-[200px]">
                  Team Member
                </th>
                <th
                  className="px-3 py-3 text-center font-medium text-charcoal-700 border-l border-charcoal-200"
                  colSpan={3}
                >
                  Activities
                </th>
                <th
                  className="px-3 py-3 text-center font-medium text-charcoal-700 border-l border-charcoal-200"
                  colSpan={2}
                >
                  Submissions
                </th>
                <th
                  className="px-3 py-3 text-center font-medium text-charcoal-700 border-l border-charcoal-200"
                  colSpan={2}
                >
                  Jobs
                </th>
              </tr>
              <tr className="bg-charcoal-50/50 text-xs uppercase tracking-wide">
                <th className="px-4 py-2 text-left text-charcoal-500"></th>
                <th className="px-3 py-2 text-center text-charcoal-500 border-l border-charcoal-200">
                  Open
                </th>
                <th className="px-3 py-2 text-center text-charcoal-500">Priority</th>
                <th className="px-3 py-2 text-center text-error-600 font-semibold">Overdue</th>
                <th className="px-3 py-2 text-center text-charcoal-500 border-l border-charcoal-200">
                  Open
                </th>
                <th className="px-3 py-2 text-center text-charcoal-500">Priority</th>
                <th className="px-3 py-2 text-center text-charcoal-500 border-l border-charcoal-200">
                  Open
                </th>
                <th className="px-3 py-2 text-center text-charcoal-500">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-100">
              {/* Queue row at top */}
              <QueueRow data={data} onCellClick={onCellClick} />

              {/* Member rows */}
              {data.memberMetrics.map((metrics) => {
                const member = memberLookup.get(metrics.memberId)
                if (!member) return null
                return (
                  <MemberRow
                    key={metrics.memberId}
                    metrics={metrics}
                    member={member}
                    onCellClick={onCellClick}
                  />
                )
              })}

              {/* Totals row */}
              <TotalsRow data={data} onCellClick={onCellClick} />
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
