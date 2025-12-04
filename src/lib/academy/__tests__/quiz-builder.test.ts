/**
 * Quiz Builder Tests
 * Story: ACAD-010
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// TODO: Requires database setup
describe.skip('Quiz Builder System', () => {
  let testUserId: string;
  let testCourseId: string;
  let testModuleId: string;
  let testTopicId: string;
  let testQuestionId: string;

  beforeAll(async () => {
    // Create test user
    const { data: user } = await supabase
      .from('user_profiles')
      .insert({
        email: 'test-quiz@example.com',
        full_name: 'Test Quiz User',
      })
      .select('id')
      .single();

    testUserId = user!.id;

    // Create test course
    const { data: course } = await supabase
      .from('courses')
      .insert({
        slug: 'test-quiz-course',
        title: 'Test Quiz Course',
        description: 'Testing quiz builder',
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
        slug: 'test-quiz-module',
        title: 'Test Quiz Module',
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
        slug: 'test-quiz-topic',
        title: 'Test Quiz Topic',
        topic_number: 1,
        content_type: 'quiz',
      })
      .select('id')
      .single();

    testTopicId = topic!.id;
  });

  afterAll(async () => {
    // Cleanup
    await supabase.from('quiz_questions').delete().eq('topic_id', testTopicId);
    await supabase.from('quiz_settings').delete().eq('topic_id', testTopicId);
    await supabase.from('module_topics').delete().eq('id', testTopicId);
    await supabase.from('course_modules').delete().eq('id', testModuleId);
    await supabase.from('courses').delete().eq('id', testCourseId);
    await supabase.from('user_profiles').delete().eq('id', testUserId);
  });

  describe('Question Creation', () => {
    it('should create a multiple choice single answer question', async () => {
      const { data: questionId, error } = await supabase.rpc('create_quiz_question', {
        p_topic_id: testTopicId,
        p_question_text: 'What is the capital of France?',
        p_question_type: 'multiple_choice_single',
        p_options: ['London', 'Berlin', 'Paris', 'Madrid'],
        p_correct_answers: [2], // Paris
        p_difficulty: 'easy',
        p_points: 1,
        p_is_public: false,
        p_created_by: testUserId,
      });

      expect(error).toBeNull();
      expect(questionId).toBeTruthy();

      testQuestionId = questionId as string;
    });

    it('should create a multiple choice multiple answers question', async () => {
      const { data: questionId, error } = await supabase.rpc('create_quiz_question', {
        p_topic_id: testTopicId,
        p_question_text: 'Which of these are programming languages?',
        p_question_type: 'multiple_choice_multiple',
        p_options: ['JavaScript', 'HTML', 'Python', 'CSS'],
        p_correct_answers: [0, 2], // JavaScript, Python
        p_difficulty: 'medium',
        p_points: 2,
        p_is_public: false,
        p_created_by: testUserId,
      });

      expect(error).toBeNull();
      expect(questionId).toBeTruthy();
    });

    it('should create a true/false question', async () => {
      const { data: questionId, error } = await supabase.rpc('create_quiz_question', {
        p_topic_id: testTopicId,
        p_question_text: 'The Earth is flat',
        p_question_type: 'true_false',
        p_options: ['True', 'False'],
        p_correct_answers: [1], // False
        p_explanation: 'The Earth is approximately spherical',
        p_difficulty: 'easy',
        p_points: 1,
        p_is_public: false,
        p_created_by: testUserId,
      });

      expect(error).toBeNull();
      expect(questionId).toBeTruthy();
    });

    it('should create a code question', async () => {
      const { data: questionId, error } = await supabase.rpc('create_quiz_question', {
        p_topic_id: testTopicId,
        p_question_text: 'Write a function that returns the sum of two numbers',
        p_question_type: 'code',
        p_options: ['function sum(a, b) { }'],
        p_correct_answers: [],
        p_code_language: 'javascript',
        p_difficulty: 'medium',
        p_points: 3,
        p_is_public: false,
        p_created_by: testUserId,
      });

      expect(error).toBeNull();
      expect(questionId).toBeTruthy();
    });

    it('should fail validation for invalid question type', async () => {
      const { error } = await supabase.rpc('create_quiz_question', {
        p_topic_id: testTopicId,
        p_question_text: 'Invalid question',
        p_question_type: 'true_false',
        p_options: ['True', 'False', 'Maybe'], // Should have exactly 2 options
        p_correct_answers: [0],
        p_difficulty: 'easy',
        p_points: 1,
        p_is_public: false,
        p_created_by: testUserId,
      });

      expect(error).not.toBeNull();
      expect(error?.message).toContain('exactly 2 options');
    });
  });

  describe('Question Retrieval', () => {
    it('should get questions by topic', async () => {
      const { data: questions, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('topic_id', testTopicId);

      expect(error).toBeNull();
      expect(questions).toBeInstanceOf(Array);
      expect(questions!.length).toBeGreaterThan(0);
    });

    it('should get question bank with filters', async () => {
      const { data: questions, error } = await supabase.rpc('get_question_bank', {
        p_topic_id: testTopicId,
        p_question_type: 'multiple_choice_single',
        p_difficulty: null,
        p_search_text: null,
        p_include_public: true,
        p_created_by: null,
      });

      expect(error).toBeNull();
      expect(questions).toBeInstanceOf(Array);
    });

    it('should search questions by text', async () => {
      const { data: questions, error } = await supabase.rpc('get_question_bank', {
        p_topic_id: testTopicId,
        p_question_type: null,
        p_difficulty: null,
        p_search_text: 'capital',
        p_include_public: true,
        p_created_by: null,
      });

      expect(error).toBeNull();
      expect(questions).toBeInstanceOf(Array);
      expect(questions!.length).toBeGreaterThan(0);
    });
  });

  describe('Question Update', () => {
    it('should update a question', async () => {
      const { data: success, error } = await supabase.rpc('update_quiz_question', {
        p_question_id: testQuestionId,
        p_question_text: 'What is the capital city of France?',
        p_difficulty: 'medium',
        p_points: 2,
      });

      expect(error).toBeNull();
      expect(success).toBe(true);

      // Verify update
      const { data: question } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('id', testQuestionId)
        .single();

      expect(question?.question_text).toBe('What is the capital city of France?');
      expect(question?.difficulty).toBe('medium');
      expect(question?.points).toBe(2);
    });
  });

  describe('Quiz Settings', () => {
    it('should create default quiz settings', async () => {
      const { data: settings, error } = await supabase.rpc('get_or_create_quiz_settings', {
        p_topic_id: testTopicId,
      });

      expect(error).toBeNull();
      expect(settings).toBeInstanceOf(Array);
      expect(settings![0]).toMatchObject({
        topic_id: testTopicId,
        randomize_questions: expect.any(Boolean),
        passing_threshold: expect.any(Number),
      });
    });

    it('should update quiz settings', async () => {
      const { data: settingsId, error } = await supabase.rpc('update_quiz_settings', {
        p_topic_id: testTopicId,
        p_randomize_questions: true,
        p_randomize_options: true,
        p_passing_threshold: 80,
        p_time_limit_minutes: 30,
        p_max_attempts: 3,
        p_xp_reward: 50,
      });

      expect(error).toBeNull();
      expect(settingsId).toBeTruthy();

      // Verify update
      const { data: settings } = await supabase
        .from('quiz_settings')
        .select('*')
        .eq('topic_id', testTopicId)
        .single();

      expect(settings?.randomize_questions).toBe(true);
      expect(settings?.passing_threshold).toBe(80);
      expect(settings?.time_limit_minutes).toBe(30);
    });
  });

  describe('Question Randomization', () => {
    it('should get quiz questions with randomization', async () => {
      const { data: questions, error } = await supabase.rpc('get_quiz_questions', {
        p_topic_id: testTopicId,
        p_randomize: true,
      });

      expect(error).toBeNull();
      expect(questions).toBeInstanceOf(Array);
      expect(questions!.length).toBeGreaterThan(0);
    });

    it('should get quiz questions without randomization', async () => {
      const { data: questions, error } = await supabase.rpc('get_quiz_questions', {
        p_topic_id: testTopicId,
        p_randomize: false,
      });

      expect(error).toBeNull();
      expect(questions).toBeInstanceOf(Array);
      expect(questions!.length).toBeGreaterThan(0);
    });
  });

  describe('Bulk Import', () => {
    it('should bulk import questions', async () => {
      const questionsToImport = [
        {
          question_text: 'What is 2 + 2?',
          question_type: 'multiple_choice_single',
          options: ['2', '3', '4', '5'],
          correct_answers: [2],
          difficulty: 'easy',
          points: 1,
        },
        {
          question_text: 'Which are even numbers?',
          question_type: 'multiple_choice_multiple',
          options: ['1', '2', '3', '4'],
          correct_answers: [1, 3],
          difficulty: 'easy',
          points: 2,
        },
      ];

      const { data: result, error } = await supabase.rpc('bulk_import_quiz_questions', {
        p_topic_id: testTopicId,
        p_questions: questionsToImport,
        p_created_by: testUserId,
      });

      expect(error).toBeNull();
      expect(result).toBeInstanceOf(Array);
      expect(result![0].success).toBe(true);
      expect(result![0].imported_count).toBe(2);
    });

    it('should handle bulk import errors gracefully', async () => {
      const questionsWithErrors = [
        {
          question_text: 'Valid question',
          question_type: 'multiple_choice_single',
          options: ['A', 'B'],
          correct_answers: [0],
          difficulty: 'easy',
          points: 1,
        },
        {
          question_text: 'Invalid', // Too short
          question_type: 'true_false',
          options: ['True', 'False'],
          correct_answers: [0],
          difficulty: 'easy',
          points: 1,
        },
      ];

      const { data: result, error } = await supabase.rpc('bulk_import_quiz_questions', {
        p_topic_id: testTopicId,
        p_questions: questionsWithErrors,
        p_created_by: testUserId,
      });

      expect(error).toBeNull();
      expect(result![0].errors).toBeInstanceOf(Array);
    });
  });

  describe('Question Statistics', () => {
    it('should query question_bank_stats view', async () => {
      const { data, error } = await supabase
        .from('question_bank_stats')
        .select('*')
        .eq('topic_id', testTopicId);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should query quiz_analytics view', async () => {
      const { data, error } = await supabase
        .from('quiz_analytics')
        .select('*')
        .eq('topic_id', testTopicId);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('Question Deletion', () => {
    it('should delete a question', async () => {
      const { data: success, error } = await supabase.rpc('delete_quiz_question', {
        p_question_id: testQuestionId,
      });

      expect(error).toBeNull();
      expect(success).toBe(true);

      // Verify deletion
      const { data: question } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('id', testQuestionId)
        .single();

      expect(question).toBeNull();
    });
  });

  describe('Public Questions', () => {
    it('should create a public question', async () => {
      const { data: questionId, error } = await supabase.rpc('create_quiz_question', {
        p_topic_id: testTopicId,
        p_question_text: 'What is the speed of light?',
        p_question_type: 'multiple_choice_single',
        p_options: ['300,000 km/s', '150,000 km/s', '450,000 km/s', '600,000 km/s'],
        p_correct_answers: [0],
        p_difficulty: 'medium',
        p_points: 2,
        p_is_public: true,
        p_created_by: testUserId,
      });

      expect(error).toBeNull();
      expect(questionId).toBeTruthy();

      // Verify public flag
      const { data: question } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('id', questionId)
        .single();

      expect(question?.is_public).toBe(true);
    });
  });
});
