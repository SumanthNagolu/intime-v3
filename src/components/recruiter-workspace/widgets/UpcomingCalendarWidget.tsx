'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { trpc } from '@/lib/trpc/client'
import { Calendar, Video, Phone, Building2 } from 'lucide-react'
import Link from 'next/link'

interface InterviewItemProps {
  id: string
  scheduledAt: string
  interviewType: string
  candidateName: string
  jobTitle: string
  accountName: string
}

function InterviewItem({ scheduledAt, interviewType, candidateName, jobTitle, accountName }: InterviewItemProps) {
  const date = new Date(scheduledAt)
  const isToday = date.toDateString() === new Date().toDateString()
  const isTomorrow = date.toDateString() === new Date(Date.now() + 86400000).toDateString()

  const dateLabel = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  const timeLabel = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  const typeIcons: Record<string, React.ReactNode> = {
    video: <Video className="w-4 h-4" />,
    phone: <Phone className="w-4 h-4" />,
    onsite: <Building2 className="w-4 h-4" />,
  }

  return (
    <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-charcoal-50 transition-colors">
      <div className="flex-shrink-0 w-16 text-center">
        <p className="text-xs text-charcoal-500">{dateLabel}</p>
        <p className="text-sm font-medium text-charcoal-900">{timeLabel}</p>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-charcoal-900 truncate">{candidateName}</p>
        <p className="text-xs text-charcoal-500 truncate">{jobTitle} • {accountName}</p>
      </div>
      <div className="flex-shrink-0 p-2 bg-charcoal-100 rounded-lg">
        {typeIcons[interviewType] || <Calendar className="w-4 h-4" />}
      </div>
    </div>
  )
}

export function UpcomingCalendarWidget({ className }: { className?: string }) {
  const { data, isLoading } = trpc.ats.interviews.getUpcoming.useQuery({ days: 7 })

  if (isLoading) {
    return (
      <Card className={cn('bg-white', className)}>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Group interviews by day
  const groupedInterviews: Record<string, typeof data> = {}
  data?.forEach(interview => {
    const date = new Date(interview.scheduledAt).toDateString()
    if (!groupedInterviews[date]) {
      groupedInterviews[date] = []
    }
    groupedInterviews[date]!.push(interview)
  })

  return (
    <Card className={cn('bg-white', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-h4">Upcoming Calendar</CardTitle>
          <Link href="/employee/recruiting/interviews">
            <Button variant="ghost" size="sm">View Calendar</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {data?.length === 0 && (
          <div className="text-center py-8 text-charcoal-500">
            No upcoming interviews scheduled.
          </div>
        )}

        {data?.slice(0, 5).map(interview => {
          const submission = interview.submission as {
            job: { title: string; account: { name: string } | null } | null
            candidate: { first_name: string; last_name: string } | null
          } | null

          return (
            <InterviewItem
              key={interview.id}
              id={interview.id}
              scheduledAt={interview.scheduledAt}
              interviewType={interview.interviewType}
              candidateName={submission?.candidate ? `${submission.candidate.first_name} ${submission.candidate.last_name}` : 'Unknown'}
              jobTitle={submission?.job?.title ?? 'Unknown Job'}
              accountName={submission?.job?.account?.name ?? 'Unknown Client'}
            />
          )
        })}

        {data && data.length > 0 && (
          <div className="pt-4 border-t border-charcoal-100 text-center">
            <span className="text-sm text-charcoal-500">
              {data.length} interview{data.length !== 1 ? 's' : ''} this week
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
