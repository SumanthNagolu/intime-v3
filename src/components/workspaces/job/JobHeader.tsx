'use client'

import * as React from 'react'
import { Briefcase, Copy, Check, ExternalLink, MapPin, Building2, User, Clock, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { FullJob } from '@/types/job'
import { useToast } from '@/components/ui/use-toast'

interface JobHeaderProps {
  job: FullJob
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  draft: {
    bg: 'bg-charcoal-100',
    text: 'text-charcoal-600',
    dot: 'bg-charcoal-400',
    border: 'border-charcoal-200'
  },
  open: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
    border: 'border-blue-200'
  },
  active: {
    bg: 'bg-success-50',
    text: 'text-success-700',
    dot: 'bg-success-500',
    border: 'border-success-200'
  },
  on_hold: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    border: 'border-amber-200'
  },
  filled: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    dot: 'bg-purple-500',
    border: 'border-purple-200'
  },
  cancelled: {
    bg: 'bg-error-50',
    text: 'text-error-700',
    dot: 'bg-error-500',
    border: 'border-error-200'
  },
  closed: {
    bg: 'bg-charcoal-100',
    text: 'text-charcoal-600',
    dot: 'bg-charcoal-400',
    border: 'border-charcoal-200'
  },
}

const PRIORITY_CONFIG: Record<string, { bg: string; text: string; icon?: typeof AlertCircle }> = {
  critical: { bg: 'bg-error-50', text: 'text-error-700', icon: AlertCircle },
  high: { bg: 'bg-amber-50', text: 'text-amber-700', icon: AlertCircle },
  medium: { bg: 'bg-blue-50', text: 'text-blue-600' },
  low: { bg: 'bg-charcoal-100', text: 'text-charcoal-600' },
}

const JOB_TYPE_CONFIG: Record<string, { bg: string; text: string }> = {
  contract: { bg: 'bg-forest-50', text: 'text-forest-700' },
  full_time: { bg: 'bg-blue-50', text: 'text-blue-700' },
  part_time: { bg: 'bg-purple-50', text: 'text-purple-700' },
  contract_to_hire: { bg: 'bg-gold-50', text: 'text-gold-700' },
}

/**
 * JobHeader - Premium entity header with visual hierarchy
 *
 * Hublot-inspired design: Clean information display only.
 * All actions are centralized in the sidebar Quick Actions panel.
 */
export function JobHeader({ job }: JobHeaderProps) {
  const { toast } = useToast()
  const [copied, setCopied] = React.useState(false)

  const statusConfig = STATUS_CONFIG[job.status] || STATUS_CONFIG.draft
  const priorityConfig = PRIORITY_CONFIG[job.priority || 'medium']
  const jobTypeConfig = JOB_TYPE_CONFIG[job.job_type || 'contract'] || JOB_TYPE_CONFIG.contract

  // Format location display
  const locationDisplay = React.useMemo(() => {
    if (job.is_remote) return 'Remote'
    if (job.is_hybrid) return `Hybrid${job.location ? ` - ${job.location}` : ''}`
    return job.location || null
  }, [job.is_remote, job.is_hybrid, job.location])

  // Get company name
  const companyName = job.company?.name || job.clientCompany?.name || null

  // Calculate SLA status
  const slaStatus = React.useMemo(() => {
    if (!job.slaProgress) return null
    const { percentUsed, isOverdue, daysRemaining } = job.slaProgress
    if (isOverdue) return { label: `${Math.abs(daysRemaining)}d overdue`, variant: 'error' as const }
    if (percentUsed >= 75) return { label: `${daysRemaining}d remaining`, variant: 'warning' as const }
    return { label: `${daysRemaining}d remaining`, variant: 'default' as const }
  }, [job.slaProgress])

  // Copy job ID
  const handleCopyId = () => {
    navigator.clipboard.writeText(job.id)
    setCopied(true)
    toast({ title: 'Job ID copied to clipboard' })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-charcoal-50/30 via-transparent to-blue-50/20" />

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-forest-500 to-blue-500" />

      <div className="relative p-6">
        <div className="flex items-start gap-5">
          {/* Icon with gradient */}
          <div className="relative group">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-blue-500/30 group-hover:scale-105">
              <Briefcase className="h-8 w-8 text-white" />
            </div>
            {/* Priority indicator for critical/high */}
            {(job.priority === 'critical' || job.priority_rank === 1) && (
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-error-400 to-error-600 flex items-center justify-center shadow-lg shadow-error-500/40 animate-pulse-slow">
                <AlertCircle className="h-3.5 w-3.5 text-white" />
              </div>
            )}
            {(job.priority === 'high' || job.priority_rank === 2) && (
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
                <AlertCircle className="h-3.5 w-3.5 text-white" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-2xl font-bold text-charcoal-900 tracking-tight truncate">
                {job.title}
              </h1>
              <Badge className={cn(
                'capitalize font-medium px-2.5 py-0.5 flex items-center gap-1.5',
                statusConfig.bg,
                statusConfig.text,
                statusConfig.border
              )}>
                <span className={cn("w-1.5 h-1.5 rounded-full", statusConfig.dot)} />
                {job.status?.replace(/_/g, ' ')}
              </Badge>
              <Badge className={cn(
                'capitalize font-medium px-2.5 py-0.5',
                jobTypeConfig.bg,
                jobTypeConfig.text
              )}>
                {(job.job_type || 'contract').replace(/_/g, ' ')}
              </Badge>
              {job.priority && job.priority !== 'medium' && (
                <Badge className={cn(
                  'capitalize font-medium px-2.5 py-0.5',
                  priorityConfig.bg,
                  priorityConfig.text
                )}>
                  {priorityConfig.icon && <AlertCircle className="h-3 w-3 mr-1" />}
                  {job.priority}
                </Badge>
              )}
            </div>

            {/* Metadata row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-charcoal-500">
              {companyName && (
                <span className="flex items-center gap-1.5 font-medium text-charcoal-600">
                  <Building2 className="h-3.5 w-3.5" />
                  {companyName}
                </span>
              )}
              {locationDisplay && (
                <span className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-charcoal-300" />
                  <MapPin className="h-3.5 w-3.5" />
                  {locationDisplay}
                </span>
              )}
              {job.owner && (
                <span className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-charcoal-300" />
                  <User className="h-3.5 w-3.5" />
                  <span className="font-medium text-charcoal-700">{job.owner.full_name}</span>
                </span>
              )}
              {slaStatus && (
                <span className={cn(
                  "flex items-center gap-1.5",
                  slaStatus.variant === 'error' && "text-error-600",
                  slaStatus.variant === 'warning' && "text-amber-600",
                )}>
                  <span className="w-1 h-1 rounded-full bg-charcoal-300" />
                  <Clock className="h-3.5 w-3.5" />
                  {slaStatus.label}
                </span>
              )}
            </div>

            {/* Positions & Rate info */}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              {job.positions_count && job.positions_count > 0 && (
                <span className="text-charcoal-600">
                  <span className="font-semibold">{job.positions_filled || 0}</span>
                  <span className="text-charcoal-400">/{job.positions_count} positions filled</span>
                </span>
              )}
              {(job.rate_min || job.rate_max) && (
                <span className="text-charcoal-600">
                  {job.rate_min && job.rate_max ? (
                    <>${job.rate_min}-${job.rate_max}/hr</>
                  ) : job.rate_max ? (
                    <>Up to ${job.rate_max}/hr</>
                  ) : (
                    <>From ${job.rate_min}/hr</>
                  )}
                </span>
              )}
            </div>

            {/* ID row */}
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={handleCopyId}
                className="inline-flex items-center gap-1.5 text-xs text-charcoal-400 hover:text-charcoal-600 transition-colors font-mono"
              >
                <span className="bg-charcoal-100 px-1.5 py-0.5 rounded">ID: {job.id.slice(0, 8)}...</span>
                {copied ? (
                  <Check className="h-3 w-3 text-success-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
              {job.clientCompany && job.clientCompany.id !== job.company?.id && (
                <span className="text-xs text-charcoal-400">
                  End Client: <span className="text-charcoal-600">{job.endClientCompany?.name || job.clientCompany.name}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JobHeader
