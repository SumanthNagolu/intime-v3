/**
 * Submission Type Adapter
 *
 * Transforms between database Submission type and frontend display type.
 */

import type {
  AlignedSubmission,
  DisplaySubmission,
  SubmissionStatus,
  AlignedJob,
  AlignedCandidate,
} from '@/types/aligned/ats';
import { formatDistanceToNow } from 'date-fns';

// ============================================
// DATABASE TO FRONTEND
// ============================================

export function dbSubmissionToDisplay(
  submission: AlignedSubmission,
  options?: {
    job?: AlignedJob | { id: string; title: string };
    candidate?: AlignedCandidate | { id: string; fullName: string };
    account?: { id: string; name: string };
  }
): DisplaySubmission {
  const job = options?.job || submission.job;
  const candidate = options?.candidate || submission.candidate;
  const account = options?.account || submission.account;

  return {
    id: submission.id,
    jobId: submission.jobId,
    candidateId: submission.candidateId,
    status: mapSubmissionStatus(submission.submissionStatus),
    createdAt: submission.createdAt.toISOString(),
    lastActivity: submission.updatedAt.toISOString(),
    notes: submission.submissionNotes || undefined,
    matchScore: submission.aiMatchScore || 0,
    // Extended fields
    candidateName: candidate ? ('fullName' in candidate ? candidate.fullName : undefined) : undefined,
    jobTitle: job?.title,
    clientName: account?.name,
    submittedRate: submission.submittedRate
      ? `$${submission.submittedRate}/${submission.submittedRateType === 'annual' ? 'yr' : 'hr'}`
      : undefined,
    interviewCount: submission.interviewCount,
  };
}

export function dbSubmissionsToDisplay(
  submissions: AlignedSubmission[]
): DisplaySubmission[] {
  return submissions.map(sub => dbSubmissionToDisplay(sub));
}

// ============================================
// FRONTEND TO DATABASE
// ============================================

export interface CreateSubmissionInput {
  jobId: string;
  candidateId: string;
  status?: DisplaySubmission['status'];
  notes?: string;
  matchScore?: number;
  submittedRate?: number;
  rateType?: 'hourly' | 'annual';
}

export function displaySubmissionToDb(
  input: CreateSubmissionInput,
  ctx: { orgId: string; userId: string }
): Partial<AlignedSubmission> {
  return {
    orgId: ctx.orgId,
    jobId: input.jobId,
    candidateId: input.candidateId,
    ownerId: ctx.userId,
    submissionStatus: mapDisplayStatusToDb(input.status),
    submissionNotes: input.notes || null,
    aiMatchScore: input.matchScore || null,
    submittedRate: input.submittedRate || null,
    submittedRateType: input.rateType || 'hourly',
    interviewCount: 0,
    createdBy: ctx.userId,
  };
}

// ============================================
// STATUS MAPPING
// ============================================

function mapSubmissionStatus(
  status: SubmissionStatus
): DisplaySubmission['status'] {
  // Map database status to frontend status
  const map: Record<SubmissionStatus, DisplaySubmission['status']> = {
    'sourced': 'sourced',
    'screening': 'screening',
    'submission_ready': 'submission_ready',
    'submitted_to_client': 'submitted_to_client',
    'client_review': 'submitted_to_client', // Grouped with submitted
    'client_interview': 'client_interview',
    'offer_stage': 'offer',
    'placed': 'placed',
    'rejected': 'rejected',
    'withdrawn': 'rejected', // Grouped with rejected
  };

  return map[status] || 'sourced';
}

function mapDisplayStatusToDb(
  status?: DisplaySubmission['status']
): SubmissionStatus {
  if (!status) return 'sourced';

  const map: Record<DisplaySubmission['status'], SubmissionStatus> = {
    'sourced': 'sourced',
    'screening': 'screening',
    'submission_ready': 'submission_ready',
    'submitted_to_client': 'submitted_to_client',
    'client_interview': 'client_interview',
    'offer': 'offer_stage',
    'placed': 'placed',
    'rejected': 'rejected',
  };

  return map[status] || 'sourced';
}

// All valid submission statuses for pipeline
export const PIPELINE_STAGES: SubmissionStatus[] = [
  'sourced',
  'screening',
  'submission_ready',
  'submitted_to_client',
  'client_review',
  'client_interview',
  'offer_stage',
  'placed',
];

export const PIPELINE_STAGE_LABELS: Record<SubmissionStatus, string> = {
  'sourced': 'Sourced',
  'screening': 'Screening',
  'submission_ready': 'Ready to Submit',
  'submitted_to_client': 'Submitted',
  'client_review': 'Client Review',
  'client_interview': 'Interview',
  'offer_stage': 'Offer',
  'placed': 'Placed',
  'rejected': 'Rejected',
  'withdrawn': 'Withdrawn',
};

// ============================================
// PIPELINE GROUPING
// ============================================

export interface PipelineData {
  [stage: string]: DisplaySubmission[];
}

export function groupSubmissionsByStage(
  submissions: AlignedSubmission[]
): PipelineData {
  const pipeline: PipelineData = {};

  // Initialize all stages
  PIPELINE_STAGES.forEach(stage => {
    pipeline[stage] = [];
  });

  // Group submissions
  submissions.forEach(sub => {
    const displaySub = dbSubmissionToDisplay(sub);
    const stage = sub.submissionStatus;

    // Skip rejected/withdrawn for main pipeline
    if (stage !== 'rejected' && stage !== 'withdrawn') {
      if (!pipeline[stage]) pipeline[stage] = [];
      pipeline[stage].push(displaySub);
    }
  });

  return pipeline;
}

// ============================================
// FORMATTING UTILITIES
// ============================================

export function formatLastActivity(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function getStatusColor(status: DisplaySubmission['status']): string {
  const colors: Record<DisplaySubmission['status'], string> = {
    'sourced': 'bg-gray-100 text-gray-800',
    'screening': 'bg-blue-100 text-blue-800',
    'submission_ready': 'bg-indigo-100 text-indigo-800',
    'submitted_to_client': 'bg-purple-100 text-purple-800',
    'client_interview': 'bg-yellow-100 text-yellow-800',
    'offer': 'bg-green-100 text-green-800',
    'placed': 'bg-emerald-100 text-emerald-800',
    'rejected': 'bg-red-100 text-red-800',
  };

  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getMatchScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
}

export function getMatchScoreBadge(score: number): {
  variant: 'success' | 'warning' | 'destructive' | 'secondary';
  label: string;
} {
  if (score >= 80) return { variant: 'success', label: 'Excellent Match' };
  if (score >= 60) return { variant: 'warning', label: 'Good Match' };
  if (score >= 40) return { variant: 'secondary', label: 'Fair Match' };
  return { variant: 'destructive', label: 'Poor Match' };
}

// ============================================
// STATISTICS
// ============================================

export interface SubmissionStats {
  total: number;
  byStatus: Record<string, number>;
  averageMatchScore: number;
  averageTimeInStage: Record<string, number>;
}

export function calculateSubmissionStats(
  submissions: AlignedSubmission[]
): SubmissionStats {
  const byStatus: Record<string, number> = {};
  let totalScore = 0;
  let scoreCount = 0;

  submissions.forEach(sub => {
    byStatus[sub.submissionStatus] = (byStatus[sub.submissionStatus] || 0) + 1;

    if (sub.aiMatchScore) {
      totalScore += sub.aiMatchScore;
      scoreCount++;
    }
  });

  return {
    total: submissions.length,
    byStatus,
    averageMatchScore: scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0,
    averageTimeInStage: {}, // Would need timeline data to calculate
  };
}

// ============================================
// UTILITY EXPORTS
// ============================================

export const submissionAdapter = {
  toDisplay: dbSubmissionToDisplay,
  toDisplayList: dbSubmissionsToDisplay,
  toDb: displaySubmissionToDb,
  groupByStage: groupSubmissionsByStage,
  formatLastActivity,
  getStatusColor,
  getMatchScoreColor,
  getMatchScoreBadge,
  calculateStats: calculateSubmissionStats,
  PIPELINE_STAGES,
  PIPELINE_STAGE_LABELS,
};
