'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FilterDropdown, type FilterOption } from '@/components/ui/filter-dropdown'
import { Send, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MyWorkspaceSubmission, SubmissionFilterCounts } from '@/types/workspace'

const statusColors: Record<string, string> = {
  submitted: 'bg-blue-100 text-blue-800',
  screening: 'bg-purple-100 text-purple-800',
  client_review: 'bg-amber-100 text-amber-800',
  interview_scheduled: 'bg-green-100 text-green-800',
  offer_extended: 'bg-gold-100 text-gold-800',
  offer_accepted: 'bg-success-100 text-success-800',
  rejected: 'bg-charcoal-100 text-charcoal-600',
  withdrawn: 'bg-charcoal-100 text-charcoal-600',
}

interface WorkspaceSubmissionsTableProps {
  submissions: MyWorkspaceSubmission[]
  filterCounts: SubmissionFilterCounts
}

export function WorkspaceSubmissionsTable({
  submissions,
  filterCounts,
}: WorkspaceSubmissionsTableProps) {
  const [filter, setFilter] = useState<string>('pending_action')

  // Build filter options with counts
  const filterOptions: FilterOption[] = useMemo(() => [
    { value: 'pending_action', label: 'Pending action', count: filterCounts.pending_action },
    { value: 'client_review', label: 'Awaiting client review', count: filterCounts.client_review },
    { value: 'interview_scheduled', label: 'Interview scheduled', count: filterCounts.interview_scheduled },
    { value: 'offer_stage', label: 'In offer stage', count: filterCounts.offer_stage },
    { value: 'recent', label: 'Recently submitted', count: filterCounts.recent },
    { value: 'all', label: 'All my submissions', count: filterCounts.all, separator: true },
  ], [filterCounts])

  // Client-side filtering
  const filteredSubmissions = useMemo(() => {
    let items = submissions

    switch (filter) {
      case 'pending_action':
        items = items.filter((s) => s.needsAction)
        break
      case 'client_review':
        items = items.filter((s) => s.status === 'client_review')
        break
      case 'interview_scheduled':
        items = items.filter((s) => s.hasUpcomingInterview)
        break
      case 'offer_stage':
        items = items.filter((s) => ['offer_extended', 'offer_accepted', 'offer_pending'].includes(s.status))
        break
      case 'recent':
        items = items.filter((s) => s.isRecentlySubmitted)
        break
      // 'all' shows everything
    }

    return items.slice(0, 10) // Limit to 10 for dashboard view
  }, [submissions, filter])

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">My Submissions</CardTitle>
          <FilterDropdown
            options={filterOptions}
            value={filter}
            onChange={setFilter}
            label="Filter"
            storageKey="my-workspace-submissions-filter"
          />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {filteredSubmissions.length === 0 ? (
          <div className="text-center py-8">
            <Send className="w-12 h-12 text-charcoal-300 mx-auto mb-3" />
            <p className="text-charcoal-500">No submissions found</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Job</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="w-32">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <Link
                        href={`/employee/recruiting/submissions/${submission.id}`}
                        className="font-medium hover:text-gold-600 transition-colors"
                      >
                        {submission.candidate?.name || 'Unknown'}
                      </Link>
                      {submission.candidate?.title && (
                        <p className="text-sm text-charcoal-500">{submission.candidate.title}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      {submission.job?.title || '-'}
                    </TableCell>
                    <TableCell className="text-sm text-charcoal-600">
                      {submission.job?.company?.name || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(statusColors[submission.status] || statusColors.submitted)}>
                        {submission.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 flex justify-end">
              <Link
                href="/employee/workspace/desktop?tab=submissions"
                className="text-sm text-gold-600 hover:text-gold-700 flex items-center gap-1"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
