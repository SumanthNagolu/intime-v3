'use client'

import { DollarSign, Calendar, TrendingUp, Clock, Target, Star, FileText, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { FullSubmission } from '@/types/submission'
import { SUBMISSION_STATUS_CONFIG } from '@/configs/entities/submissions.config'

interface SummarySectionProps {
  submission: FullSubmission
}

export function SummarySection({ submission }: SummarySectionProps) {
  // Calculate days in pipeline
  const daysInPipeline = (() => {
    const dateStr = submission.submitted_at || submission.created_at
    if (!dateStr) return 0
    const submitted = new Date(dateStr)
    const now = new Date()
    return Math.floor((now.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24))
  })()

  // Get margin calculation if both rates are available
  const margin = (() => {
    const billRate = submission.bill_rate || submission.submission_rate
    const payRate = submission.pay_rate
    if (!billRate || !payRate) return null
    return ((billRate - payRate) / billRate * 100).toFixed(1)
  })()

  const statusConfig = SUBMISSION_STATUS_CONFIG[submission.status] || {
    label: submission.status,
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-700',
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Row */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          label="Bill Rate"
          value={submission.bill_rate || submission.submission_rate ? `$${submission.bill_rate || submission.submission_rate}` : '—'}
          subtitle="/hr"
          icon={DollarSign}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
        <MetricCard
          label="Pay Rate"
          value={submission.pay_rate ? `$${submission.pay_rate}` : '—'}
          subtitle="/hr"
          icon={DollarSign}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <MetricCard
          label="Margin"
          value={margin ? `${margin}%` : '—'}
          icon={TrendingUp}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
        />
        <MetricCard
          label="Match Score"
          value={submission.match_score ? `${submission.match_score}%` : '—'}
          icon={Target}
          iconBg={submission.match_score && submission.match_score >= 80 ? 'bg-green-100' : 'bg-charcoal-100'}
          iconColor={submission.match_score && submission.match_score >= 80 ? 'text-green-600' : 'text-charcoal-600'}
        />
      </div>

      {/* Main Details Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-charcoal-400" />
            Submission Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-x-8 gap-y-4">
            {/* Status */}
            <div>
              <p className="text-xs text-charcoal-500 uppercase tracking-wide mb-1">Status</p>
              <span className={cn(
                'inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium',
                statusConfig.bgColor,
                statusConfig.textColor
              )}>
                {statusConfig.label}
              </span>
            </div>

            {/* Days in Pipeline */}
            <div>
              <p className="text-xs text-charcoal-500 uppercase tracking-wide mb-1">Days in Pipeline</p>
              <p className={cn(
                'font-medium',
                daysInPipeline > 14 ? 'text-red-600' : daysInPipeline > 7 ? 'text-amber-600' : 'text-charcoal-900'
              )}>
                {daysInPipeline} {daysInPipeline === 1 ? 'day' : 'days'}
              </p>
            </div>

            {/* Submitted Date */}
            <div>
              <p className="text-xs text-charcoal-500 uppercase tracking-wide mb-1">Submitted</p>
              <p className="font-medium">
                {submission.submitted_at
                  ? new Date(submission.submitted_at).toLocaleDateString()
                  : '—'}
              </p>
            </div>

            {/* Interview Count */}
            <div>
              <p className="text-xs text-charcoal-500 uppercase tracking-wide mb-1">Interviews</p>
              <p className="font-medium">{submission.sections?.interviews?.total || 0}</p>
            </div>

            {/* RTR Status */}
            <div>
              <p className="text-xs text-charcoal-500 uppercase tracking-wide mb-1">RTR Obtained</p>
              <p className="font-medium flex items-center gap-1">
                {submission.rtr_obtained ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Yes
                  </>
                ) : (
                  'No'
                )}
              </p>
            </div>

            {/* Owner */}
            <div>
              <p className="text-xs text-charcoal-500 uppercase tracking-wide mb-1">Owner</p>
              <p className="font-medium">{submission.owner?.full_name || '—'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Submission Notes */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-charcoal-700">Submission Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-charcoal-600">
              {submission.submission_notes || 'No submission notes'}
            </p>
          </CardContent>
        </Card>

        {/* Internal Notes */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-charcoal-700">Internal Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-charcoal-600">
              {submission.internal_notes || 'No internal notes'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Client Feedback if exists */}
      {submission.client_feedback && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-charcoal-700 flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              Client Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-charcoal-600">{submission.client_feedback}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function MetricCard({
  label,
  value,
  subtitle,
  icon: Icon,
  iconBg,
  iconColor,
}: {
  label: string
  value: string
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  iconBg: string
  iconColor: string
}) {
  return (
    <div className="bg-white rounded-lg p-4 border border-charcoal-100 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', iconBg)}>
          <Icon className={cn('h-5 w-5', iconColor)} />
        </div>
        <div>
          <p className="text-xs text-charcoal-500 uppercase tracking-wide">{label}</p>
          <p className="text-xl font-semibold text-charcoal-900">
            {value}
            {subtitle && <span className="text-sm font-normal text-charcoal-500">{subtitle}</span>}
          </p>
        </div>
      </div>
    </div>
  )
}
