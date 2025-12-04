/**
 * Pod Create Screen Definition (Admin)
 *
 * Wizard for creating a new pod in the organization.
 */

import type { ScreenDefinition } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const POD_TYPE_OPTIONS = [
  { value: 'recruiting', label: 'Recruiting Pod', description: 'For recruiters managing jobs and candidates' },
  { value: 'bench_sales', label: 'Bench Sales Pod', description: 'For marketing and placing consultants' },
  { value: 'ta', label: 'Talent Acquisition Pod', description: 'For internal hiring and talent management' },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const podCreateScreen: ScreenDefinition = {
  id: 'pod-create',
  type: 'wizard',
  entityType: 'pod',

  title: 'Create New Pod',
  subtitle: 'Set up a new team pod',
  icon: 'Users2',

  // Permissions
  permissions: [],

  // Layout (required for wizard type)
  layout: { type: 'wizard-steps', sections: [] },

  // Wizard Steps
  steps: [
    // Step 1: Basic Information
    {
      id: 'basic-info',
      title: 'Basic Information',
      description: 'Name and type of the pod',
      icon: 'Info',
      sections: [
        {
          id: 'pod-basics',
          type: 'form',
          columns: 1,
          fields: [
            {
              id: 'name',
              label: 'Pod Name',
              type: 'text',
              path: 'name',
              config: {
                placeholder: 'e.g., Pod Alpha, Team Mercury',
                required: true,
                maxLength: 50,
                helpText: 'Choose a unique, memorable name for this pod',
              },
            },
            {
              id: 'type',
              label: 'Pod Type',
              type: 'select',
              path: 'type',
              config: {
                required: true,
                options: POD_TYPE_OPTIONS,
                columns: 1,
              },
            },
            {
              id: 'description',
              label: 'Description (Optional)',
              type: 'textarea',
              path: 'description',
              config: {
                placeholder: 'Brief description of the pod\'s focus or specialization...',
                rows: 3,
                maxLength: 200,
              },
            },
          ],
        },
      ],
      validation: {
        required: ['name', 'type'],
      },
    },
    // Step 2: Team Members
    {
      id: 'members',
      title: 'Team Members',
      description: 'Assign manager and members',
      icon: 'Users',
      sections: [
        {
          id: 'manager-selection',
          type: 'form',
          title: 'Senior Member (Manager)',
          description: 'The manager will lead and oversee the pod',
          fields: [
            {
              id: 'seniorMemberId',
              label: 'Select Manager',
              type: 'select',
              path: 'seniorMemberId',
              config: {
                required: true,
                placeholder: 'Search for a manager...',
                dataSource: {
                  procedure: 'admin.users.listManagers',
                  params: { available: true },
                },
                displayFormat: '{{fullName}}',
                subtitleFormat: '{{role}} | {{email}}',
                helpText: 'Only users with manager roles are shown',
              },
            },
          ],
        },
        {
          id: 'junior-members',
          type: 'form',
          title: 'Junior Members (Optional)',
          description: 'Add team members to the pod',
          fields: [
            {
              id: 'juniorMemberIds',
              label: 'Select Members',
              type: 'multiselect',
              path: 'juniorMemberIds',
              config: {
                placeholder: 'Search for team members...',
                dataSource: {
                  procedure: 'admin.users.listAvailableForPod',
                },
                displayFormat: '{{fullName}}',
                subtitleFormat: '{{role}} | {{email}}',
                helpText: 'You can add more members later',
                maxItems: 5,
              },
            },
          ],
        },
      ],
      validation: {
        required: ['seniorMemberId'],
      },
    },
    // Step 3: Targets
    {
      id: 'targets',
      title: 'Performance Targets',
      description: 'Set initial targets for the pod',
      icon: 'Target',
      sections: [
        {
          id: 'target-settings',
          type: 'form',
          title: 'Monthly Targets',
          description: 'These can be adjusted later',
          columns: 2,
          fields: [
            {
              id: 'placementsTarget',
              label: 'Placements Target',
              type: 'number',
              path: 'placementsTarget',
              config: {
                min: 0,
                defaultValue: 2,
                step: 1,
                helpText: 'Expected placements per month',
              },
            },
            {
              id: 'revenueTarget',
              label: 'Revenue Target',
              type: 'currency',
              path: 'revenueTarget',
              config: {
                min: 0,
                defaultValue: 50000,
                helpText: 'Expected monthly revenue',
              },
            },
            {
              id: 'submissionsTarget',
              label: 'Submissions Target',
              type: 'number',
              path: 'submissionsTarget',
              config: {
                min: 0,
                defaultValue: 20,
                step: 1,
                helpText: 'Expected submissions per month',
              },
            },
            {
              id: 'interviewsTarget',
              label: 'Interviews Target',
              type: 'number',
              path: 'interviewsTarget',
              config: {
                min: 0,
                defaultValue: 10,
                step: 1,
                helpText: 'Expected interviews per month',
              },
            },
          ],
        },
      ],
      skippable: true,
    },
    // Step 4: Review
    {
      id: 'review',
      title: 'Review & Create',
      description: 'Confirm pod settings',
      icon: 'CheckCircle',
      sections: [
        {
          id: 'review-summary',
          type: 'custom',
          component: 'PodCreationSummary',
          componentProps: {
            showPreview: true,
          },
        },
        {
          id: 'notifications',
          type: 'form',
          title: 'Notifications',
          fields: [
            {
              id: 'notifyMembers',
              label: 'Notify team members',
              type: 'checkbox',
              path: 'notifyMembers',
              config: {
                defaultValue: true,
                helpText: 'Send email to assigned members about their new pod',
              },
            },
          ],
        },
      ],
    },
  ],

  // Wizard Navigation
  navigation: {
    allowSkip: false,
    showProgress: true,
    showStepNumbers: true,
    saveDraft: true,
    allowResume: true,
    breadcrumbs: [
      { label: 'Admin', route: '/admin' },
      { label: 'Pods', route: '/admin/pods' },
      { label: 'Create Pod' },
    ],
  },

  // On Complete
  onComplete: {
    action: 'create',
    entityType: 'pod',
    successRedirect: '/admin/pods/{{id}}',
    successMessage: 'Pod created successfully',
    handler: 'handleCreatePod',
  },
};

export default podCreateScreen;
