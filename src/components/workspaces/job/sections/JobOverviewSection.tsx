'use client'

import * as React from 'react'
import {
  Clock, Send, Calendar, Gift, Users, ArrowRight, Building2,
  MapPin, DollarSign, Briefcase, User, FileText, Target,
  CheckCircle, AlertTriangle, TrendingUp, BarChart3, Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { FullJob, SubmissionItem, InterviewItem, OfferItem, TeamMemberItem, ActivityItem } from '@/types/job'
import { formatDistanceToNow, format } from 'date-fns'

interface JobOverviewSectionProps {
  job: FullJob
  onNavigate: (section: string) => void
}

/**
 * JobOverviewSection - Premium SaaS-level Summary view
 * Features: KPI cards, job details, hiring team, recent activity
 */
export function JobOverviewSection({ job, onNavigate }: JobOverviewSectionProps) {
  const submissions = job.sections?.submissions?.items || []
  const interviews = job.sections?.interviews?.items || []
  const offers = job.sections?.offers?.items || []
  const team = job.sections?.team?.items || []
  const activities = job.sections?.activities?.items || []
  const recentActivities = activities.slice(0, 5)

  // Calculate metrics
  const totalSubmissions = job.sections?.submissions?.total || 0
  const interviewedCount = submissions.filter(s =>
    ['client_interview', 'offer_stage', 'placed'].includes(s.status)
  ).length
  const interviewRate = totalSubmissions > 0 ? Math.round((interviewedCount / totalSubmissions) * 100) : null

  const offersExtended = job.sections?.offers?.total || 0
  const offerRate = interviewedCount > 0 ? Math.round((offersExtended / interviewedCount) * 100) : null

  // Days open calculation
  const daysOpen = React.useMemo(() => {
    if (!job.created_at) return null
    const createdDate = new Date(job.created_at)
    const now = new Date()
    return Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
  }, [job.created_at])

  // Animation delay helper
  const getDelay = (index: number) => ({ animationDelay: `${index * 75}ms` })

  // Get submission status breakdown
  const submissionsByStatus = job.sections?.submissions?.byStatus || {}

  return (
    <div className="space-y-6">
      {/* Premium KPI Grid */}
      <div className="grid grid-cols-4 gap-4">
        {/* Time to Fill / Days Open */}
        <div
          className="group relative overflow-hidden rounded-xl border border-charcoal-200/60 bg-white p-5 shadow-elevation-sm hover:shadow-elevation-md hover:-translate-y-0.5 transition-all duration-300 animate-fade-in"
          style={getDelay(0)}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-charcoal-400 uppercase tracking-wider">Days Open</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-charcoal-900 tracking-tight">
                  {daysOpen ?? '—'}
                </span>
                {job.sla_days && (
                  <span className="text-sm text-charcoal-400">/ {job.sla_days} SLA</span>
                )}
              </div>
              {job.slaProgress && (
                <div className="flex items-center gap-1.5">
                  <span className={cn(
                    "inline-flex items-center gap-1.5 text-xs font-medium",
                    job.slaProgress.isOverdue && "text-error-600",
                    job.slaProgress.percentUsed >= 75 && !job.slaProgress.isOverdue && "text-amber-600",
                    job.slaProgress.percentUsed < 75 && "text-charcoal-600"
                  )}>
                    <span className={cn(
                      "w-2 h-2 rounded-full",
                      job.slaProgress.isOverdue && "bg-error-500",
                      job.slaProgress.percentUsed >= 75 && !job.slaProgress.isOverdue && "bg-amber-500",
                      job.slaProgress.percentUsed < 75 && "bg-charcoal-400"
                    )} />
                    {job.slaProgress.isOverdue ? 'Overdue' : `${job.slaProgress.percentUsed}% of SLA`}
                  </span>
                </div>
              )}
            </div>
            <div className="w-11 h-11 rounded-lg bg-charcoal-100 flex items-center justify-center transition-all duration-300 group-hover:bg-charcoal-200">
              <Clock className="h-5 w-5 text-charcoal-500 group-hover:text-charcoal-700 transition-colors" />
            </div>
          </div>
        </div>

        {/* Submissions */}
        <div
          className="group relative overflow-hidden rounded-xl border border-charcoal-200/60 bg-white p-5 shadow-elevation-sm hover:shadow-elevation-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer animate-fade-in"
          style={getDelay(1)}
          onClick={() => onNavigate('submissions')}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-charcoal-400 uppercase tracking-wider">Submissions</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-charcoal-900 tracking-tight">
                  {totalSubmissions}
                </span>
              </div>
              {Object.keys(submissionsByStatus).length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-charcoal-500">
                    {submissionsByStatus['client_review'] && (
                      <span>{submissionsByStatus['client_review']} in review</span>
                    )}
                    {submissionsByStatus['client_interview'] && (
                      <span>{submissionsByStatus['client_interview']} interviewing</span>
                    )}
                  </span>
                </div>
              )}
            </div>
            <div className="w-11 h-11 rounded-lg bg-charcoal-100 flex items-center justify-center transition-all duration-300 group-hover:bg-charcoal-200">
              <Send className="h-5 w-5 text-charcoal-500 group-hover:text-charcoal-700 transition-colors" />
            </div>
          </div>
          <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-charcoal-300 group-hover:text-charcoal-500 group-hover:translate-x-1 transition-all duration-300" />
        </div>

        {/* Interview Rate */}
        <div
          className="group relative overflow-hidden rounded-xl border border-charcoal-200/60 bg-white p-5 shadow-elevation-sm hover:shadow-elevation-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer animate-fade-in"
          style={getDelay(2)}
          onClick={() => onNavigate('interviews')}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-charcoal-400 uppercase tracking-wider">Interview Rate</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-charcoal-900 tracking-tight">
                  {interviewRate !== null ? `${interviewRate}%` : '—'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-charcoal-500">
                  <Calendar className="h-3 w-3" />
                  {interviewedCount} interviewed
                </span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-lg bg-charcoal-100 flex items-center justify-center transition-all duration-300 group-hover:bg-charcoal-200">
              <Calendar className="h-5 w-5 text-charcoal-500 group-hover:text-charcoal-700 transition-colors" />
            </div>
          </div>
          <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-charcoal-300 group-hover:text-charcoal-500 group-hover:translate-x-1 transition-all duration-300" />
        </div>

        {/* Offer Rate */}
        <div
          className="group relative overflow-hidden rounded-xl border border-charcoal-200/60 bg-white p-5 shadow-elevation-sm hover:shadow-elevation-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer animate-fade-in"
          style={getDelay(3)}
          onClick={() => onNavigate('offers')}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-charcoal-400 uppercase tracking-wider">Offer Rate</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-charcoal-900 tracking-tight">
                  {offerRate !== null ? `${offerRate}%` : '—'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-charcoal-500">
                  <Gift className="h-3 w-3" />
                  {offersExtended} offers
                </span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-lg bg-charcoal-100 flex items-center justify-center transition-all duration-300 group-hover:bg-charcoal-200">
              <Gift className="h-5 w-5 text-charcoal-500 group-hover:text-charcoal-700 transition-colors" />
            </div>
          </div>
          <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-charcoal-300 group-hover:text-charcoal-500 group-hover:translate-x-1 transition-all duration-300" />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column (8 cols) */}
        <div className="col-span-8 space-y-6">
          {/* Job Details Card */}
          <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(4)}>
            <div className="px-6 py-4 border-b border-charcoal-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-charcoal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-charcoal-900">Job Details</h3>
                    <p className="text-xs text-charcoal-500">Position requirements and specifications</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <InfoField label="Job Type" value={job.job_type?.replace(/_/g, ' ')} icon={Briefcase} />
                <InfoField label="Priority" value={job.priority} icon={Target} />
                <InfoField label="Location" value={job.is_remote ? 'Remote' : job.is_hybrid ? `Hybrid - ${job.location}` : job.location} icon={MapPin} />
                <InfoField label="Experience" value={job.experience_level} icon={TrendingUp} />
                <InfoField
                  label="Rate Range"
                  value={job.rate_min && job.rate_max ? `$${job.rate_min} - $${job.rate_max}/hr` : job.rate_max ? `Up to $${job.rate_max}/hr` : job.rate_min ? `From $${job.rate_min}/hr` : null}
                  icon={DollarSign}
                />
                <InfoField
                  label="Positions"
                  value={job.positions_count ? `${job.positions_filled || 0}/${job.positions_count} filled` : null}
                  icon={Users}
                />
                <InfoField
                  label="Target Start"
                  value={job.target_start_date ? format(new Date(job.target_start_date), 'MMM d, yyyy') : null}
                  icon={Calendar}
                />
                <InfoField
                  label="Target Fill"
                  value={job.target_fill_date ? format(new Date(job.target_fill_date), 'MMM d, yyyy') : null}
                  icon={Clock}
                />
              </div>

              {/* Description */}
              {job.description && (
                <div className="mt-6 pt-6 border-t border-charcoal-100">
                  <h4 className="text-[11px] font-medium text-charcoal-400 uppercase tracking-wider mb-2">Description</h4>
                  <p className="text-sm text-charcoal-600 whitespace-pre-wrap leading-relaxed">{job.description}</p>
                </div>
              )}

              {/* Requirements */}
              {job.requirements && job.requirements.length > 0 && (
                <div className="mt-6 pt-6 border-t border-charcoal-100">
                  <h4 className="text-[11px] font-medium text-charcoal-400 uppercase tracking-wider mb-3">Requirements</h4>
                  <ul className="space-y-2">
                    {job.requirements.map((req) => (
                      <li key={req.id} className="flex items-start gap-2 text-sm text-charcoal-600">
                        <CheckCircle className="h-4 w-4 mt-0.5 text-forest-500 flex-shrink-0" />
                        <span>{req.description || req.requirement_type}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Skills */}
              {job.skills && job.skills.length > 0 && (
                <div className="mt-6 pt-6 border-t border-charcoal-100">
                  <h4 className="text-[11px] font-medium text-charcoal-400 uppercase tracking-wider mb-3">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <Badge
                        key={skill.id}
                        variant="secondary"
                        className={cn(
                          "bg-charcoal-100 text-charcoal-700 border-charcoal-200",
                          skill.is_required && "bg-blue-50 text-blue-700 border-blue-200"
                        )}
                      >
                        {skill.skill?.name || 'Unknown Skill'}
                        {skill.years_required && ` (${skill.years_required}+ yrs)`}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Client Details Card */}
          {(job.company || job.hiringManagerContact || job.hrContact) && (
            <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(5)}>
              <div className="px-6 py-4 border-b border-charcoal-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-charcoal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-charcoal-900">Client Details</h3>
                    <p className="text-xs text-charcoal-500">Client company and contacts</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <InfoField label="Client Company" value={job.company?.name} icon={Building2} />
                  <InfoField label="Industry" value={job.company?.industry?.replace(/_/g, ' ')} icon={Target} />
                  {job.clientCompany && job.clientCompany.id !== job.company?.id && (
                    <InfoField label="Direct Client" value={job.clientCompany.name} icon={Building2} />
                  )}
                  {job.endClientCompany && (
                    <InfoField label="End Client" value={job.endClientCompany.name} icon={Building2} />
                  )}
                  {job.hiringManagerContact && (
                    <InfoField
                      label="Hiring Manager"
                      value={`${job.hiringManagerContact.first_name} ${job.hiringManagerContact.last_name}`}
                      icon={User}
                    />
                  )}
                  {job.hrContact && (
                    <InfoField
                      label="HR Contact"
                      value={`${job.hrContact.first_name} ${job.hrContact.last_name}`}
                      icon={User}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (4 cols) */}
        <div className="col-span-4 space-y-6">
          {/* Hiring Team Card */}
          <div className="rounded-xl border border-charcoal-200/60 bg-charcoal-50 shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(6)}>
            <div className="px-5 py-4 border-b border-charcoal-200/60">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-charcoal-500" />
                <h3 className="font-semibold text-charcoal-900 text-sm">Hiring Team</h3>
              </div>
            </div>
            <div className="p-5 space-y-4">
              {/* Owner */}
              {job.owner && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-charcoal-200/60">
                    <User className="h-4 w-4 text-charcoal-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-charcoal-900 truncate">{job.owner.full_name}</p>
                    <p className="text-xs text-charcoal-500">Owner</p>
                  </div>
                </div>
              )}
              {/* Team members */}
              {team.slice(0, 4).map((member) => (
                <div key={member.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-charcoal-200/60">
                    <User className="h-4 w-4 text-charcoal-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-charcoal-900 truncate">{member.user?.full_name || 'Unknown'}</p>
                    <p className="text-xs text-charcoal-500 capitalize">{member.role?.replace(/_/g, ' ') || 'Team Member'}</p>
                  </div>
                </div>
              ))}
              {team.length === 0 && !job.owner && (
                <p className="text-sm text-charcoal-400 text-center py-2">No team assigned</p>
              )}
            </div>
          </div>

          {/* Pipeline Summary Card */}
          <div
            className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden cursor-pointer hover:shadow-elevation-md transition-all duration-300 animate-slide-up"
            style={getDelay(7)}
            onClick={() => onNavigate('pipeline')}
          >
            <div className="px-5 py-4 border-b border-charcoal-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-charcoal-500" />
                  <h3 className="font-semibold text-charcoal-900 text-sm">Pipeline</h3>
                </div>
                <ArrowRight className="h-4 w-4 text-charcoal-400" />
              </div>
            </div>
            <div className="p-5 space-y-3">
              <PipelineRow label="Sourced" count={submissionsByStatus['sourced'] || 0} />
              <PipelineRow label="Screening" count={submissionsByStatus['screening'] || 0} />
              <PipelineRow label="Submitted" count={(submissionsByStatus['submitted_to_client'] || 0) + (submissionsByStatus['client_review'] || 0)} />
              <PipelineRow label="Interviewing" count={submissionsByStatus['client_interview'] || 0} />
              <PipelineRow label="Offer Stage" count={submissionsByStatus['offer_stage'] || 0} />
              <PipelineRow label="Placed" count={submissionsByStatus['placed'] || 0} highlight />
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(8)}>
            <div className="px-5 py-4 border-b border-charcoal-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-charcoal-500" />
                  <h3 className="font-semibold text-charcoal-900 text-sm">Recent Activity</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-charcoal-500 hover:text-charcoal-700 -mr-2"
                  onClick={() => onNavigate('activities')}
                >
                  View All
                </Button>
              </div>
            </div>
            <div className="p-5">
              {recentActivities.length > 0 ? (
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-charcoal-100 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-4 w-4 text-charcoal-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-charcoal-900 truncate">{activity.subject || activity.activity_type?.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-charcoal-500">
                          {activity.creator?.full_name} · {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-charcoal-400 text-center py-4">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper Components
function InfoField({
  label,
  value,
  icon: Icon
}: {
  label: string
  value: string | null | undefined
  icon?: typeof Briefcase
}) {
  return (
    <div>
      <p className="text-[11px] font-medium text-charcoal-400 uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-charcoal-400" />}
        <p className="text-sm text-charcoal-900 capitalize">{value || '—'}</p>
      </div>
    </div>
  )
}

function PipelineRow({
  label,
  count,
  highlight
}: {
  label: string
  count: number
  highlight?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-charcoal-600">{label}</span>
      <span className={cn(
        "text-sm font-semibold tabular-nums",
        highlight ? "text-forest-600" : "text-charcoal-900"
      )}>
        {count}
      </span>
    </div>
  )
}

export default JobOverviewSection
