'use client'

import { Building2, Briefcase, User, MapPin, Phone, Mail, Calendar, DollarSign, Link as LinkIcon } from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { FullSubmission } from '@/types/submission'
import { SUBMISSION_STATUS_CONFIG } from '@/configs/entities/submissions.config'

interface TransactionContextHeaderProps {
  submission: FullSubmission
  onQuickAction?: (action: string) => void
}

export function TransactionContextHeader({
  submission,
  onQuickAction,
}: TransactionContextHeaderProps) {
  const candidate = submission.candidate
  const job = submission.job
  const account = submission.account
  const owner = submission.owner

  const statusConfig = SUBMISSION_STATUS_CONFIG[submission.status] || {
    label: submission.status,
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-700',
  }

  // Calculate days in pipeline
  const daysInPipeline = (() => {
    const dateStr = submission.submitted_at || submission.created_at
    if (!dateStr) return 0
    const submitted = new Date(dateStr)
    const now = new Date()
    return Math.floor((now.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24))
  })()

  // Get candidate initials
  const candidateInitials = candidate
    ? `${candidate.first_name?.charAt(0) || ''}${candidate.last_name?.charAt(0) || ''}`
    : '?'

  return (
    <div className="bg-gradient-to-r from-charcoal-50 to-white border-b border-charcoal-200">
      {/* Main Context Bar */}
      <div className="px-6 py-4">
        <div className="flex items-start gap-6">
          {/* Candidate Card */}
          <div className="flex items-start gap-3 min-w-[280px]">
            <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
              <AvatarImage src={candidate?.avatar_url || undefined} alt={candidate?.full_name || ''} />
              <AvatarFallback className="bg-gold-100 text-gold-700 font-semibold">
                {candidateInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Link
                  href={`/employee/recruiting/candidates/${candidate?.id}`}
                  className="font-semibold text-charcoal-900 hover:text-gold-600 truncate"
                >
                  {candidate ? `${candidate.first_name} ${candidate.last_name}` : 'Unknown Candidate'}
                </Link>
                {candidate?.linkedin_url && (
                  <a
                    href={candidate.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700"
                    title="LinkedIn Profile"
                  >
                    <LinkIcon className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
              <p className="text-sm text-charcoal-600 truncate">{candidate?.title || 'No title'}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-charcoal-500">
                {candidate?.email && (
                  <a href={`mailto:${candidate.email}`} className="flex items-center gap-1 hover:text-gold-600">
                    <Mail className="h-3 w-3" />
                    <span className="truncate max-w-[120px]">{candidate.email}</span>
                  </a>
                )}
                {candidate?.phone && (
                  <a href={`tel:${candidate.phone}`} className="flex items-center gap-1 hover:text-gold-600">
                    <Phone className="h-3 w-3" />
                    <span>{candidate.phone}</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Separator */}
          <div className="h-12 w-px bg-charcoal-200" />

          {/* Job Card */}
          <div className="flex-1 min-w-[240px] max-w-[320px]">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-charcoal-400" />
              <Link
                href={`/employee/recruiting/jobs/${job?.id}`}
                className="font-semibold text-charcoal-900 hover:text-gold-600 truncate"
              >
                {job?.title || 'Unknown Job'}
              </Link>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Building2 className="h-3.5 w-3.5 text-charcoal-400" />
              <Link
                href={`/employee/recruiting/accounts/${account?.id}`}
                className="text-sm text-charcoal-600 hover:text-gold-600 truncate"
              >
                {account?.name || 'Unknown Account'}
              </Link>
            </div>
            {(job?.location_city || job?.location_state) && (
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="h-3.5 w-3.5 text-charcoal-400" />
                <span className="text-xs text-charcoal-500">
                  {[job.location_city, job.location_state].filter(Boolean).join(', ')}
                </span>
              </div>
            )}
          </div>

          {/* Separator */}
          <div className="h-12 w-px bg-charcoal-200" />

          {/* Metrics */}
          <div className="flex items-center gap-6">
            {/* Bill Rate */}
            <div className="text-center">
              <p className="text-xs text-charcoal-500 uppercase tracking-wide">Bill Rate</p>
              <p className="text-lg font-semibold text-charcoal-900">
                {submission.bill_rate ? `$${submission.bill_rate}/hr` : '—'}
              </p>
            </div>

            {/* Match Score */}
            <div className="text-center">
              <p className="text-xs text-charcoal-500 uppercase tracking-wide">Match</p>
              <p className={cn(
                'text-lg font-semibold',
                submission.match_score && submission.match_score >= 80
                  ? 'text-green-600'
                  : submission.match_score && submission.match_score >= 60
                  ? 'text-amber-600'
                  : 'text-charcoal-900'
              )}>
                {submission.match_score ? `${submission.match_score}%` : '—'}
              </p>
            </div>

            {/* Days in Pipeline */}
            <div className="text-center">
              <p className="text-xs text-charcoal-500 uppercase tracking-wide">Days</p>
              <p className={cn(
                'text-lg font-semibold',
                daysInPipeline > 14 ? 'text-red-600' : daysInPipeline > 7 ? 'text-amber-600' : 'text-charcoal-900'
              )}>
                {daysInPipeline}
              </p>
            </div>
          </div>

          {/* Separator */}
          <div className="h-12 w-px bg-charcoal-200" />

          {/* Status & Owner */}
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs text-charcoal-500 uppercase tracking-wide mb-1">Status</p>
              <span
                className={cn(
                  'inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium',
                  statusConfig.bgColor,
                  statusConfig.textColor
                )}
              >
                {statusConfig.label}
              </span>
            </div>

            {owner && (
              <div>
                <p className="text-xs text-charcoal-500 uppercase tracking-wide mb-1">Owner</p>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={owner.avatar_url || undefined} alt={owner.full_name} />
                    <AvatarFallback className="text-xs bg-charcoal-100">
                      {owner.full_name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-charcoal-700 truncate max-w-[100px]">
                    {owner.full_name}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 ml-auto">
            {submission.status !== 'placed' && submission.status !== 'rejected' && submission.status !== 'withdrawn' && (
              <Button
                variant="default"
                size="sm"
                onClick={() => onQuickAction?.('advance')}
                className="text-xs"
              >
                Advance Stage
              </Button>
            )}
            {(submission.status === 'client_review' || submission.status === 'interview_scheduled') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onQuickAction?.('schedule-interview')}
                className="text-xs"
              >
                <Calendar className="h-3.5 w-3.5 mr-1" />
                Schedule Interview
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
