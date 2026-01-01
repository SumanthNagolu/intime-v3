'use client'

import * as React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Pencil,
  ArrowRight,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  Clock,
  DollarSign,
  Calendar,
  Send,
  Award,
  ShieldCheck,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type {
  CandidateData,
  CandidateSkill,
  CandidateSubmission,
  CandidateStats,
} from '@/types/candidate-workspace'
import { PROFICIENCY_LABELS } from '@/types/candidate-workspace'
import { formatDistanceToNow } from 'date-fns'
import { PIPELINE_STAGES, getStageFromStatus } from '@/lib/pipeline/stages'

interface CandidateSummarySectionProps {
  candidate: CandidateData
  skills: CandidateSkill[]
  submissions: CandidateSubmission[]
  stats: CandidateStats
  onNavigate: (section: string) => void
}

/**
 * CandidateSummarySection - Summary screen with stats, profile, skills, and active submissions
 */
export function CandidateSummarySection({
  candidate,
  skills,
  submissions,
  stats,
  onNavigate,
}: CandidateSummarySectionProps) {
  // Get active submissions (top 5)
  const activeSubmissions = submissions
    .filter((s) => !['placed', 'rejected', 'withdrawn'].includes(s.status))
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Experience"
          value={candidate.yearsExperience ? `${candidate.yearsExperience} yrs` : '-'}
          icon={<Briefcase className="h-5 w-5" />}
        />
        <StatCard
          label="Desired Rate"
          value={candidate.desiredRate ? `$${candidate.desiredRate}/hr` : '-'}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          label="Availability"
          value={candidate.availability || 'Not Set'}
          icon={<Clock className="h-5 w-5" />}
        />
        <StatCard
          label="Submissions"
          value={stats.totalSubmissions.toString()}
          subtitle={`${stats.activeSubmissions} active`}
          icon={<Send className="h-5 w-5" />}
        />
      </div>

      {/* Profile Details Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Profile Details</CardTitle>
          <Button variant="outline" size="sm">
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <DetailRow label="Full Name" value={candidate.fullName} />
            <DetailRow
              label="Email"
              value={candidate.email}
              icon={<Mail className="h-4 w-4 text-charcoal-400" />}
            />
            <DetailRow
              label="Phone"
              value={candidate.phone}
              icon={<Phone className="h-4 w-4 text-charcoal-400" />}
            />
            <DetailRow
              label="Mobile"
              value={candidate.mobile}
              icon={<Phone className="h-4 w-4 text-charcoal-400" />}
            />
            <DetailRow
              label="Location"
              value={candidate.location}
              icon={<MapPin className="h-4 w-4 text-charcoal-400" />}
            />
            <DetailRow
              label="Willing to Relocate"
              value={candidate.willingToRelocate ? 'Yes' : 'No'}
            />
            <DetailRow label="Current Title" value={candidate.title} />
            <DetailRow label="Current Company" value={candidate.currentCompany} />
            <DetailRow
              label="Desired Salary"
              value={candidate.desiredSalary ? `$${candidate.desiredSalary.toLocaleString()}/yr` : null}
            />
            <DetailRow label="Notice Period" value={candidate.noticePeriod} />
          </div>
        </CardContent>
      </Card>

      {/* Work Authorization Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Work Authorization
          </CardTitle>
          <Button variant="outline" size="sm">
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <DetailRow label="Work Authorization" value={candidate.workAuthorization} />
            <DetailRow label="Visa Status" value={candidate.visaStatus} />
            <DetailRow
              label="Visa Expiry"
              value={candidate.visaExpiryDate ? new Date(candidate.visaExpiryDate).toLocaleDateString() : null}
            />
            <DetailRow label="Clearance Level" value={candidate.clearanceLevel} />
          </div>
        </CardContent>
      </Card>

      {/* Skills Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            Skills
            {skills.length > 0 && (
              <span className="ml-2 text-sm font-normal text-charcoal-500">
                ({skills.length})
              </span>
            )}
          </CardTitle>
          <Button variant="outline" size="sm">
            <Pencil className="h-4 w-4 mr-2" />
            Manage Skills
          </Button>
        </CardHeader>
        <CardContent>
          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => {
                const proficiency = PROFICIENCY_LABELS[skill.proficiencyLevel] || PROFICIENCY_LABELS[1]
                return (
                  <div
                    key={skill.id}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-lg border',
                      proficiency.color
                    )}
                  >
                    <span className="font-medium">{skill.skillName}</span>
                    {skill.yearsExperience && (
                      <span className="text-xs opacity-75">
                        ({skill.yearsExperience}y)
                      </span>
                    )}
                    {skill.isVerified && (
                      <ShieldCheck className="h-3.5 w-3.5" />
                    )}
                    {skill.isPrimary && (
                      <Award className="h-3.5 w-3.5" />
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-charcoal-500">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No skills added yet</p>
              <Button variant="outline" size="sm" className="mt-2">
                Add Skills
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resume Card */}
      {candidate.resumeUrl && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Resume
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer">
                  View Resume
                </a>
              </Button>
              <Button variant="outline" size="sm">
                Update Resume
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-charcoal-600">
              {candidate.resumeUpdatedAt ? (
                <span>
                  Last updated {formatDistanceToNow(new Date(candidate.resumeUpdatedAt), { addSuffix: true })}
                </span>
              ) : (
                <span>Resume on file</span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Submissions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            Active Submissions
            {activeSubmissions.length > 0 && (
              <span className="ml-2 text-sm font-normal text-charcoal-500">
                ({stats.activeSubmissions})
              </span>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onNavigate('submissions')}>
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          {activeSubmissions.length > 0 ? (
            <div className="divide-y divide-charcoal-100">
              {activeSubmissions.map((submission) => {
                const stage = PIPELINE_STAGES.find((s) => s.id === getStageFromStatus(submission.status))
                return (
                  <div key={submission.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-charcoal-900">
                        {submission.job?.title || 'Unknown Job'}
                      </div>
                      <div className="text-sm text-charcoal-500">
                        {submission.account?.name || 'Unknown Client'}
                        {submission.submittedAt && (
                          <> \u2022 {formatDistanceToNow(new Date(submission.submittedAt), { addSuffix: true })}</>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {stage && (
                        <Badge className={cn('capitalize', stage.bgColor, stage.textColor)}>
                          {stage.label}
                        </Badge>
                      )}
                      <Link
                        href={`/employee/recruiting/submissions/${submission.id}`}
                        className="text-sm text-gold-600 hover:text-gold-700"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-charcoal-500">
              <Send className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No active submissions</p>
              <Button variant="outline" size="sm" className="mt-2">
                Submit to Job
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Stat Card Component
function StatCard({
  label,
  value,
  subtitle,
  icon,
}: {
  label: string
  value: string
  subtitle?: string
  icon: React.ReactNode
}) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-charcoal-100 rounded-lg text-charcoal-600">
            {icon}
          </div>
          <div>
            <div className="text-2xl font-semibold text-charcoal-900">{value}</div>
            <div className="text-sm text-charcoal-500">{label}</div>
            {subtitle && (
              <div className="text-xs text-charcoal-400">{subtitle}</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Detail Row Component
function DetailRow({
  label,
  value,
  icon,
}: {
  label: string
  value: string | null | undefined
  icon?: React.ReactNode
}) {
  return (
    <div>
      <div className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className="text-sm text-charcoal-900 flex items-center gap-2">
        {icon}
        {value || <span className="text-charcoal-400">-</span>}
      </div>
    </div>
  )
}

export default CandidateSummarySection
