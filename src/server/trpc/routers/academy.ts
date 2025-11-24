/**
 * Academy UI tRPC Router
 * Transforms database schema to Academy UI types
 *
 * Maps:
 * - Course → Academy Module
 * - ModuleTopic → Academy Lesson
 * - Adds progress tracking and employability scores
 */

import { z } from 'zod';
import { router, protectedProcedure } from '@/lib/trpc/trpc';
import { createClient } from '@/lib/supabase/server';
import type { AcademyModule, AcademyLesson } from '@/types/academy';

export const academyRouter = router({
  /**
   * Get all modules with lessons for the student dashboard
   * Transforms database structure to Academy UI format
   */
  getModulesWithProgress: protectedProcedure
    .input(
      z.object({
        courseSlug: z.string().default('guidewire-policycenter-introduction'),
      })
    )
    .query(async ({ ctx, input }) => {
      const supabase = await createClient();

      // Get course with modules and topics
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          modules:course_modules(
            id,
            title,
            description,
            module_number,
            topics:module_topics(
              id,
              title,
              description,
              topic_number,
              content_type,
              estimated_duration_minutes
            )
          )
        `)
        .eq('slug', input.courseSlug)
        .eq('is_published', true)
        .single();

      if (courseError || !course) {
        // Return empty array if course not found
        return [];
      }

      // Get student's enrollment
      const { data: enrollment } = await supabase
        .from('student_enrollments')
        .select('id')
        .eq('user_id', ctx.userId)
        .eq('course_id', course.id)
        .maybeSingle();

      // Get completed topics
      const { data: completions } = await supabase
        .from('topic_completions')
        .select('topic_id')
        .eq('user_id', ctx.userId);

      const completedTopicIds = new Set(completions?.map(c => c.topic_id) || []);

      // Transform to Academy UI format
      const academyModules: AcademyModule[] = await Promise.all(
        (course.modules || []).map(async (module: any, idx: number) => {
          const lessons: AcademyLesson[] = await Promise.all(
            (module.topics || []).map(async (topic: any, topicIdx: number) => {
              const isCompleted = completedTopicIds.has(topic.id);

              // Check if unlocked
              const { data: isUnlocked } = await supabase.rpc('is_topic_unlocked', {
                p_user_id: ctx.userId,
                p_topic_id: topic.id,
              });

              // Determine status
              let status: 'completed' | 'current' | 'locked';
              if (isCompleted) {
                status = 'completed';
              } else if (isUnlocked) {
                status = topicIdx === 0 ? 'current' : 'locked'; // First unlocked is current
              } else {
                status = 'locked';
              }

              // Map content type to lesson type
              const lessonType = topic.content_type === 'lab' ? 'lab' : topic.content_type === 'quiz' ? 'quiz' : 'standard';

              return {
                id: topic.id,
                title: topic.title,
                description: topic.description || undefined,
                status,
                duration: `${topic.estimated_duration_minutes || 45} min`,
                type: lessonType,
                // Mock content structure - will be populated from lesson details
                content: {
                  theory: {
                    slides: [topic.title],
                    duration: "20 min"
                  },
                  demo: {
                    videoUrl: "",
                    duration: "15 min"
                  },
                  quiz: {
                    questions: [],
                    passingScore: 80
                  },
                  lab: {
                    title: topic.title,
                    instructions: topic.description || "Complete this lab exercise.",
                    userStoryId: `US-${module.module_number}${topic.topic_number}`
                  }
                }
              };
            })
          );

          // Calculate module progress
          const totalLessons = lessons.length;
          const completedLessons = lessons.filter(l => l.status === 'completed').length;
          const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

          return {
            id: module.module_number,
            title: module.title,
            description: module.description || undefined,
            progress,
            week: `Week ${module.module_number}`,
            lessons
          };
        })
      );

      return academyModules;
    }),

  /**
   * Get lesson details with full content
   */
  getLessonDetails: protectedProcedure
    .input(
      z.object({
        topicId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const supabase = await createClient();

      // Get topic with lessons
      const { data: topic, error } = await supabase
        .from('module_topics')
        .select(`
          *,
          module:course_modules(
            id,
            title,
            module_number
          ),
          lessons:topic_lessons(*)
        `)
        .eq('id', input.topicId)
        .single();

      if (error || !topic) {
        throw new Error('Lesson not found');
      }

      // Get completion status
      const { data: completion } = await supabase
        .from('topic_completions')
        .select('*')
        .eq('user_id', ctx.userId)
        .eq('topic_id', input.topicId)
        .maybeSingle();

      // Transform lessons to content stages
      const lessons = topic.lessons || [];
      const theoryLessons = lessons.filter((l: any) => l.content_type === 'markdown' || l.content_type === 'video');
      const labLessons = lessons.filter((l: any) => l.content_type === 'lab');

      return {
        id: topic.id,
        title: topic.title,
        description: topic.description,
        status: completion ? 'completed' : 'current',
        duration: `${topic.estimated_duration_minutes || 60} min`,
        type: topic.content_type === 'lab' ? 'lab' : topic.content_type === 'quiz' ? 'quiz' : 'standard',
        content: {
          theory: {
            slides: theoryLessons.map((l: any) => ({
              title: l.title,
              bullets: l.content_markdown ? l.content_markdown.split('\n').filter((line: string) => line.startsWith('-')).map((line: string) => line.substring(2)) : [],
              context: "Real-world implementation context for this concept."
            })),
            duration: "25 min"
          },
          demo: {
            videoUrl: theoryLessons.find((l: any) => l.content_url)?.content_url || "",
            duration: "30 min",
            transcript: "This demo shows the practical implementation of the concepts."
          },
          quiz: {
            questions: [],
            passingScore: 80
          },
          lab: {
            title: labLessons[0]?.title || topic.title,
            instructions: labLessons[0]?.content_markdown || topic.description || "Complete this lab exercise.",
            codeSnippet: labLessons[0]?.lab_environment_template || "// Your code here",
            userStoryId: `US-${(topic.module as any)?.module_number || '1'}${topic.topic_number}`
          }
        }
      };
    }),

  /**
   * Calculate employability metrics
   */
  getEmployabilityMetrics: protectedProcedure
    .input(
      z.object({
        courseSlug: z.string().default('guidewire-policycenter-introduction'),
      })
    )
    .query(async ({ ctx, input }) => {
      const supabase = await createClient();

      // Get course
      const { data: course } = await supabase
        .from('courses')
        .select('id')
        .eq('slug', input.courseSlug)
        .single();

      if (!course) {
        return {
          techScore: 0,
          portfolioScore: 0,
          commScore: 0,
          overall: 0
        };
      }

      // Get progress metrics
      const { data: metrics } = await supabase
        .from('student_enrollments')
        .select('completion_percentage')
        .eq('user_id', ctx.userId)
        .eq('course_id', course.id)
        .maybeSingle();

      const completionPercentage = metrics?.completion_percentage || 0;

      // Get completions by type
      const { data: completions } = await supabase
        .from('topic_completions')
        .select(`
          topic:module_topics(content_type)
        `)
        .eq('user_id', ctx.userId);

      const labsCompleted = completions?.filter((c: any) => c.topic?.content_type === 'lab').length || 0;
      const quizzesCompleted = completions?.filter((c: any) => c.topic?.content_type === 'quiz').length || 0;
      const totalCompleted = completions?.length || 0;

      // Calculate scores
      const techScore = Math.round(completionPercentage);
      const portfolioScore = labsCompleted > 0 ? Math.min(100, labsCompleted * 20) : 0;
      const commScore = quizzesCompleted > 0 ? Math.min(100, quizzesCompleted * 15) : 0;
      const overall = Math.round((techScore + portfolioScore + commScore) / 3);

      return {
        techScore,
        portfolioScore,
        commScore,
        overall
      };
    }),

  /**
   * Complete a stage in a lesson
   */
  completeStage: protectedProcedure
    .input(
      z.object({
        topicId: z.string().uuid(),
        stage: z.enum(['theory', 'demo', 'quiz', 'lab']),
        timeSpentSeconds: z.number().int().min(0).default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const supabase = await createClient();

      // If completing lab stage, mark topic as complete
      if (input.stage === 'lab') {
        // Get enrollment
        const { data: topic } = await supabase
          .from('module_topics')
          .select('module:course_modules(course_id)')
          .eq('id', input.topicId)
          .single();

        const courseId = (topic?.module as any)?.course_id;

        const { data: enrollment } = await supabase
          .from('student_enrollments')
          .select('id')
          .eq('user_id', ctx.userId)
          .eq('course_id', courseId)
          .single();

        if (enrollment) {
          // Complete topic
          const { data: completionId, error } = await supabase.rpc('complete_topic', {
            p_user_id: ctx.userId,
            p_enrollment_id: enrollment.id,
            p_topic_id: input.topicId,
            p_time_spent_seconds: input.timeSpentSeconds,
          });

          if (error) {
            throw new Error(`Failed to complete topic: ${error.message}`);
          }

          return { success: true, completionId };
        }
      }

      // For other stages, just acknowledge completion
      return { success: true };
    }),
});
