'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Loader2, Users, Clock, Video, MapPin, Phone } from 'lucide-react'
import { format, formatDistanceToNow, isAfter, isBefore, addDays } from 'date-fns'
import { cn } from '@/lib/utils'

interface JobInterviewsSectionProps {
  jobId: string
}

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-charcoal-100 text-charcoal-700',
  cancelled: 'bg-red-100 text-red-700',
  no_show: 'bg-amber-100 text-amber-700',
  rescheduled: 'bg-purple-100 text-purple-700',
}

const typeIcons: Record<string, React.ReactNode> = {
  video: <Video className="w-4 h-4" />,
  phone: <Phone className="w-4 h-4" />,
  in_person: <MapPin className="w-4 h-4" />,
  onsite: <MapPin className="w-4 h-4" />,
}

export function JobInterviewsSection({ jobId }: JobInterviewsSectionProps) {
  const router = useRouter()

  // Query interviews for this job
  const interviewsQuery = trpc.ats.interviews.list.useQuery({ jobId })
  const interviews = interviewsQuery.data?.items || []

  const now = new Date()

  // Group interviews
  const upcomingInterviews = interviews.filter(
    (i: any) => ['scheduled', 'confirmed'].includes(i.status) && isAfter(new Date(i.scheduled_at), now)
  )
  const pastInterviews = interviews.filter(
    (i: any) => i.status === 'completed' || isBefore(new Date(i.scheduled_at), now)
  )

  const handleInterviewClick = (interviewId: string, submissionId: string) => {
    router.push(`/employee/recruiting/submissions/${submissionId}?tab=interviews`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Interviews
        </CardTitle>
        <CardDescription>
          {interviews.length} total interviews, {upcomingInterviews.length} upcoming
        </CardDescription>
      </CardHeader>
      <CardContent>
        {interviewsQuery.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : interviews.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
            <p className="text-charcoal-500">No interviews scheduled</p>
            <p className="text-sm text-charcoal-400 mt-1">
              Interviews will appear here when candidates are scheduled
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Upcoming Interviews */}
            {upcomingInterviews.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-charcoal-500 mb-3">
                  Upcoming ({upcomingInterviews.length})
                </h4>
                <div className="space-y-3">
                  {upcomingInterviews.map((interview: any) => {
                    const startTime = new Date(interview.scheduled_at)
                    const isToday = format(startTime, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')
                    const isSoon = isBefore(startTime, addDays(now, 2))

                    return (
                      <div
                        key={interview.id}
                        onClick={() => handleInterviewClick(interview.id, interview.submission_id)}
                        className={cn(
                          'p-4 border rounded-lg cursor-pointer transition-colors',
                          isToday && 'border-green-300 bg-green-50',
                          isSoon && !isToday && 'border-amber-300 bg-amber-50',
                          !isSoon && 'hover:border-hublot-300'
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-hublot-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-medium text-hublot-700">
                                {interview.submission?.candidate?.first_name?.[0]}
                                {interview.submission?.candidate?.last_name?.[0]}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-charcoal-900">
                                {interview.submission?.candidate?.first_name}{' '}
                                {interview.submission?.candidate?.last_name}
                              </p>
                              <p className="text-sm text-charcoal-600 capitalize">
                                {interview.interview_type?.replace(/_/g, ' ')} Interview
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={cn('capitalize', statusColors[interview.status])}>
                                  {interview.status}
                                </Badge>
                                {isToday && (
                                  <Badge className="bg-green-600 text-white">Today</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-charcoal-900">
                              {format(startTime, 'MMM d')}
                            </p>
                            <p className="text-sm text-charcoal-600">
                              {format(startTime, 'h:mm a')}
                            </p>
                            <div className="flex items-center justify-end gap-1 mt-1 text-charcoal-500">
                              {typeIcons[interview.interview_type] || <Calendar className="w-4 h-4" />}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Past Interviews */}
            {pastInterviews.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-charcoal-500 mb-3">
                  Past ({pastInterviews.length})
                </h4>
                <div className="space-y-3">
                  {pastInterviews.slice(0, 5).map((interview: any) => (
                    <div
                      key={interview.id}
                      onClick={() => handleInterviewClick(interview.id, interview.submission_id)}
                      className="p-4 border rounded-lg cursor-pointer hover:border-charcoal-300 transition-colors opacity-70"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-charcoal-100 flex items-center justify-center">
                            <span className="text-xs font-medium text-charcoal-600">
                              {interview.submission?.candidate?.first_name?.[0]}
                              {interview.submission?.candidate?.last_name?.[0]}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-charcoal-700">
                              {interview.submission?.candidate?.first_name}{' '}
                              {interview.submission?.candidate?.last_name}
                            </p>
                            <Badge className={cn('capitalize text-xs', statusColors[interview.status])}>
                              {interview.status}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-charcoal-500">
                          {format(new Date(interview.scheduled_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  ))}
                  {pastInterviews.length > 5 && (
                    <p className="text-sm text-charcoal-500 text-center">
                      + {pastInterviews.length - 5} more past interviews
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
