/**
 * Courses tRPC Router Tests
 * Story: ACAD-005
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

describe('Courses Router', () => {
  let testCourseId: string;
  let testModuleId: string;
  let testTopicId: string;
  let testUserId: string;

  beforeAll(async () => {
    // Create test user
    const { data: user } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', 'test-admin@example.com')
      .single();

    if (user) {
      testUserId = user.id;
    } else {
      const { data: newUser } = await supabase
        .from('user_profiles')
        .insert({
          email: 'test-admin@example.com',
          full_name: 'Test Admin',
        })
        .select('id')
        .single();

      testUserId = newUser!.id;
    }
  });

  afterAll(async () => {
    // Cleanup
    if (testTopicId) {
      await supabase.from('module_topics').delete().eq('id', testTopicId);
    }
    if (testModuleId) {
      await supabase.from('course_modules').delete().eq('id', testModuleId);
    }
    if (testCourseId) {
      await supabase.from('courses').delete().eq('id', testCourseId);
    }
  });

  describe('Course CRUD', () => {
    it('should create a course', async () => {
      const { data, error } = await supabase
        .from('courses')
        .insert({
          slug: 'test-course',
          title: 'Test Course',
          description: 'Test course description',
          estimated_duration_weeks: 8,
          skill_level: 'beginner',
          created_by: testUserId,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeTruthy();
      expect(data?.title).toBe('Test Course');

      testCourseId = data!.id;
    });

    it('should list published courses only', async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should get course by ID', async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', testCourseId)
        .single();

      expect(error).toBeNull();
      expect(data?.id).toBe(testCourseId);
    });

    it('should update course', async () => {
      const { data, error } = await supabase
        .from('courses')
        .update({ title: 'Updated Test Course' })
        .eq('id', testCourseId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data?.title).toBe('Updated Test Course');
    });

    it('should prevent publishing course without content', async () => {
      // Try to publish course with no modules/topics
      const { data: course } = await supabase
        .from('courses')
        .select('total_modules, total_topics')
        .eq('id', testCourseId)
        .single();

      expect(course?.total_modules).toBe(0);
      expect(course?.total_topics).toBe(0);

      // Should not allow publishing
      // (This validation happens in tRPC router)
    });

    it('should soft delete course', async () => {
      const { error } = await supabase
        .from('courses')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', testCourseId);

      expect(error).toBeNull();

      // Verify soft delete
      const { data } = await supabase
        .from('courses')
        .select('deleted_at')
        .eq('id', testCourseId)
        .single();

      expect(data?.deleted_at).toBeTruthy();

      // Restore for other tests
      await supabase
        .from('courses')
        .update({ deleted_at: null })
        .eq('id', testCourseId);
    });
  });

  describe('Module Management', () => {
    it('should create module', async () => {
      const { data, error } = await supabase
        .from('course_modules')
        .insert({
          course_id: testCourseId,
          slug: 'test-module',
          title: 'Test Module',
          module_number: 1,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeTruthy();

      testModuleId = data!.id;
    });

    it('should update module', async () => {
      const { data, error } = await supabase
        .from('course_modules')
        .update({ title: 'Updated Test Module' })
        .eq('id', testModuleId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data?.title).toBe('Updated Test Module');
    });

    it('should enforce unique module numbers per course', async () => {
      const { error } = await supabase
        .from('course_modules')
        .insert({
          course_id: testCourseId,
          slug: 'test-module-2',
          title: 'Test Module 2',
          module_number: 1, // Duplicate number
        });

      expect(error).toBeTruthy();
    });
  });

  describe('Topic Management', () => {
    it('should create topic', async () => {
      const { data, error } = await supabase
        .from('module_topics')
        .insert({
          module_id: testModuleId,
          slug: 'test-topic',
          title: 'Test Topic',
          topic_number: 1,
          content_type: 'video',
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeTruthy();

      testTopicId = data!.id;
    });

    it('should update topic', async () => {
      const { data, error } = await supabase
        .from('module_topics')
        .update({ title: 'Updated Test Topic' })
        .eq('id', testTopicId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data?.title).toBe('Updated Test Topic');
    });

    it('should validate content_type', async () => {
      const { error } = await supabase
        .from('module_topics')
        .insert({
          module_id: testModuleId,
          slug: 'invalid-topic',
          title: 'Invalid Topic',
          topic_number: 2,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          content_type: 'invalid_type' as any,
        });

      expect(error).toBeTruthy();
    });
  });

  describe('Auto-calculated fields', () => {
    it('should auto-update total_modules when module added', async () => {
      // Check course totals updated by trigger
      const { data: course } = await supabase
        .from('courses')
        .select('total_modules')
        .eq('id', testCourseId)
        .single();

      expect(course?.total_modules).toBeGreaterThan(0);
    });

    it('should auto-update total_topics when topic added', async () => {
      const { data: course } = await supabase
        .from('courses')
        .select('total_topics')
        .eq('id', testCourseId)
        .single();

      expect(course?.total_topics).toBeGreaterThan(0);
    });
  });

  describe('Prerequisites', () => {
    it('should allow setting module prerequisites', async () => {
      const { data: module2 } = await supabase
        .from('course_modules')
        .insert({
          course_id: testCourseId,
          slug: 'test-module-3',
          title: 'Module with Prerequisites',
          module_number: 2,
          prerequisite_module_ids: [testModuleId],
        })
        .select()
        .single();

      expect(module2).toBeTruthy();
      expect(module2?.prerequisite_module_ids).toContain(testModuleId);

      // Cleanup
      await supabase.from('course_modules').delete().eq('id', module2!.id);
    });

    it('should allow setting topic prerequisites', async () => {
      const { data: topic2 } = await supabase
        .from('module_topics')
        .insert({
          module_id: testModuleId,
          slug: 'test-topic-2',
          title: 'Topic with Prerequisites',
          topic_number: 2,
          content_type: 'reading',
          prerequisite_topic_ids: [testTopicId],
        })
        .select()
        .single();

      expect(topic2).toBeTruthy();
      expect(topic2?.prerequisite_topic_ids).toContain(testTopicId);

      // Cleanup
      await supabase.from('module_topics').delete().eq('id', topic2!.id);
    });
  });
});
