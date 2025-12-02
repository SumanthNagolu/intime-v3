/**
 * User Invite Screen Definition
 *
 * Wizard for inviting new users to the organization.
 * Multi-step form with user info, role assignment, and invitation options.
 */

import type { ScreenDefinition } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const USER_ROLE_OPTIONS = [
  { value: 'recruiter', label: 'Recruiter (IC)', description: 'Individual contributor - manages jobs and candidates' },
  { value: 'recruiting_manager', label: 'Recruiting Manager', description: 'Manages recruiting pod, reviews submissions' },
  { value: 'bench_sales', label: 'Bench Sales (IC)', description: 'Markets consultants, manages bench hotlists' },
  { value: 'bench_sales_manager', label: 'Bench Sales Manager', description: 'Manages bench sales pod' },
  { value: 'ta', label: 'Talent Acquisition', description: 'Direct hiring for internal positions' },
  { value: 'hr_manager', label: 'HR Manager', description: 'People operations, talent acquisition' },
  { value: 'cfo', label: 'CFO', description: 'Financial oversight and reporting' },
  { value: 'coo', label: 'COO', description: 'Operations oversight' },
  { value: 'admin', label: 'Admin', description: 'Full system access and configuration' },
];

const DEPARTMENT_OPTIONS = [
  { value: 'recruiting', label: 'Recruiting' },
  { value: 'bench_sales', label: 'Bench Sales' },
  { value: 'hr', label: 'Human Resources' },
  { value: 'finance', label: 'Finance' },
  { value: 'operations', label: 'Operations' },
  { value: 'executive', label: 'Executive' },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const userInviteScreen: ScreenDefinition = {
  id: 'user-invite',
  type: 'wizard',
  // entityType: 'user', // Admin entity

  title: 'Invite New User',
  subtitle: 'Send invitation to join the organization',
  icon: 'UserPlus',

  // Permissions
  permissions: [],

  // Layout (required for wizard type)
  layout: { type: 'wizard-steps', sections: [] },

  // Wizard Steps
  steps: [
    // Step 1: User Information
    {
      id: 'user-info',
      title: 'User Information',
      description: 'Enter basic user details',
      icon: 'User',
      sections: [
        {
          id: 'basic-info',
          type: 'form',
          columns: 2,
          fields: [
            {
              id: 'emails',
              label: 'Email Address(es)',
              type: 'textarea',
              path: 'emails',
              config: {
                placeholder: 'Enter one or more email addresses (comma or newline separated)',
                rows: 3,
                required: true,
                helpText: 'You can invite multiple users at once by entering multiple emails',
              },
            },
            {
              id: 'firstName',
              label: 'First Name',
              type: 'text',
              path: 'firstName',
              config: {
                placeholder: 'First name',
                helpText: 'Optional for bulk invites',
              },
            },
            {
              id: 'lastName',
              label: 'Last Name',
              type: 'text',
              path: 'lastName',
              config: {
                placeholder: 'Last name',
                helpText: 'Optional for bulk invites',
              },
            },
            {
              id: 'workPhone',
              label: 'Work Phone',
              type: 'phone',
              path: 'workPhone',
              config: { placeholder: '(555) 123-4567' },
            },
            {
              id: 'employeeId',
              label: 'Employee ID',
              type: 'text',
              path: 'employeeId',
              config: {
                placeholder: 'EMP-2024-XXX',
                helpText: 'Optional: For HR integration',
              },
            },
            {
              id: 'startDate',
              label: 'Start Date',
              type: 'date',
              path: 'startDate',
              config: { minDate: 'today-1y', maxDate: 'today+1y' },
            },
          ],
        },
      ],
      validation: {
        required: ['emails'],
      },
    },
    // Step 2: Role & Access
    {
      id: 'role-access',
      title: 'Role & Access',
      description: 'Assign role and pod',
      icon: 'Key',
      sections: [
        {
          id: 'role-selection',
          type: 'form',
          title: 'User Role',
          fields: [
            {
              id: 'role',
              label: 'Select Role',
              type: 'select',
              path: 'role',
              config: {
                required: true,
                options: USER_ROLE_OPTIONS,
                columns: 2,
              },
            },
          ],
        },
        {
          id: 'pod-assignment',
          type: 'form',
          title: 'Pod Assignment',
          fields: [
            {
              id: 'podId',
              label: 'Assign to Pod',
              type: 'select',
              path: 'podId',
              config: {
                placeholder: 'Select a pod...',
                helpText: 'Required for IC and Manager roles',
                dataSource: {
                  procedure: 'admin.pods.listActive',
                },
                displayFormat: '{{name}} - {{type}}',
                subtitleFormat: 'Manager: {{seniorMember.fullName}} | Members: {{memberCount}}/{{maxMembers}}',
              },
            },
            {
              id: 'positionType',
              label: 'Position Type',
              type: 'radio',
              path: 'positionType',
              config: {
                options: [
                  { value: 'manager', label: 'Manager (Senior Member)' },
                  { value: 'ic', label: 'IC (Junior Member)' },
                ],
                defaultValue: 'ic',
              },
            },
            {
              id: 'department',
              label: 'Department',
              type: 'select',
              path: 'department',
              options: [...DEPARTMENT_OPTIONS],
            },
            {
              id: 'managerId',
              label: 'Reports To (Manager)',
              type: 'select',
              path: 'managerId',
              config: {
                placeholder: 'Select manager...',
                dataSource: {
                  procedure: 'admin.users.listManagers',
                },
                displayFormat: '{{fullName}}',
                subtitleFormat: '{{role}} | {{pod.name}}',
              },
            },
          ],
        },
      ],
      validation: {
        required: ['role'],
      },
    },
    // Step 3: Invitation Settings
    {
      id: 'invitation',
      title: 'Invitation',
      description: 'Configure invitation options',
      icon: 'Mail',
      sections: [
        {
          id: 'invitation-options',
          type: 'form',
          title: 'Invitation Settings',
          fields: [
            {
              id: 'sendInviteEmail',
              label: 'Send invitation email immediately',
              type: 'checkbox',
              path: 'sendInviteEmail',
              config: { defaultValue: true },
            },
            {
              id: 'requirePasswordChange',
              label: 'Require password change on first login',
              type: 'checkbox',
              path: 'requirePasswordChange',
              config: { defaultValue: true },
            },
            {
              id: 'require2FA',
              label: 'Enable 2FA requirement for this user',
              type: 'checkbox',
              path: 'require2FA',
              config: { defaultValue: true },
            },
          ],
        },
        {
          id: 'welcome-message',
          type: 'form',
          title: 'Custom Welcome Message',
          fields: [
            {
              id: 'welcomeMessage',
              label: 'Welcome Message (Optional)',
              type: 'textarea',
              path: 'welcomeMessage',
              config: {
                placeholder: 'Add a personal welcome message...',
                rows: 4,
                maxLength: 500,
                helpText: 'This message will be included in the invitation email',
              },
            },
          ],
        },
        {
          id: 'review-summary',
          type: 'custom',
          title: 'Review',
          component: 'InvitationSummary',
          componentProps: {
            showEmailPreview: true,
          },
        },
      ],
    },
  ],

  // Wizard Navigation
  navigation: {
    allowSkip: false,
    showProgress: true,
    showStepNumbers: true,
    saveDraft: false,
    breadcrumbs: [
      { label: 'Admin', route: '/admin' },
      { label: 'Users', route: '/admin/users' },
      { label: 'Invite User' },
    ],
  },

  // On Complete
  onComplete: {
    action: 'custom',
    handler: 'handleInviteUsers',
    successRedirect: '/admin/users',
    successMessage: 'Invitation sent successfully',
  },
};

export default userInviteScreen;
