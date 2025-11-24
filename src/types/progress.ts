/**
 * Progress Tracking System Types
 * Story: ACAD-003
 *
 * Tracks student progress through topics with XP gamification
 */

/**
 * TopicCompletion - Record of a student completing a topic
 */
export interface TopicCompletion {
  id: string;
  user_id: string;
  enrollment_id: string;
  course_id: string;
  module_id: string;
  topic_id: string;
  completed_at: string;
  time_spent_seconds: number;
  xp_earned: number;
  completion_source: 'manual' | 'auto' | 'admin_override';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * XPTransaction - Ledger entry for XP awards and penalties
 */
export interface XPTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type:
    | 'topic_completion'
    | 'quiz_passed'
    | 'lab_completed'
    | 'project_submitted'
    | 'bonus_achievement'
    | 'penalty'
    | 'adjustment';
  reference_type: 'topic_completion' | 'enrollment' | 'achievement' | 'admin_action' | null;
  reference_id: string | null;
  description: string | null;
  awarded_at: string;
  awarded_by: string | null;
  created_at: string;
}

/**
 * UserXPTotal - Aggregated XP for leaderboard
 */
export interface UserXPTotal {
  user_id: string;
  total_xp: number;
  transaction_count: number;
  last_xp_earned_at: string;
  leaderboard_rank: number;
}

/**
 * Extended types with relationships
 */

export interface TopicCompletionWithDetails extends TopicCompletion {
  course?: {
    id: string;
    title: string;
    slug: string;
  };
  module?: {
    id: string;
    title: string;
    module_number: number;
  };
  topic?: {
    id: string;
    title: string;
    topic_number: number;
    content_type: string;
  };
}

export interface XPTransactionWithUser extends XPTransaction {
  user?: {
    id: string;
    full_name: string;
    email: string;
  };
  awarded_by_user?: {
    id: string;
    full_name: string;
  };
}

export interface UserXPTotalWithProfile extends UserXPTotal {
  profile?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
}

/**
 * Function inputs
 */

export interface CompleteTopicInput {
  user_id: string;
  enrollment_id: string;
  topic_id: string;
  time_spent_seconds?: number;
}

export interface AwardXPInput {
  user_id: string;
  amount: number;
  transaction_type: XPTransaction['transaction_type'];
  reference_type?: XPTransaction['reference_type'];
  reference_id?: string;
  description?: string;
  awarded_by?: string;
}

/**
 * Query result types
 */

export interface StudentProgressSummary {
  enrollment_id: string;
  user_id: string;
  course_id: string;
  total_topics: number;
  completed_topics: number;
  completion_percentage: number;
  total_xp_earned: number;
  current_module_id: string | null;
  current_topic_id: string | null;
  unlocked_topics: string[];
  locked_topics: string[];
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  total_xp: number;
  transaction_count: number;
  last_xp_earned_at: string;
}

export interface TopicUnlockStatus {
  topic_id: string;
  is_unlocked: boolean;
  is_completed: boolean;
  prerequisite_topics: string[];
  missing_prerequisites: string[];
}

/**
 * Utility types
 */

export interface ProgressMetrics {
  overall_completion: number;
  xp_earned: number;
  topics_completed: number;
  quizzes_passed: number;
  labs_completed: number;
  projects_submitted: number;
  avg_time_per_topic: number;
  total_time_spent: number;
  current_streak_days: number;
}

export interface XPBreakdown {
  topics: number;
  quizzes: number;
  labs: number;
  projects: number;
  bonuses: number;
  adjustments: number;
  total: number;
}

/**
 * Response types for tRPC endpoints
 */

export interface GetProgressResponse {
  success: true;
  data: StudentProgressSummary;
}

export interface CompleteTopicResponse {
  success: true;
  data: {
    completion_id: string;
    xp_earned: number;
    total_xp: number;
    new_completion_percentage: number;
    unlocked_topics: string[];
  };
}

export interface GetLeaderboardResponse {
  success: true;
  data: {
    entries: LeaderboardEntry[];
    user_rank: number | null;
    total_users: number;
  };
}

export interface GetXPHistoryResponse {
  success: true;
  data: {
    transactions: XPTransactionWithUser[];
    breakdown: XPBreakdown;
    total_xp: number;
  };
}

/**
 * Error types
 */

export class TopicLockedError extends Error {
  constructor(topicId: string, missingPrerequisites: string[]) {
    super(`Topic ${topicId} is locked. Missing prerequisites: ${missingPrerequisites.join(', ')}`);
    this.name = 'TopicLockedError';
  }
}

export class TopicAlreadyCompletedError extends Error {
  constructor(topicId: string) {
    super(`Topic ${topicId} has already been completed`);
    this.name = 'TopicAlreadyCompletedError';
  }
}

export class InvalidXPAmountError extends Error {
  constructor(amount: number) {
    super(`Invalid XP amount: ${amount}. Must be non-zero integer.`);
    this.name = 'InvalidXPAmountError';
  }
}
