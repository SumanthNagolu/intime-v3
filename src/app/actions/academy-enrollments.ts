'use server';

/**
 * Academy Enrollments Server Actions
 * Handles student enrollments, progress tracking, and at-risk management
 */

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import {
  studentEnrollments,
  topicCompletions,
  courses,
  courseModules,
  moduleTopics,
  studentInterventions,
} from '@/lib/db/schema/academy';
import { userProfiles } from '@/lib/db/schema/user-profiles';
import { eq, and, or, ilike, desc, asc, sql, isNull, inArray, gte, lte } from 'drizzle-orm';

// =====================================================
// Types
// =====================================================

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResult<T> {
  success: boolean;
  data?: T[];
  total?: number;
  page?: number;
  pageSize?: number;
  error?: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  courseId: string;
  courseTitle: string | null;
  courseSlug: string | null;
  status: string;
  enrolledAt: string;
  completedAt: string | null;
  expiresAt: string | null;
  currentModuleId: string | null;
  currentModuleName: string | null;
  currentTopicId: string | null;
  currentTopicName: string | null;
  completionPercentage: number;
  isAtRisk: boolean;
  atRiskSince: string | null;
  paymentId: string | null;
  paymentAmount: number | null;
  paymentType: string | null;
  topicsCompleted: number;
  totalTopics: number;
}

export interface EnrollmentSummary {
  id: string;
  courseId: string;
  courseTitle: string | null;
  courseSlug: string | null;
  status: string;
  enrolledAt: string;
  completionPercentage: number;
  isAtRisk: boolean;
}

export interface StudentIntervention {
  id: string;
  enrollmentId: string;
  studentId: string;
  studentName: string | null;
  trainerId: string;
  trainerName: string | null;
  riskReasons: string[] | null;
  notes: string | null;
  status: string;
  createdAt: string;
  contactedAt: string | null;
  resolvedAt: string | null;
}

// =====================================================
// Helper Functions
// =====================================================

async function getCurrentUserContext() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.id, user.id),
  });

  return profile ? { userId: user.id, orgId: profile.orgId } : null;
}

async function checkPermission(
  userId: string,
  permission: string,
  resourceType?: string,
  resourceId?: string
): Promise<{ allowed: boolean; scope?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('check_user_permission' as any, {
    p_user_id: userId,
    p_permission: permission,
    p_resource_type: resourceType || null,
    p_resource_id: resourceId || null,
  });

  if (error) {
    console.error('Permission check error:', error);
    return { allowed: false };
  }

  // RPC returns boolean directly, not an object
  return { allowed: data ?? false };
}

async function logAuditEvent(
  userId: string,
  orgId: string,
  action: string,
  resourceType: string,
  resourceId: string | null,
  details: Record<string, unknown>,
  severity: 'info' | 'warning' | 'critical' = 'info'
) {
  const supabase = await createClient();

  await supabase.from('audit_logs').insert({
    user_id: userId,
    org_id: orgId,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    details,
    severity,
    ip_address: null,
    user_agent: null,
  });
}

// =====================================================
// Enrollment Actions
// =====================================================

const listEnrollmentsSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  userId: z.string().uuid().optional(),
  courseId: z.string().uuid().optional(),
  status: z.enum(['pending', 'active', 'completed', 'dropped', 'expired']).optional(),
  isAtRisk: z.boolean().optional(),
  sortBy: z.enum(['enrolledAt', 'completionPercentage', 'status']).default('enrolledAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export async function listEnrollmentsAction(
  input: z.infer<typeof listEnrollmentsSchema>
): Promise<PaginatedResult<Enrollment>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const { allowed } = await checkPermission(context.userId, 'academy:read');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    const validated = listEnrollmentsSchema.parse(input);
    const { page, pageSize, search, userId, courseId, status, isAtRisk, sortBy, sortOrder } = validated;
    const offset = (page - 1) * pageSize;

    // Build conditions
    const conditions = [];

    if (userId) {
      conditions.push(eq(studentEnrollments.user_id, userId));
    }

    if (courseId) {
      conditions.push(eq(studentEnrollments.course_id, courseId));
    }

    if (status) {
      conditions.push(eq(studentEnrollments.status, status));
    }

    if (isAtRisk !== undefined) {
      conditions.push(eq(studentEnrollments.is_at_risk, isAtRisk));
    }

    // Build query with joins
    let query = db
      .select({
        id: studentEnrollments.id,
        userId: studentEnrollments.user_id,
        courseId: studentEnrollments.course_id,
        status: studentEnrollments.status,
        enrolledAt: studentEnrollments.enrolled_at,
        completedAt: studentEnrollments.completed_at,
        expiresAt: studentEnrollments.expires_at,
        currentModuleId: studentEnrollments.current_module_id,
        currentTopicId: studentEnrollments.current_topic_id,
        completionPercentage: studentEnrollments.completion_percentage,
        isAtRisk: studentEnrollments.is_at_risk,
        atRiskSince: studentEnrollments.at_risk_since,
        paymentId: studentEnrollments.payment_id,
        paymentAmount: studentEnrollments.payment_amount,
        paymentType: studentEnrollments.payment_type,
        userFirstName: userProfiles.firstName,
        userLastName: userProfiles.lastName,
        userEmail: userProfiles.email,
        courseTitle: courses.title,
        courseSlug: courses.slug,
        totalTopics: courses.total_topics,
      })
      .from(studentEnrollments)
      .innerJoin(userProfiles, eq(studentEnrollments.user_id, userProfiles.id))
      .innerJoin(courses, eq(studentEnrollments.course_id, courses.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    // Apply search filter
    if (search) {
      query = db
        .select({
          id: studentEnrollments.id,
          userId: studentEnrollments.user_id,
          courseId: studentEnrollments.course_id,
          status: studentEnrollments.status,
          enrolledAt: studentEnrollments.enrolled_at,
          completedAt: studentEnrollments.completed_at,
          expiresAt: studentEnrollments.expires_at,
          currentModuleId: studentEnrollments.current_module_id,
          currentTopicId: studentEnrollments.current_topic_id,
          completionPercentage: studentEnrollments.completion_percentage,
          isAtRisk: studentEnrollments.is_at_risk,
          atRiskSince: studentEnrollments.at_risk_since,
          paymentId: studentEnrollments.payment_id,
          paymentAmount: studentEnrollments.payment_amount,
          paymentType: studentEnrollments.payment_type,
          userFirstName: userProfiles.firstName,
          userLastName: userProfiles.lastName,
          userEmail: userProfiles.email,
          courseTitle: courses.title,
          courseSlug: courses.slug,
          totalTopics: courses.total_topics,
        })
        .from(studentEnrollments)
        .innerJoin(userProfiles, eq(studentEnrollments.user_id, userProfiles.id))
        .innerJoin(courses, eq(studentEnrollments.course_id, courses.id))
        .where(and(
          ...(conditions.length > 0 ? conditions : []),
          or(
            ilike(userProfiles.firstName, `%${search}%`),
            ilike(userProfiles.lastName, `%${search}%`),
            ilike(userProfiles.email, `%${search}%`),
            ilike(courses.title, `%${search}%`)
          )
        )) as typeof query;
    }

    // Apply sorting
    const orderFn = sortOrder === 'asc' ? asc : desc;
    switch (sortBy) {
      case 'completionPercentage':
        query = query.orderBy(orderFn(studentEnrollments.completion_percentage)) as typeof query;
        break;
      case 'status':
        query = query.orderBy(orderFn(studentEnrollments.status)) as typeof query;
        break;
      case 'enrolledAt':
      default:
        query = query.orderBy(orderFn(studentEnrollments.enrolled_at)) as typeof query;
        break;
    }

    const enrollments = await query.limit(pageSize).offset(offset);

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(studentEnrollments)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = Number(countResult[0]?.count || 0);

    // Get additional data for each enrollment
    const enrollmentData: Enrollment[] = await Promise.all(
      enrollments.map(async (enrollment) => {
        // Get current module name
        let currentModuleName: string | null = null;
        if (enrollment.currentModuleId) {
          const module = await db.query.courseModules.findFirst({
            where: eq(courseModules.id, enrollment.currentModuleId),
            columns: { title: true },
          });
          currentModuleName = module?.title || null;
        }

        // Get current topic name
        let currentTopicName: string | null = null;
        if (enrollment.currentTopicId) {
          const topic = await db.query.moduleTopics.findFirst({
            where: eq(moduleTopics.id, enrollment.currentTopicId),
            columns: { title: true },
          });
          currentTopicName = topic?.title || null;
        }

        // Get topics completed count
        const topicsCompletedResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(topicCompletions)
          .where(eq(topicCompletions.enrollment_id, enrollment.id));

        return {
          id: enrollment.id,
          userId: enrollment.userId,
          userName: `${enrollment.userFirstName || ''} ${enrollment.userLastName || ''}`.trim() || null,
          userEmail: enrollment.userEmail,
          courseId: enrollment.courseId,
          courseTitle: enrollment.courseTitle,
          courseSlug: enrollment.courseSlug,
          status: enrollment.status,
          enrolledAt: enrollment.enrolledAt.toISOString(),
          completedAt: enrollment.completedAt?.toISOString() || null,
          expiresAt: enrollment.expiresAt?.toISOString() || null,
          currentModuleId: enrollment.currentModuleId,
          currentModuleName,
          currentTopicId: enrollment.currentTopicId,
          currentTopicName,
          completionPercentage: enrollment.completionPercentage || 0,
          isAtRisk: enrollment.isAtRisk || false,
          atRiskSince: enrollment.atRiskSince?.toISOString() || null,
          paymentId: enrollment.paymentId,
          paymentAmount: enrollment.paymentAmount,
          paymentType: enrollment.paymentType,
          topicsCompleted: Number(topicsCompletedResult[0]?.count || 0),
          totalTopics: enrollment.totalTopics,
        };
      })
    );

    return {
      success: true,
      data: enrollmentData,
      total,
      page,
      pageSize,
    };
  } catch (error) {
    console.error('List enrollments error:', error);
    return { success: false, error: 'Failed to list enrollments' };
  }
}

export async function getEnrollmentAction(
  enrollmentId: string
): Promise<ActionResult<Enrollment>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const enrollment = await db
      .select({
        id: studentEnrollments.id,
        userId: studentEnrollments.user_id,
        courseId: studentEnrollments.course_id,
        status: studentEnrollments.status,
        enrolledAt: studentEnrollments.enrolled_at,
        completedAt: studentEnrollments.completed_at,
        expiresAt: studentEnrollments.expires_at,
        currentModuleId: studentEnrollments.current_module_id,
        currentTopicId: studentEnrollments.current_topic_id,
        completionPercentage: studentEnrollments.completion_percentage,
        isAtRisk: studentEnrollments.is_at_risk,
        atRiskSince: studentEnrollments.at_risk_since,
        paymentId: studentEnrollments.payment_id,
        paymentAmount: studentEnrollments.payment_amount,
        paymentType: studentEnrollments.payment_type,
        userFirstName: userProfiles.firstName,
        userLastName: userProfiles.lastName,
        userEmail: userProfiles.email,
        courseTitle: courses.title,
        courseSlug: courses.slug,
        totalTopics: courses.total_topics,
      })
      .from(studentEnrollments)
      .innerJoin(userProfiles, eq(studentEnrollments.user_id, userProfiles.id))
      .innerJoin(courses, eq(studentEnrollments.course_id, courses.id))
      .where(eq(studentEnrollments.id, enrollmentId))
      .limit(1);

    if (!enrollment[0]) {
      return { success: false, error: 'Enrollment not found' };
    }

    const e = enrollment[0];

    // Check permission - users can view their own enrollments
    if (e.userId !== context.userId) {
      const { allowed } = await checkPermission(context.userId, 'academy:read');
      if (!allowed) {
        return { success: false, error: 'Permission denied' };
      }
    }

    // Get current module/topic names and completion count
    let currentModuleName: string | null = null;
    if (e.currentModuleId) {
      const module = await db.query.courseModules.findFirst({
        where: eq(courseModules.id, e.currentModuleId),
        columns: { title: true },
      });
      currentModuleName = module?.title || null;
    }

    let currentTopicName: string | null = null;
    if (e.currentTopicId) {
      const topic = await db.query.moduleTopics.findFirst({
        where: eq(moduleTopics.id, e.currentTopicId),
        columns: { title: true },
      });
      currentTopicName = topic?.title || null;
    }

    const topicsCompletedResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(topicCompletions)
      .where(eq(topicCompletions.enrollment_id, e.id));

    return {
      success: true,
      data: {
        id: e.id,
        userId: e.userId,
        userName: `${e.userFirstName || ''} ${e.userLastName || ''}`.trim() || null,
        userEmail: e.userEmail,
        courseId: e.courseId,
        courseTitle: e.courseTitle,
        courseSlug: e.courseSlug,
        status: e.status,
        enrolledAt: e.enrolledAt.toISOString(),
        completedAt: e.completedAt?.toISOString() || null,
        expiresAt: e.expiresAt?.toISOString() || null,
        currentModuleId: e.currentModuleId,
        currentModuleName,
        currentTopicId: e.currentTopicId,
        currentTopicName,
        completionPercentage: e.completionPercentage || 0,
        isAtRisk: e.isAtRisk || false,
        atRiskSince: e.atRiskSince?.toISOString() || null,
        paymentId: e.paymentId,
        paymentAmount: e.paymentAmount,
        paymentType: e.paymentType,
        topicsCompleted: Number(topicsCompletedResult[0]?.count || 0),
        totalTopics: e.totalTopics,
      },
    };
  } catch (error) {
    console.error('Get enrollment error:', error);
    return { success: false, error: 'Failed to get enrollment' };
  }
}

export async function getMyEnrollmentsAction(): Promise<ActionResult<EnrollmentSummary[]>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const enrollments = await db
      .select({
        id: studentEnrollments.id,
        courseId: studentEnrollments.course_id,
        status: studentEnrollments.status,
        enrolledAt: studentEnrollments.enrolled_at,
        completionPercentage: studentEnrollments.completion_percentage,
        isAtRisk: studentEnrollments.is_at_risk,
        courseTitle: courses.title,
        courseSlug: courses.slug,
      })
      .from(studentEnrollments)
      .innerJoin(courses, eq(studentEnrollments.course_id, courses.id))
      .where(eq(studentEnrollments.user_id, context.userId))
      .orderBy(desc(studentEnrollments.enrolled_at));

    return {
      success: true,
      data: enrollments.map(e => ({
        id: e.id,
        courseId: e.courseId,
        courseTitle: e.courseTitle,
        courseSlug: e.courseSlug,
        status: e.status,
        enrolledAt: e.enrolledAt.toISOString(),
        completionPercentage: e.completionPercentage || 0,
        isAtRisk: e.isAtRisk || false,
      })),
    };
  } catch (error) {
    console.error('Get my enrollments error:', error);
    return { success: false, error: 'Failed to get enrollments' };
  }
}

const createEnrollmentSchema = z.object({
  userId: z.string().uuid(),
  courseId: z.string().uuid(),
  paymentType: z.enum(['subscription', 'one_time', 'free', 'scholarship']).default('free'),
  paymentId: z.string().optional(),
  paymentAmount: z.number().optional(),
  expiresAt: z.string().optional(),
});

export async function createEnrollmentAction(
  input: z.infer<typeof createEnrollmentSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const validated = createEnrollmentSchema.parse(input);

    // Users can enroll themselves; admins can enroll anyone
    if (validated.userId !== context.userId) {
      const { allowed } = await checkPermission(context.userId, 'academy:admin');
      if (!allowed) {
        return { success: false, error: 'Permission denied' };
      }
    }

    // Check course exists and is published
    const course = await db.query.courses.findFirst({
      where: and(
        eq(courses.id, validated.courseId),
        eq(courses.is_published, true),
        isNull(courses.deleted_at)
      ),
    });

    if (!course) {
      return { success: false, error: 'Course not found or not available' };
    }

    // Check for existing active enrollment
    const existing = await db.query.studentEnrollments.findFirst({
      where: and(
        eq(studentEnrollments.user_id, validated.userId),
        eq(studentEnrollments.course_id, validated.courseId),
        or(
          eq(studentEnrollments.status, 'pending'),
          eq(studentEnrollments.status, 'active')
        )
      ),
    });

    if (existing) {
      return { success: false, error: 'User already enrolled in this course' };
    }

    // Get first module and topic
    const firstModule = await db.query.courseModules.findFirst({
      where: eq(courseModules.course_id, validated.courseId),
      orderBy: [asc(courseModules.module_number)],
    });

    let firstTopicId: string | null = null;
    if (firstModule) {
      const firstTopic = await db.query.moduleTopics.findFirst({
        where: eq(moduleTopics.module_id, firstModule.id),
        orderBy: [asc(moduleTopics.topic_number)],
      });
      firstTopicId = firstTopic?.id || null;
    }

    const [enrollment] = await db.insert(studentEnrollments).values({
      user_id: validated.userId,
      course_id: validated.courseId,
      status: 'active',
      current_module_id: firstModule?.id || null,
      current_topic_id: firstTopicId,
      completion_percentage: 0,
      payment_type: validated.paymentType,
      payment_id: validated.paymentId,
      payment_amount: validated.paymentAmount,
      expires_at: validated.expiresAt ? new Date(validated.expiresAt) : null,
    }).returning({ id: studentEnrollments.id });

    await logAuditEvent(
      context.userId,
      context.orgId,
      'academy.enrollment.created',
      'student_enrollments',
      enrollment.id,
      { userId: validated.userId, courseId: validated.courseId, paymentType: validated.paymentType }
    );

    return { success: true, data: { id: enrollment.id } };
  } catch (error) {
    console.error('Create enrollment error:', error);
    return { success: false, error: 'Failed to create enrollment' };
  }
}

export async function enrollSelfAction(
  courseId: string,
  paymentType: 'subscription' | 'one_time' | 'free' | 'scholarship' = 'free'
): Promise<ActionResult<{ id: string }>> {
  const context = await getCurrentUserContext();
  if (!context) {
    return { success: false, error: 'Unauthorized' };
  }

  return createEnrollmentAction({
    userId: context.userId,
    courseId,
    paymentType,
  });
}

const updateEnrollmentStatusSchema = z.object({
  enrollmentId: z.string().uuid(),
  status: z.enum(['pending', 'active', 'completed', 'dropped', 'expired']),
});

export async function updateEnrollmentStatusAction(
  input: z.infer<typeof updateEnrollmentStatusSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const { allowed } = await checkPermission(context.userId, 'academy:admin');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    const validated = updateEnrollmentStatusSchema.parse(input);

    const updateObj: Record<string, unknown> = {
      status: validated.status,
      updated_at: new Date(),
    };

    if (validated.status === 'completed') {
      updateObj.completed_at = new Date();
      updateObj.completion_percentage = 100;
    }

    await db.update(studentEnrollments)
      .set(updateObj)
      .where(eq(studentEnrollments.id, validated.enrollmentId));

    await logAuditEvent(
      context.userId,
      context.orgId,
      'academy.enrollment.status_updated',
      'student_enrollments',
      validated.enrollmentId,
      { status: validated.status }
    );

    return { success: true, data: { id: validated.enrollmentId } };
  } catch (error) {
    console.error('Update enrollment status error:', error);
    return { success: false, error: 'Failed to update enrollment status' };
  }
}

export async function dropEnrollmentAction(
  enrollmentId: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get enrollment
    const enrollment = await db.query.studentEnrollments.findFirst({
      where: eq(studentEnrollments.id, enrollmentId),
    });

    if (!enrollment) {
      return { success: false, error: 'Enrollment not found' };
    }

    // Users can drop their own enrollment; admins can drop anyone's
    if (enrollment.user_id !== context.userId) {
      const { allowed } = await checkPermission(context.userId, 'academy:admin');
      if (!allowed) {
        return { success: false, error: 'Permission denied' };
      }
    }

    await db.update(studentEnrollments)
      .set({
        status: 'dropped',
        updated_at: new Date(),
      })
      .where(eq(studentEnrollments.id, enrollmentId));

    await logAuditEvent(
      context.userId,
      context.orgId,
      'academy.enrollment.dropped',
      'student_enrollments',
      enrollmentId,
      { userId: enrollment.user_id },
      'warning'
    );

    return { success: true, data: { id: enrollmentId } };
  } catch (error) {
    console.error('Drop enrollment error:', error);
    return { success: false, error: 'Failed to drop enrollment' };
  }
}

// =====================================================
// At-Risk Management Actions
// =====================================================

export async function markAtRiskAction(
  enrollmentId: string,
  reasons: string[]
): Promise<ActionResult<{ id: string }>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const { allowed } = await checkPermission(context.userId, 'academy:admin');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    await db.update(studentEnrollments)
      .set({
        is_at_risk: true,
        at_risk_since: new Date(),
        updated_at: new Date(),
      })
      .where(eq(studentEnrollments.id, enrollmentId));

    await logAuditEvent(
      context.userId,
      context.orgId,
      'academy.enrollment.marked_at_risk',
      'student_enrollments',
      enrollmentId,
      { reasons },
      'warning'
    );

    return { success: true, data: { id: enrollmentId } };
  } catch (error) {
    console.error('Mark at risk error:', error);
    return { success: false, error: 'Failed to mark as at risk' };
  }
}

export async function clearAtRiskAction(
  enrollmentId: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const { allowed } = await checkPermission(context.userId, 'academy:admin');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    await db.update(studentEnrollments)
      .set({
        is_at_risk: false,
        at_risk_since: null,
        updated_at: new Date(),
      })
      .where(eq(studentEnrollments.id, enrollmentId));

    await logAuditEvent(
      context.userId,
      context.orgId,
      'academy.enrollment.cleared_at_risk',
      'student_enrollments',
      enrollmentId,
      {}
    );

    return { success: true, data: { id: enrollmentId } };
  } catch (error) {
    console.error('Clear at risk error:', error);
    return { success: false, error: 'Failed to clear at risk status' };
  }
}

export async function getAtRiskEnrollmentsAction(): Promise<ActionResult<Enrollment[]>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const { allowed } = await checkPermission(context.userId, 'academy:admin');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    const result = await listEnrollmentsAction({
      isAtRisk: true,
      status: 'active',
      sortBy: 'enrolledAt',
      sortOrder: 'asc',
      pageSize: 100,
    });

    return { success: result.success, data: result.data, error: result.error };
  } catch (error) {
    console.error('Get at risk enrollments error:', error);
    return { success: false, error: 'Failed to get at risk enrollments' };
  }
}

// =====================================================
// Intervention Actions
// =====================================================

const createInterventionSchema = z.object({
  enrollmentId: z.string().uuid(),
  studentId: z.string().uuid(),
  riskReasons: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export async function createInterventionAction(
  input: z.infer<typeof createInterventionSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const { allowed } = await checkPermission(context.userId, 'academy:admin');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    const validated = createInterventionSchema.parse(input);

    const [intervention] = await db.insert(studentInterventions).values({
      enrollment_id: validated.enrollmentId,
      student_id: validated.studentId,
      trainer_id: context.userId,
      risk_reasons: validated.riskReasons,
      notes: validated.notes,
      status: 'pending',
    }).returning({ id: studentInterventions.id });

    await logAuditEvent(
      context.userId,
      context.orgId,
      'academy.intervention.created',
      'student_interventions',
      intervention.id,
      { enrollmentId: validated.enrollmentId, studentId: validated.studentId }
    );

    return { success: true, data: { id: intervention.id } };
  } catch (error) {
    console.error('Create intervention error:', error);
    return { success: false, error: 'Failed to create intervention' };
  }
}

export async function listInterventionsAction(
  enrollmentId?: string,
  status?: 'pending' | 'in_progress' | 'completed' | 'ineffective'
): Promise<ActionResult<StudentIntervention[]>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const { allowed } = await checkPermission(context.userId, 'academy:read');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    const conditions = [];
    if (enrollmentId) {
      conditions.push(eq(studentInterventions.enrollment_id, enrollmentId));
    }
    if (status) {
      conditions.push(eq(studentInterventions.status, status));
    }

    const interventions = await db.query.studentInterventions.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(studentInterventions.created_at)],
    });

    // Enrich with names
    const interventionData: StudentIntervention[] = await Promise.all(
      interventions.map(async (intervention) => {
        const student = await db.query.userProfiles.findFirst({
          where: eq(userProfiles.id, intervention.student_id),
          columns: { firstName: true, lastName: true },
        });

        const trainer = await db.query.userProfiles.findFirst({
          where: eq(userProfiles.id, intervention.trainer_id),
          columns: { firstName: true, lastName: true },
        });

        return {
          id: intervention.id,
          enrollmentId: intervention.enrollment_id,
          studentId: intervention.student_id,
          studentName: student ? `${student.firstName || ''} ${student.lastName || ''}`.trim() : null,
          trainerId: intervention.trainer_id,
          trainerName: trainer ? `${trainer.firstName || ''} ${trainer.lastName || ''}`.trim() : null,
          riskReasons: intervention.risk_reasons,
          notes: intervention.notes,
          status: intervention.status,
          createdAt: intervention.created_at.toISOString(),
          contactedAt: intervention.contacted_at?.toISOString() || null,
          resolvedAt: intervention.resolved_at?.toISOString() || null,
        };
      })
    );

    return { success: true, data: interventionData };
  } catch (error) {
    console.error('List interventions error:', error);
    return { success: false, error: 'Failed to list interventions' };
  }
}

const updateInterventionSchema = z.object({
  interventionId: z.string().uuid(),
  status: z.enum(['pending', 'in_progress', 'completed', 'ineffective']).optional(),
  notes: z.string().optional(),
  contactedAt: z.string().optional(),
});

export async function updateInterventionAction(
  input: z.infer<typeof updateInterventionSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const { allowed } = await checkPermission(context.userId, 'academy:admin');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    const validated = updateInterventionSchema.parse(input);
    const { interventionId, ...updates } = validated;

    const updateObj: Record<string, unknown> = { updated_at: new Date() };

    if (updates.status !== undefined) {
      updateObj.status = updates.status;
      if (updates.status === 'completed' || updates.status === 'ineffective') {
        updateObj.resolved_at = new Date();
      }
    }
    if (updates.notes !== undefined) updateObj.notes = updates.notes;
    if (updates.contactedAt !== undefined) updateObj.contacted_at = new Date(updates.contactedAt);

    await db.update(studentInterventions)
      .set(updateObj)
      .where(eq(studentInterventions.id, interventionId));

    await logAuditEvent(
      context.userId,
      context.orgId,
      'academy.intervention.updated',
      'student_interventions',
      interventionId,
      { updates }
    );

    return { success: true, data: { id: interventionId } };
  } catch (error) {
    console.error('Update intervention error:', error);
    return { success: false, error: 'Failed to update intervention' };
  }
}

// =====================================================
// Dashboard & Analytics Actions
// =====================================================

export interface EnrollmentDashboardMetrics {
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  droppedEnrollments: number;
  atRiskCount: number;
  averageCompletionRate: number;
  enrollmentsThisMonth: number;
  completionsThisMonth: number;
}

export async function getEnrollmentDashboardMetricsAction(): Promise<ActionResult<EnrollmentDashboardMetrics>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const { allowed } = await checkPermission(context.userId, 'academy:admin');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const stats = await db
      .select({
        totalEnrollments: sql<number>`count(*)`,
        activeEnrollments: sql<number>`count(*) filter (where status = 'active')`,
        completedEnrollments: sql<number>`count(*) filter (where status = 'completed')`,
        droppedEnrollments: sql<number>`count(*) filter (where status = 'dropped')`,
        atRiskCount: sql<number>`count(*) filter (where is_at_risk = true and status = 'active')`,
        averageCompletionRate: sql<number>`avg(completion_percentage)`,
        enrollmentsThisMonth: sql<number>`count(*) filter (where enrolled_at >= ${startOfMonth})`,
        completionsThisMonth: sql<number>`count(*) filter (where completed_at >= ${startOfMonth})`,
      })
      .from(studentEnrollments);

    return {
      success: true,
      data: {
        totalEnrollments: Number(stats[0]?.totalEnrollments || 0),
        activeEnrollments: Number(stats[0]?.activeEnrollments || 0),
        completedEnrollments: Number(stats[0]?.completedEnrollments || 0),
        droppedEnrollments: Number(stats[0]?.droppedEnrollments || 0),
        atRiskCount: Number(stats[0]?.atRiskCount || 0),
        averageCompletionRate: Math.round(Number(stats[0]?.averageCompletionRate || 0)),
        enrollmentsThisMonth: Number(stats[0]?.enrollmentsThisMonth || 0),
        completionsThisMonth: Number(stats[0]?.completionsThisMonth || 0),
      },
    };
  } catch (error) {
    console.error('Get enrollment dashboard metrics error:', error);
    return { success: false, error: 'Failed to get dashboard metrics' };
  }
}

export interface CourseEnrollmentStats {
  courseId: string;
  courseTitle: string;
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  averageCompletion: number;
  atRiskCount: number;
}

export async function getCourseEnrollmentStatsAction(): Promise<ActionResult<CourseEnrollmentStats[]>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const { allowed } = await checkPermission(context.userId, 'academy:admin');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    const stats = await db
      .select({
        courseId: studentEnrollments.course_id,
        courseTitle: courses.title,
        totalEnrollments: sql<number>`count(*)`,
        activeEnrollments: sql<number>`count(*) filter (where ${studentEnrollments.status} = 'active')`,
        completedEnrollments: sql<number>`count(*) filter (where ${studentEnrollments.status} = 'completed')`,
        averageCompletion: sql<number>`avg(${studentEnrollments.completion_percentage})`,
        atRiskCount: sql<number>`count(*) filter (where ${studentEnrollments.is_at_risk} = true)`,
      })
      .from(studentEnrollments)
      .innerJoin(courses, eq(studentEnrollments.course_id, courses.id))
      .groupBy(studentEnrollments.course_id, courses.title)
      .orderBy(desc(sql`count(*)`));

    return {
      success: true,
      data: stats.map(s => ({
        courseId: s.courseId,
        courseTitle: s.courseTitle,
        totalEnrollments: Number(s.totalEnrollments),
        activeEnrollments: Number(s.activeEnrollments),
        completedEnrollments: Number(s.completedEnrollments),
        averageCompletion: Math.round(Number(s.averageCompletion || 0)),
        atRiskCount: Number(s.atRiskCount),
      })),
    };
  } catch (error) {
    console.error('Get course enrollment stats error:', error);
    return { success: false, error: 'Failed to get course stats' };
  }
}
