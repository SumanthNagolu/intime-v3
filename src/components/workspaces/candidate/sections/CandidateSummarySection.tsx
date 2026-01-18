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
  Building2,
  Globe,
  Linkedin,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type {
  CandidateData,
  CandidateSkill,
  CandidateWorkHistory,
  CandidateEducation,
  CandidateCertification,
  CandidateSubmission,
  CandidateStats,
} from '@/types/candidate-workspace'
import { PROFICIENCY_LABELS, EMPLOYMENT_TYPE_LABELS, DEGREE_TYPE_LABELS } from '@/types/candidate-workspace'
import { formatDistanceToNow } from 'date-fns'
import { PIPELINE_STAGES, getStageFromStatus } from '@/lib/pipeline/stages'

interface CandidateSummarySectionProps {
  candidate: CandidateData
  skills: CandidateSkill[]
  workHistory: CandidateWorkHistory[]
  education: CandidateEducation[]
  certifications: CandidateCertification[]
  submissions: CandidateSubmission[]
  stats: CandidateStats
  onNavigate: (section: string) => void
}

// Format availability for display
function formatAvailability(availability: string | null): string {
  if (!availability) return 'Not Set'
  const labels: Record<string, string> = {
    immediate: 'Immediately Available',
    '2_weeks': '2 Weeks Notice',
    '30_days': '30 Days Notice',
    '60_days': '60 Days Notice',
    not_available: 'Not Currently Available',
  }
  return labels[availability] || availability
}

// Format rate for display
function formatRate(rate: number | null, currency = 'USD', rateType = 'hourly'): string {
  if (!rate) return '-'
  const symbols: Record<string, string> = { USD: '$', CAD: 'C$', EUR: '€', GBP: '£', INR: '₹' }
  const suffixes: Record<string, string> = { hourly: '/hr', annual: '/yr', per_diem: '/day' }
  return `${symbols[currency] || '$'}${rate.toLocaleString()}${suffixes[rateType] || '/hr'}`
}

// Format date range for work history/education
function formatDateRange(startDate: string | null, endDate: string | null, isCurrent: boolean): string {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }
  if (!startDate) return isCurrent ? 'Present' : '-'
  const start = formatDate(startDate)
  const end = isCurrent ? 'Present' : (endDate ? formatDate(endDate) : '-')
  return `${start} - ${end}`
}

// Format employment types for display
function formatEmploymentTypes(types: string[] | null): string {
  if (!types || types.length === 0) return '-'
  const labels: Record<string, string> = {
    full_time: 'Full-Time',
    contract: 'Contract',
    contract_to_hire: 'C2H',
    part_time: 'Part-Time',
  }
  return types.map(t => labels[t] || t).join(', ')
}

// Format work modes for display
function formatWorkModes(modes: string[] | null): string {
  if (!modes || modes.length === 0) return '-'
  const labels: Record<string, string> = {
    on_site: 'On-Site',
    remote: 'Remote',
    hybrid: 'Hybrid',
  }
  return modes.map(m => labels[m] || m).join(', ')
}

import { CandidateOverviewEditDialog } from '../dialogs/CandidateOverviewEditDialog'
import { CandidateWorkAuthEditDialog } from '../dialogs/CandidateWorkAuthEditDialog'
import { CandidateSkillsEditDialog } from '../dialogs/CandidateSkillsEditDialog'

/**
 * CandidateSummarySection - Comprehensive summary screen with all candidate info
 * Shows stats, profile, professional experience, education, skills, certifications, and submissions
 */
export function CandidateSummarySection({
  candidate,
  skills,
  workHistory,
  education,
  certifications,
  submissions,
  stats,
  onNavigate,
}: CandidateSummarySectionProps) {
  const [showProfileEdit, setShowProfileEdit] = React.useState(false)
  const [showAuthEdit, setShowAuthEdit] = React.useState(false)
  const [showSkillsEdit, setShowSkillsEdit] = React.useState(false)

  // Get active submissions (top 5)
  const activeSubmissions = submissions
    .filter((s) => !['placed', 'rejected', 'withdrawn'].includes(s.status))
    .slice(0, 5)

  // Get top 3 work history entries
  const recentJobs = workHistory.slice(0, 3)

  // Get most recent education
  const recentEducation = education.slice(0, 2)

  // Get active certifications
  const activeCerts = certifications.filter(c => c.expiryStatus !== 'expired').slice(0, 4)

  return (
    <div className="space-y-6">
      {/* Edit Dialogs */}
      <CandidateOverviewEditDialog open={showProfileEdit} onOpenChange={setShowProfileEdit} />
      <CandidateWorkAuthEditDialog open={showAuthEdit} onOpenChange={setShowAuthEdit} />
      <CandidateSkillsEditDialog open={showSkillsEdit} onOpenChange={setShowSkillsEdit} />

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Experience"
          value={candidate.yearsExperience ? `${candidate.yearsExperience} yrs` : '-'}
          icon={<Briefcase className="h-5 w-5" />}
        />
        <StatCard
          label="Desired Rate"
          value={formatRate(candidate.desiredRate, candidate.rateCurrency, candidate.rateType || 'hourly')}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          label="Availability"
          value={formatAvailability(candidate.availability)}
          subtitle={candidate.noticePeriod || undefined}
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
          <Button variant="outline" size="sm" onClick={() => setShowProfileEdit(true)}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-x-8 gap-y-4">
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
              label="LinkedIn"
              value={candidate.linkedinUrl ? 'View Profile' : null}
              href={candidate.linkedinUrl || undefined}
              icon={<Linkedin className="h-4 w-4 text-charcoal-400" />}
            />
            <DetailRow
              label="Location"
              value={candidate.location || (candidate.city && candidate.state ? `${candidate.city}, ${candidate.state}` : candidate.city)}
              icon={<MapPin className="h-4 w-4 text-charcoal-400" />}
            />
            <DetailRow
              label="Willing to Relocate"
              value={candidate.willingToRelocate ? 'Yes' : 'No'}
            />
            <DetailRow label="Current Title" value={candidate.title} />
            <DetailRow
              label="Current Company"
              value={candidate.currentCompany}
              icon={<Building2 className="h-4 w-4 text-charcoal-400" />}
            />
            <DetailRow
              label="Years Experience"
              value={candidate.yearsExperience ? `${candidate.yearsExperience} years` : null}
            />
          </div>
          {/* Professional Summary */}
          {candidate.professionalSummary && (
            <div className="mt-4 pt-4 border-t border-charcoal-100">
              <div className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-2">
                Professional Summary
              </div>
              <p className="text-sm text-charcoal-700 whitespace-pre-wrap">
                {candidate.professionalSummary}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Employment Preferences Card */}
      <Card>
        <CardHeader>
          <CardTitle>Employment Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <div className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-2">
                Employment Types
              </div>
              <div className="flex flex-wrap gap-1.5">
                {candidate.employmentTypes?.map((type) => (
                  <Badge key={type} variant="secondary" className="capitalize">
                    {EMPLOYMENT_TYPE_LABELS[type] || type.replace('_', ' ')}
                  </Badge>
                )) || <span className="text-charcoal-400 text-sm">Not specified</span>}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-2">
                Work Mode
              </div>
              <div className="flex flex-wrap gap-1.5">
                {candidate.workModes?.map((mode) => (
                  <Badge key={mode} variant="secondary" className="capitalize">
                    {mode === 'on_site' ? 'On-Site' : mode === 'remote' ? 'Remote' : 'Hybrid'}
                  </Badge>
                )) || <span className="text-charcoal-400 text-sm">Not specified</span>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compensation Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Compensation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-x-8 gap-y-4">
            <DetailRow label="Rate Type" value={candidate.rateType ? candidate.rateType.charAt(0).toUpperCase() + candidate.rateType.slice(1) : null} />
            <DetailRow
              label="Desired Rate"
              value={candidate.desiredRate ? formatRate(candidate.desiredRate, candidate.rateCurrency, candidate.rateType || 'hourly') : null}
            />
            <DetailRow
              label="Minimum Rate"
              value={candidate.minimumRate ? formatRate(candidate.minimumRate, candidate.rateCurrency, candidate.rateType || 'hourly') : null}
            />
            <DetailRow label="Currency" value={candidate.rateCurrency} />
            <DetailRow label="Negotiable" value={candidate.isNegotiable === true ? 'Yes' : candidate.isNegotiable === false ? 'No' : null} />
          </div>
          {candidate.compensationNotes && (
            <div className="mt-4 pt-4 border-t border-charcoal-100">
              <div className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-2">
                Compensation Notes
              </div>
              <p className="text-sm text-charcoal-700">{candidate.compensationNotes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Work Authorization Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Work Authorization
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => setShowAuthEdit(true)}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-x-8 gap-y-4">
            <DetailRow label="Work Authorization" value={candidate.workAuthorization} />
            <DetailRow label="Visa Status" value={formatVisaStatus(candidate.visaStatus)} />
            <DetailRow
              label="Visa Expiry"
              value={candidate.visaExpiryDate ? new Date(candidate.visaExpiryDate).toLocaleDateString() : null}
            />
            <DetailRow label="Requires Sponsorship" value={candidate.requiresSponsorship === true ? 'Yes' : candidate.requiresSponsorship === false ? 'No' : null} />
            <DetailRow label="Current Sponsor" value={candidate.currentSponsor} />
            <DetailRow label="Is Transferable" value={candidate.isTransferable === true ? 'Yes' : candidate.isTransferable === false ? 'No' : null} />
            <DetailRow label="Clearance Level" value={candidate.clearanceLevel} />
          </div>
        </CardContent>
      </Card>

      {/* Availability Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Availability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-x-8 gap-y-4">
            <DetailRow label="Availability" value={formatAvailability(candidate.availability)} />
            <DetailRow
              label="Available From"
              value={candidate.availableFrom ? new Date(candidate.availableFrom).toLocaleDateString() : null}
            />
            <DetailRow label="Notice Period" value={candidate.noticePeriod} />
            <DetailRow label="Willing to Relocate" value={candidate.willingToRelocate ? 'Yes' : 'No'} />
            <DetailRow label="Open to Remote" value={candidate.isRemoteOk ? 'Yes' : 'No'} />
            <DetailRow label="Relocation Preferences" value={candidate.relocationPreferences} />
          </div>
        </CardContent>
      </Card>

      {/* Work History Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Work History
            {workHistory.length > 0 && (
              <span className="ml-2 text-sm font-normal text-charcoal-500">
                ({workHistory.length})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentJobs.length > 0 ? (
            <div className="space-y-4">
              {recentJobs.map((job, index) => (
                <div key={job.id} className={cn(index > 0 && 'pt-4 border-t border-charcoal-100')}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-charcoal-900">{job.jobTitle}</div>
                      <div className="text-sm text-charcoal-600 flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5" />
                        {job.companyName}
                        {job.employmentTypeLabel && (
                          <Badge variant="outline" className="text-xs">{job.employmentTypeLabel}</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-charcoal-500 text-right">
                      <div>{formatDateRange(job.startDate, job.endDate, job.isCurrent)}</div>
                      {job.location && (
                        <div className="flex items-center gap-1 justify-end text-xs text-charcoal-400">
                          <MapPin className="h-3 w-3" />
                          {job.location}
                        </div>
                      )}
                    </div>
                  </div>
                  {job.description && (
                    <p className="text-sm text-charcoal-600 mt-2">{job.description}</p>
                  )}
                  {job.achievements.length > 0 && (
                    <ul className="mt-2 text-sm text-charcoal-600 list-disc list-inside">
                      {job.achievements.slice(0, 3).map((achievement, i) => (
                        <li key={i}>{achievement}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
              {workHistory.length > 3 && (
                <div className="text-center pt-2">
                  <span className="text-sm text-charcoal-500">
                    +{workHistory.length - 3} more positions
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-charcoal-500">
              <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No work history added</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Education Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Education
            {education.length > 0 && (
              <span className="ml-2 text-sm font-normal text-charcoal-500">
                ({education.length})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentEducation.length > 0 ? (
            <div className="space-y-4">
              {recentEducation.map((edu, index) => (
                <div key={edu.id} className={cn(index > 0 && 'pt-4 border-t border-charcoal-100')}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-charcoal-900">
                        {edu.degreeDisplay || edu.degreeName || edu.degreeTypeLabel || 'Degree'}
                      </div>
                      <div className="text-sm text-charcoal-600">{edu.institutionName}</div>
                    </div>
                    <div className="text-sm text-charcoal-500 text-right">
                      <div>{formatDateRange(edu.startDate, edu.endDate, edu.isCurrent)}</div>
                      {edu.gpa && (
                        <div className="text-xs text-charcoal-400">GPA: {edu.gpa}</div>
                      )}
                    </div>
                  </div>
                  {edu.honors && (
                    <div className="text-sm text-charcoal-600 mt-1 italic">{edu.honors}</div>
                  )}
                </div>
              ))}
              {education.length > 2 && (
                <div className="text-center pt-2">
                  <span className="text-sm text-charcoal-500">
                    +{education.length - 2} more entries
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-charcoal-500">
              <Award className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No education added</p>
            </div>
          )}
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
          <Button variant="outline" size="sm" onClick={() => setShowSkillsEdit(true)}>
            <Pencil className="h-4 w-4 mr-2" />
            Manage Skills
          </Button>
        </CardHeader>
        <CardContent>
          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => {
                const proficiency = PROFICIENCY_LABELS[skill.proficiencyLevel] || PROFICIENCY_LABELS[2]
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
              <Button variant="outline" size="sm" className="mt-2" onClick={() => setShowSkillsEdit(true)}>
                Add Skills
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certifications Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Certifications
            {certifications.length > 0 && (
              <span className="ml-2 text-sm font-normal text-charcoal-500">
                ({certifications.length})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeCerts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {activeCerts.map((cert) => (
                <div key={cert.id} className="p-3 border border-charcoal-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-charcoal-900">
                        {cert.acronym || cert.name}
                      </div>
                      {cert.acronym && cert.name !== cert.acronym && (
                        <div className="text-sm text-charcoal-600">{cert.name}</div>
                      )}
                      {cert.issuingOrganization && (
                        <div className="text-xs text-charcoal-500">{cert.issuingOrganization}</div>
                      )}
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        cert.expiryStatus === 'lifetime' && 'bg-green-50 text-green-700 border-green-200',
                        cert.expiryStatus === 'active' && 'bg-blue-50 text-blue-700 border-blue-200',
                        cert.expiryStatus === 'expiring_soon' && 'bg-amber-50 text-amber-700 border-amber-200',
                        cert.expiryStatus === 'expired' && 'bg-red-50 text-red-700 border-red-200'
                      )}
                    >
                      {cert.expiryStatus === 'lifetime' ? 'Lifetime' : cert.expiryStatus === 'expiring_soon' ? 'Expiring Soon' : cert.expiryStatus === 'expired' ? 'Expired' : 'Active'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-charcoal-500">
              <ShieldCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No certifications added</p>
            </div>
          )}
          {certifications.length > 4 && (
            <div className="text-center pt-4">
              <span className="text-sm text-charcoal-500">
                +{certifications.length - 4} more certifications
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Source & Tracking Card */}
      <Card>
        <CardHeader>
          <CardTitle>Source & Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-x-8 gap-y-4">
            <DetailRow label="Lead Source" value={candidate.source} />
            <DetailRow label="Source Details" value={candidate.sourceDetails} />
            <DetailRow label="Referred By" value={candidate.referredBy} />
            <DetailRow label="On Hotlist" value={candidate.isOnHotlist ? 'Yes' : 'No'} />
            <div className="col-span-2">
              {candidate.tags && candidate.tags.length > 0 && (
                <>
                  <div className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-2">
                    Tags
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          {candidate.hotlistNotes && (
            <div className="mt-4 pt-4 border-t border-charcoal-100">
              <div className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-2">
                Hotlist Notes
              </div>
              <p className="text-sm text-charcoal-700">{candidate.hotlistNotes}</p>
            </div>
          )}
          {candidate.internalNotes && (
            <div className="mt-4 pt-4 border-t border-charcoal-100">
              <div className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-2">
                Internal Notes
              </div>
              <p className="text-sm text-charcoal-700">{candidate.internalNotes}</p>
            </div>
          )}
        </CardContent>
      </Card>

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
              <Button variant="outline" size="sm" className="mt-2" onClick={() => onNavigate('submissions')}>
                Submissions Tab
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Format visa status for display
function formatVisaStatus(status: string | null): string | null {
  if (!status) return null
  const labels: Record<string, string> = {
    us_citizen: 'US Citizen',
    green_card: 'Green Card',
    h1b: 'H1B',
    l1: 'L1',
    tn: 'TN',
    opt: 'OPT',
    cpt: 'CPT',
    ead: 'EAD',
    other: 'Other',
  }
  return labels[status] || status
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
  href,
}: {
  label: string
  value: string | null | undefined
  icon?: React.ReactNode
  href?: string
}) {
  return (
    <div>
      <div className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className="text-sm text-charcoal-900 flex items-center gap-2">
        {icon}
        {href && value ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-gold-600 hover:text-gold-700 hover:underline">
            {value}
          </a>
        ) : (
          value || <span className="text-charcoal-400">-</span>
        )}
      </div>
    </div>
  )
}

export default CandidateSummarySection
