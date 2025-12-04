/**
 * Reading Progress Tests
 * Story: ACAD-009
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// TODO: Requires database setup
describe.skip('Reading Progress Tracking', () => {
  let testUserId: string;
  let testCourseId: string;
  let testModuleId: string;
  let testTopicId: string;
  let testEnrollmentId: string;

  beforeAll(async () => {
    // Create test user
    const { data: user } = await supabase
      .from('user_profiles')
      .insert({
        email: 'test-reading@example.com',
        full_name: 'Test Reading User',
      })
      .select('id')
      .single();

    testUserId = user!.id;

    // Create test course
    const { data: course } = await supabase
      .from('courses')
      .insert({
        slug: 'test-reading-course',
        title: 'Test Reading Course',
        description: 'Testing reading materials',
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

    // Create test topic (reading type)
    const { data: topic } = await supabase
      .from('module_topics')
      .insert({
        module_id: testModuleId,
        slug: 'test-reading-topic',
        title: 'Test Reading Topic',
        topic_number: 1,
        content_type: 'reading',
      })
      .select('id')
      .single();

    testTopicId = topic!.id;

    // Create enrollment
    const { data: enrollment } = await supabase.rpc('enroll_student', {
      p_user_id: testUserId,
      p_course_id: testCourseId,
      p_payment_id: 'test_reading_payment',
      p_payment_amount: 99.0,
      p_payment_type: 'free',
    });

    testEnrollmentId = enrollment as string;
  });

  afterAll(async () => {
    // Cleanup
    await supabase.from('reading_progress').delete().eq('user_id', testUserId);
    await supabase.from('topic_completions').delete().eq('user_id', testUserId);
    await supabase.from('xp_transactions').delete().eq('user_id', testUserId);
    await supabase.from('student_enrollments').delete().eq('id', testEnrollmentId);
    await supabase.from('module_topics').delete().eq('id', testTopicId);
    await supabase.from('course_modules').delete().eq('id', testModuleId);
    await supabase.from('courses').delete().eq('id', testCourseId);
    await supabase.from('user_profiles').delete().eq('id', testUserId);
  });

  describe('Reading Progress Saving', () => {
    it('should save reading progress', async () => {
      const { data: progressId, error } = await supabase.rpc('save_reading_progress', {
        p_user_id: testUserId,
        p_topic_id: testTopicId,
        p_enrollment_id: testEnrollmentId,
        p_scroll_percentage: 50,
        p_last_scroll_position: 1000,
        p_reading_time_increment: 60,
        p_content_type: 'markdown',
        p_content_length: 5000,
      });

      expect(error).toBeNull();
      expect(progressId).toBeTruthy();
    });

    it('should update existing progress', async () => {
      // Save initial progress
      await supabase.rpc('save_reading_progress', {
        p_user_id: testUserId,
        p_topic_id: testTopicId,
        p_enrollment_id: testEnrollmentId,
        p_scroll_percentage: 50,
        p_last_scroll_position: 1000,
        p_reading_time_increment: 60,
        p_content_type: 'markdown',
      });

      // Update progress (higher scroll percentage)
      await supabase.rpc('save_reading_progress', {
        p_user_id: testUserId,
        p_topic_id: testTopicId,
        p_enrollment_id: testEnrollmentId,
        p_scroll_percentage: 75,
        p_last_scroll_position: 1500,
        p_reading_time_increment: 60,
        p_content_type: 'markdown',
      });

      // Verify updated progress
      const { data: progress } = await supabase.rpc('get_reading_progress', {
        p_user_id: testUserId,
        p_topic_id: testTopicId,
      });

      expect(progress?.[0]?.scroll_percentage).toBe(75);
      expect(progress?.[0]?.last_scroll_position).toBe(1500);
      expect(progress?.[0]?.total_reading_time_seconds).toBeGreaterThan(0);
    });

    it('should not decrease scroll percentage', async () => {
      // Set high scroll percentage
      await supabase.rpc('save_reading_progress', {
        p_user_id: testUserId,
        p_topic_id: testTopicId,
        p_enrollment_id: testEnrollmentId,
        p_scroll_percentage: 90,
        p_last_scroll_position: 2000,
        p_reading_time_increment: 10,
        p_content_type: 'markdown',
      });

      // Try to save lower scroll percentage
      await supabase.rpc('save_reading_progress', {
        p_user_id: testUserId,
        p_topic_id: testTopicId,
        p_enrollment_id: testEnrollmentId,
        p_scroll_percentage: 60,
        p_last_scroll_position: 1200,
        p_reading_time_increment: 10,
        p_content_type: 'markdown',
      });

      // Verify scroll percentage stayed at 90
      const { data: progress } = await supabase.rpc('get_reading_progress', {
        p_user_id: testUserId,
        p_topic_id: testTopicId,
      });

      expect(progress?.[0]?.scroll_percentage).toBe(90);
    });

    it('should accumulate reading time', async () => {
      // Save progress with 60 seconds
      await supabase.rpc('save_reading_progress', {
        p_user_id: testUserId,
        p_topic_id: testTopicId,
        p_enrollment_id: testEnrollmentId,
        p_scroll_percentage: 50,
        p_last_scroll_position: 1000,
        p_reading_time_increment: 60,
        p_content_type: 'markdown',
      });

      // Save progress with another 60 seconds
      await supabase.rpc('save_reading_progress', {
        p_user_id: testUserId,
        p_topic_id: testTopicId,
        p_enrollment_id: testEnrollmentId,
        p_scroll_percentage: 60,
        p_last_scroll_position: 1200,
        p_reading_time_increment: 60,
        p_content_type: 'markdown',
      });

      const { data: progress } = await supabase.rpc('get_reading_progress', {
        p_user_id: testUserId,
        p_topic_id: testTopicId,
      });

      expect(progress?.[0]?.total_reading_time_seconds).toBeGreaterThanOrEqual(120);
    });
  });

  describe('Reading Progress Retrieval', () => {
    it('should get reading progress', async () => {
      const { data: progress, error } = await supabase.rpc('get_reading_progress', {
        p_user_id: testUserId,
        p_topic_id: testTopicId,
      });

      expect(error).toBeNull();
      expect(progress).toBeTruthy();
      expect(progress?.[0]?.scroll_percentage).toBeGreaterThanOrEqual(0);
    });

    it('should return empty for non-existent progress', async () => {
      const { data: progress } = await supabase.rpc('get_reading_progress', {
        p_user_id: testUserId,
        p_topic_id: '00000000-0000-0000-0000-000000000000',
      });

      expect(progress).toEqual([]);
    });
  });

  describe('Reading Statistics', () => {
    it('should get user reading stats', async () => {
      const { data: stats, error } = await supabase.rpc('get_user_reading_stats', {
        p_user_id: testUserId,
      });

      expect(error).toBeNull();
      expect(stats?.[0]).toMatchObject({
        total_articles_read: expect.any(Number),
        total_reading_time_seconds: expect.any(Number),
        total_articles_completed: expect.any(Number),
      });
    });

    it('should get course reading stats', async () => {
      const { data: stats, error } = await supabase.rpc('get_course_reading_stats', {
        p_course_id: testCourseId,
      });

      expect(error).toBeNull();
      expect(Array.isArray(stats)).toBe(true);
    });
  });

  describe('PDF Progress Tracking', () => {
    it('should track PDF page progress', async () => {
      const { data: progressId, error } = await supabase.rpc('save_reading_progress', {
        p_user_id: testUserId,
        p_topic_id: testTopicId,
        p_enrollment_id: testEnrollmentId,
        p_scroll_percentage: 50,
        p_last_scroll_position: 0,
        p_reading_time_increment: 60,
        p_content_type: 'pdf',
        p_current_page: 5,
        p_total_pages: 10,
      });

      expect(error).toBeNull();
      expect(progressId).toBeTruthy();

      const { data: progress } = await supabase.rpc('get_reading_progress', {
        p_user_id: testUserId,
        p_topic_id: testTopicId,
      });

      expect(progress?.[0]?.current_page).toBe(5);
      expect(progress?.[0]?.total_pages).toBe(10);
      expect(progress?.[0]?.content_type).toBe('pdf');
    });
  });

  describe('Reading Progress Reset', () => {
    it('should reset reading progress', async () => {
      // Save progress first
      await supabase.rpc('save_reading_progress', {
        p_user_id: testUserId,
        p_topic_id: testTopicId,
        p_enrollment_id: testEnrollmentId,
        p_scroll_percentage: 80,
        p_last_scroll_position: 1800,
        p_reading_time_increment: 120,
        p_content_type: 'markdown',
      });

      // Reset progress
      const { data: success, error } = await supabase.rpc('reset_reading_progress', {
        p_user_id: testUserId,
        p_topic_id: testTopicId,
      });

      expect(error).toBeNull();
      expect(success).toBe(true);

      // Verify reset
      const { data: progress } = await supabase.rpc('get_reading_progress', {
        p_user_id: testUserId,
        p_topic_id: testTopicId,
      });

      expect(progress?.[0]?.scroll_percentage).toBe(0);
      expect(progress?.[0]?.last_scroll_position).toBe(0);
      expect(progress?.[0]?.total_reading_time_seconds).toBe(0);
    });
  });

  describe('Reading Stats View', () => {
    it('should query reading_stats view', async () => {
      const { data, error } = await supabase
        .from('reading_stats')
        .select('*')
        .eq('user_id', testUserId);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should calculate engagement score', async () => {
      const { data } = await supabase
        .from('reading_stats')
        .select('*')
        .eq('user_id', testUserId)
        .single();

      if (data) {
        expect(data.engagement_score).toBeGreaterThanOrEqual(0);
        expect(data.engagement_score).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('Session Count Tracking', () => {
    it('should increment session count on each save', async () => {
      // Save progress multiple times
      for (let i = 0; i < 3; i++) {
        await supabase.rpc('save_reading_progress', {
          p_user_id: testUserId,
          p_topic_id: testTopicId,
          p_enrollment_id: testEnrollmentId,
          p_scroll_percentage: 20 + i * 10,
          p_last_scroll_position: 500 + i * 500,
          p_reading_time_increment: 60,
          p_content_type: 'markdown',
        });
      }

      const { data: progress } = await supabase.rpc('get_reading_progress', {
        p_user_id: testUserId,
        p_topic_id: testTopicId,
      });

      expect(progress?.[0]?.session_count).toBeGreaterThan(1);
    });
  });
});
