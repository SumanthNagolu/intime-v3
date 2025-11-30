/**
 * Courses Management tRPC Router
 * Story: ACAD-005
 *
 * Endpoints for:
 * - Course CRUD operations (admin)
 * - Module management
 * - Topic management
 * - Publishing workflow
 */

import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '@/lib/trpc/trpc';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

interface ModuleRow {
  id: string;
  topics?: TopicRow[];
}

interface TopicRow {
  id: string;
  [key: string]: unknown;
}

export const coursesRouter = router({
  /**
   * Public: List published courses
   */
  listPublished: publicProcedure.query(async () => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('is_published', true)
      .is('deleted_at', null)
      .order('title');

    if (error) {
      throw new Error(`Failed to fetch courses: ${error.message}`);
    }

    return data || [];
  }),

  /**
   * Public: Get course by slug
   */
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('slug', input.slug)
        .eq('is_published', true)
        .is('deleted_at', null)
        .single();

      if (error) {
        throw new Error(`Course not found: ${error.message}`);
      }

      return data;
    }),

  /**
   * Admin: List all courses (including drafts)
   */
  listAll: protectedProcedure.query(async () => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch courses: ${error.message}`);
    }

    return data || [];
  }),

  /**
   * Admin: Get course by ID (with modules)
   */
  getById: protectedProcedure
    .input(z.object({ courseId: z.string().uuid() }))
    .query(async ({ input }) => {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('courses')
        .select(
          `
          *,
          modules:course_modules(
            *,
            topics:module_topics(*)
          )
        `
        )
        .eq('id', input.courseId)
        .single();

      if (error) {
        throw new Error(`Course not found: ${error.message}`);
      }

      return data;
    }),

  /**
   * Admin: Create course
   */
  createCourse: protectedProcedure
    .input(
      z.object({
        slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
        title: z.string().min(1),
        subtitle: z.string().optional(),
        description: z.string().min(1),
        estimated_duration_weeks: z.number().int().positive(),
        skill_level: z.enum(['beginner', 'intermediate', 'advanced']),
        price_monthly: z.number().positive().optional(),
        price_one_time: z.number().positive().optional(),
        thumbnail_url: z.string().url().optional(),
        promo_video_url: z.string().url().optional(),
        is_included_in_all_access: z.boolean().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const supabase = createAdminClient();

      const { data, error } = await supabase
        .from('courses')
        .insert({
          ...input,
          created_by: ctx.userId,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create course: ${error.message}`);
      }

      return data;
    }),

  /**
   * Admin: Update course
   */
  updateCourse: protectedProcedure
    .input(
      z.object({
        courseId: z.string().uuid(),
        slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
        title: z.string().min(1).optional(),
        subtitle: z.string().optional().nullable(),
        description: z.string().min(1).optional(),
        estimated_duration_weeks: z.number().int().positive().optional(),
        skill_level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
        price_monthly: z.number().positive().optional().nullable(),
        price_one_time: z.number().positive().optional().nullable(),
        thumbnail_url: z.string().url().optional().nullable(),
        promo_video_url: z.string().url().optional().nullable(),
        is_published: z.boolean().optional(),
        is_featured: z.boolean().optional(),
        is_included_in_all_access: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = createAdminClient();
      const { courseId, ...updateData } = input;

      const { data, error } = await supabase
        .from('courses')
        .update(updateData)
        .eq('id', courseId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update course: ${error.message}`);
      }

      return data;
    }),

  /**
   * Admin: Publish/unpublish course
   */
  togglePublish: protectedProcedure
    .input(
      z.object({
        courseId: z.string().uuid(),
        isPublished: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = createAdminClient();

      // Validate course has content before publishing
      if (input.isPublished) {
        const { data: course } = await supabase
          .from('courses')
          .select('total_modules, total_topics')
          .eq('id', input.courseId)
          .single();

        if (!course || course.total_modules === 0 || course.total_topics === 0) {
          throw new Error('Cannot publish course without modules and topics');
        }
      }

      const { data, error } = await supabase
        .from('courses')
        .update({ is_published: input.isPublished })
        .eq('id', input.courseId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to toggle publish: ${error.message}`);
      }

      return data;
    }),

  /**
   * Admin: Soft delete course
   */
  deleteCourse: protectedProcedure
    .input(z.object({ courseId: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const supabase = createAdminClient();

      const { error } = await supabase
        .from('courses')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', input.courseId);

      if (error) {
        throw new Error(`Failed to delete course: ${error.message}`);
      }

      return { success: true };
    }),

  /**
   * Admin: Duplicate course
   */
  duplicateCourse: protectedProcedure
    .input(z.object({ courseId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const supabase = createAdminClient();

      // Get original course
      const { data: original, error: fetchError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', input.courseId)
        .single();

      if (fetchError || !original) {
        throw new Error('Course not found');
      }

      // Create duplicate
      const { id: _id, created_at: _created_at, updated_at: _updated_at, deleted_at: _deleted_at, ...courseData } = original;
      const { data: duplicate, error: createError } = await supabase
        .from('courses')
        .insert({
          ...courseData,
          slug: `${courseData.slug}-copy`,
          title: `${courseData.title} (Copy)`,
          is_published: false,
          created_by: ctx.userId,
        })
        .select()
        .single();

      if (createError) {
        throw new Error(`Failed to duplicate course: ${createError.message}`);
      }

      return duplicate;
    }),

  // ========================================
  // Module Management
  // ========================================

  /**
   * Admin: Create module
   */
  createModule: protectedProcedure
    .input(
      z.object({
        courseId: z.string().uuid(),
        slug: z.string().regex(/^[a-z0-9-]+$/),
        title: z.string().min(1),
        description: z.string().optional(),
        moduleNumber: z.number().int().positive(),
        estimatedDurationHours: z.number().positive().optional(),
        prerequisiteModuleIds: z.array(z.string().uuid()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = createAdminClient();

      const { data, error } = await supabase
        .from('course_modules')
        .insert({
          course_id: input.courseId,
          slug: input.slug,
          title: input.title,
          description: input.description,
          module_number: input.moduleNumber,
          estimated_duration_hours: input.estimatedDurationHours,
          prerequisite_module_ids: input.prerequisiteModuleIds,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create module: ${error.message}`);
      }

      return data;
    }),

  /**
   * Admin: Update module
   */
  updateModule: protectedProcedure
    .input(
      z.object({
        moduleId: z.string().uuid(),
        slug: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional().nullable(),
        moduleNumber: z.number().int().positive().optional(),
        estimatedDurationHours: z.number().positive().optional().nullable(),
        prerequisiteModuleIds: z.array(z.string().uuid()).optional().nullable(),
        isPublished: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = createAdminClient();
      const { moduleId, ...updateData } = input;

      const { data, error } = await supabase
        .from('course_modules')
        .update({
          slug: updateData.slug,
          title: updateData.title,
          description: updateData.description,
          module_number: updateData.moduleNumber,
          estimated_duration_hours: updateData.estimatedDurationHours,
          prerequisite_module_ids: updateData.prerequisiteModuleIds,
          is_published: updateData.isPublished,
        })
        .eq('id', moduleId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update module: ${error.message}`);
      }

      return data;
    }),

  /**
   * Admin: Delete module
   */
  deleteModule: protectedProcedure
    .input(z.object({ moduleId: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const supabase = createAdminClient();

      const { error } = await supabase.from('course_modules').delete().eq('id', input.moduleId);

      if (error) {
        throw new Error(`Failed to delete module: ${error.message}`);
      }

      return { success: true };
    }),

  /**
   * Admin: Reorder modules
   */
  reorderModules: protectedProcedure
    .input(
      z.object({
        courseId: z.string().uuid(),
        moduleIds: z.array(z.string().uuid()),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = createAdminClient();

      // Update module numbers based on array order
      const updates = input.moduleIds.map(async (moduleId, index) => {
        return supabase
          .from('course_modules')
          .update({ module_number: index + 1 })
          .eq('id', moduleId)
          .eq('course_id', input.courseId);
      });

      await Promise.all(updates);

      return { success: true };
    }),

  // ========================================
  // Topic Management
  // ========================================

  /**
   * Admin: Create topic
   */
  createTopic: protectedProcedure
    .input(
      z.object({
        moduleId: z.string().uuid(),
        slug: z.string().regex(/^[a-z0-9-]+$/),
        title: z.string().min(1),
        description: z.string().optional(),
        topicNumber: z.number().int().positive(),
        contentType: z.enum(['video', 'reading', 'quiz', 'lab', 'project']),
        estimatedDurationMinutes: z.number().positive().optional(),
        prerequisiteTopicIds: z.array(z.string().uuid()).optional(),
        isRequired: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = createAdminClient();

      const { data, error } = await supabase
        .from('module_topics')
        .insert({
          module_id: input.moduleId,
          slug: input.slug,
          title: input.title,
          description: input.description,
          topic_number: input.topicNumber,
          content_type: input.contentType,
          estimated_duration_minutes: input.estimatedDurationMinutes,
          prerequisite_topic_ids: input.prerequisiteTopicIds,
          is_required: input.isRequired,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create topic: ${error.message}`);
      }

      return data;
    }),

  /**
   * Admin: Update topic
   */
  updateTopic: protectedProcedure
    .input(
      z.object({
        topicId: z.string().uuid(),
        slug: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional().nullable(),
        topicNumber: z.number().int().positive().optional(),
        contentType: z.enum(['video', 'reading', 'quiz', 'lab', 'project']).optional(),
        estimatedDurationMinutes: z.number().positive().optional().nullable(),
        prerequisiteTopicIds: z.array(z.string().uuid()).optional().nullable(),
        isRequired: z.boolean().optional(),
        isPublished: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = createAdminClient();
      const { topicId, ...updateData } = input;

      const { data, error } = await supabase
        .from('module_topics')
        .update({
          slug: updateData.slug,
          title: updateData.title,
          description: updateData.description,
          topic_number: updateData.topicNumber,
          content_type: updateData.contentType,
          estimated_duration_minutes: updateData.estimatedDurationMinutes,
          prerequisite_topic_ids: updateData.prerequisiteTopicIds,
          is_required: updateData.isRequired,
          is_published: updateData.isPublished,
        })
        .eq('id', topicId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update topic: ${error.message}`);
      }

      return data;
    }),

  /**
   * Admin: Delete topic
   */
  deleteTopic: protectedProcedure
    .input(z.object({ topicId: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const supabase = createAdminClient();

      const { error } = await supabase.from('module_topics').delete().eq('id', input.topicId);

      if (error) {
        throw new Error(`Failed to delete topic: ${error.message}`);
      }

      return { success: true };
    }),

  /**
   * Admin: Reorder topics
   */
  reorderTopics: protectedProcedure
    .input(
      z.object({
        moduleId: z.string().uuid(),
        topicIds: z.array(z.string().uuid()),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = createAdminClient();

      const updates = input.topicIds.map(async (topicId, index) => {
        return supabase
          .from('module_topics')
          .update({ topic_number: index + 1 })
          .eq('id', topicId)
          .eq('module_id', input.moduleId);
      });

      await Promise.all(updates);

      return { success: true };
    }),

  // ========================================
  // Student Navigation (ACAD-021)
  // ========================================

  /**
   * Get course structure with student progress
   * Used for navigation sidebar, breadcrumbs, next/prev buttons
   */
  getCourseWithProgress: protectedProcedure
    .input(
      z.object({
        courseId: z.string().uuid(),
        enrollmentId: z.string().uuid().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const supabase = await createClient();

      // Get course with modules and topics
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select(
          `
          *,
          modules:course_modules(
            *,
            topics:module_topics(*)
          )
        `
        )
        .eq('id', input.courseId)
        .order('module_number', { foreignTable: 'course_modules', ascending: true })
        .order('topic_number', { foreignTable: 'course_modules.module_topics', ascending: true })
        .single();

      if (courseError || !course) {
        throw new Error(`Course not found: ${courseError?.message}`);
      }

      // Get user's enrollment
      const { data: enrollment } = await supabase
        .from('student_enrollments')
        .select('*')
        .eq('user_id', ctx.userId)
        .eq('course_id', input.courseId)
        .maybeSingle();

      const enrollmentId = input.enrollmentId || enrollment?.id;

      // Get completed topics
      const { data: completions } = await supabase
        .from('topic_completions')
        .select('topic_id, completed_at, xp_earned, time_spent_seconds')
        .eq('user_id', ctx.userId)
        .eq('enrollment_id', enrollmentId || '');

      const completedTopicIds = new Set(completions?.map((c) => c.topic_id) || []);

      // Check unlock status for each topic
      const modulesWithProgress = await Promise.all(
        (course.modules || []).map(async (module: unknown) => {
          const mod = module as ModuleRow;
          const topicsWithProgress = await Promise.all(
            (mod.topics || []).map(async (topic: unknown) => {
              const top = topic as TopicRow;
              const isCompleted = completedTopicIds.has(top.id);

              // Check if topic is unlocked
              const { data: isUnlocked } = await supabase.rpc('is_topic_unlocked', {
                p_user_id: ctx.userId,
                p_topic_id: top.id,
              });

              const completion = completions?.find((c) => c.topic_id === top.id);

              return {
                ...top,
                is_completed: isCompleted,
                is_unlocked: isUnlocked || false,
                completion_data: completion
                  ? {
                    completed_at: completion.completed_at,
                    xp_earned: completion.xp_earned,
                    time_spent_seconds: completion.time_spent_seconds,
                  }
                  : null,
              };
            })
          );

          // Calculate module progress
          const totalTopics = topicsWithProgress.length;
          const completedTopics = topicsWithProgress.filter((t) => t.is_completed).length;
          const moduleProgress = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

          return {
            ...mod,
            topics: topicsWithProgress,
            progress_percentage: Math.round(moduleProgress),
            completed_topics: completedTopics,
            total_topics: totalTopics,
          };
        })
      );

      return {
        ...course,
        modules: modulesWithProgress,
        enrollment: enrollment || null,
      };
    }),

  /**
   * Get next and previous topics for navigation
   */
  getAdjacentTopics: protectedProcedure
    .input(
      z.object({
        courseId: z.string().uuid(),
        currentTopicId: z.string().uuid(),
      })
    )
    .query(async ({ input, ctx }) => {
      const supabase = await createClient();

      // Get all topics for the course in order
      const { data: modules } = await supabase
        .from('course_modules')
        .select('id, module_number, topics:module_topics(*)')
        .eq('course_id', input.courseId)
        .order('module_number', { ascending: true })
        .order('topic_number', { foreignTable: 'module_topics', ascending: true });

      if (!modules) {
        return { previous: null, next: null };
      }

      // Flatten topics array
      const allTopics: (TopicRow & { module_id: string })[] = [];
      modules.forEach((module: unknown) => {
        const mod = module as ModuleRow;
        (mod.topics || []).forEach((topic: unknown) => {
          const top = topic as TopicRow;
          allTopics.push({ ...top, module_id: mod.id });
        });
      });

      // Find current topic index
      const currentIndex = allTopics.findIndex((t) => t.id === input.currentTopicId);
      if (currentIndex === -1) {
        return { previous: null, next: null };
      }

      const previousTopic = currentIndex > 0 ? allTopics[currentIndex - 1] : null;
      const nextTopic = currentIndex < allTopics.length - 1 ? allTopics[currentIndex + 1] : null;

      // Check unlock status
      if (nextTopic) {
        const { data: isUnlocked } = await supabase.rpc('is_topic_unlocked', {
          p_user_id: ctx.userId,
          p_topic_id: nextTopic.id,
        });
        nextTopic.is_unlocked = isUnlocked || false;
      }

      if (previousTopic) {
        previousTopic.is_unlocked = true; // Previous topics are always accessible
      }

      return {
        previous: previousTopic,
        next: nextTopic,
      };
    }),

  /**
   * Get topic details with lessons
   */
  getTopicWithLessons: protectedProcedure
    .input(
      z.object({
        topicId: z.string().uuid(),
      })
    )
    .query(async ({ input, ctx }) => {
      const supabase = await createClient();

      // Get topic
      const { data: topic, error: topicError } = await supabase
        .from('module_topics')
        .select(`
          *,
          module:course_modules(
            id,
            title,
            slug,
            course:courses(
              id,
              title,
              slug
            )
          )
        `)
        .eq('id', input.topicId)
        .single();

      if (topicError || !topic) {
        throw new Error(`Topic not found: ${topicError?.message}`);
      }

      // Get lessons
      const { data: lessons, error: lessonsError } = await supabase
        .from('topic_lessons')
        .select('*')
        .eq('topic_id', input.topicId)
        .order('lesson_number', { ascending: true });

      if (lessonsError) {
        throw new Error(`Failed to fetch lessons: ${lessonsError.message}`);
      }

      // Check if topic is unlocked
      const { data: isUnlocked } = await supabase.rpc('is_topic_unlocked', {
        p_user_id: ctx.userId,
        p_topic_id: input.topicId,
      });

      // Check completion status (if topic is marked complete)
      const { data: completion } = await supabase
        .from('topic_completions')
        .select('*')
        .eq('user_id', ctx.userId)
        .eq('topic_id', input.topicId)
        .maybeSingle();

      return {
        ...topic,
        lessons: lessons || [],
        is_unlocked: isUnlocked || false,
        is_completed: !!completion,
        completion_data: completion,
      };
    }),
});
