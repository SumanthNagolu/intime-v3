/**
 * Lab Environments Tests
 * Story: ACAD-008
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

describe('Lab Environments System', () => {
  let testUserId: string;
  let testCourseId: string;
  let testModuleId: string;
  let testTopicId: string;
  let testEnrollmentId: string;
  let testInstanceId: string;
  let testSubmissionId: string;

  beforeAll(async () => {
    // Create test user
    const { data: user } = await supabase
      .from('user_profiles')
      .insert({
        email: 'test-lab@example.com',
        full_name: 'Test Lab User',
      })
      .select('id')
      .single();

    testUserId = user!.id;

    // Create test course
    const { data: course } = await supabase
      .from('courses')
      .insert({
        slug: 'test-lab-course',
        title: 'Test Lab Course',
        description: 'Testing lab environments',
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

    // Create test topic (lab type)
    const { data: topic } = await supabase
      .from('module_topics')
      .insert({
        module_id: testModuleId,
        slug: 'test-lab-topic',
        title: 'Test Lab Topic',
        topic_number: 1,
        content_type: 'lab',
      })
      .select('id')
      .single();

    testTopicId = topic!.id;

    // Create enrollment
    const { data: enrollment } = await supabase.rpc('enroll_student', {
      p_user_id: testUserId,
      p_course_id: testCourseId,
      p_payment_id: 'test_lab_payment',
      p_payment_amount: 99.0,
      p_payment_type: 'free',
    });

    testEnrollmentId = enrollment as string;
  });

  afterAll(async () => {
    // Cleanup
    if (testSubmissionId) {
      await supabase.from('lab_submissions').delete().eq('id', testSubmissionId);
    }
    if (testInstanceId) {
      await supabase.from('lab_instances').delete().eq('id', testInstanceId);
    }
    await supabase.from('topic_completions').delete().eq('user_id', testUserId);
    await supabase.from('xp_transactions').delete().eq('user_id', testUserId);
    await supabase.from('student_enrollments').delete().eq('id', testEnrollmentId);
    await supabase.from('module_topics').delete().eq('id', testTopicId);
    await supabase.from('course_modules').delete().eq('id', testModuleId);
    await supabase.from('courses').delete().eq('id', testCourseId);
    await supabase.from('user_profiles').delete().eq('id', testUserId);
  });

  describe('Lab Instance Management', () => {
    it('should start a new lab instance', async () => {
      const { data: instanceId, error } = await supabase.rpc('start_lab_instance', {
        p_user_id: testUserId,
        p_topic_id: testTopicId,
        p_enrollment_id: testEnrollmentId,
        p_forked_repo_url: 'https://github.com/test/lab-fork',
        p_original_template_url: 'https://github.com/template/lab',
        p_time_limit_minutes: 120,
        p_github_username: 'testuser',
      });

      expect(error).toBeNull();
      expect(instanceId).toBeTruthy();

      testInstanceId = instanceId;
    });

    it('should prevent duplicate active instances', async () => {
      const { error } = await supabase.rpc('start_lab_instance', {
        p_user_id: testUserId,
        p_topic_id: testTopicId,
        p_enrollment_id: testEnrollmentId,
        p_forked_repo_url: 'https://github.com/test/lab-fork-2',
        p_original_template_url: 'https://github.com/template/lab',
        p_time_limit_minutes: 120,
        p_github_username: 'testuser',
      });

      expect(error).toBeTruthy();
      expect(error?.message).toContain('already has an active lab instance');
    });

    it('should get active lab instance', async () => {
      const { data, error } = await supabase.rpc('get_active_lab_instance', {
        p_user_id: testUserId,
        p_topic_id: testTopicId,
      });

      expect(error).toBeNull();
      expect(data).toBeTruthy();
      expect(data?.[0]?.instance_id).toBe(testInstanceId);
      expect(data?.[0]?.forked_repo_url).toBe('https://github.com/test/lab-fork');
    });

    it('should calculate time remaining', async () => {
      const { data } = await supabase.rpc('get_active_lab_instance', {
        p_user_id: testUserId,
        p_topic_id: testTopicId,
      });

      expect(data?.[0]?.time_remaining_seconds).toBeGreaterThan(0);
    });

    it('should update lab activity', async () => {
      const { data: success, error } = await supabase.rpc('update_lab_activity', {
        p_instance_id: testInstanceId,
        p_time_increment_seconds: 60,
      });

      expect(error).toBeNull();
      expect(success).toBe(true);
    });
  });

  describe('Lab Submissions', () => {
    it('should submit a lab', async () => {
      const { data: submissionId, error } = await supabase.rpc('submit_lab', {
        p_user_id: testUserId,
        p_topic_id: testTopicId,
        p_enrollment_id: testEnrollmentId,
        p_lab_instance_id: testInstanceId,
        p_repository_url: 'https://github.com/test/lab-fork',
        p_commit_sha: 'abc123',
        p_branch_name: 'main',
      });

      expect(error).toBeNull();
      expect(submissionId).toBeTruthy();

      testSubmissionId = submissionId;
    });

    it('should mark lab instance as submitted', async () => {
      const { data: instance } = await supabase
        .from('lab_instances')
        .select('status')
        .eq('id', testInstanceId)
        .single();

      expect(instance?.status).toBe('submitted');
    });

    it('should record auto-grade result', async () => {
      const autoGradeResult = {
        testsPassed: 8,
        testsFailed: 2,
        totalTests: 10,
        coverage: 85,
        buildSuccess: true,
      };

      const { data: passed, error } = await supabase.rpc('record_auto_grade', {
        p_submission_id: testSubmissionId,
        p_auto_grade_result: autoGradeResult,
        p_auto_grade_score: 80,
        p_passed: true,
      });

      expect(error).toBeNull();
      expect(passed).toBe(true);

      // Verify submission updated
      const { data: submission } = await supabase
        .from('lab_submissions')
        .select('auto_grade_score, status, passed')
        .eq('id', testSubmissionId)
        .single();

      expect(submission?.auto_grade_score).toBe(80);
      expect(submission?.passed).toBe(true);
    });

    it('should record manual grade', async () => {
      const rubricScores = {
        code_quality: 85,
        functionality: 90,
        documentation: 75,
        testing: 80,
      };

      const { data: passed, error } = await supabase.rpc('record_manual_grade', {
        p_submission_id: testSubmissionId,
        p_grader_id: testUserId,
        p_manual_score: 85,
        p_rubric_scores: rubricScores,
        p_feedback: 'Great work! Clean code and good test coverage.',
        p_passed: true,
      });

      expect(error).toBeNull();
      expect(passed).toBe(true);

      // Verify submission updated
      const { data: submission } = await supabase
        .from('lab_submissions')
        .select('manual_grade_score, rubric_scores, feedback, final_score')
        .eq('id', testSubmissionId)
        .single();

      expect(submission?.manual_grade_score).toBe(85);
      expect(submission?.rubric_scores).toEqual(rubricScores);
      expect(submission?.feedback).toBeTruthy();
      expect(submission?.final_score).toBeGreaterThan(0);
    });

    it('should get submission history', async () => {
      const { data, error } = await supabase.rpc('get_lab_submission_history', {
        p_user_id: testUserId,
        p_topic_id: testTopicId,
      });

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
      expect(data?.length).toBeGreaterThan(0);
      expect(data?.[0]?.submission_id).toBe(testSubmissionId);
    });
  });

  describe('Lab Views', () => {
    it('should query grading_queue view', async () => {
      // Set submission to pending to appear in queue
      await supabase
        .from('lab_submissions')
        .update({ status: 'pending' })
        .eq('id', testSubmissionId);

      const { data, error } = await supabase.from('grading_queue').select('*');

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should query lab_statistics view', async () => {
      const { data, error } = await supabase
        .from('lab_statistics')
        .select('*')
        .eq('topic_id', testTopicId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeTruthy();
      expect(data?.total_students_started).toBeGreaterThan(0);
    });
  });

  describe('Lab Cleanup', () => {
    it('should expire old lab instances', async () => {
      // Manually set expiration to past
      await supabase
        .from('lab_instances')
        .update({ expires_at: new Date(Date.now() - 1000).toISOString() })
        .eq('id', testInstanceId);

      const { data: expiredCount, error } = await supabase.rpc('expire_old_lab_instances');

      expect(error).toBeNull();
      expect(expiredCount).toBeGreaterThanOrEqual(1);

      // Verify instance is expired
      const { data: instance } = await supabase
        .from('lab_instances')
        .select('status')
        .eq('id', testInstanceId)
        .single();

      expect(instance?.status).toBe('expired');
    });
  });

  describe('Lab Attempt Tracking', () => {
    it('should track attempt numbers', async () => {
      // Reset instance for second attempt
      await supabase
        .from('lab_instances')
        .update({ status: 'active', expires_at: new Date(Date.now() + 7200000).toISOString() })
        .eq('id', testInstanceId);

      // Submit again
      const { data: submission2Id } = await supabase.rpc('submit_lab', {
        p_user_id: testUserId,
        p_topic_id: testTopicId,
        p_enrollment_id: testEnrollmentId,
        p_lab_instance_id: testInstanceId,
        p_repository_url: 'https://github.com/test/lab-fork',
        p_commit_sha: 'def456',
        p_branch_name: 'main',
      });

      const { data: submission } = await supabase
        .from('lab_submissions')
        .select('attempt_number')
        .eq('id', submission2Id)
        .single();

      expect(submission?.attempt_number).toBe(2);

      // Cleanup second submission
      await supabase.from('lab_submissions').delete().eq('id', submission2Id);
    });
  });

  describe('Pass/Fail Thresholds', () => {
    it('should fail submission below 70%', async () => {
      const { data: passed } = await supabase.rpc('record_auto_grade', {
        p_submission_id: testSubmissionId,
        p_auto_grade_result: { testsPassed: 6, testsFailed: 4, totalTests: 10 },
        p_auto_grade_score: 60,
      });

      expect(passed).toBe(false);

      const { data: submission } = await supabase
        .from('lab_submissions')
        .select('status, passed')
        .eq('id', testSubmissionId)
        .single();

      expect(submission?.passed).toBe(false);
      expect(submission?.status).toBe('manual_review');
    });
  });
});
