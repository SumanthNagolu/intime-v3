/**
 * Unlock Checker Utility
 * Story: ACAD-006
 *
 * Server-side utilities for checking prerequisite unlock status
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export interface UnlockStatus {
  unlocked: boolean;
  reason?: string;
  missingPrerequisites?: string[];
}

/**
 * Check if a topic is unlocked for a user
 * Includes admin/trainer bypass logic
 */
export async function checkTopicUnlock(
  userId: string,
  topicId: string
): Promise<UnlockStatus> {
  const supabase = createAdminClient();

  // Check if user has bypass role (admin/trainer/course_admin)
  const { data: hasBypass } = await supabase.rpc('bypass_prerequisites_for_role', {
    p_user_id: userId,
  });

  if (hasBypass) {
    return { unlocked: true, reason: 'Admin/trainer bypass' };
  }

  // Check prerequisites via database function
  const { data: isUnlocked, error } = await supabase.rpc('is_topic_unlocked', {
    p_user_id: userId,
    p_topic_id: topicId,
  });

  if (error) {
    throw new Error(`Failed to check unlock status: ${error.message}`);
  }

  if (!isUnlocked) {
    // Get prerequisite topic titles for helpful error message
    const { data: topic } = await supabase
      .from('module_topics')
      .select(
        `
        title,
        prerequisite_topic_ids
      `
      )
      .eq('id', topicId)
      .single();

    if (topic?.prerequisite_topic_ids && topic.prerequisite_topic_ids.length > 0) {
      // Get titles of prerequisite topics
      const { data: prereqTopics } = await supabase
        .from('module_topics')
        .select('title')
        .in('id', topic.prerequisite_topic_ids);

      const prereqTitles = prereqTopics?.map((p) => p.title) || [];

      return {
        unlocked: false,
        reason: `Complete these topics first: ${prereqTitles.join(', ')}`,
        missingPrerequisites: prereqTitles,
      };
    }

    return {
      unlocked: false,
      reason: 'Prerequisites not met',
    };
  }

  return { unlocked: true };
}

/**
 * Check if a module is unlocked for a user
 */
export async function checkModuleUnlock(
  userId: string,
  moduleId: string
): Promise<UnlockStatus> {
  const supabase = createAdminClient();

  // Check bypass
  const { data: hasBypass } = await supabase.rpc('bypass_prerequisites_for_role', {
    p_user_id: userId,
  });

  if (hasBypass) {
    return { unlocked: true, reason: 'Admin/trainer bypass' };
  }

  // Check prerequisites
  const { data: isUnlocked, error } = await supabase.rpc('check_module_prerequisites', {
    p_user_id: userId,
    p_module_id: moduleId,
  });

  if (error) {
    throw new Error(`Failed to check module unlock: ${error.message}`);
  }

  if (!isUnlocked) {
    // Get prerequisite module titles
    const { data: module } = await supabase
      .from('course_modules')
      .select('title, prerequisite_module_ids')
      .eq('id', moduleId)
      .single();

    if (module?.prerequisite_module_ids && module.prerequisite_module_ids.length > 0) {
      const { data: prereqModules } = await supabase
        .from('course_modules')
        .select('title')
        .in('id', module.prerequisite_module_ids);

      const prereqTitles = prereqModules?.map((m) => m.title) || [];

      return {
        unlocked: false,
        reason: `Complete these modules first: ${prereqTitles.join(', ')}`,
        missingPrerequisites: prereqTitles,
      };
    }

    return {
      unlocked: false,
      reason: 'Module prerequisites not met',
    };
  }

  return { unlocked: true };
}

/**
 * Check if a course is accessible for a user
 */
export async function checkCourseUnlock(
  userId: string,
  courseId: string
): Promise<UnlockStatus> {
  const supabase = createAdminClient();

  // Check bypass
  const { data: hasBypass } = await supabase.rpc('bypass_prerequisites_for_role', {
    p_user_id: userId,
  });

  if (hasBypass) {
    return { unlocked: true, reason: 'Admin/trainer bypass' };
  }

  // Check course prerequisites
  const { data: isUnlocked, error } = await supabase.rpc('check_course_prerequisites', {
    p_user_id: userId,
    p_course_id: courseId,
  });

  if (error) {
    throw new Error(`Failed to check course unlock: ${error.message}`);
  }

  if (!isUnlocked) {
    // Get prerequisite course titles
    const { data: course } = await supabase
      .from('courses')
      .select('title, prerequisite_course_ids')
      .eq('id', courseId)
      .single();

    if (course?.prerequisite_course_ids && course.prerequisite_course_ids.length > 0) {
      const { data: prereqCourses } = await supabase
        .from('courses')
        .select('title')
        .in('id', course.prerequisite_course_ids);

      const prereqTitles = prereqCourses?.map((c) => c.title) || [];

      return {
        unlocked: false,
        reason: `Complete these courses first: ${prereqTitles.join(', ')}`,
        missingPrerequisites: prereqTitles,
      };
    }

    return {
      unlocked: false,
      reason: 'Course prerequisites not met',
    };
  }

  return { unlocked: true };
}

/**
 * Get all topics for a course with their unlock status
 */
export async function getTopicsWithUnlockStatus(userId: string, courseId: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase.rpc('get_locked_topics_for_user', {
    p_user_id: userId,
    p_course_id: courseId,
  });

  if (error) {
    throw new Error(`Failed to get topics: ${error.message}`);
  }

  return data || [];
}

/**
 * Get the next unlocked topic for a student's enrollment
 */
export async function getNextUnlockedTopic(userId: string, enrollmentId: string) {
  const supabase = createAdminClient();

  const { data: nextTopicId, error } = await supabase.rpc('get_next_unlocked_topic', {
    p_user_id: userId,
    p_enrollment_id: enrollmentId,
  });

  if (error) {
    throw new Error(`Failed to get next topic: ${error.message}`);
  }

  if (!nextTopicId) {
    return null;
  }

  // Get topic details
  const { data: topic } = await supabase
    .from('module_topics')
    .select(
      `
      *,
      module:course_modules(
        id,
        title,
        module_number,
        course:courses(id, title)
      )
    `
    )
    .eq('id', nextTopicId)
    .single();

  return topic;
}

/**
 * Check if user can bypass prerequisites
 */
export async function canBypassPrerequisites(userId: string): Promise<boolean> {
  const supabase = createAdminClient();

  const { data: hasBypass, error } = await supabase.rpc('bypass_prerequisites_for_role', {
    p_user_id: userId,
  });

  if (error) {
    return false;
  }

  return hasBypass || false;
}
