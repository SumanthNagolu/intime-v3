/**
 * Lab Environment Types
 * ACAD-008
 */

// ============================================================================
// LAB TEMPLATES
// ============================================================================

export interface LabTemplate {
  id: string;
  name: string;
  description: string | null;
  githubTemplateUrl: string;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  timeLimitMinutes: number;
  autoGradingEnabled: boolean;
  githubActionsWorkflow: string | null;
  requiredSkills: string[];
  estimatedDurationMinutes: number | null;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

// ============================================================================
// LAB INSTANCES
// ============================================================================

export interface LabInstance {
  id: string;
  userId: string;
  topicId: string;
  enrollmentId: string;
  labTemplateId: string | null;
  forkedRepoUrl: string;
  forkedRepoName: string | null;
  originalTemplateUrl: string;
  status: LabInstanceStatus;
  startedAt: Date;
  expiresAt: Date | null;
  completedAt: Date | null;
  timeSpentSeconds: number;
  lastActivityAt: Date;
  githubUsername: string | null;
  provisioningMetadata: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}

export type LabInstanceStatus = 'active' | 'submitted' | 'expired' | 'abandoned' | 'completed';

export interface ActiveLabInstance {
  instanceId: string;
  forkedRepoUrl: string;
  startedAt: Date;
  expiresAt: Date;
  timeRemainingSeconds: number;
  status: LabInstanceStatus;
}

// ============================================================================
// LAB SUBMISSIONS
// ============================================================================

export interface LabSubmission {
  id: string;
  userId: string;
  topicId: string;
  enrollmentId: string;
  labInstanceId: string;
  repositoryUrl: string;
  commitSha: string | null;
  branchName: string;
  submittedAt: Date;
  status: LabSubmissionStatus;
  autoGradeResult: AutoGradeResult | null;
  autoGradeScore: number | null;
  autoGradedAt: Date | null;
  manualGradeScore: number | null;
  rubricScores: RubricScores | null;
  gradedBy: string | null;
  gradedAt: Date | null;
  feedback: string | null;
  finalScore: number | null;
  passed: boolean | null;
  attemptNumber: number;
  previousSubmissionId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type LabSubmissionStatus =
  | 'pending'
  | 'grading'
  | 'auto_graded'
  | 'manual_review'
  | 'passed'
  | 'failed';

export interface AutoGradeResult {
  testsPassed: number;
  testsFailed: number;
  totalTests: number;
  coverage?: number;
  lintErrors?: number;
  buildSuccess?: boolean;
  executionTime?: number;
  logs?: string[];
}

export interface RubricScores {
  codeQuality?: number;
  functionality?: number;
  documentation?: number;
  testing?: number;
  design?: number;
  [key: string]: number | undefined;
}

// ============================================================================
// GRADING QUEUE
// ============================================================================

export interface GradingQueueItem {
  submissionId: string;
  userId: string;
  studentName: string;
  studentEmail: string;
  topicId: string;
  topicTitle: string;
  moduleTitle: string;
  courseTitle: string;
  repositoryUrl: string;
  commitSha: string | null;
  submittedAt: Date;
  status: LabSubmissionStatus;
  autoGradeScore: number | null;
  attemptNumber: number;
  enrollmentId: string;
}

// ============================================================================
// LAB STATISTICS
// ============================================================================

export interface LabStatistics {
  topicId: string;
  labTitle: string;
  totalStudentsStarted: number;
  totalStudentsSubmitted: number;
  totalPassed: number;
  totalFailed: number;
  avgFinalScore: number;
  avgTimeSpentSeconds: number;
}

// ============================================================================
// LAB PROVISIONING
// ============================================================================

export interface LabProvisioningRequest {
  userId: string;
  topicId: string;
  enrollmentId: string;
  templateUrl: string;
  githubUsername: string;
  timeLimitMinutes?: number;
}

export interface LabProvisioningResult {
  instanceId: string;
  forkedRepoUrl: string;
  expiresAt: Date;
  instructions?: string;
}

// ============================================================================
// LAB SUBMISSION REQUEST
// ============================================================================

export interface LabSubmissionRequest {
  userId: string;
  topicId: string;
  enrollmentId: string;
  labInstanceId: string;
  repositoryUrl: string;
  commitSha?: string;
  branchName?: string;
}

// ============================================================================
// GRADING REQUESTS
// ============================================================================

export interface ManualGradeRequest {
  submissionId: string;
  graderId: string;
  manualScore: number;
  rubricScores?: RubricScores;
  feedback?: string;
  passed?: boolean;
}

export interface AutoGradeWebhook {
  submissionId: string;
  repositoryUrl: string;
  commitSha: string;
  result: AutoGradeResult;
  score: number;
  passed: boolean;
}

// ============================================================================
// LAB SUBMISSION HISTORY
// ============================================================================

export interface LabSubmissionHistoryItem {
  submissionId: string;
  repositoryUrl: string;
  submittedAt: Date;
  status: LabSubmissionStatus;
  finalScore: number | null;
  passed: boolean | null;
  feedback: string | null;
  attemptNumber: number;
}

// ============================================================================
// HELPER TYPES
// ============================================================================

export interface LabError {
  code: string;
  message: string;
  details?: unknown;
}

export interface LabTimeRemaining {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isExpired: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate time remaining for a lab instance
 */
export function calculateTimeRemaining(expiresAt: Date): LabTimeRemaining {
  const now = new Date();
  const totalSeconds = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    hours,
    minutes,
    seconds,
    totalSeconds,
    isExpired: totalSeconds === 0,
  };
}

/**
 * Format time remaining as string
 */
export function formatTimeRemaining(timeRemaining: LabTimeRemaining): string {
  if (timeRemaining.isExpired) {
    return 'Expired';
  }

  const parts: string[] = [];

  if (timeRemaining.hours > 0) {
    parts.push(`${timeRemaining.hours}h`);
  }
  if (timeRemaining.minutes > 0 || timeRemaining.hours > 0) {
    parts.push(`${timeRemaining.minutes}m`);
  }
  parts.push(`${timeRemaining.seconds}s`);

  return parts.join(' ');
}

/**
 * Calculate pass/fail based on score
 */
export function calculatePassed(score: number, passingThreshold: number = 70): boolean {
  return score >= passingThreshold;
}

/**
 * Extract GitHub repo owner and name from URL
 */
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) return null;

  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/, ''),
  };
}

/**
 * Generate grading rubric template
 */
export function generateRubricTemplate(categories: string[]): RubricScores {
  const rubric: RubricScores = {};
  categories.forEach((category) => {
    rubric[category] = 0;
  });
  return rubric;
}

/**
 * Calculate average rubric score
 */
export function calculateAverageRubricScore(rubricScores: RubricScores): number {
  const scores = Object.values(rubricScores).filter((score): score is number => score !== undefined);
  if (scores.length === 0) return 0;

  const sum = scores.reduce((acc, score) => acc + score, 0);
  return Math.round(sum / scores.length);
}

/**
 * Determine submission status color for UI
 */
export function getSubmissionStatusColor(status: LabSubmissionStatus): string {
  switch (status) {
    case 'passed':
      return 'green';
    case 'failed':
      return 'red';
    case 'pending':
    case 'grading':
      return 'yellow';
    case 'auto_graded':
    case 'manual_review':
      return 'blue';
    default:
      return 'gray';
  }
}

/**
 * Get submission status display text
 */
export function getSubmissionStatusText(status: LabSubmissionStatus): string {
  switch (status) {
    case 'pending':
      return 'Pending Review';
    case 'grading':
      return 'Grading in Progress';
    case 'auto_graded':
      return 'Auto-Graded';
    case 'manual_review':
      return 'Awaiting Manual Review';
    case 'passed':
      return 'Passed';
    case 'failed':
      return 'Failed';
    default:
      return 'Unknown';
  }
}
