/**
 * JobsWorkspace Component
 *
 * Unified workspace for managing job requisitions with full ATS fields
 * Context-aware tabs based on user role (Recruiting, TA, Bench Sales)
 */

'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Calendar,
  DollarSign,
  Target,
  Briefcase,
  FileText,
  Activity,
  FolderOpen,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Clock,
  Users,
  MapPin,
  Wifi,
  UserPlus,
  Code,
  Award,
  PieChart,
  Send,
  Video,
  FileCheck,
  ThumbsUp,
  Star,
  Zap,
  Globe,
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { trpc } from '@/lib/trpc/client';
import { cn } from '@/lib/utils';

// UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Workspace Components
import {
  WorkspaceLayout,
  WorkspaceSidebar,
  ActivityPanel,
  type WorkspaceTab,
  type StatItem,
  type RelatedObject,
  type QuickAction,
} from './base';
import { useWorkspaceContext } from './hooks';

// =====================================================
// TYPES
// =====================================================

interface JobsWorkspaceProps {
  jobId: string;
}

interface Submission {
  id: string;
  status: string;
  candidate?: {
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  };
  aiMatchScore?: number;
  submittedRate?: string;
  submittedRateType?: string;
}

interface Interview {
  id: string;
  status: string;
  scheduledAt?: string;
  roundNumber?: number;
  interviewType?: string;
  durationMinutes?: number;
  recommendation?: string;
}

interface Offer {
  id: string;
  status: string;
  candidate?: {
    firstName?: string;
    lastName?: string;
  };
  rate?: string;
  rateType?: string;
  startDate?: string;
}

// =====================================================
// CONSTANTS
// =====================================================

const JOB_STATUSES = {
  draft: { label: 'Draft', color: 'bg-stone-100 text-stone-600' },
  open: { label: 'Open', color: 'bg-green-100 text-green-700' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700' },
  on_hold: { label: 'On Hold', color: 'bg-amber-100 text-amber-700' },
  filled: { label: 'Filled', color: 'bg-blue-100 text-blue-700' },
  cancelled: { label: 'Cancelled', color: 'bg-stone-100 text-stone-500' },
};

const JOB_TYPES = {
  contract: { label: 'Contract', description: 'Fixed-term engagement' },
  contract_to_hire: { label: 'Contract-to-Hire', description: 'Contract with option to convert' },
  full_time: { label: 'Full Time', description: 'Direct hire permanent' },
  part_time: { label: 'Part Time', description: 'Less than 40 hrs/week' },
};

const URGENCY_LEVELS = {
  low: { label: 'Low', color: 'text-green-600', description: 'Standard timeline' },
  medium: { label: 'Medium', color: 'text-amber-600', description: 'Priority fill' },
  high: { label: 'High', color: 'text-orange-600', description: 'Expedited search' },
  critical: { label: 'Critical', color: 'text-red-600', description: 'Immediate need' },
};

const SUBMISSION_STATUSES = {
  sourced: { label: 'Sourced', color: 'bg-stone-100 text-stone-600' },
  screening: { label: 'Screening', color: 'bg-blue-100 text-blue-700' },
  submission_ready: { label: 'Ready', color: 'bg-cyan-100 text-cyan-700' },
  submitted_to_client: { label: 'Submitted', color: 'bg-purple-100 text-purple-700' },
  client_review: { label: 'Client Review', color: 'bg-amber-100 text-amber-700' },
  client_interview: { label: 'Interviewing', color: 'bg-orange-100 text-orange-700' },
  offer_stage: { label: 'Offer', color: 'bg-green-100 text-green-700' },
  placed: { label: 'Placed', color: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
};

// =====================================================
// SUB-COMPONENTS
// =====================================================

function FillProgress({ positionsCount, positionsFilled }: { positionsCount: number; positionsFilled: number }) {
  const progress = positionsCount > 0 ? Math.round((positionsFilled / positionsCount) * 100) : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Target className="w-4 h-4" />
          Fill Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">
            {positionsFilled} / {positionsCount}
          </div>
          <Badge variant={progress === 100 ? 'default' : 'secondary'}>
            {progress}% filled
          </Badge>
        </div>
        <Progress value={progress} className="h-3" />
        <div className="text-sm text-muted-foreground">
          {positionsCount - positionsFilled} position{positionsCount - positionsFilled !== 1 ? 's' : ''} remaining
        </div>
      </CardContent>
    </Card>
  );
}

function OverviewTab({ job }: { job: NonNullable<ReturnType<typeof useJob>['data']>; canEdit: boolean }) {
  const daysOpen = differenceInDays(new Date(), new Date(job.createdAt));
  const daysToTarget = job.targetFillDate
    ? differenceInDays(new Date(job.targetFillDate), new Date())
    : null;

  return (
    <div className="space-y-6">
      {/* Fill Progress */}
      <FillProgress positionsCount={job.positionsCount || 1} positionsFilled={job.positionsFilled || 0} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Job Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Title</Label>
              <p className="font-medium">{job.title}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Job Type</Label>
                <p className="font-medium">
                  {JOB_TYPES[job.jobType as keyof typeof JOB_TYPES]?.label || job.jobType}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Urgency</Label>
                <p className={cn(
                  'font-medium',
                  URGENCY_LEVELS[job.urgency as keyof typeof URGENCY_LEVELS]?.color
                )}>
                  {URGENCY_LEVELS[job.urgency as keyof typeof URGENCY_LEVELS]?.label || job.urgency}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Positions</Label>
                <p className="font-medium">{job.positionsCount || 1}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Days Open</Label>
                <p className="font-medium">{daysOpen} days</p>
              </div>
            </div>

            {job.description && (
              <>
                <Separator />
                <div>
                  <Label className="text-xs text-muted-foreground">Description</Label>
                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap line-clamp-6">
                    {job.description}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Location & Work Arrangement */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location & Work Arrangement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Location</Label>
                <p className="font-medium">{job.location || 'Not specified'}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Work Model</Label>
                <div className="flex items-center gap-2 mt-1">
                  {job.isRemote ? (
                    <>
                      <Globe className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-600">Remote</span>
                    </>
                  ) : job.hybridDays && job.hybridDays > 0 ? (
                    <>
                      <Wifi className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-600">Hybrid ({job.hybridDays} days remote)</span>
                    </>
                  ) : (
                    <>
                      <Building2 className="w-4 h-4 text-stone-600" />
                      <span className="font-medium">On-site</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Target Fill Date</Label>
                <p className="font-medium">
                  {job.targetFillDate
                    ? format(new Date(job.targetFillDate), 'MMM d, yyyy')
                    : 'Not set'}
                </p>
                {daysToTarget !== null && daysToTarget >= 0 && (
                  <p className={cn(
                    'text-xs',
                    daysToTarget <= 7 ? 'text-red-600' : daysToTarget <= 14 ? 'text-amber-600' : 'text-muted-foreground'
                  )}>
                    {daysToTarget === 0 ? 'Due today' : `${daysToTarget} days remaining`}
                  </p>
                )}
                {daysToTarget !== null && daysToTarget < 0 && (
                  <p className="text-xs text-red-600">
                    {Math.abs(daysToTarget)} days overdue
                  </p>
                )}
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Posted Date</Label>
                <p className="font-medium">
                  {job.postedDate
                    ? format(new Date(job.postedDate), 'MMM d, yyyy')
                    : 'Not posted'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compensation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Compensation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Rate Range</Label>
                <p className="font-medium text-green-600">
                  {job.rateMin || job.rateMax ? (
                    <>
                      ${Number(job.rateMin || 0).toLocaleString()} - ${Number(job.rateMax || 0).toLocaleString()}
                      <span className="text-xs text-muted-foreground ml-1">/{job.rateType || 'hour'}</span>
                    </>
                  ) : (
                    'Not specified'
                  )}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Currency</Label>
                <p className="font-medium">{job.currency || 'USD'}</p>
              </div>
            </div>

            {job.jobType === 'contract' && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  Contract position - rates are typically negotiable based on experience
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Experience Requirements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="w-4 h-4" />
              Experience Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Experience</Label>
                <p className="font-medium">
                  {job.minExperienceYears || job.maxExperienceYears ? (
                    <>
                      {job.minExperienceYears || 0} - {job.maxExperienceYears || '10+'} years
                    </>
                  ) : (
                    'Not specified'
                  )}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Visa Requirements</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {job.visaRequirements && job.visaRequirements.length > 0 ? (
                    job.visaRequirements.map((visa, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {visa}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">Any</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client Information */}
        {job.accountId && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Client
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-stone-600" />
                </div>
                <div>
                  <p className="font-medium">Account ID: {job.accountId}</p>
                  <p className="text-sm text-muted-foreground">Account details not loaded</p>
                </div>
              </div>

              {job.clientSubmissionInstructions && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-xs text-muted-foreground">Submission Instructions</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {job.clientSubmissionInstructions}
                    </p>
                  </div>
                </>
              )}

              {job.clientInterviewProcess && (
                <div>
                  <Label className="text-xs text-muted-foreground">Interview Process</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {job.clientInterviewProcess}
                  </p>
                </div>
              )}

              <Button variant="outline" size="sm" className="w-full">
                View Account Details
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Assignment */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" />
              Assignment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Job Owner</Label>
              <div className="flex items-center gap-2 mt-1">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    JO
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {job.ownerId ? `Owner ID: ${job.ownerId}` : 'Unassigned'}
                  </p>
                </div>
              </div>
            </div>

            {job.recruiterIds && job.recruiterIds.length > 0 && (
              <>
                <Separator />
                <div>
                  <Label className="text-xs text-muted-foreground">Assigned Recruiters</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {job.recruiterIds.map((id) => (
                      <Badge key={id} variant="secondary" className="text-xs">
                        Recruiter #{id.slice(0, 4)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SkillsTab({ job, canEdit }: { job: NonNullable<ReturnType<typeof useJob>['data']>; canEdit: boolean }) {
  const requiredSkills = job.requiredSkills || [];
  const niceToHaveSkills = job.niceToHaveSkills || [];

  return (
    <div className="space-y-6">
      {/* Required Skills */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Code className="w-4 h-4" />
              Required Skills
            </CardTitle>
            {canEdit && (
              <Button variant="outline" size="sm">
                Edit Skills
              </Button>
            )}
          </div>
          <CardDescription>
            Candidates must have these skills to be considered
          </CardDescription>
        </CardHeader>
        <CardContent>
          {requiredSkills.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <Code className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No required skills specified</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {requiredSkills.map((skill, i) => (
                <Badge key={i} variant="default" className="text-sm">
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nice to Have Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Star className="w-4 h-4" />
            Nice to Have Skills
          </CardTitle>
          <CardDescription>
            Preferred but not required skills
          </CardDescription>
        </CardHeader>
        <CardContent>
          {niceToHaveSkills.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <Star className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No preferred skills specified</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {niceToHaveSkills.map((skill, i) => (
                <Badge key={i} variant="secondary" className="text-sm">
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skill Match Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            Skill Coverage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{requiredSkills.length}</p>
              <p className="text-xs text-muted-foreground">Required Skills</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{niceToHaveSkills.length}</p>
              <p className="text-xs text-muted-foreground">Nice to Have</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{requiredSkills.length + niceToHaveSkills.length}</p>
              <p className="text-xs text-muted-foreground">Total Skills</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SubmissionsTab({ canEdit }: { job: NonNullable<ReturnType<typeof useJob>['data']>; canEdit: boolean }) {
  const submissions: Submission[] = [];

  // Group submissions by status
  const submissionsByStatus = submissions.reduce((acc: Record<string, Submission[]>, sub: Submission) => {
    const status = sub.status;
    if (!acc[status]) acc[status] = [];
    acc[status].push(sub);
    return acc;
  }, {} as Record<string, Submission[]>);

  const pipelineStages = [
    { key: 'sourced', label: 'Sourced' },
    { key: 'screening', label: 'Screening' },
    { key: 'submission_ready', label: 'Ready' },
    { key: 'submitted_to_client', label: 'Submitted' },
    { key: 'client_review', label: 'Review' },
    { key: 'client_interview', label: 'Interview' },
    { key: 'offer_stage', label: 'Offer' },
    { key: 'placed', label: 'Placed' },
  ];

  return (
    <div className="space-y-6">
      {/* Pipeline Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Submission Pipeline
            </CardTitle>
            {canEdit && (
              <Button size="sm">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Candidate
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1">
            {pipelineStages.map((stage, index) => {
              const count = submissionsByStatus[stage.key]?.length || 0;
              return (
                <React.Fragment key={stage.key}>
                  <div className="flex-1 text-center">
                    <div className={cn(
                      'h-8 rounded flex items-center justify-center text-sm font-medium',
                      count > 0 ? 'bg-blue-100 text-blue-700' : 'bg-stone-100 text-stone-400'
                    )}>
                      {count}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{stage.label}</p>
                  </div>
                  {index < pipelineStages.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-stone-300 flex-shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Submissions List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4" />
            All Submissions ({submissions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No submissions yet</p>
              <p className="text-sm">Add candidates to start building the pipeline</p>
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map((submission: Submission) => {
                const statusConfig = SUBMISSION_STATUSES[submission.status as keyof typeof SUBMISSION_STATUSES];
                return (
                  <div
                    key={submission.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-stone-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={submission.candidate?.avatarUrl || undefined} />
                        <AvatarFallback>
                          {((submission.candidate?.firstName?.[0] || '') + (submission.candidate?.lastName?.[0] || '')).toUpperCase() || 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {submission.candidate
                            ? `${submission.candidate.firstName || ''} ${submission.candidate.lastName || ''}`.trim()
                            : 'Unknown Candidate'}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {submission.aiMatchScore && (
                            <span className="flex items-center gap-1">
                              <Zap className="w-3 h-3 text-amber-500" />
                              {submission.aiMatchScore}% match
                            </span>
                          )}
                          {submission.submittedRate && (
                            <span>
                              ${Number(submission.submittedRate).toLocaleString()}/{submission.submittedRateType || 'hr'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={cn('text-xs', statusConfig?.color)}>
                        {statusConfig?.label || submission.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InterviewsTab() {
  const interviews: Interview[] = [];
  const upcoming = interviews.filter((i: Interview) => i.status === 'scheduled' && i.scheduledAt && new Date(i.scheduledAt) >= new Date());
  const completed = interviews.filter((i: Interview) => i.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Interview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Video className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold">{interviews.length}</p>
              <p className="text-xs text-muted-foreground">Total Interviews</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Calendar className="w-6 h-6 mx-auto mb-2 text-amber-600" />
              <p className="text-2xl font-bold">{upcoming.length}</p>
              <p className="text-xs text-muted-foreground">Upcoming</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold">{completed.length}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <ThumbsUp className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold">
                {completed.filter((i: Interview) => i.recommendation === 'hire').length}
              </p>
              <p className="text-xs text-muted-foreground">Positive Feedback</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Interviews */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Upcoming Interviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcoming.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No upcoming interviews scheduled</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((interview: Interview) => (
                <div
                  key={interview.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Video className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Round {interview.roundNumber} - {interview.interviewType}</p>
                      <p className="text-sm text-muted-foreground">
                        {interview.scheduledAt ? format(new Date(interview.scheduledAt), 'MMM d, yyyy h:mm a') : 'TBD'}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">{interview.durationMinutes || 60} min</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function OffersTab() {
  const offers: Offer[] = [];
  const accepted = offers.filter((o: Offer) => o.status === 'accepted');
  const pending = offers.filter((o: Offer) => o.status === 'sent' || o.status === 'negotiating');

  return (
    <div className="space-y-6">
      {/* Offer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <FileCheck className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold">{offers.length}</p>
              <p className="text-xs text-muted-foreground">Total Offers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="w-6 h-6 mx-auto mb-2 text-amber-600" />
              <p className="text-2xl font-bold">{pending.length}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold">{accepted.length}</p>
              <p className="text-xs text-muted-foreground">Accepted</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Offers List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileCheck className="w-4 h-4" />
            All Offers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {offers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No offers extended yet</p>
              <p className="text-sm">Offers will appear here once candidates reach the offer stage</p>
            </div>
          ) : (
            <div className="space-y-3">
              {offers.map((offer: Offer) => (
                <div
                  key={offer.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {((offer.candidate?.firstName?.[0] || '') + (offer.candidate?.lastName?.[0] || '')).toUpperCase() || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {offer.candidate
                          ? `${offer.candidate.firstName || ''} ${offer.candidate.lastName || ''}`.trim()
                          : 'Unknown'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ${Number(offer.rate || 0).toLocaleString()}/{offer.rateType || 'hr'}
                        {offer.startDate && ` • Start: ${format(new Date(offer.startDate), 'MMM d')}`}
                      </p>
                    </div>
                  </div>
                  <Badge variant={
                    offer.status === 'accepted' ? 'default' :
                    offer.status === 'declined' ? 'destructive' :
                    'secondary'
                  }>
                    {offer.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Hook to fetch job data
function useJob(jobId: string) {
  return trpc.ats.jobs.getById.useQuery({ id: jobId });
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function JobsWorkspace({ jobId }: JobsWorkspaceProps) {
  const router = useRouter();
  const { canEdit, canDelete, isLoading: contextLoading } = useWorkspaceContext('job', jobId);

  // Fetch job data
  const { data: job, isLoading: jobLoading, error } = useJob(jobId);

  // Dialogs
  const [showStatusDialog, setShowStatusDialog] = useState(false);

  // Build tabs
  const tabs = useMemo((): WorkspaceTab[] => {
    if (!job) return [];

    const submissionCount = 0;
    const interviewCount = 0;
    const offerCount = 0;

    const baseTabs: WorkspaceTab[] = [
      {
        id: 'overview',
        label: 'Overview',
        icon: <FileText className="w-4 h-4" />,
        content: <OverviewTab job={job} canEdit={canEdit} />,
      },
      {
        id: 'skills',
        label: 'Skills',
        icon: <Code className="w-4 h-4" />,
        content: <SkillsTab job={job} canEdit={canEdit} />,
      },
      {
        id: 'submissions',
        label: 'Submissions',
        icon: <Users className="w-4 h-4" />,
        badge: submissionCount || undefined,
        content: <SubmissionsTab job={job} canEdit={canEdit} />,
      },
      {
        id: 'interviews',
        label: 'Interviews',
        icon: <Video className="w-4 h-4" />,
        badge: interviewCount || undefined,
        content: <InterviewsTab />,
      },
      {
        id: 'offers',
        label: 'Offers',
        icon: <FileCheck className="w-4 h-4" />,
        badge: offerCount || undefined,
        content: <OffersTab />,
      },
      {
        id: 'activity',
        label: 'Activity',
        icon: <Activity className="w-4 h-4" />,
        content: <div className="text-muted-foreground">Activity timeline</div>,
      },
      {
        id: 'documents',
        label: 'Documents',
        icon: <FolderOpen className="w-4 h-4" />,
        content: <div className="text-muted-foreground">Job descriptions, SOWs, and other documents</div>,
      },
    ];

    return baseTabs;
  }, [job, canEdit]);

  // Sidebar stats
  const sidebarStats = useMemo((): StatItem[] => {
    if (!job) return [];

    return [
      {
        label: 'Positions',
        value: `${job.positionsFilled || 0}/${job.positionsCount || 1}`,
        icon: <Target className="w-3 h-3" />,
      },
      {
        label: 'Submissions',
        value: 0,
        icon: <Users className="w-3 h-3" />,
      },
      {
        label: 'Rate',
        value: job.rateMax ? `$${Number(job.rateMax).toLocaleString()}` : '-',
        icon: <DollarSign className="w-3 h-3" />,
      },
      {
        label: 'Days Open',
        value: differenceInDays(new Date(), new Date(job.createdAt)),
        icon: <Calendar className="w-3 h-3" />,
      },
    ];
  }, [job]);

  // Quick actions
  const quickActions = useMemo((): QuickAction[] => {
    return [
      {
        label: 'Add Candidate',
        icon: <UserPlus className="w-4 h-4 mr-2" />,
        onClick: () => {},
      },
      {
        label: 'Send to Client',
        icon: <Send className="w-4 h-4 mr-2" />,
        onClick: () => {},
      },
      {
        label: 'Schedule Interview',
        icon: <Calendar className="w-4 h-4 mr-2" />,
        onClick: () => {},
      },
      {
        label: 'Add Note',
        icon: <MessageSquare className="w-4 h-4 mr-2" />,
        onClick: () => {},
      },
    ];
  }, []);

  // Related objects
  const relatedObjects = useMemo((): RelatedObject[] => {
    const objects: RelatedObject[] = [];

    if (job?.accountId) {
      objects.push({
        id: job.accountId,
        type: 'Account',
        title: `Account: ${job.accountId}`,
        href: `/employee/workspace/accounts/${job.accountId}`,
        icon: <Building2 className="w-4 h-4" />,
      });
    }

    if (job?.dealId) {
      objects.push({
        id: job.dealId,
        type: 'Deal',
        title: `Deal: ${job.dealId}`,
        href: `/employee/workspace/deals/${job.dealId}`,
        icon: <Briefcase className="w-4 h-4" />,
      });
    }

    return objects;
  }, [job]);

  // Loading state
  if (jobLoading || contextLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rust" />
      </div>
    );
  }

  // Error state
  if (error || !job) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <AlertTriangle className="w-12 h-12 text-red-500" />
        <p className="text-lg font-medium">Job not found</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const statusConfig = JOB_STATUSES[job.status as keyof typeof JOB_STATUSES] ||
    { label: job.status, color: 'bg-stone-100 text-stone-600' };

  const isOpen = job.status === 'open' || job.status === 'urgent';

  return (
    <>
      <WorkspaceLayout
        title={job.title}
        subtitle={job.location || undefined}
        backHref="/employee/workspace/jobs"
        backLabel="Jobs"
        status={{
          label: statusConfig.label,
          color: statusConfig.color,
        }}
        entityType="job"
        entityId={jobId}
        canEdit={canEdit}
        canDelete={canDelete}
        primaryAction={isOpen ? {
          label: 'Add Candidate',
          icon: <UserPlus className="w-4 h-4 mr-1" />,
          onClick: () => {},
        } : undefined}
        secondaryActions={[
          {
            label: 'Update Status',
            onClick: () => setShowStatusDialog(true),
            variant: 'outline',
          },
        ]}
        tabs={tabs}
        defaultTab="overview"
        sidebar={
          <WorkspaceSidebar
            stats={sidebarStats}
            quickActions={quickActions}
            relatedObjects={relatedObjects}
          />
        }
        showActivityPanel
        activityPanel={<ActivityPanel entityType="job" entityId={jobId} canEdit={canEdit} />}
        onDelete={() => {
          if (window.confirm('Are you sure you want to delete this job?')) {
            // Handle delete
          }
        }}
      />

      {/* Update Status Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Job Status</DialogTitle>
            <DialogDescription>
              Change the status of this job requisition.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>New Status</Label>
              <Select defaultValue={job.status}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(JOB_STATUSES).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea placeholder="Add any notes about this status change..." />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              // Handle status update
              setShowStatusDialog(false);
            }}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default JobsWorkspace;
