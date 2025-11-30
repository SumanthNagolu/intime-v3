'use server';

/**
 * Academy Courses Server Actions
 * Handles course management, modules, topics, and lessons
 */

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import {
  courses,
  courseModules,
  moduleTopics,
  topicLessons,
} from '@/lib/db/schema/academy';
import { userProfiles } from '@/lib/db/schema/user-profiles';
import { eq, and, or, ilike, desc, asc, sql, isNull, inArray } from 'drizzle-orm';

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

export interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string;
  totalModules: number;
  totalTopics: number;
  estimatedDurationWeeks: number;
  priceMonthly: number | null;
  priceOneTime: number | null;
  isIncludedInAllAccess: boolean;
  prerequisiteCourseIds: string[] | null;
  skillLevel: string;
  thumbnailUrl: string | null;
  promoVideoUrl: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  createdBy: string | null;
  createdByName: string | null;
  createdAt: string;
  updatedAt: string;
  enrollmentCount?: number;
  completionRate?: number;
}

export interface CourseModule {
  id: string;
  courseId: string;
  slug: string;
  title: string;
  description: string | null;
  moduleNumber: number;
  estimatedDurationHours: number | null;
  prerequisiteModuleIds: string[] | null;
  isPublished: boolean;
  topicCount: number;
  createdAt: string;
}

export interface ModuleTopic {
  id: string;
  moduleId: string;
  slug: string;
  title: string;
  description: string | null;
  topicNumber: number;
  estimatedDurationMinutes: number | null;
  contentType: string;
  prerequisiteTopicIds: string[] | null;
  isPublished: boolean;
  isRequired: boolean;
  lessonCount: number;
  createdAt: string;
}

export interface TopicLesson {
  id: string;
  topicId: string;
  title: string;
  lessonNumber: number;
  contentType: string;
  contentUrl: string | null;
  contentMarkdown: string | null;
  durationSeconds: number | null;
  labEnvironmentTemplate: string | null;
  labInstructionsUrl: string | null;
  createdAt: string;
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

  await (supabase.from as any)('audit_logs').insert({
    user_id: userId,
    org_id: orgId,
    action,
    table_name: resourceType,
    record_id: resourceId,
    metadata: details,
    severity,
    user_ip_address: null,
    user_agent: null,
  });
}

// =====================================================
// Course Actions
// =====================================================

const listCoursesSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  includeDeleted: z.boolean().default(false),
  sortBy: z.enum(['createdAt', 'title', 'enrollmentCount', 'skillLevel']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export async function listCoursesAction(
  input: z.infer<typeof listCoursesSchema>
): Promise<PaginatedResult<Course>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const { allowed } = await checkPermission(context.userId, 'academy:read');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    const validated = listCoursesSchema.parse(input);
    const { page, pageSize, search, skillLevel, isPublished, isFeatured, includeDeleted, sortBy, sortOrder } = validated;
    const offset = (page - 1) * pageSize;

    // Build conditions
    const conditions = [];

    if (!includeDeleted) {
      conditions.push(isNull(courses.deleted_at));
    }

    if (search) {
      conditions.push(
        or(
          ilike(courses.title, `%${search}%`),
          ilike(courses.description, `%${search}%`)
        )
      );
    }

    if (skillLevel) {
      conditions.push(eq(courses.skill_level, skillLevel));
    }

    if (isPublished !== undefined) {
      conditions.push(eq(courses.is_published, isPublished));
    }

    if (isFeatured !== undefined) {
      conditions.push(eq(courses.is_featured, isFeatured));
    }

    // Build query
    let query = db
      .select()
      .from(courses)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    // Apply sorting
    const orderFn = sortOrder === 'asc' ? asc : desc;
    switch (sortBy) {
      case 'title':
        query = query.orderBy(orderFn(courses.title)) as typeof query;
        break;
      case 'skillLevel':
        query = query.orderBy(orderFn(courses.skill_level)) as typeof query;
        break;
      case 'createdAt':
      default:
        query = query.orderBy(orderFn(courses.created_at)) as typeof query;
        break;
    }

    const courseResults = await query.limit(pageSize).offset(offset);

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(courses)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = Number(countResult[0]?.count || 0);

    // Enrich with creator names
    const courseData: Course[] = await Promise.all(
      courseResults.map(async (course) => {
        let createdByName: string | null = null;
        if (course.created_by) {
          const creator = await db.query.userProfiles.findFirst({
            where: eq(userProfiles.id, course.created_by),
            columns: { firstName: true, lastName: true },
          });
          createdByName = creator ? `${creator.firstName || ''} ${creator.lastName || ''}`.trim() : null;
        }

        return {
          id: course.id,
          slug: course.slug,
          title: course.title,
          subtitle: course.subtitle,
          description: course.description,
          totalModules: course.total_modules,
          totalTopics: course.total_topics,
          estimatedDurationWeeks: course.estimated_duration_weeks,
          priceMonthly: course.price_monthly,
          priceOneTime: course.price_one_time,
          isIncludedInAllAccess: course.is_included_in_all_access,
          prerequisiteCourseIds: course.prerequisite_course_ids,
          skillLevel: course.skill_level,
          thumbnailUrl: course.thumbnail_url,
          promoVideoUrl: course.promo_video_url,
          isPublished: course.is_published,
          isFeatured: course.is_featured,
          createdBy: course.created_by,
          createdByName,
          createdAt: course.created_at.toISOString(),
          updatedAt: course.updated_at.toISOString(),
        };
      })
    );

    return {
      success: true,
      data: courseData,
      total,
      page,
      pageSize,
    };
  } catch (error) {
    console.error('List courses error:', error);
    return { success: false, error: 'Failed to list courses' };
  }
}

export async function getCourseAction(
  courseId: string
): Promise<ActionResult<Course & { modules: CourseModule[] }>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const { allowed } = await checkPermission(context.userId, 'academy:read');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    const course = await db.query.courses.findFirst({
      where: and(
        eq(courses.id, courseId),
        isNull(courses.deleted_at)
      ),
    });

    if (!course) {
      return { success: false, error: 'Course not found' };
    }

    // Get creator name
    let createdByName: string | null = null;
    if (course.created_by) {
      const creator = await db.query.userProfiles.findFirst({
        where: eq(userProfiles.id, course.created_by),
        columns: { firstName: true, lastName: true },
      });
      createdByName = creator ? `${creator.firstName || ''} ${creator.lastName || ''}`.trim() : null;
    }

    // Get modules
    const modules = await db.query.courseModules.findMany({
      where: eq(courseModules.course_id, courseId),
      orderBy: [asc(courseModules.module_number)],
    });

    // Get topic counts per module
    const modulesWithCounts: CourseModule[] = await Promise.all(
      modules.map(async (module) => {
        const topicCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(moduleTopics)
          .where(eq(moduleTopics.module_id, module.id));

        return {
          id: module.id,
          courseId: module.course_id,
          slug: module.slug,
          title: module.title,
          description: module.description,
          moduleNumber: module.module_number,
          estimatedDurationHours: module.estimated_duration_hours,
          prerequisiteModuleIds: module.prerequisite_module_ids,
          isPublished: module.is_published,
          topicCount: Number(topicCount[0]?.count || 0),
          createdAt: module.created_at.toISOString(),
        };
      })
    );

    return {
      success: true,
      data: {
        id: course.id,
        slug: course.slug,
        title: course.title,
        subtitle: course.subtitle,
        description: course.description,
        totalModules: course.total_modules,
        totalTopics: course.total_topics,
        estimatedDurationWeeks: course.estimated_duration_weeks,
        priceMonthly: course.price_monthly,
        priceOneTime: course.price_one_time,
        isIncludedInAllAccess: course.is_included_in_all_access,
        prerequisiteCourseIds: course.prerequisite_course_ids,
        skillLevel: course.skill_level,
        thumbnailUrl: course.thumbnail_url,
        promoVideoUrl: course.promo_video_url,
        isPublished: course.is_published,
        isFeatured: course.is_featured,
        createdBy: course.created_by,
        createdByName,
        createdAt: course.created_at.toISOString(),
        updatedAt: course.updated_at.toISOString(),
        modules: modulesWithCounts,
      },
    };
  } catch (error) {
    console.error('Get course error:', error);
    return { success: false, error: 'Failed to get course' };
  }
}

export async function getCourseBySlugAction(
  slug: string
): Promise<ActionResult<Course & { modules: CourseModule[] }>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const course = await db.query.courses.findFirst({
      where: and(
        eq(courses.slug, slug),
        isNull(courses.deleted_at)
      ),
    });

    if (!course) {
      return { success: false, error: 'Course not found' };
    }

    // For public courses, allow read without permission check
    if (!course.is_published) {
      const { allowed } = await checkPermission(context.userId, 'academy:admin');
      if (!allowed) {
        return { success: false, error: 'Course not available' };
      }
    }

    return getCourseAction(course.id);
  } catch (error) {
    console.error('Get course by slug error:', error);
    return { success: false, error: 'Failed to get course' };
  }
}

const createCourseSchema = z.object({
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(200),
  subtitle: z.string().max(300).optional(),
  description: z.string().min(1),
  estimatedDurationWeeks: z.number().min(1).default(1),
  priceMonthly: z.number().optional(),
  priceOneTime: z.number().optional(),
  isIncludedInAllAccess: z.boolean().default(true),
  prerequisiteCourseIds: z.array(z.string().uuid()).optional(),
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  thumbnailUrl: z.string().url().optional(),
  promoVideoUrl: z.string().url().optional(),
});

export async function createCourseAction(
  input: z.infer<typeof createCourseSchema>
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

    const validated = createCourseSchema.parse(input);

    // Check slug uniqueness
    const existing = await db.query.courses.findFirst({
      where: eq(courses.slug, validated.slug),
    });

    if (existing) {
      return { success: false, error: 'Course slug already exists' };
    }

    const [course] = await db.insert(courses).values({
      slug: validated.slug,
      title: validated.title,
      subtitle: validated.subtitle,
      description: validated.description,
      estimated_duration_weeks: validated.estimatedDurationWeeks,
      price_monthly: validated.priceMonthly,
      price_one_time: validated.priceOneTime,
      is_included_in_all_access: validated.isIncludedInAllAccess,
      prerequisite_course_ids: validated.prerequisiteCourseIds,
      skill_level: validated.skillLevel,
      thumbnail_url: validated.thumbnailUrl,
      promo_video_url: validated.promoVideoUrl,
      is_published: false,
      is_featured: false,
      created_by: context.userId,
    }).returning({ id: courses.id });

    await logAuditEvent(
      context.userId,
      context.orgId,
      'academy.course.created',
      'courses',
      course.id,
      { title: validated.title, slug: validated.slug }
    );

    return { success: true, data: { id: course.id } };
  } catch (error) {
    console.error('Create course error:', error);
    return { success: false, error: 'Failed to create course' };
  }
}

const updateCourseSchema = z.object({
  courseId: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
  subtitle: z.string().max(300).optional().nullable(),
  description: z.string().min(1).optional(),
  estimatedDurationWeeks: z.number().min(1).optional(),
  priceMonthly: z.number().optional().nullable(),
  priceOneTime: z.number().optional().nullable(),
  isIncludedInAllAccess: z.boolean().optional(),
  prerequisiteCourseIds: z.array(z.string().uuid()).optional().nullable(),
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  thumbnailUrl: z.string().url().optional().nullable(),
  promoVideoUrl: z.string().url().optional().nullable(),
});

export async function updateCourseAction(
  input: z.infer<typeof updateCourseSchema>
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

    const validated = updateCourseSchema.parse(input);
    const { courseId, ...updates } = validated;

    // Build update object
    const updateObj: Record<string, unknown> = { updated_at: new Date() };

    if (updates.title !== undefined) updateObj.title = updates.title;
    if (updates.subtitle !== undefined) updateObj.subtitle = updates.subtitle;
    if (updates.description !== undefined) updateObj.description = updates.description;
    if (updates.estimatedDurationWeeks !== undefined) updateObj.estimated_duration_weeks = updates.estimatedDurationWeeks;
    if (updates.priceMonthly !== undefined) updateObj.price_monthly = updates.priceMonthly;
    if (updates.priceOneTime !== undefined) updateObj.price_one_time = updates.priceOneTime;
    if (updates.isIncludedInAllAccess !== undefined) updateObj.is_included_in_all_access = updates.isIncludedInAllAccess;
    if (updates.prerequisiteCourseIds !== undefined) updateObj.prerequisite_course_ids = updates.prerequisiteCourseIds;
    if (updates.skillLevel !== undefined) updateObj.skill_level = updates.skillLevel;
    if (updates.thumbnailUrl !== undefined) updateObj.thumbnail_url = updates.thumbnailUrl;
    if (updates.promoVideoUrl !== undefined) updateObj.promo_video_url = updates.promoVideoUrl;

    await db.update(courses)
      .set(updateObj)
      .where(eq(courses.id, courseId));

    await logAuditEvent(
      context.userId,
      context.orgId,
      'academy.course.updated',
      'courses',
      courseId,
      { updates }
    );

    return { success: true, data: { id: courseId } };
  } catch (error) {
    console.error('Update course error:', error);
    return { success: false, error: 'Failed to update course' };
  }
}

export async function publishCourseAction(
  courseId: string
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

    // Verify course has content
    const course = await db.query.courses.findFirst({
      where: eq(courses.id, courseId),
    });

    if (!course) {
      return { success: false, error: 'Course not found' };
    }

    if (course.total_modules === 0) {
      return { success: false, error: 'Course must have at least one module before publishing' };
    }

    await db.update(courses)
      .set({ is_published: true, updated_at: new Date() })
      .where(eq(courses.id, courseId));

    await logAuditEvent(
      context.userId,
      context.orgId,
      'academy.course.published',
      'courses',
      courseId,
      { title: course.title }
    );

    return { success: true, data: { id: courseId } };
  } catch (error) {
    console.error('Publish course error:', error);
    return { success: false, error: 'Failed to publish course' };
  }
}

export async function unpublishCourseAction(
  courseId: string
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

    await db.update(courses)
      .set({ is_published: false, updated_at: new Date() })
      .where(eq(courses.id, courseId));

    await logAuditEvent(
      context.userId,
      context.orgId,
      'academy.course.unpublished',
      'courses',
      courseId,
      {},
      'warning'
    );

    return { success: true, data: { id: courseId } };
  } catch (error) {
    console.error('Unpublish course error:', error);
    return { success: false, error: 'Failed to unpublish course' };
  }
}

export async function featureCourseAction(
  courseId: string,
  isFeatured: boolean
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

    await db.update(courses)
      .set({ is_featured: isFeatured, updated_at: new Date() })
      .where(eq(courses.id, courseId));

    await logAuditEvent(
      context.userId,
      context.orgId,
      isFeatured ? 'academy.course.featured' : 'academy.course.unfeatured',
      'courses',
      courseId,
      {}
    );

    return { success: true, data: { id: courseId } };
  } catch (error) {
    console.error('Feature course error:', error);
    return { success: false, error: 'Failed to update featured status' };
  }
}

export async function deleteCourseAction(
  courseId: string
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

    // Soft delete
    await db.update(courses)
      .set({ deleted_at: new Date(), is_published: false, updated_at: new Date() })
      .where(eq(courses.id, courseId));

    await logAuditEvent(
      context.userId,
      context.orgId,
      'academy.course.deleted',
      'courses',
      courseId,
      {},
      'warning'
    );

    return { success: true, data: { id: courseId } };
  } catch (error) {
    console.error('Delete course error:', error);
    return { success: false, error: 'Failed to delete course' };
  }
}

// =====================================================
// Module Actions
// =====================================================

export async function getModuleAction(
  moduleId: string
): Promise<ActionResult<CourseModule & { topics: ModuleTopic[] }>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const { allowed } = await checkPermission(context.userId, 'academy:read');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    const module = await db.query.courseModules.findFirst({
      where: eq(courseModules.id, moduleId),
    });

    if (!module) {
      return { success: false, error: 'Module not found' };
    }

    // Get topics
    const topics = await db.query.moduleTopics.findMany({
      where: eq(moduleTopics.module_id, moduleId),
      orderBy: [asc(moduleTopics.topic_number)],
    });

    // Get lesson counts per topic
    const topicsWithCounts: ModuleTopic[] = await Promise.all(
      topics.map(async (topic) => {
        const lessonCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(topicLessons)
          .where(eq(topicLessons.topic_id, topic.id));

        return {
          id: topic.id,
          moduleId: topic.module_id,
          slug: topic.slug,
          title: topic.title,
          description: topic.description,
          topicNumber: topic.topic_number,
          estimatedDurationMinutes: topic.estimated_duration_minutes,
          contentType: topic.content_type,
          prerequisiteTopicIds: topic.prerequisite_topic_ids,
          isPublished: topic.is_published,
          isRequired: topic.is_required,
          lessonCount: Number(lessonCount[0]?.count || 0),
          createdAt: topic.created_at.toISOString(),
        };
      })
    );

    return {
      success: true,
      data: {
        id: module.id,
        courseId: module.course_id,
        slug: module.slug,
        title: module.title,
        description: module.description,
        moduleNumber: module.module_number,
        estimatedDurationHours: module.estimated_duration_hours,
        prerequisiteModuleIds: module.prerequisite_module_ids,
        isPublished: module.is_published,
        topicCount: topicsWithCounts.length,
        createdAt: module.created_at.toISOString(),
        topics: topicsWithCounts,
      },
    };
  } catch (error) {
    console.error('Get module error:', error);
    return { success: false, error: 'Failed to get module' };
  }
}

const createModuleSchema = z.object({
  courseId: z.string().uuid(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  moduleNumber: z.number().min(1),
  estimatedDurationHours: z.number().optional(),
  prerequisiteModuleIds: z.array(z.string().uuid()).optional(),
});

export async function createModuleAction(
  input: z.infer<typeof createModuleSchema>
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

    const validated = createModuleSchema.parse(input);

    const [module] = await db.insert(courseModules).values({
      course_id: validated.courseId,
      slug: validated.slug,
      title: validated.title,
      description: validated.description,
      module_number: validated.moduleNumber,
      estimated_duration_hours: validated.estimatedDurationHours,
      prerequisite_module_ids: validated.prerequisiteModuleIds,
      is_published: false,
    }).returning({ id: courseModules.id });

    // Update course module count
    await db.update(courses)
      .set({
        total_modules: sql`total_modules + 1`,
        updated_at: new Date(),
      })
      .where(eq(courses.id, validated.courseId));

    await logAuditEvent(
      context.userId,
      context.orgId,
      'academy.module.created',
      'course_modules',
      module.id,
      { title: validated.title, courseId: validated.courseId }
    );

    return { success: true, data: { id: module.id } };
  } catch (error) {
    console.error('Create module error:', error);
    return { success: false, error: 'Failed to create module' };
  }
}

const updateModuleSchema = z.object({
  moduleId: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional().nullable(),
  moduleNumber: z.number().min(1).optional(),
  estimatedDurationHours: z.number().optional().nullable(),
  prerequisiteModuleIds: z.array(z.string().uuid()).optional().nullable(),
  isPublished: z.boolean().optional(),
});

export async function updateModuleAction(
  input: z.infer<typeof updateModuleSchema>
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

    const validated = updateModuleSchema.parse(input);
    const { moduleId, ...updates } = validated;

    const updateObj: Record<string, unknown> = { updated_at: new Date() };

    if (updates.title !== undefined) updateObj.title = updates.title;
    if (updates.description !== undefined) updateObj.description = updates.description;
    if (updates.moduleNumber !== undefined) updateObj.module_number = updates.moduleNumber;
    if (updates.estimatedDurationHours !== undefined) updateObj.estimated_duration_hours = updates.estimatedDurationHours;
    if (updates.prerequisiteModuleIds !== undefined) updateObj.prerequisite_module_ids = updates.prerequisiteModuleIds;
    if (updates.isPublished !== undefined) updateObj.is_published = updates.isPublished;

    await db.update(courseModules)
      .set(updateObj)
      .where(eq(courseModules.id, moduleId));

    await logAuditEvent(
      context.userId,
      context.orgId,
      'academy.module.updated',
      'course_modules',
      moduleId,
      { updates }
    );

    return { success: true, data: { id: moduleId } };
  } catch (error) {
    console.error('Update module error:', error);
    return { success: false, error: 'Failed to update module' };
  }
}

export async function deleteModuleAction(
  moduleId: string
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

    // Get module to find course
    const module = await db.query.courseModules.findFirst({
      where: eq(courseModules.id, moduleId),
    });

    if (!module) {
      return { success: false, error: 'Module not found' };
    }

    // Delete module (cascades to topics and lessons)
    await db.delete(courseModules).where(eq(courseModules.id, moduleId));

    // Update course counts
    await db.update(courses)
      .set({
        total_modules: sql`total_modules - 1`,
        updated_at: new Date(),
      })
      .where(eq(courses.id, module.course_id));

    await logAuditEvent(
      context.userId,
      context.orgId,
      'academy.module.deleted',
      'course_modules',
      moduleId,
      { courseId: module.course_id },
      'warning'
    );

    return { success: true, data: { id: moduleId } };
  } catch (error) {
    console.error('Delete module error:', error);
    return { success: false, error: 'Failed to delete module' };
  }
}

// =====================================================
// Topic Actions
// =====================================================

export async function getTopicAction(
  topicId: string
): Promise<ActionResult<ModuleTopic & { lessons: TopicLesson[] }>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const { allowed } = await checkPermission(context.userId, 'academy:read');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    const topic = await db.query.moduleTopics.findFirst({
      where: eq(moduleTopics.id, topicId),
    });

    if (!topic) {
      return { success: false, error: 'Topic not found' };
    }

    // Get lessons
    const lessons = await db.query.topicLessons.findMany({
      where: eq(topicLessons.topic_id, topicId),
      orderBy: [asc(topicLessons.lesson_number)],
    });

    const lessonData: TopicLesson[] = lessons.map(lesson => ({
      id: lesson.id,
      topicId: lesson.topic_id,
      title: lesson.title,
      lessonNumber: lesson.lesson_number,
      contentType: lesson.content_type,
      contentUrl: lesson.content_url,
      contentMarkdown: lesson.content_markdown,
      durationSeconds: lesson.duration_seconds,
      labEnvironmentTemplate: lesson.lab_environment_template,
      labInstructionsUrl: lesson.lab_instructions_url,
      createdAt: lesson.created_at.toISOString(),
    }));

    return {
      success: true,
      data: {
        id: topic.id,
        moduleId: topic.module_id,
        slug: topic.slug,
        title: topic.title,
        description: topic.description,
        topicNumber: topic.topic_number,
        estimatedDurationMinutes: topic.estimated_duration_minutes,
        contentType: topic.content_type,
        prerequisiteTopicIds: topic.prerequisite_topic_ids,
        isPublished: topic.is_published,
        isRequired: topic.is_required,
        lessonCount: lessonData.length,
        createdAt: topic.created_at.toISOString(),
        lessons: lessonData,
      },
    };
  } catch (error) {
    console.error('Get topic error:', error);
    return { success: false, error: 'Failed to get topic' };
  }
}

const createTopicSchema = z.object({
  moduleId: z.string().uuid(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  topicNumber: z.number().min(1),
  estimatedDurationMinutes: z.number().optional(),
  contentType: z.enum(['video', 'reading', 'quiz', 'lab', 'project']).default('reading'),
  prerequisiteTopicIds: z.array(z.string().uuid()).optional(),
  isRequired: z.boolean().default(true),
});

export async function createTopicAction(
  input: z.infer<typeof createTopicSchema>
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

    const validated = createTopicSchema.parse(input);

    // Get module to find course
    const module = await db.query.courseModules.findFirst({
      where: eq(courseModules.id, validated.moduleId),
    });

    if (!module) {
      return { success: false, error: 'Module not found' };
    }

    const [topic] = await db.insert(moduleTopics).values({
      module_id: validated.moduleId,
      slug: validated.slug,
      title: validated.title,
      description: validated.description,
      topic_number: validated.topicNumber,
      estimated_duration_minutes: validated.estimatedDurationMinutes,
      content_type: validated.contentType,
      prerequisite_topic_ids: validated.prerequisiteTopicIds,
      is_required: validated.isRequired,
      is_published: false,
    }).returning({ id: moduleTopics.id });

    // Update course topic count
    await db.update(courses)
      .set({
        total_topics: sql`total_topics + 1`,
        updated_at: new Date(),
      })
      .where(eq(courses.id, module.course_id));

    await logAuditEvent(
      context.userId,
      context.orgId,
      'academy.topic.created',
      'module_topics',
      topic.id,
      { title: validated.title, moduleId: validated.moduleId }
    );

    return { success: true, data: { id: topic.id } };
  } catch (error) {
    console.error('Create topic error:', error);
    return { success: false, error: 'Failed to create topic' };
  }
}

const updateTopicSchema = z.object({
  topicId: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional().nullable(),
  topicNumber: z.number().min(1).optional(),
  estimatedDurationMinutes: z.number().optional().nullable(),
  contentType: z.enum(['video', 'reading', 'quiz', 'lab', 'project']).optional(),
  prerequisiteTopicIds: z.array(z.string().uuid()).optional().nullable(),
  isRequired: z.boolean().optional(),
  isPublished: z.boolean().optional(),
});

export async function updateTopicAction(
  input: z.infer<typeof updateTopicSchema>
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

    const validated = updateTopicSchema.parse(input);
    const { topicId, ...updates } = validated;

    const updateObj: Record<string, unknown> = { updated_at: new Date() };

    if (updates.title !== undefined) updateObj.title = updates.title;
    if (updates.description !== undefined) updateObj.description = updates.description;
    if (updates.topicNumber !== undefined) updateObj.topic_number = updates.topicNumber;
    if (updates.estimatedDurationMinutes !== undefined) updateObj.estimated_duration_minutes = updates.estimatedDurationMinutes;
    if (updates.contentType !== undefined) updateObj.content_type = updates.contentType;
    if (updates.prerequisiteTopicIds !== undefined) updateObj.prerequisite_topic_ids = updates.prerequisiteTopicIds;
    if (updates.isRequired !== undefined) updateObj.is_required = updates.isRequired;
    if (updates.isPublished !== undefined) updateObj.is_published = updates.isPublished;

    await db.update(moduleTopics)
      .set(updateObj)
      .where(eq(moduleTopics.id, topicId));

    await logAuditEvent(
      context.userId,
      context.orgId,
      'academy.topic.updated',
      'module_topics',
      topicId,
      { updates }
    );

    return { success: true, data: { id: topicId } };
  } catch (error) {
    console.error('Update topic error:', error);
    return { success: false, error: 'Failed to update topic' };
  }
}

// =====================================================
// Lesson Actions
// =====================================================

const createLessonSchema = z.object({
  topicId: z.string().uuid(),
  title: z.string().min(1).max(200),
  lessonNumber: z.number().min(1),
  contentType: z.enum(['video', 'markdown', 'pdf', 'quiz', 'lab', 'external_link']).default('markdown'),
  contentUrl: z.string().url().optional(),
  contentMarkdown: z.string().optional(),
  durationSeconds: z.number().optional(),
  labEnvironmentTemplate: z.string().optional(),
  labInstructionsUrl: z.string().url().optional(),
});

export async function createLessonAction(
  input: z.infer<typeof createLessonSchema>
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

    const validated = createLessonSchema.parse(input);

    const [lesson] = await db.insert(topicLessons).values({
      topic_id: validated.topicId,
      title: validated.title,
      lesson_number: validated.lessonNumber,
      content_type: validated.contentType,
      content_url: validated.contentUrl,
      content_markdown: validated.contentMarkdown,
      duration_seconds: validated.durationSeconds,
      lab_environment_template: validated.labEnvironmentTemplate,
      lab_instructions_url: validated.labInstructionsUrl,
    }).returning({ id: topicLessons.id });

    await logAuditEvent(
      context.userId,
      context.orgId,
      'academy.lesson.created',
      'topic_lessons',
      lesson.id,
      { title: validated.title, topicId: validated.topicId }
    );

    return { success: true, data: { id: lesson.id } };
  } catch (error) {
    console.error('Create lesson error:', error);
    return { success: false, error: 'Failed to create lesson' };
  }
}

const updateLessonSchema = z.object({
  lessonId: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
  lessonNumber: z.number().min(1).optional(),
  contentType: z.enum(['video', 'markdown', 'pdf', 'quiz', 'lab', 'external_link']).optional(),
  contentUrl: z.string().url().optional().nullable(),
  contentMarkdown: z.string().optional().nullable(),
  durationSeconds: z.number().optional().nullable(),
  labEnvironmentTemplate: z.string().optional().nullable(),
  labInstructionsUrl: z.string().url().optional().nullable(),
});

export async function updateLessonAction(
  input: z.infer<typeof updateLessonSchema>
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

    const validated = updateLessonSchema.parse(input);
    const { lessonId, ...updates } = validated;

    const updateObj: Record<string, unknown> = { updated_at: new Date() };

    if (updates.title !== undefined) updateObj.title = updates.title;
    if (updates.lessonNumber !== undefined) updateObj.lesson_number = updates.lessonNumber;
    if (updates.contentType !== undefined) updateObj.content_type = updates.contentType;
    if (updates.contentUrl !== undefined) updateObj.content_url = updates.contentUrl;
    if (updates.contentMarkdown !== undefined) updateObj.content_markdown = updates.contentMarkdown;
    if (updates.durationSeconds !== undefined) updateObj.duration_seconds = updates.durationSeconds;
    if (updates.labEnvironmentTemplate !== undefined) updateObj.lab_environment_template = updates.labEnvironmentTemplate;
    if (updates.labInstructionsUrl !== undefined) updateObj.lab_instructions_url = updates.labInstructionsUrl;

    await db.update(topicLessons)
      .set(updateObj)
      .where(eq(topicLessons.id, lessonId));

    await logAuditEvent(
      context.userId,
      context.orgId,
      'academy.lesson.updated',
      'topic_lessons',
      lessonId,
      { updates }
    );

    return { success: true, data: { id: lessonId } };
  } catch (error) {
    console.error('Update lesson error:', error);
    return { success: false, error: 'Failed to update lesson' };
  }
}

export async function deleteLessonAction(
  lessonId: string
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

    await db.delete(topicLessons).where(eq(topicLessons.id, lessonId));

    await logAuditEvent(
      context.userId,
      context.orgId,
      'academy.lesson.deleted',
      'topic_lessons',
      lessonId,
      {},
      'warning'
    );

    return { success: true, data: { id: lessonId } };
  } catch (error) {
    console.error('Delete lesson error:', error);
    return { success: false, error: 'Failed to delete lesson' };
  }
}

// =====================================================
// Public Course Actions (for catalog)
// =====================================================

export async function getPublishedCoursesAction(): Promise<ActionResult<Course[]>> {
  try {
    const publishedCourses = await db.query.courses.findMany({
      where: and(
        eq(courses.is_published, true),
        isNull(courses.deleted_at)
      ),
      orderBy: [desc(courses.is_featured), desc(courses.created_at)],
    });

    const courseData: Course[] = publishedCourses.map(course => ({
      id: course.id,
      slug: course.slug,
      title: course.title,
      subtitle: course.subtitle,
      description: course.description,
      totalModules: course.total_modules,
      totalTopics: course.total_topics,
      estimatedDurationWeeks: course.estimated_duration_weeks,
      priceMonthly: course.price_monthly,
      priceOneTime: course.price_one_time,
      isIncludedInAllAccess: course.is_included_in_all_access,
      prerequisiteCourseIds: course.prerequisite_course_ids,
      skillLevel: course.skill_level,
      thumbnailUrl: course.thumbnail_url,
      promoVideoUrl: course.promo_video_url,
      isPublished: course.is_published,
      isFeatured: course.is_featured,
      createdBy: course.created_by,
      createdByName: null,
      createdAt: course.created_at.toISOString(),
      updatedAt: course.updated_at.toISOString(),
    }));

    return { success: true, data: courseData };
  } catch (error) {
    console.error('Get published courses error:', error);
    return { success: false, error: 'Failed to get courses' };
  }
}

export async function getFeaturedCoursesAction(): Promise<ActionResult<Course[]>> {
  try {
    const featuredCourses = await db.query.courses.findMany({
      where: and(
        eq(courses.is_published, true),
        eq(courses.is_featured, true),
        isNull(courses.deleted_at)
      ),
      orderBy: [desc(courses.created_at)],
      limit: 6,
    });

    const courseData: Course[] = featuredCourses.map(course => ({
      id: course.id,
      slug: course.slug,
      title: course.title,
      subtitle: course.subtitle,
      description: course.description,
      totalModules: course.total_modules,
      totalTopics: course.total_topics,
      estimatedDurationWeeks: course.estimated_duration_weeks,
      priceMonthly: course.price_monthly,
      priceOneTime: course.price_one_time,
      isIncludedInAllAccess: course.is_included_in_all_access,
      prerequisiteCourseIds: course.prerequisite_course_ids,
      skillLevel: course.skill_level,
      thumbnailUrl: course.thumbnail_url,
      promoVideoUrl: course.promo_video_url,
      isPublished: course.is_published,
      isFeatured: course.is_featured,
      createdBy: course.created_by,
      createdByName: null,
      createdAt: course.created_at.toISOString(),
      updatedAt: course.updated_at.toISOString(),
    }));

    return { success: true, data: courseData };
  } catch (error) {
    console.error('Get featured courses error:', error);
    return { success: false, error: 'Failed to get featured courses' };
  }
}
