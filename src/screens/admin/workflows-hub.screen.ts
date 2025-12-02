/**
 * Workflows Hub Screen Definition
 *
 * Central hub for configuring workflows and process automation.
 */

import type { ScreenDefinition } from '@/lib/metadata';

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const workflowsHubScreen: ScreenDefinition = {
  id: 'workflows-hub',
  type: 'dashboard',
  // entityType: 'workflow', // Admin entity

  title: 'Workflows',
  subtitle: 'Configure business processes and automation',
  icon: 'GitBranch',

  // Permissions
  permissions: [],

  // Layout
  layout: {
    type: 'single-column',
    sections: [
      // Workflow Categories
      {
        id: 'workflow-categories',
        type: 'custom',
        component: 'WorkflowCategoryGrid',
        componentProps: {
          categories: [
            {
              id: 'submission',
              title: 'Submission Workflow',
              description: 'Manage candidate submission stages and transitions',
              icon: 'Send',
              route: '/admin/workflows/submission',
              stages: 8,
            },
            {
              id: 'interview',
              title: 'Interview Workflow',
              description: 'Configure interview types and scheduling rules',
              icon: 'Video',
              route: '/admin/workflows/interview',
              stages: 5,
            },
            {
              id: 'offer',
              title: 'Offer Workflow',
              description: 'Set up offer stages and approval process',
              icon: 'FileCheck',
              route: '/admin/workflows/offer',
              stages: 4,
            },
            {
              id: 'onboarding',
              title: 'Onboarding Workflow',
              description: 'Define onboarding checklist and steps',
              icon: 'UserCheck',
              route: '/admin/workflows/onboarding',
              stages: 6,
            },
            {
              id: 'deal',
              title: 'Deal Pipeline',
              description: 'Configure sales deal stages',
              icon: 'TrendingUp',
              route: '/admin/workflows/deal',
              stages: 7,
            },
            {
              id: 'lead',
              title: 'Lead Workflow',
              description: 'Set up lead qualification stages',
              icon: 'UserPlus',
              route: '/admin/workflows/lead',
              stages: 5,
            },
          ],
          columns: 2,
        },
      },
      // Additional Configuration
      {
        id: 'additional-config',
        type: 'custom',
        title: 'Additional Configuration',
        component: 'ConfigLinkGrid',
        componentProps: {
          links: [
            {
              id: 'patterns',
              title: 'Activity Patterns',
              description: 'Auto-activity rules triggered by events',
              icon: 'Workflow',
              route: '/admin/workflows/patterns',
            },
            {
              id: 'sla',
              title: 'SLA Configuration',
              description: 'Service level agreement settings',
              icon: 'Clock',
              route: '/admin/workflows/sla',
            },
            {
              id: 'notifications',
              title: 'Notification Rules',
              description: 'Email and push notification triggers',
              icon: 'Bell',
              route: '/admin/workflows/notifications',
            },
            {
              id: 'approvals',
              title: 'Approval Rules',
              description: 'Configure approval requirements',
              icon: 'CheckSquare',
              route: '/admin/workflows/approvals',
            },
          ],
          columns: 2,
        },
      },
      // Recent Changes
      {
        id: 'recent-changes',
        type: 'table',
        title: 'Recent Workflow Changes',
        icon: 'History',
        collapsible: true,
        defaultExpanded: false,
        columns_config: [
          { id: 'workflow', label: 'Workflow', path: 'workflowName', type: 'text' },
          { id: 'change', label: 'Change', path: 'changeDescription', type: 'text' },
          { id: 'changedBy', label: 'By', path: 'actor.fullName', type: 'text' },
          { id: 'changedAt', label: 'When', path: 'timestamp', type: 'date', config: { format: 'relative' } },
        ],
        dataSource: {
          type: 'custom',
          query: {
            procedure: 'admin.workflows.getRecentChanges',
            params: { limit: 10 },
          },
        },
      },
    ],
  },

  // Navigation
  navigation: {
    back: { label: 'Back to Admin', route: '/admin' },
    breadcrumbs: [
      { label: 'Admin', route: '/admin' },
      { label: 'Workflows' },
    ],
  },
};

export default workflowsHubScreen;
