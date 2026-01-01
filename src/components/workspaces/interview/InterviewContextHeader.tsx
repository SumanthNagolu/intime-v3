'use client'

import {
  Building2,
  Briefcase,
  Calendar,
  Clock,
  Video,
  Phone,
  Mail,
  FileText,
} from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { FullInterview } from '@/types/interview'
import { INTERVIEW_STATUS_CONFIG, INTERVIEW_TYPE_CONFIG } from '@/configs/entities/interviews.config'

interface InterviewContextHeaderProps {
  interview: FullInterview
  onQuickAction?: (action: string) => void
}

export function InterviewContextHeader({
  interview,
  onQuickAction,
}: InterviewContextHeaderProps) {
  const submission = interview.submission
  const candidate = submission?.candidate
  const job = submission?.job || interview.job
  const account = interview.account

  const interviewStatus = interview.status as string
  const interviewType = interview.interview_type as string

  const statusConfig = INTERVIEW_STATUS_CONFIG[interviewStatus] || {
    label: interviewStatus,
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-700',
  }

  const typeLabel = interviewType?.replace(/_/g, ' ') || 'Interview'
  const typeConfig = INTERVIEW_TYPE_CONFIG[interviewType] || {
    label: typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1),
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
  }

  const scheduledAt = interview.scheduled_at as string | undefined
  const meetingLink = interview.meeting_link as string | undefined
  const durationMinutes = interview.duration_minutes as number | undefined
  const roundNumber = interview.round_number as number | undefined
  const interviewerNames = interview.interviewer_names as string[] | undefined

  // Calculate time until interview
  const timeUntil = (() => {
    if (!scheduledAt) return null
    const scheduled = new Date(scheduledAt)
    const now = new Date()
    const diff = scheduled.getTime() - now.getTime()
    if (diff < 0) return 'Past'
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours < 1) return `${Math.floor(diff / (1000 * 60))}m`
    if (hours < 24) return `${hours}h`
    return `${Math.floor(hours / 24)}d`
  })()

  // Format date/time
  const formattedDateTime = scheduledAt
    ? new Date(scheduledAt).toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
      })
    : 'Not scheduled'

  // Candidate initials
  const candidateInitials = candidate
    ? `${candidate.first_name?.charAt(0) || ''}${candidate.last_name?.charAt(0) || ''}`
    : '?'

  return (
    <div className="bg-gradient-to-r from-charcoal-50 to-white border-b border-charcoal-200">
      {/* Main Context Bar */}
      <div className="px-6 py-4">
        <div className="flex items-start gap-6">
          {/* Interview Info */}
          <div className="flex items-center gap-3 min-w-[200px]">
            <div className={cn(
              'h-12 w-12 rounded-lg flex items-center justify-center',
              typeConfig.bgColor || 'bg-purple-100'
            )}>
              <Calendar className={cn('h-6 w-6', typeConfig.textColor || 'text-purple-700')} />
            </div>
            <div>
              <p className="font-semibold text-charcoal-900">{typeConfig.label}</p>
              <p className="text-sm text-charcoal-600">Round {roundNumber || 1}</p>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="h-3.5 w-3.5 text-charcoal-400" />
                <span className="text-xs text-charcoal-500">{formattedDateTime}</span>
              </div>
            </div>
          </div>

          {/* Separator */}
          <div className="h-14 w-px bg-charcoal-200" />

          {/* Candidate Card */}
          <div className="flex items-start gap-3 min-w-[240px]">
            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
              <AvatarImage src={candidate?.avatar_url || undefined} alt={candidate?.full_name || ''} />
              <AvatarFallback className="bg-gold-100 text-gold-700 font-semibold text-sm">
                {candidateInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Link
                  href={`/employee/recruiting/candidates/${candidate?.id}`}
                  className="font-medium text-charcoal-900 hover:text-gold-600 truncate text-sm"
                >
                  {candidate ? `${candidate.first_name} ${candidate.last_name}` : 'Unknown'}
                </Link>
              </div>
              <p className="text-xs text-charcoal-500 truncate">{candidate?.title || 'Candidate'}</p>
              <div className="flex items-center gap-2 mt-1">
                {candidate?.email && (
                  <a href={`mailto:${candidate.email}`} className="text-charcoal-400 hover:text-gold-600">
                    <Mail className="h-3 w-3" />
                  </a>
                )}
                {candidate?.phone && (
                  <a href={`tel:${candidate.phone}`} className="text-charcoal-400 hover:text-gold-600">
                    <Phone className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Separator */}
          <div className="h-14 w-px bg-charcoal-200" />

          {/* Job + Account Card */}
          <div className="flex-1 min-w-[200px] max-w-[280px]">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-charcoal-400" />
              <Link
                href={`/employee/recruiting/jobs/${job?.id}`}
                className="font-medium text-charcoal-900 hover:text-gold-600 truncate text-sm"
              >
                {job?.title || 'Unknown Job'}
              </Link>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Building2 className="h-3.5 w-3.5 text-charcoal-400" />
              <Link
                href={`/employee/recruiting/accounts/${account?.id}`}
                className="text-xs text-charcoal-600 hover:text-gold-600 truncate"
              >
                {account?.name || 'Unknown Account'}
              </Link>
            </div>
            {submission && (
              <div className="flex items-center gap-2 mt-1">
                <FileText className="h-3.5 w-3.5 text-charcoal-400" />
                <Link
                  href={`/employee/recruiting/submissions/${submission.id}`}
                  className="text-xs text-charcoal-500 hover:text-gold-600"
                >
                  View Submission
                </Link>
              </div>
            )}
          </div>

          {/* Separator */}
          <div className="h-14 w-px bg-charcoal-200" />

          {/* Metrics */}
          <div className="flex items-center gap-6">
            {/* Time Until */}
            {timeUntil && (
              <div className="text-center">
                <p className="text-xs text-charcoal-500 uppercase tracking-wide">In</p>
                <p className={cn(
                  'text-lg font-semibold',
                  timeUntil === 'Past' ? 'text-charcoal-400' : 'text-charcoal-900'
                )}>
                  {timeUntil}
                </p>
              </div>
            )}

            {/* Duration */}
            <div className="text-center">
              <p className="text-xs text-charcoal-500 uppercase tracking-wide">Duration</p>
              <p className="text-lg font-semibold text-charcoal-900">
                {durationMinutes ? `${durationMinutes}m` : '—'}
              </p>
            </div>

            {/* Participants */}
            <div className="text-center">
              <p className="text-xs text-charcoal-500 uppercase tracking-wide">Participants</p>
              <p className="text-lg font-semibold text-charcoal-900">
                {interview.sections?.participants?.total || interviewerNames?.length || 0}
              </p>
            </div>
          </div>

          {/* Separator */}
          <div className="h-14 w-px bg-charcoal-200" />

          {/* Status */}
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

          {/* Quick Actions */}
          <div className="flex items-center gap-2 ml-auto">
            {meetingLink && interviewStatus !== 'completed' && (
              <Button
                variant="default"
                size="sm"
                onClick={() => window.open(meetingLink, '_blank')}
                className="text-xs"
              >
                <Video className="h-3.5 w-3.5 mr-1" />
                Join
              </Button>
            )}
            {['scheduled', 'confirmed'].includes(interviewStatus) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onQuickAction?.('reschedule')}
                className="text-xs"
              >
                Reschedule
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
