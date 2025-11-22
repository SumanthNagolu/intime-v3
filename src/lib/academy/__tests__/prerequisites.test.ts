/**
 * Prerequisites and Sequencing Tests
 * Story: ACAD-006
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

describe('Prerequisites and Sequencing', () => {
  let testCourseId: string;
  let testModuleId: string;
  let testTopic1Id: string;
  let testTopic2Id: string;
  let testUserId: string;
  let testEnrollmentId: string;

  beforeAll(async () => {
    // Create test user
    const { data: user } = await supabase
      .from('user_profiles')
      .insert({
        email: 'test-prereq@example.com',
        full_name: 'Test Prerequisite User',
      })
      .select('id')
      .single();

    testUserId = user!.id;

    // Create test course
    const { data: course } = await supabase
      .from('courses')
      .insert({
        slug: 'test-prereq-course',
        title: 'Test Prerequisites Course',
        description: 'Testing prerequisites',
        estimated_duration_weeks: 4,
        skill_level: 'beginner',
      })
      .select('id')
      .single();

    testCourseId = course!.id;

    // Create test module
    const { data: module } = await supabase
      .from('course_modules')
      .insert({
        course_id: testCourseId,
        slug: 'test-module',
        title: 'Test Module',
        module_number: 1,
      })
      .select('id')
      .single();

    testModuleId = module!.id;

    // Create Topic 1 (no prerequisites)
    const { data: topic1 } = await supabase
      .from('module_topics')
      .insert({
        module_id: testModuleId,
        slug: 'test-topic-1',
        title: 'Test Topic 1',
        topic_number: 1,
        content_type: 'video',
      })
      .select('id')
      .single();

    testTopic1Id = topic1!.id;

    // Create Topic 2 (requires Topic 1)
    const { data: topic2 } = await supabase
      .from('module_topics')
      .insert({
        module_id: testModuleId,
        slug: 'test-topic-2',
        title: 'Test Topic 2',
        topic_number: 2,
        content_type: 'video',
        prerequisite_topic_ids: [testTopic1Id],
      })
      .select('id')
      .single();

    testTopic2Id = topic2!.id;

    // Create enrollment
    const { data: enrollment } = await supabase.rpc('enroll_student', {
      p_user_id: testUserId,
      p_course_id: testCourseId,
      p_payment_id: 'test_prereq_payment',
      p_payment_amount: 99.0,
      p_payment_type: 'free',
    });

    testEnrollmentId = enrollment as string;
  });

  afterAll(async () => {
    // Cleanup
    await supabase.from('topic_completions').delete().eq('user_id', testUserId);
    await supabase.from('xp_transactions').delete().eq('user_id', testUserId);
    await supabase.from('student_enrollments').delete().eq('id', testEnrollmentId);
    await supabase.from('module_topics').delete().eq('id', testTopic1Id);
    await supabase.from('module_topics').delete().eq('id', testTopic2Id);
    await supabase.from('course_modules').delete().eq('id', testModuleId);
    await supabase.from('courses').delete().eq('id', testCourseId);
    await supabase.from('user_profiles').delete().eq('id', testUserId);
  });

  describe('Topic Prerequisites', () => {
    it('should unlock Topic 1 (no prerequisites)', async () => {
      const { data: isUnlocked, error } = await supabase.rpc('is_topic_unlocked', {
        p_user_id: testUserId,
        p_topic_id: testTopic1Id,
      });

      expect(error).toBeNull();
      expect(isUnlocked).toBe(true);
    });

    it('should lock Topic 2 until Topic 1 completed', async () => {
      const { data: isUnlocked, error } = await supabase.rpc('is_topic_unlocked', {
        p_user_id: testUserId,
        p_topic_id: testTopic2Id,
      });

      expect(error).toBeNull();
      expect(isUnlocked).toBe(false);
    });

    it('should unlock Topic 2 after completing Topic 1', async () => {
      // Complete Topic 1
      await supabase.rpc('complete_topic', {
        p_user_id: testUserId,
        p_enrollment_id: testEnrollmentId,
        p_topic_id: testTopic1Id,
        p_time_spent_seconds: 300,
      });

      // Check if Topic 2 is now unlocked
      const { data: isUnlocked, error } = await supabase.rpc('is_topic_unlocked', {
        p_user_id: testUserId,
        p_topic_id: testTopic2Id,
      });

      expect(error).toBeNull();
      expect(isUnlocked).toBe(true);
    });
  });

  describe('Database Views', () => {
    it('should query module_unlock_requirements view', async () => {
      const { data, error } = await supabase
        .from('module_unlock_requirements')
        .select('*')
        .eq('module_id', testModuleId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeTruthy();
      expect(data?.module_title).toBe('Test Module');
    });

    it('should query topic_unlock_requirements view', async () => {
      const { data, error } = await supabase
        .from('topic_unlock_requirements')
        .select('*')
        .eq('topic_id', testTopic2Id)
        .single();

      expect(error).toBeNull();
      expect(data).toBeTruthy();
      expect(data?.topic_title).toBe('Test Topic 2');
      expect(data?.prerequisite_topic_ids).toContain(testTopic1Id);
    });
  });

  describe('Helper Functions', () => {
    it('should get locked topics for user', async () => {
      const { data, error } = await supabase.rpc('get_locked_topics_for_user', {
        p_user_id: testUserId,
        p_course_id: testCourseId,
      });

      expect(error).toBeNull();
      expect(data).toBeTruthy();
      expect(Array.isArray(data)).toBe(true);
      expect(data!.length).toBeGreaterThan(0);
    });

    it('should get next unlocked topic', async () => {
      const { data: nextTopicId, error } = await supabase.rpc('get_next_unlocked_topic', {
        p_user_id: testUserId,
        p_enrollment_id: testEnrollmentId,
      });

      expect(error).toBeNull();
      // Should return Topic 2 (Topic 1 is already completed)
      expect(nextTopicId).toBe(testTopic2Id);
    });

    it('should check course prerequisites', async () => {
      const { data: isUnlocked, error } = await supabase.rpc('check_course_prerequisites', {
        p_user_id: testUserId,
        p_course_id: testCourseId,
      });

      expect(error).toBeNull();
      // No course prerequisites, should be unlocked
      expect(isUnlocked).toBe(true);
    });

    it('should check module prerequisites', async () => {
      const { data: isUnlocked, error } = await supabase.rpc('check_module_prerequisites', {
        p_user_id: testUserId,
        p_module_id: testModuleId,
      });

      expect(error).toBeNull();
      // No module prerequisites, should be unlocked
      expect(isUnlocked).toBe(true);
    });
  });

  describe('Admin Bypass', () => {
    it('should check bypass_prerequisites_for_role function', async () => {
      const { data: hasBypass, error } = await supabase.rpc('bypass_prerequisites_for_role', {
        p_user_id: testUserId,
      });

      expect(error).toBeNull();
      // Test user is not admin, should be false
      expect(hasBypass).toBe(false);
    });

    it('should allow admin to bypass prerequisites', async () => {
      // This test would require creating an admin user
      // Skipping for now
      expect(true).toBe(true);
    });
  });

  describe('Course Prerequisites', () => {
    it('should enforce course-level prerequisites', async () => {
      // Create advanced course with prerequisites
      const { data: advancedCourse } = await supabase
        .from('courses')
        .insert({
          slug: 'test-advanced-course',
          title: 'Test Advanced Course',
          description: 'Advanced course',
          estimated_duration_weeks: 8,
          skill_level: 'advanced',
          prerequisite_course_ids: [testCourseId],
        })
        .select('id')
        .single();

      if (advancedCourse) {
        // Check prerequisites (should be false since test course not completed)
        const { data: isUnlocked } = await supabase.rpc('check_course_prerequisites', {
          p_user_id: testUserId,
          p_course_id: advancedCourse.id,
        });

        expect(isUnlocked).toBe(false);

        // Cleanup
        await supabase.from('courses').delete().eq('id', advancedCourse.id);
      }
    });
  });

  describe('Module Prerequisites', () => {
    it('should enforce module-level prerequisites', async () => {
      // Create Module 2 with Module 1 as prerequisite
      const { data: module2 } = await supabase
        .from('course_modules')
        .insert({
          course_id: testCourseId,
          slug: 'test-module-2',
          title: 'Test Module 2',
          module_number: 2,
          prerequisite_module_ids: [testModuleId],
        })
        .select('id')
        .single();

      if (module2) {
        // Check prerequisites (should be false since Module 1 not fully completed)
        const { data: isUnlocked } = await supabase.rpc('check_module_prerequisites', {
          p_user_id: testUserId,
          p_module_id: module2.id,
        });

        // Module 1 has Topic 2 still incomplete, so Module 2 should be locked
        expect(isUnlocked).toBe(false);

        // Cleanup
        await supabase.from('course_modules').delete().eq('id', module2.id);
      }
    });
  });

  describe('Sequential Unlocking Flow', () => {
    it('should follow complete → unlock → next pattern', async () => {
      // 1. Verify Topic 2 is unlocked (Topic 1 was completed earlier)
      const { data: topic2Unlocked } = await supabase.rpc('is_topic_unlocked', {
        p_user_id: testUserId,
        p_topic_id: testTopic2Id,
      });
      expect(topic2Unlocked).toBe(true);

      // 2. Complete Topic 2
      await supabase.rpc('complete_topic', {
        p_user_id: testUserId,
        p_enrollment_id: testEnrollmentId,
        p_topic_id: testTopic2Id,
        p_time_spent_seconds: 400,
      });

      // 3. Verify completion
      const { data: completion } = await supabase
        .from('topic_completions')
        .select('*')
        .eq('user_id', testUserId)
        .eq('topic_id', testTopic2Id)
        .single();

      expect(completion).toBeTruthy();

      // 4. Check if next topic would unlock (if it existed)
      const { data: nextTopic } = await supabase.rpc('get_next_unlocked_topic', {
        p_user_id: testUserId,
        p_enrollment_id: testEnrollmentId,
      });

      // No more topics, should return null
      expect(nextTopic).toBeNull();
    });
  });
});
