/**
 * SubmissionsWorkspace Component
 *
 * Unified workspace for managing candidate submissions with full ATS fields
 * Tracks the full candidate journey from sourcing to placement
 */

'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  User,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Briefcase,
  FileText,
  Activity,
  FolderOpen,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Clock,
  Video,
  FileCheck,
  Zap,
  Send,
  ExternalLink,
  Star,
  UserCheck,
} from 'lucide-react';
import { format, formatDistanceToNow, differenceInDays } from 'date-fns';
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

interface SubmissionsWorkspaceProps {
  submissionId: string;
}

// =====================================================
// CONSTANTS
// =====================================================

const SUBMISSION_STATUSES = {
  sourced: { label: 'Sourced', color: 'bg-stone-100 text-stone-600', order: 1 },
  screening: { label: 'Screening', color: 'bg-blue-100 text-blue-700', order: 2 },
  submission_ready: { label: 'Ready to Submit', color: 'bg-cyan-100 text-cyan-700', order: 3 },
  submitted_to_client: { label: 'Submitted', color: 'bg-purple-100 text-purple-700', order: 4 },
  client_review: { label: 'Client Review', color: 'bg-amber-100 text-amber-700', order: 5 },
  client_interview: { label: 'Interviewing', color: 'bg-orange-100 text-orange-700', order: 6 },
  offer_stage: { label: 'Offer', color: 'bg-green-100 text-green-700', order: 7 },
  placed: { label: 'Placed', color: 'bg-emerald-100 text-emerald-700', order: 8 },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', order: 9 },
};

const REJECTION_REASONS = {
  not_qualified: 'Not Qualified',
  rate_too_high: 'Rate Too High',
  location_mismatch: 'Location Mismatch',
  visa_issues: 'Visa Issues',
  client_rejected: 'Client Rejected',
  candidate_withdrew: 'Candidate Withdrew',
  position_filled: 'Position Filled',
  no_response: 'No Response',
  failed_interview: 'Failed Interview',
  background_check: 'Background Check Issues',
  other: 'Other',
};

// =====================================================
// SUB-COMPONENTS
// =====================================================

function SubmissionPipeline({ status }: { status: string }) {
  const stages = Object.entries(SUBMISSION_STATUSES)
    .filter(([key]) => key !== 'rejected')
    .sort(([, a], [, b]) => a.order - b.order);

  const currentIndex = stages.findIndex(([key]) => key === status);
  const isRejected = status === 'rejected';

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Submission Pipeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Progress Bar */}
          <div className="flex items-center gap-1 mb-3">
            {stages.map(([key, config], index) => {
              const isActive = key === status;
              const isPast = index < currentIndex;
              const isFuture = index > currentIndex && !isRejected;

              return (
                <div
                  key={key}
                  className={cn(
                    'flex-1 h-2 rounded-full transition-colors',
                    isActive && config.color.replace('text-', 'bg-').split(' ')[0],
                    isPast && 'bg-green-500',
                    isFuture && 'bg-stone-200',
                    isRejected && 'bg-red-200'
                  )}
                />
              );
            })}
          </div>

          {/* Stage Labels */}
          <div className="flex justify-between text-xs">
            <span className={cn(currentIndex >= 0 && 'text-green-600 font-medium')}>Sourced</span>
            <span className={cn(currentIndex >= 3 && 'text-green-600 font-medium')}>Submitted</span>
            <span className={cn(currentIndex >= 5 && 'text-green-600 font-medium')}>Interview</span>
            <span className={cn(currentIndex >= 7 && 'text-green-600 font-medium')}>Placed</span>
          </div>

          {isRejected && (
            <div className="mt-3 p-2 bg-red-50 rounded-lg flex items-center gap-2 text-red-700">
              <XCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Submission was rejected</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function OverviewTab({ submission }: { submission: NonNullable<ReturnType<typeof useSubmission>['data']>; canEdit: boolean }) {
  const daysInPipeline = differenceInDays(new Date(), new Date(submission.createdAt));

  return (
    <div className="space-y-6">
      {/* Pipeline Progress */}
      <SubmissionPipeline status={submission.status} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Candidate Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4" />
              Candidate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={submission.candidate?.avatarUrl || undefined} />
                <AvatarFallback className="text-lg">
                  {((submission.candidate?.firstName?.[0] || '') + (submission.candidate?.lastName?.[0] || '')).toUpperCase() || 'C'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-semibold">
                  {submission.candidate
                    ? `${submission.candidate.firstName || ''} ${submission.candidate.lastName || ''}`.trim()
                    : 'Unknown Candidate'}
                </p>
                {submission.candidate?.title && (
                  <p className="text-muted-foreground">{submission.candidate.title}</p>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              {submission.candidate?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <a href={`mailto:${submission.candidate.email}`} className="text-rust hover:underline">
                    {submission.candidate.email}
                  </a>
                </div>
              )}
              {submission.candidate?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <a href={`tel:${submission.candidate.phone}`} className="text-rust hover:underline">
                    {submission.candidate.phone}
                  </a>
                </div>
              )}
            </div>

            <Button variant="outline" size="sm" className="w-full">
              <ExternalLink className="w-4 h-4 mr-2" />
              View Full Profile
            </Button>
          </CardContent>
        </Card>

        {/* Match Scoring */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Match Score
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">AI Match Score</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={submission.aiMatchScore || 0} className="h-3 flex-1" />
                  <span className={cn(
                    'font-bold',
                    (submission.aiMatchScore || 0) >= 80 ? 'text-green-600' :
                    (submission.aiMatchScore || 0) >= 60 ? 'text-amber-600' : 'text-red-600'
                  )}>
                    {submission.aiMatchScore || 0}%
                  </span>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Recruiter Score</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={submission.recruiterMatchScore || 0} className="h-3 flex-1" />
                  <span className="font-bold">
                    {submission.recruiterMatchScore || '-'}%
                  </span>
                </div>
              </div>
            </div>

            {submission.matchExplanation && (
              <>
                <Separator />
                <div>
                  <Label className="text-xs text-muted-foreground">Match Analysis</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {submission.matchExplanation}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Rate & Submission Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Rate & Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Submitted Rate</Label>
                <p className="text-lg font-bold text-green-600">
                  {submission.submittedRate
                    ? `$${Number(submission.submittedRate).toLocaleString()}/${submission.submittedRateType || 'hr'}`
                    : 'Not set'}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Days in Pipeline</Label>
                <p className="text-lg font-bold">{daysInPipeline} days</p>
              </div>
            </div>

            {submission.submissionNotes && (
              <>
                <Separator />
                <div>
                  <Label className="text-xs text-muted-foreground">Submission Notes</Label>
                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                    {submission.submissionNotes}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Job Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Job
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">{submission.job?.title || 'Unknown Job'}</p>
                <p className="text-sm text-muted-foreground">
                  {submission.job?.location || 'Location not specified'}
                </p>
              </div>
            </div>

            {submission.account && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-stone-600" />
                </div>
                <div>
                  <p className="font-medium">{submission.account.name}</p>
                  <p className="text-sm text-muted-foreground">Client Account</p>
                </div>
              </div>
            )}

            <Button variant="outline" size="sm" className="w-full">
              View Job Details
            </Button>
          </CardContent>
        </Card>

        {/* Client Submission Status */}
        {submission.submittedToClientAt && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Send className="w-4 h-4" />
                Client Submission
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Submitted At</Label>
                  <p className="font-medium">
                    {format(new Date(submission.submittedToClientAt), 'MMM d, yyyy')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(submission.submittedToClientAt), { addSuffix: true })}
                  </p>
                </div>
                {submission.clientProfileUrl && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Client Profile</Label>
                    <Button variant="link" size="sm" className="h-auto p-0">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View in VMS
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rejection Details */}
        {submission.status === 'rejected' && (
          <Card className="border-red-200 bg-red-50/50 col-span-full">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-red-700">
                <XCircle className="w-4 h-4" />
                Rejection Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Rejected At</Label>
                  <p className="font-medium">
                    {submission.rejectedAt
                      ? format(new Date(submission.rejectedAt), 'MMM d, yyyy')
                      : 'Unknown'}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Rejection Source</Label>
                  <p className="font-medium capitalize">
                    {submission.rejectionSource || 'Not specified'}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Reason</Label>
                  <p className="font-medium">
                    {REJECTION_REASONS[submission.rejectionReason as keyof typeof REJECTION_REASONS] ||
                      submission.rejectionReason ||
                      'Not specified'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function InterviewsTab({ submission, canEdit }: { submission: NonNullable<ReturnType<typeof useSubmission>['data']>; canEdit: boolean }) {
  const interviews = submission.interviews || [];
  const upcoming = interviews.filter(i => i.status === 'scheduled');
  const completed = interviews.filter(i => i.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Interview Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold">{completed.length}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
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
      </div>

      {/* Interview Progress */}
      {interviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Interview Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {interviews.map((interview, index) => (
                <div key={interview.id} className="relative pl-8">
                  {/* Timeline line */}
                  {index < interviews.length - 1 && (
                    <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-stone-200" />
                  )}

                  {/* Timeline dot */}
                  <div className={cn(
                    'absolute left-1 top-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white',
                    interview.status === 'completed' && interview.recommendation === 'hire' && 'bg-green-500',
                    interview.status === 'completed' && interview.recommendation === 'no_hire' && 'bg-red-500',
                    interview.status === 'completed' && !interview.recommendation && 'bg-blue-500',
                    interview.status === 'scheduled' && 'bg-amber-500',
                    interview.status === 'cancelled' && 'bg-stone-400'
                  )}>
                    {interview.roundNumber}
                  </div>

                  <div className="flex items-start justify-between pb-4">
                    <div>
                      <p className="font-medium">
                        Round {interview.roundNumber}: {interview.interviewType}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {interview.scheduledAt
                          ? format(new Date(interview.scheduledAt), 'MMM d, yyyy h:mm a')
                          : 'TBD'}
                      </p>
                      {interview.interviewerNames && interview.interviewerNames.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Interviewers: {interview.interviewerNames.join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        interview.status === 'completed' ? 'default' :
                        interview.status === 'scheduled' ? 'secondary' :
                        'outline'
                      }>
                        {interview.status}
                      </Badge>
                      {interview.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span className="text-sm font-medium">{interview.rating}/5</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {interview.feedback && (
                    <div className="bg-stone-50 p-3 rounded-lg mb-4">
                      <p className="text-sm">{interview.feedback}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedule New Interview */}
      {canEdit && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Video className="w-12 h-12 mx-auto mb-3 text-stone-400" />
              <p className="font-medium">Schedule Interview</p>
              <p className="text-sm text-muted-foreground mb-4">
                Add a new interview round for this candidate
              </p>
              <Button>
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Interview
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {interviews.length === 0 && !canEdit && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-muted-foreground">
              <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No interviews scheduled</p>
              <p className="text-sm">Interviews will appear here once scheduled</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function OffersTab({ submission, canEdit }: { submission: NonNullable<ReturnType<typeof useSubmission>['data']>; canEdit: boolean }) {
  const offers = submission.offers || [];
  const activeOffer = offers.find(o => o.status !== 'declined' && o.status !== 'withdrawn');

  return (
    <div className="space-y-6">
      {/* Offer Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="w-6 h-6 mx-auto mb-2 text-amber-600" />
              <p className="text-lg font-bold">
                {submission.offerExtendedAt
                  ? format(new Date(submission.offerExtendedAt), 'MMM d')
                  : '-'}
              </p>
              <p className="text-xs text-muted-foreground">Offer Extended</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <p className="text-lg font-bold">
                {submission.offerAcceptedAt
                  ? format(new Date(submission.offerAcceptedAt), 'MMM d')
                  : '-'}
              </p>
              <p className="text-xs text-muted-foreground">Offer Accepted</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="w-6 h-6 mx-auto mb-2 text-red-600" />
              <p className="text-lg font-bold">
                {submission.offerDeclinedAt
                  ? format(new Date(submission.offerDeclinedAt), 'MMM d')
                  : '-'}
              </p>
              <p className="text-xs text-muted-foreground">Offer Declined</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <FileCheck className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <p className="text-lg font-bold">{offers.length}</p>
              <p className="text-xs text-muted-foreground">Total Offers</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Offer */}
      {activeOffer && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-green-700">
              <FileCheck className="w-4 h-4" />
              Current Offer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Rate</Label>
                <p className="text-lg font-bold text-green-600">
                  ${Number(activeOffer.rate || 0).toLocaleString()}/{activeOffer.rateType || 'hr'}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Start Date</Label>
                <p className="font-medium">
                  {activeOffer.startDate
                    ? format(new Date(activeOffer.startDate), 'MMM d, yyyy')
                    : 'TBD'}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">End Date</Label>
                <p className="font-medium">
                  {activeOffer.endDate
                    ? format(new Date(activeOffer.endDate), 'MMM d, yyyy')
                    : 'Open-ended'}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Status</Label>
                <Badge className="mt-1" variant={
                  activeOffer.status === 'accepted' ? 'default' :
                  activeOffer.status === 'sent' ? 'secondary' :
                  'outline'
                }>
                  {activeOffer.status}
                </Badge>
              </div>
            </div>

            {activeOffer.bonus && (
              <div>
                <Label className="text-xs text-muted-foreground">Bonus</Label>
                <p className="font-medium">${Number(activeOffer.bonus).toLocaleString()}</p>
              </div>
            )}

            {activeOffer.negotiationNotes && (
              <>
                <Separator />
                <div>
                  <Label className="text-xs text-muted-foreground">Negotiation Notes</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {activeOffer.negotiationNotes}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Offer Decline Reason */}
      {submission.offerDeclineReason && (
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-red-700">
              <XCircle className="w-4 h-4" />
              Decline Reason
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{submission.offerDeclineReason}</p>
          </CardContent>
        </Card>
      )}

      {/* Create Offer */}
      {canEdit && !activeOffer && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <FileCheck className="w-12 h-12 mx-auto mb-3 text-stone-400" />
              <p className="font-medium">Create Offer</p>
              <p className="text-sm text-muted-foreground mb-4">
                Extend an offer to this candidate
              </p>
              <Button>
                <FileCheck className="w-4 h-4 mr-2" />
                Create Offer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {offers.length === 0 && !canEdit && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-muted-foreground">
              <FileCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No offers yet</p>
              <p className="text-sm">Offers will appear here once extended</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TimelineTab({ submission }: { submission: NonNullable<ReturnType<typeof useSubmission>['data']> }) {
  // Build timeline from submission data
  type IconComponent = React.ComponentType<{ className?: string }>;

  const events = [
    { date: submission.createdAt, label: 'Candidate Sourced', icon: UserCheck },
    submission.submittedToClientAt && {
      date: submission.submittedToClientAt,
      label: 'Submitted to Client',
      icon: Send,
    },
    submission.lastInterviewDate && {
      date: submission.lastInterviewDate,
      label: 'Last Interview',
      icon: Video,
    },
    submission.offerExtendedAt && {
      date: submission.offerExtendedAt,
      label: 'Offer Extended',
      icon: FileCheck,
    },
    submission.offerAcceptedAt && {
      date: submission.offerAcceptedAt,
      label: 'Offer Accepted',
      icon: CheckCircle,
    },
    submission.offerDeclinedAt && {
      date: submission.offerDeclinedAt,
      label: 'Offer Declined',
      icon: XCircle,
    },
    submission.rejectedAt && {
      date: submission.rejectedAt,
      label: 'Submission Rejected',
      icon: XCircle,
    },
  ].filter(Boolean) as Array<{ date: string | Date; label: string; icon: IconComponent }>;

  // Sort by date
  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Submission Timeline
          </CardTitle>
          <CardDescription>
            Key milestones in this submission&apos;s journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-stone-200" />

            <div className="space-y-6">
              {events.map((event, index) => {
                const Icon = event.icon;
                const isLast = index === events.length - 1;

                return (
                  <div key={index} className="relative pl-10">
                    <div className={cn(
                      'absolute left-2 w-5 h-5 rounded-full bg-background border-2',
                      isLast ? 'border-rust' : 'border-green-500'
                    )}>
                      <Icon className={cn(
                        'w-3 h-3 absolute top-0.5 left-0.5',
                        isLast ? 'text-rust' : 'text-green-500'
                      )} />
                    </div>

                    <div>
                      <p className="font-medium">{event.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(event.date), 'MMM d, yyyy h:mm a')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(event.date), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook to fetch submission data
function useSubmission(submissionId: string) {
  return trpc.ats.submissions.getById.useQuery({ id: submissionId });
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function SubmissionsWorkspace({ submissionId }: SubmissionsWorkspaceProps) {
  const router = useRouter();
  const { canEdit, canDelete, isLoading: contextLoading } = useWorkspaceContext('submission', submissionId);

  // Fetch submission data
  const { data: submission, isLoading: submissionLoading, error } = useSubmission(submissionId);

  // Dialogs
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  // Build tabs
  const tabs = useMemo((): WorkspaceTab[] => {
    if (!submission) return [];

    const interviewCount = submission.interviews?.length || 0;
    const offerCount = submission.offers?.length || 0;

    const baseTabs: WorkspaceTab[] = [
      {
        id: 'overview',
        label: 'Overview',
        icon: <FileText className="w-4 h-4" />,
        content: <OverviewTab submission={submission} canEdit={canEdit} />,
      },
      {
        id: 'interviews',
        label: 'Interviews',
        icon: <Video className="w-4 h-4" />,
        badge: interviewCount || undefined,
        content: <InterviewsTab submission={submission} canEdit={canEdit} />,
      },
      {
        id: 'offers',
        label: 'Offers',
        icon: <FileCheck className="w-4 h-4" />,
        badge: offerCount || undefined,
        content: <OffersTab submission={submission} canEdit={canEdit} />,
      },
      {
        id: 'timeline',
        label: 'Timeline',
        icon: <Clock className="w-4 h-4" />,
        content: <TimelineTab submission={submission} />,
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
        content: <div className="text-muted-foreground">Resumes, cover letters, and other documents</div>,
      },
    ];

    return baseTabs;
  }, [submission, canEdit]);

  // Sidebar stats
  const sidebarStats = useMemo((): StatItem[] => {
    if (!submission) return [];

    return [
      {
        label: 'Match Score',
        value: `${submission.aiMatchScore || 0}%`,
        icon: <Zap className="w-3 h-3" />,
      },
      {
        label: 'Rate',
        value: submission.submittedRate ? `$${Number(submission.submittedRate).toLocaleString()}` : '-',
        icon: <DollarSign className="w-3 h-3" />,
      },
      {
        label: 'Interviews',
        value: submission.interviewCount || 0,
        icon: <Video className="w-3 h-3" />,
      },
      {
        label: 'Days',
        value: differenceInDays(new Date(), new Date(submission.createdAt)),
        icon: <Calendar className="w-3 h-3" />,
      },
    ];
  }, [submission]);

  // Quick actions
  const quickActions = useMemo((): QuickAction[] => {
    return [
      {
        label: 'Schedule Interview',
        icon: <Calendar className="w-4 h-4 mr-2" />,
        onClick: () => {},
      },
      {
        label: 'Send to Client',
        icon: <Send className="w-4 h-4 mr-2" />,
        onClick: () => {},
      },
      {
        label: 'Create Offer',
        icon: <FileCheck className="w-4 h-4 mr-2" />,
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

    if (submission?.job) {
      objects.push({
        id: submission.job.id,
        type: 'Job',
        title: submission.job.title,
        href: `/employee/workspace/jobs/${submission.job.id}`,
        icon: <Briefcase className="w-4 h-4" />,
        status: submission.job.status,
      });
    }

    if (submission?.candidate) {
      objects.push({
        id: submission.candidate.id,
        type: 'Candidate',
        title: `${submission.candidate.firstName || ''} ${submission.candidate.lastName || ''}`.trim(),
        href: `/employee/workspace/talent/${submission.candidate.id}`,
        icon: <User className="w-4 h-4" />,
      });
    }

    if (submission?.account) {
      objects.push({
        id: submission.account.id,
        type: 'Account',
        title: submission.account.name,
        href: `/employee/workspace/accounts/${submission.account.id}`,
        icon: <Building2 className="w-4 h-4" />,
      });
    }

    return objects;
  }, [submission]);

  // Loading state
  if (submissionLoading || contextLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rust" />
      </div>
    );
  }

  // Error state
  if (error || !submission) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <AlertTriangle className="w-12 h-12 text-red-500" />
        <p className="text-lg font-medium">Submission not found</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const statusConfig = SUBMISSION_STATUSES[submission.status as keyof typeof SUBMISSION_STATUSES] ||
    { label: submission.status, color: 'bg-stone-100 text-stone-600' };

  const candidateName = submission.candidate
    ? `${submission.candidate.firstName || ''} ${submission.candidate.lastName || ''}`.trim()
    : 'Unknown Candidate';

  const isActive = submission.status !== 'rejected' && submission.status !== 'placed';

  return (
    <>
      <WorkspaceLayout
        title={candidateName}
        subtitle={submission.job?.title || undefined}
        backHref="/employee/workspace/submissions"
        backLabel="Submissions"
        status={{
          label: statusConfig.label,
          color: statusConfig.color,
        }}
        entityType="submission"
        entityId={submissionId}
        canEdit={canEdit}
        canDelete={canDelete}
        primaryAction={isActive ? {
          label: 'Advance Stage',
          icon: <ArrowRight className="w-4 h-4 mr-1" />,
          onClick: () => setShowStatusDialog(true),
        } : undefined}
        secondaryActions={isActive ? [
          {
            label: 'Reject',
            onClick: () => setShowRejectDialog(true),
            variant: 'outline',
          },
        ] : []}
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
        activityPanel={<ActivityPanel entityType="submission" entityId={submissionId} canEdit={canEdit} />}
        onDelete={() => {
          if (window.confirm('Are you sure you want to delete this submission?')) {
            // Handle delete
          }
        }}
      />

      {/* Update Status Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Submission Status</DialogTitle>
            <DialogDescription>
              Advance this submission to the next stage.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>New Status</Label>
              <Select defaultValue={submission.status}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SUBMISSION_STATUSES)
                    .filter(([key]) => key !== 'rejected')
                    .sort(([, a], [, b]) => a.order - b.order)
                    .map(([key, config]) => (
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
              setShowStatusDialog(false);
            }}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Submission</DialogTitle>
            <DialogDescription>
              Record why this submission is being rejected.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Rejection Source</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Who rejected?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recruiter">Recruiter</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="candidate">Candidate (Withdrew)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Rejection Reason</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(REJECTION_REASONS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Additional Notes</Label>
              <Textarea placeholder="Add any additional context..." />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => {
              setShowRejectDialog(false);
            }}>
              Reject Submission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default SubmissionsWorkspace;
