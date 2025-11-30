/**
 * Academy Course Queries
 * Story: ACAD-001
 *
 * Database query functions for course catalog management
 */

import { createClient } from '@/lib/supabase/server';
import type {
  Course,
  CourseModule,
  ModuleTopic,
  TopicLesson,
  CourseWithModules,
  CompleteCourse,
} from '@/types/academy';

/**
 * Get all published courses
 */
export async function getPublishedCourses(): Promise<Course[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('is_published', true)
    .is('deleted_at', null)
    .order('title');

  if (error) {
    throw new Error(`Failed to fetch published courses: ${error.message}`);
  }

  return data as Course[];
}

/**
 * Get featured courses for homepage
 */
export async function getFeaturedCourses(): Promise<Course[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('is_published', true)
    .eq('is_featured', true)
    .is('deleted_at', null)
    .order('title');

  if (error) {
    throw new Error(`Failed to fetch featured courses: ${error.message}`);
  }

  return data as Course[];
}

/**
 * Get course by slug
 */
export async function getCourseBySlug(slug: string): Promise<Course | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('slug', slug)
    .is('deleted_at', null)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch course: ${error.message}`);
  }

  return data as Course;
}

/**
 * Get course with all modules
 */
export async function getCourseWithModules(
  courseId: string
): Promise<CourseWithModules | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('courses')
    .select(
      `
      *,
      modules:course_modules(*)
    `
    )
    .eq('id', courseId)
    .is('deleted_at', null)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch course with modules: ${error.message}`);
  }

  return data as CourseWithModules;
}

/**
 * Get complete course with full curriculum hierarchy
 */
export async function getCompleteCourse(
  courseId: string
): Promise<CompleteCourse | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('courses')
    .select(
      `
      *,
      modules:course_modules(
        *,
        topics:module_topics(
          *,
          lessons:topic_lessons(*)
        )
      )
    `
    )
    .eq('id', courseId)
    .is('deleted_at', null)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch complete course: ${error.message}`);
  }

  return data as CompleteCourse;
}

/**
 * Get all modules for a course
 */
export async function getCourseModules(courseId: string): Promise<CourseModule[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('course_modules')
    .select('*')
    .eq('course_id', courseId)
    .order('module_number');

  if (error) {
    throw new Error(`Failed to fetch course modules: ${error.message}`);
  }

  return data as CourseModule[];
}

/**
 * Get all topics for a module
 */
export async function getModuleTopics(moduleId: string): Promise<ModuleTopic[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('module_topics')
    .select('*')
    .eq('module_id', moduleId)
    .order('topic_number');

  if (error) {
    throw new Error(`Failed to fetch module topics: ${error.message}`);
  }

  return data as ModuleTopic[];
}

/**
 * Get all lessons for a topic
 */
export async function getTopicLessons(topicId: string): Promise<TopicLesson[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('topic_lessons')
    .select('*')
    .eq('topic_id', topicId)
    .order('lesson_number');

  if (error) {
    throw new Error(`Failed to fetch topic lessons: ${error.message}`);
  }

  return data as TopicLesson[];
}

/**
 * Check if prerequisites are met
 */
export async function checkPrerequisites(
  userId: string,
  prerequisiteIds: string[],
  _type: 'course' | 'module' | 'topic'
): Promise<boolean> {
  if (!prerequisiteIds || prerequisiteIds.length === 0) {
    return true;
  }

  const _supabase = await createClient();

  // This will be implemented in ACAD-003 (Progress Tracking)
  // For now, return true to allow access
  return true;
}

/**
 * Get next available module for a student
 */
export async function getNextModule(
  userId: string,
  courseId: string
): Promise<CourseModule | null> {
  const supabase = await createClient();

  // Get all modules in order
  const { data: modules } = await supabase
    .from('course_modules')
    .select('*')
    .eq('course_id', courseId)
    .order('module_number');

  if (!modules || modules.length === 0) {
    return null;
  }

  // This will be implemented in ACAD-003 (Progress Tracking)
  // For now, return the first module
  return modules[0] as CourseModule;
}

/**
 * Get next available topic for a student
 */
export async function getNextTopic(
  userId: string,
  moduleId: string
): Promise<ModuleTopic | null> {
  const supabase = await createClient();

  // Get all topics in order
  const { data: topics } = await supabase
    .from('module_topics')
    .select('*')
    .eq('module_id', moduleId)
    .eq('is_required', true)
    .order('topic_number');

  if (!topics || topics.length === 0) {
    return null;
  }

  // This will be implemented in ACAD-003 (Progress Tracking)
  // For now, return the first topic
  return topics[0] as ModuleTopic;
}

/**
 * Search courses by title or description
 */
export async function searchCourses(query: string): Promise<Course[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('is_published', true)
    .is('deleted_at', null)
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .order('title');

  if (error) {
    throw new Error(`Failed to search courses: ${error.message}`);
  }

  return data as Course[];
}

/**
 * Get courses by skill level
 */
export async function getCoursesBySkillLevel(
  skillLevel: 'beginner' | 'intermediate' | 'advanced'
): Promise<Course[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('is_published', true)
    .eq('skill_level', skillLevel)
    .is('deleted_at', null)
    .order('title');

  if (error) {
    throw new Error(`Failed to fetch courses by skill level: ${error.message}`);
  }

  return data as Course[];
}
