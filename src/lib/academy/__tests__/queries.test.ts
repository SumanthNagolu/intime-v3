/**
 * Academy Course Queries Tests
 * Story: ACAD-001
 */

import { describe, it, expect } from 'vitest';
import {
  getPublishedCourses,
  getFeaturedCourses,
  getCourseBySlug,
  getCourseWithModules,
  getCourseModules,
  getModuleTopics,
  searchCourses,
  getCoursesBySkillLevel,
} from '../queries';

// TODO: These tests require database seeding or mocking
// They call actual Supabase queries which need test data
describe.skip('Academy Course Queries', () => {
  describe('getPublishedCourses', () => {
    it('should retrieve all published courses', async () => {
      const courses = await getPublishedCourses();

      expect(courses).toBeDefined();
      expect(Array.isArray(courses)).toBe(true);

      // Should include Guidewire and Salesforce courses (published)
      // Should NOT include AWS course (not published)
      expect(courses.length).toBeGreaterThanOrEqual(2);

      courses.forEach((course) => {
        expect(course.is_published).toBe(true);
        expect(course.deleted_at).toBeNull();
      });
    });

    it('should order courses by title', async () => {
      const courses = await getPublishedCourses();

      if (courses.length > 1) {
        for (let i = 0; i < courses.length - 1; i++) {
          expect(courses[i].title.localeCompare(courses[i + 1].title)).toBeLessThanOrEqual(
            0
          );
        }
      }
    });
  });

  describe('getFeaturedCourses', () => {
    it('should retrieve only featured courses', async () => {
      const courses = await getFeaturedCourses();

      expect(courses).toBeDefined();
      expect(Array.isArray(courses)).toBe(true);

      courses.forEach((course) => {
        expect(course.is_published).toBe(true);
        expect(course.is_featured).toBe(true);
        expect(course.deleted_at).toBeNull();
      });
    });

    it('should include Guidewire course (featured)', async () => {
      const courses = await getFeaturedCourses();

      const guidewireCourse = courses.find(
        (c) => c.slug === 'guidewire-policycenter-development'
      );

      expect(guidewireCourse).toBeDefined();
      expect(guidewireCourse?.is_featured).toBe(true);
    });
  });

  describe('getCourseBySlug', () => {
    it('should retrieve course by slug', async () => {
      const course = await getCourseBySlug('guidewire-policycenter-development');

      expect(course).toBeDefined();
      expect(course?.slug).toBe('guidewire-policycenter-development');
      expect(course?.title).toBe('Guidewire PolicyCenter Development');
    });

    it('should return null for non-existent slug', async () => {
      const course = await getCourseBySlug('non-existent-course');

      expect(course).toBeNull();
    });

    it('should not retrieve deleted courses', async () => {
      // This test assumes deleted courses exist
      // For now, just verify it returns null for deleted courses
      const course = await getCourseBySlug('deleted-course');
      expect(course).toBeNull();
    });
  });

  describe('getCourseWithModules', () => {
    it('should retrieve course with all modules', async () => {
      // First get a course
      const course = await getCourseBySlug('guidewire-policycenter-development');
      expect(course).toBeDefined();

      if (!course) return;

      // Get course with modules
      const courseWithModules = await getCourseWithModules(course.id);

      expect(courseWithModules).toBeDefined();
      expect(courseWithModules?.modules).toBeDefined();
      expect(Array.isArray(courseWithModules?.modules)).toBe(true);
      expect(courseWithModules?.modules.length).toBeGreaterThan(0);
    });

    it('should order modules by module_number', async () => {
      const course = await getCourseBySlug('guidewire-policycenter-development');
      if (!course) return;

      const courseWithModules = await getCourseWithModules(course.id);

      if (courseWithModules && courseWithModules.modules.length > 1) {
        for (let i = 0; i < courseWithModules.modules.length - 1; i++) {
          expect(
            courseWithModules.modules[i].module_number
          ).toBeLessThanOrEqual(
            courseWithModules.modules[i + 1].module_number
          );
        }
      }
    });
  });

  describe('getCourseModules', () => {
    it('should retrieve all modules for a course', async () => {
      const course = await getCourseBySlug('guidewire-policycenter-development');
      if (!course) return;

      const modules = await getCourseModules(course.id);

      expect(modules).toBeDefined();
      expect(Array.isArray(modules)).toBe(true);
      expect(modules.length).toBeGreaterThan(0);

      // Verify first module
      expect(modules[0].module_number).toBe(1);
      expect(modules[0].title).toContain('Module 1');
    });

    it('should respect module prerequisites', async () => {
      const course = await getCourseBySlug('guidewire-policycenter-development');
      if (!course) return;

      const modules = await getCourseModules(course.id);

      // Module 2 should have Module 1 as prerequisite
      const module2 = modules.find((m) => m.module_number === 2);
      expect(module2).toBeDefined();
      expect(module2?.prerequisite_module_ids).toBeDefined();
      expect(module2?.prerequisite_module_ids?.length).toBeGreaterThan(0);
    });
  });

  describe('getModuleTopics', () => {
    it('should retrieve all topics for a module', async () => {
      const course = await getCourseBySlug('guidewire-policycenter-development');
      if (!course) return;

      const modules = await getCourseModules(course.id);
      if (modules.length === 0) return;

      const topics = await getModuleTopics(modules[0].id);

      expect(topics).toBeDefined();
      expect(Array.isArray(topics)).toBe(true);
      expect(topics.length).toBeGreaterThan(0);

      // Verify first topic
      expect(topics[0].topic_number).toBe(1);
      expect(topics[0].title).toContain('1.1');
    });

    it('should order topics by topic_number', async () => {
      const course = await getCourseBySlug('guidewire-policycenter-development');
      if (!course) return;

      const modules = await getCourseModules(course.id);
      if (modules.length === 0) return;

      const topics = await getModuleTopics(modules[0].id);

      if (topics.length > 1) {
        for (let i = 0; i < topics.length - 1; i++) {
          expect(topics[i].topic_number).toBeLessThanOrEqual(
            topics[i + 1].topic_number
          );
        }
      }
    });
  });

  describe('searchCourses', () => {
    it('should find courses by title', async () => {
      const courses = await searchCourses('Guidewire');

      expect(courses).toBeDefined();
      expect(courses.length).toBeGreaterThan(0);

      const guidewireCourse = courses.find(
        (c) => c.slug === 'guidewire-policycenter-development'
      );
      expect(guidewireCourse).toBeDefined();
    });

    it('should find courses by description', async () => {
      const courses = await searchCourses('insurance');

      expect(courses).toBeDefined();
      expect(courses.length).toBeGreaterThan(0);
    });

    it('should be case insensitive', async () => {
      const coursesUpper = await searchCourses('GUIDEWIRE');
      const coursesLower = await searchCourses('guidewire');

      expect(coursesUpper.length).toBe(coursesLower.length);
    });

    it('should return empty array for no matches', async () => {
      const courses = await searchCourses('nonexistentcourse123456');

      expect(courses).toBeDefined();
      expect(courses.length).toBe(0);
    });
  });

  describe('getCoursesBySkillLevel', () => {
    it('should retrieve beginner courses', async () => {
      const courses = await getCoursesBySkillLevel('beginner');

      expect(courses).toBeDefined();
      expect(courses.length).toBeGreaterThan(0);

      courses.forEach((course) => {
        expect(course.skill_level).toBe('beginner');
      });
    });

    it('should retrieve intermediate courses', async () => {
      const courses = await getCoursesBySkillLevel('intermediate');

      expect(courses).toBeDefined();
      // AWS course is intermediate but not published
      // So this may be empty or have other intermediate courses
      courses.forEach((course) => {
        expect(course.skill_level).toBe('intermediate');
        expect(course.is_published).toBe(true);
      });
    });

    it('should only return published courses', async () => {
      const beginnerCourses = await getCoursesBySkillLevel('beginner');

      beginnerCourses.forEach((course) => {
        expect(course.is_published).toBe(true);
        expect(course.deleted_at).toBeNull();
      });
    });
  });
});
