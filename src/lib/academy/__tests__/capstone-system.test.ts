/**
 * Capstone Project System Tests
 * Story: ACAD-012
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

describe('Capstone Project System', () => {
  let testUserId: string;
  let testReviewerId: string;
  let testTrainerId: string;
  let testCourseId: string;
  let testModuleId: string;
  let testTopicId: string;
  let testEnrollmentId: string;
  let testSubmissionId: string;

  beforeAll(async () => {
    // Create test users
    const { data: student } = await supabase
      .from('user_profiles')
      .insert({
        email: 'capstone-student@example.com',
        full_name: 'Capstone Test Student',
      })
      .select('id')
      .single();

    testUserId = student!.id;

    const { data: reviewer } = await supabase
      .from('user_profiles')
      .insert({
        email: 'capstone-reviewer@example.com',
        full_name: 'Capstone Test Reviewer',
      })
      .select('id')
      .single();

    testReviewerId = reviewer!.id;

    const { data: trainer } = await supabase
      .from('user_profiles')
      .insert({
        email: 'capstone-trainer@example.com',
        full_name: 'Capstone Test Trainer',
      })
      .select('id')
      .single();

    testTrainerId = trainer!.id;

    // Create test course
    const { data: course } = await supabase
      .from('courses')
      .insert({
        slug: 'test-capstone-course',
        title: 'Test Capstone Course',
        description: 'Testing capstone system',
        estimated_duration_weeks: 8,
        skill_level: 'intermediate',
      })
      .select('id')
      .single();

    testCourseId = course!.id;

    // Create test module and topic (for completion tracking)
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

    const { data: topic } = await supabase
      .from('module_topics')
      .insert({
        module_id: testModuleId,
        slug: 'test-topic',
        title: 'Test Topic',
        topic_number: 1,
        content_type: 'reading',
      })
      .select('id')
      .single();

    testTopicId = topic!.id;

    // Create enrollments for student and reviewer
    const { data: enrollment } = await supabase.rpc('enroll_student', {
      p_user_id: testUserId,
      p_course_id: testCourseId,
      p_payment_id: 'test_capstone_payment',
      p_payment_amount: 99.0,
      p_payment_type: 'free',
    });

    testEnrollmentId = enrollment as string;

    await supabase.rpc('enroll_student', {
      p_user_id: testReviewerId,
      p_course_id: testCourseId,
      p_payment_id: 'test_reviewer_payment',
      p_payment_amount: 99.0,
      p_payment_type: 'free',
    });

    // Complete the topic for 100% progress
    await supabase.rpc('complete_topic', {
      p_user_id: testUserId,
      p_enrollment_id: testEnrollmentId,
      p_topic_id: testTopicId,
      p_time_spent_seconds: 3600,
    });
  });

  afterAll(async () => {
    // Cleanup
    await supabase.from('peer_reviews').delete().eq('reviewer_id', testReviewerId);
    await supabase.from('capstone_submissions').delete().eq('user_id', testUserId);
    await supabase.from('xp_transactions').delete().eq('user_id', testUserId);
    await supabase.from('topic_completions').delete().eq('user_id', testUserId);
    await supabase.from('student_enrollments').delete().eq('user_id', testUserId);
    await supabase.from('student_enrollments').delete().eq('user_id', testReviewerId);
    await supabase.from('module_topics').delete().eq('id', testTopicId);
    await supabase.from('course_modules').delete().eq('id', testModuleId);
    await supabase.from('courses').delete().eq('id', testCourseId);
    await supabase.from('user_profiles').delete().eq('id', testUserId);
    await supabase.from('user_profiles').delete().eq('id', testReviewerId);
    await supabase.from('user_profiles').delete().eq('id', testTrainerId);
  });

  describe('Capstone Submission', () => {
    it('should submit a capstone project', async () => {
      const { data: submissionId, error } = await supabase.rpc('submit_capstone', {
        p_user_id: testUserId,
        p_enrollment_id: testEnrollmentId,
        p_course_id: testCourseId,
        p_repository_url: 'https://github.com/test/capstone-project',
        p_demo_video_url: 'https://youtube.com/watch?v=test',
        p_description: 'My awesome capstone project',
      });

      expect(error).toBeNull();
      expect(submissionId).toBeTruthy();

      testSubmissionId = submissionId as string;

      // Verify submission was created
      const { data: submission } = await supabase
        .from('capstone_submissions')
        .select('*')
        .eq('id', testSubmissionId)
        .single();

      expect(submission?.user_id).toBe(testUserId);
      expect(submission?.enrollment_id).toBe(testEnrollmentId);
      expect(submission?.course_id).toBe(testCourseId);
      expect(submission?.repository_url).toBe('https://github.com/test/capstone-project');
      expect(submission?.status).toBe('pending');
      expect(submission?.revision_count).toBe(0);
    });

    it('should get capstone submissions', async () => {
      const { data: submissions, error } = await supabase.rpc(
        'get_capstone_submissions',
        {
          p_user_id: testUserId,
          p_course_id: null,
          p_status: null,
          p_limit: 20,
          p_offset: 0,
        }
      );

      expect(error).toBeNull();
      expect(submissions).toBeInstanceOf(Array);
      expect(submissions!.length).toBeGreaterThanOrEqual(1);
      expect(submissions![0].user_id).toBe(testUserId);
    });
  });

  describe('Peer Review', () => {
    it('should submit a peer review', async () => {
      const { data: reviewId, error } = await supabase.rpc('submit_peer_review', {
        p_submission_id: testSubmissionId,
        p_reviewer_id: testReviewerId,
        p_rating: 5,
        p_comments: 'Excellent work! Very well implemented.',
        p_strengths: 'Clean code, good documentation',
        p_improvements: 'Could add more tests',
      });

      expect(error).toBeNull();
      expect(reviewId).toBeTruthy();

      // Verify review was created
      const { data: review } = await supabase
        .from('peer_reviews')
        .select('*')
        .eq('id', reviewId)
        .single();

      expect(review?.submission_id).toBe(testSubmissionId);
      expect(review?.reviewer_id).toBe(testReviewerId);
      expect(review?.rating).toBe(5);
    });

    it('should update submission peer review stats', async () => {
      // Wait for trigger to process
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const { data: submission } = await supabase
        .from('capstone_submissions')
        .select('*')
        .eq('id', testSubmissionId)
        .single();

      expect(submission?.peer_review_count).toBe(1);
      expect(submission?.avg_peer_rating).toBe(5);
    });

    it('should prevent self-review', async () => {
      const { error } = await supabase.rpc('submit_peer_review', {
        p_submission_id: testSubmissionId,
        p_reviewer_id: testUserId, // Same as submitter
        p_rating: 5,
        p_comments: 'Great work!',
      });

      expect(error).not.toBeNull();
      expect(error?.message).toContain('Cannot review your own submission');
    });

    it('should get peer reviews for submission', async () => {
      const { data: reviews, error } = await supabase.rpc(
        'get_peer_reviews_for_submission',
        {
          p_submission_id: testSubmissionId,
        }
      );

      expect(error).toBeNull();
      expect(reviews).toBeInstanceOf(Array);
      expect(reviews!.length).toBe(1);
      expect(reviews![0].reviewer_id).toBe(testReviewerId);
    });

    it('should get submissions available for peer review', async () => {
      const { data: submissions, error } = await supabase.rpc(
        'get_submissions_for_peer_review',
        {
          p_reviewer_id: testReviewerId,
          p_course_id: testCourseId,
          p_limit: 10,
        }
      );

      expect(error).toBeNull();
      expect(submissions).toBeInstanceOf(Array);
      // Should include the submission (already reviewed is tracked separately)
      const found = submissions!.find((s: { id: string }) => s.id === testSubmissionId);
      expect(found).toBeTruthy();
      expect(found).toHaveProperty('already_reviewed', true);
    });
  });

  describe('Trainer Grading', () => {
    it('should grade capstone as passed', async () => {
      const { data: success, error } = await supabase.rpc('grade_capstone', {
        p_submission_id: testSubmissionId,
        p_grader_id: testTrainerId,
        p_grade: 95,
        p_feedback: 'Outstanding work! All requirements met and exceeded expectations.',
        p_rubric_scores: {
          functionality: 30,
          codeQuality: 25,
          documentation: 15,
          testing: 13,
          userExperience: 10,
          innovation: 2,
        },
        p_status: 'passed',
      });

      expect(error).toBeNull();
      expect(success).toBe(true);

      // Verify submission was updated
      const { data: submission } = await supabase
        .from('capstone_submissions')
        .select('*')
        .eq('id', testSubmissionId)
        .single();

      expect(submission?.status).toBe('passed');
      expect(submission?.graded_by).toBe(testTrainerId);
      expect(submission?.grade).toBe(95);
      expect(submission?.rubric_scores).toBeTruthy();
    });

    it('should award XP for passing capstone', async () => {
      const { data: transactions } = await supabase
        .from('xp_transactions')
        .select('*')
        .eq('user_id', testUserId)
        .eq('source_type', 'capstone')
        .eq('source_id', testSubmissionId);

      expect(transactions).toBeInstanceOf(Array);
      expect(transactions!.length).toBe(1);
      expect(transactions![0].amount).toBe(100); // Capstone XP reward
      expect(transactions![0].reason).toContain('Capstone project passed');
    });
  });

  describe('Graduation Eligibility', () => {
    it('should check graduation eligibility', async () => {
      const { data: eligible, error } = await supabase.rpc(
        'check_graduation_eligibility',
        {
          p_enrollment_id: testEnrollmentId,
        }
      );

      expect(error).toBeNull();
      expect(eligible).toBe(true); // Capstone passed and 100% progress
    });

    it('should trigger graduation', async () => {
      const { data: success, error } = await supabase.rpc('trigger_graduation', {
        p_enrollment_id: testEnrollmentId,
      });

      expect(error).toBeNull();
      expect(success).toBe(true);

      // Verify enrollment status updated
      const { data: enrollment } = await supabase
        .from('student_enrollments')
        .select('*')
        .eq('id', testEnrollmentId)
        .single();

      expect(enrollment?.status).toBe('completed');
      expect(enrollment?.completed_at).toBeTruthy();
    });

    it('should grant candidate role on graduation', async () => {
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('*, roles(*)')
        .eq('user_id', testUserId);

      const candidateRole = userRoles?.find(
        (ur: { roles: { name: string } }) => ur.roles.name === 'candidate'
      );
      expect(candidateRole).toBeTruthy();
    });
  });

  describe('Revision Workflow', () => {
    let revisionSubmissionId: string;

    beforeAll(async () => {
      // Create a new enrollment for revision testing
      const { data: newStudent } = await supabase
        .from('user_profiles')
        .insert({
          email: 'revision-student@example.com',
          full_name: 'Revision Test Student',
        })
        .select('id')
        .single();

      const { data: newEnrollment } = await supabase.rpc('enroll_student', {
        p_user_id: newStudent!.id,
        p_course_id: testCourseId,
        p_payment_id: 'test_revision_payment',
        p_payment_amount: 99.0,
        p_payment_type: 'free',
      });

      // Complete topic for 100% progress
      await supabase.rpc('complete_topic', {
        p_user_id: newStudent!.id,
        p_enrollment_id: newEnrollment,
        p_topic_id: testTopicId,
        p_time_spent_seconds: 3600,
      });

      // Submit initial capstone
      const { data: submissionId } = await supabase.rpc('submit_capstone', {
        p_user_id: newStudent!.id,
        p_enrollment_id: newEnrollment,
        p_course_id: testCourseId,
        p_repository_url: 'https://github.com/test/revision-project',
      });

      revisionSubmissionId = submissionId as string;
    });

    it('should request revision', async () => {
      const { data: success, error } = await supabase.rpc('grade_capstone', {
        p_submission_id: revisionSubmissionId,
        p_grader_id: testTrainerId,
        p_grade: 65,
        p_feedback: 'Good start, but needs more work on documentation and testing.',
        p_rubric_scores: {
          functionality: 25,
          codeQuality: 20,
          documentation: 8,
          testing: 7,
          userExperience: 5,
          innovation: 0,
        },
        p_status: 'revision_requested',
      });

      expect(error).toBeNull();
      expect(success).toBe(true);

      const { data: submission } = await supabase
        .from('capstone_submissions')
        .select('*')
        .eq('id', revisionSubmissionId)
        .single();

      expect(submission?.status).toBe('revision_requested');
      expect(submission?.grade).toBe(65);
    });

    it('should track revision count on resubmission', async () => {
      const { data: submission } = await supabase
        .from('capstone_submissions')
        .select('enrollment_id, user_id')
        .eq('id', revisionSubmissionId)
        .single();

      // Resubmit
      const { data: newSubmissionId } = await supabase.rpc('submit_capstone', {
        p_user_id: submission!.user_id,
        p_enrollment_id: submission!.enrollment_id,
        p_course_id: testCourseId,
        p_repository_url: 'https://github.com/test/revision-project-v2',
      });

      const { data: newSubmission } = await supabase
        .from('capstone_submissions')
        .select('*')
        .eq('id', newSubmissionId)
        .single();

      expect(newSubmission?.revision_count).toBe(1);
    });
  });

  describe('Statistics and Views', () => {
    it('should query capstone_statistics view', async () => {
      const { data: stats, error } = await supabase
        .from('capstone_statistics')
        .select('*')
        .eq('course_id', testCourseId)
        .single();

      expect(error).toBeNull();
      expect(stats).toBeTruthy();
      expect(stats!.total_submissions).toBeGreaterThanOrEqual(1);
      expect(stats!.passed_count).toBeGreaterThanOrEqual(1);
    });

    it('should query capstone_grading_queue view', async () => {
      const { data: queue, error } = await supabase
        .from('capstone_grading_queue')
        .select('*');

      expect(error).toBeNull();
      expect(queue).toBeInstanceOf(Array);
      // Queue should include pending submissions
    });

    it('should query peer_review_leaderboard view', async () => {
      const { data: leaderboard, error } = await supabase
        .from('peer_review_leaderboard')
        .select('*')
        .order('reviews_completed', { ascending: false })
        .limit(10);

      expect(error).toBeNull();
      expect(leaderboard).toBeInstanceOf(Array);

      if (leaderboard!.length > 0) {
        expect(leaderboard![0].reviewer_id).toBe(testReviewerId);
        expect(leaderboard![0].reviews_completed).toBe(1);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing enrollment', async () => {
      const { error } = await supabase.rpc('submit_capstone', {
        p_user_id: testUserId,
        p_enrollment_id: '00000000-0000-0000-0000-000000000000',
        p_course_id: testCourseId,
        p_repository_url: 'https://github.com/test/invalid',
      });

      expect(error).not.toBeNull();
      expect(error?.message).toContain('Invalid or inactive enrollment');
    });

    it('should handle invalid submission ID for grading', async () => {
      const { error } = await supabase.rpc('grade_capstone', {
        p_submission_id: '00000000-0000-0000-0000-000000000000',
        p_grader_id: testTrainerId,
        p_grade: 85,
        p_feedback: 'Great work!',
        p_status: 'passed',
      });

      expect(error).not.toBeNull();
      expect(error?.message).toContain('Submission not found');
    });

    it('should prevent non-enrolled user from peer reviewing', async () => {
      const { data: outsider } = await supabase
        .from('user_profiles')
        .insert({
          email: 'outsider@example.com',
          full_name: 'Outsider User',
        })
        .select('id')
        .single();

      const { error } = await supabase.rpc('submit_peer_review', {
        p_submission_id: testSubmissionId,
        p_reviewer_id: outsider!.id,
        p_rating: 5,
        p_comments: 'Attempting to review without enrollment',
      });

      expect(error).not.toBeNull();
      expect(error?.message).toContain('Must be enrolled in the same course');

      await supabase.from('user_profiles').delete().eq('id', outsider!.id);
    });
  });
});
