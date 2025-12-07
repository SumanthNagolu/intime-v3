'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { trpc } from '@/lib/trpc/client'
import { Phone, Mail, Users, Calendar, Send, MessageSquare } from 'lucide-react'
import Link from 'next/link'

interface ActivityRowProps {
  icon: React.ReactNode
  label: string
  count: number
  avg: number
  target: number
}

function ActivityRow({ icon, label, count, avg, target }: ActivityRowProps) {
  const status = avg >= target ? 'good' : avg >= target * 0.8 ? 'close' : 'low'

  const statusStyles = {
    good: 'text-success-600',
    close: 'text-warning-600',
    low: 'text-error-600',
  }

  const statusLabels = {
    good: '✅ Above',
    close: '🟡 Close',
    low: '❌ Below',
  }

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm text-charcoal-900">{label}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-charcoal-900">
          {count}
        </span>
        <span className="text-xs text-charcoal-500">
          ({avg}/day)
        </span>
        <span className={cn('text-xs font-medium', statusStyles[status])}>
          {statusLabels[status]}
        </span>
      </div>
    </div>
  )
}

interface ActivityMetric {
  count: number
  avg: number
  target: number
}

interface ActivitySummaryData {
  days: number
  calls: ActivityMetric
  emails: ActivityMetric
  meetings: ActivityMetric
  candidatesSourced: ActivityMetric
  phoneScreens: ActivityMetric
  submissions: ActivityMetric
}

interface ActivitySummaryWidgetProps {
  className?: string
  initialData?: ActivitySummaryData
}

export function ActivitySummaryWidget({ className, initialData }: ActivitySummaryWidgetProps) {
  const { data, isLoading } = trpc.dashboard.getActivitySummary.useQuery({ days: 7 }, {
    initialData,
    enabled: !initialData,
  })

  if (isLoading) {
    return (
      <Card className={cn('bg-white', className)}>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-8" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  return (
    <Card className={cn('bg-white', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-h4">Activity Summary</CardTitle>
          <span className="text-caption text-charcoal-500">Last {data.days} Days</span>
        </div>
      </CardHeader>
      <CardContent className="divide-y divide-charcoal-100">
        <ActivityRow
          icon={<Phone className="w-4 h-4 text-charcoal-500" />}
          label="Calls Logged"
          count={data.calls.count}
          avg={data.calls.avg}
          target={data.calls.target}
        />
        <ActivityRow
          icon={<Mail className="w-4 h-4 text-charcoal-500" />}
          label="Emails Sent"
          count={data.emails.count}
          avg={data.emails.avg}
          target={data.emails.target}
        />
        <ActivityRow
          icon={<Calendar className="w-4 h-4 text-charcoal-500" />}
          label="Meetings"
          count={data.meetings.count}
          avg={data.meetings.avg}
          target={data.meetings.target}
        />
        <ActivityRow
          icon={<Users className="w-4 h-4 text-charcoal-500" />}
          label="Candidates Sourced"
          count={data.candidatesSourced.count}
          avg={data.candidatesSourced.avg}
          target={data.candidatesSourced.target}
        />
        <ActivityRow
          icon={<MessageSquare className="w-4 h-4 text-charcoal-500" />}
          label="Phone Screens"
          count={data.phoneScreens.count}
          avg={data.phoneScreens.avg}
          target={data.phoneScreens.target}
        />
        <ActivityRow
          icon={<Send className="w-4 h-4 text-charcoal-500" />}
          label="Submissions Sent"
          count={data.submissions.count}
          avg={data.submissions.avg}
          target={data.submissions.target}
        />
      </CardContent>
    </Card>
  )
}
