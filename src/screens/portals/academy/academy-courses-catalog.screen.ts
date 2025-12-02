/**
 * Academy Courses Catalog Screen
 *
 * Browse all available courses with filters by category, skill level, etc.
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const academyCoursesCatalogScreen: ScreenDefinition = {
  id: 'academy-courses-catalog',
  type: 'list',
  title: 'Course Catalog',
  subtitle: 'Browse all available courses',
  icon: 'BookOpen',

  dataSource: {
    type: 'custom',
    query: {
      procedure: 'portal.academy.getCourses',
      params: {},
    },
    pagination: true,
    pageSize: 12,
  },

  layout: {
    type: 'sidebar-main',
    sidebarWidth: 'md',
    sidebarPosition: 'left',
    sidebar: {
      id: 'filters',
      type: 'form',
      title: 'Filters',
      fields: [
        {
          id: 'search',
          type: 'text',
          label: 'Search',
          path: 'filter.search',
          config: { placeholder: 'Search courses...', icon: 'Search' },
        },
        {
          id: 'category',
          type: 'multiselect',
          label: 'Category',
          path: 'filter.category',
          config: {
            options: [
              { value: 'technical', label: 'Technical Skills' },
              { value: 'soft_skills', label: 'Soft Skills' },
              { value: 'compliance', label: 'Compliance' },
              { value: 'leadership', label: 'Leadership' },
              { value: 'tools', label: 'Tools & Software' },
              { value: 'interview_prep', label: 'Interview Prep' },
            ],
          },
        },
        {
          id: 'difficulty',
          type: 'multiselect',
          label: 'Skill Level',
          path: 'filter.difficulty',
          config: {
            options: [
              { value: 'beginner', label: 'Beginner' },
              { value: 'intermediate', label: 'Intermediate' },
              { value: 'advanced', label: 'Advanced' },
            ],
          },
        },
        {
          id: 'duration',
          type: 'select',
          label: 'Duration',
          path: 'filter.duration',
          config: {
            options: [
              { value: 'all', label: 'Any Duration' },
              { value: 'short', label: 'Under 1 hour' },
              { value: 'medium', label: '1-3 hours' },
              { value: 'long', label: '3+ hours' },
            ],
          },
        },
        {
          id: 'status',
          type: 'select',
          label: 'Status',
          path: 'filter.status',
          config: {
            options: [
              { value: 'all', label: 'All Courses' },
              { value: 'not_started', label: 'Not Started' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' },
            ],
          },
        },
        {
          id: 'hasCertificate',
          type: 'checkbox',
          label: 'Certification available',
          path: 'filter.hasCertificate',
        },
      ],
      actions: [
        {
          id: 'clear-filters',
          label: 'Clear All',
          type: 'custom',
          variant: 'ghost',
          config: { type: 'custom', handler: 'clearFilters' },
        },
      ],
    },
    sections: [
      // ===========================================
      // SORT OPTIONS
      // ===========================================
      {
        id: 'sort-options',
        type: 'field-grid',
        columns: 2,
        inline: true,
        fields: [
          {
            id: 'sort',
            type: 'select',
            label: 'Sort by',
            path: 'sort.field',
            config: {
              options: [
                { value: 'popular', label: 'Most Popular' },
                { value: 'newest', label: 'Newest' },
                { value: 'xp', label: 'Highest XP' },
                { value: 'duration', label: 'Duration' },
                { value: 'rating', label: 'Rating' },
              ],
            },
          },
          {
            id: 'results-count',
            type: 'custom',
            label: '',
            path: 'totalCount',
            config: { template: '{{value}} courses found' },
          },
        ],
      },

      // ===========================================
      // COURSE GRID
      // ===========================================
      {
        id: 'course-grid',
        type: 'custom',
        component: 'CourseCardsGrid',
        componentProps: {
          layout: 'grid',
          columns: 3,
          showProgress: true,
          showDuration: true,
          showXPReward: true,
          showDifficulty: true,
          showRating: true,
        },
        rowClick: { type: 'navigate', route: '/training/courses/{{id}}' },
        emptyState: {
          title: 'No courses found',
          description: 'Try adjusting your filters.',
          icon: 'BookOpen',
          action: {
            id: 'clear-filters',
            label: 'Clear Filters',
            type: 'custom',
            variant: 'outline',
            config: { type: 'custom', handler: 'clearFilters' },
          },
        },
        pagination: { enabled: true, pageSize: 12 },
      },
    ],
  },

  navigation: {
    breadcrumbs: [
      { label: 'Training Academy', route: '/training' },
      { label: 'Courses', active: true },
    ],
  },
};

export default academyCoursesCatalogScreen;
