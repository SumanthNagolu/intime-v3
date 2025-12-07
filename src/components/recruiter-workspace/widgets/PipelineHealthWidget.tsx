'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { trpc } from '@/lib/trpc/client'
import { Briefcase, Users, Send, Calendar, FileText, Award, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

interface PipelineItemProps {
  icon: React.ReactNode
  label: string
  value: number
  sublabel?: string
  href?: string
}

function PipelineItem({ icon, label, value, sublabel, href }: PipelineItemProps) {
  const content = (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-charcoal-50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-charcoal-100 rounded-lg">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-charcoal-900">{label}</p>
          {sublabel && <p className="text-xs text-charcoal-500">{sublabel}</p>}
        </div>
      </div>
      <span className="text-lg font-semibold text-charcoal-900">{value}</span>
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}

interface PipelineHealthData {
  activeJobs: number
  urgentJobs: number
  candidatesSourcing: number
  pendingSubmissions: number
  interviewsThisWeek: number
  outstandingOffers: number
  activePlacements: number
  urgentItems: { description: string }[]
}

interface PipelineHealthWidgetProps {
  className?: string
  initialData?: PipelineHealthData
}

export function PipelineHealthWidget({ className, initialData }: PipelineHealthWidgetProps) {
  const { data, isLoading } = trpc.dashboard.getPipelineHealth.useQuery(undefined, {
    initialData,
    enabled: !initialData,
  })

  if (isLoading) {
    return (
      <Card className={cn('bg-white', className)}>
        <CardHeader>
          <Skeleton className="h-6 w-36" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-14" />
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
          <CardTitle className="text-h4">Pipeline Health</CardTitle>
          <Link href="/employee/recruiting/jobs">
            <Button variant="ghost" size="sm">View Details</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        <PipelineItem
          icon={<Briefcase className="w-4 h-4 text-charcoal-600" />}
          label="Active Jobs"
          value={data.activeJobs}
          sublabel={`${data.urgentJobs} urgent`}
          href="/employee/recruiting/jobs?status=active"
        />
        <PipelineItem
          icon={<Users className="w-4 h-4 text-charcoal-600" />}
          label="Candidates Sourcing"
          value={data.candidatesSourcing}
          sublabel="need follow-up"
          href="/employee/recruiting/candidates?status=sourcing"
        />
        <PipelineItem
          icon={<Send className="w-4 h-4 text-charcoal-600" />}
          label="Submissions Pending"
          value={data.pendingSubmissions}
          sublabel="awaiting feedback"
          href="/employee/recruiting/submissions?status=submitted"
        />
        <PipelineItem
          icon={<Calendar className="w-4 h-4 text-charcoal-600" />}
          label="Interviews This Week"
          value={data.interviewsThisWeek}
          href="/employee/recruiting/interviews"
        />
        <PipelineItem
          icon={<FileText className="w-4 h-4 text-charcoal-600" />}
          label="Offers Outstanding"
          value={data.outstandingOffers}
          sublabel="needs follow-up"
          href="/employee/recruiting/submissions?status=offered"
        />
        <PipelineItem
          icon={<Award className="w-4 h-4 text-charcoal-600" />}
          label="Placements Active"
          value={data.activePlacements}
          href="/employee/recruiting/placements"
        />

        {/* Urgent Attention Items */}
        {data.urgentItems.length > 0 && (
          <div className="mt-4 pt-4 border-t border-charcoal-100">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-error-500" />
              <span className="text-sm font-medium text-error-600">URGENT ATTENTION NEEDED</span>
            </div>
            <div className="space-y-2">
              {data.urgentItems.map((item, index) => (
                <div key={index} className="text-sm text-charcoal-600 p-2 bg-error-50 rounded-lg">
                  • {item.description}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
