/**
 * Academy Lesson View Screen
 *
 * Individual lesson content with video, quiz, and navigation.
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const academyLessonViewScreen: ScreenDefinition = {
  id: 'academy-lesson-view',
  type: 'detail',
  title: { type: 'field', path: 'title' },
  subtitle: { type: 'field', path: 'course.title' },
  icon: 'Play',

  dataSource: {
    type: 'custom',
    query: {
      procedure: 'portal.academy.getLessonById',
      params: {
        courseId: { type: 'param', path: 'courseId' },
        lessonId: { type: 'param', path: 'lessonId' },
      },
    },
  },

  layout: {
    type: 'sidebar-main',
    sidebarWidth: 'sm',
    sidebarPosition: 'left',
    sidebar: {
      id: 'lesson-nav',
      type: 'custom',
      component: 'LessonNavigation',
      componentProps: {
        showProgress: true,
        showCompletionStatus: true,
        highlightCurrent: true,
        allowJump: true,
      },
    },
    sections: [
      // ===========================================
      // LESSON CONTENT (VIDEO/TEXT)
      // ===========================================
      {
        id: 'lesson-content',
        type: 'custom',
        component: 'LessonContent',
        componentProps: {
          contentType: { type: 'field', path: 'contentType' },
          videoUrl: { type: 'field', path: 'videoUrl' },
          content: { type: 'field', path: 'content' },
          showTranscript: true,
          autoMarkComplete: true,
        },
      },

      // ===========================================
      // PROGRESS TRACKER
      // ===========================================
      {
        id: 'progress-tracker',
        type: 'custom',
        component: 'LessonProgressTracker',
        componentProps: {
          currentLesson: { type: 'field', path: 'lessonNumber' },
          totalLessons: { type: 'field', path: 'course.lessonsCount' },
          xpEarned: { type: 'field', path: 'xpEarned' },
        },
      },

      // ===========================================
      // QUIZ/ASSESSMENT
      // ===========================================
      {
        id: 'quiz',
        type: 'custom',
        title: 'Knowledge Check',
        visible: { field: 'hasQuiz', operator: 'eq', value: true },
        component: 'LessonQuiz',
        componentProps: {
          questionsPath: 'quiz.questions',
          allowRetake: true,
          showExplanations: true,
          passThreshold: 80,
        },
      },

      // ===========================================
      // RESOURCES
      // ===========================================
      {
        id: 'resources',
        type: 'list',
        title: 'Resources',
        collapsible: true,
        visible: { field: 'resources.length', operator: 'gt', value: 0 },
        dataSource: { type: 'field', path: 'resources' },
        config: {
          layout: 'list',
          fields: [
            { id: 'name', path: 'name' },
            { id: 'type', path: 'type' },
            { id: 'downloadUrl', path: 'downloadUrl', type: 'url' },
          ],
        },
      },

      // ===========================================
      // NAVIGATION BUTTONS
      // ===========================================
      {
        id: 'lesson-navigation',
        type: 'custom',
        component: 'LessonNavigationButtons',
        componentProps: {
          showPrevious: true,
          showNext: true,
          showMarkComplete: true,
          nextRoute: { type: 'field', path: 'nextLessonRoute' },
          previousRoute: { type: 'field', path: 'previousLessonRoute' },
        },
      },
    ],
  },

  actions: [
    {
      id: 'mark-complete',
      label: 'Mark as Complete',
      type: 'mutation',
      icon: 'Check',
      variant: 'primary',
      config: {
        type: 'mutation',
        procedure: 'portal.academy.markLessonComplete',
        input: {
          courseId: { type: 'param', path: 'courseId' },
          lessonId: { type: 'param', path: 'lessonId' },
        },
      },
      visible: { field: 'isCompleted', operator: 'eq', value: false },
    },
    {
      id: 'next-lesson',
      label: 'Next Lesson',
      type: 'navigate',
      icon: 'ArrowRight',
      variant: 'default',
      config: { type: 'navigate', route: { type: 'field', path: 'nextLessonRoute' } },
      visible: { field: 'hasNextLesson', operator: 'eq', value: true },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Training Academy', route: '/training' },
      { label: 'Courses', route: '/training/courses' },
      { label: { type: 'field', path: 'course.title' }, route: '/training/courses/{{courseId}}' },
      { label: { type: 'field', path: 'title' }, active: true },
    ],
  },
};

export default academyLessonViewScreen;
