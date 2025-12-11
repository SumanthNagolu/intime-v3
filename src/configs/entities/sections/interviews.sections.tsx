'use client'

/**
 * PCF-Compatible Section Adapters for Interviews
 */

import { Interview, INTERVIEW_TYPE_CONFIG } from '../interviews.config'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format, formatDistanceToNow } from 'date-fns'
import { User, Briefcase, Building2, Calendar, Clock, Video, MapPin, FileText, ThumbsUp, ThumbsDown, Activity, Users, Plus } from 'lucide-react'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { AddressDisplay } from '@/components/addresses'

interface PCFSectionProps {
  entityId: string
  entity?: unknown
}

/**
 * Overview Section
 */
export function InterviewOverviewSectionPCF({ entityId, entity }: PCFSectionProps) {
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
