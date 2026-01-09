'use client'

/**
 * PCF-Compatible Section Adapters for Interviews
 *
 * Uses ONE database call pattern - data comes from context via entity prop
 */

import { Interview, INTERVIEW_TYPE_CONFIG, INTERVIEW_OUTCOME_CONFIG } from '../interviews.config'
import type {
  FullInterview,
  InterviewParticipant,
  InterviewFeedbackEntry,
  InterviewNote,
  InterviewDocument,
  InterviewHistoryEntry,
} from '@/types/interview'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { format, formatDistanceToNow } from 'date-fns'
import {
  User,
  Building2,
  Calendar,
  Clock,
  Video,
  MapPin,
  FileText,
  ThumbsUp,
  ThumbsDown,
  Activity,
  Users,
  Plus,
  StickyNote,
  History,
  CheckCircle,
  XCircle,
  Star,
  Mail,
  Phone,
} from 'lucide-react'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { AddressDisplay } from '@/components/addresses'
import { cn } from '@/lib/utils'

// Note: The new section components (InterviewParticipantsSectionPCF, InterviewFeedbackEnhancedSectionPCF,
// InterviewNotesSectionPCF, InterviewDocumentsSectionPCF, InterviewHistorySectionPCF) use the ONE database
// call pattern - they receive data from entity context instead of making independent queries.

interface PCFSectionProps {
  entityId: string
  entity?: unknown
}

/**
 * Overview Section
 */
export function InterviewOverviewSectionPCF({ entityId: _entityId, entity }: PCFSectionProps) {
  const interview = entity as Interview | undefined

  if (!interview) return null

  const typeConfig = INTERVIEW_TYPE_CONFIG[interview.interview_type] || {}

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left - Main info */}
      <div className="col-span-2 space-y-6">
        {/* Interview Details Card */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Interview Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-charcoal-500">Type</span>
                <p className="font-medium flex items-center gap-2">
                  {typeConfig.icon && <typeConfig.icon className="w-4 h-4" />}
                  {typeConfig.label || interview.interview_type}
                </p>
              </div>
              <div>
                <span className="text-sm text-charcoal-500">Duration</span>
                <p className="font-medium">{interview.duration_minutes} minutes</p>
              </div>
              <div>
                <span className="text-sm text-charcoal-500">Scheduled For</span>
                <p className="font-medium">
                  {format(new Date(interview.scheduled_at), 'EEEE, MMMM d, yyyy')}
                </p>
                <p className="text-sm text-charcoal-500">
                  {format(new Date(interview.scheduled_at), 'h:mm a')}
                </p>
              </div>
              <div>
                <span className="text-sm text-charcoal-500">Location</span>
                <p className="font-medium flex items-center gap-2">
                  {interview.meeting_link ? (
                    <>
                      <Video className="w-4 h-4" />
                      <a href={interview.meeting_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Virtual Meeting
                      </a>
                    </>
                  ) : interview.location ? (
                    <>
                      <MapPin className="w-4 h-4" />
                      {interview.location}
                    </>
                  ) : (
                    'TBD'
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Candidate & Job Info */}
        {interview.submission && (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Candidate & Job
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {interview.submission.candidate && (
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-charcoal-500">Candidate</span>
                    <Link 
                      href={`/employee/recruiting/candidates/${interview.submission.candidate.id}`}
                      className="block text-lg font-medium text-hublot-900 hover:underline"
                    >
                      {interview.submission.candidate.first_name} {interview.submission.candidate.last_name}
                    </Link>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/employee/recruiting/candidates/${interview.submission.candidate.id}`}>
                      View Profile
                    </Link>
                  </Button>
                </div>
              )}
              {interview.submission.job && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <span className="text-sm text-charcoal-500">Job</span>
                    <Link 
                      href={`/employee/recruiting/jobs/${interview.submission.job.id}`}
                      className="block text-lg font-medium text-hublot-900 hover:underline"
                    >
                      {interview.submission.job.title}
                    </Link>
                    {interview.submission.job.account && (
                      <p className="text-sm text-charcoal-500 flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {interview.submission.job.account.name}
                      </p>
                    )}
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/employee/recruiting/jobs/${interview.submission.job.id}`}>
                      View Job
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {interview.notes && (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-charcoal-700 whitespace-pre-wrap">{interview.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right - Interviewers & Actions */}
      <div className="space-y-6">
        {/* Interviewers */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Interviewers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {interview.interviewers && interview.interviewers.length > 0 ? (
              <div className="space-y-3">
                {interview.interviewers.map((interviewer) => (
                  <div key={interviewer.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-charcoal-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-charcoal-600" />
                    </div>
                    <div>
                      <p className="font-medium">{interviewer.name}</p>
                      {interviewer.email && (
                        <p className="text-sm text-charcoal-500">{interviewer.email}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-charcoal-500">No interviewers assigned</p>
            )}
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-charcoal-500">Created</span>
              <span className="font-medium">
                {formatDistanceToNow(new Date(interview.created_at), { addSuffix: true })}
              </span>
            </div>
            {interview.completed_at && (
              <div className="flex justify-between text-sm">
                <span className="text-charcoal-500">Completed</span>
                <span className="font-medium">
                  {format(new Date(interview.completed_at), 'MMM d, yyyy h:mm a')}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/**
 * Feedback Section
 */
export function InterviewFeedbackSectionPCF({ entityId, entity }: PCFSectionProps) {
  const interview = entity as Interview | undefined

  if (!interview) return null

  return (
    <div className="space-y-6">
      {interview.feedback || interview.recommendation ? (
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ThumbsUp className="w-5 h-5" />
              Interview Feedback
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {interview.recommendation && (
              <div>
                <span className="text-sm text-charcoal-500">Recommendation</span>
                <Badge className={
                  interview.recommendation === 'hire' || interview.recommendation === 'strong_hire'
                    ? 'bg-green-100 text-green-800'
                    : interview.recommendation === 'no_hire'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                }>
                  {interview.recommendation.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              </div>
            )}
            {interview.feedback && (
              <div>
                <span className="text-sm text-charcoal-500">Feedback</span>
                <p className="mt-1 text-charcoal-700 whitespace-pre-wrap">{interview.feedback}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white">
          <CardContent className="py-8">
            <div className="text-center">
              <ThumbsUp className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
              <p className="text-charcoal-500">No feedback submitted yet</p>
              {interview.status !== 'completed' && (
                <Button className="mt-4" size="sm">
                  Submit Feedback
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

/**
 * Activities Section
 */
export function InterviewActivitiesSectionPCF({ entityId }: PCFSectionProps) {
  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Activities
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-charcoal-500">
          <Activity className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
          <p>No activities recorded yet</p>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Location Section - Shows interview meeting location
 */
export function InterviewLocationSectionPCF({ entityId }: PCFSectionProps) {
  const addressesQuery = trpc.addresses.getByEntity.useQuery({
    entityType: 'interview',
    entityId,
  })

  const addresses = addressesQuery.data ?? []

  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Meeting Location
        </CardTitle>
        <Link href={`/employee/admin/addresses/new?entityType=interview&entityId=${entityId}`}>
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Location
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {addressesQuery.isLoading ? (
          <p className="text-charcoal-400 text-sm">Loading...</p>
        ) : addresses.length === 0 ? (
          <p className="text-charcoal-500 text-sm">No in-person location set (virtual meeting or TBD)</p>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <Link
                key={address.id}
                href={`/employee/admin/addresses/${address.id}`}
                className="block hover:bg-charcoal-50 rounded-lg p-2 -m-2 transition-colors"
              >
                <AddressDisplay
                  address={address}
                  variant="compact"
                  showPrimary
                />
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Participants Section - Shows all interview participants from entity context
 * Uses ONE database call pattern - data comes from context
 */
export function InterviewParticipantsSectionPCF({ entity }: PCFSectionProps) {
  const interview = entity as FullInterview | undefined

  if (!interview) return null

  const participants = interview.sections?.participants?.items ?? []
  const totalParticipants = interview.sections?.participants?.total ?? 0

  // Group participants by type
  const groupedParticipants = participants.reduce((acc, p) => {
    const type = p.participant_type || 'other'
    if (!acc[type]) acc[type] = []
    acc[type].push(p)
    return acc
  }, {} as Record<string, InterviewParticipant[]>)

  const participantTypeLabels: Record<string, string> = {
    candidate: 'Candidate',
    interviewer: 'Interviewers',
    recruiter: 'Recruiters',
    hiring_manager: 'Hiring Managers',
    coordinator: 'Coordinators',
    other: 'Other',
  }

  const getStatusBadge = (status: string | null | undefined) => {
    if (!status) return null
    const statusConfig: Record<string, { bg: string; text: string }> = {
      confirmed: { bg: 'bg-green-100', text: 'text-green-800' },
      pending: { bg: 'bg-amber-100', text: 'text-amber-800' },
      declined: { bg: 'bg-red-100', text: 'text-red-800' },
      tentative: { bg: 'bg-blue-100', text: 'text-blue-800' },
    }
    const config = statusConfig[status] || { bg: 'bg-charcoal-100', text: 'text-charcoal-700' }
    return (
      <Badge className={cn(config.bg, config.text, 'text-xs')}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Participants
          {totalParticipants > 0 && (
            <Badge variant="secondary" className="ml-2">{totalParticipants}</Badge>
          )}
        </CardTitle>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Participant
        </Button>
      </CardHeader>
      <CardContent>
        {participants.length === 0 ? (
          <div className="text-center py-8 text-charcoal-500">
            <Users className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
            <p>No participants assigned</p>
            <Button className="mt-4" size="sm" variant="outline">
              Add Participants
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedParticipants).map(([type, typeParticipants]) => (
              <div key={type}>
                <h4 className="text-sm font-medium text-charcoal-600 mb-3">
                  {participantTypeLabels[type] || type}
                </h4>
                <div className="space-y-3">
                  {typeParticipants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-charcoal-50"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gold-100 text-gold-700 text-sm">
                            {participant.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-charcoal-900">{participant.name}</p>
                          <p className="text-sm text-charcoal-500">{participant.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(participant.status)}
                        <div className="flex items-center gap-1">
                          {participant.email && (
                            <a
                              href={`mailto:${participant.email}`}
                              className="p-1.5 rounded hover:bg-charcoal-200 text-charcoal-500 hover:text-charcoal-700"
                            >
                              <Mail className="w-4 h-4" />
                            </a>
                          )}
                          {participant.phone && (
                            <a
                              href={`tel:${participant.phone}`}
                              className="p-1.5 rounded hover:bg-charcoal-200 text-charcoal-500 hover:text-charcoal-700"
                            >
                              <Phone className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Enhanced Feedback Section - Shows scorecards and legacy feedback from entity context
 * Uses ONE database call pattern - data comes from context
 */
export function InterviewFeedbackEnhancedSectionPCF({ entity }: PCFSectionProps) {
  const interview = entity as FullInterview | undefined

  if (!interview) return null

  const feedbackItems = interview.sections?.feedback?.items ?? []
  const hasScorecard = interview.sections?.feedback?.hasScorecard ?? false
  const hasLegacy = interview.sections?.feedback?.hasLegacy ?? false

  const getRatingStars = (rating: number | null | undefined) => {
    if (!rating) return null
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              'w-4 h-4',
              star <= rating ? 'fill-gold-400 text-gold-400' : 'text-charcoal-300'
            )}
          />
        ))}
      </div>
    )
  }

  const getRecommendationBadge = (rec: string | null | undefined) => {
    if (!rec) return null
    const recConfig: Record<string, { bg: string; text: string; icon: typeof CheckCircle }> = {
      strong_hire: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      hire: { bg: 'bg-green-50', text: 'text-green-700', icon: CheckCircle },
      no_hire: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
      strong_no_hire: { bg: 'bg-red-200', text: 'text-red-900', icon: XCircle },
      undecided: { bg: 'bg-amber-100', text: 'text-amber-800', icon: Activity },
    }
    const config = recConfig[rec] || { bg: 'bg-charcoal-100', text: 'text-charcoal-700', icon: Activity }
    const Icon = config.icon
    return (
      <Badge className={cn(config.bg, config.text, 'flex items-center gap-1')}>
        <Icon className="w-3 h-3" />
        {rec.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ThumbsUp className="w-5 h-5" />
            Feedback Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-lg bg-charcoal-50">
              <p className="text-2xl font-bold text-charcoal-900">{feedbackItems.length}</p>
              <p className="text-sm text-charcoal-500">Total Feedback</p>
            </div>
            <div className="p-4 rounded-lg bg-charcoal-50">
              <p className="text-2xl font-bold text-charcoal-900">
                {hasScorecard ? <CheckCircle className="w-6 h-6 text-green-600 mx-auto" /> : '—'}
              </p>
              <p className="text-sm text-charcoal-500">Scorecard</p>
            </div>
            <div className="p-4 rounded-lg bg-charcoal-50">
              <p className="text-2xl font-bold text-charcoal-900">
                {interview.recommendation ? getRecommendationBadge(interview.recommendation as string) : '—'}
              </p>
              <p className="text-sm text-charcoal-500">Recommendation</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Items */}
      {feedbackItems.length === 0 ? (
        <Card className="bg-white">
          <CardContent className="py-8">
            <div className="text-center">
              <ThumbsUp className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
              <p className="text-charcoal-500">No feedback submitted yet</p>
              <Button className="mt-4" size="sm">
                Submit Feedback
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {feedbackItems.map((feedback) => (
            <Card key={feedback.id} className="bg-white">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-charcoal-100 text-charcoal-600 text-xs">
                        {feedback.submitted_by_name?.split(' ').map(n => n[0]).join('') || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{feedback.submitted_by_name || 'Unknown'}</p>
                      <p className="text-xs text-charcoal-500">
                        {feedback.submitted_at
                          ? formatDistanceToNow(new Date(feedback.submitted_at), { addSuffix: true })
                          : 'Unknown date'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getRatingStars(feedback.overall_rating)}
                    {getRecommendationBadge(feedback.recommendation)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {feedback.comments && (
                  <p className="text-charcoal-700 whitespace-pre-wrap">{feedback.comments}</p>
                )}
                {feedback.strengths && feedback.strengths.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-green-700 mb-1">Strengths</p>
                    <ul className="list-disc list-inside text-sm text-charcoal-600">
                      {feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
                {feedback.areas_for_improvement && feedback.areas_for_improvement.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-amber-700 mb-1">Areas for Improvement</p>
                    <ul className="list-disc list-inside text-sm text-charcoal-600">
                      {feedback.areas_for_improvement.map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Notes Section - Shows notes from entity context
 * Uses ONE database call pattern - data comes from context
 */
export function InterviewNotesSectionPCF({ entityId, entity }: PCFSectionProps) {
  const interview = entity as FullInterview | undefined

  if (!interview) return null

  const notes = interview.sections?.notes?.items ?? []
  const totalNotes = interview.sections?.notes?.total ?? 0

  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <StickyNote className="w-5 h-5" />
          Notes
          {totalNotes > 0 && (
            <Badge variant="secondary" className="ml-2">{totalNotes}</Badge>
          )}
        </CardTitle>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Note
        </Button>
      </CardHeader>
      <CardContent>
        {notes.length === 0 ? (
          <div className="text-center py-8 text-charcoal-500">
            <StickyNote className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
            <p>No notes yet</p>
            <Button className="mt-4" size="sm" variant="outline">
              Add First Note
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className="p-4 rounded-lg bg-charcoal-50 border border-charcoal-100"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-charcoal-200 text-charcoal-600 text-xs">
                        {note.created_by_name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{note.created_by_name || 'Unknown'}</span>
                  </div>
                  <span className="text-xs text-charcoal-500">
                    {note.created_at
                      ? formatDistanceToNow(new Date(note.created_at), { addSuffix: true })
                      : ''}
                  </span>
                </div>
                <p className="text-charcoal-700 whitespace-pre-wrap">{note.content}</p>
                {note.is_private && (
                  <Badge variant="outline" className="mt-2 text-xs">Private</Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Documents Section - Shows documents from entity context
 * Uses ONE database call pattern - data comes from context
 */
export function InterviewDocumentsSectionPCF({ entityId, entity }: PCFSectionProps) {
  const interview = entity as FullInterview | undefined

  if (!interview) return null

  const documents = interview.sections?.documents?.items ?? []
  const totalDocuments = interview.sections?.documents?.total ?? 0

  const getFileIcon = (mimeType: string | null | undefined) => {
    if (!mimeType) return FileText
    if (mimeType.includes('pdf')) return FileText
    if (mimeType.includes('image')) return FileText
    return FileText
  }

  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Documents
          {totalDocuments > 0 && (
            <Badge variant="secondary" className="ml-2">{totalDocuments}</Badge>
          )}
        </CardTitle>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-8 text-charcoal-500">
            <FileText className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
            <p>No documents attached</p>
            <Button className="mt-4" size="sm" variant="outline">
              Upload Document
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => {
              const FileIcon = getFileIcon(doc.mime_type)
              return (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-charcoal-50 hover:bg-charcoal-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-charcoal-200">
                      <FileIcon className="w-5 h-5 text-charcoal-600" />
                    </div>
                    <div>
                      <p className="font-medium text-charcoal-900">{doc.name}</p>
                      <p className="text-xs text-charcoal-500">
                        {doc.file_size ? `${Math.round(doc.file_size / 1024)}KB` : ''}
                        {doc.uploaded_at && ` • ${formatDistanceToNow(new Date(doc.uploaded_at), { addSuffix: true })}`}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * History Section - Shows audit history from entity context
 * Uses ONE database call pattern - data comes from context
 */
export function InterviewHistorySectionPCF({ entityId, entity }: PCFSectionProps) {
  const interview = entity as FullInterview | undefined

  if (!interview) return null

  const history = interview.sections?.history?.items ?? []
  const totalHistory = interview.sections?.history?.total ?? 0

  const getActionIcon = (action: string | null | undefined) => {
    switch (action) {
      case 'created':
        return <Plus className="w-4 h-4 text-green-600" />
      case 'updated':
        return <Activity className="w-4 h-4 text-blue-600" />
      case 'status_changed':
        return <CheckCircle className="w-4 h-4 text-amber-600" />
      case 'scheduled':
        return <Calendar className="w-4 h-4 text-purple-600" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'canceled':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <History className="w-4 h-4 text-charcoal-500" />
    }
  }

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          History
          {totalHistory > 0 && (
            <Badge variant="secondary" className="ml-2">{totalHistory}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8 text-charcoal-500">
            <History className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
            <p>No history available</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-charcoal-200" />

            <div className="space-y-4">
              {history.map((entry, index) => (
                <div key={entry.id} className="relative flex gap-4">
                  {/* Timeline dot */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border-2 border-charcoal-200 flex items-center justify-center z-10">
                    {getActionIcon(entry.action)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-charcoal-900">
                        {entry.action?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Update'}
                      </span>
                      <span className="text-xs text-charcoal-500">
                        {entry.created_at
                          ? formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })
                          : ''}
                      </span>
                    </div>
                    {entry.description && (
                      <p className="text-sm text-charcoal-600 mt-1">{entry.description}</p>
                    )}
                    {entry.changed_by_name && (
                      <p className="text-xs text-charcoal-500 mt-1">
                        by {entry.changed_by_name}
                      </p>
                    )}
                    {entry.changes && Object.keys(entry.changes).length > 0 && (
                      <div className="mt-2 p-2 rounded bg-charcoal-50 text-xs">
                        {Object.entries(entry.changes).map(([key, value]) => (
                          <div key={key} className="flex gap-2">
                            <span className="font-medium text-charcoal-600">
                              {key.replace(/_/g, ' ')}:
                            </span>
                            <span className="text-charcoal-500">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}











