/**
 * Academy Course Detail Screen
 *
 * Course overview with lessons, progress, and enrollment.
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const academyCourseDetailScreen: ScreenDefinition = {
  id: 'academy-course-detail',
  type: 'detail',
  title: { type: 'field', path: 'title' },
  icon: 'BookOpen',

  dataSource: {
    type: 'custom',
    query: {
      procedure: 'portal.academy.getCourseById',
      params: { id: { type: 'param', path: 'id' } },
    },
  },

  layout: {
    type: 'sidebar-main',
    sidebarWidth: 'md',
    sidebarPosition: 'right',
    sidebar: {
      id: 'course-info',
      type: 'info-card',
      title: 'Course Details',
      fields: [
        { id: 'duration', label: 'Duration', type: 'text', path: 'duration' },
        { id: 'lessons', label: 'Lessons', type: 'number', path: 'lessonsCount' },
        { id: 'xp', label: 'XP Reward', type: 'number', path: 'xpReward' },
        {
          id: 'difficulty',
          label: 'Difficulty',
          type: 'enum',
          path: 'difficulty',
          config: {
            options: [
              { value: 'beginner', label: 'Beginner' },
              { value: 'intermediate', label: 'Intermediate' },
              { value: 'advanced', label: 'Advanced' },
            ],
            badgeColors: { beginner: 'green', intermediate: 'yellow', advanced: 'red' },
          },
        },
        { id: 'category', label: 'Category', type: 'text', path: 'category' },
        { id: 'rating', label: 'Rating', type: 'rating', path: 'rating', config: { max: 5 } },
        { id: 'enrollments', label: 'Enrolled', type: 'number', path: 'enrollmentCount' },
        { id: 'certificate', label: 'Certificate', type: 'boolean', path: 'hasCertificate' },
      ],
      footer: {
        type: 'progress',
        label: 'Your Progress',
        path: 'userProgress',
        maxValue: 100,
      },
      actions: [
        {
          id: 'start-course',
          label: 'Start Course',
          type: 'mutation',
          icon: 'Play',
          variant: 'primary',
          config: { type: 'mutation', procedure: 'portal.academy.enrollInCourse', input: { courseId: { type: 'field', path: 'id' } } },
          visible: { field: 'enrollmentStatus', operator: 'eq', value: 'not_enrolled' },
          onSuccess: { type: 'navigate', route: '/training/courses/{{id}}/lessons/1' },
        },
        {
          id: 'continue-course',
          label: 'Continue Learning',
          type: 'navigate',
          icon: 'Play',
          variant: 'primary',
          config: { type: 'navigate', route: '/training/courses/{{id}}/lessons/{{nextLessonId}}' },
          visible: { field: 'enrollmentStatus', operator: 'eq', value: 'in_progress' },
        },
        {
          id: 'review-course',
          label: 'Review Course',
          type: 'navigate',
          icon: 'RotateCcw',
          variant: 'outline',
          config: { type: 'navigate', route: '/training/courses/{{id}}/lessons/1' },
          visible: { field: 'enrollmentStatus', operator: 'eq', value: 'completed' },
        },
      ],
    },
    sections: [
      // ===========================================
      // COURSE OVERVIEW
      // ===========================================
      {
        id: 'overview',
        type: 'info-card',
        title: 'About This Course',
        fields: [
          { id: 'description', label: '', type: 'richtext', path: 'description' },
        ],
      },

      // ===========================================
      // WHAT YOU'LL LEARN
      // ===========================================
      {
        id: 'learning-objectives',
        type: 'list',
        title: "What You'll Learn",
        dataSource: { type: 'field', path: 'learningObjectives' },
        config: {
          layout: 'checklist',
          icon: 'Check',
        },
      },

      // ===========================================
      // PREREQUISITES
      // ===========================================
      {
        id: 'prerequisites',
        type: 'list',
        title: 'Prerequisites',
        visible: { field: 'prerequisites.length', operator: 'gt', value: 0 },
        dataSource: { type: 'field', path: 'prerequisites' },
        config: {
          layout: 'list',
          showLinks: true,
        },
      },

      // ===========================================
      // LESSONS LIST
      // ===========================================
      {
        id: 'lessons',
        type: 'custom',
        title: 'Course Content',
        component: 'LessonsList',
        componentProps: {
          showDuration: true,
          showCompletionStatus: true,
          showLockStatus: true,
          expandable: true,
        },
      },

      // ===========================================
      // INSTRUCTOR
      // ===========================================
      {
        id: 'instructor',
        type: 'info-card',
        title: 'Instructor',
        visible: { field: 'instructor', operator: 'is_not_empty' },
        header: {
          type: 'avatar',
          path: 'instructor.avatar',
          fallbackPath: 'instructor.initials',
          size: 'md',
        },
        fields: [
          { id: 'name', label: 'Name', type: 'text', path: 'instructor.name' },
          { id: 'title', label: 'Title', type: 'text', path: 'instructor.title' },
          { id: 'bio', label: '', type: 'text', path: 'instructor.bio' },
        ],
      },

      // ===========================================
      // REVIEWS
      // ===========================================
      {
        id: 'reviews',
        type: 'custom',
        title: 'Student Reviews',
        collapsible: true,
        component: 'CourseReviews',
        componentProps: {
          maxItems: 5,
          showRating: true,
          showAverage: true,
        },
      },
    ],
  },

  navigation: {
    breadcrumbs: [
      { label: 'Training Academy', route: '/training' },
      { label: 'Courses', route: '/training/courses' },
      { label: { type: 'field', path: 'title' }, active: true },
    ],
  },
};

export default academyCourseDetailScreen;
