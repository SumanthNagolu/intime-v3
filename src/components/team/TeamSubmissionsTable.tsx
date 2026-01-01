'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Send,
  Search,
  ExternalLink,
  Building2,
  User,
  Briefcase,
  Clock,
  Calendar,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import type {
  TeamWorkspaceSubmission,
  TeamMember,
  SubmissionFilterCounts,
} from '@/types/workspace'

const statusColors: Record<string, string> = {
  draft: 'bg-charcoal-100 text-charcoal-600',
  submitted: 'bg-blue-100 text-blue-800',
  screening: 'bg-cyan-100 text-cyan-800',
  client_review: 'bg-amber-100 text-amber-800',
  reviewing: 'bg-amber-100 text-amber-800',
  shortlisted: 'bg-purple-100 text-purple-800',
  interviewing: 'bg-indigo-100 text-indigo-800',
  offered: 'bg-green-100 text-green-800',
  offer_extended: 'bg-green-100 text-green-800',
  offer_accepted: 'bg-emerald-100 text-emerald-800',
  placed: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
  withdrawn: 'bg-charcoal-100 text-charcoal-600',
}

interface TeamSubmissionsTableProps {
  submissions: TeamWorkspaceSubmission[]
  members: TeamMember[]
  filterCounts: SubmissionFilterCounts
  initialMemberId?: string
  initialFilter?: string
}

export function TeamSubmissionsTable({
  submissions,
  members,
  filterCounts,
  initialMemberId,
  initialFilter,
}: TeamSubmissionsTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>(initialFilter || 'active')
  const [memberFilter, setMemberFilter] = useState<string>(initialMemberId || 'all')

  // Filter submissions client-side
  const filteredSubmissions = useMemo(() => {
    let items = [...submissions]

    // Apply member filter
    if (memberFilter !== 'all') {
      items = items.filter((s) => s.submittedBy?.id === memberFilter)
    }

    // Apply status filter
    if (statusFilter === 'active') {
      items = items.filter((s) =>
        ['submitted', 'screening', 'client_review', 'reviewing', 'shortlisted', 'interviewing', 'offered', 'offer_extended'].includes(s.status)
      )
    } else if (statusFilter === 'interview') {
      items = items.filter((s) => s.hasUpcomingInterview)
    } else if (statusFilter !== 'all') {
      items = items.filter((s) => s.status === statusFilter)
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      items = items.filter((s) => {
        const candidateName = s.candidate?.name?.toLowerCase() ?? ''
        const jobTitle = s.job?.title?.toLowerCase() ?? ''
        const accountName = s.job?.company?.name?.toLowerCase() ?? ''
        return (
          candidateName.includes(searchLower) ||
          jobTitle.includes(searchLower) ||
          accountName.includes(searchLower)
        )
      })
    }

    return items
  }, [submissions, search, statusFilter, memberFilter])

  return (
    <Card className="bg-white shadow-elevation-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-heading">
            Team Submissions
            {filteredSubmissions.length > 0 && (
              <span className="ml-2 text-sm font-normal text-charcoal-500">
                ({filteredSubmissions.length})
              </span>
            )}
          </CardTitle>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <div className="flex-1 relative min-w-[200px]">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-charcoal-400" />
            <Input
              placeholder="Search submissions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={memberFilter} onValueChange={setMemberFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Members" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Members</SelectItem>
              {members.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active ({filterCounts.pending_action})</SelectItem>
              <SelectItem value="interview">With Interview ({filterCounts.interview_scheduled})</SelectItem>
              <SelectItem value="all">All Status ({filterCounts.all})</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="client_review">Client Review</SelectItem>
              <SelectItem value="interviewing">Interviewing</SelectItem>
              <SelectItem value="offered">Offered</SelectItem>
              <SelectItem value="placed">Placed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {filteredSubmissions.length === 0 ? (
          <div className="text-center py-8">
            <Send className="w-12 h-12 text-charcoal-300 mx-auto mb-3" />
            <p className="text-charcoal-500">No submissions found</p>
            <p className="text-sm text-charcoal-400">
              {search
                ? 'Try a different search term'
                : 'Adjust filters to see more submissions.'}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Job</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Submitted By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Last Update</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.map((submission) => (
                <TableRow key={submission.id} className="group">
                  <TableCell>
                    <Link
                      href={`/employee/recruiting/candidates/${submission.candidate?.id}`}
                      className="block"
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-charcoal-400" />
                        <span className="font-medium text-charcoal-900 group-hover:text-hublot-700">
                          {submission.candidate?.name || 'Unknown'}
                        </span>
                      </div>
                      {submission.candidate?.title && (
                        <div className="text-sm text-charcoal-500 pl-6">
                          {submission.candidate.title}
                        </div>
                      )}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {submission.job ? (
                      <Link
                        href={`/employee/recruiting/jobs/${submission.job.id}`}
                        className="flex items-center gap-1 text-charcoal-600 hover:text-hublot-700"
                      >
                        <Briefcase className="w-3 h-3" />
                        <span className="truncate max-w-[200px]">
                          {submission.job.title}
                        </span>
                      </Link>
                    ) : (
                      <span className="text-charcoal-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {submission.job?.company ? (
                      <Link
                        href={`/employee/recruiting/accounts/${submission.job.company.id}`}
                        className="flex items-center gap-1 text-charcoal-600 hover:text-hublot-700"
                      >
                        <Building2 className="w-3 h-3" />
                        {submission.job.company.name}
                      </Link>
                    ) : (
                      <span className="text-charcoal-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {submission.submittedBy ? (
                      <div className="flex items-center gap-1 text-charcoal-600">
                        <User className="w-3 h-3" />
                        {submission.submittedBy.name}
                      </div>
                    ) : (
                      <span className="text-charcoal-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={cn(
                          statusColors[submission.status] || statusColors.draft
                        )}
                      >
                        {submission.status.replace('_', ' ')}
                      </Badge>
                      {submission.hasUpcomingInterview && (
                        <span title="Has upcoming interview">
                          <Calendar className="w-4 h-4 text-indigo-500" />
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {submission.submittedAt ? (
                      <div className="flex items-center gap-1 text-charcoal-600">
                        <Calendar className="w-3 h-3" />
                        {formatDistanceToNow(new Date(submission.submittedAt), {
                          addSuffix: true,
                        })}
                      </div>
                    ) : (
                      <span className="text-charcoal-400">Not submitted</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {submission.updatedAt ? (
                      <div className="flex items-center gap-1 text-charcoal-600">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(submission.updatedAt), {
                          addSuffix: true,
                        })}
                      </div>
                    ) : (
                      <span className="text-charcoal-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Link href={`/employee/recruiting/jobs/${submission.job?.id}?tab=pipeline`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
