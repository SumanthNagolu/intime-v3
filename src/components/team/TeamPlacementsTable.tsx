'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
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
  CheckCircle2,
  Search,
  Building2,
  User,
  Briefcase,
  Calendar,
  AlertTriangle,
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import type { TeamWorkspacePlacement, TeamMember } from '@/types/workspace'

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  active: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  terminated: 'bg-red-100 text-red-800',
  canceled: 'bg-charcoal-100 text-charcoal-600',
}

interface TeamPlacementsTableProps {
  placements: TeamWorkspacePlacement[]
  members: TeamMember[]
  initialMemberId?: string
  initialFilter?: string
}

export function TeamPlacementsTable({
  placements,
  members,
  initialMemberId,
  initialFilter,
}: TeamPlacementsTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>(initialFilter || 'active')
  const [memberFilter, setMemberFilter] = useState<string>(initialMemberId || 'all')

  // Filter placements client-side
  const filteredPlacements = useMemo(() => {
    let items = [...placements]

    // Apply member filter
    if (memberFilter !== 'all') {
      items = items.filter((p) => p.recruiter?.id === memberFilter)
    }

    // Apply status filter
    if (statusFilter === 'ending_soon') {
      items = items.filter((p) => p.isEndingSoon)
    } else if (statusFilter !== 'all') {
      items = items.filter((p) => p.status === statusFilter)
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      items = items.filter((p) => {
        const candidateName = p.candidateName?.toLowerCase() ?? ''
        const jobTitle = p.jobTitle?.toLowerCase() ?? ''
        const accountName = p.accountName?.toLowerCase() ?? ''
        return (
          candidateName.includes(searchLower) ||
          jobTitle.includes(searchLower) ||
          accountName.includes(searchLower)
        )
      })
    }

    return items
  }, [placements, search, statusFilter, memberFilter])

  // Stats
  const activeCount = placements.filter((p) => p.status === 'active').length
  const endingSoonCount = placements.filter((p) => p.isEndingSoon).length

  return (
    <Card className="bg-white shadow-elevation-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-heading">
            Team Placements
            {filteredPlacements.length > 0 && (
              <span className="ml-2 text-sm font-normal text-charcoal-500">
                ({filteredPlacements.length})
              </span>
            )}
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-charcoal-500">
            <span>{activeCount} active</span>
            {endingSoonCount > 0 && (
              <span className="text-warning-600">{endingSoonCount} ending soon</span>
            )}
          </div>
        </div>
        {endingSoonCount > 0 && statusFilter !== 'ending_soon' && (
          <div className="mt-3 p-3 bg-warning-50 border border-warning-200 rounded-lg text-warning-700 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>{endingSoonCount} {endingSoonCount === 1 ? 'placement' : 'placements'} ending within 30 days</span>
            </div>
            <button
              className="text-warning-700 underline text-sm"
              onClick={() => setStatusFilter('ending_soon')}
            >
              View ending soon
            </button>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <div className="flex-1 relative min-w-[200px]">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-charcoal-400" />
            <Input
              placeholder="Search placements..."
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
              <SelectItem value="active">Active ({activeCount})</SelectItem>
              <SelectItem value="ending_soon">Ending Soon ({endingSoonCount})</SelectItem>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="terminated">Terminated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {filteredPlacements.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-12 h-12 text-charcoal-300 mx-auto mb-3" />
            <p className="text-charcoal-500">No placements found</p>
            <p className="text-sm text-charcoal-400">
              {search
                ? 'Try a different search term'
                : 'Adjust filters to see more placements.'}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Job</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Recruiter</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlacements.map((placement) => (
                <TableRow
                  key={placement.id}
                  className={cn('group', placement.isEndingSoon && 'bg-warning-50/30')}
                >
                  <TableCell>
                    <Link
                      href={`/employee/recruiting/placements/${placement.id}`}
                      className="flex items-center gap-2 hover:text-hublot-700"
                    >
                      <User className="w-4 h-4 text-charcoal-400" />
                      <span className="font-medium text-charcoal-900">
                        {placement.candidateName}
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-charcoal-600">
                      <Briefcase className="w-3 h-3" />
                      {placement.jobTitle}
                    </div>
                  </TableCell>
                  <TableCell>
                    {placement.accountName ? (
                      <div className="flex items-center gap-1 text-charcoal-600">
                        <Building2 className="w-3 h-3" />
                        {placement.accountName}
                      </div>
                    ) : (
                      <span className="text-charcoal-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {placement.recruiter ? (
                      <div className="flex items-center gap-1 text-charcoal-600">
                        <User className="w-3 h-3" />
                        {placement.recruiter.name}
                      </div>
                    ) : (
                      <span className="text-charcoal-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-charcoal-600">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(placement.startDate), 'MMM d, yyyy')}
                    </div>
                  </TableCell>
                  <TableCell>
                    {placement.endDate ? (
                      <div className={cn(
                        'flex items-center gap-1',
                        placement.isEndingSoon ? 'text-warning-600 font-medium' : 'text-charcoal-600'
                      )}>
                        {placement.isEndingSoon && <AlertTriangle className="w-3 h-3" />}
                        <Calendar className="w-3 h-3" />
                        {format(new Date(placement.endDate), 'MMM d, yyyy')}
                        {placement.isEndingSoon && (
                          <span className="text-xs ml-1">
                            ({formatDistanceToNow(new Date(placement.endDate), { addSuffix: true })})
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-charcoal-400">Ongoing</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        statusColors[placement.status] || statusColors.pending
                      )}
                    >
                      {placement.status}
                    </Badge>
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
