/**
 * Event Bus Type Definitions
 *
 * Defines type-safe event structures for the Event Bus system.
 * Each event type has a strongly-typed payload for type safety.
 */

/**
 * Base event structure
 */
export interface Event<T extends EventPayload> {
  id: string;
  type: string;
  category: string;
  payload: T;
  metadata: EventMetadata;
  userId?: string;
  orgId: string;
  createdAt: Date;
}

/**
 * Event payload (type-safe per event type)
 */
export type EventPayload = Record<string, any>;

/**
 * Event metadata (additional context)
 */
export interface EventMetadata {
  correlationId?: string;
  causationId?: string;
  source?: string;
  replayed?: boolean;
  replayedAt?: Date;
  [key: string]: any;
}

/**
 * Event types (expand as modules are built)
 */
export interface UserCreatedPayload {
  userId: string;
  email: string;
  fullName: string;
  role: string;
}

export interface CourseGraduatedPayload {
  studentId: string;
  courseId: string;
  courseName: string;
  completedAt: Date;
  grade: number;
}

export interface CourseEnrolledPayload {
  studentId: string;
  enrollmentId: string;
  courseId: string;
  courseName: string;
  enrolledAt: Date;
  paymentType: 'subscription' | 'one_time' | 'free' | 'scholarship';
  paymentAmount: number;
}

export interface CandidatePlacedPayload {
  candidateId: string;
  jobId: string;
  clientId: string;
  startDate: Date;
  salary: number;
}

export interface JobCreatedPayload {
  jobId: string;
  title: string;
  clientId: string;
  requiredSkills: string[];
  experienceYears: { min: number; max: number };
}

export interface CapstoneGradedPayload {
  submissionId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseName: string;
  grade: number;
  feedback: string;
  status: 'passed' | 'failed' | 'revision_requested';
  graderId: string;
  graderName: string;
  gradedAt: string;
}

export interface StudentAtRiskPayload {
  studentId: string;
  studentName: string;
  studentEmail: string;
  enrollmentId: string;
  courseId: string;
  courseName: string;
  riskReasons: string[];
  riskLevel: 'low' | 'medium' | 'high';
  interventionId: string;
  trainerId: string;
  detectedAt: string;
}

/**
 * Event handler function type
 */
export type EventHandler<T extends EventPayload = any> = (
  event: Event<T>
) => Promise<void>;

/**
 * Event subscription info (database record)
 */
export interface EventSubscription {
  id: string;
  subscriberName: string;
  eventPattern: string;
  isActive: boolean;
  failureCount: number;
  consecutiveFailures: number;
  lastFailureAt?: Date;
  lastFailureMessage?: string;
  lastTriggeredAt?: Date;
  autoDisabledAt?: Date;
  orgId: string;
}

/**
 * Event status enum
 */
export type EventStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'dead_letter';

/**
 * Handler health status
 */
export type HealthStatus = 'healthy' | 'healthy_with_errors' | 'warning' | 'critical' | 'disabled';
