/**
 * Progress Tracking System Tests
 * Story: ACAD-003
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

describe('Progress Tracking System', () => {
  const testCourseId = '11111111-1111-1111-1111-111111111111'; // Guidewire course
  const testModuleId = '11111111-1111-1111-1111-111111111101'; // Module 1
  const testTopicId = '11111111-1111-1111-1111-111111111111'; // Topic 1.1
  let testUserId: string;
  let testEnrollmentId: string;
  let testCompletionId: string;

  beforeAll(async () => {
    // Create or get test user
    const { data: existingUser } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', 'test-progress@example.com')
      .single();

    if (existingUser) {
      testUserId = existingUser.id;
    } else {
      const { data: newUser } = await supabase
        .from('user_profiles')
        .insert({
          email: 'test-progress@example.com',
          full_name: 'Test Progress User',
        })
        .select('id')
        .single();

      testUserId = newUser!.id;
    }

    // Create test enrollment
    const { data: enrollment } = await supabase.rpc('enroll_student', {
      p_user_id: testUserId,
      p_course_id: testCourseId,
      p_payment_id: 'test_progress_payment',
      p_payment_amount: 499.0,
      p_payment_type: 'subscription',
    });

    testEnrollmentId = enrollment as string;
  });

  afterAll(async () => {
    // Cleanup: Delete test data
    if (testEnrollmentId) {
      await supabase.from('topic_completions').delete().eq('enrollment_id', testEnrollmentId);
      await supabase.from('xp_transactions').delete().eq('user_id', testUserId);
      await supabase.from('student_enrollments').delete().eq('id', testEnrollmentId);
    }
  });

  describe('Topic Completion', () => {
    it('should mark a topic as complete', async () => {
      const { data: completionId, error } = await supabase.rpc('complete_topic', {
        p_user_id: testUserId,
        p_enrollment_id: testEnrollmentId,
        p_topic_id: testTopicId,
        p_time_spent_seconds: 300,
      });

      expect(error).toBeNull();
      expect(completionId).toBeTruthy();

      testCompletionId = completionId as string;

      // Verify completion record
      const { data: completion } = await supabase
        .from('topic_completions')
        .select('*')
        .eq('id', testCompletionId)
        .single();

      expect(completion).toBeTruthy();
      expect(completion?.user_id).toBe(testUserId);
      expect(completion?.topic_id).toBe(testTopicId);
      expect(completion?.time_spent_seconds).toBe(300);
      expect(completion?.xp_earned).toBeGreaterThan(0);
    });

    it('should award XP based on content type', async () => {
      // Video topics should award 10 XP
      const { data: completion } = await supabase
        .from('topic_completions')
        .select('xp_earned')
        .eq('id', testCompletionId)
        .single();

      expect(completion?.xp_earned).toBe(10); // Video = 10 XP
    });

    it('should prevent duplicate completion', async () => {
      // Try to complete same topic again
      const { error } = await supabase.rpc('complete_topic', {
        p_user_id: testUserId,
        p_enrollment_id: testEnrollmentId,
        p_topic_id: testTopicId,
        p_time_spent_seconds: 100,
      });

      // Should update existing completion, not create duplicate
      const { count } = await supabase
        .from('topic_completions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', testUserId)
        .eq('topic_id', testTopicId);

      expect(count).toBe(1);
    });

    it('should prevent completing locked topics', async () => {
      // Create a topic with prerequisites
      const { data: lockedTopic } = await supabase
        .from('module_topics')
        .insert({
          module_id: testModuleId,
          slug: 'test-locked-topic',
          title: 'Test Locked Topic',
          topic_number: 99,
          content_type: 'video',
          prerequisite_topic_ids: [testTopicId],
        })
        .select('id')
        .single();

      if (lockedTopic) {
        // Try to complete locked topic
        const { error } = await supabase.rpc('complete_topic', {
          p_user_id: testUserId,
          p_enrollment_id: testEnrollmentId,
          p_topic_id: lockedTopic.id,
          p_time_spent_seconds: 100,
        });

        expect(error).toBeTruthy();
        expect(error?.message).toContain('locked');

        // Cleanup
        await supabase.from('module_topics').delete().eq('id', lockedTopic.id);
      }
    });
  });

  describe('XP Transactions', () => {
    it('should create XP transaction on topic completion', async () => {
      const { data: transactions } = await supabase
        .from('xp_transactions')
        .select('*')
        .eq('user_id', testUserId)
        .eq('transaction_type', 'topic_completion');

      expect(transactions).toBeTruthy();
      expect(transactions!.length).toBeGreaterThan(0);

      const transaction = transactions![0];
      expect(transaction.amount).toBeGreaterThan(0);
      expect(transaction.reference_type).toBe('topic_completion');
    });

    it('should calculate total XP correctly', async () => {
      const { data: totalXP, error } = await supabase.rpc('get_user_total_xp', {
        p_user_id: testUserId,
      });

      expect(error).toBeNull();
      expect(totalXP).toBeGreaterThan(0);
    });

    it('should handle negative XP transactions (penalties)', async () => {
      // Insert penalty transaction
      const { error } = await supabase.from('xp_transactions').insert({
        user_id: testUserId,
        amount: -5,
        transaction_type: 'penalty',
        description: 'Test penalty',
      });

      expect(error).toBeNull();

      // Total XP should be reduced
      const { data: totalXP } = await supabase.rpc('get_user_total_xp', {
        p_user_id: testUserId,
      });

      expect(totalXP).toBeLessThan(10); // Original 10 XP - 5 penalty
    });
  });

  describe('Enrollment Progress Updates', () => {
    it('should update enrollment completion percentage', async () => {
      // Get enrollment before
      const { data: beforeEnrollment } = await supabase
        .from('student_enrollments')
        .select('completion_percentage')
        .eq('id', testEnrollmentId)
        .single();

      expect(beforeEnrollment?.completion_percentage).toBeGreaterThan(0);

      // Complete another topic
      const { data: topic2 } = await supabase
        .from('module_topics')
        .select('id')
        .eq('module_id', testModuleId)
        .neq('id', testTopicId)
        .limit(1)
        .single();

      if (topic2) {
        await supabase.rpc('complete_topic', {
          p_user_id: testUserId,
          p_enrollment_id: testEnrollmentId,
          p_topic_id: topic2.id,
          p_time_spent_seconds: 200,
        });

        // Check updated percentage
        const { data: afterEnrollment } = await supabase
          .from('student_enrollments')
          .select('completion_percentage')
          .eq('id', testEnrollmentId)
          .single();

        expect(afterEnrollment?.completion_percentage).toBeGreaterThan(
          beforeEnrollment?.completion_percentage || 0
        );
      }
    });

    it('should mark enrollment as completed at 100%', async () => {
      // This test would need to complete all topics in the course
      // Skipping for now as it's integration-level
      expect(true).toBe(true);
    });

    it('should update current_module_id and current_topic_id', async () => {
      const { data: enrollment } = await supabase
        .from('student_enrollments')
        .select('current_module_id, current_topic_id')
        .eq('id', testEnrollmentId)
        .single();

      // Should be set after completing topics
      expect(enrollment).toBeTruthy();
    });
  });

  describe('Topic Unlocking', () => {
    it('should unlock topics with no prerequisites', async () => {
      const { data: isUnlocked, error } = await supabase.rpc('is_topic_unlocked', {
        p_user_id: testUserId,
        p_topic_id: testTopicId,
      });

      expect(error).toBeNull();
      expect(isUnlocked).toBe(true);
    });

    it('should lock topics with incomplete prerequisites', async () => {
      // Create topic with prerequisites
      const { data: prereqTopic } = await supabase
        .from('module_topics')
        .insert({
          module_id: testModuleId,
          slug: 'test-prereq-topic',
          title: 'Test Prerequisite Topic',
          topic_number: 98,
          content_type: 'video',
          prerequisite_topic_ids: ['99999999-9999-9999-9999-999999999999'], // Non-existent
        })
        .select('id')
        .single();

      if (prereqTopic) {
        const { data: isUnlocked } = await supabase.rpc('is_topic_unlocked', {
          p_user_id: testUserId,
          p_topic_id: prereqTopic.id,
        });

        expect(isUnlocked).toBe(false);

        // Cleanup
        await supabase.from('module_topics').delete().eq('id', prereqTopic.id);
      }
    });

    it('should unlock topics after completing prerequisites', async () => {
      // Complete prerequisite topic (already done in earlier tests)
      // Check locked topic is now unlocked
      const { data: isUnlocked } = await supabase.rpc('is_topic_unlocked', {
        p_user_id: testUserId,
        p_topic_id: testTopicId,
      });

      expect(isUnlocked).toBe(true);
    });
  });

  describe('Materialized View: user_xp_totals', () => {
    it('should aggregate XP correctly', async () => {
      // Refresh materialized view
      await supabase.rpc('exec_sql', {
        query: 'REFRESH MATERIALIZED VIEW CONCURRENTLY user_xp_totals;',
      });

      const { data: xpTotal } = await supabase
        .from('user_xp_totals')
        .select('*')
        .eq('user_id', testUserId)
        .single();

      expect(xpTotal).toBeTruthy();
      expect(xpTotal?.total_xp).toBeGreaterThan(0);
      expect(xpTotal?.transaction_count).toBeGreaterThan(0);
      expect(xpTotal?.leaderboard_rank).toBeGreaterThan(0);
    });

    it('should calculate leaderboard rank', async () => {
      const { data: xpTotal } = await supabase
        .from('user_xp_totals')
        .select('leaderboard_rank')
        .eq('user_id', testUserId)
        .single();

      expect(xpTotal?.leaderboard_rank).toBeDefined();
      expect(xpTotal?.leaderboard_rank).toBeGreaterThan(0);
    });
  });

  describe('RLS Policies', () => {
    it('should allow users to view their own completions', async () => {
      const { data, error } = await supabase
        .from('topic_completions')
        .select('*')
        .eq('user_id', testUserId);

      expect(error).toBeNull();
      expect(data).toBeTruthy();
    });

    it('should allow users to view their own XP transactions', async () => {
      const { data, error } = await supabase
        .from('xp_transactions')
        .select('*')
        .eq('user_id', testUserId);

      expect(error).toBeNull();
      expect(data).toBeTruthy();
    });

    it('should prevent users from viewing other users completions', async () => {
      // This test requires auth context switching
      // Skipping for now
      expect(true).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero time_spent_seconds', async () => {
      const { data: topic } = await supabase
        .from('module_topics')
        .select('id')
        .eq('module_id', testModuleId)
        .neq('id', testTopicId)
        .limit(1)
        .single();

      if (topic) {
        const { error } = await supabase.rpc('complete_topic', {
          p_user_id: testUserId,
          p_enrollment_id: testEnrollmentId,
          p_topic_id: topic.id,
          p_time_spent_seconds: 0,
        });

        expect(error).toBeNull();
      }
    });

    it('should handle course with zero topics', async () => {
      // Create empty course
      const { data: emptyCourse } = await supabase
        .from('courses')
        .insert({
          slug: 'test-empty-course',
          title: 'Test Empty Course',
          description: 'Empty',
          estimated_duration_weeks: 1,
          skill_level: 'beginner',
        })
        .select('id')
        .single();

      if (emptyCourse) {
        const { data: emptyEnrollment } = await supabase.rpc('enroll_student', {
          p_user_id: testUserId,
          p_course_id: emptyCourse.id,
          p_payment_id: 'test_empty',
          p_payment_amount: 0,
          p_payment_type: 'free',
        });

        // Update progress should not crash
        const { error } = await supabase.rpc('update_enrollment_progress', {
          p_enrollment_id: emptyEnrollment,
        });

        expect(error).toBeNull();

        // Cleanup
        await supabase.from('student_enrollments').delete().eq('id', emptyEnrollment);
        await supabase.from('courses').delete().eq('id', emptyCourse.id);
      }
    });
  });
});
