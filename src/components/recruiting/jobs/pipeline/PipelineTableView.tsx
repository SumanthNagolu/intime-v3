'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { ArrowUpDown, ArrowUp, ArrowDown, Star, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PIPELINE_STAGES, getStageFromStatus } from '@/lib/pipeline/stages'
import type { Submission } from '@/configs/entities/submissions.config'

interface PipelineTableViewProps {
  submissions: Submission[]
  onRefresh?: () => void
}

type SortKey = 'candidate' | 'stage' | 'match' | 'days' | 'updated'
type SortOrder = 'asc' | 'desc'

export function PipelineTableView({ submissions }: PipelineTableViewProps) {
  const router = useRouter()
  const [sortKey, setSortKey] = useState<SortKey>('updated')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortOrder('desc')
    }
  }

  const sortedSubmissions = useMemo(() => {
    const filtered = submissions.filter((s) => !['rejected', 'withdrawn'].includes(s.status))

    return [...filtered].sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'candidate':
          const nameA = a.candidate ? `${a.candidate.first_name} ${a.candidate.last_name}` : ''
          const nameB = b.candidate ? `${b.candidate.first_name} ${b.candidate.last_name}` : ''
          cmp = nameA.localeCompare(nameB)
          break
        case 'stage':
          cmp = PIPELINE_STAGES.findIndex((s) => s.id === getStageFromStatus(a.status)) -
                PIPELINE_STAGES.findIndex((s) => s.id === getStageFromStatus(b.status))
          break
        case 'match':
          cmp = (a.ai_match_score || 0) - (b.ai_match_score || 0)
          break
        case 'days':
          const daysA = a.stage_changed_at ? Date.now() - new Date(a.stage_changed_at).getTime() : 0
          const daysB = b.stage_changed_at ? Date.now() - new Date(b.stage_changed_at).getTime() : 0
          cmp = daysA - daysB
          break
        case 'updated':
          cmp = new Date(a.updated_at || a.created_at).getTime() -
                new Date(b.updated_at || b.created_at).getTime()
          break
      }
      return sortOrder === 'asc' ? cmp : -cmp
    })
  }, [submissions, sortKey, sortOrder])

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) return <ArrowUpDown className="w-4 h-4 text-charcoal-400" />
    return sortOrder === 'asc'
      ? <ArrowUp className="w-4 h-4 text-gold-600" />
      : <ArrowDown className="w-4 h-4 text-gold-600" />
  }

  const handleViewSubmission = (id: string) => {
    router.push(`/employee/recruiting/submissions/${id}`)
  }

  return (
    <div className="rounded-lg border border-charcoal-200 bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-charcoal-50 hover:bg-charcoal-50">
            <TableHead className="w-[280px]">
              <button
                onClick={() => handleSort('candidate')}
                className="flex items-center gap-1 hover:text-gold-600 transition-colors"
              >
                Candidate <SortIcon columnKey="candidate" />
              </button>
            </TableHead>
            <TableHead className="w-[140px]">
              <button
                onClick={() => handleSort('stage')}
                className="flex items-center gap-1 hover:text-gold-600 transition-colors"
              >
                Stage <SortIcon columnKey="stage" />
              </button>
            </TableHead>
            <TableHead className="w-[100px] text-center">
              <button
                onClick={() => handleSort('match')}
                className="flex items-center gap-1 hover:text-gold-600 transition-colors"
              >
                Match <SortIcon columnKey="match" />
              </button>
            </TableHead>
            <TableHead className="w-[100px]">Rating</TableHead>
            <TableHead className="w-[120px]">
              <button
                onClick={() => handleSort('days')}
                className="flex items-center gap-1 hover:text-gold-600 transition-colors"
              >
                In Stage <SortIcon columnKey="days" />
              </button>
            </TableHead>
            <TableHead className="w-[140px]">
              <button
                onClick={() => handleSort('updated')}
                className="flex items-center gap-1 hover:text-gold-600 transition-colors"
              >
                Updated <SortIcon columnKey="updated" />
              </button>
            </TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedSubmissions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12 text-charcoal-500">
                No submissions in pipeline
              </TableCell>
            </TableRow>
          ) : (
            sortedSubmissions.map((submission) => {
              const candidate = submission.candidate
              const candidateName = candidate
                ? `${candidate.first_name} ${candidate.last_name}`.trim()
                : 'Unknown'
              const initials = candidate
                ? `${candidate.first_name?.[0] || ''}${candidate.last_name?.[0] || ''}`
                : '?'
              const stage = PIPELINE_STAGES.find((s) => s.id === getStageFromStatus(submission.status))
              const daysInStage = submission.stage_changed_at
                ? Math.floor((Date.now() - new Date(submission.stage_changed_at).getTime()) / (1000 * 60 * 60 * 24))
                : 0
              const rating = submission.ai_match_score ? Math.round(submission.ai_match_score / 20) : null

              return (
                <TableRow
                  key={submission.id}
                  className="hover:bg-cream cursor-pointer"
                  onClick={() => handleViewSubmission(submission.id)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={candidate?.avatar_url || undefined} />
                        <AvatarFallback className="text-xs bg-gold-100 text-gold-700">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-charcoal-900">{candidateName}</div>
                        {candidate?.email && (
                          <div className="text-xs text-charcoal-500">{candidate.email}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {stage && (
                      <Badge
                        className={cn('font-medium', stage.color, stage.textColor)}
                        variant="secondary"
                      >
                        {stage.label}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {submission.ai_match_score ? (
                      <Badge variant="outline" className="font-mono">
                        {submission.ai_match_score}%
                      </Badge>
                    ) : (
                      <span className="text-charcoal-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {rating ? (
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              'w-3 h-3',
                              i < rating ? 'fill-gold-400 text-gold-400' : 'text-charcoal-300'
                            )}
                          />
                        ))}
                      </div>
                    ) : (
                      <span className="text-charcoal-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      'text-sm',
                      daysInStage > 7 ? 'text-warning-600' : 'text-charcoal-600'
                    )}>
                      {daysInStage} day{daysInStage !== 1 ? 's' : ''}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-charcoal-500">
                    {formatDistanceToNow(new Date(submission.updated_at || submission.created_at), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleViewSubmission(submission.id)
                      }}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
