/**
 * Student Enrollment Types
 * Story: ACAD-002
 *
 * Enrollment system for tracking student course access, payments, and progress
 */

/**
 * StudentEnrollment - Core enrollment record
 */
export interface StudentEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: 'pending' | 'active' | 'completed' | 'dropped' | 'expired';
  enrolled_at: string;
  starts_at: string | null;
  expires_at: string | null;
  completed_at: string | null;
  dropped_at: string | null;
  payment_id: string | null;
  payment_amount: number | null;
  payment_type: 'subscription' | 'one_time' | 'free' | 'scholarship' | null;
  current_module_id: string | null;
  current_topic_id: string | null;
  completion_percentage: number;
  enrollment_source: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * EnrollmentWithCourse - Enrollment with course details
 */
export interface EnrollmentWithCourse extends StudentEnrollment {
  course: {
    id: string;
    slug: string;
    title: string;
    subtitle: string | null;
    thumbnail_url: string | null;
    total_modules: number;
    total_topics: number;
    estimated_duration_weeks: number;
  };
}

/**
 * EnrollmentWithProgress - Enrollment with current progress details
 */
export interface EnrollmentWithProgress extends StudentEnrollment {
  course: {
    id: string;
    slug: string;
    title: string;
    total_modules: number;
    total_topics: number;
  };
  current_module: {
    id: string;
    title: string;
    module_number: number;
  } | null;
  current_topic: {
    id: string;
    title: string;
    topic_number: number;
  } | null;
}

/**
 * EnrollStudentParams - Parameters for enrolling a student
 */
export interface EnrollStudentParams {
  userId: string;
  courseId: string;
  paymentId: string;
  paymentAmount: number;
  paymentType: 'subscription' | 'one_time' | 'free' | 'scholarship';
  startsAt?: string;
  expiresAt?: string;
}

/**
 * EnrollmentStatusChange - Parameters for status updates
 */
export interface EnrollmentStatusChange {
  enrollmentId: string;
  newStatus: 'pending' | 'active' | 'completed' | 'dropped' | 'expired';
  reason?: string;
}

/**
 * EnrollmentAnalytics - Aggregate enrollment statistics
 */
export interface EnrollmentAnalytics {
  course_id: string;
  course_title: string;
  total_enrollments: number;
  active_enrollments: number;
  completed_enrollments: number;
  dropped_enrollments: number;
  completion_rate: number;
  average_completion_days: number;
}

/**
 * PrerequisiteCheck - Result of prerequisite validation
 */
export interface PrerequisiteCheckResult {
  canEnroll: boolean;
  missingPrerequisites: Array<{
    courseId: string;
    courseTitle: string;
  }>;
  message?: string;
}

/**
 * CreateEnrollmentInput - Form input for creating enrollments
 */
export interface CreateEnrollmentInput {
  userId: string;
  courseId: string;
  paymentId: string;
  paymentAmount: number;
  paymentType: 'subscription' | 'one_time' | 'free' | 'scholarship';
  startsAt?: Date;
  expiresAt?: Date;
  notes?: string;
}

/**
 * UpdateEnrollmentInput - Form input for updating enrollments
 */
export interface UpdateEnrollmentInput {
  enrollmentId: string;
  status?: 'pending' | 'active' | 'completed' | 'dropped' | 'expired';
  currentModuleId?: string;
  currentTopicId?: string;
  completionPercentage?: number;
  notes?: string;
}

/**
 * EnrollmentFilters - Query filters for enrollment lists
 */
export interface EnrollmentFilters {
  userId?: string;
  courseId?: string;
  status?: 'pending' | 'active' | 'completed' | 'dropped' | 'expired' | 'all';
  enrolledAfter?: string;
  enrolledBefore?: string;
  paymentType?: 'subscription' | 'one_time' | 'free' | 'scholarship';
}

/**
 * EnrollmentEvent - Event payload for enrollment actions
 */
export interface EnrollmentEvent {
  type: 'course.enrolled' | 'enrollment.status_changed' | 'enrollment.progress_updated';
  enrollmentId: string;
  userId: string;
  courseId: string;
  timestamp: string;
  data: Record<string, any>;
}
