/**
 * Quiz Engine Tests
 * Story: ACAD-011
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// TODO: Requires database setup
describe.skip('Quiz Engine System', () => {
  let testUserId: string;
  let testCourseId: string;
  let testModuleId: string;
  let testTopicId: string;
  let testEnrollmentId: string;
  let testQuestionId1: string;
  let testQuestionId2: string;
  let testQuestionId3: string;
  let testAttemptId: string;

  beforeAll(async () => {
    // Create test user
    const { data: user } = await supabase
      .from('user_profiles')
      .insert({
        email: 'test-quiz-engine@example.com',
        full_name: 'Test Quiz Engine User',
      })
      .select('id')
      .single();

    testUserId = user!.id;

    // Create test course
    const { data: course } = await supabase
      .from('courses')
      .insert({
        slug: 'test-quiz-engine-course',
        title: 'Test Quiz Engine Course',
        description: 'Testing quiz engine',
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
        slug: 'test-quiz-engine-module',
        title: 'Test Quiz Engine Module',
        module_number: 1,
      })
      .select('id')
      .single();

    testModuleId = module!.id;

    // Create test topic (quiz type)
    const { data: topic } = await supabase
      .from('module_topics')
      .insert({
        module_id: testModuleId,
        slug: 'test-quiz-engine-topic',
        title: 'Test Quiz Engine Topic',
        topic_number: 1,
        content_type: 'quiz',
      })
      .select('id')
      .single();

    testTopicId = topic!.id;

    // Create enrollment
    const { data: enrollment } = await supabase.rpc('enroll_student', {
      p_user_id: testUserId,
      p_course_id: testCourseId,
      p_payment_id: 'test_quiz_engine_payment',
      p_payment_amount: 99.0,
      p_payment_type: 'free',
    });

    testEnrollmentId = enrollment as string;

    // Create test questions
    const { data: q1 } = await supabase.rpc('create_quiz_question', {
      p_topic_id: testTopicId,
      p_question_text: 'What is 2 + 2?',
      p_question_type: 'multiple_choice_single',
      p_options: ['2', '3', '4', '5'],
      p_correct_answers: [2], // Index 2 = "4"
      p_difficulty: 'easy',
      p_points: 1,
      p_is_public: false,
      p_created_by: testUserId,
    });
    testQuestionId1 = q1 as string;

    const { data: q2 } = await supabase.rpc('create_quiz_question', {
      p_topic_id: testTopicId,
      p_question_text: 'Select all even numbers',
      p_question_type: 'multiple_choice_multiple',
      p_options: ['1', '2', '3', '4'],
      p_correct_answers: [1, 3], // Indices 1,3 = "2","4"
      p_difficulty: 'medium',
      p_points: 2,
      p_is_public: false,
      p_created_by: testUserId,
    });
    testQuestionId2 = q2 as string;

    const { data: q3 } = await supabase.rpc('create_quiz_question', {
      p_topic_id: testTopicId,
      p_question_text: 'The Earth is flat',
      p_question_type: 'true_false',
      p_options: ['True', 'False'],
      p_correct_answers: [1], // Index 1 = "False"
      p_difficulty: 'easy',
      p_points: 1,
      p_is_public: false,
      p_created_by: testUserId,
    });
    testQuestionId3 = q3 as string;

    // Create quiz settings
    await supabase.rpc('update_quiz_settings', {
      p_topic_id: testTopicId,
      p_passing_threshold: 70,
      p_xp_reward: 50,
    });
  });

  afterAll(async () => {
    // Cleanup
    await supabase.from('quiz_attempts').delete().eq('user_id', testUserId);
    await supabase.from('xp_transactions').delete().eq('user_id', testUserId);
    await supabase.from('topic_completions').delete().eq('user_id', testUserId);
    await supabase.from('quiz_questions').delete().eq('topic_id', testTopicId);
    await supabase.from('quiz_settings').delete().eq('topic_id', testTopicId);
    await supabase.from('student_enrollments').delete().eq('id', testEnrollmentId);
    await supabase.from('module_topics').delete().eq('id', testTopicId);
    await supabase.from('course_modules').delete().eq('id', testModuleId);
    await supabase.from('courses').delete().eq('id', testCourseId);
    await supabase.from('user_profiles').delete().eq('id', testUserId);
  });

  describe('Quiz Attempt Creation', () => {
    it('should start a new quiz attempt', async () => {
      const { data: attemptId, error } = await supabase.rpc('start_quiz_attempt', {
        p_user_id: testUserId,
        p_topic_id: testTopicId,
        p_enrollment_id: testEnrollmentId,
      });

      expect(error).toBeNull();
      expect(attemptId).toBeTruthy();

      testAttemptId = attemptId as string;

      // Verify attempt was created
      const { data: attempt } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('id', testAttemptId)
        .single();

      expect(attempt?.user_id).toBe(testUserId);
      expect(attempt?.topic_id).toBe(testTopicId);
      expect(attempt?.attempt_number).toBe(1);
      expect(attempt?.submitted_at).toBeNull();
    });
  });

  describe('Quiz Grading', () => {
    it('should submit and grade quiz with all correct answers (pass)', async () => {
      const { data: result, error } = await supabase.rpc('submit_quiz_attempt', {
        p_attempt_id: testAttemptId,
        p_answers: {
          [testQuestionId1]: [2], // Correct
          [testQuestionId2]: [1, 3], // Correct
          [testQuestionId3]: [1], // Correct
        },
      });

      expect(error).toBeNull();
      expect(result).toBeInstanceOf(Array);
      expect(result![0].score).toBe(100);
      expect(result![0].passed).toBe(true);
      expect(result![0].correct_answers).toBe(3);
      expect(result![0].xp_earned).toBe(50); // First pass awards XP
    });

    it('should grade quiz with some wrong answers (fail)', async () => {
      // Start new attempt
      const { data: attemptId2 } = await supabase.rpc('start_quiz_attempt', {
        p_user_id: testUserId,
        p_topic_id: testTopicId,
        p_enrollment_id: testEnrollmentId,
      });

      const { data: result, error } = await supabase.rpc('submit_quiz_attempt', {
        p_attempt_id: attemptId2,
        p_answers: {
          [testQuestionId1]: [0], // Wrong
          [testQuestionId2]: [1], // Partially wrong
          [testQuestionId3]: [1], // Correct
        },
      });

      expect(error).toBeNull();
      expect(result![0].score).toBeLessThan(70);
      expect(result![0].passed).toBe(false);
      expect(result![0].xp_earned).toBe(0); // No XP on fail
    });
  });

  describe('XP Award Logic', () => {
    it('should award XP only on first pass', async () => {
      // Start third attempt
      const { data: attemptId3 } = await supabase.rpc('start_quiz_attempt', {
        p_user_id: testUserId,
        p_topic_id: testTopicId,
        p_enrollment_id: testEnrollmentId,
      });

      // Submit with all correct answers
      const { data: result } = await supabase.rpc('submit_quiz_attempt', {
        p_attempt_id: attemptId3,
        p_answers: {
          [testQuestionId1]: [2],
          [testQuestionId2]: [1, 3],
          [testQuestionId3]: [1],
        },
      });

      // Should pass but not award XP (already passed once)
      expect(result![0].passed).toBe(true);
      expect(result![0].xp_earned).toBe(0);
    });
  });

  describe('Topic Completion', () => {
    it('should mark topic as completed when quiz is passed', async () => {
      const { data: completion } = await supabase
        .from('topic_completions')
        .select('*')
        .eq('user_id', testUserId)
        .eq('topic_id', testTopicId)
        .single();

      expect(completion).toBeTruthy();
      expect(completion?.completion_method).toBe('quiz');
    });
  });

  describe('Attempt History', () => {
    it('should get all user quiz attempts', async () => {
      const { data: attempts, error } = await supabase.rpc('get_user_quiz_attempts', {
        p_user_id: testUserId,
        p_topic_id: testTopicId,
      });

      expect(error).toBeNull();
      expect(attempts).toBeInstanceOf(Array);
      expect(attempts!.length).toBeGreaterThanOrEqual(3);
    });

    it('should track attempt numbers correctly', async () => {
      const { data: attempts } = await supabase.rpc('get_user_quiz_attempts', {
        p_user_id: testUserId,
        p_topic_id: testTopicId,
      });

      const attemptNumbers = attempts!.map((a: { attempt_number: number }) => a.attempt_number);
      expect(attemptNumbers).toContain(1);
      expect(attemptNumbers).toContain(2);
      expect(attemptNumbers).toContain(3);
    });
  });

  describe('Best Score Tracking', () => {
    it('should get best quiz score', async () => {
      const { data: bestScore, error } = await supabase.rpc('get_best_quiz_score', {
        p_user_id: testUserId,
        p_topic_id: testTopicId,
      });

      expect(error).toBeNull();
      expect(bestScore).toBeInstanceOf(Array);
      expect(bestScore![0].best_score).toBe(100);
      expect(bestScore![0].total_attempts).toBeGreaterThanOrEqual(3);
      expect(bestScore![0].passed_attempts).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Attempt Results Retrieval', () => {
    it('should get detailed attempt results', async () => {
      const { data: results, error } = await supabase.rpc('get_quiz_attempt_results', {
        p_attempt_id: testAttemptId,
      });

      expect(error).toBeNull();
      expect(results).toBeInstanceOf(Array);
      expect(results![0].attempt_id).toBe(testAttemptId);
      expect(results![0].questions).toBeInstanceOf(Array);
      expect(results![0].questions.length).toBe(3);
    });
  });

  describe('Quiz Settings Enforcement', () => {
    it('should respect max_attempts setting', async () => {
      // Update settings to allow max 2 attempts
      await supabase.rpc('update_quiz_settings', {
        p_topic_id: testTopicId,
        p_max_attempts: 2,
      });

      // Try to start 4th attempt (should fail)
      const { data: _data, error } = await supabase.rpc('start_quiz_attempt', {
        p_user_id: testUserId,
        p_topic_id: testTopicId,
        p_enrollment_id: testEnrollmentId,
      });

      expect(error).not.toBeNull();
      expect(error?.message).toContain('Maximum attempts');

      // Reset to unlimited
      await supabase.rpc('update_quiz_settings', {
        p_topic_id: testTopicId,
        p_max_attempts: null,
      });
    });
  });

  describe('Answer Validation', () => {
    it('should handle empty answers', async () => {
      const { data: attemptId } = await supabase.rpc('start_quiz_attempt', {
        p_user_id: testUserId,
        p_topic_id: testTopicId,
        p_enrollment_id: testEnrollmentId,
      });

      const { data: result } = await supabase.rpc('submit_quiz_attempt', {
        p_attempt_id: attemptId,
        p_answers: {}, // No answers provided
      });

      expect(result![0].score).toBe(0);
      expect(result![0].correct_answers).toBe(0);
      expect(result![0].passed).toBe(false);
    });

    it('should handle partial answers', async () => {
      const { data: attemptId } = await supabase.rpc('start_quiz_attempt', {
        p_user_id: testUserId,
        p_topic_id: testTopicId,
        p_enrollment_id: testEnrollmentId,
      });

      const { data: result } = await supabase.rpc('submit_quiz_attempt', {
        p_attempt_id: attemptId,
        p_answers: {
          [testQuestionId1]: [2], // Only answer first question
        },
      });

      expect(result![0].score).toBeLessThan(50);
      expect(result![0].correct_answers).toBe(1);
    });
  });

  describe('Time Tracking', () => {
    it('should track time taken for attempt', async () => {
      const { data: attemptId } = await supabase.rpc('start_quiz_attempt', {
        p_user_id: testUserId,
        p_topic_id: testTopicId,
        p_enrollment_id: testEnrollmentId,
      });

      // Wait 2 seconds
      await new Promise((resolve) => setTimeout(resolve, 2000));

      await supabase.rpc('submit_quiz_attempt', {
        p_attempt_id: attemptId,
        p_answers: {
          [testQuestionId1]: [2],
          [testQuestionId2]: [1, 3],
          [testQuestionId3]: [1],
        },
      });

      const { data: attempt } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('id', attemptId)
        .single();

      expect(attempt?.time_taken_seconds).toBeGreaterThan(1);
    });
  });
});
