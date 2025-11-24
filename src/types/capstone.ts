/**
 * Capstone Project System Types
 * ACAD-012
 */

// ============================================================================
// BASE TYPES
// ============================================================================

export type CapstoneStatus =
  | 'pending'           // Just submitted
  | 'peer_review'       // Awaiting peer reviews
  | 'trainer_review'    // Awaiting trainer grading
  | 'passed'            // Approved
  | 'failed'            // Rejected (no more attempts)
  | 'revision_requested'; // Needs changes

// ============================================================================
// CAPSTONE SUBMISSION
// ============================================================================

export interface CapstoneSubmission {
  id: string;
  userId: string;
  enrollmentId: string;
  courseId: string;

  // Submission details
  repositoryUrl: string;
  demoVideoUrl: string | null;
  description: string | null;
  submittedAt: Date;
  revisionCount: number;

  // Status
  status: CapstoneStatus;

  // Grading
  gradedBy: string | null;
  gradedAt: Date | null;
  grade: number | null;
  feedback: string | null;
  rubricScores: RubricScores | null;

  // Peer reviews
  peerReviewCount: number;
  avgPeerRating: number | null;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface CapstoneSubmissionWithDetails extends CapstoneSubmission {
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  graderName: string | null;
}

// ============================================================================
// PEER REVIEW
// ============================================================================

export interface PeerReview {
  id: string;
  submissionId: string;
  reviewerId: string;

  // Review content
  rating: number; // 1-5
  comments: string;
  strengths: string | null;
  improvements: string | null;

  // Timestamps
  reviewedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PeerReviewWithReviewer extends PeerReview {
  reviewerName: string;
}

// ============================================================================
// GRADING RUBRIC
// ============================================================================

export interface RubricScores {
  functionality: number;        // Max 30 points
  codeQuality: number;          // Max 25 points
  documentation: number;        // Max 15 points
  testing: number;              // Max 15 points
  userExperience: number;       // Max 10 points
  innovation: number;           // Max 5 points
  [key: string]: number;        // Allow custom criteria
}

export interface RubricCriteria {
  name: string;
  maxPoints: number;
  description: string;
}

export const DEFAULT_RUBRIC_CRITERIA: RubricCriteria[] = [
  {
    name: 'functionality',
    maxPoints: 30,
    description: 'Core features work correctly and meet requirements',
  },
  {
    name: 'codeQuality',
    maxPoints: 25,
    description: 'Clean, maintainable code following best practices',
  },
  {
    name: 'documentation',
    maxPoints: 15,
    description: 'Clear README, code comments, and setup instructions',
  },
  {
    name: 'testing',
    maxPoints: 15,
    description: 'Adequate test coverage and edge case handling',
  },
  {
    name: 'userExperience',
    maxPoints: 10,
    description: 'Intuitive UI/UX and good usability',
  },
  {
    name: 'innovation',
    maxPoints: 5,
    description: 'Creative solutions and extra features',
  },
];

// ============================================================================
// FORMS & INPUTS
// ============================================================================

export interface SubmitCapstoneInput {
  enrollmentId: string;
  courseId: string;
  repositoryUrl: string;
  demoVideoUrl?: string;
  description?: string;
}

export interface SubmitPeerReviewInput {
  submissionId: string;
  rating: number;
  comments: string;
  strengths?: string;
  improvements?: string;
}

export interface GradeCapstoneInput {
  submissionId: string;
  grade: number;
  feedback: string;
  rubricScores?: RubricScores;
  status: 'passed' | 'failed' | 'revision_requested';
}

// ============================================================================
// QUERIES
// ============================================================================

export interface GetCapstoneSubmissionsInput {
  userId?: string;
  courseId?: string;
  status?: CapstoneStatus;
  limit?: number;
  offset?: number;
}

export interface GetSubmissionsForPeerReviewInput {
  courseId: string;
  limit?: number;
}

// ============================================================================
// STATISTICS
// ============================================================================

export interface CapstoneStatistics {
  courseId: string;
  courseTitle: string;
  totalSubmissions: number;
  passedCount: number;
  failedCount: number;
  revisionCount: number;
  avgGrade: number | null;
  avgPeerReviews: number;
  avgRevisions: number;
}

export interface PeerReviewLeaderboard {
  reviewerId: string;
  reviewerName: string;
  reviewsCompleted: number;
  avgRatingGiven: number;
  coursesReviewed: number;
}

// ============================================================================
// GRADUATION
// ============================================================================

export interface GraduationEligibility {
  eligible: boolean;
  capstoneCompleted: boolean;
  allTopicsCompleted: boolean;
  completionPercentage: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate total grade from rubric scores
 */
export function calculateGradeFromRubric(rubricScores: RubricScores): number {
  const total = Object.values(rubricScores).reduce((sum, score) => sum + score, 0);
  return Math.min(100, total);
}

/**
 * Validate rubric scores
 */
export function validateRubricScores(
  rubricScores: RubricScores,
  criteria: RubricCriteria[] = DEFAULT_RUBRIC_CRITERIA
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const criterion of criteria) {
    const score = rubricScores[criterion.name];

    if (score === undefined) {
      errors.push(`Missing score for ${criterion.name}`);
      continue;
    }

    if (score < 0) {
      errors.push(`${criterion.name} score cannot be negative`);
    }

    if (score > criterion.maxPoints) {
      errors.push(`${criterion.name} score exceeds maximum (${criterion.maxPoints})`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get status badge color
 */
export function getStatusBadgeColor(status: CapstoneStatus): string {
  switch (status) {
    case 'passed':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'failed':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    case 'revision_requested':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'trainer_review':
    case 'peer_review':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'pending':
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  }
}

/**
 * Get status display text
 */
export function getStatusDisplayText(status: CapstoneStatus): string {
  switch (status) {
    case 'pending':
      return 'Pending Review';
    case 'peer_review':
      return 'Peer Review';
    case 'trainer_review':
      return 'Trainer Review';
    case 'passed':
      return 'Passed';
    case 'failed':
      return 'Failed';
    case 'revision_requested':
      return 'Revision Requested';
    default:
      return status;
  }
}

/**
 * Format peer rating for display
 */
export function formatPeerRating(rating: number | null): string {
  if (rating === null) return 'No reviews';
  return `${rating.toFixed(1)}/5.0`;
}

/**
 * Check if submission can be graded
 */
export function canGradeSubmission(submission: CapstoneSubmission): boolean {
  return ['pending', 'peer_review', 'trainer_review', 'revision_requested'].includes(
    submission.status
  );
}

/**
 * Check if submission can be edited
 */
export function canEditSubmission(submission: CapstoneSubmission): boolean {
  return submission.status === 'revision_requested';
}

/**
 * Check if user can submit peer review
 */
export function canSubmitPeerReview(
  submission: CapstoneSubmission,
  currentUserId: string
): boolean {
  return (
    submission.userId !== currentUserId &&
    ['pending', 'peer_review'].includes(submission.status)
  );
}

/**
 * Get grade letter
 */
export function getGradeLetter(grade: number): string {
  if (grade >= 90) return 'A';
  if (grade >= 80) return 'B';
  if (grade >= 70) return 'C';
  if (grade >= 60) return 'D';
  return 'F';
}

/**
 * Get grade color
 */
export function getGradeColor(grade: number): string {
  if (grade >= 90) return 'text-green-600 dark:text-green-400';
  if (grade >= 80) return 'text-blue-600 dark:text-blue-400';
  if (grade >= 70) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}
