/**
 * Integrations Hub Screen Definition
 *
 * Central hub for managing all external integrations.
 */

import type { ScreenDefinition } from '@/lib/metadata';

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const integrationsHubScreen: ScreenDefinition = {
  id: 'integrations-hub',
  type: 'dashboard',
  // entityType: 'integration', // Admin entity

  title: 'Integrations',
  subtitle: 'Connect external services and applications',
  icon: 'Plug',

  // Permissions
  permissions: [],

  // Layout
  layout: {
    type: 'single-column',
    sections: [
      // Status Summary
      {
        id: 'integration-status',
        type: 'metrics-grid',
        columns: 4,
        fields: [
          { id: 'total', label: 'Total Integrations', type: 'number', path: 'stats.total' },
          { id: 'connected', label: 'Connected', type: 'number', path: 'stats.connected' },
          { id: 'pending', label: 'Pending Setup', type: 'number', path: 'stats.pending' },
          { id: 'errors', label: 'Errors', type: 'number', path: 'stats.errors' },
        ],
        dataSource: {
          type: 'aggregate',
          // entityType: 'integration', // Admin entity
        },
      },
      // Job Boards
      {
        id: 'job-boards',
        type: 'custom',
        title: 'Job Boards',
        description: 'Post jobs and import candidates',
        icon: 'Briefcase',
        component: 'IntegrationCategoryGrid',
        componentProps: {
          category: 'job_board',
          integrations: [
            {
              id: 'indeed',
              name: 'Indeed',
              logo: '/integrations/indeed.svg',
              description: 'Post jobs to Indeed and import candidates',
            },
            {
              id: 'linkedin',
              name: 'LinkedIn Jobs',
              logo: '/integrations/linkedin.svg',
              description: 'LinkedIn job posting and candidate search',
            },
            {
              id: 'dice',
              name: 'Dice',
              logo: '/integrations/dice.svg',
              description: 'Tech-focused job board integration',
            },
            {
              id: 'monster',
              name: 'Monster',
              logo: '/integrations/monster.svg',
              description: 'Monster job board integration',
            },
            {
              id: 'ziprecruiter',
              name: 'ZipRecruiter',
              logo: '/integrations/ziprecruiter.svg',
              description: 'ZipRecruiter job distribution',
            },
          ],
        },
      },
      // Calendar & Email
      {
        id: 'calendar-email',
        type: 'custom',
        title: 'Calendar & Email',
        description: 'Sync calendars and connect email',
        icon: 'Calendar',
        component: 'IntegrationCategoryGrid',
        componentProps: {
          category: 'calendar_email',
          integrations: [
            {
              id: 'google_calendar',
              name: 'Google Calendar',
              logo: '/integrations/google-calendar.svg',
              description: 'Sync interviews and meetings',
            },
            {
              id: 'outlook_calendar',
              name: 'Outlook Calendar',
              logo: '/integrations/outlook.svg',
              description: 'Microsoft 365 calendar sync',
            },
            {
              id: 'gmail',
              name: 'Gmail',
              logo: '/integrations/gmail.svg',
              description: 'Track email communications',
            },
            {
              id: 'outlook_email',
              name: 'Outlook Email',
              logo: '/integrations/outlook.svg',
              description: 'Microsoft 365 email tracking',
            },
          ],
        },
      },
      // Background Check & Assessment
      {
        id: 'background-assessment',
        type: 'custom',
        title: 'Background Check & Assessment',
        description: 'Pre-employment screening and testing',
        icon: 'ClipboardCheck',
        component: 'IntegrationCategoryGrid',
        componentProps: {
          category: 'background_check',
          integrations: [
            {
              id: 'checkr',
              name: 'Checkr',
              logo: '/integrations/checkr.svg',
              description: 'Background checks and verification',
            },
            {
              id: 'sterling',
              name: 'Sterling',
              logo: '/integrations/sterling.svg',
              description: 'Employment screening services',
            },
            {
              id: 'codility',
              name: 'Codility',
              logo: '/integrations/codility.svg',
              description: 'Technical coding assessments',
            },
            {
              id: 'hackerrank',
              name: 'HackerRank',
              logo: '/integrations/hackerrank.svg',
              description: 'Developer skills assessment',
            },
          ],
        },
      },
      // HRIS & VMS
      {
        id: 'hris-vms',
        type: 'custom',
        title: 'HRIS & VMS',
        description: 'HR systems and vendor management',
        icon: 'Users',
        component: 'IntegrationCategoryGrid',
        componentProps: {
          category: 'hris_vms',
          integrations: [
            {
              id: 'workday',
              name: 'Workday',
              logo: '/integrations/workday.svg',
              description: 'HR management system',
            },
            {
              id: 'adp',
              name: 'ADP',
              logo: '/integrations/adp.svg',
              description: 'Payroll and HR services',
            },
            {
              id: 'fieldglass',
              name: 'SAP Fieldglass',
              logo: '/integrations/fieldglass.svg',
              description: 'Vendor management system',
            },
            {
              id: 'beeline',
              name: 'Beeline',
              logo: '/integrations/beeline.svg',
              description: 'Contingent workforce management',
            },
          ],
        },
      },
      // Communication
      {
        id: 'communication',
        type: 'custom',
        title: 'Communication',
        description: 'SMS, video, and messaging platforms',
        icon: 'MessageSquare',
        component: 'IntegrationCategoryGrid',
        componentProps: {
          category: 'communication',
          integrations: [
            {
              id: 'twilio',
              name: 'Twilio',
              logo: '/integrations/twilio.svg',
              description: 'SMS and voice communications',
            },
            {
              id: 'zoom',
              name: 'Zoom',
              logo: '/integrations/zoom.svg',
              description: 'Video interviews and meetings',
            },
            {
              id: 'teams',
              name: 'Microsoft Teams',
              logo: '/integrations/teams.svg',
              description: 'Video calls and collaboration',
            },
            {
              id: 'slack',
              name: 'Slack',
              logo: '/integrations/slack.svg',
              description: 'Team notifications and alerts',
            },
          ],
        },
      },
    ],
  },

  // Header actions
  actions: [
    {
      id: 'request-integration',
      type: 'modal',
      label: 'Request Integration',
      variant: 'secondary',
      icon: 'Plus',
      config: { type: 'modal', modal: 'RequestIntegrationModal' },
    },
    {
      id: 'view-api',
      type: 'navigate',
      label: 'API Settings',
      variant: 'secondary',
      icon: 'Code',
      config: { type: 'navigate', route: '/admin/settings/api' },
    },
  ],

  // Navigation
  navigation: {
    back: { label: 'Back to Settings', route: '/admin/settings' },
    breadcrumbs: [
      { label: 'Admin', route: '/admin' },
      { label: 'Integrations' },
    ],
  },
};

export default integrationsHubScreen;
