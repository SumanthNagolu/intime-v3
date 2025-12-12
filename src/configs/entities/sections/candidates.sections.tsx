'use client'

/**
 * PCF-Compatible Section Adapters for Candidates
 *
 * These wrapper components adapt the existing Candidate detail components
 * to the PCF SectionConfig interface: { entityId: string; entity?: unknown }
 *
 * Callbacks are handled via the PCF event system (window events).
 * The detail page listens for these events and manages dialog state.
 */

import { useRouter } from 'next/navigation'
import { Candidate, CANDIDATE_AVAILABILITY_CONFIG } from '../candidates.config'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { trpc } from '@/lib/trpc/client'
import {
  User,
  Star,
  GraduationCap,
  MapPin,
  DollarSign,
  Clock,
  FileText,
  Send,
  Play,
  ClipboardCheck,
  CheckCircle,
  XCircle,
  Download,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { ActivitiesSection } from '@/components/pcf/sections/ActivitiesSection'

/**
 * Dispatch a dialog open event for the Candidate entity
 * The detail page listens for this and manages dialog state
 */
function dispatchCandidateDialog(dialogId: string, candidateId: string) {
  window.dispatchEvent(
    new CustomEvent('openCandidateDialog', {
      detail: { dialogId, candidateId },
    })
  )
}

// ==========================================
// PCF Section Adapters
// ==========================================

interface PCFSectionProps {
  entityId: string
  entity?: unknown
}

const VISA_CONFIG: Record<string, { label: string; color: string }> = {
  us_citizen: { label: 'US Citizen', color: 'bg-green-100 text-green-700' },
  green_card: { label: 'Green Card', color: 'bg-green-100 text-green-700' },
  h1b: { label: 'H1B', color: 'bg-blue-100 text-blue-700' },
  l1: { label: 'L1', color: 'bg-blue-100 text-blue-700' },
  tn: { label: 'TN', color: 'bg-purple-100 text-purple-700' },
  opt: { label: 'OPT', color: 'bg-amber-100 text-amber-700' },
  cpt: { label: 'CPT', color: 'bg-amber-100 text-amber-700' },
  ead: { label: 'EAD', color: 'bg-cyan-100 text-cyan-700' },
  other: { label: 'Other', color: 'bg-charcoal-100 text-charcoal-600' },
}

/**
 * Overview Section Adapter
 */
export function CandidateOverviewSectionPCF({ entityId, entity }: PCFSectionProps) {
  const candidate = entity as Candidate | undefined

  if (!candidate) return null

  const visaConfig = VISA_CONFIG[(candidate as any).visa_status] || VISA_CONFIG.other
  const skills = candidate.skills || []

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Professional Summary */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Professional Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {(candidate as any).summary || candidate.professional_summary ? (
              <div className="prose prose-sm max-w-none text-charcoal-700 whitespace-pre-wrap">
                {(candidate as any).summary || candidate.professional_summary}
              </div>
            ) : (
              <p className="text-charcoal-500 italic">No summary provided</p>
            )}
          </CardContent>
        </Card>

        {/* Skills */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent>
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => {
                  const skillName = typeof skill === 'string' ? skill : skill.skill_name
                  const yearsExp = typeof skill === 'string' ? undefined : skill.years_experience
                  return (
                    <Badge key={skillName} variant="secondary">
                      {skillName}
                      {yearsExp && (
                        <span className="ml-1 text-xs text-charcoal-400">
                          ({yearsExp}y)
                        </span>
                      )}
                    </Badge>
                  )
                })}
              </div>
            ) : (
              <p className="text-charcoal-500 italic">No skills listed</p>
            )}
          </CardContent>
        </Card>

        {/* Hotlist Notes */}
        {candidate.is_on_hotlist && (candidate as any).hotlist_notes && (
          <Card className="bg-white border-gold-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-4 h-4 text-gold-500" />
                Hotlist Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-charcoal-700 whitespace-pre-wrap">
                {(candidate as any).hotlist_notes}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Details */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-charcoal-500">Visa Status</span>
              <Badge className={visaConfig.color}>{visaConfig.label}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-charcoal-500">Availability</span>
              <span className="text-sm font-medium">
                {CANDIDATE_AVAILABILITY_CONFIG[candidate.availability || '']?.label ||
                  candidate.availability ||
                  'Unknown'}
              </span>
            </div>
            {candidate.minimum_rate && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-charcoal-500">Min Rate</span>
                <span className="text-sm font-medium">${candidate.minimum_rate}/hr</span>
              </div>
            )}
            {candidate.desired_rate && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-charcoal-500">Desired Rate</span>
                <span className="text-sm font-medium">${candidate.desired_rate}/hr</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-charcoal-500">Experience</span>
              <span className="text-sm font-medium">
                {candidate.years_experience ?? 0} years
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Source Info */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Source</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-charcoal-500">Lead Source</span>
              <span className="text-sm font-medium capitalize">
                {candidate.lead_source?.replace(/_/g, ' ') || 'Unknown'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-charcoal-500">Sourced By</span>
              <span className="text-sm font-medium">
                {candidate.sourced_by || 'Unknown'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-charcoal-500">Added</span>
              <span className="text-sm font-medium">
                {candidate.created_at
                  ? formatDistanceToNow(new Date(candidate.created_at), { addSuffix: true })
                  : 'Unknown'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/**
 * Screening Section Adapter
 */
export function CandidateScreeningSectionPCF({ entityId, entity }: PCFSectionProps) {
  const candidate = entity as Candidate | undefined

  // Get candidate's screenings
  const screeningsQuery = trpc.ats.candidates.getCandidateScreenings.useQuery({
    candidateId: entityId,
  })

  const screenings = screeningsQuery.data || []

  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Screening History</CardTitle>
        <Button size="sm" onClick={() => dispatchCandidateDialog('startScreening', entityId)}>
          <ClipboardCheck className="w-4 h-4 mr-2" />
          Start New Screening
        </Button>
      </CardHeader>
      <CardContent>
        {screeningsQuery.isLoading ? (
          <div className="py-8 text-center text-charcoal-500">Loading screenings...</div>
        ) : screenings.length === 0 ? (
          <div className="text-center py-8">
            <ClipboardCheck className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
            <h3 className="text-lg font-medium text-charcoal-900 mb-2">No screenings yet</h3>
            <p className="text-charcoal-500 mb-4">
              Start a phone screening to evaluate this candidate
            </p>
            <Button onClick={() => dispatchCandidateDialog('startScreening', entityId)}>
              <ClipboardCheck className="w-4 h-4 mr-2" />
              Start Screening
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {screenings.map((screening: any) => (
              <div
                key={screening.id}
                className={cn(
                  'flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-charcoal-50 transition-colors',
                  screening.status === 'in_progress' && 'border-blue-300 bg-blue-50/50'
                )}
                onClick={() => {
                  if (screening.status === 'in_progress') {
                    dispatchCandidateDialog('resumeScreening', entityId)
                  }
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      screening.status === 'completed'
                        ? screening.recommendation === 'submit'
                          ? 'bg-green-100'
                          : screening.recommendation === 'reject'
                            ? 'bg-red-100'
                            : 'bg-amber-100'
                        : 'bg-blue-100'
                    )}
                  >
                    {screening.status === 'completed' ? (
                      screening.recommendation === 'submit' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : screening.recommendation === 'reject' ? (
                        <XCircle className="w-5 h-5 text-red-600" />
                      ) : (
                        <ClipboardCheck className="w-5 h-5 text-amber-600" />
                      )
                    ) : (
                      <Play className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-charcoal-900">
                      {Array.isArray(screening.job)
                        ? screening.job[0]?.title
                        : screening.job?.title || 'General Screening'}
                    </h4>
                    <p className="text-sm text-charcoal-500">
                      Started{' '}
                      {formatDistanceToNow(new Date(screening.started_at), { addSuffix: true })}
                      {screening.completed_at && (
                        <>
                          {' '}
                          • Completed{' '}
                          {formatDistanceToNow(new Date(screening.completed_at), {
                            addSuffix: true,
                          })}
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {screening.knockout_passed !== null && (
                    <Badge
                      className={
                        screening.knockout_passed
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }
                    >
                      {screening.knockout_passed ? 'Knockout Passed' : 'Knockout Failed'}
                    </Badge>
                  )}
                  {screening.overall_score !== null && (
                    <Badge variant="outline" className="font-mono">
                      Score: {screening.overall_score.toFixed(1)}
                    </Badge>
                  )}
                  <Badge
                    className={cn(
                      screening.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-700'
                        : screening.recommendation === 'submit'
                          ? 'bg-green-100 text-green-700'
                          : screening.recommendation === 'submit_with_reservations'
                            ? 'bg-amber-100 text-amber-700'
                            : screening.recommendation === 'reject'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-charcoal-100 text-charcoal-700'
                    )}
                  >
                    {screening.status === 'in_progress'
                      ? 'In Progress'
                      : screening.recommendation
                          ?.replace(/_/g, ' ')
                          .replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Unknown'}
                  </Badge>
                  {screening.status === 'in_progress' && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        dispatchCandidateDialog('resumeScreening', entityId)
                      }}
                    >
                      Resume
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Profiles Section Adapter
 */
export function CandidateProfilesSectionPCF({ entityId, entity }: PCFSectionProps) {
  const candidate = entity as Candidate | undefined

  // Get candidate's profiles
  const profilesQuery = trpc.ats.candidates.getCandidateProfiles.useQuery({
    candidateId: entityId,
  })

  const profiles = profilesQuery.data || []

  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Candidate Profiles</CardTitle>
        <Button size="sm" onClick={() => dispatchCandidateDialog('createProfile', entityId)}>
          <FileText className="w-4 h-4 mr-2" />
          Create Profile
        </Button>
      </CardHeader>
      <CardContent>
        {profilesQuery.isLoading ? (
          <div className="py-8 text-center text-charcoal-500">Loading profiles...</div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
            <h3 className="text-lg font-medium text-charcoal-900 mb-2">No profiles yet</h3>
            <p className="text-charcoal-500 mb-4">
              Create a formatted profile to submit to clients
            </p>
            <Button onClick={() => dispatchCandidateDialog('createProfile', entityId)}>
              <FileText className="w-4 h-4 mr-2" />
              Create Profile
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {profiles.map((profile: any) => (
              <div
                key={profile.id}
                className={cn(
                  'flex items-center justify-between p-4 border rounded-lg hover:bg-charcoal-50 transition-colors',
                  profile.status === 'finalized' && 'border-green-300 bg-green-50/50'
                )}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      profile.status === 'finalized' ? 'bg-green-100' : 'bg-charcoal-100'
                    )}
                  >
                    <FileText
                      className={cn(
                        'w-5 h-5',
                        profile.status === 'finalized' ? 'text-green-600' : 'text-charcoal-600'
                      )}
                    />
                  </div>
                  <div>
                    <h4 className="font-medium text-charcoal-900">
                      {Array.isArray(profile.job)
                        ? profile.job[0]?.title
                        : profile.job?.title || 'General Profile'}
                    </h4>
                    <p className="text-sm text-charcoal-500">
                      {profile.template_type} template • Created{' '}
                      {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
                      {profile.finalized_at && (
                        <>
                          {' '}
                          • Finalized{' '}
                          {formatDistanceToNow(new Date(profile.finalized_at), { addSuffix: true })}
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    className={cn(
                      profile.status === 'finalized'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    )}
                  >
                    {profile.status === 'finalized' ? 'Finalized' : 'Draft'}
                  </Badge>
                  {profile.status === 'draft' && (
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                  )}
                  {profile.status === 'finalized' && (
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-1" />
                      Export
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Submissions Section Adapter
 */
export function CandidateSubmissionsSectionPCF({ entityId, entity }: PCFSectionProps) {
  const router = useRouter()
  const candidate = entity as Candidate | undefined
  const submissions = (candidate as any)?.submissions || []

  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Submissions</CardTitle>
        <Button size="sm" onClick={() => dispatchCandidateDialog('submitToJob', entityId)}>
          <Send className="w-4 h-4 mr-2" />
          Submit to Job
        </Button>
      </CardHeader>
      <CardContent>
        {submissions.length === 0 ? (
          <div className="text-center py-8">
            <Send className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
            <h3 className="text-lg font-medium text-charcoal-900 mb-2">No submissions yet</h3>
            <p className="text-charcoal-500 mb-4">
              This candidate hasn&apos;t been submitted to any jobs
            </p>
            <Button onClick={() => dispatchCandidateDialog('submitToJob', entityId)}>
              <Send className="w-4 h-4 mr-2" />
              Submit to Job
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map(
              (submission: {
                id: string
                job_id: string
                status: string
                created_at: string
                job?: { title: string; account?: { name: string } }
              }) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-charcoal-50 cursor-pointer"
                  onClick={() => router.push(`/employee/recruiting/submissions/${submission.id}`)}
                >
                  <div>
                    <h4 className="font-medium text-charcoal-900">
                      {submission.job?.title || 'Unknown Job'}
                    </h4>
                    <p className="text-sm text-charcoal-500">
                      {submission.job?.account?.name || 'Unknown Client'} &bull;{' '}
                      {formatDistanceToNow(new Date(submission.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {submission.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
              )
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Activities Section Adapter
 */
export function CandidateActivitiesSectionPCF({ entityId }: PCFSectionProps) {
  return (
    <ActivitiesSection
      entityType="candidate"
      entityId={entityId}
      onLogActivity={() => dispatchCandidateDialog('logActivity', entityId)}
    />
  )
}

