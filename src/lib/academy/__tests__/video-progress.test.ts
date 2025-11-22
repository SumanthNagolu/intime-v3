/**
 * Video Progress Tests
 * Story: ACAD-007
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

describe('Video Progress Tracking', () => {
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
        email: 'test-video@example.com',
        full_name: 'Test Video User',
      })
      .select('id')
      .single();

    testUserId = user!.id;

    // Create test course
    const { data: course } = await supabase
      .from('courses')
      .insert({
        slug: 'test-video-course',
        title: 'Test Video Course',
        description: 'Testing video progress',
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

    // Create test topic (video type)
    const { data: topic } = await supabase
      .from('module_topics')
      .insert({
        module_id: testModuleId,
        slug: 'test-video-topic',
        title: 'Test Video Topic',
        topic_number: 1,
        content_type: 'video',
        video_url: 'https://example.com/video.mp4',
      })
      .select('id')
      .single();

    testTopicId = topic!.id;

    // Create enrollment
    const { data: enrollment } = await supabase.rpc('enroll_student', {
      p_user_id: testUserId,
      p_course_id: testCourseId,
      p_payment_id: 'test_video_payment',
      p_payment_amount: 99.0,
      p_payment_type: 'free',
    });

    testEnrollmentId = enrollment as string;
  });

  afterAll(async () => {
    // Cleanup
    await supabase.from('video_progress').delete().eq('user_id', testUserId);
    await supabase.from('topic_completions').delete().eq('user_id', testUserId);
    await supabase.from('xp_transactions').delete().eq('user_id', testUserId);
    await supabase.from('student_enrollments').delete().eq('id', testEnrollmentId);
    await supabase.from('module_topics').delete().eq('id', testTopicId);
    await supabase.from('course_modules').delete().eq('id', testModuleId);
    await supabase.from('courses').delete().eq('id', testCourseId);
    await supabase.from('user_profiles').delete().eq('id', testUserId);
  });

  describe('Video Progress Saving', () => {
    it('should save video progress', async () => {
      const { data: progressId, error } = await supabase.rpc('save_video_progress', {
        p_user_id: testUserId,
        p_topic_id: testTopicId,
        p_enrollment_id: testEnrollmentId,
        p_last_position_seconds: 120,
        p_video_duration_seconds: 600,
        p_video_url: 'https://example.com/video.mp4',
        p_video_provider: 'direct',
        p_watch_time_increment: 10,
      });

      expect(error).toBeNull();
      expect(progressId).toBeTruthy();
    });

    it('should update existing progress', async () => {
      // Save initial progress
      await supabase.rpc('save_video_progress', {
        p_user_id: testUserId,
        p_topic_id: testTopicId,
        p_enrollment_id: testEnrollmentId,
        p_last_position_seconds: 120,
        p_video_duration_seconds: 600,
        p_video_url: 'https://example.com/video.mp4',
        p_video_provider: 'direct',
        p_watch_time_increment: 10,
      });

      // Update progress
      await supabase.rpc('save_video_progress', {
        p_user_id: testUserId,
        p_topic_id: testTopicId,
        p_enrollment_id: testEnrollmentId,
        p_last_position_seconds: 240,
        p_video_duration_seconds: 600,
        p_video_url: 'https://example.com/video.mp4',
        p_video_provider: 'direct',
        p_watch_time_increment: 120,
      });

      // Verify updated progress
      const { data: progress } = await supabase.rpc('get_video_progress', {
        p_user_id: testUserId,
        p_topic_id: testTopicId,
      });

      expect(progress?.[0]?.last_position_seconds).toBe(240);
      expect(progress?.[0]?.total_watch_time_seconds).toBeGreaterThan(0);
    });

    it('should calculate completion percentage', async () => {
      await supabase.rpc('save_video_progress', {
        p_user_id: testUserId,
        p_topic_id: testTopicId,
        p_enrollment_id: testEnrollmentId,
        p_last_position_seconds: 540, // 90% of 600 seconds
        p_video_duration_seconds: 600,
        p_video_url: 'https://example.com/video.mp4',
        p_video_provider: 'direct',
        p_watch_time_increment: 10,
      });

      const { data: progress } = await supabase.rpc('get_video_progress', {
        p_user_id: testUserId,
        p_topic_id: testTopicId,
      });

      expect(progress?.[0]?.completion_percentage).toBe(90);
    });
  });

  describe('Video Progress Retrieval', () => {
    it('should get video progress', async () => {
      const { data: progress, error } = await supabase.rpc('get_video_progress', {
        p_user_id: testUserId,
        p_topic_id: testTopicId,
      });

      expect(error).toBeNull();
      expect(progress).toBeTruthy();
      expect(progress?.[0]?.last_position_seconds).toBeGreaterThanOrEqual(0);
    });

    it('should return null for non-existent progress', async () => {
      const { data: progress } = await supabase.rpc('get_video_progress', {
        p_user_id: testUserId,
        p_topic_id: '00000000-0000-0000-0000-000000000000',
      });

      expect(progress).toEqual([]);
    });
  });

  describe('Watch Statistics', () => {
    it('should get user watch stats', async () => {
      const { data: stats, error } = await supabase.rpc('get_user_watch_stats', {
        p_user_id: testUserId,
      });

      expect(error).toBeNull();
      expect(stats?.[0]).toMatchObject({
        total_videos_watched: expect.any(Number),
        total_watch_time_seconds: expect.any(Number),
        total_videos_completed: expect.any(Number),
      });
    });

    it('should get course watch stats', async () => {
      const { data: stats, error } = await supabase.rpc('get_course_watch_stats', {
        p_course_id: testCourseId,
      });

      expect(error).toBeNull();
      expect(Array.isArray(stats)).toBe(true);
    });
  });

  describe('Video Progress Reset', () => {
    it('should reset video progress', async () => {
      // Save progress first
      await supabase.rpc('save_video_progress', {
        p_user_id: testUserId,
        p_topic_id: testTopicId,
        p_enrollment_id: testEnrollmentId,
        p_last_position_seconds: 300,
        p_video_duration_seconds: 600,
        p_video_url: 'https://example.com/video.mp4',
        p_video_provider: 'direct',
        p_watch_time_increment: 10,
      });

      // Reset progress
      const { data: success, error } = await supabase.rpc('reset_video_progress', {
        p_user_id: testUserId,
        p_topic_id: testTopicId,
      });

      expect(error).toBeNull();
      expect(success).toBe(true);

      // Verify reset
      const { data: progress } = await supabase.rpc('get_video_progress', {
        p_user_id: testUserId,
        p_topic_id: testTopicId,
      });

      expect(progress?.[0]?.last_position_seconds).toBe(0);
      expect(progress?.[0]?.total_watch_time_seconds).toBe(0);
    });
  });

  describe('Video Watch Stats View', () => {
    it('should query video_watch_stats view', async () => {
      const { data, error } = await supabase
        .from('video_watch_stats')
        .select('*')
        .eq('user_id', testUserId);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should calculate engagement score', async () => {
      const { data } = await supabase
        .from('video_watch_stats')
        .select('*')
        .eq('user_id', testUserId)
        .single();

      if (data) {
        expect(data.engagement_score).toBeGreaterThanOrEqual(0);
        expect(data.engagement_score).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('Session Tracking', () => {
    it('should increment session count on re-watch', async () => {
      // First watch
      await supabase.rpc('save_video_progress', {
        p_user_id: testUserId,
        p_topic_id: testTopicId,
        p_enrollment_id: testEnrollmentId,
        p_last_position_seconds: 100,
        p_video_duration_seconds: 600,
        p_video_url: 'https://example.com/video.mp4',
        p_video_provider: 'direct',
        p_watch_time_increment: 10,
      });

      // Second watch (different position)
      await supabase.rpc('save_video_progress', {
        p_user_id: testUserId,
        p_topic_id: testTopicId,
        p_enrollment_id: testEnrollmentId,
        p_last_position_seconds: 200,
        p_video_duration_seconds: 600,
        p_video_url: 'https://example.com/video.mp4',
        p_video_provider: 'direct',
        p_watch_time_increment: 10,
      });

      const { data: progress } = await supabase.rpc('get_video_progress', {
        p_user_id: testUserId,
        p_topic_id: testTopicId,
      });

      expect(progress?.[0]?.session_count).toBeGreaterThan(1);
    });
  });

  describe('Video Provider Types', () => {
    it('should accept vimeo provider', async () => {
      const { error } = await supabase.rpc('save_video_progress', {
        p_user_id: testUserId,
        p_topic_id: testTopicId,
        p_enrollment_id: testEnrollmentId,
        p_last_position_seconds: 60,
        p_video_duration_seconds: 600,
        p_video_url: 'https://vimeo.com/12345',
        p_video_provider: 'vimeo',
        p_watch_time_increment: 10,
      });

      expect(error).toBeNull();
    });

    it('should accept youtube provider', async () => {
      const { error } = await supabase.rpc('save_video_progress', {
        p_user_id: testUserId,
        p_topic_id: testTopicId,
        p_enrollment_id: testEnrollmentId,
        p_last_position_seconds: 60,
        p_video_duration_seconds: 600,
        p_video_url: 'https://youtube.com/watch?v=abc123',
        p_video_provider: 'youtube',
        p_watch_time_increment: 10,
      });

      expect(error).toBeNull();
    });

    it('should accept s3 provider', async () => {
      const { error } = await supabase.rpc('save_video_progress', {
        p_user_id: testUserId,
        p_topic_id: testTopicId,
        p_enrollment_id: testEnrollmentId,
        p_last_position_seconds: 60,
        p_video_duration_seconds: 600,
        p_video_url: 'https://s3.amazonaws.com/bucket/video.mp4',
        p_video_provider: 's3',
        p_watch_time_increment: 10,
      });

      expect(error).toBeNull();
    });
  });
});
